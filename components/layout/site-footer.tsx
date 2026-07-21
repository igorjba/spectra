import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Lab",
    links: [
      { label: "Field", href: "/#lab" },
      { label: "Motion system", href: "/#system" },
      { label: "Approach", href: "/#approach" },
    ],
  },
  {
    title: "System",
    links: [
      { label: "Design tokens", href: "/#system" },
      { label: "Typography", href: "/#system" },
      { label: "Accessibility", href: "/#system" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "GitHub", href: "https://github.com" },
      { label: "Notes", href: "/#approach" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A browser-native studio for generative design and interface
            engineering.
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
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
        <p>Built in the browser. Rendered in real time.</p>
        <p className="font-mono">© {2026} Spectra</p>
      </div>
    </footer>
  );
}
