import { useMemo, useSyncExternalStore } from 'react'
import { SY } from '@/engine/sync.js'

export type SyncState = { on: boolean; email: string; cfg: { key: string; pid: string } | null; mail: string; busy: boolean; err: string; last: number }

export function useSyncState(): SyncState {
  const raw = useSyncExternalStore(
    (cb) => SY.subscribe(cb),
    () => JSON.stringify(SY.state()),
  )
  return useMemo(() => JSON.parse(raw), [raw])
}
