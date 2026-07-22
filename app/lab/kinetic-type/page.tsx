import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import { notFound } from "next/navigation";

import { KineticType } from "@/components/lab/kinetic-type";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

/*
  Loaded here rather than in the root layout: this is the only route that needs
  a multi-axis variable font, and the rest of the site shouldn't pay for it.
*/
const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  axes: ["wdth", "opsz", "GRAD"],
  display: "swap",
});

const entry = getLabEntry("kinetic-type");

export const metadata: Metadata = {
  title: "Kinetic Type",
  description:
    "Variable fonts that breathe. Weight, width, and optical size respond to motion and input; text deforms and reflows without breaking.",
};

const NOTES = [
  {
    title: "Axes, not weights",
    body: "A variable font isn't a family of cuts — it's a continuous design space. Roboto Flex exposes weight from 100 to 1000, width from 25 to 151, and optical size from 8 to 144, and every glyph on this screen sits at its own point in that space, moving through it frame by frame.",
  },
  {
    title: "Energy per glyph",
    body: "Each character holds a value between zero and one: the pointer's proximity, falling off on a gaussian curve, with a slow wave travelling down the line whenever nobody is near. That single number is mapped onto three axes at once, so letters thicken and widen together.",
  },
  {
    title: "Cheap enough to run",
    body: "Changing font-variation-settings relayouts text, so the loop avoids doing anything twice. Glyph centres are measured once and on resize — never per frame — the pointer only records a position, and one animation frame writes an eased custom property per glyph. Reduced motion gets a settled, static state instead.",
  },
];

export default function KineticTypePage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Move across the letters"
      notes={NOTES}
    >
      <KineticType fontClassName={robotoFlex.className} />
    </LabPieceShell>
  );
}
