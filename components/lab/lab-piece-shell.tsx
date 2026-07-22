import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { type LabEntry, labNeighbors } from "@/lib/lab";
import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";

type Note = { title: string; body: string };

export function LabPieceShell({
  entry,
  interactionHint,
  notes,
  /**
   * "framed" drops the piece into a fixed aspect stage. "flow" hands it the
   * page instead, for pieces that need their own scroll length.
   */
  stage = "framed",
  children,
}: {
  entry: LabEntry;
  interactionHint: string;
  notes: Note[];
  stage?: "framed" | "flow";
  children: React.ReactNode;
}) {
  const neighbors = labNeighbors(entry.slug);

  return (
    <main id="main" className="pt-28 pb-24 sm:pt-32">
      <header className="mx-auto max-w-6xl px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-faint"
        >
          <Link
            href="/#lab"
            className="transition-colors hover:text-foreground"
          >
            The field
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-muted-foreground">{entry.title}</span>
        </nav>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-display font-semibold text-balance text-foreground">
            {entry.title}
          </h1>
          <div className="flex items-center gap-4 pb-1">
            <StatusBadge status={entry.status} />
            <span className="font-mono text-sm text-faint">
              {entry.index} · {entry.slug}
            </span>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          {entry.summary}
        </p>
      </header>

      {/* Stage — the technique itself, running live. */}
      {stage === "framed" ? (
        <div className="mx-auto mt-10 max-w-6xl px-6">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border-strong bg-background-subtle sm:aspect-video">
            {children}

            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1.5 font-mono text-[0.7rem] text-muted-foreground ring-1 ring-border backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {interactionHint}
              </span>
              <span className="hidden rounded-full bg-background/60 px-3 py-1.5 font-mono text-[0.7rem] text-faint ring-1 ring-border backdrop-blur-md sm:inline-block">
                {entry.technique}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-elevated px-3 py-1.5 font-mono text-[0.7rem] text-muted-foreground ring-1 ring-border">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {interactionHint}
            </span>
            <span className="rounded-full px-3 py-1.5 font-mono text-[0.7rem] text-faint ring-1 ring-border">
              {entry.technique}
            </span>
          </div>
          <div className="mt-8">{children}</div>
        </>
      )}

      {/* Notes — the honest technical account of what runs. */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
          How it works
        </h2>
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

      {/* Prev / next across the catalog. */}
      {neighbors && (
        <nav
          aria-label="More techniques"
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 px-6 sm:grid-cols-2"
        >
          <PieceLink direction="prev" entry={neighbors.prev} />
          <PieceLink direction="next" entry={neighbors.next} />
        </nav>
      )}
    </main>
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
      className={`group flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-border-strong ${
        isNext ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
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
          {isNext ? "Next" : "Previous"}
        </span>
        <span className="mt-1 block truncate font-display text-base font-semibold text-foreground">
          {entry.title}
        </span>
      </span>
    </Link>
  );
}
