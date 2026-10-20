import { useMemo, useState } from 'react'
import { Download, Receipt, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/app/common'
import { AnimatedBackground } from '@/motion-primitives/animated-background'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { INR, fmt } from '@/engine/engine.js'
import { docs, newEntryForm } from '@/engine/actions.js'

export default function DPayments() {
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
  const totIn = list.filter((t: any) => t.kind === 'in').reduce((a: number, t: any) => a + t.amount, 0)
  const totOut = list.filter((t: any) => t.kind === 'out').reduce((a: number, t: any) => a + t.amount, 0)

  if (!DB.txns.length) return <Card className="rounded-3xl"><EmptyState text="No vouchers yet. Make a voucher for money you paid or money a client paid you. No project needed." action={<Button className="rounded-full" onClick={() => open('entry', { form: newEntryForm() })}><Receipt className="size-4" /> New voucher</Button>} /></Card>

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-5">
        <div className="rounded-3xl bg-income-soft p-4 text-income"><div className="text-xs font-semibold opacity-80">Received (shown)</div><div className="font-display tn text-2xl font-extrabold">{INR(totIn)}</div></div>
        <div className="rounded-3xl bg-expense-soft p-4 text-expense"><div className="text-xs font-semibold opacity-80">Paid (shown)</div><div className="font-display tn text-2xl font-extrabold">{INR(totOut)}</div></div>
        <div className="rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border"><div className="text-xs font-semibold text-muted-foreground">Entries shown</div><div className="font-display tn text-2xl font-extrabold">{list.length}</div></div>
      </div>
      <Card className="gap-0 overflow-hidden rounded-3xl p-0">
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="inline-flex rounded-full bg-muted p-1">
            <AnimatedBackground defaultValue={pf} onValueChange={(v) => v && setPf(v)} className="rounded-full bg-card shadow" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}>
              {[['all', 'All'], ['in', 'Received'], ['out', 'Paid']].map(([k, l]) => (
                <button key={k} data-id={k} className="px-4 py-1.5 text-sm font-semibold text-muted-foreground transition data-[checked=true]:text-foreground">{l}</button>
              ))}
            </AnimatedBackground>
          </div>
          <div className="relative w-80"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, project, note or voucher no." className="h-10 rounded-xl pl-9" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr><th className="px-4 py-2.5 font-semibold">Date</th><th className="px-2 py-2.5 font-semibold">Voucher</th><th className="px-2 py-2.5 font-semibold">Type</th><th className="px-2 py-2.5 font-semibold">Name</th><th className="px-2 py-2.5 font-semibold">Project</th><th className="px-2 py-2.5 font-semibold">Stage / section</th><th className="px-2 py-2.5 font-semibold">Mode</th><th className="px-2 py-2.5 text-right font-semibold">Amount</th><th className="w-12" /></tr>
            </thead>
            <tbody>
              {list.map((t: any) => {
                const p = D.byId[t.projId], inn = t.kind === 'in'
                return (
                  <tr key={t.id} onClick={() => open('voucher', { id: t.id })} className="group cursor-pointer border-t transition hover:bg-muted/60">
                    <td className="tn whitespace-nowrap px-4 py-3 text-muted-foreground">{fmt(t.date)}</td>
                    <td className="tn px-2 py-3 font-semibold">{t.vno}</td>
                    <td className="px-2 py-3"><Badge variant="secondary" className={'rounded-full ' + (inn ? 'bg-income-soft text-income' : 'bg-expense-soft text-expense')}>{inn ? 'Received' : 'Paid'}</Badge></td>
                    <td className="max-w-52 truncate px-2 py-3 font-semibold">{t.who}</td>
                    <td className="max-w-56 truncate px-2 py-3 text-muted-foreground">{p ? p.name : '—'}</td>
                    <td className="px-2 py-3 text-muted-foreground">{(inn ? t.stageName : t.section) || '—'}</td>
                    <td className="px-2 py-3 text-muted-foreground">{t.mode}</td>
                    <td className={'tn px-2 py-3 text-right font-bold ' + (inn ? 'text-income' : '')}>{inn ? '+' : '−'}{INR(t.amount)}</td>
                    <td className="px-2 py-3 text-right"><button aria-label="Download PDF" onClick={(e) => { e.stopPropagation(); docs.voucherPdf(t.id) }} className="grid size-8 place-items-center rounded-lg text-muted-foreground opacity-0 transition hover:bg-secondary hover:text-foreground group-hover:opacity-100"><Download className="size-4" /></button></td>
                  </tr>
                )
              })}
              {!list.length ? <tr><td colSpan={9} className="py-10 text-center text-muted-foreground">No payment matches.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
