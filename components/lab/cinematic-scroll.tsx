import type { CSSProperties } from "react";

import styles from "./cinematic-scroll.module.css";
import { cn } from "@/lib/utils";

/*
  Sem hooks, sem listeners, sem bundle de cliente — a sequência inteira é HTML e
  CSS. A posição da rolagem comanda cada animação através das view-timelines
  nomeadas declaradas na folha de estilo ao lado deste arquivo.
*/

const ACT2_WORDS = [
  "Cada",
  "quadro",
  "é",
  "uma",
  "posição,",
  "não",
  "um",
  "instante.",
];

/*
  Os fragmentos chegam de fora da viewport e assentam em um anel ao redor do
  quadro, deixando o centro livre para a frase final — eles compõem em volta da
  mensagem, não por cima dela.
*/
type Shard = {
  top: string;
  left: string;
  tx: string;
  ty: string;
  rot: string;
  className: string;
};

const SHARDS: Shard[] = [
  { top: "24%", left: "16%", tx: "-88vw", ty: "-46vh", rot: "-140deg", className: "h-20 w-20 rounded-2xl bg-spectra-4 sm:h-28 sm:w-28" },
  { top: "17%", left: "50%", tx: "0vw", ty: "-92vh", rot: "96deg", className: "h-12 w-32 rounded-full bg-foreground sm:h-14 sm:w-44" },
  { top: "25%", left: "84%", tx: "92vw", ty: "-58vh", rot: "168deg", className: "h-16 w-28 rounded-full bg-spectra-5 sm:h-20 sm:w-40" },
  { top: "62%", left: "87%", tx: "96vw", ty: "44vh", rot: "-124deg", className: "h-20 w-20 rounded-2xl bg-spectra-3 sm:h-24 sm:w-24" },
  { top: "83%", left: "67%", tx: "62vw", ty: "88vh", rot: "152deg", className: "h-12 w-12 rounded-full bg-spectra-2 sm:h-14 sm:w-14" },
  { top: "84%", left: "33%", tx: "-58vw", ty: "94vh", rot: "-108deg", className: "h-14 w-14 rounded-2xl bg-spectra-1 sm:h-16 sm:w-16" },
  { top: "60%", left: "13%", tx: "-94vw", ty: "50vh", rot: "132deg", className: "h-24 w-24 rounded-full bg-accent sm:h-32 sm:w-32" },
];

