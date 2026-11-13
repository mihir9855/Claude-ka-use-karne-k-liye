---
name: app-testing
description: Testing and QA for the app — type checks, build checks, unit/component tests (Vitest + React Testing Library), end-to-end and visual tests (Playwright), accessibility checks (axe), responsive/dark-mode screenshots, and Android/Capacitor release checks. Use when the user asks to test, verify, QA, check for bugs, add tests, or before shipping a feature, APK or EXE build.
---

# App testing skill

Goal: prove a change works and didn't break anything, and report results honestly
(show failing output; never skip or delete a test to get green).

Project layout: React + Vite + TypeScript app in `web/` (`npm run build` runs `tsc -b`
then Vite). Android via Capacitor (`capacitor.config.json`, `.github/workflows/build-apk.yml`),
desktop via `desktop/` (`build-exe.yml`).

## 1. Always run (no installs needed)

```bash
cd web && npm ci        # only if node_modules is missing
cd web && npx tsc -b    # type errors
cd web && npm run build # production build must pass
cd web && npm run build:single   # the build the APK workflow uses
```

## 2. Test layers — add only when needed

Adding a test framework changes `package.json`, so **ask the user before installing** the first time.

| Layer | Tool | When |
|---|---|---|
| Logic (calculations, parsing, `web/src/engine`, `web/src/lib`) | **Vitest** | Any pure function with rules or math |
| Components | **Vitest + @testing-library/react + jsdom** | Forms, sheets, conditional rendering |
| Full user flows, screenshots | **Playwright** | Critical paths (add entry, edit, delete, export) |
| Accessibility | **@axe-core/playwright** | Every main screen |

Setup when approved:
```bash
cd web && npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
cd web && npm i -D @playwright/test @axe-core/playwright
```
Add scripts: `"test": "vitest run"`, `"test:e2e": "playwright test --trace off"`.
In `vite.config.ts` add `test: { environment: "jsdom", setupFiles: "./src/test/setup.ts" }`
(setup file: `import "@testing-library/jest-dom/vitest";`).

In this cloud environment Chromium + Playwright are preinstalled: if the project pins
its own `@playwright/test`, launch with `executablePath: '/opt/pw-browsers/chromium'`.
Never run `playwright install`.

## 3. Writing good tests

**Unit (Vitest)** — test behaviour and edge cases: zero, negative, empty, very large, decimals, dates across month/year boundaries, invalid input.
```ts
import { describe, it, expect } from "vitest";
describe("mileage", () => {
  it("handles zero distance", () => { expect(calc(0, 10)).toBe(0); });
});
```

**Component** — query like a user (`getByRole`, `getByLabelText`), not by class names.
```tsx
render(<AddSheet open onSave={onSave} />);
await userEvent.type(screen.getByLabelText(/litres/i), "12.5");
await userEvent.click(screen.getByRole("button", { name: /save/i }));
expect(onSave).toHaveBeenCalled();
```

**E2E (Playwright)** — run against `vite preview` (build first) or `vite dev`.
```ts
test("add an entry", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /add/i }).click();
  // fill, save, assert the new row is visible
});
```
Mock time/storage for determinism; clear `localStorage` between tests.

**Accessibility**
```ts
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

## 4. Visual / responsive check (quick, no test framework needed)

Use the preinstalled Playwright from a scratch script to screenshot each main screen at
360×800, 768×1024 and 1280×800, with `colorScheme: 'light'` and `'dark'`, and with
`reducedMotion: 'reduce'`. Look for: horizontal scroll, overlapping/cut text,
low contrast, tiny tap targets, layout jump while loading, console errors
(`page.on('console')` / `page.on('pageerror')`). Use deviceScaleFactor 2 for screenshots shown to the user.

## 5. Manual QA checklist

- [ ] Every flow: happy path, cancel midway, invalid input, empty data, lots of data
- [ ] Data survives reload / app restart; old saved data still loads after the change (migration)
- [ ] Keyboard only, and with screen-reader labels on icon buttons
- [ ] Offline behaviour (mobile)
- [ ] Android: back button, safe areas, soft keyboard not hiding inputs, file save/print (`android-native/FileTools.java`)
- [ ] No console errors or warnings

## 6. Before a release (APK / EXE)

1. Steps in section 1 pass; all tests pass.
2. Bump `version` in `web/package.json` if the release should show a new version.
3. Push to the branch; check the GitHub Actions run (`build-apk.yml` / `build-exe.yml`) and read its logs on failure.

## 7. Report

State exactly what ran and the result: commands, pass/fail counts, screenshots, and anything not tested and why.
