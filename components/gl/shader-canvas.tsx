"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

const VERT = /* glsl */ `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

/*
  A full-screen WebGL2 fragment-shader host. It owns the whole lifecycle so the
  shaders don't have to: a single full-screen triangle, a smoothed pointer, an
  rAF loop that pauses off-screen and on hidden tabs, reduced-motion handling
  (one static frame), and context cleanup on unmount.

  Every shader receives the same uniform contract:
    uniform vec2  u_res;     // drawing-buffer size in pixels
    uniform vec2  u_mouse;   // pointer in pixels, y up
    uniform float u_time;    // seconds since mount
    uniform float u_theme;   // 1.0 dark, 0.0 light
    uniform float u_active;  // pointer energy, smoothed 0..1
*/

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

export type ShaderCanvasProps = {
  fragmentShader: string;
  className?: string;
  /** Cap the device-pixel ratio. Heavier shaders (raymarching) want less. */
  dprCap?: number;
  /** Resting pointer energy when the cursor is away. */
  idleActive?: number;
  /** Shown when WebGL2 is unavailable or the program fails to build. */
  fallback?: React.ReactNode;
  /** When set, the canvas is exposed as an image with this label. */
  ariaLabel?: string;
};

export function ShaderCanvas({
  fragmentShader,
  className,
  dprCap = 2,
  idleActive = 0.16,
  fallback,
  ariaLabel,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let program: WebGLProgram | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
      }
    } catch (err) {
      console.error(err);
      setFailed(true);
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uTheme = gl.getUniformLocation(program, "u_theme");
    const uActive = gl.getUniformLocation(program, "u_active");

    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    resize();

    const mouse = { x: width / 2, y: height / 2 };
    const target = { x: width / 2, y: height / 2 };
    let active = 0;
    let targetActive = idleActive;

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) * dpr;
      target.y = (rect.height - (e.clientY - rect.top)) * dpr; // flip y
      targetActive = 1;
    };
    const onLeave = () => {
      targetActive = idleActive;
    };

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let raf = 0;
    let running = true;
    const start = performance.now();

    const render = (now: number) => {
      if (!running) return;
      const time = (now - start) / 1000;

      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;
      active += (targetActive - active) * 0.04;

      gl.uniform2f(uRes, width, height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uTheme, themeRef.current === "dark" ? 1 : 0);
      gl.uniform1f(uActive, active);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!reduceMotion) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? true;
        if (visible && !running && !reduceMotion) {
          running = true;
          raf = requestAnimationFrame(render);
        } else if (!visible) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) {
      render(start);
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      // Delete resources but keep the context alive: React StrictMode remounts
      // this effect on the same canvas, and a lost context can't recompile.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [fragmentShader, dprCap, idleActive]);

  if (failed) {
    return (
      <>
        {fallback ?? (
          <div
            aria-hidden="true"
            className={cn(
              "bg-[radial-gradient(120%_120%_at_20%_10%,var(--spectra-4),transparent_45%),radial-gradient(120%_120%_at_80%_30%,var(--spectra-5),transparent_45%),radial-gradient(140%_140%_at_50%_100%,var(--spectra-3),transparent_55%)] opacity-60",
              className,
            )}
          />
        )}
      </>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn("h-full w-full", className)}
    />
  );
}
