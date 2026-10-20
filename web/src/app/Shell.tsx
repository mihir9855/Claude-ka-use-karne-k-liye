import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { toast as sonner } from 'sonner'
import { useTheme } from 'next-themes'
import { Cloud, CloudOff, FileText, Home as HomeIcon, Landmark, Moon, Plus, Receipt, Settings as Cog, Sun, UserPlus, Users, Wallet, FolderPlus, FilePlus2, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Toaster } from '@/components/ui/sonner'
import { Logo } from '@/components/app/common'
import { useData } from '@/lib/store'
import { useSyncState } from '@/lib/sync'
import { useRoute, go } from '@/lib/router'
import { ModalProvider, useModal } from '@/app/modal'
import { Modals } from '@/app/Modals'
import { setCopyHandler, setToastHandler } from '@/engine/engine.js'
import { newEntryForm, newPartyForm, newProjectForm, proposalForm, undo } from '@/engine/actions.js'
import Home from '@/pages/Home'
import Projects from '@/pages/Projects'
import Payments from '@/pages/Payments'
import People from '@/pages/People'
import Proposals from '@/pages/Proposals'
import Settings from '@/pages/Settings'
import { cn } from '@/lib/utils'

const NAV = [
  { page: 'home', label: 'Home', icon: HomeIcon },
  { page: 'projects', label: 'Projects', icon: Landmark },
  { page: 'payments', label: 'Payments', icon: Wallet },
  { page: 'people', label: 'People', icon: Users },
  { page: 'proposals', label: 'Proposals', icon: FileText },
] as const

const TITLES: Record<string, string> = { home: 'Home', projects: 'Projects', payments: 'Payments', people: 'People', proposals: 'Proposals', settings: 'Settings' }

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return (
    <button aria-label="Switch light or dark theme" onClick={() => setTheme(dark ? 'light' : 'dark')} className="grid size-10 place-items-center rounded-full bg-muted text-foreground transition hover:bg-secondary active:scale-95">
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}

function SyncDot() {
  const s = useSyncState()
  if (!s.on) return null
  return (
    <button aria-label="Sync status" title={s.err || (s.busy ? 'Syncing' : 'Synced')} onClick={() => go('settings')} className="grid size-10 place-items-center rounded-full bg-muted">
      {s.busy ? <Loader2 className="size-[18px] animate-spin text-muted-foreground" /> : s.err ? <CloudOff className="size-[18px] text-expense" /> : <Cloud className="size-[18px] text-income" />}
    </button>
  )
}

function Fab() {
  const { open } = useModal()
  const { D } = useData()
  const item = (icon: ReactNode, label: string, fn: () => void) => (
    <DropdownMenuItem onSelect={fn} className="gap-3 rounded-xl py-2.5 text-[15px] font-semibold">{icon}{label}</DropdownMenuItem>
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Add" className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-30 grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8">
          <Plus className="size-7" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Add new</DropdownMenuLabel>
        {item(<Receipt className="size-5 text-expense" />, 'Payment voucher', () => open('entry', { form: newEntryForm() }))}
        {item(<Wallet className="size-5 text-income" />, 'Client receipt', () => open('entry', { form: { ...newEntryForm(), kind: 'in', mode: 'Bank', who: D.projects[0]?.client || '' } }))}
        <DropdownMenuSeparator />
        {item(<FolderPlus className="size-5 text-primary" />, 'New project', () => open('project', { form: newProjectForm() }))}
        {item(<UserPlus className="size-5 text-info" />, 'Add person', () => open('party', { form: newPartyForm() }))}
        {item(<FilePlus2 className="size-5 text-saffron" />, 'New proposal', () => open('proposal', { form: proposalForm() }))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Body() {
  const r = useRoute()
  const { biz } = useData()
  const page = TITLES[r.page] ? r.page : 'home'
  const key = page + (r.id || '')
  const view = {
    home: <Home />,
    projects: <Projects id={r.id} />,
    payments: <Payments />,
    people: <People id={r.id} />,
    proposals: <Proposals />,
    settings: <Settings />,
  }[page]

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-1 border-r bg-card p-4 lg:flex">
        <div className="mb-4 flex items-center gap-3 px-2 pt-1"><Logo height={38} /><b className="font-display text-[15px] font-extrabold leading-tight">{biz.name}</b></div>
        {[...NAV, { page: 'settings', label: 'Settings', icon: Cog }].map((n) => {
          const on = page === n.page
          return (
            <button key={n.page} onClick={() => go(n.page)} className={cn('relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold transition', on ? 'text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              {on ? <motion.span layoutId="side-pill" className="absolute inset-0 -z-0 rounded-2xl bg-primary shadow-md" transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }} /> : null}
              <n.icon className="relative size-5" /><span className="relative">{n.label}</span>
            </button>
          )
        })}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="safe-t sticky top-0 z-20 border-b bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex items-center gap-2.5 lg:hidden"><Logo height={30} /><span className="font-display text-lg font-extrabold">{TITLES[page]}</span></div>
            <span className="font-display hidden text-lg font-extrabold lg:block">{TITLES[page]}</span>
            <div className="flex items-center gap-2">
              <SyncDot />
              <button aria-label="Settings" onClick={() => go('settings')} className={cn('grid size-10 place-items-center rounded-full bg-muted lg:hidden', page === 'settings' && 'bg-primary text-primary-foreground')}><Cog className="size-[18px]" /></button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-40 pt-5 lg:px-8 lg:pb-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              {view}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="safe-b fixed inset-x-0 bottom-0 z-30 border-t bg-card/90 backdrop-blur-xl lg:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-1 pt-1.5">
          {NAV.map((n) => {
            const on = page === n.page
            return (
              <button key={n.page} onClick={() => go(n.page)} className={cn('relative flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition', on ? 'text-primary' : 'text-muted-foreground')}>
                {on ? <motion.span layoutId="tab-pill" className="absolute inset-x-2 top-0 h-8 rounded-xl bg-primary/10" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} /> : null}
                <n.icon className="relative mt-1 size-[22px]" /><span className="relative">{n.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      <Fab />
      <Modals />
    </div>
  )
}

export default function Shell() {
  const { open } = useModal()
  useEffect(() => {
    setToastHandler((msg: string, canUndo?: boolean) => {
      if (canUndo) sonner(msg, { duration: 9000, action: { label: 'Undo', onClick: () => undo() } })
      else sonner(msg, { duration: 3500 })
    })
    setCopyHandler((text: string) => open('copy', { text }))
  }, [open])
  return (
    <>
      <Body />
      <Toaster position="top-center" offset={{ top: 72 }} mobileOffset={{ top: 64 }} />
    </>
  )
}

export function Root() {
  return (
    <ModalProvider>
      <Shell />
    </ModalProvider>
  )
}
