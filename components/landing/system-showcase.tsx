import { Check } from "lucide-react";

import { Reveal, RevealGroup } from "@/components/ui/reveal";

const SPECTRUM = [
  "--spectra-1",
  "--spectra-2",
  "--spectra-3",
  "--spectra-4",
  "--spectra-5",
];

const SEMANTIC = [
  { token: "--accent", label: "Accent" },
  { token: "--foreground", label: "Foreground" },
  { token: "--muted-foreground", label: "Muted" },
  { token: "--surface", label: "Surface" },
  { token: "--border-strong", label: "Border" },
];

// Paths map cubic-bezier(x1,y1,x2,y2) into a 40×40 box (y down, output up).
const CURVES = [
  { name: "out-expo", d: "M0,40 C6.4,0 12,0 40,0", token: "0.16, 1, 0.3, 1" },
  { name: "out-back", d: "M0,40 C13.6,-22.4 25.6,0 40,0", token: "0.34, 1.56, 0.64, 1" },
  { name: "in-out-quart", d: "M0,40 C30.4,40 9.6,0 40,0", token: "0.76, 0, 0.24, 1" },
];

const GUARANTEES = [
  "Keyboard-navigable, focus-visible rings",
  "WCAG AA contrast in both themes",
  "Respects prefers-reduced-motion",
  "Honors the OS color scheme",
  "Semantic landmarks and labels",
];

function Panel({
  title,
  meta,
  className,
  children,
}: {
  title: string;
  meta: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      className={`flex flex-col rounded-2xl border border-border bg-card p-7 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
          {meta}
        </span>
      </div>
      <div className="mt-6 flex-1">{children}</div>
    </Reveal>
  );
}

export function SystemShowcase() {
  return (
    <section
      id="system"
      className="relative scroll-mt-24 border-t border-border py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            The system
          </p>
          <h2 className="mt-5 font-display text-display font-semibold text-balance text-foreground">
            Everything runs on tokens.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            Color, type, motion, and spacing are defined once, in perceptual
            color space, and swap coherently across themes. The screens
            don&apos;t hold values — they reference the system.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-2">
          {/* Palette — spans full width */}
          <Panel
            title="Palette"
            meta="OKLCH"
            className="md:col-span-2"
          >
            <div className="flex h-16 overflow-hidden rounded-lg">
              {SPECTRUM.map((v) => (
                <div
                  key={v}
                  className="flex-1"
                  style={{ backgroundColor: `var(${v})` }}
                />
              ))}
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
              {SEMANTIC.map((s) => (
                <li key={s.token} className="flex items-center gap-3">
                  <span
                    className="h-5 w-5 shrink-0 rounded-md ring-1 ring-border-strong"
                    style={{ backgroundColor: `var(${s.token})` }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">
                      {s.label}
                    </span>
                    <span className="block truncate font-mono text-[0.65rem] text-faint">
                      {s.token}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Type */}
          <Panel title="Type" meta="3 families">
            <div className="space-y-5">
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <span className="font-display text-2xl font-semibold text-foreground">
                  Display
                </span>
                <span className="font-mono text-[0.65rem] text-faint">
                  Space Grotesk
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <span className="text-lg text-foreground">Body & interface</span>
                <span className="font-mono text-[0.65rem] text-faint">Inter</span>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-sm text-foreground">
                  mono / code
                </span>
                <span className="font-mono text-[0.65rem] text-faint">
                  JetBrains Mono
                </span>
              </div>
              <p className="pt-2 font-mono text-[0.7rem] text-faint">
                fluid scale · clamp() · -0.04em → -0.02em tracking
              </p>
            </div>
          </Panel>

          {/* Motion */}
          <Panel title="Motion" meta="easing">
            <ul className="space-y-4">
              {CURVES.map((c) => (
                <li key={c.name} className="flex items-center gap-4">
                  <svg
                    viewBox="-2 -26 44 70"
                    className="h-12 w-12 shrink-0 overflow-visible"
                    aria-hidden="true"
                  >
                    <line
                      x1="0"
                      y1="40"
                      x2="40"
                      y2="0"
                      stroke="var(--border-strong)"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                    />
                    <path
                      d={c.d}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="min-w-0">
                    <span className="block font-mono text-sm text-foreground">
                      {c.name}
                    </span>
                    <span className="block truncate font-mono text-[0.65rem] text-faint">
                      cubic-bezier({c.token})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Accessibility */}
          <Panel title="Accessibility" meta="baked in" className="md:col-span-2">
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {GUARANTEES.map((g) => (
                <li key={g} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-muted text-accent">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-muted-foreground">{g}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </RevealGroup>
      </div>
    </section>
  );
}
