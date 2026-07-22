import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GenerativeComposition } from "@/components/lab/generative-composition";
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

const entry = getLabEntry("generative");

export const metadata: Metadata = {
  title: "Composições Generativas",
  description:
    "Layouts desenhados por regra, não à mão. Cada semente produz uma composição nova a partir do mesmo algoritmo — determinística e reproduzível.",
};

const NOTES: Note[] = [
  {
    title: "Uma semente, não um sorteio",
    body: "Nada aqui chama Math.random na hora de desenhar. Uma semente alimenta um gerador determinístico, e toda decisão — onde cortar, qual módulo, qual cor — é tirada dele em ordem. Digite a mesma semente de novo e a composição volta idêntica, pixel a pixel.",
  },
  {
    title: "O layout se corta sozinho",
    body: "Nenhuma coordenada é escrita à mão. A tela é dividida recursivamente: cada retângulo decide se subdivide, em qual eixo e em qual proporção, favorecendo o lado mais longo e razões clássicas. O que sobra quando a recursão para são as células onde a arte vive.",
  },
  {
    title: "Módulos e silêncio",
    body: "Cada célula desenha um módulo — um arco, anéis concêntricos, barras, pontos, um sólido — girado em uma de quatro orientações e colorido pelos tokens da marca, então a arte troca de tema junto com o site. Vazio é o módulo mais comum de propósito: é o espaço negativo que faz o resto ler como composição.",
  },
];

export default function GenerativePage() {
  if (!entry) notFound();

  return (
    <main id="main" className="pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LabBreadcrumb entry={entry} />
          <LabTopNav slug={entry.slug} />
        </div>

        {/* Duas colunas: a prancha à esquerda, o texto corrido à direita. */}
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-square w-full overflow-hidden border border-border-strong bg-background-subtle">
              <GenerativeComposition />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <LabHint className="bg-transparent">
                Troque a semente ou sorteie outra
              </LabHint>
              <span className="font-mono text-[0.7rem] text-faint">
                {entry.technique}
              </span>
            </div>
          </div>

          <div>
            <h1 className="font-display text-display font-semibold text-balance text-foreground">
              {entry.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              {entry.summary}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <StatusBadge status={entry.status} />
              <span className="font-mono text-xs text-faint">
                {entry.index} · {entry.slug}
              </span>
            </div>

            <LabNotes
              notes={NOTES}
              variant="column"
              title="O algoritmo"
              className="mt-14 max-w-none px-0"
            />
          </div>
        </div>
      </div>

      <LabNeighbors slug={entry.slug} className="mt-24" />
    </main>
  );
}
