"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/*
  Tipografia cinética. Os eixos de uma fonte variável são contínuos, não um
  conjunto de pesos, então cada glifo pode ocupar qualquer ponto do espaço de
  design. Cada caractere carrega a própria energia — vinda da proximidade do
  ponteiro, com uma onda lenta atravessando a linha quando ninguém está por
  perto — e essa energia é mapeada em wght, wdth e opsz.

  A onda não é eterna: passado um tempo sem ponteiro, a amplitude decai até
  zero e os glifos convergem para um estado de repouso legível. Quando todos
  chegam lá, o rAF é encerrado — o texto para de fato, e não apenas
  visualmente. Qualquer movimento do ponteiro acorda a linha de novo.

  Mudar font-variation-settings força relayout, então o loop é cuidadoso: os
  centros dos glifos são medidos uma vez (e em resize), nunca por quadro; o
  ponteiro só registra uma posição; e um único rAF escreve uma custom property
  suavizada por glifo.
*/

const LINES = ["Tipografia", "que respira", "e assenta."];

// Faixas da Roboto Flex, mantidas na parte confortável de cada eixo.
const WGHT = { min: 200, max: 900 };
const WDTH = { min: 64, max: 140 };
const OPSZ = { min: 14, max: 144 };

const RADIUS = 220; // px de influência do ponteiro
const IDLE_AMPLITUDE = 0.42;
const EASE = 0.16;

/** Estado final: peso de leitura para onde a linha converge ao assentar. */
const REST_ENERGY = 0.3;
const SETTLE_DELAY = 3.5; // s de calmaria antes de começar a assentar
const SETTLE_FADE = 7; // s até a onda desaparecer por completo
const STILL_EPSILON = 0.0015;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (range: { min: number; max: number }, t: number) =>
  range.min + (range.max - range.min) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

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

    // Energia por glifo, suavizada em direção ao alvo a cada quadro.
    const energy = new Float32Array(glyphs.length);
    const centres = glyphs.map(() => ({ x: 0, y: 0 }));

    // O layout é medido aqui, nunca dentro do loop de animação.
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

    const writeReadout = (t: number, settled: boolean) => {
      const readout = readoutRef.current;
      if (!readout) return;
      const axes = `wght ${mix(WGHT, t).toFixed(0)}  ·  wdth ${mix(
        WDTH,
        t,
      ).toFixed(0)}  ·  opsz ${mix(OPSZ, t).toFixed(0)}`;
      readout.textContent = settled ? `${axes}  ·  assentado` : axes;
    };

    if (reduceMotion) {
      // Um estado assentado e legível — sem onda, sem rastreio de ponteiro.
      glyphs.forEach((_, i) => apply(i, REST_ENERGY));
      writeReadout(REST_ENERGY, true);
      return;
    }

    measure();

    const pointer = { x: -9999, y: -9999 };
    let lastActivity = performance.now();
    let raf = 0;
    let visible = true;
    let stopped = false; // a linha assentou; nada resta para animar

    const start = performance.now();

    const frame = (now: number) => {
      const time = (now - start) / 1000;

      // 1 enquanto a linha está viva, 0 quando a onda terminou de sumir.
      const idleFor = (now - lastActivity) / 1000;
      const settle =
        1 - smoothstep(Math.min(Math.max((idleFor - SETTLE_DELAY) / SETTLE_FADE, 0), 1));

      let peak = 0;
      let peakIndex = 0;
      let moving = false;

      for (let i = 0; i < glyphs.length; i++) {
        // A onda lenta mantém a linha viva enquanto o ponteiro está longe, e
        // perde amplitude conforme a cena assenta.
        const wave =
          (0.5 + 0.5 * Math.sin(time * 1.15 - i * 0.42)) *
          IDLE_AMPLITUDE *
          settle;

        const c = centres[i]!;
        const dx = pointer.x - c.x;
        const dy = pointer.y - c.y;
        const d2 = (dx * dx + dy * dy) / (RADIUS * RADIUS);
        const proximity = Math.exp(-d2);

        const target = Math.max(wave, proximity, REST_ENERGY * (1 - settle));
        if (Math.abs(target - energy[i]!) > STILL_EPSILON) moving = true;

        energy[i] = lerp(energy[i]!, target, EASE);
        apply(i, energy[i]!);

        if (energy[i]! > peak) {
          peak = energy[i]!;
          peakIndex = i;
        }
      }

      const restingNow = settle === 0 && !moving;
      writeReadout(energy[peakIndex]!, restingNow);

      if (restingNow) {
        // Nada mais muda: encerra o loop em vez de queimar quadros idênticos.
        stopped = true;
        return;
      }

      raf = requestAnimationFrame(frame);
    };

    /*
      Único ponto de agendamento. Cancelar antes de agendar é o que garante um
      loop só: o IntersectionObserver dispara assim que observa, e sem isso ele
      abriria um segundo laço em paralelo com o inicial — dobrando as escritas
      de font-variation-settings e o passo do easing.
    */
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    /** Qualquer movimento reinicia a contagem e, se preciso, religa o loop. */
    const wake = () => {
      lastActivity = performance.now();
      if (stopped && visible && !document.hidden) {
        stopped = false;
        schedule();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      wake();
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

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) {
          measure();
          if (!stopped) schedule();
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(root);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!stopped && visible) {
        measure();
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    schedule();

    return () => {
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
                  className="inline-block will-change-[font-variation-settings] [font-variation-settings:'wght'_var(--wght,400),'wdth'_var(--wdth,100),'opsz'_var(--opsz,32)] text-[clamp(2.5rem,11vw,9rem)] leading-[1.02] tracking-[-0.03em] text-foreground"
                >
                  {/* espaço rígido: um espaço comum colapsa entre inline-blocks */}
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </span>
        ))}
      </div>

      <span
        ref={readoutRef}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint"
      >
        wght 200 · wdth 64 · opsz 14
      </span>
    </div>
  );
}
