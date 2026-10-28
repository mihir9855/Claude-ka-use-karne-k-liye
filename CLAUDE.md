# Notes for working on this repo

**Phone web is the #1 priority.** The owner plays the game in a phone browser (Chrome on Android, via the Render URL). Every change must work well there first; desktop is secondary.

- Design and test mobile-first: widths 360, 390 and 412 px, touch input (taps, finger drags, no hover), no horizontal page scroll, nothing cut off at the right edge.
- Use Playwright with `isMobile`/`hasTouch` for UI checks (Chromium is at `/opt/pw-browsers/chromium`; CDN scripts can be served from local `node_modules` via `page.route`).
- Keep the bottom tab bar (Home, Market, Trade, F&O, Portfolio, Settings) and one-screen-at-a-time layouts; avoid long scrolling pages and multi-line table rows.
- The app is one file (`index.html`) plus `server.js` (no dependencies). Render deploys the branch `ccr-93368cc6-le714c`.
- UI text is English. Do not mention broker names (Zerodha/Kite) anywhere in the UI or docs.
- Live prices come from Yahoo through `server.js`; never fall back to made-up prices once real ones were seen.
