"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

/*
  Verlet bodies. Each body stores its current and previous position; velocity is
  implied by their difference, so integration is a subtraction and constraints
  are just position edits. Every frame: integrate under gravity, then relax a
  set of constraints — pairwise collisions resolved by mass, distance links
  acting as springs, and the walls — several times for a stable stack. Grab a
  body and it becomes immovable and follows the pointer; let go and the velocity
  it picked up carries it, so you can throw it.
*/

const GRAVITY = 0.42;
const DAMPING = 0.99;
const RESTITUTION = 0.42;
const CONSTRAINT_ITERATIONS = 6;
const TAU = Math.PI * 2;

type Body = {
  x: number;
  y: number;
  px: number;
  py: number;
  r: number;
  mass: number;
  hue: number;
};

type Link = { a: Body; b: Body; len: number };

export function VerletBodies({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const bodies: Body[] = [];
    const links: Link[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    function build() {
      bodies.length = 0;
      links.length = 0;
      const count = Math.max(16, Math.min(38, Math.round((width * height) / 24000)));
      for (let i = 0; i < count; i++) {
        const r = rand(13, Math.min(36, width * 0.05));
        const x = rand(r, width - r);
        const y = rand(r, height * 0.55);
        bodies.push({
          x,
          y,
          px: x - rand(-1.5, 1.5),
          py: y,
          r,
          mass: r,
          hue: 202 + Math.random() * 118, // cyan-blue -> violet -> magenta
        });
      }
      // Chain a few neighbors into springs so structures swing and deform.
      const shuffled = [...bodies].sort(() => Math.random() - 0.5);
      for (let i = 0; i + 1 < Math.min(shuffled.length, 12); i += 2) {
        const a = shuffled[i]!;
        const b = shuffled[i + 1]!;
        links.push({ a, b, len: (a.r + b.r) * rand(1.6, 2.4) });
      }
    }

    // Pointer state.
    let grabbed: Body | null = null;
    let grabbedHovering = false;
    const pointer = { x: 0, y: 0, active: false };

    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = true;
      for (let i = bodies.length - 1; i >= 0; i--) {
        const b = bodies[i]!;
        if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 <= b.r * b.r) {
          grabbed = b;
          break;
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      pointer.x = p.x;
      pointer.y = p.y;
      if (grabbed) return;
      grabbedHovering = bodies.some(
        (b) => (b.x - p.x) ** 2 + (b.y - p.y) ** 2 <= b.r * b.r,
      );
    };
    const onUp = () => {
      grabbed = null;
      pointer.active = false;
    };

    if (!reduceMotion) {
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }

    function integrate() {
      for (const b of bodies) {
        if (b === grabbed) continue;
        const vx = (b.x - b.px) * DAMPING;
        const vy = (b.y - b.py) * DAMPING;
        b.px = b.x;
        b.py = b.y;
        b.x += vx;
        b.y += vy + GRAVITY;
      }
      if (grabbed) {
        grabbed.px = grabbed.x;
        grabbed.py = grabbed.y;
        grabbed.x += (pointer.x - grabbed.x) * 0.5;
        grabbed.y += (pointer.y - grabbed.y) * 0.5;
      }
    }

    function solveLinks() {
      for (const link of links) {
        const dx = link.b.x - link.a.x;
        const dy = link.b.y - link.a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = ((link.len - d) / d) * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        const aFree = link.a !== grabbed;
        const bFree = link.b !== grabbed;
        if (aFree) {
          link.a.x -= ox;
          link.a.y -= oy;
        }
        if (bFree) {
          link.b.x += ox;
          link.b.y += oy;
        }
      }
    }

    function solveCollisions() {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i]!;
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j]!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const rsum = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= rsum * rsum || d2 === 0) continue;
          const d = Math.sqrt(d2);
          const overlap = rsum - d;
          const nx = dx / d;
          const ny = dy / d;
          // The grabbed body acts as immovable, so it can shove a stack around.
          if (a === grabbed) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          } else if (b === grabbed) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          } else {
            const total = a.mass + b.mass;
            const aShare = (b.mass / total) * overlap;
            const bShare = (a.mass / total) * overlap;
            a.x -= nx * aShare;
            a.y -= ny * aShare;
            b.x += nx * bShare;
            b.y += ny * bShare;
          }
        }
      }
    }

    function solveBounds() {
      for (const b of bodies) {
        if (b.x < b.r) {
          const vx = b.x - b.px;
          b.x = b.r;
          b.px = b.x + vx * RESTITUTION;
        } else if (b.x > width - b.r) {
          const vx = b.x - b.px;
          b.x = width - b.r;
          b.px = b.x + vx * RESTITUTION;
        }
        if (b.y < b.r) {
          const vy = b.y - b.py;
          b.y = b.r;
          b.py = b.y + vy * RESTITUTION;
        } else if (b.y > height - b.r) {
          const vy = b.y - b.py;
          b.y = height - b.r;
          b.py = b.y + vy * RESTITUTION;
        }
      }
    }

    function simulate() {
      integrate();
      for (let k = 0; k < CONSTRAINT_ITERATIONS; k++) {
        solveLinks();
        solveCollisions();
        solveBounds();
      }
    }

    function render() {
      const dark = themeRef.current === "dark";
      ctx!.clearRect(0, 0, width, height);

      // Springs first, behind the bodies.
      ctx!.lineWidth = 1.5;
      for (const link of links) {
        const grad = ctx!.createLinearGradient(link.a.x, link.a.y, link.b.x, link.b.y);
        grad.addColorStop(0, `hsl(${link.a.hue} 70% 60% / ${dark ? 0.35 : 0.3})`);
        grad.addColorStop(1, `hsl(${link.b.hue} 70% 60% / ${dark ? 0.35 : 0.3})`);
        ctx!.strokeStyle = grad;
        ctx!.beginPath();
        ctx!.moveTo(link.a.x, link.a.y);
        ctx!.lineTo(link.b.x, link.b.y);
        ctx!.stroke();
      }

      for (const b of bodies) {
        const light = dark ? 68 : 62;
        const g = ctx!.createRadialGradient(
          b.x - b.r * 0.35,
          b.y - b.r * 0.4,
          b.r * 0.1,
          b.x,
          b.y,
          b.r,
        );
        g.addColorStop(0, `hsl(${b.hue} 85% ${light + 12}%)`);
        g.addColorStop(0.55, `hsl(${b.hue} 70% ${light}%)`);
        g.addColorStop(1, `hsl(${b.hue} 62% ${light - 22}%)`);
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, b.r, 0, TAU);
        ctx!.fill();

        // Rim + specular pip for a little dimensionality.
        ctx!.lineWidth = 1;
        ctx!.strokeStyle = dark
          ? "rgba(255,255,255,0.12)"
          : "rgba(0,0,0,0.08)";
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(b.x - b.r * 0.32, b.y - b.r * 0.36, b.r * 0.16, 0, TAU);
        ctx!.fillStyle = "rgba(255,255,255,0.45)";
        ctx!.fill();
      }
    }

    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      simulate();
      render();
      raf = requestAnimationFrame(loop);
    };

    const applyTransform = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const first = width === 0;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      width = w;
      height = h;
      applyTransform();
      if (first) {
        build();
      } else {
        for (const b of bodies) {
          b.x = Math.max(b.r, Math.min(width - b.r, b.x));
          b.y = Math.max(b.r, Math.min(height - b.r, b.y));
        }
      }
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? true;
        if (visible && !running && !reduceMotion) {
          running = true;
          raf = requestAnimationFrame(loop);
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
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) {
      // Let everything fall and settle, then draw one static frame.
      for (let i = 0; i < 400; i++) simulate();
      render();
    } else {
      raf = requestAnimationFrame(loop);
    }

    let cursorRaf = 0;
    const updateCursor = () => {
      canvas.style.cursor = grabbed ? "grabbing" : grabbedHovering ? "grab" : "default";
      cursorRaf = requestAnimationFrame(updateCursor);
    };
    if (!reduceMotion) cursorRaf = requestAnimationFrame(updateCursor);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(cursorRaf);
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Physical bodies falling under gravity, colliding and stacking; drag one and throw it and the others respond."
      className={cn("h-full w-full touch-none", className)}
    />
  );
}
