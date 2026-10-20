import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import './index.css'
import { Root } from '@/app/Shell'
import { warmFonts } from '@/engine/engine.js'

warmFonts()
try { document.documentElement.dataset.style = localStorage.getItem('bt-style') || 'calm' } catch { document.documentElement.dataset.style = 'calm' }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="bt-theme" disableTransitionOnChange>
      <Root />
    </ThemeProvider>
  </StrictMode>,
)
