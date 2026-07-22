import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RaymarchedForms } from "@/components/lab/raymarched-forms";
import { LabPieceShell } from "@/components/lab/lab-piece-shell";
import { getLabEntry } from "@/lib/lab";

const entry = getLabEntry("raymarched-forms");

export const metadata: Metadata = {
  title: "Raymarched Forms",
  description:
    "Signed-distance geometry marched per pixel — 3D shapes that exist only as a distance function, lit and shaded on the GPU.",
};

const NOTES = [
  {
    title: "No mesh, just distance",
    body: "Each shape is a function that returns how far any point in space is from its surface. A sphere, a rounded box, and a torus are three such functions, folded into one body by a smooth minimum that melts them together where they meet.",
  },
  {
    title: "Sphere tracing",
    body: "Every pixel casts a ray and repeatedly steps forward by exactly the distance to the nearest surface — never overshooting. In under a hundred steps the ray lands on the surface, or escapes to the background. No geometry is ever uploaded.",
  },
  {
    title: "Shaded on the GPU",
    body: "The surface normal is read from the gradient of the distance field. From there it's classic lighting: a key light with penumbra-softened shadows, ambient occlusion sampled along the normal, a specular highlight, and a fresnel rim — all per pixel.",
  },
];

export default function RaymarchedFormsPage() {
  if (!entry) notFound();

  return (
    <LabPieceShell
      entry={entry}
      interactionHint="Move to orbit the camera"
      notes={NOTES}
    >
      <RaymarchedForms />
    </LabPieceShell>
  );
}
