import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GenerativeComposition } from "@/components/lab/generative-composition";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("generative");

export const metadata: Metadata = {
  title: "Generative Compositions",
  description:
    "Layouts drawn by rule, not by hand. Every seed produces a new composition from the same algorithm — deterministic, reproducible art.",
};

const NOTES = [
  {
    title: "A seed, not a shuffle",
    body: "Nothing here calls Math.random at draw time. A seed feeds a small deterministic generator, and every decision — where to cut, which module, which color — is drawn from it in order. Type the same seed again and you get the identical composition, pixel for pixel.",
  },
  {
    title: "The layout cuts itself",
    body: "No coordinates are authored. The canvas is split recursively: each rectangle decides whether to divide, along which axis, and at which ratio, favoring the longer side and classical proportions. What's left when the recursion stops are the cells the artwork lives in.",
  },
  {
    title: "Modules and silence",
    body: "Each cell draws one module — an arc, concentric rings, bars, dots, a solid — rotated to one of four orientations and colored from the brand's tokens, so the art re-themes with the site. Empty is the most common module on purpose: the negative space is what makes the rest read as composition.",
  },
];

export default function GenerativePage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Change the seed, or roll a new one"
      notes={NOTES}
    >
      <GenerativeComposition />
    </LabPieceShell>
  );
}
