import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, FilePlus2, FolderPlus, Receipt, Search, Settings as Cog, UserPlus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Logo } from '@/components/app/common'
import { SyncDot, ThemeToggle } from '@/components/app/chrome'
import { Modals } from '@/app/Modals'
import { CommandPalette } from '@/desktop/CommandPalette'
import DHome from '@/desktop/DHome'
import DProjects from '@/desktop/DProjects'
import DPayments from '@/desktop/DPayments'
import DPeople from '@/desktop/DPeople'
import DProposals from '@/desktop/DProposals'
import Settings from '@/pages/Settings'
import { NAV, TITLES } from '@/app/Shell'
import { useData } from '@/lib/store'
import { useSyncState } from '@/lib/sync'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { newEntryForm, newPartyForm, newProjectForm, proposalForm } from '@/engine/actions.js'
import { cn } from '@/lib/utils'

function NewMenu() {
  const { open } = useModal()
  const { D } = useData()
  const it = (icon: ReactNode, label: string, hint: string, fn: () => void) => (
    <DropdownMenuItem onSelect={fn} className="gap-3 rounded-xl py-2.5 text-[14px] font-semibold">{icon}<span className="flex-1">{label}</span><span className="text-xs font-normal text-muted-foreground">{hint}</span></DropdownMenuItem>
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-10 rounded-xl px-4 font-bold"><PlusIcon /> New <ChevronDown className="size-4 opacity-80" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Create</DropdownMenuLabel>
        {it(<Receipt className="size-5 text-expense" />, 'Payment voucher', 'N', () => open('entry', { form: newEntryForm() }))}
        {it(<Wallet className="size-5 text-income" />, 'Client receipt', '', () => open('entry', { form: { ...newEntryForm(), kind: 'in', mode: 'Bank', who: D.projects[0]?.client || '' } }))}
        <DropdownMenuSeparator />
        {it(<FolderPlus className="size-5 text-primary" />, 'New project', '', () => open('project', { form: newProjectForm() }))}
        {it(<UserPlus className="size-5 text-info" />, 'Add person', '', () => open('party', { form: newPartyForm() }))}
        {it(<FilePlus2 className="size-5 text-saffron" />, 'New proposal', '', () => open('proposal', { form: proposalForm() }))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
const PlusIcon = () => <span className="text-lg leading-none">+</span>

export function DesktopShell({ page, id }: { page: string; id?: string }) {
  const { biz, D, DB } = useData()
  const { open, modal } = useModal()
  const sync = useSyncState()
  const [pal, setPal] = useState(false)

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((v) => !v) }
      else if (!typing && !modal && !pal && e.key === 'n') { e.preventDefault(); open('entry', { form: newEntryForm() }) }
      else if (!typing && !modal && !pal && e.key === '/') { e.preventDefault(); setPal(true) }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [modal, pal, open])

  const counts: Record<string, number> = { projects: D.projects.length, payments: DB.txns.filter((t: any) => t.kind !== 'bill').length, people: D.parties.length, proposals: DB.proposals.length }
  const view = {
    home: <DHome />, projects: <DProjects id={id} />, payments: <DPayments />, people: <DPeople id={id} />, proposals: <DProposals />, settings: <Settings />,
  }[page]
  const crumb = page === 'projects' && id && D.byId[id] ? D.byId[id].name : page === 'people' && id && D.pById[id] ? D.pById[id].name : ''
  const last = sync.last ? new Date(sync.last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="grid min-h-dvh grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 flex h-dvh flex-col border-r bg-card">
        <div className="flex items-center gap-3 px-5 pb-4 pt-5"><Logo height={40} /><b className="font-display text-[15px] font-extrabold leading-tight">{biz.name}</b></div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Main">
          <div className="px-3 pb-1 pt-2 text-[11px] font-bold tracking-wider text-muted-foreground">MENU</div>
          {NAV.map((n) => {
            const on = page === n.page
            return (
              <button key={n.page} onClick={() => go(n.page)} className={cn('relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold transition', on ? 'text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                {on ? <motion.span layoutId="d-side" className="absolute inset-0 rounded-xl bg-primary/10" transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }} /> : null}
                {on ? <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-primary" /> : null}
                <n.icon className="relative size-[18px]" /><span className="relative flex-1">{n.label}</span>
                {counts[n.page] ? <span className="relative rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">{counts[n.page]}</span> : null}
              </button>
            )
          })}
        </nav>
        <div className="space-y-2 p-3">
          <button onClick={() => go('settings')} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition', page === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><Cog className="size-[18px]" /> Settings</button>
          <div className="rounded-xl bg-muted px-3 py-2 text-xs"><b className="block">{sync.on ? (sync.err ? 'Sync problem' : sync.busy ? 'Syncing…' : 'Synced') : 'Saved on this PC'}</b><span className="text-muted-foreground">{sync.on ? (sync.err || (last ? 'Last at ' + last : '')) : 'Turn on Sync in Settings'}</span></div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/85 px-8 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="font-display text-lg font-extrabold">{TITLES[page]}</span>
            {crumb ? <><span className="text-muted-foreground">/</span><span className="truncate text-muted-foreground">{crumb}</span></> : null}
          </div>
          <button onClick={() => setPal(true)} className="mx-auto flex h-10 w-full max-w-md items-center gap-3 rounded-xl border bg-card px-3 text-left text-sm text-muted-foreground transition hover:border-primary/40">
            <Search className="size-4" /><span className="flex-1">Search projects, people, vouchers…</span><kbd className="rounded-md border px-1.5 py-0.5 text-[11px]">Ctrl K</kbd>
          </button>
          <div className="flex items-center gap-2"><NewMenu /><SyncDot /><ThemeToggle /></div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-8 py-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>{view}</motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Modals />
      <CommandPalette open={pal} onClose={() => setPal(false)} />
    </div>
  )
}
