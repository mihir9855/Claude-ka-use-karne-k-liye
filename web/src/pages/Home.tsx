import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis, LabelList } from 'recharts'
import { motion } from 'motion/react'
import { FolderPlus, Search } from 'lucide-react'
import { BlurFade } from '@/magicui/blur-fade'
import { NumberTicker } from '@/magicui/number-ticker'
import { BorderBeam } from '@/magicui/border-beam'
import BlurText from '@/react-bits/TextAnimations/BlurText/BlurText'
import { ShimmerButton } from '@/magicui/shimmer-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Logo, SectionTitle, EmptyState, Ornament } from '@/components/app/common'
import { ProjectCard, TxnRow } from '@/components/app/rows'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { INR, LH, MON, SECTIONS, SHORT, fmt, today } from '@/engine/engine.js'
import { newProjectForm } from '@/engine/actions.js'
import { AnimatedBackground } from '@/motion-primitives/animated-background'

const SEC_COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']

function Kpi({ label, value, note, tone, i }: { label: string; value: number; note: string; tone: string; i: number }) {
  return (
    <BlurFade delay={0.05 * i} inView>
      <div className={`kpi-arch relative h-full overflow-hidden rounded-3xl p-4 ${tone}`}>
        <div className="text-xs font-semibold opacity-80">{label}</div>
        <div className="font-display mt-1 text-[26px] font-extrabold leading-tight tn">{SHORT(value)}</div>
        <div className="mt-1 text-xs opacity-75">{note}</div>
      </div>
    </BlurFade>
  )
}

function Heat({ D }: { D: any }) {
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
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="grid grid-cols-7 gap-1" role="img" aria-label="Calendar of spending this month">{cells}</div>
    </div>
  )
}

