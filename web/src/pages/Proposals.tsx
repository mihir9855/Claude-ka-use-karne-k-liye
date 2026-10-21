import { FilePlus2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BlurFade } from '@/magicui/blur-fade'
import { EmptyState } from '@/components/app/common'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { LANG, PT, fmt, godDisp } from '@/engine/engine.js'
import { proposalForm } from '@/engine/actions.js'

export default function Proposals() {
  const { DB } = useData()
  const { open } = useModal()
  const mk = () => open('proposal', { form: proposalForm() })
  return (
    <div className="grid gap-4">
      <div className="flex justify-end"><Button className="rounded-full" onClick={mk}><FilePlus2 className="size-4" /> New proposal</Button></div>
      {!DB.proposals.length ? (
        <Card className="rounded-3xl"><EmptyState text="Make a proposal for a temple in a minute: temple name, place, rates for each stone, and your ready-made terms. Then a PDF on your letterhead in English, Hindi or Gujarati." action={<Button className="rounded-full" onClick={mk}>Make first proposal</Button>} /></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {DB.proposals.slice().reverse().map((pr: any, i: number) => {
            const lg = pr.lg || 'gu', n = (pr.options || []).length
            return (
              <BlurFade key={pr.id} delay={0.04 * i}>
                <button onClick={() => open('pview', { id: pr.id })} className="w-full rounded-3xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]">
                  <div className="flex items-start justify-between gap-2"><b className="break-words text-[15px] leading-snug">{PT[lg].head(godDisp(pr, pr.lg || 'gu'), '')}</b><Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">{LANG[lg].name}</Badge></div>
                  <div className="mt-1 text-sm text-muted-foreground">{pr.loc || ''}{pr.loc ? ' · ' : ''}{fmt(pr.date)}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{pr.kind === 'small' ? pr.item || 'Small sihasan' : `${n} option${n === 1 ? '' : 's'}`} · {pr.vno || ''}</div>
                </button>
              </BlurFade>
            )
          })}
        </div>
      )}
    </div>
  )
}
