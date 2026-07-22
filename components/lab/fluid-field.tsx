"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

/*
  A GPU fluid solver. Velocity, pressure, and dye live in floating-point
  textures; each step is a full-screen shader pass writing into a framebuffer,
  ping-ponging between read/write targets. The pipeline per frame:

    splat (pointer force + dye) -> curl -> vorticity confinement -> divergence
    -> pressure (Jacobi iterations) -> subtract pressure gradient
    -> advect velocity -> advect dye -> display

  This is the classic Stam / GPU-Gems stable-fluids scheme, run entirely on the
  GPU. No physics library — just distance, math, and framebuffers.
*/

const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;
const PRESSURE_ITERATIONS = 20;
const DENSITY_DISSIPATION = 0.6;
const VELOCITY_DISSIPATION = 0.2;
const PRESSURE_DECAY = 0.8;
const CURL = 30;
const SPLAT_RADIUS = 0.25;
const SPLAT_FORCE = 6000;

const BASE_VERTEX = /* glsl */ `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const SPLAT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}
`;

const ADVECTION_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = texture(uSource, coord);
  float decay = 1.0 + dissipation * dt;
  fragColor = result / decay;
}
`;

const DIVERGENCE_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const CURL_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`;

const VORTICITY_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = clamp(velocity, -1000.0, 1000.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}
`;

const PRESSURE_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const GRADIENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}
`;

const CLEAR_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float value;
void main() {
  fragColor = value * texture(uTexture, vUv);
}
`;

const DISPLAY_SHADER = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float uTheme;
void main() {
  vec3 dye = texture(uTexture, vUv).rgb;
  float intensity = clamp(max(dye.r, max(dye.g, dye.b)) * 1.15, 0.0, 1.0);
  vec3 darkBg = vec3(0.05, 0.048, 0.068);
  vec3 lightBg = vec3(0.955, 0.957, 0.975);
  vec3 bg = mix(lightBg, darkBg, uTheme);
  vec3 col = mix(bg, dye, intensity);
  vec2 p = vUv - 0.5;
  col *= 1.0 - 0.32 * dot(p, p);
  fragColor = vec4(col, 1.0);
}
`;

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

class Program {
  program: WebGLProgram;
  private locations = new Map<string, WebGLUniformLocation | null>();

  constructor(gl: WebGL2RenderingContext, vertex: WebGLShader, fragment: WebGLShader) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
    }
    this.program = program;
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) this.locations.set(info.name, gl.getUniformLocation(program, info.name));
    }
  }

  loc(name: string) {
    return this.locations.get(name) ?? null;
  }
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
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

// Cool, on-brand dye: hue restricted to the blue/iris/magenta/teal wedge.
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

function brandColor(): [number, number, number] {
  const h = 0.52 + Math.random() * 0.34; // teal -> blue -> violet -> magenta
  const [r, g, b] = hsvToRgb(h, 0.85, 1);
  return [r * 0.22, g * 0.22, b * 0.22];
}

// Same cool wedge, but driven by a phase so a single drag sweeps the spectrum.
function coolColor(phase: number): [number, number, number] {
  const h = 0.52 + 0.34 * (0.5 + 0.5 * Math.sin(phase));
  const [r, g, b] = hsvToRgb(h, 0.85, 1);
  return [r * 0.22, g * 0.22, b * 0.22];
}

// WebGL2 + float-render support, probed once on a throwaway canvas and cached.
// Read through useSyncExternalStore so the fallback is chosen in render, never
// via setState inside an effect.
let floatSupport: boolean | null = null;
function detectSupport(): boolean {
  if (floatSupport !== null) return floatSupport;
  try {
    const probe = document.createElement("canvas").getContext("webgl2");
    floatSupport = !!(probe && probe.getExtension("EXT_color_buffer_float"));
  } catch {
    floatSupport = false;
  }
  return floatSupport;
}
const subscribeNoop = () => () => {};

