# Spectra

A browser-native studio for generative design and interface engineering. The
work is organized around a single idea: the weight of an interface is in what
runs behind it, not in how it photographs. Each screen is a technique — a
shader, a generative system, a physics loop — rendered live rather than
mocked up.

## Stack

- **Next.js 16** (App Router, Turbopack) with **React 19**
- **TypeScript 6** — see the note below on why not 7
- **Tailwind CSS v4** with a CSS-first, token-driven design system
- **Motion** for orchestration; raw **WebGL2 / GLSL** for the signature field
- Deployed on **Vercel**; the landing prerenders as static content

## Architecture

The project is built in three layers, and the point is that they hold together
as one system rather than a folder of loose screens.

1. **Foundations** — the institutional screens every product needs: landing,
   dashboard, pricing, auth, dense tables, empty and error states.
2. **The system** — design tokens in OKLCH, swappable dark/light themes, a
   fluid type scale, a shared motion language, and accessibility handled at the
   token level: focus-visible rings, AA contrast, reduced-motion, OS color
   scheme.
3. **Techniques** — the rare part. Real-time shaders, generative composition,
   Verlet physics, audio-reactive interfaces. Each one renders in the browser.

The design system lives in [`app/globals.css`](app/globals.css) (tokens and
themes) and [`lib/motion.ts`](lib/motion.ts) (easing and variants). Semantic
tokens are CSS variables; Tailwind utilities re-export them, so a theme swap is
a single attribute change with no recompiled classes.

## The signature field

The hero background is a full-screen WebGL2 fragment shader
([`components/landing/spectra-field.tsx`](components/landing/spectra-field.tsx)):
fractal-noise domain warping colored through a cosine palette, with a
pointer-driven attractor that warps and brightens the field near the cursor. It
is written against the raw WebGL API — no three.js — to keep the landing light
and the technique legible. The loop pauses off-screen and on hidden tabs,
respects `prefers-reduced-motion` by rendering a single static frame, and falls
back to a CSS gradient where WebGL is unavailable.

## Engineering notes

- **TypeScript 6, not 7.** TS 7 (the native compiler) is released, but the lint
  toolchain — `typescript-eslint`, via `eslint-config-next` — does not support
  it yet. The stable line that the whole toolchain agrees on is the right call
  until that lands.
- **Tokens in OKLCH.** Perceptual color space keeps lightness and chroma
  coherent across the dark and light themes and across the brand hue arc.
- **No layout images.** The visual weight comes from shaders, gradients, and
  type — not from raster assets.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint (flat config)
npm run typecheck  # tsc --noEmit
```

## Deployment

Push to a Git provider and import the repository into Vercel. No environment
variables are required for the current scope; the build command and output are
detected automatically.
