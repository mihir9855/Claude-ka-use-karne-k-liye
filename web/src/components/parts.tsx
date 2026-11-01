import { useEffect, useRef, useState } from 'react'
import { animate, motion } from 'motion/react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DB, Row, Vehicle, VehicleId } from '../engine/engine'
import { monthlySpend, rows as rowsOf } from '../engine/engine'
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
    <div className="flex gap-1 overflow-x-auto rounded-2xl bg-soft p-1 [scrollbar-width:none]" role="group" aria-label="Choose vehicle">
      {vehicles.map((x) => (
        <button
          key={x.id}
          type="button"
          data-c={x.hue}
          aria-pressed={v === x.id}
          onClick={() => onChange(x.id)}
          className={cn('relative min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left', vehicles.length > 2 && 'min-w-[140px]')}
        >
          {v === x.id && <motion.span layoutId="veh-pill" className="absolute inset-0 rounded-xl bg-card shadow-sm" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className={cn('relative block truncate font-display text-[15px] font-semibold', v === x.id && 'text-accent')}>{x.name}</span>
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

/** Thin white line of the last averages, drawn along the bottom of the hero card. */
export function Spark({ rs }: { rs: Row[] }) {
  const v = rs.filter((r) => r.avg !== null).map((r) => r.avg as number)
  if (v.length < 2) return null
  const lo = Math.min(...v)
  const hi = Math.max(...v)
  const W = 300
  const H = 46
  const pts = v.map((a, i) => [(i * W) / (v.length - 1), H - 6 - ((a - lo) / (hi - lo || 1)) * (H - 14)])
  const line = pts.map((p) => p.join(',')).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2 h-11 w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="url(#spark)" />
      <motion.polyline points={line} fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill="#fff" />
    </svg>
  )
}

/** Half-circle gauge: where the overall average sits between zero and the best fill-up. */
export function Gauge({ value, best, unit }: { value: number | null; best: number | null; unit: string }) {
  const target = value !== null && best ? Math.min(1, value / (best * 1.15)) : 0
  const [r, setR] = useState(0)
  useEffect(() => {
    const c = animate(0, target, { duration: 1, ease: 'easeOut', onUpdate: setR })
    return () => c.stop()
  }, [target])
  const R = 92
  const cx = 110
  const cy = 112
  const ang = Math.PI * (1 - r)
  const dot = [cx + R * Math.cos(ang), cy - R * Math.sin(ang)]
  const arc = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 220 130" className="w-full" role="img" aria-label="Average gauge">
        <path d={arc} fill="none" stroke="var(--soft)" strokeWidth={16} strokeLinecap="round" />
        {r > 0.01 && <path d={arc} fill="none" stroke="var(--accent)" strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${r} 2`} />}
        {value !== null && <circle cx={dot[0]} cy={dot[1]} r={9} fill="var(--card)" stroke="var(--accent)" strokeWidth={4} />}
        <text x={cx - R} y={cy + 16} textAnchor="middle" fontSize={10} fill="var(--muted)">0</text>
        <text x={cx + R} y={cy + 16} textAnchor="middle" fontSize={10} fill="var(--muted)">{best ? (best * 1.15).toFixed(0) : ''}</text>
      </svg>
      <div className="absolute inset-x-0 bottom-3 text-center">
        <div className="font-display text-5xl font-bold leading-none tnum text-accent">{value !== null ? <Count value={value} /> : '–'}</div>
        <div className="mt-1 text-xs text-muted">{unit} overall</div>
      </div>
    </div>
  )
}

export function PriceTrend({ rs, unit }: { rs: Row[]; unit: string }) {
  const data = rs.map((r) => ({ d: fmtDate(r.date), p: r.price }))
  if (data.length < 2) return <p className="py-6 text-center text-sm text-muted">Add two fill-ups to see the price trend.</p>
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="d" tick={tick} axisLine={false} tickLine={false} />
          <YAxis domain={[(m: number) => Math.floor(m - 2), (m: number) => Math.ceil(m + 2)]} tick={tick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tip} formatter={(v) => [`₹${v}/${unit}`, 'Price']} />
          <Line type="stepAfter" dataKey="p" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function KmMonthly({ rs }: { rs: Row[] }) {
  const m = new Map<string, number>()
  rs.forEach((r) => m.set(r.date.slice(0, 7), (m.get(r.date.slice(0, 7)) ?? 0) + r.km))
  const data = [...m.entries()].sort().map(([k, km]) => ({ m: fmtMonth(k), km }))
  if (!data.length) return <p className="py-6 text-center text-sm text-muted">No fill-ups yet.</p>
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="m" tick={tick} axisLine={false} tickLine={false} />
          <YAxis tick={tick} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tip} cursor={{ fill: 'var(--soft)' }} formatter={(v) => [`${v} km`, 'Driven']} />
          <Bar dataKey="km" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill="var(--accent)" fillOpacity={i === data.length - 1 ? 1 : 0.55} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Donut of how much each vehicle has cost so far. */
export function SpendDonut({ db }: { db: DB }) {
  const data = db.vehicles.map((v) => ({ name: v.name, hue: v.hue, value: Math.round(rowsOf(db, v.id).reduce((a, r) => a + r.cost, 0)) })).filter((d) => d.value > 0)
  const total = data.reduce((a, d) => a + d.value, 0)
  if (!total) return <p className="py-6 text-center text-sm text-muted">No fill-ups yet.</p>
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="64%" outerRadius="100%" paddingAngle={3} cornerRadius={6} stroke="none" startAngle={90} endAngle={-270}>
              {data.map((d) => <Cell key={d.name} fill={`var(--a${d.hue})`} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div><div className="font-display text-xl font-semibold tnum">{inr(total)}</div><div className="text-[11px] text-muted">total</div></div>
        </div>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="size-3 shrink-0 rounded-full" style={{ background: `var(--a${d.hue})` }} />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="tnum text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
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
