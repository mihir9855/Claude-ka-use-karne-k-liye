import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { animate, stagger } from 'animejs'
import lottie from 'lottie-web/build/player/lottie_light'
import spinner from './demo/spinner.lottie.json'

type Mod = Record<string, unknown>
const modules = import.meta.glob<Mod>([
  './components/magicui/*.tsx',
  './components/motion-primitives/*.tsx',
  './components/react-bits/*/*.tsx',
])

const groups: Record<string, string[]> = {}
for (const p of Object.keys(modules)) {
  const lib = p.split('/')[2]
  ;(groups[lib] ??= []).push(p)
}

const label = (p: string) => p.split('/').pop()!.replace(/\.tsx$/, '')

class Boundary extends Component<{ children: ReactNode; resetKey: string }, { error?: Error }> {
  state: { error?: Error } = {}
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: undefined })
  }
  render() {
    if (this.state.error)
      return (
        <p className="text-sm text-muted-foreground">
          This component needs props to render. Open its source to see them.
          <br />
          <code className="text-xs">{this.state.error.message}</code>
        </p>
      )
    return this.props.children
  }
}

function Preview({ path }: { path: string }) {
  const [exports, setExports] = useState<string[]>([])
  const [pick, setPick] = useState<string>()
  useEffect(() => {
    let live = true
    modules[path]().then((m) => {
      if (!live) return
      const names = Object.keys(m).filter((k) => /^[A-Z]/.test(k) || k === 'default')
      setExports(names)
      setPick(names.includes('default') ? 'default' : names[0])
    })
    return () => {
      live = false
    }
  }, [path])
  const Lazy = useMemo(
    () =>
      pick
        ? lazy(async () => {
            const m = await modules[path]()
            return { default: m[pick] as ComponentType<Record<string, unknown>> }
          })
        : null,
    [path, pick],
  )
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">{label(path)}</span>
        {exports.length > 1 && (
          <select className="rounded border bg-background px-2 py-1" value={pick} onChange={(e) => setPick(e.target.value)}>
            {exports.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        )}
        <code className="text-xs text-muted-foreground">{path.replace('./', 'src/')}</code>
      </div>
      <div className="relative min-h-72 overflow-hidden rounded-lg border p-6">
        <Boundary resetKey={path + pick}>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            {Lazy && <Lazy>Hello motion</Lazy>}
          </Suspense>
        </Boundary>
      </div>
    </div>
  )
}

function LibraryDemos() {
  const dots = useRef<HTMLDivElement>(null)
  const lottieBox = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const a = animate(dots.current!.children, {
      translateY: [0, -16, 0],
      delay: stagger(90),
      duration: 900,
      loop: true,
      ease: 'inOutSine',
    })
    const l = lottie.loadAnimation({ container: lottieBox.current!, renderer: 'svg', loop: true, autoplay: true, animationData: spinner })
    return () => {
      a.revert()
      l.destroy()
    }
  }, [])
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card title="Motion">
        <motion.div
          className="size-14 rounded-xl bg-primary"
          animate={{ rotate: [0, 90, 180, 270, 360], borderRadius: ['12%', '50%', '12%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </Card>
      <Card title="anime.js">
        <div ref={dots} className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="size-4 rounded-full bg-primary" />
          ))}
        </div>
      </Card>
      <Card title="lottie-web">
        <div ref={lottieBox} className="size-20" />
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
      <span className="text-sm font-medium">{title}</span>
      <div className="flex h-20 items-center">{children}</div>
    </div>
  )
}

export default function App() {
  const [sel, setSel] = useState(groups['magicui']?.[0])
  const [q, setQ] = useState('')
  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-6 p-4 md:flex-row">
      <aside className="md:w-64 md:shrink-0">
        <h1 className="mb-1 text-lg font-semibold">Motion Playground</h1>
        <p className="mb-3 text-sm text-muted-foreground">{Object.keys(modules).length} components</p>
        <input
          className="mb-3 w-full rounded border bg-background px-2 py-1 text-sm"
          placeholder="Filter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <nav className="max-h-[40vh] space-y-4 overflow-y-auto text-sm md:max-h-[80vh]">
          {Object.entries(groups).map(([lib, paths]) => (
            <div key={lib}>
              <p className="mb-1 font-medium">{lib}</p>
              {paths
                .filter((p) => label(p).toLowerCase().includes(q.toLowerCase()))
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setSel(p)}
                    className={`block w-full truncate rounded px-2 py-0.5 text-left ${p === sel ? 'bg-accent' : 'hover:bg-accent/60'}`}
                  >
                    {label(p)}
                  </button>
                ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 space-y-6">
        <LibraryDemos />
        {sel && <Preview path={sel} />}
      </main>
    </div>
  )
}
