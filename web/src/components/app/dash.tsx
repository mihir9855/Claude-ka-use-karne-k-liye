import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { motion } from 'motion/react'
import { BlurFade } from '@/magicui/blur-fade'
import { NumberTicker } from '@/magicui/number-ticker'
import { BorderBeam } from '@/magicui/border-beam'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { SectionTitle } from '@/components/app/common'
import { LH } from '@/engine/engine.js'
import { TxnRow } from '@/components/app/rows'
import { AnimatedBackground } from '@/motion-primitives/animated-background'
import { DB, INR, MON, SECTIONS, SHORT, fmt } from '@/engine/engine.js'
import { cn } from '@/lib/utils'

export const SEC_COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']

export function CashHero({ D, className }: { D: any; className?: string }) {
  const pct = D.totalValue ? Math.round((D.received / D.totalValue) * 100) : 0
  return (
    <div className={cn('jaali relative overflow-hidden rounded-3xl bg-[image:var(--hero-grad)] p-5 text-white shadow-lg', className)}>
      <img src={LH.w} alt="" className="hero-mark mandir-only" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,.16),transparent_55%)]" />
      <div className="relative">
        <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Cash in hand · all projects</div>
        <div className="font-display gold-text mt-1 text-[44px] font-extrabold leading-none tn">
          {D.cash < 0 ? '−' : ''}₹<NumberTicker value={Math.abs(D.cash)} className="text-inherit dark:text-inherit" />
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex items-end justify-between gap-3 text-xs">
            <span className="opacity-80">Collected from clients</span>
            <span className="font-bold tn">{SHORT(D.received)} <span className="font-medium opacity-75">of {SHORT(D.totalValue)}</span></span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <motion.i className="block h-full rounded-full bg-[var(--hero-glow)]" initial={{ width: 0 }} animate={{ width: Math.min(100, pct) + '%' }} transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} />
          </div>
          <div className="mt-1.5 text-right text-xs font-bold tn">{pct}%</div>
        </div>
      </div>
      <BorderBeam size={120} duration={9} colorFrom="#f0c36d" colorTo="#ffffff" />
    </div>
  )
}

export function Kpi({ label, value, note, tone, i = 0, className }: { label: string; value: number; note: string; tone: string; i?: number; className?: string }) {
  return (
    <BlurFade delay={0.05 * i} inView className={className}>
      <div data-kpi={label.replace(/\s/g, '').toLowerCase()} className={cn('kpi-arch relative h-full overflow-hidden rounded-3xl p-4', tone)}>
        <div className="text-xs font-semibold opacity-80">{label}</div>
        <div className="font-display tn mt-1 text-[26px] font-extrabold leading-tight">{SHORT(value)}</div>
        <div className="mt-1 text-xs opacity-75">{note}</div>
      </div>
    </BlurFade>
  )
}

export function Kpis({ D }: { D: any }) {
  return (
    <>
      <Kpi i={1} label="Received" value={D.received} note={`This month ${SHORT(D.month.inn)}`} tone="bg-income-soft text-income" />
      <Kpi i={2} label="Spent" value={D.spent} note={`This month ${SHORT(D.month.out)}`} tone="bg-expense-soft text-expense" />
      <Kpi i={3} label="To receive" value={D.toReceive} note="From clients" tone="bg-saffron-soft text-saffron" />
      <Kpi i={4} label="To pay" value={D.owe} note="To suppliers and workers" tone="bg-info-soft text-info" />
    </>
  )
}

export function WaterfallCard({ D }: { D: any; h?: string }) {
  const rec = D.received
  const parts = SECTIONS.map((s: string, i: number) => ({ name: s, v: D.sec[s] as number, c: SEC_COLORS[i] })).filter((x: any) => x.v > 0)
  const inHand = rec - D.spent
  return (
    <Card className="h-full rounded-3xl p-5">
      <SectionTitle>Where the money goes</SectionTitle>
      {rec ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <div><div className="text-xs text-muted-foreground">Received</div><div className="font-display tn text-2xl font-extrabold text-income">{INR(rec)}</div></div>
            <div className="text-right"><div className="text-xs text-muted-foreground">{inHand < 0 ? 'Overspent' : 'In hand'}</div><div className={cn('font-display tn text-2xl font-extrabold', inHand < 0 ? 'text-expense' : 'text-primary')}>{INR(Math.abs(inHand))}</div></div>
          </div>
          <div className="mt-3 flex h-6 gap-1 overflow-hidden rounded-full bg-muted p-1" role="img" aria-label="How the received money was spent">
            {parts.map((p: any, i: number) => (
              <motion.i key={p.name} title={`${p.name} ${INR(p.v)}`} className="block h-full rounded-full" style={{ background: p.c }} initial={{ width: 0 }} animate={{ width: Math.min(100, (p.v / rec) * 100) + '%' }} transition={{ duration: 0.8, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }} />
            ))}
            {inHand > 0 ? <motion.i className="block h-full flex-1 rounded-full bg-primary/25" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} /> : null}
          </div>
          <div className="mt-4 grid gap-1">
            {parts.map((p: any) => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl px-1 py-1.5 text-sm">
                <i className="size-3 shrink-0 rounded-[4px]" style={{ background: p.c }} />
                <span className="flex-1 truncate font-semibold">{p.name}</span>
                <span className="tn text-muted-foreground">{Math.round((p.v / rec) * 100)}%</span>
                <b className="tn w-28 text-right">{INR(p.v)}</b>
              </div>
            ))}
          </div>
        </>
      ) : <div className="py-12 text-center text-sm text-muted-foreground">This appears once you record money received from a client.</div>}
    </Card>
  )
}

