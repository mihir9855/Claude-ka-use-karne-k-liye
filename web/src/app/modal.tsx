import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ModalKind = 'entry' | 'project' | 'party' | 'bill' | 'voucher' | 'report' | 'proposal' | 'pview' | 'restore' | 'copy' | 'confirm'
export type ModalState = { kind: ModalKind; props: any } | null

type Ctx = { modal: ModalState; open: (kind: ModalKind, props?: any) => void; close: () => void }
const C = createContext<Ctx>({ modal: null, open: () => {}, close: () => {} })

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null)
  // A short delay lets the Add menu finish closing first. Opening a sheet in the same instant left the page
  // behind it frozen (no taps worked) until the app was reloaded.
  const open = useCallback((kind: ModalKind, props: any = {}) => { window.setTimeout(() => setModal({ kind, props }), 60) }, [])
  const close = useCallback(() => setModal(null), [])
  // Safety net: if a menu or sheet ever leaves the page locked, unlock it as soon as no sheet is open.
  useEffect(() => {
    if (modal) return
    const t = window.setTimeout(() => {
      if (!document.querySelector('[role=dialog],[role=menu]')) {
        document.body.style.pointerEvents = ''
        document.body.removeAttribute('data-scroll-locked')
      }
    }, 350)
    return () => window.clearTimeout(t)
  }, [modal])
  const v = useMemo(() => ({ modal, open, close }), [modal, open, close])
  return <C.Provider value={v}>{children}</C.Provider>
}

export const useModal = () => useContext(C)
