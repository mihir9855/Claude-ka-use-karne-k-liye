import { useEffect, useRef, useState } from 'react'
import { animate, motion } from 'motion/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Row, Vehicle, VehicleId } from '../engine/engine'
import { monthlySpend } from '../engine/engine'
import { cn, fmtDate, fmtMonth, inr } from '../lib/utils'

export function Count({ value, digits = 1 }: { value: number; digits?: number }) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const c = animate(from.current, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate: (x) => {
        from.current = x
        setV(x)
      },
    })
    return () => c.stop()
  }, [value])
  return <>{v.toFixed(digits)}</>
}

export function VehicleSwitch({ vehicles, v, onChange }: { vehicles: Vehicle[]; v: VehicleId; onChange: (v: VehicleId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-soft p-1" role="group" aria-label="Choose vehicle">
      {vehicles.map((x) => (
        <button
          key={x.id}
          type="button"
          aria-pressed={v === x.id}
          onClick={() => onChange(x.id)}
          className="relative min-w-0 rounded-xl px-3 py-2.5 text-left"
        >
          {v === x.id && <motion.span layoutId="veh-pill" className="absolute inset-0 rounded-xl bg-card shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative block truncate font-display text-[15px] font-semibold" style={{ color: v === x.id ? `var(--${x.id})` : undefined }}>{x.name}</span>
          <span className="relative block truncate text-[11.5px] text-muted">{x.fuel} · {x.avgUnit}</span>
        </button>
      ))}
    </div>
  )
}

export const Card = ({ title, hint, children, className }: { title?: string; hint?: string; children: React.ReactNode; className?: string }) => (
  <section className={cn('rounded-3xl border border-line bg-card p-4', className)}>
    {title && (
      <h2 className="mb-3 flex items-baseline justify-between font-display text-[15px] font-semibold">
        {title}
        {hint && <span className="font-sans text-xs font-normal text-muted">{hint}</span>}
      </h2>
    )}
    {children}
  </section>
)

const tick = { fontSize: 10, fill: 'var(--muted)' }
const tip = { background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12, color: 'var(--fg)' }

export function Trend({ rs, mean, unit }: { rs: Row[]; mean: number | null; unit: string }) {
  const data = rs.filter((r) => r.avg !== null).map((r) => ({ d: fmtDate(r.date), avg: +(r.avg as number).toFixed(2) }))
  if (data.length < 2) return <p className="py-6 text-center text-sm text-muted">Add two full-tank fill-ups to see the trend.</p>
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="d" tick={tick} axisLine={false} tickLine={false} />
          <YAxis domain={[(m: number) => Math.floor(m - 1), (m: number) => Math.ceil(m + 1)]} tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tip} formatter={(v) => [`${v} ${unit}`, 'Average']} />
          {mean !== null && <ReferenceLine y={mean} stroke="var(--accent)" strokeDasharray="4 4" strokeOpacity={0.6} />}
          <Area type="monotone" dataKey="avg" stroke="var(--accent)" strokeWidth={2.5} fill="url(#trend)" dot={{ r: 3, fill: 'var(--card)', stroke: 'var(--accent)', strokeWidth: 2 }} activeDot={{ r: 5, fill: 'var(--accent)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Spend({ rs }: { rs: Row[] }) {
  const data = monthlySpend(rs).map((m) => ({ ...m, m: fmtMonth(m.k) }))
  if (!data.length) return <p className="py-6 text-center text-sm text-muted">No fill-ups yet.</p>
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="m" tick={tick} axisLine={false} tickLine={false} />
          <YAxis tick={tick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tip} cursor={{ fill: 'var(--soft)' }} formatter={(v) => [inr(Number(v)), 'Spent']} />
          <Bar dataKey="spend" fill="var(--accent)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FillRow({ r, unit, onDelete, confirming }: { r: Row; unit: string; onDelete?: () => void; confirming?: boolean }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 border-t border-line py-3 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-semibold">
          {fmtDate(r.date)}
          {!r.full && <span className="rounded-full bg-soft px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted">Partial</span>}
        </div>
        <div className="truncate text-[12.5px] text-muted tnum">{r.km} km · {r.qty.toFixed(1)} {unit} @ ₹{r.price}/{unit}</div>
      </div>
      <div className="text-right">
        <div className="font-display text-2xl font-semibold leading-none text-accent tnum">{r.avg !== null ? r.avg.toFixed(1) : '–'}</div>
        <div className="text-[12.5px] text-muted tnum">{inr(r.cost)}</div>
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} className={cn('col-span-2 mt-1 justify-self-end text-xs', confirming ? 'font-semibold text-bad' : 'text-muted')}>
          {confirming ? 'Tap again to delete' : 'Delete'}
        </button>
      )}
    </div>
  )
}
