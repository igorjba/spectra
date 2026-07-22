import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { type LabEntry, LAB_ENTRIES } from "@/lib/lab";
import { cn } from "@/lib/utils";
import { CardPreview } from "@/components/landing/card-preview";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";

/**
 * O catálogo. Vive dentro da mesma seção do hero e sobre o mesmo campo, então
 * não abre com borda nem com fundo próprio — a leitura continua de cima.
 */
export function LabCatalog() {
  const live = LAB_ENTRIES.filter((e) => e.status === "live").length;

  return (
    <div id="lab" className="relative scroll-mt-24 pb-32 sm:pb-44">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              O campo
            </p>
            <h2 className="mt-5 font-display text-display font-semibold text-balance text-foreground">
              Um catálogo de técnicas.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
              Não é uma galeria de telas — é um conjunto de métodos, cada um
              difícil de construir e rodando nativamente no navegador. O campo
              cresce uma técnica por vez.
            </p>
          </div>
          <p className="font-mono text-sm text-faint">
            {live} no ar · {LAB_ENTRIES.length} no catálogo
          </p>
        </Reveal>

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {LAB_ENTRIES.map((entry) => (
            <Reveal key={entry.slug} as="li" className="list-none">
              <LabCard entry={entry} />
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}

function LabCard({ entry }: { entry: LabEntry }) {
  const isLive = entry.status === "live";
  const clickable = Boolean(entry.href);

  const cardClass = cn(
    "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 ease-out-quart",
    isLive
      ? "border-border-strong bg-card/70 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-lg"
      : "border-border bg-card/50 hover:border-border-strong",
  );

  const body = (
    <>
      <CardPreview slug={entry.slug} />

      <div className="mt-5 flex items-center justify-between">
        <StatusBadge status={entry.status} />
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="font-mono text-[0.7rem] text-faint"
          >
            {entry.index}
          </span>
          {clickable && (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          )}
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
        {entry.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {entry.summary}
      </p>
      <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">
        {entry.technique}
      </p>
    </>
  );

  if (clickable && entry.href) {
    return (
      <Link href={entry.href} className={cardClass}>
        {body}
      </Link>
    );
  }

  return <div className={cardClass}>{body}</div>;
}
