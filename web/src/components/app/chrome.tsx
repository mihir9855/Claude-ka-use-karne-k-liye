import { useTheme } from 'next-themes'
import { Cloud, CloudOff, Loader2, Moon, Sun } from 'lucide-react'
import { useSyncState } from '@/lib/sync'
import { go } from '@/lib/router'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return (
    <button aria-label="Switch light or dark theme" onClick={() => setTheme(dark ? 'light' : 'dark')} className="grid size-10 place-items-center rounded-full bg-muted text-foreground transition hover:bg-secondary active:scale-95">
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}

export function SyncDot() {
  const s = useSyncState()
  if (!s.on) return null
  return (
    <button aria-label="Sync status" title={s.err || (s.busy ? 'Syncing' : 'Synced')} onClick={() => go('settings')} className="grid size-10 place-items-center rounded-full bg-muted">
      {s.busy ? <Loader2 className="size-[18px] animate-spin text-muted-foreground" /> : s.err ? <CloudOff className="size-[18px] text-expense" /> : <Cloud className="size-[18px] text-income" />}
    </button>
  )
}

