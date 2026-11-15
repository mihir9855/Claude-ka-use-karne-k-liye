import pkg from './package.json' with { type: 'json' }
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Builds one self-contained dist/index.html (used by the APK and the browser).
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 4000 },
})
