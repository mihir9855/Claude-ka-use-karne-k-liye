import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/app/sheet'
import { Chips, Field, FormError, MoneyInput, TextInput } from '@/components/app/fields'
import { Pick } from '@/components/app/pick'
import { useModal } from '@/app/modal'
import { useData } from '@/lib/store'
import { go } from '@/lib/router'
import { INR, MODES, SECTIONS, TYPES, num } from '@/engine/engine.js'
import { newPartyForm, newStage, saveBill, saveEntry, saveParty, saveProject, deleteTxn } from '@/engine/actions.js'

/* ------------------------------------------------------------------ payment / receipt */
export function EntryModal({ form }: { form: any }) {
  const { close, open } = useModal()
  const { D } = useData()
  const [f, setF] = useState<any>(form)
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const inn = f.kind === 'in'
  const proj = D.byId[f.projId]

  const setKind = (k: string) => {
    const pp = D.byId[f.projId]
    setF((p: any) => ({ ...p, kind: k, who: k === 'in' ? (pp ? pp.client || '' : '') : '', partyId: '', stageId: '', mode: k === 'in' ? 'Bank' : 'Cash' }))
  }
  const submit = () => {
    const r = saveEntry(f)
    if (r.err) return setErr(r.err)
    open('voucher', { id: r.id, fresh: !r.edited })
  }

  return (
    <Sheet
      open
      onClose={close}
      title={f.editId ? 'Edit entry' : 'New voucher'}
      subtitle="A voucher is made when you save."
      footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={submit}>{f.editId ? 'Save changes' : 'Save and make voucher'}</Button>}
    >
      {f.editId ? null : (
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
          {[['out', 'Payment made'], ['in', 'Client payment']].map(([k, l]) => (
            <button key={k} onClick={() => setKind(k)} className={'rounded-xl py-2.5 text-sm font-bold transition ' + (f.kind === k ? (k === 'in' ? 'bg-income text-white shadow' : 'bg-primary text-primary-foreground shadow') : 'text-muted-foreground')}>{l}</button>
          ))}
        </div>
      )}
      <Field label="Amount"><MoneyInput value={f.amount} onChange={(v) => set('amount', v)} autoFocus={!f.editId} /></Field>
      <Field label="Project (optional)">
        <Pick value={f.projId} onChange={(v) => setF((p: any) => ({ ...p, projId: v, stageId: '' }))} items={D.projects.map((p: any) => [p.id, p.name])} none="No project (general)" />
      </Field>
      {inn ? (
        <>
          <Field label="Stage (optional)"><Pick value={f.stageId} onChange={(v) => set('stageId', v)} items={proj ? proj.stages.map((s: any) => [s.id, s.name]) : []} none="Not linked to a stage" /></Field>
          <Field label="Received from"><TextInput value={f.who} onChange={(v) => set('who', v)} placeholder="Client name" /></Field>
        </>
      ) : (
        <>
          <Field label="Section"><Chips options={SECTIONS.map((s: string) => ({ value: s, label: s }))} value={f.section} onChange={(v) => set('section', v)} /></Field>
          <Field label="Paid to">
            <Pick
              value={f.partyId}
              onChange={(v) => {
                const pt = D.parties.find((x: any) => x.id === v)
                setF((p: any) => ({ ...p, partyId: v, who: pt ? pt.name : '' }))
              }}
              items={D.parties.map((x: any) => [x.id, `${x.name} (${x.type})`])}
              none="Someone else (type the name)"
            />
          </Field>
          {f.partyId ? null : <Field label="Name"><TextInput value={f.who} onChange={(v) => set('who', v)} placeholder="Who did you pay?" /></Field>}
        </>
      )}
      <Field label="Mode"><Chips options={MODES.map((m: string) => ({ value: m, label: m }))} value={f.mode} onChange={(v) => set('mode', v)} /></Field>
      {f.mode === 'Bank' || f.mode === 'Cheque' ? (
        <Field label={f.mode === 'Cheque' ? 'Cheque number' : 'NEFT / RTGS / IMPS reference number'} hint={inn ? 'Shown on the receipt, so the client can match it with the bank statement.' : undefined}>
          <TextInput value={f.ref || ''} onChange={(v) => set('ref', v)} placeholder={f.mode === 'Cheque' ? 'e.g. 004512' : 'e.g. UTR / transaction id'} className="tn" />
        </Field>
      ) : null}
      <Field label="Date"><TextInput type="date" value={f.date} onChange={(v) => set('date', v)} /></Field>
      <Field label="Note (optional)"><TextInput value={f.note} onChange={(v) => set('note', v)} placeholder={inn ? 'e.g. 2nd installment' : 'e.g. weekly payout'} /></Field>
      <FormError msg={err} />
    </Sheet>
  )
}

