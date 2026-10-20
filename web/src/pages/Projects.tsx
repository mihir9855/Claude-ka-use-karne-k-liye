import { useMemo } from 'react'
import { ArrowLeft, Check, FileText, FolderPlus, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { BlurFade } from '@/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Avatar, EmptyState, SectionTitle } from '@/components/app/common'
import { ProjectCard, TxnRow } from '@/components/app/rows'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { INR, LH, SECTIONS, SHORT, fmt } from '@/engine/engine.js'
import { deleteProject, editProjectForm, newEntryForm, newProjectForm, toggleStage } from '@/engine/actions.js'

const SEC = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)']

export default function Projects({ id }: { id?: string }) {
  const { D } = useData()
  const { open } = useModal()
  if (!id || !D.byId[id]) {
    return (
      <div className="grid gap-4">
        <div className="flex justify-end"><Button className="rounded-full" onClick={() => open('project', { form: newProjectForm() })}><FolderPlus className="size-4" /> New project</Button></div>
        {D.projects.length ? <div className="grid gap-3 md:grid-cols-2">{D.projects.map((p: any, i: number) => <BlurFade key={p.id} delay={0.04 * i}><ProjectCard p={p} /></BlurFade>)}</div> : (
          <Card className="rounded-3xl"><EmptyState text="No projects yet. Add a temple project with its deal value and stage-wise client payments." action={<Button className="rounded-full" onClick={() => open('project', { form: newProjectForm() })}>+ Add project</Button>} /></Card>
        )}
      </div>
    )
  }
  return <Detail id={id} />
}

