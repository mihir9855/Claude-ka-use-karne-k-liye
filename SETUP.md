# Installed toolkit

| Tool | Where |
|---|---|
| motion, animejs, lottie-web, @revideo/* | root `package.json` (`npm install`) |
| shadcn/ui, Magic UI, Motion Primitives, React Bits | `ui/src/components/{ui,magicui,motion-primitives,react-bits}` (Vite + React + Tailwind v4; `cd ui && npm install && npm run dev`) |
| 21st.dev Magic MCP | `.mcp.json` — set `API_KEY_21ST` (get it at https://21st.dev/mcp) |
| ui-ux-pro-max, brand-building (29), logo-design, HyperFrames (4) skills | `.claude/skills/` |
| Manim | Python venv (not committed): `python -m venv venv && venv/bin/pip install manim` (needs libcairo2-dev, libpango1.0-dev, pkg-config, ffmpeg) |

Not installable (reading lists only): awesome-claude-skills (ComposioHQ, travisvn).
open-claude-design: run `curl -fsSL https://github.com/maxritter/open-claude-design/releases/latest/download/install.sh | sh` on your own machine (user-level installer + login).
Note: react-bits files are copied wholesale; only the components you import get type-checked/bundled.