export function DonutCard({ D }: { D: any }) {
  const tiles = SECTIONS.map((s: string, i: number) => ({ name: s, v: D.sec[s] as number, c: SEC_COLORS[i] })).filter((x: any) => x.v > 0).sort((a: any, b: any) => b.v - a.v)
  return (
    <Card className="h-full rounded-3xl p-5">
      <SectionTitle>Spending by section</SectionTitle>
      {tiles.length ? (
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((t: any, i: number) => {
            const share = t.v / D.spent
            return (
              <motion.div key={t.name} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className={cn('flex min-h-24 flex-col justify-between rounded-2xl p-3 text-white', i === 0 && 'col-span-2')}
                style={{ background: `linear-gradient(135deg, ${t.c}, color-mix(in oklab, ${t.c} 62%, #000))` }}>
                <span className="text-xs font-semibold opacity-90">{t.name}</span>
                <div><div className="font-display tn text-xl font-extrabold leading-tight">{SHORT(t.v)}</div><div className="text-xs opacity-85">{Math.round(share * 100)}% of spending</div></div>
              </motion.div>
            )
          })}
        </div>
      ) : <div className="py-12 text-center text-sm text-muted-foreground">No spending yet.</div>}
    </Card>
  )
}

type Range = 'week' | 'month' | 'year'
const RANGES: [Range, string][] = [['week', 'Week'], ['month', 'Month'], ['year', 'Year']]
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad2 = (n: number) => String(n).padStart(2, '0')
const isoOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

function series(range: Range) {
  const now = new Date()
  const rows: { k: string; l: string; inn: number; out: number }[] = []
  if (range === 'week') {
    for (let i = 6; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i); rows.push({ k: isoOf(d), l: WD[d.getDay()], inn: 0, out: 0 }) }
  } else if (range === 'month') {
    const last = now.getDate()
    for (let day = 1; day <= last; day++) rows.push({ k: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(day)}`, l: String(day), inn: 0, out: 0 })
  } else {
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); rows.push({ k: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`, l: MON[d.getMonth()], inn: 0, out: 0 }) }
  }
  const idx: Record<string, number> = {}
  rows.forEach((r, i) => { idx[r.k] = i })
  DB.txns.forEach((t: any) => {
    if (!t.date || (t.kind !== 'in' && t.kind !== 'out')) return
    const i = idx[range === 'year' ? t.date.slice(0, 7) : t.date]
    if (i == null) return
    if (t.kind === 'in') rows[i].inn += t.amount
    else rows[i].out += t.amount
  })
  return rows
}

