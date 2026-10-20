import { useState } from 'react'
import { FolderPlus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/app/common'
import { Ring } from '@/components/app/rows'
import { Detail } from '@/pages/Projects'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'
import { SHORT } from '@/engine/engine.js'
import { newProjectForm } from '@/engine/actions.js'
import { cn } from '@/lib/utils'

export default function DProjects({ id }: { id?: string }) {
  const { D } = useData()
  const { open } = useModal()
  const [q, setQ] = useState('')
  const sel = id && D.byId[id] ? id : D.projects[0]?.id
  const list = D.projects.filter((p: any) => !q || (p.name + ' ' + (p.client || '')).toLowerCase().includes(q.toLowerCase()))

  if (!D.projects.length) {
    return <Card className="rounded-3xl"><EmptyState text="No projects yet. Add a temple project with its deal value and stage-wise client payments." action={<Button className="rounded-full" onClick={() => open('project', { form: newProjectForm() })}>+ Add project</Button>} /></Card>
  }
  return (
    <div className="grid grid-cols-[22rem_minmax(0,1fr)] items-start gap-5">
      <Card className="sticky top-24 max-h-[calc(100dvh-8rem)] gap-0 overflow-hidden rounded-3xl p-0">
        <div className="space-y-3 border-b p-4">
          <div className="flex items-center justify-between"><b className="font-display text-lg">All projects</b><Button size="sm" className="rounded-xl" onClick={() => open('project', { form: newProjectForm() })}><FolderPlus className="size-4" /> New</Button></div>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 rounded-xl pl-9" /></div>
        </div>
        <div className="overflow-y-auto p-2">
          {list.map((p: any) => (
            <button key={p.id} onClick={() => go('projects', p.id)} className={cn('flex w-full items-center gap-3 rounded-2xl p-3 text-left transition', p.id === sel ? 'bg-primary/10' : 'hover:bg-muted')}>
              <div className="relative grid size-11 shrink-0 place-items-center text-primary"><Ring pct={p.progress} size={44} stroke={5} /><span className="absolute text-[10px] font-extrabold text-foreground">{p.progress}%</span></div>
              <div className="min-w-0 flex-1"><b className="block truncate text-sm">{p.name}</b><span className="block truncate text-xs text-muted-foreground">{p.client || 'No client'}</span></div>
              <div className="text-right"><div className="tn text-xs font-bold text-income">{SHORT(p.received)}</div><div className="text-[11px] text-muted-foreground">of {SHORT(p.value)}</div></div>
            </button>
          ))}
          {!list.length ? <div className="p-6 text-center text-sm text-muted-foreground">No project matches.</div> : null}
        </div>
      </Card>
      <div className="min-w-0"><Detail key={sel} id={sel} embedded /></div>
    </div>
  )
}
