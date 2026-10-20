import { FilePlus2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/app/common'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { INR, LANG, PT, fmt, stripGod } from '@/engine/engine.js'
import { proposalForm } from '@/engine/actions.js'

export default function DProposals() {
  const { DB } = useData()
  const { open } = useModal()
  const mk = () => open('proposal', { form: proposalForm() })
  if (!DB.proposals.length) return <Card className="rounded-3xl"><EmptyState text="Make a proposal for a temple in a minute: temple name, place, rates for each stone, and your ready-made terms. Then a PDF on your letterhead in English, Hindi or Gujarati." action={<Button className="rounded-full" onClick={mk}>Make first proposal</Button>} /></Card>
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl p-0">
      <div className="flex items-center justify-between border-b p-4"><b className="font-display text-lg">Proposals</b><Button className="rounded-xl" onClick={mk}><FilePlus2 className="size-4" /> New proposal</Button></div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground"><tr><th className="px-4 py-2.5 font-semibold">No.</th><th className="px-2 py-2.5 font-semibold">Temple</th><th className="px-2 py-2.5 font-semibold">Place</th><th className="px-2 py-2.5 font-semibold">Date</th><th className="px-2 py-2.5 font-semibold">Type</th><th className="px-2 py-2.5 font-semibold">Language</th><th className="px-2 py-2.5 text-right font-semibold">Rate (first option)</th></tr></thead>
        <tbody>
          {DB.proposals.slice().reverse().map((pr: any) => {
            const lg = pr.lg || 'gu', n = (pr.options || []).length
            return (
              <tr key={pr.id} onClick={() => open('pview', { id: pr.id })} className="cursor-pointer border-t transition hover:bg-muted/60">
                <td className="tn px-4 py-3 font-semibold">{pr.vno}</td>
                <td className="px-2 py-3 font-semibold">{PT[lg].head(stripGod(pr.god), '')}</td>
                <td className="px-2 py-3 text-muted-foreground">{pr.loc || '—'}</td>
                <td className="px-2 py-3 text-muted-foreground">{fmt(pr.date)}</td>
                <td className="px-2 py-3 text-muted-foreground">{pr.kind === 'small' ? pr.item || 'Small sihasan' : `${n} option${n === 1 ? '' : 's'}`}</td>
                <td className="px-2 py-3"><Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">{LANG[lg].name}</Badge></td>
                <td className="tn px-2 py-3 text-right font-semibold">{pr.options?.[0]?.mandir ? INR(pr.options[0].mandir) : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
