import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VerletBodies } from "@/components/lab/verlet-bodies";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("verlet");

export const metadata: Metadata = {
  title: "Verlet Bodies",
  description:
    "Interface elements with mass. Verlet integration drives gravity, springs, and collision — grab them, throw them, watch them settle.",
};

const NOTES = [
  {
    title: "Position is the state",
    body: "Each body remembers where it is and where it was a frame ago. Velocity is never stored — it's the difference between the two. Integration becomes a subtraction, and because there's no explicit velocity, the simulation stays stable even when you yank things around.",
  },
  {
    title: "Everything is a constraint",
    body: "Gravity aside, the whole world is solved by nudging positions. Two bodies overlapping are pushed apart by their mass; a spring is a pair asked to keep its length; a wall is a clamp. Relaxing all of them a few times per frame is what makes a stack hold instead of jitter.",
  },
  {
    title: "Grab, throw, settle",
    body: "A held body becomes immovable and tracks the pointer, shoving the others as it goes. Let go and the velocity baked into its last two positions carries it — no throw code, just physics. Then it falls, collides, and comes to rest.",
  },
];

export default function VerletPage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Grab a body and throw it"
      notes={NOTES}
    >
      <VerletBodies />
    </LabPieceShell>
  );
}
