import { ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { INR, SHORT, fmt } from '@/engine/engine.js'
import { useModal } from '@/app/modal'
import { go } from '@/lib/router'

export function Ring({ pct, size = 56, stroke = 6, className }: { pct: number; size?: number; stroke?: number; className?: string }) {
  const r = size / 2 - stroke, c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.14} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(c * Math.max(0, Math.min(100, pct))) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)' }} />
    </svg>
  )
}

export function StageDots({ p }: { p: any }) {
  return (
    <div className="flex gap-1" aria-label={`${p.doneCount} of ${p.stages.length} stages done`}>
      {p.stages.map((s: any, i: number) => (
        <i key={s.id} className={cn('h-1.5 flex-1 rounded-full', s.done ? 'bg-income' : i === p.curIdx ? 'bg-saffron' : 'bg-muted')} />
      ))}
    </div>
  )
}

export const PALETTE = ['#7c3aed', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e']
export function hashPick(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function ProjectCard({ p }: { p: any }) {
  const done = p.status === 'done'
  const stg = p.curIdx >= 0 ? p.stages[p.curIdx].name : 'All stages done'
  return (
    <button onClick={() => go('projects', p.id)} style={{ ['--pc' as any]: hashPick(p.id) }} className="proj-card group w-full rounded-3xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]">
      <div className="flex items-center gap-3">
        <div className="proj-ring relative grid size-14 shrink-0 place-items-center text-primary">
          <Ring pct={p.progress} size={56} />
          <span className="font-display absolute text-[13px] font-extrabold text-foreground">{p.progress}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <b className="break-words text-[15px] leading-snug">{p.name}</b>
            <Badge variant="secondary" className={cn('shrink-0 rounded-full', done ? 'bg-income-soft text-income' : 'bg-primary/10 text-primary')}>{done ? 'Completed' : 'Active'}</Badge>
          </div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">{[p.client, done ? 'Finished' : `Stage ${p.curIdx + 1} of ${p.stages.length} · ${stg}`].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      <div className="mt-3"><StageDots p={p} /></div>
      <div className="mt-3 flex justify-between gap-2 text-sm">
        <div><div className="text-xs text-muted-foreground">Received</div><b className="tn text-income">{INR(p.received)}</b></div>
        <div className="text-center"><div className="text-xs text-muted-foreground">Spent</div><b className="tn">{INR(p.spent)}</b></div>
        <div className="text-right"><div className="text-xs text-muted-foreground">Deal value</div><b className="tn">{INR(p.value)}</b></div>
      </div>
    </button>
  )
}

export function TxnRow({ t, D, showProj = true }: { t: any; D: any; showProj?: boolean }) {
  const { open } = useModal()
  const inn = t.kind === 'in', bill = t.kind === 'bill'
  const p = D.byId[t.projId]
  const title = bill ? 'Bill · ' + (t.who || '') : inn ? 'Received from ' + t.who : 'Paid to ' + t.who
  const sub1 = [fmt(t.date), t.mode, t.ref].filter(Boolean).join(' · ')
  const sub2 = [showProj && p ? p.name : '', inn ? t.stageName || '' : bill ? '' : t.section].filter(Boolean).join(' · ')
  return (
    <button
      disabled={bill}
      onClick={() => !bill && open('voucher', { id: t.id })}
      className={cn('flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition', !bill && 'hover:bg-muted active:bg-muted/70')}
    >
      <div className={cn('grid size-10 shrink-0 place-items-center rounded-full', inn ? 'bg-income-soft text-income' : bill ? 'bg-saffron-soft text-saffron' : 'bg-expense-soft text-expense')}>
        {bill ? <FileText className="size-[18px]" /> : inn ? <ArrowDownLeft className="size-[18px]" /> : <ArrowUpRight className="size-[18px]" />}
      </div>
      <div className="min-w-0 flex-1">
        <b className="line-clamp-2 break-words text-sm">{title}</b>
        <div className="text-xs text-muted-foreground">{sub1}</div>
        {sub2 ? <div className="truncate text-xs text-muted-foreground">{sub2}</div> : null}
      </div>
      <b className={cn('tn shrink-0 text-sm', inn ? 'text-income' : '')}>{inn ? '+' : bill ? '' : '−'}{INR(t.amount)}</b>
    </button>
  )
}

export { SHORT }
