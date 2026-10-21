import { useEffect, useState } from 'react'

export type Route = { page: string; id?: string }

function parse(): Route {
  const h = (location.hash || '').replace(/^#\/?/, '')
  const [page, id] = h.split('/')
  return { page: page || 'home', id: id ? decodeURIComponent(id) : undefined }
}

export function useRoute(): Route {
  const [r, setR] = useState<Route>(parse)
  useEffect(() => {
    const on = () => setR(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return r
}

export function go(page: string, id?: string) {
  location.hash = '#/' + page + (id ? '/' + encodeURIComponent(id) : '')
  window.scrollTo(0, 0)
}

export function back(fallback: string) {
  if (history.length > 1) history.back()
  else go(fallback)
}
