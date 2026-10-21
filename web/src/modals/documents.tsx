import { useState, type ReactNode } from 'react'
import { Copy, Download, FileText, Paperclip, Pencil, Printer, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/app/sheet'
import { Paper } from '@/components/app/common'
import { Chips, Field, FormError, MoneyInput, TextInput } from '@/components/app/fields'
import { Lottie } from '@/components/Lottie'
import { filesToAttachments, MAX_ATTACHMENTS, type Attachment } from '@/lib/attach'
import check from '@/lib/check.json'
import { useModal } from '@/app/modal'
import { useData } from '@/lib/store'
import { INR, ITEMS, LANG, PT, SHORT, STONES, curLang, findProp, findTxn, presetNotes, proposalPreview, godDisp, voucherPaper } from '@/engine/engine.js'
import {
  deleteProposal, deleteTxn, docs, editEntryForm, newOption, proposalForm, saveNotesDefault, saveProposal, setLang, setProposalLang, restoreBackup,
} from '@/engine/actions.js'

const LANGS = ['en', 'hi', 'gu']
const langOpts = (list: string[] = LANGS) => list.map((k) => ({ value: k, label: LANG[k].name as string }))

function IconBtn({ label, onClick, children, tone }: { label: string; onClick: () => void; children: ReactNode; tone?: 'primary' | 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={'grid size-11 place-items-center rounded-2xl border transition active:scale-95 ' + (tone === 'primary' ? 'border-primary bg-primary text-primary-foreground shadow-sm' : tone === 'danger' ? 'text-expense hover:bg-expense-soft' : 'bg-background hover:bg-muted')}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ voucher / receipt */
export function VoucherModal({ id, fresh }: { id: string; fresh?: boolean }) {
  const { close, open } = useModal()
  useData()
  const t = findTxn(id)
  if (!t) return null
  const inn = t.kind === 'in'
  return (
    <Sheet open onClose={close} wide title={inn ? 'Receipt on letterhead' : 'Payment voucher'} subtitle={t.vno}>
      {fresh ? (
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-income-soft px-4 py-2 text-income">
          <Lottie data={check} loop={false} className="size-12 shrink-0" />
          <div className="text-sm font-bold">Saved. Your voucher is ready.</div>
        </div>
      ) : null}
      {inn || t.kind === 'out' ? <Chips className="mb-3" options={langOpts()} value={curLang()} onChange={(v) => setLang(v)} /> : null}
      <Paper html={voucherPaper(t)} />
      <div className="mt-4 flex items-center gap-2">
        <IconBtn label="Download PDF" onClick={() => docs.voucherPdf(id)}><Download className="size-5" /></IconBtn>
        <IconBtn label="Print" onClick={() => docs.voucherPrint(id)}><Printer className="size-5" /></IconBtn>
        <IconBtn label="Share" tone="primary" onClick={() => docs.voucherShare(id)}><Share2 className="size-5" /></IconBtn>
        <span className="flex-1" />
        <IconBtn label="Edit entry" onClick={() => open('entry', { form: editEntryForm(t) })}><Pencil className="size-5" /></IconBtn>
        <IconBtn label="Delete entry" tone="danger" onClick={() => open('confirm', { title: 'Delete this entry?', body: 'Totals will change. You can undo for a few seconds after.', action: () => deleteTxn(id) })}><Trash2 className="size-5" /></IconBtn>
      </div>
      {!(window as any).Capacitor?.isNativePlatform?.() && <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">Print works from the PC browser. On a phone, tap Download and print that PDF.</p>}
    </Sheet>
  )
}

/* ------------------------------------------------------------------ project report */
export function ReportModal({ id }: { id: string }) {
  const { close } = useModal()
  const { D } = useData()
  const p = D.byId[id]
  if (!p) return null
  return (
    <Sheet open onClose={close} title="Project report" subtitle={p.name}>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[['Deal value', SHORT(p.value), ''], ['Received', SHORT(p.received), 'text-income'], ['Spent', SHORT(p.spent), '']].map(([l, v, c]) => (
          <div key={l} className="rounded-2xl bg-muted p-3"><div className="text-xs text-muted-foreground">{l}</div><div className={'tn mt-0.5 text-lg font-extrabold ' + c}>{v}</div></div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border p-4">
        <div className="mb-1 flex items-center gap-2 font-bold"><FileText className="size-4" /> What the PDF contains</div>
        <ol className="list-inside list-decimal space-y-0.5 text-sm text-muted-foreground">
          <li>Project details and summary</li><li>Stage-wise client payments</li><li>All payments received</li><li>Expenses by section</li><li>All payments made</li><li>People and what is still due</li>
        </ol>
      </div>
      <Chips className="mt-4" options={langOpts()} value={curLang()} onChange={(v) => setLang(v)} />
      <div className="mt-4 flex items-center gap-2">
        <span className="flex-1 text-sm text-muted-foreground">Made on your letterhead, A4.</span>
        <IconBtn label="Download report PDF" onClick={() => docs.reportPdf(id)}><Download className="size-5" /></IconBtn>
        <IconBtn label="Share report PDF" tone="primary" onClick={() => docs.reportPdf(id, 'share')}><Share2 className="size-5" /></IconBtn>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ proposal form */
export function ProposalModal({ form }: { form: any }) {
  const { open, close } = useModal()
  const [f, setF] = useState<any>(form || proposalForm())
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [attErr, setAttErr] = useState('')
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v, touched: p.touched }))
  const lg = f.lg
  const setOpt = (i: number, k: string, v: string) => setF((p: any) => ({ ...p, options: p.options.map((o: any, j: number) => (j === i ? { ...o, [k]: v } : o)) }))

  const setLg = (g: string) => setF((p: any) => {
    const ix = ITEMS[p.lg].indexOf(p.item)
    return { ...p, lg: g, notes: p.touched ? p.notes : presetNotes(p.kind || 'temple', g), item: ix >= 0 ? ITEMS[g][ix] : p.item }
  })
  const setKind = (k: string) => setF((p: any) => ({ ...p, kind: k, notes: p.touched ? p.notes : presetNotes(k, p.lg), item: p.item }))
  const setNote = (i: number, v: string) => setF((p: any) => ({ ...p, touched: true, notes: p.notes.map((x: string, j: number) => (j === i ? v : x)) }))
  const submit = () => {
    const r = saveProposal(f)
    if (r.err) return setErr(r.err)
    open('pview', { id: r.id })
  }
  const ph = (gu: string, hi: string, en: string) => (lg === 'gu' ? gu : lg === 'hi' ? hi : en)

  return (
    <Sheet open onClose={close} wide title={f.editId ? 'Edit proposal' : 'New proposal'} subtitle="Temple name, place, rates and terms" footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={submit}>{f.editId ? 'Save changes' : 'Save and preview'}</Button>}>
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {[['temple', 'Temple (stone-wise rates)'], ['small', 'Small sihasan or house temple']].map(([k, l]) => (
          <button key={k} onClick={() => setKind(k)} className={'rounded-xl px-2 py-2.5 text-[13px] font-bold transition ' + ((f.kind || 'temple') === k ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground')}>{l}</button>
        ))}
      </div>
      <Field label="Language"><Chips options={langOpts(['gu', 'hi', 'en'])} value={lg} onChange={setLg} /></Field>
      <Field label="Name of the temple (optional, write it in full)" hint="Whatever you write here comes in the heading as it is. Nothing is added after it, so include the word Mandir yourself.">
        <TextInput value={f.god} onChange={(v) => set('god', v)} placeholder={ph('ખોડિયાર માતા મંદિર', 'खोड़ियार माता मंदिर', 'Khodiyar Mata Temple')} /></Field>
      <Field label="Place (village or city)"><TextInput value={f.loc} onChange={(v) => set('loc', v)} placeholder={ph('પુનધરા', 'पुनधरा', 'Punadhara')} /></Field>
      <Field label="Date"><TextInput type="date" value={f.date} onChange={(v) => set('date', v)} /></Field>

      {f.kind === 'small' ? (
        <>
          <Field label="What is being made (optional)"><TextInput value={f.item} onChange={(v) => set('item', v)} placeholder={ITEMS[lg][0]} /></Field>
          <Field label="Design and size as per (name, optional)"><TextInput value={f.by} onChange={(v) => set('by', v)} placeholder={ph('દીનેશભાઈ', 'दिनेशभाई', 'Dineshbhai')} /></Field>
          <Field label="Stone / material"><TextInput value={f.options[0].stone} onChange={(v) => setOpt(0, 'stone', v)} /></Field>
          <Chips className="mt-2" options={STONES[lg].map((s: string) => ({ value: s, label: s }))} value={f.options[0].stone} onChange={(v) => setOpt(0, 'stone', v)} />
          <Field label="Total amount (Rs.)"><MoneyInput value={f.options[0].mandir} onChange={(v) => setOpt(0, 'mandir', v)} /></Field>
        </>
      ) : (
        <Field label="Rates (one card for each stone)">
          <div className="grid gap-3">
            {f.options.map((o: any, i: number) => (
              <div key={o.id} className="rounded-2xl border bg-background p-3">
                <div className="mb-2 flex items-center justify-between"><b>Option {i + 1}</b>{f.options.length > 1 ? <button onClick={() => setF((p: any) => ({ ...p, options: p.options.filter((_: any, j: number) => j !== i) }))} className="text-xs font-semibold text-expense">Remove</button> : null}</div>
                <TextInput value={o.stone} onChange={(v) => setOpt(i, 'stone', v)} placeholder="Stone / material" />
                <Chips className="mt-2" options={STONES[lg].map((s: string) => ({ value: s, label: s }))} value={o.stone} onChange={(v) => setOpt(i, 'stone', v)} />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="grid gap-1 text-xs text-muted-foreground">Rate per sq ft (optional)<MoneyInput size="sm" value={o.sqft || ''} onChange={(v) => setOpt(i, 'sqft', v)} placeholder="optional" /></label>
                  <label className="grid gap-1 text-xs text-muted-foreground">Temple total (Rs.)<MoneyInput size="sm" value={o.mandir} onChange={(v) => setOpt(i, 'mandir', v)} /></label>
                </div>
              </div>
            ))}
            <Button variant="outline" className="h-11 rounded-xl" onClick={() => setF((p: any) => ({ ...p, options: [...p.options, newOption()] }))}>+ Add another stone option</Button>
          </div>
        </Field>
      )}

      <Field label="Extra details (optional)" hint="Write anything else you want in this proposal. It comes after the rates and before the notes.">
        <textarea value={f.extra || ''} onChange={(e) => set('extra', e.target.value)} placeholder="e.g. Size, design, delivery time, payment schedule…" className="min-h-24 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" />
      </Field>
      <Field label="Pictures or PDF (optional)" hint="JPG, PNG or PDF. Each picture, and each page of a PDF, is added as its own page at the end, with the letterhead on top. Choose for each one: With letterhead (picture fitted between header and footer, good for drawings and photos) or Full A4 page (for a scan or PDF page that already has its own layout). Nothing is ever cut.">
        <div className="grid gap-2">
          {(f.attach || []).map((a: Attachment) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border bg-background p-2">
              <img src={a.data} alt="" className="h-16 w-24 shrink-0 rounded-lg border bg-white object-contain" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{a.name}</div>
                <div className="mt-1 flex gap-1.5">
                  {([['letter', 'With letterhead'], ['full', 'Full A4 page']] as const).map(([m, l]) => (
                    <button key={m} type="button" onClick={() => setF((p: any) => ({ ...p, attach: p.attach.map((x: Attachment) => (x.id === a.id ? { ...x, mode: m } : x)) }))}
                      className={'rounded-full border px-2.5 py-1 text-xs font-semibold ' + ((a.mode || 'letter') === m ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground')}>{l}</button>
                  ))}
                </div>
              </div>
              <button type="button" aria-label="Remove" onClick={() => setF((p: any) => ({ ...p, attach: p.attach.filter((x: Attachment) => x.id !== a.id) }))} className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">×</button>
            </div>
          ))}
          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed bg-background text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground">
            <Paperclip className="size-4" /> {busy ? 'Adding…' : 'Attach pictures or PDF'}
            <input type="file" multiple accept="image/jpeg,image/png,application/pdf,.pdf,.jpg,.jpeg,.png" className="sr-only" disabled={busy} onChange={async (e) => {
              const files = Array.from(e.target.files || [])
              e.target.value = ''
              if (!files.length) return
              setBusy(true)
              const r = await filesToAttachments(files, MAX_ATTACHMENTS - (f.attach || []).length)
              setF((p: any) => ({ ...p, attach: [...(p.attach || []), ...r.list] }))
              setAttErr(r.error)
              setBusy(false)
            }} />
          </label>
          {attErr ? <p className="text-xs font-semibold text-expense">{attErr}</p> : null}
        </div>
      </Field>
      <Field label="Where the notes go" hint="Under the rates: the notes follow the rates on the same page when there is room. Separate last page: the notes and the signature always start on their own last page.">
        <Chips options={[{ value: 'flow', label: 'Under the rates' }, { value: 'page', label: 'Separate last page' }]} value={f.np === true ? 'page' : 'flow'} onChange={(v) => set('np', v === 'page')} />
      </Field>
      <Field label="Notes and terms (ready-made, you can edit)">
        <div className="grid gap-2">
          {f.notes.map((x: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-5 pt-3 text-sm text-muted-foreground">{i + 1}.</span>
              <textarea value={x} onChange={(e) => setNote(i, e.target.value)} className="min-h-20 flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" />
              <button aria-label="Remove this note" onClick={() => setF((p: any) => ({ ...p, touched: true, notes: p.notes.filter((_: any, j: number) => j !== i) }))} className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">×</button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setF((p: any) => ({ ...p, touched: true, notes: [...p.notes, ''] }))}>+ Add note</Button>
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setF((p: any) => ({ ...p, touched: false, notes: presetNotes(p.kind || 'temple', p.lg) }))}>Reset to ready-made</Button>
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => saveNotesDefault(f)}>Save these as my default</Button>
          </div>
        </div>
      </Field>
      <Field label="Signed by"><TextInput value={f.signer} onChange={(v) => set('signer', v)} placeholder="Manoj Vinodrai Sompura" /></Field>
      <FormError msg={err} />
    </Sheet>
  )
}

/* ------------------------------------------------------------------ proposal preview */
export function ProposalView({ id }: { id: string }) {
  const { close, open } = useModal()
  useData()
  const pr = findProp(id)
  if (!pr) return null
  const lg = pr.lg || 'gu'
  return (
    <Sheet open onClose={close} wide title="Proposal" subtitle={`${(PT[lg].head(godDisp(pr, pr.lg || 'gu'), '') || 'Proposal')} · ${pr.vno || ''}`}>
      <Chips className="mb-3" options={langOpts(['gu', 'hi', 'en'])} value={lg} onChange={(g) => setProposalLang(id, g)} />
      <Paper html={proposalPreview(pr)} />
      <div className="mt-3 flex items-center gap-2">
        <IconBtn label="Download PDF" onClick={() => docs.proposalPdf(id)}><Download className="size-5" /></IconBtn>
        <IconBtn label="Print" onClick={() => docs.proposalPrint(id)}><Printer className="size-5" /></IconBtn>
        <IconBtn label="Share PDF" tone="primary" onClick={() => docs.proposalPdf(id, 'share')}><Share2 className="size-5" /></IconBtn>
        <span className="flex-1" />
        <IconBtn label="Edit proposal" onClick={() => open('proposal', { form: proposalForm(id) })}><Pencil className="size-5" /></IconBtn>
        <IconBtn label="Make a copy for another temple" onClick={() => open('proposal', { form: proposalForm(id, true) })}><Copy className="size-5" /></IconBtn>
        <IconBtn label="Delete proposal" tone="danger" onClick={() => open('confirm', { title: 'Delete this proposal?', body: 'You can undo for a few seconds after.', action: () => deleteProposal(id) })}><Trash2 className="size-5" /></IconBtn>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ restore / copy / confirm */
export function RestoreModal() {
  const { close } = useModal()
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const go = () => {
    const e = restoreBackup(text)
    if (e) setErr(e)
    else {
      close()
      location.hash = '#/home'
    }
  }
  return (
    <Sheet open onClose={close} title="Restore from backup" subtitle="Paste the backup text here. This replaces the data on this device." footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={go}>Restore</Button>}>
      <label className="mt-3 block"><span className="text-sm font-semibold">Choose a backup file</span>
        <input type="file" accept=".json,application/json,text/plain" className="mt-1 block w-full text-sm" onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then((t) => { setText(t); setErr('') }) }} />
      </label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Or paste backup here" className="mt-3 min-h-40 w-full rounded-xl border bg-background p-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" />
      <FormError msg={err} />
    </Sheet>
  )
}

export function CopyModal({ text }: { text: string }) {
  const { close } = useModal()
  return (
    <Sheet open onClose={close} title="Copy this text" subtitle="Select it and copy" footer={<Button size="lg" className="h-12 w-full rounded-xl text-base font-bold" onClick={(e) => { const ta = (e.currentTarget.closest('[role=dialog]') as HTMLElement).querySelector('textarea'); ta?.focus(); ta?.select() }}>Select all</Button>}>
      <textarea readOnly defaultValue={text} className="mt-3 min-h-44 w-full rounded-xl border bg-background p-3 text-sm" />
    </Sheet>
  )
}

export function ConfirmModal({ title, body, action, label = 'Yes, delete' }: { title: string; body?: string; action: () => void; label?: string }) {
  const { close } = useModal()
  return (
    <Sheet open onClose={close} title={title} subtitle={body}>
      <div className="mt-2 grid grid-cols-2 gap-3 pb-1">
        <Button variant="outline" className="h-12 rounded-xl" onClick={close}>Keep it</Button>
        <Button className="h-12 rounded-xl bg-expense text-white hover:bg-expense/90" onClick={() => { close(); action() }}>{label}</Button>
      </div>
    </Sheet>
  )
}

export { INR }
