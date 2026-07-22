"use client";

import { useId, useMemo, useState } from "react";
import { Dices } from "lucide-react";

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SEED,
  type GenModule,
  compose,
  normalizeSeed,
  randomSeed,
} from "@/lib/generative";
import { cn } from "@/lib/utils";

const GAP = 4;

function inset(m: GenModule) {
  const { x, y, w, h } = m.cell;
  return { x: x + GAP, y: y + GAP, w: Math.max(0, w - GAP * 2), h: Math.max(0, h - GAP * 2) };
}

function Shape({ m }: { m: GenModule }) {
  const { x, y, w, h } = inset(m);
  const color = m.color;
  const r = Math.min(w, h);

  switch (m.kind) {
    case "solid":
      return <rect x={x} y={y} width={w} height={h} fill={color} rx={2} />;

    case "arc": {
      // Quarter disc anchored to a corner; rotation picks which one.
      const d = `M ${x} ${y} L ${x + r} ${y} A ${r} ${r} 0 0 1 ${x} ${y + r} Z`;
      return <path d={d} fill={color} />;
    }

    case "half": {
      const cx = x + w / 2;
      const rad = Math.min(w / 2, h);
      const d = `M ${cx - rad} ${y + h} A ${rad} ${rad} 0 0 1 ${cx + rad} ${y + h} Z`;
      return <path d={d} fill={color} />;
    }

    case "rings": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const max = r / 2;
      return (
        <>
          {Array.from({ length: m.detail }, (_, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={(max * (i + 1)) / m.detail}
              fill="none"
              stroke={color}
              strokeWidth={Math.max(2, max / (m.detail * 2.2))}
            />
          ))}
        </>
      );
    }

    case "bars": {
      const step = h / m.detail;
      const thickness = step * 0.45;
      return (
        <>
          {Array.from({ length: m.detail }, (_, i) => (
            <rect
              key={i}
              x={x}
              y={y + i * step + (step - thickness) / 2}
              width={w}
              height={thickness}
              fill={color}
              rx={1}
            />
          ))}
        </>
      );
    }

    case "dots": {
      const cols = m.detail;
      const rows = Math.max(2, Math.round((cols * h) / Math.max(w, 1)));
      const dr = Math.min(w / cols, h / rows) * 0.26;
      return (
        <>
          {Array.from({ length: rows * cols }, (_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return (
              <circle
                key={i}
                cx={x + ((col + 0.5) * w) / cols}
                cy={y + ((row + 0.5) * h) / rows}
                r={dr}
                fill={color}
              />
            );
          })}
        </>
      );
    }

    case "diagonal": {
      const d = `M ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y} Z`;
      return <path d={d} fill={color} />;
    }

    default:
      return null;
  }
}

export function GenerativeComposition({ className }: { className?: string }) {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [draft, setDraft] = useState(String(DEFAULT_SEED));
  const inputId = useId();

  const composition = useMemo(() => compose(seed), [seed]);

  const applyDraft = () => {
    const next = normalizeSeed(draft);
    if (next !== null) setSeed(next);
  };

  const roll = () => {
    const next = randomSeed();
    setSeed(next);
    setDraft(String(next));
  };

  return (
    <div className={cn("relative h-full w-full", className)}>
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Generative composition built from seed ${seed}: geometric modules laid out by recursive subdivision.`}
        className="h-full w-full"
      >
        {/* Keyed by seed so a new seed remounts the modules and replays the reveal. */}
        <g key={seed}>
          {composition.modules.map((m, i) => {
            const cx = m.cell.x + m.cell.w / 2;
            const cy = m.cell.y + m.cell.h / 2;
            return (
              <g
                key={`${m.cell.x}-${m.cell.y}-${i}`}
                className="gen-module"
                style={{ animationDelay: `${Math.min(i * 22, 700)}ms` }}
              >
                <g transform={`rotate(${m.rotation} ${cx} ${cy})`}>
                  <Shape m={m} />
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyDraft();
          }}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 ring-1 ring-border backdrop-blur-md"
        >
          <label
            htmlFor={inputId}
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint"
          >
            Seed
          </label>
          <input
            id={inputId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={applyDraft}
            spellCheck={false}
            autoComplete="off"
            className="w-24 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-faint"
            placeholder="any text"
          />
        </form>

        <button
          type="button"
          onClick={roll}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-background/70 px-3.5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground ring-1 ring-border backdrop-blur-md transition-colors hover:text-foreground hover:ring-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Dices className="h-3.5 w-3.5 text-accent" />
          Regenerate
        </button>
      </div>
    </div>
  );
}
