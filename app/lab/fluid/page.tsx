import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FluidField } from "@/components/lab/fluid-field";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("fluid");

export const metadata: Metadata = {
  title: "Fluid",
  description:
    "A GPU fluid solver: advection, diffusion, and pressure projection over a velocity field you can push with your cursor.",
};

const NOTES = [
  {
    title: "Stable fluids on the GPU",
    body: "Velocity, pressure, and dye each live in a floating-point texture. Every step is a full-screen shader pass that reads one texture and writes the next — the fields never leave the GPU. Dragging the pointer injects velocity and color into the flow.",
  },
  {
    title: "Making it incompressible",
    body: "Raw advection lets the fluid compress. Each frame the solver measures the velocity's divergence, then runs a Jacobi pressure solve — twenty iterations ping-ponging between two textures — and subtracts the pressure gradient, leaving a divergence-free field that swirls instead of piling up.",
  },
  {
    title: "Curl and color",
    body: "A vorticity-confinement pass feeds the small rotations back in so the motion stays lively rather than damping to mush. The dye is advected by the same velocity field and dissipates slowly, tinted across the cool end of the spectrum.",
  },
];

export default function FluidPage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Drag across the surface"
      notes={NOTES}
    >
      <FluidField />
    </LabPieceShell>
  );
}
