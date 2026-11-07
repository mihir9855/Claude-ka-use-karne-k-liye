# Motion Playground

A sandbox for animation and UI libraries, kept separate from the Mileage Log app in `web/`.

```bash
cd playground
npm install
npm run dev        # gallery of every component at http://localhost:5173
```

## What's in here

| Library | Where | How it got here |
| --- | --- | --- |
| [Magic UI](https://github.com/magicuidesign/magicui) | `src/components/magicui/` (79) | All `registry:ui` items |
| [React Bits](https://github.com/DavidHDev/react-bits) | `src/components/react-bits/` (218) | All TypeScript + Tailwind variants |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | `src/components/motion-primitives/` (33) | All `components/core` files, plus `src/hooks/` |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | `src/components/ui/`, `components.json` | `shadcn` CLI as a dev dependency, neutral theme in `src/index.css` |
| [Motion](https://github.com/motiondivision/motion) | npm `motion` | Demo in `src/App.tsx` |
| [anime.js](https://github.com/juliangarnier/anime) | npm `animejs` | Demo in `src/App.tsx` |
| [lottie-web](https://github.com/airbnb/lottie-web) | npm `lottie-web` | Demo in `src/App.tsx` (`src/demo/spinner.lottie.json`) |
| [Revideo](https://github.com/midrender/revideo) | `video/revideo/` | Own project (default template, offline scene) |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | `video/hyperframes/` | CLI as a dev dependency, `demo/` composition |
| [Manim](https://github.com/ManimCommunity/manim) | `video/manim/hello.py` | Python, installed outside the repo (see below) |

The gallery lazy-loads each component and renders it with no props. 314 of 330 render that way. The rest need required props (like a word list), and the page says so.

`npm run typecheck` reports about 40 type errors. They're in the upstream component sources (mostly older `motion` and `vgpu` typings). Vite doesn't type-check, so `npm run build` and `npm run dev` work.

## Adding more components

When the registry sites are reachable, use the shadcn CLI:

```bash
npx shadcn@latest add @magicui/marquee
npx shadcn@latest add @react-bits/Magnet-TS-TW
npx shadcn@latest add button
```

When they're blocked, `scripts/add-registry.mjs` installs from local copies of the registry JSON:

```bash
REG_DIR=/path/to/registries node scripts/add-registry.mjs magicui marquee
# REG_DIR holds shadcn/ (ui repo apps/v4/public/r), magicui/ (apps/www/public/r), react-bits/ (public/r)
```

## Video

```bash
# Revideo: writes output/video.mp4
cd video/revideo && npm install && npm run render
# In a container with --single-process trouble, point it at Chromium's headless shell:
#   PUPPETEER_EXECUTABLE_PATH=/path/to/chrome-headless-shell npm run render

# HyperFrames: writes demo/renders/*.mp4 (GSAP is vendored in demo/vendor/, so it renders offline)
cd video/hyperframes && npm install && cd demo && npx hyperframes render

# Manim: needs cairo, pango and ffmpeg on the system
python3 -m venv .venv && .venv/bin/pip install manim
.venv/bin/manim -ql video/manim/hello.py Hello
```
