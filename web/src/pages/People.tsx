import { useState } from 'react'
import { ArrowLeft, Download, FileText, Pencil, Search, Share2, Trash2, UserPlus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, EmptyState, SectionTitle } from '@/components/app/common'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { INR, fmt } from '@/engine/engine.js'
import { DB } from '@/engine/engine.js'
import { deleteParty, docs, editBillForm, editPartyForm, newBillForm, newEntryForm, newPartyForm } from '@/engine/actions.js'

export default function People({ id }: { id?: string }) {
  const { D } = useData()
  if (id && D.pById[id]) return <Ledger id={id} />
  return <List />
}

function List() {
  const { D } = useData()
  const { open } = useModal()
  const [q, setQ] = useState('')
  const l = D.parties.filter((x: any) => !q || (x.name + ' ' + x.type).toLowerCase().includes(q.toLowerCase()))
  const n = D.parties.filter((x: any) => x.bal > 0).length
  return (
    <div className="grid gap-4">
      <div className="flex justify-end"><Button className="rounded-full" onClick={() => open('party', { form: newPartyForm() })}><UserPlus className="size-4" /> Add person</Button></div>
      {D.parties.length ? (
        <div className="rounded-3xl bg-info-soft p-5 text-info"><div className="text-xs font-semibold opacity-80">You owe in total</div><div className="font-display text-4xl font-extrabold tn">{INR(D.owe)}</div><div className="text-xs opacity-80">to {n} {n === 1 ? 'person' : 'people'}</div></div>
      ) : null}
      <Card className="rounded-3xl p-4">
        {D.parties.length ? (
          <>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or type" className="h-11 rounded-xl bg-background pl-10" type="search" />
            </div>
            {l.length ? l.map((x: any) => (
              <button key={x.id} onClick={() => go('people', x.id)} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-muted">
                <Avatar name={x.name} />
                <div className="min-w-0 flex-1"><b className="block break-words leading-snug">{x.name}</b><span className="text-xs text-muted-foreground">{x.type}</span></div>
                <div className="text-right"><div className="text-xs text-muted-foreground">{x.bal > 0 ? 'You owe' : x.bal < 0 ? 'Advance paid' : 'Settled'}</div><b className="tn">{x.bal ? INR(Math.abs(x.bal)) : '₹0'}</b></div>
              </button>
            )) : <div className="py-8 text-center text-sm text-muted-foreground">No one matches.</div>}
          </>
        ) : <EmptyState text="Add your stone suppliers, carving workers and fitting teams to keep a ledger for each." action={<Button className="rounded-full" onClick={() => open('party', { form: newPartyForm() })}>+ Add person</Button>} />}
      </Card>
    </div>
  )
}

function Ledger({ id }: { id: string }) {
  const { D } = useData()
  const { open } = useModal()
  const x = D.pById[id]
  const lines = x.lines.map((t: any, i: number) => ({ n: i, ...t })).sort((a: any, b: any) => (a.date === b.date ? a.n - b.n : a.date < b.date ? -1 : 1))
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" className="rounded-full" aria-label="All people" onClick={() => go('people')}><ArrowLeft className="size-4" /></Button>
        <span className="flex-1" />
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Add bill (amount owed)" onClick={() => open('bill', { form: newBillForm(id) })}><FileText className="size-4" /></Button>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Pay now" onClick={() => open('entry', { form: newEntryForm(null, id) })}><Wallet className="size-4" /></Button>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Edit person" onClick={() => open('party', { form: editPartyForm(DB.parties.filter((p: any) => p.id === id)[0]) })}><Pencil className="size-4" /></Button>
        {x.lines.length ? null : <Button variant="outline" size="icon" className="rounded-full text-expense" aria-label="Delete person" onClick={() => open('confirm', { title: `Delete ${x.name}?`, body: 'You can undo for a few seconds after.', action: () => { deleteParty(id); go('people') } })}><Trash2 className="size-4" /></Button>}
      </div>
      <div className="rounded-3xl bg-[linear-gradient(135deg,var(--hero2-a),var(--hero2-b))] p-5 text-white shadow-lg">
        <div className="text-xs opacity-80">{x.type}{x.phone ? ' · ' + x.phone : ''}</div>
        <h1 className="font-display text-3xl font-extrabold leading-tight">{x.name}</h1>
        <div className="mt-3 text-xs opacity-80">{x.bal >= 0 ? 'You owe' : 'Advance paid'}</div>
        <div className="font-display text-4xl font-extrabold tn">{INR(Math.abs(x.bal))}</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/15 p-2.5"><div className="text-[11px] opacity-85">Total billed</div><b className="tn text-lg">{INR(x.bills)}</b></div>
          <div className="rounded-2xl bg-white/15 p-2.5"><div className="text-[11px] opacity-85">Paid</div><b className="tn text-lg">{INR(x.paid)}</b></div>
        </div>
      </div>
      <Card className="rounded-3xl p-5">
        <SectionTitle right={<div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full" aria-label="Download statement PDF" onClick={() => docs.statementPdf(id)}><Download className="size-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-full" aria-label="Share statement" onClick={() => docs.statementShare(id)}><Share2 className="size-4" /></Button>
        </div>}>Ledger</SectionTitle>
        {lines.length ? lines.map((t: any) => {
          const p = D.byId[t.projId], bill = t.kind === 'bill'
          return (
            <button key={t.id} onClick={() => (bill ? open('bill', { form: editBillForm(t) }) : open('voucher', { id: t.id }))} className="flex w-full items-center gap-3 border-b py-3 text-left last:border-0">
              <div className="min-w-0 flex-1"><b className="block text-sm">{bill ? 'Bill' : 'Paid'}{t.note ? ' · ' + t.note : ''}</b><span className="text-xs text-muted-foreground">{fmt(t.date)}{p ? ' · ' + p.name : ''}{bill ? '' : ' · ' + t.mode}</span></div>
              <b className={'tn text-sm ' + (bill ? '' : 'text-expense')}>{bill ? '+' : '−'}{INR(t.amount)}</b>
            </button>
          )
        }) : <div className="py-3 text-sm text-muted-foreground">No bills or payments yet.</div>}
        {lines.length ? <p className="mt-3 text-xs text-muted-foreground">Tap a line to open or edit it. + adds to what you owe. − is a payment you made.</p> : null}
      </Card>
    </div>
  )
}
