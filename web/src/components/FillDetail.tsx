import { useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Copy, Pencil, Trash2, X } from 'lucide-react'
import { rows, summary, vehicleOf } from '../engine/engine'
import type { DB, Fill, VehicleId } from '../engine/engine'
import { actions } from '../engine/store'
import { cn, fmtDateLong, inr } from '../lib/utils'

const Item = ({ k, v, sub }: { k: string; v: string; sub?: string }) => (
  <div className="flex min-w-0 flex-col gap-0.5 rounded-2xl bg-soft px-3 py-2.5">
    <span className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">{k}</span>
    <span className="truncate font-display text-xl font-semibold leading-tight tnum">{v}</span>
    {sub && <span className="truncate text-[11.5px] text-muted">{sub}</span>}
  </div>
)

/** Full page for one fill-up: numbers, comparison with the overall average, note, and every action. */
export function FillDetail({ db, v, id, onSelect, onEdit, onClose }: { db: DB; v: VehicleId; id: string; onSelect: (id: string) => void; onEdit: (f: Fill) => void; onClose: () => void }) {
  const veh = vehicleOf(db, v)
  const rs = rows(db, v)
  const i = rs.findIndex((r) => r.id === id)
  const r = rs[i]
  const s = summary(rs, veh)

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  // The fill-up was deleted (or belongs to another vehicle): close.
  useEffect(() => {
    if (!r) onClose()
  }, [r, onClose])
  if (!r) return null

  const older = i > 0 ? rs[i - 1] : null
  const newer = i < rs.length - 1 ? rs[i + 1] : null
  const fill = db.fills.find((f) => f.id === id) as Fill
  const diff = r.avg !== null && s.overall !== null ? r.avg - s.overall : null
  const priceDiff = older ? r.price - older.price : null
  const perKm = r.avg !== null && r.spanKm > 0 ? r.spanCost / r.spanKm : null
  const scale = s.best ? Math.min(1, (r.avg ?? 0) / (s.best * 1.1)) : 0
  const overallAt = s.best && s.overall ? Math.min(1, s.overall / (s.best * 1.1)) : 0

  const copy = async () => {
    const text = [
      `${veh.name} · ${fmtDateLong(r.date)}`,
      `Odometer: ${r.odo} km${r.km > 0 ? ` (+${r.km} km)` : ''}`,
      `${veh.fuel}: ${r.qty.toFixed(2)} ${veh.unit} @ ₹${r.price}/${veh.unit} = ${inr(r.cost)}`,
      r.avg !== null ? `Average: ${r.avg.toFixed(1)} ${veh.avgUnit}` : r.full ? 'Starting point' : 'Partial fill-up',
      r.note ? `Note: ${r.note}` : '',
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Details copied')
    } catch {
      toast.error('Could not copy on this device')
    }
  }
  const remove = () => {
    const gone = actions.remove(id)
    if (gone) toast('Fill-up deleted', { duration: 8000, action: { label: 'Undo', onClick: () => actions.restoreFill(gone) } })
  }

  return (
    <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 desk:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        role="dialog"
        aria-label="Fill-up details"
        className="flex max-h-[92dvh] w-full max-w-[460px] flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] desk:rounded-[28px]"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Older fill-up" disabled={!older} onClick={() => older && onSelect(older.id)} className="grid size-9 place-items-center rounded-full bg-soft disabled:opacity-30"><ChevronLeft size={18} /></button>
          <div className="min-w-0 flex-1 text-center">
            <div className="truncate font-display text-lg font-semibold">{fmtDateLong(r.date)}</div>
            <div className="truncate text-xs text-muted">{veh.name} · fill-up {i + 1} of {rs.length}</div>
          </div>
          <button type="button" aria-label="Newer fill-up" disabled={!newer} onClick={() => newer && onSelect(newer.id)} className="grid size-9 place-items-center rounded-full bg-soft disabled:opacity-30"><ChevronRight size={18} /></button>
          <button type="button" aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-soft"><X size={18} /></button>
        </div>

        <section className="rounded-3xl p-4 text-white" style={{ background: 'var(--hero)' }}>
          <div className="text-[11px] font-semibold uppercase tracking-[.1em] opacity-80">{r.avg !== null ? 'Average this fill-up' : r.full ? 'Starting point' : 'Partial fill-up'}</div>
          {r.avg !== null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold leading-none tnum">{r.avg.toFixed(1)}</span>
                <span className="font-display text-xl font-semibold opacity-90">{veh.avgUnit}</span>
              </div>
              {diff !== null && (
                <div className="mt-1 text-[13px] opacity-95">{Math.abs(diff) < 0.05 ? 'Same as your overall average' : `${Math.abs(diff).toFixed(1)} ${diff > 0 ? 'better' : 'lower'} than your overall ${s.overall?.toFixed(1)}`}</div>
              )}
              <div className="relative mt-3 h-2 rounded-full bg-white/25" aria-hidden>
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${scale * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
                <div className="absolute -top-1 h-4 w-0.5 rounded bg-white/90" style={{ left: `${overallAt * 100}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] opacity-80"><span>0</span><span>marker = overall</span><span>best {s.best?.toFixed(1)}</span></div>
            </>
          ) : (
            <div className="mt-1 text-[13px] opacity-95">{r.full ? 'The average starts from the next full-tank fill-up.' : 'The fuel is added to the next full-tank fill-up, which then shows the average.'}</div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Item k="Odometer" v={`${r.odo.toLocaleString('en-IN')} km`} />
          <Item k="Distance" v={r.km > 0 ? `${r.km} km` : '–'} sub={r.km > 0 ? 'since previous fill-up' : 'starting point'} />
          <Item k={`${veh.fuel} filled`} v={`${r.qty.toFixed(2)} ${veh.unit}`} sub={r.full ? 'tank filled to full' : 'partial fill'} />
          <Item k="Amount paid" v={inr(r.cost)} />
          <Item k={`Price per ${veh.unit}`} v={`₹${r.price}`} sub={priceDiff === null ? undefined : priceDiff === 0 ? 'same as before' : `${priceDiff > 0 ? 'up' : 'down'} ₹${Math.abs(priceDiff).toFixed(2)} from before`} />
          <Item k="Cost per km" v={perKm !== null ? `₹${perKm.toFixed(2)}` : '–'} sub={perKm !== null ? 'this stretch' : 'needs a full-tank pair'} />
        </div>

        <div className={cn('rounded-2xl border border-line px-3 py-2.5 text-sm', !r.note && 'text-muted')}>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Note</div>
          {r.note || 'No note. Tap Edit to add one.'}
        </div>

        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <button type="button" onClick={() => { onClose(); onEdit(fill) }} className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 font-semibold text-white"><Pencil size={16} /> Edit</button>
          <button type="button" aria-label="Copy details" onClick={copy} className="grid w-12 place-items-center rounded-2xl border border-line"><Copy size={18} /></button>
          <button type="button" aria-label="Delete fill-up" onClick={remove} className="grid w-12 place-items-center rounded-2xl border border-line text-bad"><Trash2 size={18} /></button>
        </div>
      </motion.div>
    </motion.div>
  )
}
