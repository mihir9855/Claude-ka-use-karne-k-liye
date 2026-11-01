import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { lastOdoOf, previewAvg, rows, validate, vehicleOf } from '../engine/engine'
import type { DB, VehicleId } from '../engine/engine'
import { actions } from '../engine/store'
import { cn, inr, today } from '../lib/utils'

const input = 'w-full rounded-xl border border-line bg-bg px-3 py-3 text-base outline-none focus:border-accent'
const label = 'text-[11px] font-semibold uppercase tracking-[.09em] text-muted'

export function AddSheet({ db, v, onClose }: { db: DB; v: VehicleId; onClose: () => void }) {
  const veh = vehicleOf(db, v)
  const rs = rows(db, v)
  const lastOdo = lastOdoOf(db, v)
  const [odo, setOdo] = useState('')
  const [qty, setQty] = useState('')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState(String(rs.length ? rs[rs.length - 1].price : ''))
  const [date, setDate] = useState(today())
  const [full, setFull] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  // Amount, price and quantity are linked: quantity = amount / price. Editing any one updates the others.
  const r2 = (n: number) => String(Math.round(n * 100) / 100)
  const onAmount = (x: string) => {
    setAmount(x)
    setErr(null)
    setQty(+x > 0 && +price > 0 ? r2(+x / +price) : '')
  }
  const onPrice = (x: string) => {
    setPrice(x)
    setErr(null)
    if (+amount > 0 && +x > 0) setQty(r2(+amount / +x))
    else if (+qty > 0 && +x > 0) setAmount(r2(+qty * +x))
  }
  const onQty = (x: string) => {
    setQty(x)
    setErr(null)
    setAmount(+x > 0 && +price > 0 ? r2(+x * +price) : '')
  }

  const draft = { v, date, odo: +odo, qty: +qty, price: +price || 0, full }
  const avg = previewAvg(db, draft)
  const km = +odo > lastOdo ? +odo - lastOdo : 0
  const first = veh.startOdo === 0 && rs.length === 0

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const m = validate(db, draft)
    if (m) return setErr(m)
    actions.add(draft)
    toast.success('Fill-up saved')
    onClose()
  }

  return (
    <motion.div className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 desk:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <motion.form
        onSubmit={save}
        aria-label="Add fill-up"
        className="flex max-h-dvh w-full max-w-[460px] flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] desk:rounded-[28px]"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <h3 className="font-display text-2xl font-semibold">Add fill-up <span className="text-accent">· {veh.name}</span></h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 flex flex-col gap-1.5">
            <span className={label}>Odometer (km)</span>
            <input id="f-odo" className={input} type="number" inputMode="numeric" autoFocus placeholder={String(lastOdo + 300)} value={odo} onChange={(e) => { setOdo(e.target.value); setErr(null) }} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Amount paid (₹)</span>
            <input id="f-amount" className={input} type="number" inputMode="decimal" step="0.01" placeholder="e.g. 500" value={amount} onChange={(e) => onAmount(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Price per {veh.unit} (₹)</span>
            <input id="f-price" className={input} type="number" inputMode="decimal" step="0.01" value={price} onChange={(e) => onPrice(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>{veh.fuel} filled ({veh.unit})</span>
            <input id="f-qty" className={input} type="number" inputMode="decimal" step="0.01" placeholder="auto" value={qty} onChange={(e) => onQty(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Date</span>
            <input id="f-date" className={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <button type="button" role="switch" aria-checked={full} onClick={() => setFull(!full)} className="flex items-center justify-between rounded-xl bg-soft px-3 py-3 text-left">
          <span>
            <span className="block text-sm font-semibold">Tank filled to full</span>
            <span className="block text-xs text-muted">Turn off for a partial fill. It is added to the next full one.</span>
          </span>
          <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', full ? 'bg-accent' : 'bg-line')}>
            <motion.span className="absolute top-0.5 size-5 rounded-full bg-white shadow" animate={{ left: full ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }} />
          </span>
        </button>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-accent-soft px-4 py-3">
          <div className="min-w-0">
            <div className={label}>This fill-up</div>
            <div className={cn('text-[13px]', err ? 'font-semibold text-bad' : 'text-muted')} role="status">
              {err ?? (first && +odo > 0 ? `First fill-up: ${odo} km becomes your starting point` : km && +qty > 0 ? `${km} km · ${inr(+qty * (+price || 0))}` : 'Enter odometer and quantity')}
            </div>
          </div>
          <div className="whitespace-nowrap font-display text-3xl font-bold text-accent tnum">{avg !== null ? `${avg.toFixed(1)} ${veh.avgUnit}` : '–'}</div>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <button type="button" onClick={onClose} className="rounded-2xl border border-line py-3.5 font-semibold">Cancel</button>
          <button type="submit" className="rounded-2xl bg-accent py-3.5 font-semibold text-white">Save fill-up</button>
        </div>
      </motion.form>
    </motion.div>
  )
}
