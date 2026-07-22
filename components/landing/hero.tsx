"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { duration, ease } from "@/lib/motion";

const PILLARS = ["WebGL2", "GLSL", "Tempo real", "Zero imagens"];

/**
 * Texto de abertura. O shader de fundo pertence à seção que envolve o hero e o
 * catálogo, para que os dois compartilhem o mesmo campo contínuo.
 */
export function HeroCopy() {
  return (
    <div className="relative flex min-h-dvh flex-col justify-center">
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.outExpo }}
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
          Estúdio de interfaces generativas
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slower, ease: ease.outExpo, delay: 0.06 }}
          className="mt-6 max-w-4xl font-display text-mega font-semibold text-balance text-foreground"
        >
          Interfaces <span className="text-gradient">computadas</span> — não
          desenhadas.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slower, ease: ease.outExpo, delay: 0.14 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          Engenharia de interface nativa do navegador — shaders, sistemas
          generativos, física em tempo real. Cada tela é uma técnica,
          renderizada ao vivo na sua frente.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slower, ease: ease.outExpo, delay: 0.22 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <ButtonLink href="/#lab" size="lg">
            Explorar as técnicas
          </ButtonLink>
          <ButtonLink href="/lab/fluid" size="lg" variant="outline">
            Abrir o solver de fluidos
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
        href="/#lab"
        aria-label="Rolar até o catálogo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.slow, delay: 0.6 }}
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center justify-center sm:flex"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-border-strong backdrop-blur-sm transition-colors group-hover:ring-accent">
          <ArrowDown className="h-4 w-4 animate-[float_2.4s_ease-in-out_infinite] text-muted-foreground transition-colors group-hover:text-foreground" />
        </span>
      </motion.a>
    </div>
  );
}
