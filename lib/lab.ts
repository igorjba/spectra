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
 * O catálogo do laboratório. Cada entrada é uma técnica nativa do navegador,
 * não uma maquete — o ponto é a engenharia por trás dos pixels. O status é
 * honesto: `live` já está no ar, o resto está no caminho.
 */
export const LAB_ENTRIES: LabEntry[] = [
  {
    slug: "spectral-field",
    index: "01",
    title: "Campo Espectral",
    summary:
      "Um fragment shader em tela cheia: ruído fractal com deformação de domínio, colorido por uma rampa cossenoidal e distorcido em tempo real pelo ponteiro.",
    technique: "WebGL2 · GLSL · deformação de domínio",
    status: "live",
  },
  {
    slug: "raymarched-forms",
    index: "02",
    title: "Formas por Raymarching",
    summary:
      "Geometria de campo de distância percorrida pixel a pixel — sólidos que existem apenas como uma função matemática, iluminados e sombreados na GPU.",
    technique: "Raymarching · SDF · iluminação",
    status: "live",
    href: "/lab/raymarched-forms",
  },
  {
    slug: "fluid",
    index: "03",
    title: "Fluido",
    summary:
      "Um solver de fluidos na GPU: advecção, difusão e projeção de pressão sobre um campo de velocidade que o cursor empurra.",
    technique: "Navier–Stokes · ping-pong de FBO",
    status: "live",
    href: "/lab/fluid",
  },
  {
    slug: "verlet",
    index: "04",
    title: "Corpos de Verlet",
    summary:
      "Elementos de interface com massa. A integração de Verlet governa gravidade, molas e colisão — segure, arremesse e veja tudo assentar.",
    technique: "Integração de Verlet · restrições",
    status: "live",
    href: "/lab/verlet",
  },
  {
    slug: "generative",
    index: "05",
    title: "Composições Generativas",
    summary:
      "Layouts desenhados por regra, não à mão. Cada semente produz uma composição nova a partir do mesmo algoritmo — determinística e reproduzível.",
    technique: "PRNG semeado · layout procedural",
    status: "live",
    href: "/lab/generative",
  },
  {
    slug: "cinematic-scroll",
    index: "06",
    title: "Scroll Cinematográfico",
    summary:
      "Uma narrativa que se monta conforme a rolagem — cenas fixadas, linhas do tempo percorridas e profundidade que resolve como uma abertura de filme.",
    technique: "Timelines de rolagem · parallax",
    status: "live",
    href: "/lab/cinematic-scroll",
  },
  {
    slug: "kinetic-type",
    index: "07",
    title: "Tipografia Cinética",
    summary:
      "Fontes variáveis que respiram. Peso, largura e tamanho óptico respondem ao movimento e ao ponteiro; o texto deforma sem quebrar e depois assenta.",
    technique: "Fontes variáveis · animação de eixos",
    status: "live",
    href: "/lab/kinetic-type",
  },
  {
    slug: "audio-reactive",
    index: "08",
    title: "Áudio Reativo",
    summary:
      "A interface escuta. Uma FFT do áudio ao vivo comanda layout, cor e movimento — a tela pulsa e se reorganiza conforme o som.",
    technique: "Web Audio · FFT · análise",
    status: "live",
    href: "/lab/audio-reactive",
  },
];

export const labStatusLabel: Record<LabStatus, string> = {
  live: "No ar",
  building: "Em construção",
  planned: "No caminho",
};

export function getLabEntry(slug: string): LabEntry | undefined {
  return LAB_ENTRIES.find((entry) => entry.slug === slug);
}

/** Entradas anterior e seguinte na ordem do catálogo, circulando nas pontas. */
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
