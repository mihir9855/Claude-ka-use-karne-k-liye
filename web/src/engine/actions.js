import {
  DB, KEY, TYPES, DEF_STAGES, ITEMS, uid, num, pad, today, save, toast, notify, setDB, blank, findTxn,
  derive, curLang, presetNotes, stripGod, findProp, setPdfMode, pdfVoucher, pdfLetter, pdfReport, pdfStatement,
  pdfProposal, voucherText, stmtText, shareText, printVoucher, printProposal, proposalText,
} from './engine.js'
import { loadPdfLibs } from './pdfLibs.js'

let snap = null

export function undo() {
  if (!snap) return false
  setDB(JSON.parse(snap))
  snap = null
  save()
  toast('Restored')
  return true
}

function delWith(msg, fn) {
  snap = JSON.stringify(DB)
  fn()
  save()
  toast(msg, true)
}

/* ---------- form starters ---------- */
export function newEntryForm(projId, partyId) {
  const pid = projId || (DB.projects[0] ? DB.projects[0].id : '')
  const pt = partyId ? DB.parties.filter((x) => x.id === partyId)[0] : null
  return { kind: 'out', projId: pid, stageId: '', section: 'Stone', partyId: partyId || '', who: pt ? pt.name : '', amount: '', mode: 'Cash', ref: '', date: today(), note: '' }
}
export function editEntryForm(t) {
  return { editId: t.id, kind: t.kind, projId: t.projId, stageId: t.stageId || '', section: t.section || 'Stone', partyId: t.partyId || '', who: t.who, amount: String(t.amount), mode: t.mode, ref: t.ref || '', date: t.date, note: t.note || '' }
}
export function newProjectForm() {
  return { name: '', client: '', trust: '', value: '', start: today(), handover: '', stages: DEF_STAGES.map((n) => ({ id: uid(), name: n, amount: '', date: '' })) }
}
export function editProjectForm(ep) {
  return { editId: ep.id, name: ep.name, client: ep.client || '', trust: ep.trust || '', value: String(ep.value), start: ep.start || '', handover: ep.handover || '', stages: ep.stages.map((s) => ({ id: s.id, name: s.name, amount: s.amount ? String(s.amount) : '', date: s.date || '' })) }
}
export function newPartyForm() { return { name: '', type: TYPES[0], phone: '' } }
export function editPartyForm(p) { return { editId: p.id, name: p.name, type: p.type, phone: p.phone || '' } }
export function newBillForm(partyId, projId) {
  return { partyId, projId: projId || (DB.projects[0] ? DB.projects[0].id : ''), amount: '', note: '', date: today() }
}
export function editBillForm(b) { return { editId: b.id, partyId: b.partyId, projId: b.projId, amount: String(b.amount), note: b.note || '', date: b.date } }
export function newStage() { return { id: uid(), name: '', amount: '', date: '' } }
export function newOption() { return { id: uid(), stone: '', mandir: '', rang: '', sqft: '' } }

export function proposalForm(id, copy) {
  const pr = id ? findProp(id) : null
  if (pr) {
    const f = { editId: pr.id, kind: pr.kind || 'temple', item: pr.item || '', by: pr.by || '', god: pr.god, loc: pr.loc || '', pt: pr.pt || 'v', date: pr.date, lg: pr.lg || 'gu', signer: pr.signer || '', touched: true, options: pr.options.map((o) => ({ id: o.id, stone: o.stone || '', mandir: o.mandir ? String(o.mandir) : '', rang: o.rang ? String(o.rang) : '', sqft: o.sqft ? String(o.sqft) : '' })), notes: (pr.notes || []).slice() }
    if (copy) { f.editId = undefined; f.god = ''; f.loc = ''; f.date = today() }
    return f
  }
  const lg = curLang()
  return { kind: 'temple', item: ITEMS[lg][0], by: '', god: '', loc: '', pt: 'v', date: today(), lg, signer: DB.biz.signer || 'Manoj Vinodrai Sompura', touched: false, options: [newOption()], notes: presetNotes('temple', lg) }
}

/* ---------- saves: return an error string, or null when saved ---------- */
const refOf = (f) => (f.mode === 'Bank' || f.mode === 'Cheque' ? String(f.ref || '').trim() : '')

