import { ArrowUpRight } from "lucide-react";

import { LAB_ENTRIES } from "@/lib/lab";
import { cn } from "@/lib/utils";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";

export function LabField() {
  return (
    <section
      id="lab"
      className="relative scroll-mt-24 border-t border-border py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              The field
            </p>
            <h2 className="mt-5 font-display text-display font-semibold text-balance text-foreground">
              A catalog of techniques.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              Not a gallery of screens — a set of methods, each hard to build
              and each running natively in the browser. The field grows one
              technique at a time.
            </p>
          </div>
          <p className="font-mono text-sm text-faint">
            {LAB_ENTRIES.filter((e) => e.status === "live").length} live ·{" "}
            {LAB_ENTRIES.length} planned
          </p>
        </Reveal>

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {LAB_ENTRIES.map((entry) => {
            const isLive = entry.status === "live";
            return (
              <Reveal
                key={entry.slug}
                as="li"
                className={cn(
                  "group relative flex list-none flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                  isLive
                    ? "border-border-strong bg-card hover:-translate-y-1 hover:border-accent/60"
                    : "border-border bg-card/60 hover:border-border-strong",
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-4 font-display text-[5rem] font-bold leading-none text-foreground/[0.04] transition-colors duration-300 group-hover:text-foreground/[0.07]"
                >
                  {entry.index}
                </span>

                <div className="flex items-center justify-between">
                  <StatusBadge status={entry.status} />
                  {isLive && (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                  )}
                </div>

                <h3 className="mt-10 font-display text-xl font-semibold text-foreground">
                  {entry.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {entry.summary}
                </p>
                <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">
                  {entry.technique}
                </p>
              </Reveal>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
