/*
  The generative system behind /lab/generative.

  Everything here is pure and deterministic: the same seed always yields the
  same composition, on the server or the client, today or a year from now. The
  layout is produced by recursively splitting the canvas and handing each leaf
  a graphic module — no coordinates are authored by hand.
*/

export type ModuleKind =
  | "arc"
  | "rings"
  | "bars"
  | "half"
  | "solid"
  | "dots"
  | "diagonal"
  | "empty";

export type Rotation = 0 | 90 | 180 | 270;

export type Cell = { x: number; y: number; w: number; h: number };

export type GenModule = {
  cell: Cell;
  kind: ModuleKind;
  color: string;
  rotation: Rotation;
  detail: number;
};

export type Composition = {
  seed: number;
  width: number;
  height: number;
  modules: GenModule[];
};

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 675;

/** mulberry32 — small, fast, well-distributed 32-bit PRNG. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = {
  next: () => number;
  range: (min: number, max: number) => number;
  int: (min: number, max: number) => number;
  chance: (p: number) => boolean;
  pick: <T>(items: readonly T[]) => T;
  weighted: <T>(entries: readonly (readonly [T, number])[]) => T;
};

export function createRng(seed: number): Rng {
  const next = mulberry32(seed);
  const range = (min: number, max: number) => min + next() * (max - min);
  return {
    next,
    range,
    int: (min, max) => Math.floor(range(min, max + 1)),
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)]!,
    weighted: (entries) => {
      const total = entries.reduce((sum, [, w]) => sum + w, 0);
      let roll = next() * total;
      for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      return entries[entries.length - 1]![0];
    },
  };
}

// Brand tokens, weighted toward the cool end with warm accents kept rare.
const PALETTE: readonly (readonly [string, number])[] = [
  ["var(--spectra-4)", 30],
  ["var(--spectra-5)", 27],
  ["var(--accent)", 19],
  ["var(--foreground)", 14],
  ["var(--spectra-3)", 7],
  ["var(--spectra-1)", 4],
  ["var(--spectra-2)", 3],
];

const MODULES: readonly (readonly [ModuleKind, number])[] = [
  ["empty", 17], // negative space is a module too — it sets the rhythm
  ["arc", 19],
  ["solid", 13],
  ["bars", 13],
  ["rings", 11],
  ["half", 9],
  ["dots", 10],
  ["diagonal", 8],
];

const SPLIT_RATIOS = [0.5, 0.382, 0.618, 0.333, 0.667, 0.25] as const;
const MIN_CELL = 46;

function subdivide(rng: Rng, cell: Cell, depth: number, out: Cell[]) {
  const shortest = Math.min(cell.w, cell.h);
  const canSplit = depth < 7 && shortest > MIN_CELL * 2;
  // Split eagerly near the root, then taper off so cells vary in scale.
  const splitChance = depth < 3 ? 0.93 : depth < 5 ? 0.72 : 0.45;

  if (!canSplit || !rng.chance(splitChance)) {
    out.push(cell);
    return;
  }

  // Prefer cutting across the longer axis to avoid slivers.
  const vertical = cell.w >= cell.h ? rng.chance(0.78) : rng.chance(0.22);
  const ratio = rng.pick(SPLIT_RATIOS);

  if (vertical) {
    const left = Math.round(cell.w * ratio);
    if (left < MIN_CELL || cell.w - left < MIN_CELL) {
      out.push(cell);
      return;
    }
    subdivide(rng, { ...cell, w: left }, depth + 1, out);
    subdivide(rng, { x: cell.x + left, y: cell.y, w: cell.w - left, h: cell.h }, depth + 1, out);
  } else {
    const top = Math.round(cell.h * ratio);
    if (top < MIN_CELL || cell.h - top < MIN_CELL) {
      out.push(cell);
      return;
    }
    subdivide(rng, { ...cell, h: top }, depth + 1, out);
    subdivide(rng, { x: cell.x, y: cell.y + top, w: cell.w, h: cell.h - top }, depth + 1, out);
  }
}

/** Build a composition for a seed. Pure — safe to call during SSR. */
export function compose(
  seed: number,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
): Composition {
  const rng = createRng(seed);
  const cells: Cell[] = [];
  subdivide(rng, { x: 0, y: 0, w: width, h: height }, 0, cells);

  const modules: GenModule[] = cells.map((cell) => {
    const kind = rng.weighted(MODULES);
    const detail =
      kind === "bars" ? rng.int(3, 7) : kind === "rings" ? rng.int(2, 5) : rng.int(3, 5);
    return {
      cell,
      kind,
      color: rng.weighted(PALETTE),
      rotation: rng.pick([0, 90, 180, 270] as const),
      detail,
    };
  });

  return { seed, width, height, modules };
}

/** A seed the whole app agrees on, so SSR and the first paint match. */
export const DEFAULT_SEED = 4821;

export function randomSeed() {
  return Math.floor(Math.random() * 100000);
}

/** Accepts anything a user might type and lands on a usable seed. */
export function normalizeSeed(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return Math.floor(asNumber) % 1000000;
  }
  // Hash arbitrary text so words work as seeds too.
  let hash = 2166136261;
  for (let i = 0; i < trimmed.length; i++) {
    hash ^= trimmed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 1000000;
}
