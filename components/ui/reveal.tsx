"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import { fadeUp, inView, stagger } from "@/lib/motion";

type RevealTag = "div" | "section" | "article" | "ul" | "ol" | "li" | "span";

type RevealProps = HTMLMotionProps<"div"> & {
  as?: RevealTag;
};

/** Fade + rise once on scroll into view. Respects reduced motion via CSS. */
export function Reveal({ as = "div", children, ...props }: RevealProps) {
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Staggered container — direct Reveal children animate in sequence. */
export function RevealGroup({
  as = "div",
  gap = 0.08,
  delay = 0,
  children,
  ...props
}: RevealProps & { gap?: number; delay?: number }) {
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      {...props}
    >
      {children}
    </Comp>
  );
}
