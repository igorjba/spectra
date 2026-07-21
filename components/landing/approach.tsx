import { Reveal, RevealGroup } from "@/components/ui/reveal";

const LAYERS = [
  {
    index: "01",
    title: "Foundations",
    body: "The common screens, done right. Landing, dashboard, pricing, auth, dense tables, empty and error states — the eighty percent every product actually needs, built to production standard.",
    meta: "Institutional",
  },
  {
    index: "02",
    title: "The system",
    body: "Design tokens, swappable themes, a fluid type scale, a motion language, real accessibility — focus, contrast, keyboard. Not a folder of screens. A system the screens are born from.",
    meta: "Engineering",
  },
  {
    index: "03",
    title: "Techniques",
    body: "The rare part. Shaders, generative composition, real-time physics, audio-reactive interfaces. Each one is a hard thing to build, and each one renders in the browser.",
    meta: "Transcendent",
  },
];

export function Approach() {
  return (
    <section
      id="approach"
      className="relative scroll-mt-24 border-t border-border py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            The approach
          </p>
          <h2 className="mt-5 font-display text-display font-semibold text-balance text-foreground">
            Three layers, one system.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            The weight isn&apos;t in how the screens look — it&apos;s in what
            runs behind them. Technique is where quality stops being a matter of
            taste and starts being measurable.
          </p>
        </Reveal>

        <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {LAYERS.map((layer) => (
            <Reveal
              key={layer.index}
              className="group flex flex-col bg-card p-8 transition-colors duration-300 hover:bg-elevated"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-faint">
                  {layer.index}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-faint">
                  {layer.meta}
                </span>
              </div>
              <h3 className="mt-10 font-display text-title font-semibold text-foreground">
                {layer.title}
              </h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                {layer.body}
              </p>
              <div className="mt-8 h-px w-full origin-left scale-x-100 bg-gradient-to-r from-accent to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-100" />
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
