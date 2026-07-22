import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Campo",
    links: [
      { label: "Catálogo", href: "/#lab" },
      { label: "Formas por Raymarching", href: "/lab/raymarched-forms" },
      { label: "Fluido", href: "/lab/fluid" },
    ],
  },
  {
    title: "Técnicas",
    links: [
      { label: "Corpos de Verlet", href: "/lab/verlet" },
      { label: "Composições Generativas", href: "/lab/generative" },
      { label: "Scroll Cinematográfico", href: "/lab/cinematic-scroll" },
    ],
  },
  {
    title: "Mais",
    links: [
      { label: "Tipografia Cinética", href: "/lab/kinetic-type" },
      { label: "Áudio Reativo", href: "/lab/audio-reactive" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
];

/*
  Sem borda superior e com o fundo entrando por um degradê: na home o campo
  continua correndo atrás do rodapé e a emenda desaparece, então a página fecha
  como uma superfície só. Nas telas do lab o fundo já é sólido e o efeito é
  imperceptível.
*/
export function SiteFooter() {
  return (
    <footer className="relative bg-linear-to-b from-transparent via-background/70 to-background/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Um estúdio nativo do navegador para design generativo e engenharia
            de interface.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-faint">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    /* py-1 leva o alvo de toque a 24px sem mexer no ritmo visual */
                    className="inline-block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 pb-10 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>Construído no navegador. Renderizado em tempo real.</p>
        <p className="font-mono">© {2026} Spectra</p>
      </div>
    </footer>
  );
}
