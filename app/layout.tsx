import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { ThemeProvider, themeInitScript } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = "https://spectra.studio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spectra — Estúdio de interfaces generativas",
    template: "%s — Spectra",
  },
  description:
    "Um estúdio nativo do navegador para design generativo e engenharia de interface. Shaders, sistemas de movimento, física em tempo real e um design system para sustentá-los.",
  keywords: [
    "design generativo",
    "creative coding",
    "WebGL",
    "shaders GLSL",
    "engenharia de interface",
    "design system",
    "design de movimento",
  ],
  authors: [{ name: "Spectra" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Spectra — Estúdio de interfaces generativas",
    description:
      "Um estúdio nativo do navegador para design generativo e engenharia de interface.",
    siteName: "Spectra",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectra — Estúdio de interfaces generativas",
    description:
      "Um estúdio nativo do navegador para design generativo e engenharia de interface.",
  },
  robots: { index: true, follow: true },
};

/*
  A meta theme-color não aceita var(), então estes são os dois valores de
  --background resolvidos em sRGB. São a única cor literal do projeto; ao mexer
  no token, atualize aqui também.
*/
export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090a0f" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfe" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          // Resolves the theme before paint; see theme-provider.tsx.
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <a
            href="#main"
            /* not-sr-only zera o padding, então o alvo é remontado no foco */
            className="sr-only left-4 top-4 z-100 rounded-md bg-elevated text-sm font-medium text-foreground shadow-lg ring-1 ring-border-strong focus-visible:not-sr-only focus-visible:fixed focus-visible:px-4 focus-visible:py-2.5"
          >
            Ir para o conteúdo
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
