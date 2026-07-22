import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { type LabEntry, labNeighbors } from "@/lib/lab";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

/*
  Peças compartilhadas pelas telas do laboratório. Cada técnica monta o próprio
  layout — o que se repete aqui é só o que precisa ser idêntico entre elas:
  a trilha de navegação, o aviso de interação, as notas técnicas e o par
  anterior/seguinte.
*/

export type Note = { title: string; body: string };

export function LabBreadcrumb({
  entry,
  className,
}: {
  entry: LabEntry;
  className?: string;
}) {
  return (
    <nav
      aria-label="Trilha"
      className={cn(
        "flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-faint",
        className,
      )}
    >
      <Link
        href="/#lab"
        className="inline-block py-1 transition-colors hover:text-foreground"
      >
        O campo
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-muted-foreground">{entry.title}</span>
    </nav>
  );
}

/**
 * Salto entre técnicas no topo da página, para quem já subiu de volta e não
 * quer rolar até o rodapé para trocar de peça.
 */
export function LabTopNav({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const neighbors = labNeighbors(slug);
  if (!neighbors) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <TopNavLink direction="prev" entry={neighbors.prev} />
      <TopNavLink direction="next" entry={neighbors.next} />
    </div>
  );
}

function TopNavLink({
  direction,
  entry,
}: {
  direction: "prev" | "next";
  entry: LabEntry;
}) {
  const isNext = direction === "next";
  const label = isNext ? "Próxima" : "Anterior";
  const Icon = isNext ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={entry.href ?? "/#lab"}
      aria-label={`${label} técnica: ${entry.title}`}
      className={cn(
        "group inline-flex max-w-56 items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground hover:ring-border-strong",
        isNext && "flex-row-reverse",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:text-accent" />
      <span className="hidden truncate sm:inline">{entry.title}</span>
    </Link>
  );
}

export function LabHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5 font-mono text-[0.7rem] text-muted-foreground ring-1 ring-border backdrop-blur-md",
        className,
      )}
    >
      <Sparkles className="h-3.5 w-3.5 text-accent" />
      {children}
    </span>
  );
}

type NotesVariant = "grid" | "rows" | "column" | "credits" | "split";

/** Notas técnicas. A variante escolhe a forma; o conteúdo é sempre o mesmo. */
export function LabNotes({
  notes,
  variant = "grid",
  title = "Como funciona",
  className,
}: {
  notes: Note[];
  variant?: NotesVariant;
  title?: string;
  className?: string;
}) {
  const heading = (
    <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
      {title}
    </h2>
  );

  if (variant === "rows") {
    return (
      <section className={cn("mx-auto max-w-4xl px-6", className)}>
        {heading}
        <dl className="mt-8">
          {notes.map((note, i) => (
            <Reveal
              key={note.title}
              className="grid gap-3 border-t border-border py-8 md:grid-cols-[7rem_1fr] md:gap-10"
            >
              <dt className="font-mono text-sm text-faint">
                {String(i + 1).padStart(2, "0")}
              </dt>
              <dd>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {note.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {note.body}
                </p>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>
    );
  }

  if (variant === "column") {
    return (
      <section className={cn("mx-auto max-w-lg px-6", className)}>
        {heading}
        <div className="mt-8 space-y-10">
          {notes.map((note, i) => (
            <Reveal key={note.title}>
              <span className="font-mono text-sm text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                {note.title}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                {note.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section className={cn("mx-auto max-w-5xl px-6", className)}>
        {heading}
        <div className="mt-10 grid gap-x-14 gap-y-12 sm:grid-cols-2">
          {notes.map((note, i) => (
            <Reveal key={note.title} className="border-t border-border pt-6">
              <span className="font-mono text-sm text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                {note.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {note.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "credits") {
    return (
      <section className={cn("mx-auto max-w-3xl px-6 text-center", className)}>
        {heading}
        <div className="mt-10 space-y-12">
          {notes.map((note) => (
            <Reveal key={note.title}>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {note.title}
              </h3>
              <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground text-pretty">
                {note.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={cn("mx-auto max-w-6xl px-6", className)}>
      {heading}
      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {notes.map((note, i) => (
          <Reveal key={note.title} className="flex flex-col bg-card p-7">
            <span className="font-mono text-sm text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-8 font-display text-lg font-semibold text-foreground">
              {note.title}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              {note.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function LabNeighbors({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const neighbors = labNeighbors(slug);
  if (!neighbors) return null;

  return (
    <nav
      aria-label="Outras técnicas"
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 sm:grid-cols-2",
        className,
      )}
    >
      <PieceLink direction="prev" entry={neighbors.prev} />
      <PieceLink direction="next" entry={neighbors.next} />
    </nav>
  );
}

function PieceLink({
  direction,
  entry,
}: {
  direction: "prev" | "next";
  entry: LabEntry;
}) {
  const isNext = direction === "next";
  const href = entry.href ?? "/#lab";
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md transition-colors hover:border-border-strong",
        isNext && "sm:flex-row-reverse sm:text-right",
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full ring-1 ring-border-strong transition-colors group-hover:ring-accent">
        {isNext ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ArrowLeft className="h-4 w-4" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[0.7rem] uppercase tracking-[0.16em] text-faint">
          {isNext ? "Próxima" : "Anterior"}
        </span>
        <span className="mt-1 block truncate font-display text-base font-semibold text-foreground">
          {entry.title}
        </span>
      </span>
    </Link>
  );
}
