import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import { notFound } from "next/navigation";

import { KineticType } from "@/components/lab/kinetic-type";
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

/*
  Carregada aqui e não no layout raiz: esta é a única rota que precisa de uma
  fonte variável multi-eixo, e o resto do site não deve pagar por ela.
*/
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth", "opsz", "GRAD"],
  display: "swap",
});

const entry = getLabEntry("kinetic-type");

export const metadata: Metadata = {
  title: "Tipografia Cinética",
  description:
    "Fontes variáveis que respiram. Peso, largura e tamanho óptico respondem ao movimento e ao ponteiro; o texto deforma sem quebrar e depois assenta.",
};

const NOTES: Note[] = [
  {
    title: "Eixos, não pesos",
    body: "Uma fonte variável não é uma família de cortes — é um espaço de design contínuo. A Roboto Flex expõe peso de 100 a 1000, largura de 25 a 151 e tamanho óptico de 8 a 144, e cada glifo desta tela ocupa o próprio ponto nesse espaço, movendo-se por ele quadro a quadro.",
  },
  {
    title: "Energia por glifo",
    body: "Cada caractere guarda um valor entre zero e um: a proximidade do ponteiro, com queda gaussiana, e uma onda lenta descendo a linha enquanto ninguém está perto. Esse único número é mapeado em três eixos ao mesmo tempo, então as letras engrossam e alargam juntas.",
  },
  {
    title: "A linha assenta e para",
    body: "Depois de alguns segundos sem ponteiro, a amplitude da onda decai até zero e os glifos convergem para um peso de leitura. Quando todos chegam lá, o loop de animação é encerrado — o texto realmente para, sem quadros repetidos custando bateria. Mover o ponteiro acorda a linha de novo.",
  },
  {
    title: "Barato o bastante para rodar",
    body: "Mudar font-variation-settings força relayout, então o loop evita repetir trabalho. Os centros dos glifos são medidos uma vez e em resize — nunca por quadro — o ponteiro apenas registra uma posição, e um único quadro de animação escreve uma custom property suavizada por glifo. Com movimento reduzido, o estado já nasce assentado.",
  },
];

export default function KineticTypePage() {
  if (!entry) notFound();

  return (
    <main id="main">
      {/* Pôster: a peça é a tela inteira, sem moldura em volta. */}
      <section className="relative min-h-dvh overflow-hidden">
        <div className="absolute inset-0">
          <KineticType fontClassName={robotoFlex.className} />
        </div>

        <div className="relative z-10 flex min-h-dvh flex-col justify-between px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <LabBreadcrumb entry={entry} />
              <h1 className="mt-4 font-display text-title font-semibold text-foreground">
                {entry.title}
              </h1>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <LabTopNav slug={entry.slug} />
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <StatusBadge status={entry.status} />
                <span className="font-mono text-[0.7rem] text-faint">
                  {entry.index} · {entry.technique}
                </span>
              </div>
            </div>
          </div>

          <LabHint className="self-start">
            Passe sobre as letras — e depois deixe-as assentar
          </LabHint>
        </div>
      </section>

      {/* Coluna editorial: o texto explicativo entra depois do pôster. */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <p className="font-display text-title font-semibold text-balance text-foreground md:sticky md:top-28 md:self-start">
            {entry.summary}
          </p>
          <LabNotes
            notes={NOTES}
            variant="column"
            title="Os eixos"
            className="max-w-none px-0"
          />
        </div>
      </section>

      <LabNeighbors slug={entry.slug} className="pb-24" />
    </main>
  );
}
