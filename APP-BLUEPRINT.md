# App blueprint: how this app is built (reuse it for the next app)

This is the recipe behind **Brihad Finance**. One React codebase becomes an **Android APK**, a **Windows EXE** and a **single HTML file for the browser**. Data stays on the device and can sync between devices through Firebase. Copy this file into a new project and tell Claude to follow it.

## 1. What the app is made of

| Part | Choice | Why |
|---|---|---|
| UI | React 19 + Vite + TypeScript, Tailwind v4, shadcn/ui (copied sources), motion, recharts | Modern look, no server needed |
| Output | `vite --mode single` with `vite-plugin-singlefile` | The whole app is one `index.html`. APK, EXE and browser all use the same file |
| Data | `localStorage` (one key, JSON) plus a plain-JS "engine" | Works offline, no database to run |
| PDFs | jsPDF, jspdf-autotable, html2canvas (loaded lazily) | Letterhead PDFs in Gujarati, Hindi and English |
| Android | Capacitor 6 + one custom Java plugin | Save to Downloads and the Android print dialog |
| Windows | Electron 31 + electron-builder | Setup and Portable EXE |
| Sync | Firebase Authentication (email and password) + Firestore, called with plain `fetch` | No Firebase SDK, free Spark plan |
| Builds | GitHub Actions | Every push builds the APK and EXE |

## 2. Folder layout

```
web/                      React app
  src/engine/             engine.js (data, documents, PDFs), actions.js (what buttons do), sync.js, *.d.ts
  src/pages, modals, components, desktop, lib
  vite.config.ts          defines __APP_VERSION__ and __BUILD_ID__, single-file mode
android-native/           FileTools.java, MainActivity.java (copied into the Capacitor project by CI)
desktop/                  Electron main.js and package.json
capacitor.config.json     appId, appName, webDir = web/dist-single
.github/workflows/        build-apk.yml, build-exe.yml
SYNC-SETUP.md             one-time Firebase steps
```

## 3. Rules that kept it smooth

1. **Keep logic out of the screens.** Data and documents live in `engine/`, screens only call `actions`. Loose types are fine (`export declare const X: any` in the `.d.ts`). Regenerate the `.d.ts` whenever an export is added.
2. **Show a version number.** `package.json` version plus build date appears at the bottom of Settings ("App version: v1.7.1 · date"). Bump the version on every change the user will test. Most "it is not changed" complaints were an old install.
3. **One desktop layout, one phone layout.** Desktop layout only for `(min-width:1024px) and (hover:hover) and (pointer:fine)`.
4. **Everything optional.** Forms save and make a PDF even when empty. Only things that break accounting are required (amount).
5. **Text in the user's language.** Gujarati is the default document language. Use proper grammar (suffixes like "નું" attach to the word). Ask for a real example sentence instead of guessing.
6. **PDF on phone needs native help.** In a WebView, `d.save()` does nothing. `finishPdf` calls the Java `FileTools` plugin (`saveToDownloads`, `printPdf`). Share uses the Capacitor Filesystem and Share plugins. Keep a browser fallback (`d.save`, `window.open`).
7. **Backups.** "Download backup" saves a `.json` file. Restore accepts a file or pasted text.
8. **Sync.** Per-item merge by id and timestamp, with delete markers. Local data is the source of truth, and sync can be switched off. Setup steps are in `SYNC-SETUP.md`.
9. **Do not change what the user did not ask.** Letterhead, colours and wording were changed only when asked. Ask one short question when the request is unclear.

## 4. Build pipeline

- Web: `cd web && npm ci && npm run build:single` gives `web/dist-single/index.html`.
- APK (`ubuntu`, Node 22, Java 17): build web, `npm install`, `npx cap add android`, copy `android-native/*.java` into `android/app/src/main/java/<package path>/`, make icons with `@capacitor/assets`, `npx cap sync android`, `./gradlew assembleDebug`. Upload `app-debug.apk`.
- EXE (`windows`): build web, copy `dist-single/index.html` to `desktop/app/index.html`, `npx electron-builder --win --publish never`. Upload `desktop/dist/*.exe` (Setup and Portable).
- Workflow `paths:` filters make each build start only when the right files change. Keep the branch name in the workflow `on.push.branches`.
- Windows gotcha: do not use `SINGLE=1 vite build` (env var syntax breaks). Use `vite build --mode single`.

## 5. How it was tested (no phone needed for most things)

- `npm run build`, then `npx vite preview --port 4600`.
- Playwright with the pre-installed Chromium (`executablePath: '/opt/pw-browsers/chromium'`), with seed data written to `localStorage` before the page loads.
- Phone-only features (native plugin, real Firebase) were tested with mocks (`window.Capacitor` stub, a fake Firebase). Tell the user honestly what was not tested on a real device.
- Do not use `pkill -f` in the shell. Start preview with `( cmd & )`.

## 6. Starting prompt for the next app

> Build a new app the same way as `APP-BLUEPRINT.md`: React + Vite single-file build, one engine folder for data and documents, Capacitor APK with the FileTools plugin, Electron EXE, GitHub Actions for both, version label in Settings, Firebase sync setup guide, Download backup. The app is about: **(describe it)**. Name: **(name)**. Languages: **(languages)**. Reply to me in Hinglish and keep answers short.

## 7. Checklist for each new app

- [ ] New `appId` and `appName` in `capacitor.config.json`, Electron `appId` and `productName`.
- [ ] New Firebase project (free Spark plan) and a `SYNC-SETUP.md`.
- [ ] Icon in `assets/` and `desktop/build/icon.ico`.
- [ ] Workflows point at the right branch.
- [ ] Version label visible in Settings.
- [ ] Backup button works.
- [ ] A real-phone test of Download, Print and Share before saying "done".
