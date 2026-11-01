# Mileage Log

Same recipe as the Brihad Finance blueprint (see APP-BLUEPRINT.md in that zip).
React + Vite + Tailwind v4 -> one `index.html` (works in browser, APK, EXE). Data stays in localStorage. Backup = JSON file.

- Build: `cd web && npm ci && npm run build:single` -> `web/dist-single/index.html`
- APK / EXE: push to GitHub (branch `main`); Actions build both (`.github/workflows`).
- Logic: `web/src/engine/engine.ts` (average = km between full tanks / fuel in between; partial fills are carried to the next full one).
- Version label: Settings, bottom.
