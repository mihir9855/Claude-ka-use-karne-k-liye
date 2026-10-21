import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Banknote, FileText, Landmark, Search, Users } from 'lucide-react'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { INR, PT, fmt, godDisp } from '@/engine/engine.js'

type Item = { key: string; icon: any; title: string; sub: string; run: () => void }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { D, DB } = useData()
  const { open: openModal } = useModal()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => ref.current?.focus(), 30) } }, [open])

  const items = useMemo<Item[]>(() => {
    const all: Item[] = []
    D.projects.forEach((p: any) => all.push({ key: 'p' + p.id, icon: Landmark, title: p.name, sub: `Project · ${p.client || 'no client'}`, run: () => go('projects', p.id) }))
    D.parties.forEach((x: any) => all.push({ key: 'u' + x.id, icon: Users, title: x.name, sub: `Person · ${x.type}`, run: () => go('people', x.id) }))
    DB.txns.filter((t: any) => t.kind !== 'bill').forEach((t: any) => all.push({ key: 't' + t.id, icon: Banknote, title: `${t.vno} · ${t.kind === 'in' ? 'Received from' : 'Paid to'} ${t.who}`, sub: `${fmt(t.date)} · ${INR(t.amount)}`, run: () => openModal('voucher', { id: t.id }) }))
    DB.proposals.forEach((pr: any) => all.push({ key: 'r' + pr.id, icon: FileText, title: (PT[pr.lg || 'gu'].head(godDisp(pr, pr.lg || 'gu'), '') || 'Proposal'), sub: `Proposal · ${pr.vno || ''}`, run: () => openModal('pview', { id: pr.id }) }))
    const s = q.trim().toLowerCase()
    return (s ? all.filter((x) => (x.title + ' ' + x.sub).toLowerCase().includes(s)) : all.slice(0, 8)).slice(0, 12)
  }, [D, DB, q, openModal])

  const pick = (it?: Item) => { if (!it) return; onClose(); setTimeout(it.run, 0) }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content aria-describedby={undefined} className="fixed left-1/2 top-[14vh] z-50 w-[min(92vw,40rem)] -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl outline-none animate-[sheet-pop_.15s_ease-out]">
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              ref={ref}
              value={q}
              onChange={(e) => { setQ(e.target.value); setI(0) }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setI((v) => Math.min(items.length - 1, v + 1)) }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setI((v) => Math.max(0, v - 1)) }
                else if (e.key === 'Enter') pick(items[i])
              }}
              placeholder="Search projects, people, vouchers, proposals…"
              className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground">Esc</kbd>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {items.length ? items.map((it, n) => (
              <button key={it.key} onMouseEnter={() => setI(n)} onClick={() => pick(it)} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ' + (n === i ? 'bg-primary/10' : '')}>
                <it.icon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{it.title}</div><div className="truncate text-xs text-muted-foreground">{it.sub}</div></div>
              </button>
            )) : <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing found.</div>}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
