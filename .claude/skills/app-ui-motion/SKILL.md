---
name: app-ui-motion
description: Build polished, animated app UIs (React/Vite/Next, web or Capacitor) using shadcn/ui, Magic UI, React Bits, Motion Primitives, Motion (Framer Motion), and Anime.js — plus video/explainer output with HyperFrames or Manim. Use when the user asks to make an app, screen, landing page, component, or animation, or mentions any of these libraries.
---

# App UI + Motion skill

Pick the **smallest** tool that does the job. Add packages to the app only when a
feature actually needs them — never install the whole list up front.

## 1. Decide what to use

| Need | Use | Source |
|---|---|---|
| Base components (button, dialog, form, table, sheet…) | **shadcn/ui** | github.com/shadcn-ui/ui |
| Eye-catching marketing pieces (marquee, globe, bento grid, shimmer button, number ticker, particles) | **Magic UI** | github.com/magicuidesign/magicui |
| Creative text/background effects (SplitText, Aurora, Squares, BlurText, animated cursors) | **React Bits** | github.com/DavidHDev/react-bits |
| Small, tasteful motion pieces (text effect, morphing dialog, animated group, in-view, transition panel) | **Motion Primitives** | github.com/ibelick/motion-primitives |
| Custom React animations, gestures, layout/shared-element transitions, exit animations | **Motion** (`motion`, formerly Framer Motion) | github.com/motiondivision/motion |
| Timeline / SVG path / stagger animations, framework-agnostic or vanilla JS | **Anime.js** | github.com/juliangarnier/anime |
| Generate components from a prompt via MCP | **21st MCP (Magic MCP)** | github.com/21st-dev/magic-mcp |
| Render an app promo / explainer **video** from HTML | **HyperFrames** | github.com/heygen-com/hyperframes |
| Math / technical explainer animations (Python) | **Manim** | github.com/ManimCommunity/manim |

Rules of thumb:
- Start with shadcn/ui for structure; layer Magic UI / React Bits / Motion Primitives only for hero or delight moments.
- Use **one** animation engine per app where possible (prefer Motion in React; Anime.js for non-React or complex timelines).
- Respect `prefers-reduced-motion` (Motion: `useReducedMotion()`; CSS: `@media (prefers-reduced-motion: reduce)`).
- Animate `transform` and `opacity` only; avoid animating layout properties in loops. Keep UI transitions 150–300 ms.
- For Capacitor/mobile builds, keep heavy effects (WebGL backgrounds, particles) off low-end screens or behind a toggle.

## 2. Setup (only when needed)

All the component libraries (Magic UI, React Bits, Motion Primitives) are copy-in
source distributed through the shadcn CLI, so shadcn must be initialised first in
a Tailwind + TypeScript project:

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog
```

Add components from the other registries (check each site for the exact name):

```bash
# Magic UI
npx shadcn@latest add "https://magicui.design/r/marquee.json"
# React Bits (TS + Tailwind flavour)
npx shadcn@latest add @react-bits/SplitText-TS-TW
# or: npx jsrepo@latest add https://reactbits.dev/r/SplitText-TS-TW
# Motion Primitives
npx shadcn@latest add "https://motion-primitives.com/c/text-effect.json"
```

Animation engines:

```bash
npm i motion      # import { motion, AnimatePresence } from "motion/react"
npm i animejs     # import { animate, stagger, createTimeline } from "animejs"  (v4 API)
```

Optional tooling (ask the user first — needs accounts/keys or extra runtimes):
- 21st MCP: `npx @21st-dev/cli@latest init --client claude` (needs `API_KEY_21ST` from 21st.dev/mcp).
- HyperFrames: `npx hyperframes init my-video`, `npx hyperframes preview`, `npx hyperframes render` (MP4).
- Manim: Python + ffmpeg + LaTeX; `pip install manim`, then `manim -pql scene.py MyScene`.

## 3. Core patterns

**Motion — enter/exit + layout**
```tsx
import { motion, AnimatePresence } from "motion/react";

<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  )}
</AnimatePresence>

<motion.li layout layoutId={item.id} />   // smooth reorder / shared element
<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} />
```

**Motion — scroll-in list with stagger**
```tsx
const list = { show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
<motion.ul variants={list} initial="hidden" whileInView="show" viewport={{ once: true }}>
  {rows.map(r => <motion.li key={r.id} variants={item}>{r.name}</motion.li>)}
</motion.ul>
```

**Anime.js v4 — timeline**
```ts
import { animate, createTimeline, stagger } from "animejs";
animate(".card", { y: [16, 0], opacity: [0, 1], delay: stagger(60), duration: 400 });
createTimeline().add(".logo", { scale: [0.8, 1] }).add(".title", { opacity: [0, 1] }, "-=200");
```
In React, run Anime.js inside `useEffect` on a ref and revert/pause it on cleanup.

## 4. Workflow

1. Read the existing app (`package.json`, Tailwind config, `components/`) and reuse what is there.
2. Choose libraries from the table; install only what the current feature needs.
3. Build structure with shadcn/ui, then add motion.
4. Run the app (use the `run` skill) and check on phone width and with reduced motion.
5. Keep bundle lean: no unused registry components, no second animation engine without reason.