/* ------------------------------------------------------------------ project */
export function ProjectModal({ form }: { form: any }) {
  const { close } = useModal()
  const [f, setF] = useState<any>(form)
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const setStage = (i: number, k: string, v: string) => setF((p: any) => ({ ...p, stages: p.stages.map((s: any, j: number) => (j === i ? { ...s, [k]: v } : s)) }))
  const sum = useMemo(() => f.stages.reduce((a: number, s: any) => a + num(s.amount), 0), [f.stages])
  const val = num(f.value)
  const sumText = `Stages add up to ${INR(sum)}` + (val ? ` of ${INR(val)}` + (sum === val ? ' ✓' : sum < val ? ` · ${INR(val - sum)} not yet assigned` : ` · ${INR(sum - val)} more than the deal`) : '')

  const submit = () => {
    const r = saveProject(f)
    if (r.err) return setErr(r.err)
    close()
    if (!r.edited) go('projects', r.id)
  }
  return (
    <Sheet open onClose={close} title={f.editId ? 'Edit project' : 'New project'} subtitle="Deal value and stage-wise client payments" footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={submit}>{f.editId ? 'Save changes' : 'Save project'}</Button>}>
      <Field label="Temple / project name"><TextInput value={f.name} onChange={(v) => set('name', v)} placeholder="e.g. Shiva Temple" /></Field>
      <Field label="Client name"><TextInput value={f.client} onChange={(v) => set('client', v)} placeholder="Who is the temple for?" /></Field>
      <Field label="Trust / organisation name (optional)" hint="Used on the receipt instead of the project name"><TextInput value={f.trust} onChange={(v) => set('trust', v)} /></Field>
      <Field label="Total deal value"><MoneyInput value={f.value} onChange={(v) => set('value', v)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date"><TextInput type="date" value={f.start} onChange={(v) => set('start', v)} /></Field>
        <Field label="Handover date"><TextInput type="date" value={f.handover} onChange={(v) => set('handover', v)} /></Field>
      </div>
      <Field label="Stages and what the client pays at each stage" hint={sumText}>
        <div className="grid gap-3">
          {f.stages.map((s: any, i: number) => (
            <div key={s.id} className="rounded-2xl border bg-background p-3">
              <div className="flex gap-2">
                <TextInput value={s.name} onChange={(v) => setStage(i, 'name', v)} placeholder="Stage name" aria-label={`Stage ${i + 1} name`} />
                <button type="button" aria-label="Remove stage" onClick={() => f.stages.length > 1 && setF((p: any) => ({ ...p, stages: p.stages.filter((_: any, j: number) => j !== i) }))} className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MoneyInput size="sm" value={s.amount} onChange={(v) => setStage(i, 'amount', v)} placeholder="Client pays" aria-label={`Amount at stage ${i + 1}`} />
                <TextInput type="date" value={s.date} onChange={(v) => setStage(i, 'date', v)} aria-label={`Target date for stage ${i + 1}`} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={() => setF((p: any) => ({ ...p, stages: [...p.stages, newStage()] }))}><Plus className="size-4" /> Add stage</Button>
        </div>
      </Field>
      <FormError msg={err} />
    </Sheet>
  )
}

/* ------------------------------------------------------------------ person */
export function PartyModal({ form }: { form: any }) {
  const { close } = useModal()
  const [f, setF] = useState<any>(form || newPartyForm())
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const submit = () => {
    const r = saveParty(f)
    if (r.err) return setErr(r.err)
    close()
  }
  return (
    <Sheet open onClose={close} title={f.editId ? 'Edit person' : 'Add person'} footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={submit}>{f.editId ? 'Save changes' : 'Save person'}</Button>}>
      <Field label="Name"><TextInput value={f.name} onChange={(v) => set('name', v)} placeholder="e.g. Rampal Stones" autoFocus /></Field>
      <Field label="Type"><Chips options={TYPES.map((t: string) => ({ value: t, label: t }))} value={f.type} onChange={(v) => set('type', v)} /></Field>
      <Field label="Phone (optional)"><TextInput value={f.phone} onChange={(v) => set('phone', v)} inputMode="tel" placeholder="+91" /></Field>
      <FormError msg={err} />
    </Sheet>
  )
}

/* ------------------------------------------------------------------ bill */
export function BillModal({ form }: { form: any }) {
  const { close, open } = useModal()
  const { D } = useData()
  const [f, setF] = useState<any>(form)
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }))
  const party = D.pById[f.partyId]
  const submit = () => {
    const r = saveBill(f)
    if (r.err) return setErr(r.err)
    close()
  }
  return (
    <Sheet open onClose={close} title={f.editId ? 'Edit bill' : 'Add bill'} subtitle={party ? `Money you now owe ${party.name}` : undefined} footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={submit}>{f.editId ? 'Save changes' : 'Save bill'}</Button>}>
      <Field label="Amount owed"><MoneyInput value={f.amount} onChange={(v) => set('amount', v)} autoFocus /></Field>
      <Field label="Project (optional)"><Pick value={f.projId} onChange={(v) => set('projId', v)} items={D.projects.map((p: any) => [p.id, p.name])} none="No project (general)" /></Field>
      <Field label="What is it for?"><TextInput value={f.note} onChange={(v) => set('note', v)} placeholder="e.g. Agreed supply / extra work" /></Field>
      <Field label="Date"><TextInput type="date" value={f.date} onChange={(v) => set('date', v)} /></Field>
      <FormError msg={err} />
      {f.editId ? (
        <Button variant="outline" className="mt-1 h-11 w-full rounded-xl text-expense" onClick={() => open('confirm', { title: 'Delete this bill?', body: 'You can undo for a few seconds after.', action: () => deleteTxn(f.editId, 'Bill deleted') })}>Delete bill</Button>
      ) : null}
    </Sheet>
  )
}