export function FluidField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const supported = useSyncExternalStore(subscribeNoop, detectSupport, () => true);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!supported || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;
    gl.getExtension("EXT_color_buffer_float"); // enable float rendering on this context
    const filter = gl.getExtension("OES_texture_float_linear") ? gl.LINEAR : gl.NEAREST;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let programs: Program[] = [];
    let vertex: WebGLShader;
    let splat: Program, advection: Program, divergence: Program, curl: Program;
    let vorticity: Program, pressure: Program, gradient: Program, clear: Program, display: Program;
    try {
      vertex = compileShader(gl, gl.VERTEX_SHADER, BASE_VERTEX);
      const build = (src: string) => {
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, src);
        const p = new Program(gl, vertex, fs);
        gl.deleteShader(fs);
        programs.push(p);
        return p;
      };
      splat = build(SPLAT_SHADER);
      advection = build(ADVECTION_SHADER);
      divergence = build(DIVERGENCE_SHADER);
      curl = build(CURL_SHADER);
      vorticity = build(VORTICITY_SHADER);
      pressure = build(PRESSURE_SHADER);
      gradient = build(GRADIENT_SHADER);
      clear = build(CLEAR_SHADER);
      display = build(DISPLAY_SHADER);
    } catch (err) {
      // Shaders are static and support was already probed, so this is a code
      // bug rather than an environment we fall back for — log and bail.
      console.error(err);
      return;
    }

    // Quad geometry shared by every pass. Created after the guards above so no
    // side effect runs before a possible bail-to-fallback.
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const quadIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function createFBO(w: number, h: number, internal: number, format: number, filtering: number): FBO {
      const glc = gl!;
      const texture = glc.createTexture()!;
      glc.activeTexture(glc.TEXTURE0);
      glc.bindTexture(glc.TEXTURE_2D, texture);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, filtering);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, filtering);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
      glc.texImage2D(glc.TEXTURE_2D, 0, internal, w, h, 0, format, glc.HALF_FLOAT, null);
      const fbo = glc.createFramebuffer()!;
      glc.bindFramebuffer(glc.FRAMEBUFFER, fbo);
      glc.framebufferTexture2D(glc.FRAMEBUFFER, glc.COLOR_ATTACHMENT0, glc.TEXTURE_2D, texture, 0);
      glc.viewport(0, 0, w, h);
      glc.clear(glc.COLOR_BUFFER_BIT);
      return {
        texture, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id: number) {
          glc.activeTexture(glc.TEXTURE0 + id);
          glc.bindTexture(glc.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, internal: number, format: number, filtering: number): DoubleFBO {
      let fbo1 = createFBO(w, h, internal, format, filtering);
      let fbo2 = createFBO(w, h, internal, format, filtering);
      return {
        width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        get read() { return fbo1; },
        get write() { return fbo2; },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; },
      };
    }

    const dyeRes = getResolution(gl, DYE_RESOLUTION);
    const simRes = getResolution(gl, SIM_RESOLUTION);

    let dye = createDoubleFBO(dyeRes.width, dyeRes.height, gl.RGBA16F, gl.RGBA, filter);
    let velocity = createDoubleFBO(simRes.width, simRes.height, gl.RG16F, gl.RG, filter);
    const divergenceFBO = createFBO(simRes.width, simRes.height, gl.R16F, gl.RED, gl.NEAREST);
    const curlFBO = createFBO(simRes.width, simRes.height, gl.R16F, gl.RED, gl.NEAREST);
    let pressureFBO = createDoubleFBO(simRes.width, simRes.height, gl.R16F, gl.RED, gl.NEAREST);

    const allFbos = () => [
      dye.read, dye.write, velocity.read, velocity.write,
      divergenceFBO, curlFBO, pressureFBO.read, pressureFBO.write,
    ];

    function blit(target: FBO | null) {
      const glc = gl!;
      if (target) {
        glc.viewport(0, 0, target.width, target.height);
        glc.bindFramebuffer(glc.FRAMEBUFFER, target.fbo);
      } else {
        glc.viewport(0, 0, glc.drawingBufferWidth, glc.drawingBufferHeight);
        glc.bindFramebuffer(glc.FRAMEBUFFER, null);
      }
      glc.drawElements(glc.TRIANGLES, 6, glc.UNSIGNED_SHORT, 0);
    }

    // Pointer tracking — deltas drive the velocity splats.
    const pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, phase: Math.random() * 6.28 };

    const updatePointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      pointer.dx = x - pointer.x;
      pointer.dy = y - pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0;
    };
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = 1 - (e.clientY - rect.top) / rect.height;
      pointer.phase = Math.random() * 6.28;
    };

    if (!reduceMotion) {
      canvas.addEventListener("pointermove", updatePointer, { passive: true });
      canvas.addEventListener("pointerdown", onDown, { passive: true });
    }

    function splatAt(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
      const glc = gl!;
      const aspect = canvas!.width / canvas!.height;
      glc.useProgram(splat.program);
      glc.uniform1i(splat.loc("uTarget"), velocity.read.attach(0));
      glc.uniform1f(splat.loc("aspectRatio"), aspect);
      glc.uniform2f(splat.loc("point"), x, y);
      glc.uniform3f(splat.loc("color"), dx, dy, 0);
      glc.uniform1f(splat.loc("radius"), SPLAT_RADIUS / 100);
      blit(velocity.write);
      velocity.swap();

      glc.uniform1i(splat.loc("uTarget"), dye.read.attach(0));
      glc.uniform3f(splat.loc("color"), color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    }

    function multipleSplats(count: number) {
      for (let i = 0; i < count; i++) {
        const color = brandColor();
        const x = Math.random();
        const y = Math.random();
        const dx = 550 * (Math.random() - 0.5);
        const dy = 550 * (Math.random() - 0.5);
        splatAt(x, y, dx, dy, [color[0] * 5, color[1] * 5, color[2] * 5]);
      }
    }

    function step(dt: number) {
      const glc = gl!;
      glc.disable(glc.BLEND);

      glc.useProgram(curl.program);
      glc.uniform2f(curl.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(curl.loc("uVelocity"), velocity.read.attach(0));
      blit(curlFBO);

      glc.useProgram(vorticity.program);
      glc.uniform2f(vorticity.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(vorticity.loc("uVelocity"), velocity.read.attach(0));
      glc.uniform1i(vorticity.loc("uCurl"), curlFBO.attach(1));
      glc.uniform1f(vorticity.loc("curl"), CURL);
      glc.uniform1f(vorticity.loc("dt"), dt);
      blit(velocity.write);
      velocity.swap();

      glc.useProgram(divergence.program);
      glc.uniform2f(divergence.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(divergence.loc("uVelocity"), velocity.read.attach(0));
      blit(divergenceFBO);

      glc.useProgram(clear.program);
      glc.uniform2f(clear.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(clear.loc("uTexture"), pressureFBO.read.attach(0));
      glc.uniform1f(clear.loc("value"), PRESSURE_DECAY);
      blit(pressureFBO.write);
      pressureFBO.swap();

      glc.useProgram(pressure.program);
      glc.uniform2f(pressure.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(pressure.loc("uDivergence"), divergenceFBO.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        glc.uniform1i(pressure.loc("uPressure"), pressureFBO.read.attach(1));
        blit(pressureFBO.write);
        pressureFBO.swap();
      }

      glc.useProgram(gradient.program);
      glc.uniform2f(gradient.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(gradient.loc("uPressure"), pressureFBO.read.attach(0));
      glc.uniform1i(gradient.loc("uVelocity"), velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      glc.useProgram(advection.program);
      glc.uniform2f(advection.loc("texelSize"), velocity.texelSizeX, velocity.texelSizeY);
      glc.uniform1i(advection.loc("uVelocity"), velocity.read.attach(0));
      glc.uniform1i(advection.loc("uSource"), velocity.read.attach(0));
      glc.uniform1f(advection.loc("dt"), dt);
      glc.uniform1f(advection.loc("dissipation"), VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      glc.uniform1i(advection.loc("uVelocity"), velocity.read.attach(0));
      glc.uniform1i(advection.loc("uSource"), dye.read.attach(1));
      glc.uniform1f(advection.loc("dissipation"), DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      const glc = gl!;
      glc.useProgram(display.program);
      glc.uniform1i(display.loc("uTexture"), dye.read.attach(0));
      glc.uniform1f(display.loc("uTheme"), themeRef.current === "dark" ? 1 : 0);
      blit(null);
    }

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width * dpr));
      height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let raf = 0;
    let running = true;
    let last = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.0166);
      last = now;
      if (pointer.moved) {
        pointer.moved = false;
        pointer.phase += 0.06;
        splatAt(
          pointer.x, pointer.y,
          pointer.dx * SPLAT_FORCE, pointer.dy * SPLAT_FORCE,
          coolColor(pointer.phase),
        );
      }
      step(dt);
      render();
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    };

    // Seed the field so it reads as fluid from the first paint.
    multipleSplats(reduceMotion ? 14 : 7);

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? true;
        if (visible && !running && !reduceMotion) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
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
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) {
      // Settle a few steps into a still composition, then stop.
      for (let i = 0; i < 40; i++) step(0.0166);
      render();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", updatePointer);
      canvas.removeEventListener("pointerdown", onDown);
      for (const f of allFbos()) {
        gl.deleteTexture(f.texture);
        gl.deleteFramebuffer(f.fbo);
      }
      for (const p of programs) gl.deleteProgram(p.program);
      gl.deleteBuffer(quad);
      gl.deleteBuffer(quadIndices);
      programs = [];
      // Context is left alive on purpose: StrictMode remounts this effect on the
      // same canvas, and a lost context can't rebuild. The browser reclaims it
      // when the canvas leaves the DOM.
    };
  }, [supported]);

  if (!supported) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-full w-full bg-[radial-gradient(120%_120%_at_30%_20%,var(--spectra-4),transparent_50%),radial-gradient(120%_120%_at_70%_80%,var(--spectra-5),transparent_50%)] opacity-50",
          className,
        )}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="An interactive fluid simulation; dragging the pointer pushes color through the velocity field in real time."
      className={cn("h-full w-full touch-none", className)}
    />
  );
}

// Match the sim grid to the canvas aspect ratio at a target resolution.
function getResolution(gl: WebGL2RenderingContext, resolution: number) {
  let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspect < 1) aspect = 1 / aspect;
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspect);
  return gl.drawingBufferWidth > gl.drawingBufferHeight
    ? { width: max, height: min }
    : { width: min, height: max };
}
