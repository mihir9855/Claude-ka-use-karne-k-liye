import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` -> dist/ (APK and EXE use this); `npm run build:single` -> one self-contained HTML file.
const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: single ? 'dist-single' : 'dist', chunkSizeWarningLimit: 2500 },
})
