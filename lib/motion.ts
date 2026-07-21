import type { Transition, Variants } from "motion/react";

/**
 * Motion design tokens. Easing curves mirror the CSS custom properties in
 * globals.css so JS-driven and CSS-driven motion feel like one system.
 */
export const ease = {
  outQuart: [0.25, 1, 0.5, 1],
  outExpo: [0.16, 1, 0.3, 1],
  outBack: [0.34, 1.56, 0.64, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
} as const;

export const duration = {
  fast: 0.18,
  base: 0.3,
  slow: 0.6,
  slower: 0.9,
} as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

/** Fade + rise, the default entrance for content blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.outExpo },
  },
};

/** Container that reveals its children in sequence. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Shared viewport config: play once, trigger a little before fully in view. */
export const inView = {
  once: true,
  margin: "0px 0px -12% 0px",
} as const;
