export type LabStatus = "live" | "building" | "planned";

export type LabEntry = {
  slug: string;
  index: string;
  title: string;
  summary: string;
  technique: string;
  status: LabStatus;
  /** Set once a technique has its own page. */
  href?: string;
};

/**
 * The lab catalog. Each entry is a browser-native technique, not a mockup —
 * the point is the engineering behind the pixels. Status is honest: `live`
 * ships today, the rest are on the build path.
 */
export const LAB_ENTRIES: LabEntry[] = [
  {
    slug: "spectral-field",
    index: "01",
    title: "Spectral Field",
    summary:
      "A full-screen fragment shader: fractal-noise domain warping colored through a cosine palette, warped in real time by the pointer.",
    technique: "WebGL2 · GLSL · domain warping",
    status: "live",
  },
  {
    slug: "raymarched-forms",
    index: "02",
    title: "Raymarched Forms",
    summary:
      "Signed-distance geometry marched per pixel — 3D shapes that exist only as a distance function, lit and shaded on the GPU.",
    technique: "Raymarching · SDF · lighting",
    status: "live",
    href: "/lab/raymarched-forms",
  },
  {
    slug: "fluid",
    index: "03",
    title: "Fluid",
    summary:
      "A GPU fluid solver: advection, diffusion, and pressure projection over a velocity field you can push with your cursor.",
    technique: "Navier–Stokes · FBO ping-pong",
    status: "live",
    href: "/lab/fluid",
  },
  {
    slug: "verlet",
    index: "04",
    title: "Verlet Bodies",
    summary:
      "Interface elements with mass. Verlet integration drives gravity, springs, and collision — grab them, throw them, watch them settle.",
    technique: "Verlet integration · constraints",
    status: "live",
    href: "/lab/verlet",
  },
  {
    slug: "generative",
    index: "05",
    title: "Generative Compositions",
    summary:
      "Layouts drawn by rule, not by hand. Every reload seeds a new composition from the same algorithm — deterministic, reproducible art.",
    technique: "Seeded RNG · procedural layout",
    status: "live",
    href: "/lab/generative",
  },
  {
    slug: "cinematic-scroll",
    index: "06",
    title: "Cinematic Scroll",
    summary:
      "A narrative that assembles as you scroll — pinned scenes, scrubbed timelines, and depth that resolves like a title sequence.",
    technique: "Scroll-linked timelines · parallax",
    status: "planned",
  },
  {
    slug: "kinetic-type",
    index: "07",
    title: "Kinetic Type",
    summary:
      "Variable fonts that breathe. Weight, width, and optical size respond to motion and input; text deforms and reflows without breaking.",
    technique: "Variable fonts · axis animation",
    status: "planned",
  },
  {
    slug: "audio-reactive",
    index: "08",
    title: "Audio-Reactive",
    summary:
      "The interface listens. An FFT of live audio drives layout, color, and motion — the screen pulses and reorganizes to sound.",
    technique: "Web Audio · FFT · analysis",
    status: "planned",
  },
];

export const labStatusLabel: Record<LabStatus, string> = {
  live: "Live",
  building: "In progress",
  planned: "On the path",
};

export function getLabEntry(slug: string): LabEntry | undefined {
  return LAB_ENTRIES.find((entry) => entry.slug === slug);
}

/** Previous and next entries in catalog order, wrapping around the ends. */
export function labNeighbors(slug: string): {
  prev: LabEntry;
  next: LabEntry;
} | null {
  const i = LAB_ENTRIES.findIndex((entry) => entry.slug === slug);
  if (i === -1) return null;
  const count = LAB_ENTRIES.length;
  return {
    prev: LAB_ENTRIES[(i - 1 + count) % count]!,
    next: LAB_ENTRIES[(i + 1) % count]!,
  };
}
