export type Rgb = [number, number, number];

/*
  Ponte entre os tokens do design system e o que pinta fora do CSS — canvas 2D
  e shaders. Os tokens são declarados em oklch, e getComputedStyle devolve a
  string original em vez de um valor resolvido, então a conversão é feita
  pintando a cor em um canvas 1×1 e lendo o pixel: é o único caminho que
  acompanha qualquer espaço de cor que o navegador aceite.

  As leituras são cacheadas por tema. Trocar de tema invalida o cache, e nada
  disso roda por quadro.
*/

let probe: CanvasRenderingContext2D | null = null;
let cache = new Map<string, Rgb>();
let cacheTheme = "";

function context(): CanvasRenderingContext2D | null {
  if (probe) return probe;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  probe = canvas.getContext("2d", { willReadFrequently: true });
  return probe;
}

/** Resolve uma custom property de cor para RGB no intervalo 0..1. */
export function readThemeRgb(name: string, fallback: Rgb = [0, 0, 0]): Rgb {
  if (typeof document === "undefined") return fallback;

  const theme = document.documentElement.dataset.theme ?? "";
  if (theme !== cacheTheme) {
    cache = new Map();
    cacheTheme = theme;
  }
  const cached = cache.get(name);
  if (cached) return cached;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const ctx = context();
  if (!value || !ctx) return fallback;

  /*
    fillStyle descarta em silêncio o que não sabe ler, mantendo o valor
    anterior. Uma sentinela improvável revela isso: se a cor pintada for
    idêntica a ela, o token não foi entendido e o fallback vale — sem essa
    checagem, um nome de token errado passaria despercebido como preto.
  */
  const SENTINEL = "#010203";
  ctx.fillStyle = SENTINEL;
  ctx.fillStyle = value;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);

  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a === 0) return fallback;
  if (r === 1 && g === 2 && b === 3) return fallback;

  const rgb: Rgb = [r! / 255, g! / 255, b! / 255];
  cache.set(name, rgb);
  return rgb;
}

/** Interpolação linear entre duas cores, em sRGB. */
export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/**
 * Percorre uma rampa de cores. `t` de 0 a 1 atravessa a lista inteira; usado
 * para mapear grandezas contínuas (frequência, massa) na paleta da marca.
 */
export function rampRgb(stops: Rgb[], t: number): Rgb {
  if (stops.length === 0) return [0, 0, 0];
  if (stops.length === 1) return stops[0]!;
  const clamped = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
  const i = Math.min(Math.floor(clamped), stops.length - 2);
  return mixRgb(stops[i]!, stops[i + 1]!, clamped - i);
}

/** Serializa para CSS, com alfa opcional. */
export function cssRgb([r, g, b]: Rgb, alpha = 1): string {
  const to255 = (v: number) => Math.round(Math.min(Math.max(v, 0), 1) * 255);
  return `rgb(${to255(r)} ${to255(g)} ${to255(b)} / ${alpha})`;
}

/** A rampa espectral da marca, do frio ao quente. */
export function spectraRamp(): Rgb[] {
  return [
    readThemeRgb("--spectra-4", [0.18, 0.45, 0.85]),
    readThemeRgb("--accent", [0.55, 0.4, 0.95]),
    readThemeRgb("--spectra-5", [0.75, 0.35, 0.9]),
  ];
}
