import { useMemo, useSyncExternalStore } from 'react'
import { DB, derive, subscribe, getVersion, sortedTxns, enrich } from '@/engine/engine.js'

/** Re-renders whenever the engine data changes. */
export function useVersion(): number {
  return useSyncExternalStore(subscribe, getVersion)
}

export function useData() {
  const v = useVersion()
  return useMemo(() => {
    const D = derive()
    return {
      D,
      DB,
      biz: DB.biz,
      txns: (kinds?: string[]) => enrich(D, sortedTxns(kinds)),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v])
}

export type Data = ReturnType<typeof useData>
