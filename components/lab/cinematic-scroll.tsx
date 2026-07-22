import type { CSSProperties } from "react";

import styles from "./cinematic-scroll.module.css";
import { cn } from "@/lib/utils";

/*
  No hooks, no listeners, no client bundle — the whole sequence is HTML and CSS.
  Scroll position drives every animation through named view-timelines declared
  in the stylesheet beside this file.
*/

const ACT2_WORDS = [
  "Every",
  "frame",
  "is",
  "a",
  "position,",
  "not",
  "a",
  "moment.",
];

/*
  The shards settle into a ring around the frame, leaving the middle clear for
  the closing line — they compose around the message rather than over it.
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
  { top: "24%", left: "16%", tx: "-40vw", ty: "-16vh", rot: "-14deg", className: "h-20 w-20 rounded-2xl bg-spectra-4 sm:h-28 sm:w-28" },
  { top: "17%", left: "50%", tx: "0vw", ty: "-40vh", rot: "7deg", className: "h-12 w-32 rounded-full bg-foreground sm:h-14 sm:w-44" },
  { top: "25%", left: "84%", tx: "42vw", ty: "-22vh", rot: "12deg", className: "h-16 w-28 rounded-full bg-spectra-5 sm:h-20 sm:w-40" },
  { top: "62%", left: "87%", tx: "44vw", ty: "18vh", rot: "-10deg", className: "h-20 w-20 rounded-2xl bg-spectra-3 sm:h-24 sm:w-24" },
  { top: "83%", left: "67%", tx: "26vw", ty: "36vh", rot: "14deg", className: "h-12 w-12 rounded-full bg-spectra-2 sm:h-14 sm:w-14" },
  { top: "84%", left: "33%", tx: "-22vw", ty: "38vh", rot: "-8deg", className: "h-14 w-14 rounded-2xl bg-spectra-1 sm:h-16 sm:w-16" },
  { top: "60%", left: "13%", tx: "-42vw", ty: "20vh", rot: "9deg", className: "h-24 w-24 rounded-full bg-accent sm:h-32 sm:w-32" },
];

export function CinematicScroll() {
  return (
    <div>
      {/* ── Act 1 — depth ─────────────────────────────────────────── */}
      <section className={cn(styles.track, styles.act1)} aria-labelledby="act-1">
        <div className={styles.scene}>
          <div className={cn(styles.layer, styles.far)} aria-hidden="true">
            <div className="h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle_at_50%_50%,var(--spectra-4),transparent_65%)] opacity-40 blur-3xl" />
          </div>

          <div className={cn(styles.layer, styles.mid)} aria-hidden="true">
            <div className="relative h-[52vmin] w-[52vmin]">
              <div className="absolute left-0 top-8 h-24 w-24 rounded-full bg-spectra-5/70 blur-xl sm:h-32 sm:w-32" />
              <div className="absolute bottom-4 right-2 h-28 w-28 rounded-full bg-accent/60 blur-xl sm:h-40 sm:w-40" />
            </div>
          </div>

          <div className={cn(styles.layer, styles.near)} aria-hidden="true">
            <div className="relative h-[64vmin] w-[80vmin]">
              <span className="absolute left-2 top-6 h-3 w-3 rounded-full bg-spectra-2" />
              <span className="absolute right-8 top-16 h-2 w-2 rounded-full bg-spectra-3" />
              <span className="absolute bottom-10 left-1/4 h-2.5 w-2.5 rounded-full bg-spectra-1" />
              <span className="absolute bottom-20 right-1/4 h-2 w-2 rounded-full bg-foreground" />
            </div>
          </div>

          <div className={cn(styles.title1, "relative z-10 max-w-3xl px-6 text-center")}>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              Act one — depth
            </p>
            <h2
              id="act-1"
              className="mt-6 font-display text-hero font-semibold text-balance text-foreground"
            >
              Scroll is the timeline.
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
              Three layers, three rates. Distance is the only thing separating
              them, and the scroll decides how far each one travels.
            </p>
          </div>
        </div>
      </section>

      {/* ── Act 2 — the pinned, scrubbed act ──────────────────────── */}
      <section className={cn(styles.track, styles.act2)} aria-labelledby="act-2">
        <div className={styles.scene}>
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
              Act two — scrubbed
            </p>
            <h2
              id="act-2"
              className="mt-6 font-display text-display font-semibold text-balance text-foreground"
            >
              {ACT2_WORDS.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className={cn(styles.word, "inline-block")}
                  style={
                    {
                      "--from": `${14 + i * 6}%`,
                      "--to": `${28 + i * 6}%`,
                    } as CSSProperties
                  }
                >
                  {word}
                  {i < ACT2_WORDS.length - 1 ? " " : ""}
                </span>
              ))}
            </h2>

            <div className="mx-auto mt-10 w-full max-w-sm">
              <div className="h-px w-full overflow-hidden bg-border">
                <div className={cn(styles.meter, "h-px w-full bg-accent")} />
              </div>
              <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">
                Progress is position
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 3 — assembly ──────────────────────────────────────── */}
      <section className={cn(styles.track, styles.act3)} aria-labelledby="act-3">
        <div className={styles.scene}>
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
                    "--from": `${4 + i * 4}%`,
                    "--to": `${40 + i * 4}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          <div
            className={cn(
              styles.title3,
              "relative z-10 max-w-2xl px-6 text-center",
            )}
          >
            <h2
              id="act-3"
              className="font-display text-display font-semibold text-balance text-foreground"
            >
              It assembles.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
              Pinned scenes, scrubbed timelines, and depth — composed entirely
              in CSS, with no scroll listener anywhere.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
