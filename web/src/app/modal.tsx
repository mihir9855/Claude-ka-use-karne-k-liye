import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type ModalKind = 'entry' | 'project' | 'party' | 'bill' | 'voucher' | 'report' | 'proposal' | 'pview' | 'restore' | 'copy' | 'confirm'
export type ModalState = { kind: ModalKind; props: any } | null

type Ctx = { modal: ModalState; open: (kind: ModalKind, props?: any) => void; close: () => void }
const C = createContext<Ctx>({ modal: null, open: () => {}, close: () => {} })

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null)
  const open = useCallback((kind: ModalKind, props: any = {}) => setModal({ kind, props }), [])
  const close = useCallback(() => setModal(null), [])
  const v = useMemo(() => ({ modal, open, close }), [modal, open, close])
  return <C.Provider value={v}>{children}</C.Provider>
}

export const useModal = () => useContext(C)