export default function Home() {
  const { D, DB, txns } = useData()
  const { open } = useModal()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'
  const pct = D.totalValue ? Math.round((D.received / D.totalValue) * 100) : 0

  const monthData = D.months.map((m: any) => ({ m: m.l, inn: m.inn, out: m.out }))
  const monthCfg: ChartConfig = { inn: { label: 'Received', color: 'var(--income)' }, out: { label: 'Spent', color: 'var(--expense)' } }

  const donut = SECTIONS.map((s: string, i: number) => ({ name: s, value: D.sec[s], fill: SEC_COLORS[i] })).filter((x: any) => x.value > 0)
  const donutCfg: ChartConfig = Object.fromEntries(SECTIONS.map((s: string, i: number) => [s, { label: s, color: SEC_COLORS[i] }]))

  const waterfall = useMemo(() => {
    if (!D.received) return []
    const rows: any[] = [{ name: 'Received', base: 0, v: D.received, fill: 'var(--income)' }]
    let run = D.received
    SECTIONS.forEach((s: string, i: number) => {
      if (D.sec[s] > 0) { rows.push({ name: s === 'Site visit' ? 'Site' : s, base: Math.max(0, run - D.sec[s]), v: D.sec[s], fill: SEC_COLORS[i], neg: true }); run -= D.sec[s] }
    })
    rows.push({ name: 'In hand', base: 0, v: Math.abs(run), fill: run < 0 ? 'var(--expense)' : 'var(--primary)' })
    return rows
  }, [D])

  const pend: any[] = []
  D.projects.forEach((p: any) => {
    if (p.status === 'done') return
    for (let i = 0; i < p.stages.length; i++) {
      const s = p.stages[i], left = s.amount - (p.stageRec[s.id] || 0)
      if (left > 0) { pend.push({ p, s, left }); break }
    }
  })
  const owed = D.parties.filter((x: any) => x.bal > 0).sort((a: any, b: any) => b.bal - a.bal)
  const recent = txns().slice(0, 6)

  const list = D.projects.filter((p: any) => (filter === 'all' || p.status === filter) && (!q || (p.name + ' ' + (p.client || '')).toLowerCase().includes(q.toLowerCase())))

  if (!D.projects.length && !DB.txns.length) {
    return (
      <div className="grid gap-4">
        <Card className="items-center rounded-3xl px-6 py-10 text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}><Logo height={110} /></motion.div>
          <h2 className="font-display mt-4 text-2xl font-extrabold">
            <BlurText text={`Welcome to ${DB.biz.name}`} className="justify-center" />
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">Your app is empty and ready. Start by adding your first temple project. Your numbers, charts and vouchers will appear here as you add entries.</p>
          <ShimmerButton className="mx-auto mt-2 h-12 px-6 font-bold shadow-lg" shimmerColor="#f0c36d" background="var(--primary)" onClick={() => open('project', { form: newProjectForm() })}>
            <FolderPlus className="mr-2 size-5" /> Add first project
          </ShimmerButton>
        </Card>
        <div className="grid gap-3 md:grid-cols-3">
          {[['1', 'Add a project', 'Enter the temple name, the full deal value, and split it into stages with the payment due at each stage.', 'bg-primary/10 text-primary'], ['2', 'Add your people', 'Stone suppliers, carving workers, fitting teams. Add what you owe them and what you pay.', 'bg-income-soft text-income'], ['3', 'Record every payment', 'Money received from the client or paid out. A voucher is made for each one.', 'bg-saffron-soft text-saffron']].map(([n, t, d, c], i) => (
            <BlurFade key={n} delay={0.1 * i}>
              <Card className="h-full flex-row gap-3 rounded-3xl p-4"><div className={`grid size-11 shrink-0 place-items-center rounded-full font-extrabold ${c}`}>{n}</div><div><b>{t}</b><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p></div></Card>
            </BlurFade>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <div>
        <div className="text-sm text-muted-foreground">{fmt(today())}</div>
        <h1 className="font-display text-3xl font-extrabold"><BlurText text={greet} /></h1>
        <Ornament className="mandir-only mt-3" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <BlurFade className="col-span-2 md:col-span-4">
          <div className="jaali relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--hero-a),var(--hero-b))] p-5 text-white shadow-lg">
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
        </BlurFade>
        <Kpi i={1} label="Received" value={D.received} note={`This month ${SHORT(D.month.inn)}`} tone="bg-income-soft text-income" />
        <Kpi i={2} label="Spent" value={D.spent} note={`This month ${SHORT(D.month.out)}`} tone="bg-expense-soft text-expense" />
        <Kpi i={3} label="To receive" value={D.toReceive} note="From clients" tone="bg-saffron-soft text-saffron" />
        <Kpi i={4} label="To pay" value={D.owe} note="To suppliers and workers" tone="bg-info-soft text-info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <BlurFade inView className="lg:col-span-7">
          <Card className="h-full rounded-3xl p-5">
            <SectionTitle>Where the money goes</SectionTitle>
            {waterfall.length ? (
              <ChartContainer config={{ v: { label: 'Amount' } }} className="h-60 w-full">
                <BarChart data={waterfall} margin={{ top: 22, left: 0, right: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis hide />
                  <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
                  <Bar dataKey="v" stackId="a" radius={8}>
                    {waterfall.map((r: any, i: number) => <Cell key={i} fill={r.fill} />)}
                    <LabelList dataKey="v" position="top" formatter={(v: any) => SHORT(v)} className="fill-foreground text-[11px] font-bold" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : <div className="py-12 text-center text-sm text-muted-foreground">This chart appears once you record money received from a client.</div>}
          </Card>
        </BlurFade>
        <BlurFade inView className="lg:col-span-5">
          <Card className="h-full rounded-3xl p-5">
            <SectionTitle>Spending by section</SectionTitle>
            {donut.length ? (
              <div className="flex flex-wrap items-center gap-4">
                <ChartContainer config={donutCfg} className="size-40 shrink-0">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} strokeWidth={0} />
                  </PieChart>
                </ChartContainer>
                <div className="min-w-32 flex-1 text-sm">
                  {donut.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between gap-2 py-1"><span className="flex items-center gap-2"><i className="size-2.5 rounded-sm" style={{ background: d.fill }} />{d.name}</span><b className="tn">{Math.round((d.value / D.spent) * 100)}%</b></div>
                  ))}
                </div>
              </div>
            ) : <div className="py-12 text-center text-sm text-muted-foreground">No spending yet.</div>}
          </Card>
        </BlurFade>
        <BlurFade inView className="lg:col-span-7">
          <Card className="h-full rounded-3xl p-5">
            <SectionTitle right={<div className="flex gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-income" />Received</span><span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-expense" />Spent</span></div>}>Last 6 months</SectionTitle>
            <ChartContainer config={monthCfg} className="h-52 w-full">
              <BarChart data={monthData} margin={{ top: 18 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="inn" fill="var(--color-inn)" radius={6} />
                <Bar dataKey="out" fill="var(--color-out)" radius={6} />
              </BarChart>
            </ChartContainer>
          </Card>
        </BlurFade>
        <BlurFade inView className="lg:col-span-5">
          <Card className="h-full rounded-3xl p-5">
            <SectionTitle right={<span className="rounded-full bg-expense-soft px-3 py-1 text-xs font-bold text-expense">{SHORT(D.month.out)}</span>}>Daily spending</SectionTitle>
            <div className="mb-2 text-xs text-muted-foreground">This month · darker is more</div>
            <Heat D={D} />
          </Card>
        </BlurFade>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="rounded-3xl p-5 lg:col-span-4">
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
        <Card className="rounded-3xl p-5 lg:col-span-8">
          <SectionTitle>Recent activity</SectionTitle>
          {recent.length ? recent.map((t: any) => <TxnRow key={t.id} t={t} D={D} />) : <div className="py-4 text-sm text-muted-foreground">No entries yet. Tap + to add one.</div>}
        </Card>
      </div>

      <section>
        <SectionTitle right={<Button variant="secondary" size="sm" className="rounded-full" onClick={() => open('project', { form: newProjectForm() })}><FolderPlus className="size-4" /> New project</Button>}>Projects</SectionTitle>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search project or client" className="h-11 rounded-xl bg-card pl-10" type="search" />
        </div>
        <div className="my-3 inline-flex rounded-full bg-muted p-1">
          <AnimatedBackground defaultValue={filter} onValueChange={(v) => v && setFilter(v)} className="rounded-full bg-card shadow" transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}>
            {[['all', 'All'], ['active', 'Active'], ['done', 'Completed']].map(([k, l]) => (
              <button key={k} data-id={k} className="px-4 py-1.5 text-sm font-semibold text-muted-foreground transition data-[checked=true]:text-foreground">{l}</button>
            ))}
          </AnimatedBackground>
        </div>
        {list.length ? <div className="grid gap-3 md:grid-cols-2">{list.map((p: any) => <ProjectCard key={p.id} p={p} />)}</div> : <EmptyState text="No project matches." />}
      </section>
    </div>
  )
}
