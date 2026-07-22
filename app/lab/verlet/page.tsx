import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VerletBodies } from "@/components/lab/verlet-bodies";
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

const entry = getLabEntry("verlet");

export const metadata: Metadata = {
  title: "Corpos de Verlet",
  description:
    "Elementos de interface com massa. A integração de Verlet governa gravidade, molas e colisão — segure, arremesse e veja tudo assentar.",
};

const NOTES: Note[] = [
  {
    title: "A posição é o estado",
    body: "Cada corpo guarda onde está e onde estava um quadro atrás. Velocidade nunca é armazenada — é a diferença entre as duas. A integração vira uma subtração e, como não existe velocidade explícita, a simulação continua estável mesmo quando tudo é sacudido.",
  },
  {
    title: "Tudo é restrição",
    body: "Tirando a gravidade, o mundo inteiro é resolvido empurrando posições. Dois corpos sobrepostos se afastam na proporção da massa; uma mola é um par que precisa manter o comprimento; uma parede é um limite. Relaxar todas elas algumas vezes por quadro é o que faz uma pilha parar em vez de tremer.",
  },
  {
    title: "Segurar, arremessar, assentar",
    body: "Um corpo seguro vira imóvel e segue o ponteiro, empurrando os outros no caminho. Ao soltar, a velocidade guardada nas duas últimas posições o carrega — não existe código de arremesso, só física. Depois ele cai, colide e para.",
  },
];

export default function VerletPage() {
  if (!entry) notFound();

  return (
    <main id="main" className="pb-24 pt-24 sm:pt-28">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
        <LabBreadcrumb entry={entry} />
        <LabTopNav slug={entry.slug} />
      </div>

      {/* Cabeçalho centrado e compacto: a arena precisa caber na mesma dobra. */}
      <header className="mx-auto mt-10 max-w-3xl px-6 text-center">
        <h1 className="font-display text-display font-semibold text-balance text-foreground">
          {entry.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground text-pretty">
          {entry.summary}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <StatusBadge status={entry.status} />
          <span className="font-mono text-xs text-faint">
            {entry.technique}
          </span>
        </div>
      </header>

      {/*
        Arena de largura total. O chão é a borda inferior da própria página,
        então os corpos assentam contra a estrutura em vez de dentro de um
        cartão flutuando.
      */}
      <div className="relative mt-10">
        <div className="relative h-[56vh] min-h-96 w-full overflow-hidden border-y border-border-strong bg-background-subtle">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
          <VerletBodies />
          <div className="pointer-events-none absolute inset-x-6 top-6">
            <LabHint>Segure um corpo e arremesse</LabHint>
          </div>
        </div>
      </div>

      <LabNotes notes={NOTES} variant="rows" className="mt-24" />
      <LabNeighbors slug={entry.slug} className="mt-16" />
    </main>
  );
}
