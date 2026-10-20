import { useState } from 'react'
import { FolderPlus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CashHero, DonutCard, DueCard, HeatCard, Kpis, MonthsCard, RecentCard, WaterfallCard } from '@/components/app/dash'
import { SectionTitle } from '@/components/app/common'
import Home from '@/pages/Home'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { INR, fmt, today } from '@/engine/engine.js'
import { newProjectForm } from '@/engine/actions.js'

export default function DHome() {
  const { D, DB, txns } = useData()
  const { open } = useModal()
  const [q, setQ] = useState('')
  if (!D.projects.length && !DB.txns.length) return <Home />
  const hr = new Date().getHours()
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'
  const list = D.projects.filter((p: any) => !q || (p.name + ' ' + (p.client || '')).toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="grid gap-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{fmt(today())}</div>
          <h1 className="font-display text-3xl font-extrabold">{greet}</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <CashHero D={D} className="col-span-5" />
        <div className="col-span-7 grid grid-cols-2 gap-5"><Kpis D={D} /></div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5"><WaterfallCard D={D} h="h-56" /></div>
        <div className="col-span-3"><DonutCard D={D} /></div>
        <div className="col-span-4"><MonthsCard D={D} h="h-52" /></div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-8 rounded-3xl p-5">
          <SectionTitle right={
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter projects" className="h-9 w-56 rounded-xl pl-9" /></div>
              <Button size="sm" className="rounded-xl" onClick={() => open('project', { form: newProjectForm() })}><FolderPlus className="size-4" /> New project</Button>
            </div>
          }>Projects</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-semibold">Project</th><th className="pb-2 font-semibold">Stage</th><th className="w-36 pb-2 font-semibold">Progress</th>
                  <th className="pb-2 pl-4 text-right font-semibold">Received</th><th className="pb-2 pl-4 text-right font-semibold">Spent</th><th className="pb-2 pl-4 text-right font-semibold">Deal value</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p: any) => (
                  <tr key={p.id} onClick={() => go('projects', p.id)} className="cursor-pointer border-b last:border-0 transition hover:bg-muted/60">
                    <td className="max-w-64 py-3 pr-3"><b className="block truncate">{p.name}</b><span className="text-xs text-muted-foreground">{p.client}</span></td>
                    <td className="py-3 pr-3"><Badge variant="secondary" className={'rounded-full ' + (p.status === 'done' ? 'bg-income-soft text-income' : 'bg-primary/10 text-primary')}>{p.status === 'done' ? 'Completed' : p.stages[p.curIdx]?.name}</Badge></td>
                    <td className="py-3 pr-4"><div className="flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><i className="block h-full rounded-full bg-primary" style={{ width: p.progress + '%' }} /></div><span className="tn w-9 text-right text-xs font-bold">{p.progress}%</span></div></td>
                    <td className="tn whitespace-nowrap py-3 pl-4 text-right font-semibold text-income">{INR(p.received)}</td>
                    <td className="tn whitespace-nowrap py-3 pl-4 text-right font-semibold">{INR(p.spent)}</td>
                    <td className="tn whitespace-nowrap py-3 pl-4 text-right font-semibold">{INR(p.value)}</td>
                  </tr>
                ))}
                {!list.length ? <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No project matches.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="col-span-4"><DueCard D={D} /></div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8"><RecentCard D={D} list={txns().slice(0, 7)} /></div>
        <div className="col-span-4"><HeatCard D={D} /></div>
      </div>
    </div>
  )
}
