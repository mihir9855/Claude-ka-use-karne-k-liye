---
name: ui-ux-design
description: UI/UX design process and quality checklist for app screens — user flows, layout, visual hierarchy, typography, color tokens, dark mode, mobile-first spacing, interaction states, empty/loading/error states, and accessibility. Use when designing or redesigning any screen, flow, or component, when the user asks for "UI", "UX", "design", "look better", "redesign", or before building a new feature's interface. Pairs with app-ui-motion (for animation) and app-testing (for verification).
---

# UI/UX design skill

Design first, then build. A screen is done only when it is clear, usable on a phone,
accessible, and handles every state — not when it merely looks nice.

## 1. Process

1. **Understand the job.** Who uses this screen, what one task are they doing, what data do they see? Write it in one sentence.
2. **Map the flow.** List the steps (entry → action → confirmation → exit). Remove any step that does not earn its place. Primary action reachable in ≤ 2 taps.
3. **Content before chrome.** List the real content and its priority. Use realistic data (long names, zero values, 100+ rows), never lorem ipsum.
4. **Layout mobile-first** (360–430 px wide), then scale up to tablet/desktop.
5. **Apply the design system** (tokens below). Reuse existing components in `web/src/components` before making new ones.
6. **Design every state** (section 4).
7. **Add motion last** with the `app-ui-motion` skill, then verify with `app-testing`.

## 2. Visual system

**Hierarchy** — one clear focal point per screen. Contrast in size/weight/color, not decoration. Max 2 font families (this project uses Outfit for headings and Manrope for body via `@fontsource-variable`).

**Type scale** (rem): 0.75 · 0.875 · 1 (body) · 1.125 · 1.25 · 1.5 · 2 · 2.5. Body line-height 1.5, headings 1.1–1.25. Line length 45–75 characters. Use `tabular-nums` for numbers in tables/stats.

**Spacing** — 4 px grid: 4, 8, 12, 16, 24, 32, 48, 64. Related items closer than unrelated ones. Screen side gutter 16 px on phones.

**Color** — define tokens, never raw hex in components. With Tailwind v4:
```css
@theme {
  --color-bg: #ffffff;  --color-surface: #f5f7f8;  --color-text: #12181c;
  --color-muted: #5b6770; --color-primary: #0f766e; --color-danger: #dc2626;
}
@media (prefers-color-scheme: dark) { :root { /* redefine the same tokens */ } }
```
- One primary color for actions; semantic colors for success/warning/danger only.
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI borders/icons). Check both light and dark.
- Never use color as the only signal — pair it with an icon or text.

**Shape & depth** — one radius scale (e.g. 8 / 12 / 16 / full) and at most 2 shadow levels. Prefer borders/surfaces over heavy shadows in dark mode.

**Icons** — one set (this project: `lucide-react`), consistent size (16/20/24) and stroke.

## 3. Interaction & mobile UX

- Touch targets ≥ 44×44 px with ≥ 8 px between them. Primary action in the thumb zone (bottom) on phones.
- Every control has hover (desktop), focus-visible, active/pressed, disabled, and loading styles.
- Feedback within 100 ms; show a spinner/skeleton if work takes > 300 ms; toast (this project: `sonner`) for background results.
- Destructive actions: confirm or offer undo. Prefer undo.
- Forms: visible labels (not placeholder-only), correct `inputMode`/`type` (numeric keypad for numbers), inline validation on blur, errors next to the field in plain language, keep user input on error.
- Respect safe areas on Capacitor/Android: `padding-bottom: env(safe-area-inset-bottom)`.
- No horizontal scroll at 360 px. Test landscape too.
- Respect `prefers-reduced-motion`.

## 4. States checklist (design each one)

- [ ] **Empty** — explain what goes here and show the first action button.
- [ ] **Loading** — skeleton matching final layout (no layout jump).
- [ ] **Partial / long content** — truncation with full value available, long words wrap.
- [ ] **Error** — what happened, how to fix it, retry action.
- [ ] **Success** — clear confirmation.
- [ ] **Offline** (mobile) — cached data shown, actions queued or disabled with reason.
- [ ] **First-run / onboarding** — only if truly needed; keep it skippable.

## 5. Accessibility (must-have)

- Semantic HTML: `button` for actions, `a` for navigation, headings in order, `label` for inputs, lists as `ul/ol`.
- Everything works by keyboard; visible focus ring; logical tab order; dialogs trap focus and close on Esc (shadcn/Radix dialogs already do this).
- Icon-only buttons have `aria-label`. Images have `alt` (empty `alt=""` if decorative).
- Charts (recharts) have a text summary or table alternative.
- Text scales to 200% without breaking layout; don't fix heights on text containers.

## 6. Review before handing off

Take screenshots at 360 px, 768 px and 1280 px, light and dark (see `app-testing`), and check:
- Can a new user tell in 5 seconds what the screen is for and what to tap?
- Is there exactly one primary action?
- Are alignment, spacing and type sizes consistent with the scale?
- Do all states from section 4 exist?
- Does it pass the accessibility list?

Report what was checked and any compromise made, with screenshots.
