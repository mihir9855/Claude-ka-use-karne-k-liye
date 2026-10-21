import { useMemo, useState } from 'react'
import { Receipt, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/app/common'
import { TxnRow } from '@/components/app/rows'
import { AnimatedBackground } from '@/motion-primitives/animated-background'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { newEntryForm } from '@/engine/actions.js'

export default function Payments() {
  const { D, DB, txns } = useData()
  const { open } = useModal()
  const [q, setQ] = useState('')
  const [pf, setPf] = useState('all')
  const list = useMemo(() => {
    const s = q.toLowerCase()
    return txns(['in', 'out']).filter((t: any) => {
      const p = D.byId[t.projId]
      return (pf === 'all' || t.kind === pf) && (!s || ((t.who || '') + ' ' + (p ? p.name : '') + ' ' + (t.note || '') + ' ' + (t.vno || '')).toLowerCase().includes(s))
    })
  }, [D, q, pf]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="rounded-3xl p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, project or note" className="h-11 rounded-xl bg-background pl-10" type="search" />
      </div>
      <div className="my-3 inline-flex rounded-full bg-muted p-1">
        <AnimatedBackground defaultValue={pf} onValueChange={(v) => v && setPf(v)} className="rounded-full bg-card shadow" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}>
          {[['all', 'All'], ['in', 'Received'], ['out', 'Paid']].map(([k, l]) => (
            <button key={k} data-id={k} className="px-4 py-1.5 text-sm font-semibold text-muted-foreground transition data-[checked=true]:text-foreground">{l}</button>
          ))}
        </AnimatedBackground>
      </div>
      {!DB.txns.length ? (
        <EmptyState text="No vouchers yet. Tap the button to make a voucher for money you paid or money a client paid you. No project needed." action={<Button className="rounded-full" onClick={() => open('entry', { form: newEntryForm() })}><Receipt className="size-4" /> New voucher</Button>} />
      ) : list.length ? list.map((t: any) => <TxnRow key={t.id} t={t} D={D} />) : <div className="py-8 text-center text-sm text-muted-foreground">No payment matches.</div>}
    </Card>
  )
}
