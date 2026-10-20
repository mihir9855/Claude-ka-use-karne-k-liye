import { useModal } from '@/app/modal'
import { BillModal, EntryModal, PartyModal, ProjectModal } from '@/modals/forms'
import { ConfirmModal, CopyModal, ProposalModal, ProposalView, ReportModal, RestoreModal, VoucherModal } from '@/modals/documents'

export function Modals() {
  const { modal } = useModal()
  if (!modal) return null
  const p = modal.props || {}
  switch (modal.kind) {
    case 'entry': return <EntryModal key={p.form?.editId || 'new'} form={p.form} />
    case 'project': return <ProjectModal key={p.form?.editId || 'new'} form={p.form} />
    case 'party': return <PartyModal key={p.form?.editId || 'new'} form={p.form} />
    case 'bill': return <BillModal key={p.form?.editId || 'new'} form={p.form} />
    case 'voucher': return <VoucherModal key={p.id} id={p.id} fresh={p.fresh} />
    case 'report': return <ReportModal id={p.id} />
    case 'proposal': return <ProposalModal key={p.form?.editId || 'new'} form={p.form} />
    case 'pview': return <ProposalView key={p.id} id={p.id} />
    case 'restore': return <RestoreModal />
    case 'copy': return <CopyModal text={p.text} />
    case 'confirm': return <ConfirmModal {...p} />
    default: return null
  }
}
