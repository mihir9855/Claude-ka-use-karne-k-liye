import pkg from './package.json' with { type: 'json' }
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build`      -> dist/index.html: one self-contained file (the downloadable HTML, voices inside).
// `npm run build:apk`  -> dist/ with the voice clips as separate files (smaller, faster start in the APK).
export default defineConfig(({ mode }) => {
  const apk = mode === 'apk'
  return {
    base: './',
    define: { __APP_VERSION__: JSON.stringify(pkg.version) },
    plugins: [react(), tailwindcss(), ...(apk ? [] : [viteSingleFile()])],
    build: {
      outDir: 'dist',
      // Also run on older phones (Chrome / Android WebView 80+).
      target: ['es2019', 'chrome80'],
      assetsInlineLimit: apk ? 0 : undefined,
      chunkSizeWarningLimit: 8000,
    },
  }
})
