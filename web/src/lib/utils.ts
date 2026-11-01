import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...a: ClassValue[]) => twMerge(clsx(a))

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtDate = (s: string) => {
  const d = new Date(s + 'T00:00:00')
  return `${d.getDate()} ${MON[d.getMonth()]}`
}
export const fmtMonth = (k: string) => `${MON[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}`
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Saves a text file: Android Downloads through the native plugin, otherwise a normal browser download. */
export async function saveTextFile(name: string, text: string, mime = 'application/json'): Promise<string> {
  const native = (window as unknown as { Capacitor?: { Plugins?: { FileTools?: { saveToDownloads: (o: object) => Promise<{ where: string }> } } } }).Capacitor?.Plugins?.FileTools
  if (native) {
    const data = btoa(unescape(encodeURIComponent(text)))
    const r = await native.saveToDownloads({ name, data, mime })
    return r.where
  }
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'Downloads'
}

const THEME_KEY = 'mileage-theme'
export const getTheme = (): 'light' | 'dark' => {
  try {
    const s = localStorage.getItem(THEME_KEY)
    if (s === 'light' || s === 'dark') return s
  } catch {
    /* ignore */
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
export const setTheme = (t: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', t === 'dark')
  try {
    localStorage.setItem(THEME_KEY, t)
  } catch {
    /* ignore */
  }
}
