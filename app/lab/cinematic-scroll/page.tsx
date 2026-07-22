import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CinematicScroll } from "@/components/lab/cinematic-scroll";
import {
  LabBreadcrumb,
  LabHint,
  LabNeighbors,
  LabNotes,
  LabTopNav,
  type Note,
} from "@/components/lab/lab-parts";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("cinematic-scroll");

export const metadata: Metadata = {
  title: "Scroll Cinematográfico",
  description:
    "Uma narrativa que se monta conforme a rolagem — cenas fixadas, linhas do tempo percorridas e profundidade que resolve como uma abertura de filme.",
};

const NOTES: Note[] = [
  {
    title: "Fixado, não estacionado",
    body: "Cada ato é uma trilha de rolagem alta que envolve uma cena grudada. A altura da trilha é a duração do ato: a cena fica presa à viewport enquanto a página continua passando por ela, e é isso que compra o tempo para qualquer coisa acontecer.",
  },
  {
    title: "Percorrido, não cronometrado",
    body: "A trilha declara uma view-timeline nomeada e os elementos dentro dela se ligam a essa timeline, então o progresso deles é o progresso da rolagem. Nada toca em um relógio — role de volta e a sequência roda ao contrário, quadro a quadro, porque cada quadro é uma posição e não um instante.",
  },
  {
    title: "Sem listener, sem JavaScript",
    body: "Não há um handler de rolagem nesta página, nem bundle de cliente para a peça: é HTML e CSS. As animações rodam no compositor, então continuam suaves sob carga. Onde timelines de rolagem não existem, ou o movimento está reduzido, cada elemento simplesmente permanece no seu estado final visível.",
  },
];

export default function CinematicScrollPage() {
  if (!entry) notFound();

  return (
    <main id="main" className="pb-24">
      {/* Cartela de abertura: fundo cheio, texto no rodapé, como uma ficha. */}
      <header className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden px-6 pb-12 pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,var(--accent-muted),transparent_70%)]"
        />
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <LabBreadcrumb entry={entry} />
            <LabTopNav slug={entry.slug} />
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="font-display text-hero font-semibold text-balance text-foreground">
                {entry.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
                {entry.summary}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <StatusBadge status={entry.status} />
              <span className="font-mono text-xs text-faint">
                {entry.index} · {entry.technique}
              </span>
              <LabHint>Role para rodar a sequência</LabHint>
            </div>
          </div>
        </div>
      </header>

      <CinematicScroll />

      <LabNotes
        notes={NOTES}
        variant="credits"
        title="Ficha técnica"
        className="mt-32"
      />
      <LabNeighbors slug={entry.slug} className="mt-24" />
    </main>
  );
}
