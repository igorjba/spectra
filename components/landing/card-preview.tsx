import type { CSSProperties } from "react";

/*
  Miniatura por técnica. Cada uma cita o gesto da peça que representa — o fluxo
  do fluido, a queda dos corpos, o espectro do áudio — e só entra em movimento
  sob o ponteiro, via `group-hover`. Tudo é CSS: nenhuma miniatura custa um
  canvas nem um bundle de cliente.
*/

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-28 w-full overflow-hidden rounded-xl bg-background-subtle ring-1 ring-border transition-colors duration-300 group-hover:ring-border-strong">
      {children}
    </div>
  );
}

function SpectralPreview() {
  return (
    <Frame>
      <div className="absolute -inset-8 bg-[conic-gradient(from_0deg,var(--spectra-4),var(--spectra-5),var(--spectra-1),var(--spectra-3),var(--spectra-4))] opacity-45 blur-xl transition-opacity duration-500 group-hover:opacity-80 group-hover:animate-[card-spin_9s_linear_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,transparent_20%,var(--background-subtle)_100%)]" />
    </Frame>
  );
}

function RaymarchPreview() {
  return (
    <Frame>
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-elevated ring-1 ring-border-strong">
        <div className="h-full w-full bg-[radial-gradient(circle_at_32%_28%,var(--spectra-5),transparent_62%)] opacity-90 group-hover:animate-[card-orbit_4.5s_ease-in-out_infinite]" />
      </div>
      <div className="absolute bottom-4 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-foreground/10 blur-[3px]" />
    </Frame>
  );
}

function FluidPreview() {
  const lines = [0, 1, 2, 3];
  return (
    <Frame>
      <svg
        viewBox="0 0 200 112"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        {lines.map((i) => (
          <path
            key={i}
            d={`M -10 ${30 + i * 18} C 40 ${14 + i * 18}, 70 ${
              48 + i * 18
            }, 110 ${30 + i * 18} S 180 ${12 + i * 18}, 210 ${34 + i * 18}`}
            fill="none"
            stroke={`var(--spectra-${4 - (i % 2)})`}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="16 10"
            opacity={0.75 - i * 0.12}
            className="group-hover:animate-[card-flow_1.6s_linear_infinite]"
            style={delay(i * 120)}
          />
        ))}
      </svg>
    </Frame>
  );
}

function VerletPreview() {
  const bodies = [
    { size: "h-9 w-9", left: "22%", color: "bg-spectra-4", d: 0 },
    { size: "h-12 w-12", left: "50%", color: "bg-accent", d: 120 },
    { size: "h-7 w-7", left: "76%", color: "bg-spectra-5", d: 240 },
  ];
  return (
    <Frame>
      <span className="absolute inset-x-4 bottom-4 h-px bg-border-strong" />
      {bodies.map((b) => (
        <span
          key={b.left}
          style={{ left: b.left, ...delay(b.d) }}
          className={`absolute bottom-4 -translate-x-1/2 rounded-full ${b.size} ${b.color} opacity-85 group-hover:animate-[card-drop_1.9s_ease-in-out_infinite]`}
        />
      ))}
    </Frame>
  );
}

function GenerativePreview() {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <Frame>
      <div className="absolute inset-3 grid grid-cols-4 grid-rows-3 gap-1.5">
        {cells.map((i) => (
          <span
            key={i}
            style={delay(i * 90)}
            className={`rounded-[3px] opacity-25 group-hover:animate-[card-pop_2.2s_ease-in-out_infinite] ${
              ["bg-spectra-4", "bg-spectra-5", "bg-accent", "bg-foreground"][
                i % 4
              ]
            } ${i % 5 === 0 ? "rounded-full" : ""}`}
          />
        ))}
      </div>
    </Frame>
  );
}

function CinematicPreview() {
  const bands = [
    { top: "22%", h: "h-2", w: "w-[70%]", color: "bg-spectra-4/70", s: "3.2s" },
    { top: "46%", h: "h-3", w: "w-[86%]", color: "bg-accent/80", s: "2.2s" },
    { top: "70%", h: "h-1.5", w: "w-[58%]", color: "bg-foreground/40", s: "1.4s" },
  ];
  return (
    <Frame>
      {bands.map((b) => (
        <span
          key={b.top}
          style={{ top: b.top, animationDuration: b.s }}
          className={`absolute left-0 rounded-full ${b.h} ${b.w} ${b.color} group-hover:animate-[card-parallax_2s_linear_infinite]`}
        />
      ))}
      <span className="absolute inset-y-0 right-0 w-10 bg-linear-to-l from-background-subtle to-transparent" />
    </Frame>
  );
}

function KineticPreview() {
  return (
    <Frame>
      <span className="absolute inset-0 grid place-items-center font-display text-5xl text-foreground group-hover:animate-[card-weight_2.4s_ease-in-out_infinite]">
        Aa
      </span>
    </Frame>
  );
}

function AudioPreview() {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center gap-1.5">
        {bars.map((i) => (
          <span
            key={i}
            style={delay(i * 90)}
            className="h-14 w-1.5 origin-center scale-y-[0.18] rounded-full bg-linear-to-t from-spectra-4 to-spectra-5 group-hover:animate-[card-level_1.1s_ease-in-out_infinite]"
          />
        ))}
      </div>
    </Frame>
  );
}

const PREVIEWS: Record<string, () => React.ReactElement> = {
  "spectral-field": SpectralPreview,
  "raymarched-forms": RaymarchPreview,
  fluid: FluidPreview,
  verlet: VerletPreview,
  generative: GenerativePreview,
  "cinematic-scroll": CinematicPreview,
  "kinetic-type": KineticPreview,
  "audio-reactive": AudioPreview,
};

export function CardPreview({ slug }: { slug: string }) {
  const Preview = PREVIEWS[slug];
  return Preview ? <Preview /> : null;
}
