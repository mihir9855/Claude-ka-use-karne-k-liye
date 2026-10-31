import { useState } from 'react'
import { motion } from 'motion/react'
import { FolderPlus, Search } from 'lucide-react'
import { BlurFade } from '@/magicui/blur-fade'
import BlurText from '@/react-bits/TextAnimations/BlurText/BlurText'
import { ShimmerButton } from '@/magicui/shimmer-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DonutCard, MonthsCard, WaterfallCard } from '@/components/app/dash'
import { Logo, SectionTitle, EmptyState, Ornament } from '@/components/app/common'
import { ProjectCard, TxnRow } from '@/components/app/rows'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { LH, SHORT, fmt, today } from '@/engine/engine.js'
import { newProjectForm } from '@/engine/actions.js'
import { AnimatedBackground } from '@/motion-primitives/animated-background'


function Kpi({ label, value, note, tone, i }: { label: string; value: number; note: string; tone: string; i: number }) {
  return (
    <BlurFade delay={0.05 * i} inView>
      <div data-kpi={label.replace(/\s/g, '').toLowerCase()} className={`kpi-arch relative h-full overflow-hidden rounded-3xl p-4 ${tone}`}>
        <div className="text-xs font-semibold opacity-80">{label}</div>
        <div className="font-display mt-1 text-[26px] font-extrabold leading-tight tn">{SHORT(value)}</div>
        <div className="mt-1 text-xs opacity-75">{note}</div>
      </div>
    </BlurFade>
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
          <div className="jaali relative overflow-hidden rounded-3xl bg-[image:var(--hero-grad)] p-5 text-white shadow-lg">
            <img src={LH.w} alt="" className="hero-mark mandir-only" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,.16),transparent_55%)]" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Cash in hand · all projects</div>
              <div className="font-display gold-text mt-1 whitespace-nowrap text-[clamp(28px,8.5vw,44px)] font-extrabold leading-none tn">
                {D.cash < 0 ? '−' : ''}₹{Math.abs(D.cash).toLocaleString('en-IN')}
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
          </div>
        </BlurFade>
        <Kpi i={1} label="Received" value={D.received} note={`This month ${SHORT(D.month.inn)}`} tone="bg-income-soft text-income" />
        <Kpi i={2} label="Spent" value={D.spent} note={`This month ${SHORT(D.month.out)}`} tone="bg-expense-soft text-expense" />
        <Kpi i={3} label="To receive" value={D.toReceive} note="From clients" tone="bg-saffron-soft text-saffron" />
        <Kpi i={4} label="To pay" value={D.owe} note="To suppliers and workers" tone="bg-info-soft text-info" />
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

      <div className="grid gap-4 lg:grid-cols-12">
        <BlurFade inView className="lg:col-span-7"><WaterfallCard D={D} /></BlurFade>
        <BlurFade inView className="lg:col-span-5"><DonutCard D={D} /></BlurFade>
        <BlurFade inView className="lg:col-span-12"><MonthsCard D={D} /></BlurFade>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="rounded-3xl p-5 lg:col-span-12">
          <SectionTitle>Recent activity</SectionTitle>
          {recent.length ? recent.map((t: any) => <TxnRow key={t.id} t={t} D={D} />) : <div className="py-4 text-sm text-muted-foreground">No entries yet. Tap + to add one.</div>}
        </Card>
      </div>

    </div>
  )
}