export function saveEntry(f) {
  const amount = num(f.amount), inn = f.kind === 'in'
  if (!amount) return { err: 'Enter an amount greater than zero.' }
  let who = String(f.who || '').trim()
  const pt = f.partyId ? DB.parties.filter((x) => x.id === f.partyId)[0] : null
  if (!inn && pt) who = pt.name
  if (!who) return { err: inn ? 'Enter who paid you.' : 'Enter who you paid.' }
  if (!f.date) return { err: 'Choose a date.' }
  if (f.editId) {
    const ex = findTxn(f.editId)
    if (ex) {
      Object.assign(ex, { projId: f.projId, stageId: inn ? f.stageId : '', section: inn ? '' : f.section, partyId: inn ? '' : f.partyId || '', who, amount, mode: f.mode, ref: refOf(f), date: f.date, note: String(f.note || '').trim() })
      save()
      toast('Entry updated')
      return { id: ex.id, edited: true }
    }
  }
  DB.vseq = (DB.vseq || 0) + 1
  const t = { id: uid(), kind: f.kind, projId: f.projId, stageId: inn ? f.stageId : '', section: inn ? '' : f.section, partyId: inn ? '' : f.partyId || '', who, amount, mode: f.mode, ref: refOf(f), date: f.date, note: String(f.note || '').trim(), vno: 'BTC-' + pad(DB.vseq, 4) }
  DB.txns.push(t)
  save()
  return { id: t.id }
}

export function saveProject(f) {
  const value = num(f.value)
  if (!String(f.name).trim()) return { err: 'Enter the project name.' }
  if (!value) return { err: 'Enter the total deal value.' }
  const st = f.stages.filter((s) => String(s.name).trim())
  if (!st.length) return { err: 'Add at least one stage.' }
  if (f.editId) {
    const ep = DB.projects.filter((x) => x.id === f.editId)[0]
    const old = {}, keep = {}
    ep.stages.forEach((s) => { old[s.id] = s })
    const st2 = st.map((s) => ({ id: s.id, name: s.name.trim(), amount: num(s.amount), date: s.date, done: old[s.id] ? old[s.id].done : false }))
    st2.forEach((s) => { keep[s.id] = 1 })
    DB.txns.forEach((t) => { if (t.projId === ep.id && t.stageId && !keep[t.stageId]) t.stageId = '' })
    Object.assign(ep, { name: f.name.trim(), client: String(f.client).trim(), trust: String(f.trust || '').trim(), value, start: f.start, handover: f.handover, stages: st2 })
    save()
    toast('Project updated')
    return { id: ep.id, edited: true }
  }
  const p = { id: uid(), name: f.name.trim(), client: String(f.client).trim(), trust: String(f.trust || '').trim(), value, start: f.start, handover: f.handover, stages: st.map((s) => ({ id: s.id, name: s.name.trim(), amount: num(s.amount), date: s.date, done: false })) }
  DB.projects.push(p)
  save()
  return { id: p.id }
}

export function saveParty(f) {
  if (!String(f.name).trim()) return { err: 'Enter a name.' }
  if (f.editId) {
    const ep = DB.parties.filter((x) => x.id === f.editId)[0]
    Object.assign(ep, { name: f.name.trim(), type: f.type, phone: String(f.phone).trim() })
    DB.txns.forEach((t) => { if (t.partyId === ep.id) t.who = ep.name })
    save()
    toast('Person updated')
    return { id: ep.id }
  }
  const p = { id: uid(), name: f.name.trim(), type: f.type, phone: String(f.phone).trim() }
  DB.parties.push(p)
  save()
  toast('Person added')
  return { id: p.id }
}

export function saveBill(f) {
  const am = num(f.amount)
  if (!am) return { err: 'Enter an amount greater than zero.' }
  if (f.editId) {
    const bt = findTxn(f.editId)
    Object.assign(bt, { amount: am, projId: f.projId, note: String(f.note || '').trim(), date: f.date || today() })
    save()
    toast('Bill updated')
    return { id: bt.id }
  }
  const t = { id: uid(), kind: 'bill', projId: f.projId, stageId: '', section: '', partyId: f.partyId, who: (DB.parties.filter((x) => x.id === f.partyId)[0] || {}).name || '', amount: am, mode: '', date: f.date || today(), note: String(f.note || '').trim(), vno: '' }
  DB.txns.push(t)
  save()
  toast('Bill added')
  return { id: t.id }
}

