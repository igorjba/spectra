import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FluidField } from "@/components/lab/fluid-field";
import {
  LabBreadcrumb,
  LabHint,
  LabNeighbors,
  LabTopNav,
  type Note,
} from "@/components/lab/lab-parts";
import { Reveal } from "@/components/ui/reveal";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("fluid");

export const metadata: Metadata = {
  title: "Fluido",
  description:
    "Um solver de fluidos na GPU: advecção, difusão e projeção de pressão sobre um campo de velocidade que o cursor empurra.",
};

const NOTES: Note[] = [
  {
    title: "Stable fluids na GPU",
    body: "Velocidade, pressão e corante vivem cada um em uma textura de ponto flutuante. Cada passo é um shader de tela cheia que lê uma textura e escreve a seguinte — os campos nunca deixam a GPU. Arrastar o ponteiro injeta velocidade e cor no escoamento.",
  },
  {
    title: "Tornando incompressível",
    body: "A advecção pura deixa o fluido comprimir. A cada quadro o solver mede a divergência da velocidade, roda uma solução de pressão por Jacobi — vinte iterações alternando entre duas texturas — e subtrai o gradiente de pressão, deixando um campo sem divergência, que gira em vez de acumular.",
  },
  {
    title: "Vorticidade e cor",
    body: "Um passo de confinamento de vorticidade devolve as pequenas rotações ao campo, para que o movimento continue vivo em vez de virar mingau. O corante é advectado pelo mesmo campo de velocidade e dissipa devagar, tingido na ponta fria do espectro.",
  },
];

export default function FluidPage() {
  if (!entry) notFound();

  return (
    <main id="main" className="relative">
      {/* A peça é a tela: fixa atrás de todo o conteúdo, do topo ao rodapé. */}
      <div className="fixed inset-0 -z-10">
        <FluidField />
      </div>

      {/* Primeira dobra: só o fluido e o título flutuando sobre ele. */}
      <section className="relative flex min-h-dvh flex-col justify-between px-6 pb-8 pt-28 sm:pt-32">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <LabBreadcrumb entry={entry} />
            <LabTopNav slug={entry.slug} />
          </div>
          <h1 className="mt-8 max-w-3xl font-display text-hero font-semibold text-balance text-foreground drop-shadow-[0_2px_24px_var(--background)]">
            {entry.title}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/80 text-pretty drop-shadow-[0_1px_16px_var(--background)]">
            {entry.summary}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <LabHint>Arraste em qualquer lugar da tela</LabHint>
          <span className="flex items-center gap-4 rounded-full bg-background/60 px-4 py-1.5 ring-1 ring-border backdrop-blur-md">
            <StatusBadge status={entry.status} />
            <span className="hidden font-mono text-[0.7rem] text-faint sm:inline">
              {entry.technique}
            </span>
          </span>
        </div>
      </section>

      {/*
        As notas não abrem uma página nova: são vidro sobre o mesmo escoamento,
        que continua correndo atrás delas e reagindo ao ponteiro.
      */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl border border-border-strong bg-background/70 p-8 backdrop-blur-2xl sm:p-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            O que roda por baixo
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {NOTES.map((note, i) => (
              <Reveal key={note.title}>
                <span className="font-mono text-sm text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                  {note.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                  {note.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <LabNeighbors slug={entry.slug} className="mt-6" />
      </section>
    </main>
  );
}
