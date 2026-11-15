import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="mx-auto min-h-dvh max-w-xl">
      <App />
    </div>
  </StrictMode>,
)