export function saveProposal(f) {
  if (!stripGod(f.god)) return { err: "Write which God's temple it is." }
  let opts = f.options.filter((o) => num(o.mandir) || num(o.rang))
  if (f.kind === 'small') {
    opts = f.options.slice(0, 1)
    if (!num(opts[0].mandir)) return { err: 'Write the amount.' }
    if (!String(f.item || '').trim()) return { err: 'Write what is being made (for example Sihasan).' }
  } else if (!opts.length) return { err: 'Add the rate (amount) for at least one option.' }
  const notes = f.notes.map((x) => String(x).trim()).filter(Boolean)
  const base = { kind: f.kind || 'temple', item: String(f.item || '').trim(), by: String(f.by || '').trim(), god: stripGod(f.god), loc: String(f.loc || '').trim(), pt: f.pt, date: f.date || today(), lg: f.lg, signer: String(f.signer || '').trim(), options: opts.map((o) => ({ id: o.id, stone: String(o.stone || '').trim(), mandir: num(o.mandir), rang: num(o.rang), sqft: num(o.sqft) })), notes }
  DB.biz.signer = base.signer || DB.biz.signer
  DB.biz.lang = f.lg
  if (f.editId) {
    const pr = findProp(f.editId)
    Object.assign(pr, base)
    save()
    return { id: pr.id }
  }
  DB.pseq = (DB.pseq || 0) + 1
  base.id = uid()
  base.vno = 'BTP-' + pad(DB.pseq, 3)
  DB.proposals.push(base)
  save()
  return { id: base.id }
}

export function saveNotesDefault(f) {
  const k = f.kind || 'temple'
  DB.terms = DB.terms || {}
  DB.terms[k] = DB.terms[k] || {}
  DB.terms[k][f.lg] = f.notes.map((x) => String(x).trim()).filter(Boolean)
  save()
  toast('Saved. These notes will be used for new proposals.')
}

export function toggleStage(projId, stageId) {
  const p = DB.projects.filter((x) => x.id === projId)[0]
  p.stages.forEach((s) => { if (s.id === stageId) s.done = !s.done })
  save()
}

/* ---------- deletes (with Undo) ---------- */
export function deleteProject(id) {
  delWith('Project deleted', () => {
    DB.txns = DB.txns.filter((x) => x.projId !== id)
    DB.projects = DB.projects.filter((x) => x.id !== id)
  })
}
export function deleteParty(id) { delWith('Person deleted', () => { DB.parties = DB.parties.filter((x) => x.id !== id) }) }
export function deleteTxn(id, msg) { delWith(msg || 'Entry deleted', () => { DB.txns = DB.txns.filter((x) => x.id !== id) }) }
export function deleteProposal(id) { delWith('Proposal deleted', () => { DB.proposals = DB.proposals.filter((x) => x.id !== id) }) }

/* ---------- settings ---------- */
export function saveBiz(b) {
  DB.biz = Object.assign({}, DB.biz, { name: String(b.name).trim() || 'My Business', phone: String(b.phone).trim(), addr: String(b.addr).trim() })
  save()
  toast('Details saved')
}
export function setLetterheadBW(bw) { DB.biz.lhBW = !!bw; save() }
export function setLang(lg) { DB.biz.lang = lg; save() }
export function setProposalLang(id, g) {
  const pr = findProp(id)
  const old = pr.lg || 'gu'
  if (JSON.stringify(pr.notes) === JSON.stringify(presetNotes(pr.kind || 'temple', old))) pr.notes = presetNotes(pr.kind || 'temple', g)
  pr.lg = g
  DB.biz.lang = g
  save()
}
export function backupText() { return JSON.stringify(DB) }
export function restoreBackup(text) {
  try {
    const d = JSON.parse(text)
    if (!d || !d.projects || !d.parties || !d.txns) throw 0
    d.biz = d.biz || blank().biz
    d.proposals = d.proposals || []
    d.pseq = d.pseq || 0
    d.terms = d.terms || {}
    setDB(d)
    save()
    toast('Backup restored')
    return null
  } catch (e) {
    return 'This does not look like a valid backup.'
  }
}

/* ---------- documents ---------- */
async function pdf(mode, fn) {
  try { await loadPdfLibs() } catch (e) { toast('PDF tool could not load. Check your internet and try again.'); return }
  setPdfMode(mode)
  fn()
}
export const docs = {
  voucherPdf: (id, mode = 'save') => pdf(mode, () => pdfVoucher(findTxn(id))),
  voucherShare: async (id) => {
    const t = findTxn(id)
    try { await loadPdfLibs() } catch (e) { shareText(voucherText(t), 'Voucher'); return }
    setPdfMode('share'); pdfVoucher(t)
  },
  voucherPrint: (id) => printVoucher(id),
  reportPdf: (id, mode = 'save') => pdf(mode, () => pdfReport(id)),
  proposalPdf: (id, mode = 'save') => pdf(mode, () => pdfProposal(id)),
  proposalPrint: (id) => printProposal(id),
  proposalText: (id) => proposalText(findProp(id)),
  statementPdf: (id, mode = 'save') => pdf(mode, () => pdfStatement(derive().pById[id])),
  statementShare: async (id) => {
    const x = derive().pById[id]
    try { await loadPdfLibs() } catch (e) { shareText(stmtText(x), 'Statement'); return }
    setPdfMode('share'); pdfStatement(x)
  },
}
export { KEY, notify }
