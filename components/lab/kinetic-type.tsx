"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/*
  Kinetic type. Variable font axes are continuous, not a set of weights, so
  every glyph can sit anywhere in the design space at once. Each character
  carries its own energy — driven by the pointer's proximity, with a slow wave
  travelling through the line when nobody is touching it — and that energy is
  mapped onto wght, wdth and opsz.

  Changing font-variation-settings relayouts text, so the loop is careful:
  glyph centres are measured once (and on resize) rather than per frame, the
  pointer only records a position, and a single rAF writes CSS custom
  properties with an eased value per glyph.
*/

const LINES = ["Type that", "breathes."];

// Roboto Flex ranges, kept inside the comfortable part of each axis.
const WGHT = { min: 200, max: 900 };
const WDTH = { min: 64, max: 140 };
const OPSZ = { min: 14, max: 144 };

const RADIUS = 190; // px of pointer influence
const IDLE_AMPLITUDE = 0.4;
const EASE = 0.16;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (range: { min: number; max: number }, t: number) =>
  range.min + (range.max - range.min) * t;

export function KineticType({
  className,
  fontClassName,
}: {
  className?: string;
  fontClassName: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const glyphs = Array.from(
      root.querySelectorAll<HTMLSpanElement>("[data-glyph]"),
    );
    if (glyphs.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Energy per glyph, eased toward its target each frame.
    const energy = new Float32Array(glyphs.length);
    const centres = glyphs.map(() => ({ x: 0, y: 0 }));

    // Layout is measured here, never inside the animation loop.
    const measure = () => {
      for (let i = 0; i < glyphs.length; i++) {
        const rect = glyphs[i]!.getBoundingClientRect();
        centres[i] = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };

    const apply = (i: number, t: number) => {
      const el = glyphs[i]!;
      el.style.setProperty("--wght", mix(WGHT, t).toFixed(0));
      el.style.setProperty("--wdth", mix(WDTH, t).toFixed(1));
      el.style.setProperty("--opsz", mix(OPSZ, t).toFixed(0));
    };

    if (reduceMotion) {
      // A settled, readable state — no wave, no pointer tracking.
      glyphs.forEach((_, i) => apply(i, 0.45));
      return;
    }

    measure();

    const pointer = { x: -9999, y: -9999 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const onScrollOrResize = () => measure();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });

    let raf = 0;
    let running = true;
    const start = performance.now();

    const frame = (now: number) => {
      if (!running) return;
      const time = (now - start) / 1000;

      let peak = 0;
      let peakIndex = 0;

      for (let i = 0; i < glyphs.length; i++) {
        // A slow wave keeps the line alive when the pointer is away.
        const wave =
          (0.5 + 0.5 * Math.sin(time * 1.15 - i * 0.42)) * IDLE_AMPLITUDE;

        const c = centres[i]!;
        const dx = pointer.x - c.x;
        const dy = pointer.y - c.y;
        const d2 = (dx * dx + dy * dy) / (RADIUS * RADIUS);
        const proximity = Math.exp(-d2);

        const target = Math.max(wave, proximity);
        energy[i] = lerp(energy[i]!, target, EASE);
        apply(i, energy[i]!);

        if (energy[i]! > peak) {
          peak = energy[i]!;
          peakIndex = i;
        }
      }

      const readout = readoutRef.current;
      if (readout) {
        const t = energy[peakIndex]!;
        readout.textContent = `wght ${mix(WGHT, t).toFixed(0)}  ·  wdth ${mix(
          WDTH,
          t,
        ).toFixed(0)}  ·  opsz ${mix(OPSZ, t).toFixed(0)}`;
      }

      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? true;
        if (visible && !running) {
          running = true;
          measure();
          raf = requestAnimationFrame(frame);
        } else if (!visible) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(root);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else {
        running = true;
        measure();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize);
    };
  }, []);

  let glyphIndex = 0;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-6",
        fontClassName,
        className,
      )}
    >
      <p className="sr-only">{LINES.join(" ")}</p>

      <div aria-hidden="true" className="select-none text-center">
        {LINES.map((line) => (
          <span key={line} className="block whitespace-nowrap">
            {Array.from(line).map((char) => {
              const i = glyphIndex++;
              return (
                <span
                  key={`${char}-${i}`}
                  data-glyph=""
                  className="inline-block will-change-[font-variation-settings] [font-variation-settings:'wght'_var(--wght,400),'wdth'_var(--wdth,100),'opsz'_var(--opsz,32)] text-[clamp(2.75rem,10vw,7rem)] leading-[1.05] tracking-[-0.02em] text-foreground"
                >
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </span>
        ))}
      </div>

      <span
        ref={readoutRef}
        className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint"
      >
        wght 200 · wdth 64 · opsz 14
      </span>
    </div>
  );
}
