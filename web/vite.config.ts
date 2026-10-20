import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` -> dist/; `npm run build:single` -> one self-contained HTML file (used for APK, EXE and browser).
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
  base: './',
  define: { __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC') },
  plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: single ? 'dist-single' : 'dist', chunkSizeWarningLimit: 2500 },
  }
})
