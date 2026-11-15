import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, Play, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { findLesson } from '../data'
import type { Line } from '../data/types'
import { completePart, PART_XP, useProgress, type Part } from '../lib/progress'
import { speak, stopSpeaking } from '../lib/speech'
import type { Nav } from '../App'
import { Bar, Btn, cx, Header, ListenButtons, MicCheck, Stars } from '../ui'

const STEPS: { key: Part | 'practice'; title: string; gu: string; icon: string }[] = [
  { key: 'learn', title: 'Learn phrases', gu: 'વાક્યો શીખો, સાંભળો અને બોલો', icon: '📖' },
  { key: 'tip', title: 'Grammar tip', gu: 'નાની વ્યાકરણ ટિપ ગુજરાતીમાં', icon: '💡' },
  { key: 'talk', title: 'Conversation', gu: 'સાચી વાતચીત સાંભળો અને બોલો', icon: '💬' },
  { key: 'practice', title: 'Practice', gu: 'સાંભળવું, બોલવું અને લખવું', icon: '🎯' },
]

export function LessonScreen({ nav, id }: { nav: Nav; id: string }) {
  const p = useProgress()
  const { lesson, level, index } = findLesson(id)!
  const lp = p.lessons[id] ?? {}
  const isDone = (k: string) => (k === 'practice' ? !!lp.done : !!lp[k as Part])
  const next = STEPS.find(s => !isDone(s.key)) ?? STEPS[3]
  const go = (k: string) => nav.push({ name: k as 'learn', id })
  return (
    <div data-level={level.id} className="pb-8">
      <Header title={`${level.name} · Lesson ${index + 1}`} onBack={nav.back} />
      <div className="px-4">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="grid size-24 place-items-center rounded-[2rem] bg-accent-soft text-6xl">{lesson.emoji}</div>
          <h2 className="mt-3 text-2xl font-extrabold leading-tight">{lesson.title}</h2>
          <p className="text-lg text-muted">{lesson.gu}</p>
          {lp.done && <div className="mt-1"><Stars n={lp.stars ?? 0} size="text-xl" /></div>}
        </div>
        <ol className="space-y-3">
          {STEPS.map((s, i) => {
            const done = isDone(s.key)
            return (
              <li key={s.key}>
                <button onClick={() => go(s.key)}
                  className={cx('flex w-full items-center gap-3 rounded-3xl bg-card p-3 text-left shadow-sm transition active:scale-[.99]', s === next && !lp.done && 'ring-2 ring-accent')}>
                  <div className={cx('grid size-12 shrink-0 place-items-center rounded-2xl text-2xl', done ? 'bg-accent text-accent-ink' : 'bg-soft')}>
                    {done ? <Check className="size-7" strokeWidth={3} /> : s.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold leading-tight">{i + 1}. {s.title}</p>
                    <p className="text-sm leading-snug text-muted">{s.gu}</p>
                  </div>
                  {s.key === 'practice' && lp.best !== undefined
                    ? <span className="text-sm font-bold text-muted">{Math.round(lp.best * 100)}%</span>
                    : <ChevronRight className="size-5 text-muted" />}
                </button>
              </li>
            )
          })}
        </ol>
        <Btn className="mt-6 w-full" onClick={() => go(next.key)}>
          {lp.done ? 'Practice again · ફરી પ્રેક્ટિસ' : `${next.icon} ${next.title}`}
        </Btn>
      </div>
    </div>
  )
}

/** Step 1: one phrase at a time — hear it, read the Gujarati, say it. */
export function LearnScreen({ nav, id }: { nav: Nav; id: string }) {
  const { settings } = useProgress()
  const { lesson, level } = findLesson(id)!
  const [i, setI] = useState(0)
  const ph = lesson.phrases[i]
  const last = i === lesson.phrases.length - 1
  useEffect(() => {
    if (settings.autoPlay) { const t = setTimeout(() => speak(ph.en), 250); return () => clearTimeout(t) }
  }, [ph, settings.autoPlay])
  useEffect(() => () => stopSpeaking(), [])
  const finish = () => { completePart(id, 'learn'); nav.back() }

  return (
    <div data-level={level.id} className="flex min-h-dvh flex-col">
      <Header title="Learn phrases" sub={lesson.title} onBack={nav.back}
        right={<span className="pr-2 text-sm font-bold text-muted">{i + 1}/{lesson.phrases.length}</span>} />
      <div className="px-4"><Bar value={(i + 1) / lesson.phrases.length} /></div>
      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        <div key={i} className="pop rounded-3xl bg-card p-5 shadow-sm">
          <p className="text-3xl font-extrabold leading-tight">{ph.en}</p>
          {settings.showSay && ph.say && <p className="mt-2 text-lg text-accent">🗣️ {ph.say}</p>}
          <p className="mt-3 border-t border-line pt-3 text-xl">{ph.gu}</p>
          <div className="mt-4"><ListenButtons text={ph.en} big /></div>
        </div>
        <div className="rounded-3xl bg-card p-4 shadow-sm">
          <p className="mb-3 text-center font-bold">Now you say it · હવે તમે બોલો</p>
          <MicCheck target={ph.en} />
        </div>
      </div>
      <div className="safe-bottom sticky bottom-0 flex gap-3 bg-bg px-4 py-3">
        <Btn kind="soft" disabled={i === 0} onClick={() => setI(i - 1)} className="w-16"><ChevronLeft /></Btn>
        {last
          ? <Btn className="flex-1" onClick={finish}>Done · પૂરું (+{PART_XP.learn} XP)</Btn>
          : <Btn className="flex-1" onClick={() => setI(i + 1)}>Next · આગળ <ChevronRight className="size-5" /></Btn>}
      </div>
    </div>
  )
}

/** Step 2: a short grammar tip in Gujarati with examples. */
export function TipScreen({ nav, id }: { nav: Nav; id: string }) {
  const { settings } = useProgress()
  const { lesson, level } = findLesson(id)!
  const t = lesson.tip
  useEffect(() => () => stopSpeaking(), [])
  return (
    <div data-level={level.id} className="flex min-h-dvh flex-col">
      <Header title="Grammar tip" sub={lesson.title} onBack={nav.back} />
      <div className="flex-1 space-y-4 px-4 pt-2">
        <div className="rounded-3xl bg-card p-5 shadow-sm">
          <p className="text-4xl">💡</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight">{t.title}</h2>
          <p className="mt-3 text-lg leading-relaxed">{t.gu}</p>
        </div>
        <h3 className="px-1 font-extrabold">Examples · ઉદાહરણ</h3>
        {t.examples.map(e => (
          <div key={e.en} className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold leading-tight">{e.en}</p>
              {settings.showSay && e.say && <p className="text-accent">🗣️ {e.say}</p>}
              <p className="text-muted">{e.gu}</p>
            </div>
            <ListenButtons text={e.en} />
          </div>
        ))}
      </div>
      <div className="safe-bottom sticky bottom-0 bg-bg px-4 py-3">
        <Btn className="w-full" onClick={() => { completePart(id, 'tip'); nav.back() }}>Got it · સમજાઈ ગયું (+{PART_XP.tip} XP)</Btn>
      </div>
    </div>
  )
}

/** Step 3: a real conversation. Listen to it, then play your part (B). */
export function TalkScreen({ nav, id }: { nav: Nav; id: string }) {
  const { settings, lessons } = useProgress()
  const { lesson, level } = findLesson(id)!
  const lines = lesson.talk.lines
  const [mode, setMode] = useState<'listen' | 'role'>('listen')
  const [showGu, setShowGu] = useState(settings.showGu)
  const [playing, setPlaying] = useState(-1)
  const [step, setStep] = useState(0) // role-play: current line
  const stop = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => () => { stop.current = true; stopSpeaking() }, [])

  const playAll = async () => {
    if (playing >= 0) { stop.current = true; stopSpeaking(); setPlaying(-1); return }
    stop.current = false
    for (let k = 0; k < lines.length; k++) {
      if (stop.current) break
      setPlaying(k)
      await speak(lines[k].en)
      await new Promise(r => setTimeout(r, 350))
    }
    setPlaying(-1)
  }

  // Role-play: the other person's lines play by themselves.
  useEffect(() => {
    if (mode !== 'role' || step >= lines.length) return
    scroller.current?.querySelector(`[data-line="${step}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (lines[step].who === 'A') {
      let cancelled = false
      setPlaying(step)
      speak(lines[step].en).then(() => { if (!cancelled) { setPlaying(-1); setTimeout(() => !cancelled && setStep(s => s + 1), 300) } })
      return () => { cancelled = true }
    }
  }, [mode, step, lines])

  const startRole = () => { stop.current = true; stopSpeaking(); setPlaying(-1); setStep(0); setMode('role') }
  const finished = mode === 'role' && step >= lines.length
  const visible = mode === 'listen' ? lines : lines.slice(0, Math.min(step + 1, lines.length))

  return (
    <div data-level={level.id} className="flex min-h-dvh flex-col">
      <Header title={lesson.talk.title} sub={lesson.talk.gu} onBack={nav.back}
        right={<button onClick={() => setShowGu(!showGu)} aria-label="Show Gujarati" className="grid size-10 place-items-center rounded-full hover:bg-soft">
          {showGu ? <Eye className="size-5" /> : <EyeOff className="size-5" />}</button>} />
      <div className="mx-4 mb-2 grid grid-cols-2 rounded-2xl bg-soft p-1 text-sm font-bold">
        <button onClick={() => { setMode('listen'); setStep(0) }} className={cx('rounded-xl py-2', mode === 'listen' && 'bg-card shadow-sm')}>🎧 Listen · સાંભળો</button>
        <button onClick={startRole} className={cx('rounded-xl py-2', mode === 'role' && 'bg-card shadow-sm')}>🎤 Your turn · તમે બોલો</button>
      </div>
      <p className="px-5 pb-2 text-sm text-muted">
        {mode === 'listen' ? 'આખી વાતચીત સાંભળો. કોઈ પણ વાક્ય પર ટેપ કરીને ફરી સાંભળો.' : 'તમે "You" છો. તમારું વાક્ય આવે ત્યારે માઇક દબાવીને બોલો.'}
      </p>
      <div ref={scroller} className="flex-1 space-y-3 px-4 pb-4">
        {visible.map((l, k) => (
          <Bubble key={k} line={l} k={k} active={playing === k || (mode === 'role' && k === step && l.who === 'B')} showGu={showGu}
            onTap={() => mode === 'listen' && speak(l.en)}>
            {mode === 'role' && k === step && l.who === 'B' && (
              <div className="mt-3 border-t border-line pt-3">
                <div className="mb-2 flex justify-center"><ListenButtons text={l.en} /></div>
                <MicCheck target={l.en} onResult={r => { if (r.pass) setTimeout(() => setStep(s => s + 1), 900) }} />
                <button onClick={() => setStep(s => s + 1)} className="mt-2 w-full py-1 text-sm font-bold text-muted">Skip · છોડો</button>
              </div>
            )}
          </Bubble>
        ))}
        {finished && (
          <div className="pop rounded-3xl bg-accent-soft p-5 text-center">
            <p className="text-4xl">🎉</p>
            <p className="text-xl font-extrabold">Well done! શાબાશ!</p>
            <p className="text-muted">તમે આખી વાતચીત પૂરી કરી.</p>
          </div>
        )}
      </div>
      <div className="safe-bottom sticky bottom-0 bg-bg px-4 py-3">
        {mode === 'listen'
          ? <div className="flex gap-3">
              <Btn kind="soft" className="flex-1" onClick={playAll}>{playing >= 0 ? <><Square className="size-4 fill-current" /> Stop</> : <><Play className="size-5 fill-current" /> Play all</>}</Btn>
              <Btn className="flex-1" onClick={startRole}>🎤 Your turn</Btn>
            </div>
          : finished
            ? <Btn className="w-full" onClick={() => { completePart(id, 'talk'); nav.back() }}>
                Done · પૂરું {!lessons[id]?.talk && `(+${PART_XP.talk} XP)`}
              </Btn>
            : <Btn kind="soft" className="w-full" onClick={startRole}>↺ Start again · ફરી શરૂ કરો</Btn>}
      </div>
    </div>
  )
}

function Bubble({ line, k, active, showGu, onTap, children }: {
  line: Line; k: number; active: boolean; showGu: boolean; onTap: () => void; children?: React.ReactNode
}) {
  const me = line.who === 'B'
  return (
    <div data-line={k} className={cx('pop flex', me ? 'justify-end' : 'justify-start')}>
      <div onClick={onTap}
        className={cx('max-w-[88%] rounded-3xl p-3.5 shadow-sm transition', me ? 'rounded-br-md bg-accent-soft' : 'rounded-bl-md bg-card',
          active && 'ring-2 ring-accent', !!children && 'w-full')}>
        <p className="text-xs font-bold text-muted">{me ? 'You · તમે' : 'Other person'}</p>
        <p className="text-lg font-bold leading-snug">{line.en}</p>
        {showGu && <p className="text-muted">{line.gu}</p>}
        {children}
      </div>
    </div>
  )
}