export function Detail({ id, embedded }: { id: string; embedded?: boolean }) {
  const { D, txns } = useData()
  const { open } = useModal()
  const p = D.byId[id]
  const tx = useMemo(() => txns().filter((t: any) => t.projId === id), [D, id]) // eslint-disable-line react-hooks/exhaustive-deps
  const pc = p.value ? Math.round((p.received / p.value) * 100) : 0
  const stageData = p.stages.map((s: any, i: number) => ({ n: String(i + 1), agreed: s.amount, got: Math.min(s.amount, p.stageRec[s.id] || 0) }))
  const stageCfg: ChartConfig = { agreed: { label: 'Agreed', color: 'var(--muted)' }, got: { label: 'Received', color: 'var(--income)' } }
  const ids: Record<string, 1> = {}
  tx.forEach((t: any) => { if (t.partyId) ids[t.partyId] = 1 })
  const people = D.parties.filter((x: any) => ids[x.id])
  const maxSec = Math.max(1, ...SECTIONS.map((s: string) => p.sec[s]))

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {embedded ? null : <Button variant="outline" size="icon" className="rounded-full" aria-label="All projects" onClick={() => go('projects')}><ArrowLeft className="size-4" /></Button>}
        <span className="flex-1" />
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Add payment" onClick={() => open('entry', { form: newEntryForm(id) })}><Plus className="size-4" /></Button>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Edit project" onClick={() => open('project', { form: editProjectForm(DBproj(id)) })}><Pencil className="size-4" /></Button>
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Project report (PDF)" onClick={() => open('report', { id })}><FileText className="size-4" /></Button>
        <Button variant="outline" size="icon" className="rounded-full text-expense" aria-label="Delete project" onClick={() => open('confirm', { title: `Delete "${p.name}" and all its entries?`, body: 'You can undo for a few seconds after.', action: () => { deleteProject(id); go('projects') } })}><Trash2 className="size-4" /></Button>
      </div>

      <BlurFade>
        <div className="jaali relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--hero-a),var(--hero-b))] p-5 text-white shadow-lg">
          <img src={LH.w} alt="" className="hero-mark mandir-only" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_100%_0%,rgba(255,255,255,.16),transparent_55%)]" />
          <div className="relative">
            <div className="text-xs opacity-80">{[p.client, p.start ? 'started ' + fmt(p.start) : ''].filter(Boolean).join(' · ')}</div>
            <h1 className="font-display mt-0.5 text-3xl font-extrabold leading-tight">{p.name}</h1>
            <div className="mt-4 text-xs opacity-80">Deal value</div>
            <div className="font-display text-4xl font-extrabold tn">{INR(p.value)}</div>
            <Progress value={Math.min(100, pc)} className="mt-3 h-2 bg-white/25 [&>div]:bg-white" />
            <div className="mt-1.5 text-xs opacity-80">{pc}% received{p.handover ? ' · handover ' + fmt(p.handover) : ''}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[['Received', SHORT(p.received)], ['Spent', SHORT(p.spent)], ['Budget left', SHORT(p.value - p.spent)]].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-white/15 p-2.5"><div className="text-[11px] opacity-85">{l}</div><b className="tn text-lg">{v}</b></div>
              ))}
            </div>
          </div>
        </div>
      </BlurFade>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted p-1 [scrollbar-width:none]">
          {[['overview', 'Overview'], ['timeline', 'Timeline'], ['payments', 'Client payments'], ['expenses', 'Expenses'], ['people', 'People']].map(([k, l]) => (
            <TabsTrigger key={k} value={k} className="shrink-0 grow-0 rounded-xl px-3.5 py-2 text-sm">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid gap-4">
          <Card className="rounded-3xl p-5">
            <div className="text-sm text-muted-foreground">{p.curIdx >= 0 ? `Stage ${p.curIdx + 1} of ${p.stages.length}` : 'All stages completed'}</div>
            <div className="font-display text-xl font-extrabold">{p.curIdx >= 0 ? p.stages[p.curIdx].name : 'Project complete'}</div>
            <div className="mt-4 grid gap-0" style={{ gridTemplateColumns: `repeat(${p.stages.length}, minmax(0,1fr))` }}>
              {p.stages.map((s: any, i: number) => (
                <div key={s.id} className="relative flex flex-col items-center px-0.5 text-center">
                  {i > 0 ? <div className={`absolute left-0 right-1/2 top-3.5 h-0.5 ${s.done || i === p.curIdx ? 'bg-income' : 'bg-border'}`} /> : null}
                  {i < p.stages.length - 1 ? <div className={`absolute left-1/2 right-0 top-3.5 h-0.5 ${s.done ? 'bg-income' : 'bg-border'}`} /> : null}
                  <div className={`relative z-10 grid size-7 place-items-center rounded-full text-xs font-bold ${s.done ? 'bg-income text-white' : i === p.curIdx ? 'bg-saffron text-white' : 'bg-muted text-muted-foreground'}`}>{s.done ? <Check className="size-4" /> : i + 1}</div>
                  <span className="mt-1.5 break-words text-[11px] leading-tight text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{p.progress}% of stages done</div>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-3xl p-5">
              <SectionTitle>Where the money went</SectionTitle>
              {p.spent ? SECTIONS.filter((s: string) => p.sec[s] > 0).map((s: string) => (
                <div key={s} className="mt-3 first:mt-0">
                  <div className="flex justify-between text-sm font-semibold"><span>{s}</span><span className="tn">{INR(p.sec[s])}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"><i className="block h-full rounded-full" style={{ width: Math.round((p.sec[s] / maxSec) * 100) + '%', background: SEC[SECTIONS.indexOf(s)] }} /></div>
                </div>
              )) : <div className="py-4 text-sm text-muted-foreground">No expenses yet.</div>}
            </Card>
            <Card className="rounded-3xl p-5">
              <SectionTitle>Client payments by stage</SectionTitle>
              <ChartContainer config={stageCfg} className="h-44 w-full">
                <BarChart data={stageData} margin={{ top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="n" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="agreed" fill="var(--color-agreed)" radius={6} />
                  <Bar dataKey="got" fill="var(--color-got)" radius={6} />
                </BarChart>
              </ChartContainer>
            </Card>
          </div>
          <Card className="rounded-3xl p-5">
            <SectionTitle>Entries</SectionTitle>
            {tx.length ? tx.slice(0, 8).map((t: any) => <TxnRow key={t.id} t={t} D={D} showProj={false} />) : <div className="py-3 text-sm text-muted-foreground">No entries in this project yet.</div>}
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4 grid gap-3 md:grid-cols-2">
          {p.stages.map((s: any, i: number) => {
            const rec = p.stageRec[s.id] || 0, cur = i === p.curIdx
            return (
              <Card key={s.id} className={`rounded-3xl p-4 ${cur ? 'border-2 border-primary' : ''}`}>
                <div className="flex items-center justify-between gap-2"><b>{i + 1}. {s.name}</b><Badge variant="secondary" className={`rounded-full ${s.done ? 'bg-income-soft text-income' : cur ? 'bg-primary/10 text-primary' : ''}`}>{s.done ? 'Completed' : cur ? 'In progress' : 'Upcoming'}</Badge></div>
                <div className="text-sm text-muted-foreground">{s.date ? 'Target ' + fmt(s.date) : 'No target date'}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-muted p-2.5"><div className="text-xs text-muted-foreground">Client pays</div><b className="tn">{INR(s.amount)}</b></div>
                  <div className="rounded-2xl bg-muted p-2.5"><div className="text-xs text-muted-foreground">Received</div><b className="tn text-income">{INR(rec)}</b></div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="icon" variant={s.done ? 'outline' : 'default'} className="rounded-full" aria-label={s.done ? 'Mark as not completed' : 'Mark stage completed'} onClick={() => toggleStage(id, s.id)}>{s.done ? <RotateCcw className="size-4" /> : <Check className="size-4" />}</Button>
                </div>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="payments" className="mt-4 grid gap-4">
          <Card className="rounded-3xl p-5">
            {p.stages.map((s: any, i: number) => {
              const rec = p.stageRec[s.id] || 0, left = s.amount - rec, full = left <= 0 && s.amount > 0
              return (
                <div key={s.id} className="flex items-center gap-3 border-b py-3 last:border-0">
                  <div className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${full ? 'bg-income text-white' : 'bg-muted text-muted-foreground'}`}>{full ? <Check className="size-4" /> : i + 1}</div>
                  <div className="min-w-0 flex-1"><b className="block text-sm">{s.name}</b><span className="text-xs text-muted-foreground">{left > 0 ? 'Still to receive ' + INR(left) : 'Fully received'}{s.date ? ' · target ' + fmt(s.date) : ''}</span></div>
                  <div className="text-right"><b className="tn text-sm">{INR(s.amount)}</b><div className="text-xs text-muted-foreground">got {INR(rec)}</div></div>
                </div>
              )
            })}
            <div className="mt-3 grid gap-1 rounded-2xl bg-muted p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total deal</span><b className="tn">{INR(p.value)}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Received</span><b className="tn">{INR(p.received)}</b></div>
              <div className="mt-1 flex justify-between border-t pt-1.5"><span className="text-muted-foreground">Still to receive</span><b className="tn">{INR(Math.max(0, p.value - p.received))}</b></div>
            </div>
          </Card>
          <Card className="rounded-3xl p-5">
            <SectionTitle>Payments received</SectionTitle>
            {tx.filter((t: any) => t.kind === 'in').map((t: any) => <TxnRow key={t.id} t={t} D={D} showProj={false} />)}
            {!tx.some((t: any) => t.kind === 'in') ? <div className="py-3 text-sm text-muted-foreground">Nothing received yet.</div> : null}
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 grid gap-4">
          <Card className="overflow-x-auto rounded-3xl p-5">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-2">Section</th><th className="pb-2 text-right">Paid</th><th className="pb-2 text-right">Share</th></tr></thead>
              <tbody>
                {SECTIONS.filter((s: string) => p.sec[s] > 0).map((s: string) => (
                  <tr key={s} className="border-t"><td className="py-2 font-semibold">{s}</td><td className="tn py-2 text-right font-bold">{INR(p.sec[s])}</td><td className="py-2 text-right text-muted-foreground">{Math.round((p.sec[s] / p.spent) * 100)}%</td></tr>
                ))}
                <tr className="border-t"><td className="py-2 font-bold">Total</td><td className="tn py-2 text-right font-bold">{INR(p.spent)}</td><td /></tr>
              </tbody>
            </table>
          </Card>
          <Card className="rounded-3xl p-5">
            <SectionTitle>All payments made</SectionTitle>
            {tx.filter((t: any) => t.kind === 'out').map((t: any) => <TxnRow key={t.id} t={t} D={D} showProj={false} />)}
            {!tx.some((t: any) => t.kind === 'out') ? <div className="py-3 text-sm text-muted-foreground">No expenses yet.</div> : null}
          </Card>
        </TabsContent>

        <TabsContent value="people" className="mt-4">
          <Card className="rounded-3xl p-3">
            {people.length ? people.map((x: any) => {
              let b = 0, pd = 0
              tx.forEach((t: any) => { if (t.partyId === x.id) { if (t.kind === 'bill') b += t.amount; else if (t.kind === 'out') pd += t.amount } })
              return (
                <button key={x.id} onClick={() => go('people', x.id)} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left hover:bg-muted">
                  <Avatar name={x.name} />
                  <div className="min-w-0 flex-1"><b className="block truncate">{x.name}</b><span className="text-xs text-muted-foreground">{x.type} · paid {INR(pd)}</span></div>
                  <div className="text-right"><div className="text-xs text-muted-foreground">Balance</div><b className="tn">{INR(b - pd)}</b></div>
                </button>
              )
            }) : <div className="p-4 text-sm text-muted-foreground">No people linked to this project yet.</div>}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { DB } from '@/engine/engine.js'
function DBproj(id: string) { return DB.projects.filter((x: any) => x.id === id)[0] }
