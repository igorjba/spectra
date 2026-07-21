"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { SpectraField } from "@/components/landing/spectra-field";
import { ButtonLink } from "@/components/ui/button";
import { duration, ease } from "@/lib/motion";

const PILLARS = ["WebGL2", "GLSL", "Real-time", "Zero images"];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden">
      {/* Signature shader — the hero's living background. */}
      <div className="absolute inset-0 -z-10">
        <SpectraField />
        {/* Legibility scrim: strongest at the edges where text sits. */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/20" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_50%,transparent_30%,var(--background)_100%)] opacity-70" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.outExpo }}
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Generative interface studio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slower, ease: ease.outExpo, delay: 0.06 }}
          className="mt-6 max-w-4xl font-display text-mega font-semibold text-balance text-foreground"
        >
          Interfaces, <span className="text-gradient">computed</span> — not
          drawn.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slower, ease: ease.outExpo, delay: 0.14 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          A studio for browser-native interface engineering — shaders,
          generative systems, real-time physics. Each screen is a technique,
          rendered live in front of you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slower, ease: ease.outExpo, delay: 0.22 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <ButtonLink href="/#lab" size="lg">
            Enter the lab
          </ButtonLink>
          <ButtonLink href="/#approach" size="lg" variant="outline">
            Read the approach
          </ButtonLink>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration.slow, ease: ease.outExpo, delay: 0.4 }}
          className="mt-14 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-faint"
        >
          {PILLARS.map((p, i) => (
            <li key={p} className="flex items-center gap-3">
              {i > 0 && <span className="text-border-strong">/</span>}
              {p}
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.a
        href="/#approach"
        aria-label="Scroll to approach"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.slow, delay: 0.6 }}
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center justify-center sm:flex"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-border-strong backdrop-blur-sm transition-colors group-hover:ring-accent">
          <ArrowDown className="h-4 w-4 animate-[float_2.4s_ease-in-out_infinite] text-muted-foreground transition-colors group-hover:text-foreground" />
        </span>
      </motion.a>
    </section>
  );
}
