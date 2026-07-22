import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CinematicScroll } from "@/components/lab/cinematic-scroll";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("cinematic-scroll");

export const metadata: Metadata = {
  title: "Cinematic Scroll",
  description:
    "A narrative that assembles as you scroll — pinned scenes, scrubbed timelines, and depth that resolves like a title sequence.",
};

const NOTES = [
  {
    title: "Pinned, not parked",
    body: "Each act is a tall scroll track wrapping one sticky scene. The track's height is the act's duration: the scene sticks to the viewport while the page keeps scrolling past it, which is what buys the time for anything to happen.",
  },
  {
    title: "Scrubbed, not timed",
    body: "The track declares a named view-timeline and the elements inside attach to it, so their progress is the scroll's progress. Nothing plays on a clock — scroll back and the sequence runs backward, frame for frame, because each frame is a position rather than a moment.",
  },
  {
    title: "No listener, no JavaScript",
    body: "There is no scroll handler on this page, and no client bundle for the piece at all: it is HTML and CSS. The animations run on the compositor, so they stay smooth under load. Where scroll timelines aren't supported, or motion is turned down, every element is simply left in its final visible state.",
  },
];

export default function CinematicScrollPage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Scroll to run the sequence"
      notes={NOTES}
      stage="flow"
    >
      <CinematicScroll />
    </LabPieceShell>
  );
}