export function CinematicScroll() {
  return (
    <div>
      {/* ── Ato 1 — profundidade ──────────────────────────────────── */}
      <section className={cn(styles.track, styles.act1)} aria-labelledby="act-1">
        <div className={styles.scene}>
          <div className={cn(styles.layer, styles.far)} aria-hidden="true">
            <div className="h-[80vmin] w-[80vmin] rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--spectra-4),transparent_65%)] opacity-50 blur-3xl" />
          </div>

          <div className={cn(styles.layer, styles.mid)} aria-hidden="true">
            <div className="relative h-[56vmin] w-[56vmin]">
              <div className="absolute left-0 top-8 h-28 w-28 rounded-full bg-spectra-5/70 blur-xl sm:h-40 sm:w-40" />
              <div className="absolute bottom-4 right-2 h-32 w-32 rounded-full bg-accent/60 blur-xl sm:h-48 sm:w-48" />
            </div>
          </div>

          <div className={cn(styles.layer, styles.near)} aria-hidden="true">
            <div className="relative h-[70vmin] w-[86vmin]">
              <span className="absolute left-2 top-6 h-4 w-4 rounded-full bg-spectra-2" />
              <span className="absolute right-8 top-16 h-3 w-3 rounded-full bg-spectra-3" />
              <span className="absolute bottom-10 left-1/4 h-3.5 w-3.5 rounded-full bg-spectra-1" />
              <span className="absolute bottom-20 right-1/4 h-3 w-3 rounded-full bg-foreground" />
            </div>
          </div>

          <span
            aria-hidden="true"
            className={cn(
              styles.horizon,
              "absolute inset-x-0 top-1/2 h-px origin-center bg-linear-to-r from-transparent via-accent to-transparent",
            )}
          />

          <div className={cn(styles.title1, "relative z-10 max-w-3xl px-6 text-center")}>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              Ato um — profundidade
            </p>
            <h2
              id="act-1"
              className="mt-6 font-display text-hero font-semibold text-balance text-foreground"
            >
              A rolagem é a linha do tempo.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
              Três camadas, três velocidades. A distância é a única coisa que as
              separa, e a rolagem decide o quanto cada uma percorre.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ato 2 — o ato fixado e percorrido ─────────────────────── */}
      <section className={cn(styles.track, styles.act2)} aria-labelledby="act-2">
        <div className={styles.scene}>
          <div
            aria-hidden="true"
            className={cn(
              styles.wash,
              "absolute inset-0 bg-[conic-gradient(from_140deg_at_50%_50%,var(--spectra-4),var(--accent),var(--spectra-5),var(--spectra-4))] blur-3xl [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]",
            )}
          />

          <div className={cn(styles.act2Scene, "relative grid w-full place-items-center")}>
            <svg
              viewBox="0 0 1000 400"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
              className="absolute h-[62vmin] w-[92vmin] opacity-90"
            >
              <path
                className={styles.draw}
                d="M 40 320 C 240 320, 250 90, 480 90 S 760 320, 960 120"
                fill="none"
                stroke="var(--accent)"
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
              />
            </svg>

            <div className="relative z-10 max-w-3xl px-6 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
                Ato dois — percorrido
              </p>
              <h2
                id="act-2"
                className="mt-6 font-display text-display font-semibold text-balance text-foreground"
              >
                {ACT2_WORDS.map((word, i) => (
                  <span
                    key={`${word}-${i}`}
                    className={cn(styles.word, "mr-[0.22em] inline-block")}
                    style={
                      {
                        "--from": `${10 + i * 7}%`,
                        "--to": `${30 + i * 7}%`,
                      } as CSSProperties
                    }
                  >
                    {word}
                  </span>
                ))}
              </h2>

              <div className="mx-auto mt-10 w-full max-w-sm">
                <div className="h-px w-full overflow-hidden bg-border">
                  <div className={cn(styles.meter, "h-px w-full bg-accent")} />
                </div>
                <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
                  O progresso é posição
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ato 3 — montagem ──────────────────────────────────────── */}
      <section className={cn(styles.track, styles.act3)} aria-labelledby="act-3">
        <div className={styles.scene}>
          <div className={cn(styles.act3Scene, "absolute inset-0")}>
            <div className="absolute inset-0" aria-hidden="true">
              {SHARDS.map((s, i) => (
                <span
                  key={`${s.top}-${s.left}`}
                  className={cn(
                    styles.shard,
                    "absolute -translate-x-1/2 -translate-y-1/2",
                    s.className,
                  )}
                  style={
                    {
                      top: s.top,
                      left: s.left,
                      "--tx": s.tx,
                      "--ty": s.ty,
                      "--rot": s.rot,
                      "--from": `${2 + i * 5}%`,
                      "--to": `${44 + i * 5}%`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            <div
              className={cn(
                styles.title3,
                "absolute inset-0 z-10 grid place-items-center px-6 text-center",
              )}
            >
              <div className="max-w-2xl">
                <h2
                  id="act-3"
                  className="font-display text-display font-semibold text-balance text-foreground"
                >
                  Tudo se encaixa.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
                  Cenas fixadas, linhas do tempo percorridas e profundidade —
                  compostas inteiramente em CSS, sem nenhum listener de rolagem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ato 4 — o corte ───────────────────────────────────────── */}
      <section className={cn(styles.track, styles.act4)} aria-labelledby="act-4">
        <div className={cn(styles.scene, "bg-background")}>
          <div className={cn(styles.cutOut, "relative z-10 px-6 text-center")}>
            <p className={cn(styles.cut, "font-mono text-xs uppercase tracking-[0.22em] text-accent")}>
              Ato quatro — corte
            </p>
            <h2
              id="act-4"
              className={cn(
                styles.cut,
                "mt-6 font-display text-hero font-semibold text-balance",
              )}
            >
              {/* o degradê fica no span: em cn(), text-gradient e text-hero colidem */}
              <span className="text-gradient">Fim de sequência.</span>
            </h2>
          </div>

          {/* A cortina fecha sobre a última palavra, como um obturador. */}
          <span
            aria-hidden="true"
            className={cn(
              styles.curtainTop,
              "absolute inset-x-0 top-0 z-20 h-1/2 bg-background-subtle",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              styles.curtainBottom,
              "absolute inset-x-0 bottom-0 z-20 h-1/2 bg-background-subtle",
            )}
          />
        </div>
      </section>
    </div>
  );
}
