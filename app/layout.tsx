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
    default: "Spectra — Generative interface studio",
    template: "%s — Spectra",
  },
  description:
    "A browser-native studio for generative design and interface engineering. Shaders, motion systems, real-time physics, and a design system built to hold them.",
  keywords: [
    "generative design",
    "creative coding",
    "WebGL",
    "GLSL shaders",
    "interface engineering",
    "design system",
    "motion design",
  ],
  authors: [{ name: "Spectra" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Spectra — Generative interface studio",
    description:
      "A browser-native studio for generative design and interface engineering.",
    siteName: "Spectra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spectra — Generative interface studio",
    description:
      "A browser-native studio for generative design and interface engineering.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
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
            className="sr-only left-4 top-4 z-[100] rounded-md bg-elevated px-4 py-2 text-sm font-medium text-foreground shadow-lg ring-1 ring-border-strong focus-visible:not-sr-only focus-visible:fixed"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
