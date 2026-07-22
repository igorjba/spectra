import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RaymarchedForms } from "@/components/lab/raymarched-forms";
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

const entry = getLabEntry("raymarched-forms");

export const metadata: Metadata = {
  title: "Formas por Raymarching",
  description:
    "Geometria de campo de distância percorrida pixel a pixel — sólidos que existem apenas como uma função matemática, iluminados e sombreados na GPU.",
};

const NOTES: Note[] = [
  {
    title: "Sem malha, só distância",
    body: "Cada forma é uma função que devolve a que distância qualquer ponto do espaço está da sua superfície. Uma esfera, uma caixa arredondada e um toro são três dessas funções, unidas em um corpo só por um mínimo suave que as derrete no ponto de encontro.",
  },
  {
    title: "Sphere tracing",
    body: "Cada pixel lança um raio e avança repetidamente pela distância exata até a superfície mais próxima — nunca ultrapassando. Em menos de cem passos o raio pousa na superfície ou escapa para o fundo. Nenhuma geometria é enviada à GPU.",
  },
  {
    title: "Sombreamento na GPU",
    body: "A normal da superfície sai do gradiente do campo de distância. Dali em diante é iluminação clássica: uma luz principal com sombras de penumbra suavizada, oclusão de ambiente amostrada ao longo da normal, um brilho especular e um contorno fresnel — tudo por pixel.",
  },
];

/** Ficha técnica que acompanha o palco: o dado cru ao lado da imagem. */
const SPECS = [
  { label: "Método", value: "Sphere tracing" },
  { label: "Geometria", value: "SDF · união suave" },
  { label: "Passos máx.", value: "96 por raio" },
  { label: "Luz", value: "Chave + AO + fresnel" },
];

export default function RaymarchedFormsPage() {
  if (!entry) notFound();

  return (
    <main id="main" className="pb-24 pt-28 sm:pt-32">
      <header className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <LabBreadcrumb entry={entry} />
          <LabTopNav slug={entry.slug} />
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1.35fr_1fr] md:items-end">
          <div>
            <h1 className="font-display text-display font-semibold text-balance text-foreground">
              {entry.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {entry.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <StatusBadge status={entry.status} />
              <span className="font-mono text-xs text-faint">
                {entry.index} · {entry.slug}
              </span>
            </div>
            <dl>
              {SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0 last:pb-0"
                >
                  <dt className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                    {spec.label}
                  </dt>
                  <dd className="text-sm text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </header>

      {/* Palco: câmara escura sangrando até as bordas, sem cartão em volta. */}
      <div className="relative mt-14 border-y border-border-strong bg-background-subtle">
        <div className="relative h-[68vh] min-h-104 w-full overflow-hidden">
          <RaymarchedForms />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_75%_at_50%_50%,transparent_45%,var(--background)_100%)] opacity-80"
          />
          <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between gap-3">
            <LabHint>Mova o ponteiro para orbitar a câmera</LabHint>
            <span className="hidden rounded-full bg-background/60 px-3 py-1.5 font-mono text-[0.7rem] text-faint ring-1 ring-border backdrop-blur-md sm:inline-block">
              {entry.technique}
            </span>
          </div>
        </div>
      </div>

      <LabNotes notes={NOTES} variant="grid" className="mt-24" />
      <LabNeighbors slug={entry.slug} className="mt-16" />
    </main>
  );
}
