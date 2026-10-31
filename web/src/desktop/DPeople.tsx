import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, EmptyState } from '@/components/app/common'
import { Ledger } from '@/pages/People'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { INR } from '@/engine/engine.js'
import { newPartyForm } from '@/engine/actions.js'
import { cn } from '@/lib/utils'

export default function DPeople({ id }: { id?: string }) {
  const { D } = useData()
  const { open } = useModal()
  const [q, setQ] = useState('')
  const sel = id && D.pById[id] ? id : D.parties[0]?.id
  const list = D.parties.filter((x: any) => !q || (x.name + ' ' + x.type).toLowerCase().includes(q.toLowerCase()))
  if (!D.parties.length) return <Card className="rounded-3xl"><EmptyState text="Add your stone suppliers, carving workers and fitting teams to keep a ledger for each." action={<Button className="rounded-full" onClick={() => open('party', { form: newPartyForm() })}>+ Add person</Button>} /></Card>
  return (
    <div className="grid grid-cols-[22rem_minmax(0,1fr)] items-start gap-5">
      <Card className="sticky top-24 max-h-[calc(100dvh-8rem)] gap-0 overflow-hidden rounded-3xl p-0">
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between"><b className="font-display text-lg">People</b><Button size="sm" className="rounded-xl" onClick={() => open('party', { form: newPartyForm() })}><UserPlus className="size-4" /> Add</Button></div>
          <div className="rounded-2xl bg-info-soft px-3 py-2 text-info"><span className="text-xs font-semibold opacity-80">You owe in total </span><b className="tn">{INR(D.owe)}</b></div>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 rounded-xl pl-9" /></div>
        </div>
        <div className="overflow-y-auto p-2">
          {list.map((x: any) => (
            <button key={x.id} onClick={() => go('people', x.id)} className={cn('flex w-full items-center gap-3 rounded-2xl p-3 text-left transition', x.id === sel ? 'bg-primary/10' : 'hover:bg-muted')}>
              <Avatar name={x.name} />
              <div className="min-w-0 flex-1"><b className="block truncate text-sm">{x.name}</b><span className="block truncate text-xs text-muted-foreground">{x.type}</span></div>
              <div className="text-right"><div className="text-[11px] text-muted-foreground">{x.bal > 0 ? 'You owe' : x.bal < 0 ? 'Advance' : 'Settled'}</div><b className="tn text-xs">{x.bal ? INR(Math.abs(x.bal)) : '₹0'}</b></div>
            </button>
          ))}
          {!list.length ? <div className="p-6 text-center text-sm text-muted-foreground">No one matches.</div> : null}
        </div>
      </Card>
      <div className="min-w-0"><Ledger key={sel} id={sel} embedded /></div>
    </div>
  )
}