export function MonthsCard({ D, h = 'h-52' }: { D: any; h?: string }) {
  const [range, setRange] = useState<Range>('week')
  const data = useMemo(() => series(range), [range, D])
  const totIn = data.reduce((a, r) => a + r.inn, 0), totOut = data.reduce((a, r) => a + r.out, 0)
  const cfg: ChartConfig = { inn: { label: 'Received', color: 'var(--income)' }, out: { label: 'Spent', color: 'var(--expense)' } }
  const title = range === 'week' ? 'Last 7 days' : range === 'month' ? 'This month' : 'Last 12 months'
  return (
    <Card className="h-full rounded-3xl p-5">
      <SectionTitle right={
        <div className="inline-flex rounded-full bg-muted p-1">
          <AnimatedBackground defaultValue={range} onValueChange={(v) => v && setRange(v as Range)} className="rounded-full bg-card shadow" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}>
            {RANGES.map(([k, l]) => (
              <button key={k} data-id={k} className="px-3 py-1 text-xs font-semibold text-muted-foreground transition data-[checked=true]:text-foreground">{l}</button>
            ))}
          </AnimatedBackground>
        </div>
      }>{title}</SectionTitle>
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground"><i className="size-2.5 rounded-sm bg-income" />Received <b className="tn text-foreground">{SHORT(totIn)}</b></span>
        <span className="flex items-center gap-1.5 text-muted-foreground"><i className="size-2.5 rounded-sm bg-expense" />Spent <b className="tn text-foreground">{SHORT(totOut)}</b></span>
      </div>
      <ChartContainer config={cfg} className={cn(h, 'w-full')}>
        <AreaChart data={data} margin={{ top: 10, left: 4, right: 4 }}>
          <defs>
            <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-inn)" stopOpacity={0.4} /><stop offset="95%" stopColor="var(--color-inn)" stopOpacity={0} /></linearGradient>
            <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-out)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-out)" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="l" tickLine={false} axisLine={false} interval={range === 'month' ? 'preserveStartEnd' : 0} minTickGap={8} padding={{ left: 14, right: 14 }} tick={{ fontSize: 11 }} />
          <YAxis hide />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="inn" stroke="var(--color-inn)" strokeWidth={2.5} fill="url(#gIn)" dot={range === 'month' ? false : { r: 3 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="out" stroke="var(--color-out)" strokeWidth={2.5} fill="url(#gOut)" dot={range === 'month' ? false : { r: 3 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}

export function HeatCard({ D }: { D: any }) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  const dim = new Date(y, m + 1, 0).getDate(), first = (new Date(y, m, 1).getDay() + 6) % 7, td = now.getDate()
  let mx = 1
  for (const k in D.heat) mx = Math.max(mx, D.heat[k])
  const cells: any[] = []
  for (let i = 0; i < first; i++) cells.push(<span key={'b' + i} />)
  for (let d = 1; d <= dim; d++) {
    const v = D.heat[d] || 0, l = !v ? 0 : Math.min(5, 1 + Math.floor((v / mx) * 4.99))
    cells.push(
      <span key={d} title={`${d} ${MON[m]}${v ? ' · ' + INR(v) : ''}`} className={`grid aspect-square place-items-center rounded-lg text-[10px] font-semibold ${d === td ? 'ring-2 ring-primary' : ''} ${d > td ? 'bg-muted/40 text-muted-foreground/50' : l === 0 ? 'bg-muted text-muted-foreground' : ''}`}
        style={d <= td && l > 0 ? { background: `color-mix(in oklab, var(--expense) ${18 + l * 16}%, var(--card))`, color: l > 3 ? '#fff' : 'inherit' } : undefined}>{d}</span>,
    )
  }
  return (
    <Card className="h-full rounded-3xl p-5">
      <SectionTitle right={<span className="rounded-full bg-expense-soft px-3 py-1 text-xs font-bold text-expense">{SHORT(D.month.out)}</span>}>Daily spending</SectionTitle>
      <div className="mb-2 text-xs text-muted-foreground">This month · darker is more</div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1" role="img" aria-label="Calendar of spending this month">{cells}</div>
    </Card>
  )
}

export function DueCard({ D }: { D: any }) {
  const pend: any[] = []
  D.projects.forEach((p: any) => {
    if (p.status === 'done') return
    for (let i = 0; i < p.stages.length; i++) {
      const s = p.stages[i], left = s.amount - (p.stageRec[s.id] || 0)
      if (left > 0) { pend.push({ p, s, left }); break }
    }
  })
  const owed = D.parties.filter((x: any) => x.bal > 0).sort((a: any, b: any) => b.bal - a.bal)
  return (
    <Card className="h-full rounded-3xl p-5">
      <SectionTitle>Money due</SectionTitle>
      <div className="text-[11px] font-bold tracking-wider text-muted-foreground">TO RECEIVE</div>
      {pend.length ? pend.slice(0, 4).map((x) => (
        <div key={x.p.id + x.s.id} className="flex items-center gap-3 border-b py-2.5 last:border-0"><i className="size-2.5 rounded-full bg-income" /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{x.p.name}</b><span className="text-xs text-muted-foreground">{x.s.name}{x.s.date ? ' · ' + fmt(x.s.date) : ''}</span></div><b className="tn text-sm">{INR(x.left)}</b></div>
      )) : <div className="py-3 text-sm text-muted-foreground">Nothing due.</div>}
      <div className="mt-4 text-[11px] font-bold tracking-wider text-muted-foreground">TO PAY</div>
      {owed.length ? owed.slice(0, 4).map((x: any) => (
        <div key={x.id} className="flex items-center gap-3 border-b py-2.5 last:border-0"><i className="size-2.5 rounded-full bg-expense" /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{x.name}</b><span className="text-xs text-muted-foreground">{x.type}</span></div><b className="tn text-sm">{INR(x.bal)}</b></div>
      )) : <div className="py-3 text-sm text-muted-foreground">Nobody to pay.</div>}
    </Card>
  )
}

export function RecentCard({ D, list }: { D: any; list: any[] }) {
  return (
    <Card className="h-full rounded-3xl p-5">
      <SectionTitle>Recent activity</SectionTitle>
      {list.length ? list.map((t: any) => <TxnRow key={t.id} t={t} D={D} />) : <div className="py-4 text-sm text-muted-foreground">No entries yet. Tap + to add one.</div>}
    </Card>
  )
}
