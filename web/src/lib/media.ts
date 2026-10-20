import { useSyncExternalStore } from 'react'

const Q = '(min-width: 1024px)'

/** True on PC-sized windows: the app then uses its desktop layout. */
export function useDesktop(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(Q)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(Q).matches,
  )
}
