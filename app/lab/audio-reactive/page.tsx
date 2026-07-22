import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AudioReactive } from "@/components/lab/audio-reactive";
import {
  LabBreadcrumb,
  LabNeighbors,
  LabNotes,
  LabTopNav,
  type Note,
} from "@/components/lab/lab-parts";
import { StatusBadge } from "@/components/ui/status-badge";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("audio-reactive");

export const metadata: Metadata = {
  title: "Áudio Reativo",
  description:
    "A interface escuta. Uma FFT do áudio ao vivo comanda layout, cor e movimento — a tela pulsa e se reorganiza conforme o som.",
};

const NOTES: Note[] = [
  {
    title: "O som também é sintetizado",
    body: "Não há arquivo de áudio aqui nem exigência de microfone. Um pad desafinado passa por um filtro varrido lentamente, um agendador solta um pulso grave a cada poucas centenas de milissegundos e rajadas curtas de ruído filtrado dão ar. A Web Audio faz os dois trabalhos ao mesmo tempo — gera o sinal e o analisa.",
  },
  {
    title: "Lendo o espectro",
    body: "Um AnalyserNode roda uma FFT de 2048 pontos e devolve um byte por faixa de frequência. As faixas são amostradas em curva, não uniformemente: a ponta grave concentra quase toda a energia, e espalhá-la é o que impede o visual de amontoar tudo em um canto. As barras são esses níveis; o núcleo pulsa no grave.",
  },
  {
    title: "Gesto, permissão e limpeza",
    body: "Navegadores recusam iniciar áudio sem um gesto, então nada existe antes de você apertar play. O microfone é opcional e alimenta apenas o analisador — nunca a saída — então não há realimentação. Sair da aba ou rolar para longe suspende o contexto, e desmontar encerra cada faixa e fecha o contexto, para que o indicador de gravação nunca sobreviva à página.",
  },
];

export default function AudioReactivePage() {
  if (!entry) notFound();

  return (
    <main id="main" className="pb-24 pt-28 sm:pt-32">
      <header className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LabBreadcrumb entry={entry} />
          <LabTopNav slug={entry.slug} />
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="font-display text-display font-semibold text-balance text-foreground">
              {entry.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              {entry.summary}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <StatusBadge status={entry.status} />
            <span className="font-mono text-xs text-faint">
              {entry.index} · {entry.technique}
            </span>
          </div>
        </div>
      </header>

      {/*
        Sala escura: o espectro é radial, então o palco é uma faixa alta e sem
        moldura, com a luz vindo só do centro.
      */}
      <div className="relative mt-12 border-y border-border-strong bg-background-subtle">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_50%_50%,var(--accent-muted),transparent_70%)]"
        />
        <div className="relative h-[72vh] min-h-120 w-full">
          <AudioReactive />
        </div>
      </div>

      <LabNotes
        notes={NOTES}
        variant="split"
        title="Da síntese à análise"
        className="mt-24"
      />
      <LabNeighbors slug={entry.slug} className="mt-20" />
    </main>
  );
}
