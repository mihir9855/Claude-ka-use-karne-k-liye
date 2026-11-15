// Small building blocks shared by all screens.
import { ArrowLeft, Mic, Snail, Square, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { bestOf, SPEAK_PASS, type Compare } from './lib/match'
import { canListen, listen, MicError, speak, stopListening } from './lib/speech'

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ')

export function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="safe-top sticky top-0 z-10 bg-bg/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2.5">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="grid size-10 place-items-center rounded-full hover:bg-soft">
            <ArrowLeft className="size-6" />
          </button>
        )}
        <div className="min-w-0 flex-1 px-1">
          <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
          {sub && <p className="truncate text-sm leading-tight text-muted">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}

export function Btn({ children, onClick, kind = 'primary', disabled, className }: {
  children: ReactNode; onClick?: () => void; kind?: 'primary' | 'soft' | 'ghost' | 'good' | 'bad'; disabled?: boolean; className?: string
}) {
  const k = {
    primary: 'bg-accent text-accent-ink shadow-[0_3px_0_color-mix(in_srgb,var(--accent)_60%,black)]',
    good: 'bg-good text-white shadow-[0_3px_0_color-mix(in_srgb,var(--good)_60%,black)]',
    bad: 'bg-bad text-white shadow-[0_3px_0_color-mix(in_srgb,var(--bad)_60%,black)]',
    soft: 'bg-soft text-fg',
    ghost: 'text-muted',
  }[kind]
  return (
    <button onClick={onClick} disabled={disabled}
      className={cx('flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-base font-bold transition active:translate-y-px disabled:opacity-40 disabled:shadow-none', k, className)}>
      {children}
    </button>
  )
}

export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx('h-2.5 overflow-hidden rounded-full bg-soft', className)}>
      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.round(Math.min(1, value) * 100)}%` }} />
    </div>
  )
}

export function Stars({ n, size = 'text-base' }: { n: number; size?: string }) {
  return (
    <span className={cx('tracking-tight', size)} aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map(i => <span key={i} className={i < n ? '' : 'opacity-20 grayscale'}>⭐</span>)}
    </span>
  )
}

/** 🔊 and 🐢 buttons that read `text` aloud. */
export function ListenButtons({ text, big }: { text: string; big?: boolean }) {
  const [on, setOn] = useState<'n' | 's' | null>(null)
  const play = async (slow: boolean) => { setOn(slow ? 's' : 'n'); await speak(text, slow); setOn(null) }
  const s = big ? 'size-16' : 'size-11'
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => play(false)} aria-label="Listen"
        className={cx(s, 'grid place-items-center rounded-full bg-accent text-accent-ink transition active:scale-95', on === 'n' && 'ring-4 ring-accent/30')}>
        <Volume2 className={big ? 'size-8' : 'size-5'} />
      </button>
      <button onClick={() => play(true)} aria-label="Listen slowly"
        className={cx(big ? 'size-12' : 'size-11', 'grid place-items-center rounded-full bg-accent-soft text-accent transition active:scale-95', on === 's' && 'ring-4 ring-accent/30')}>
        <Snail className={big ? 'size-6' : 'size-5'} />
      </button>
    </div>
  )
}

export function Words({ marks }: { marks: Compare['marks'] }) {
  return (
    <p className="text-xl font-semibold leading-snug">
      {marks.map((m, i) => <span key={i} className={m.ok ? 'text-good' : 'text-bad underline decoration-2 underline-offset-4'}>{m.word} </span>)}
    </p>
  )
}

export type MicResult = Compare & { heard: string; pass: boolean }

/** Big microphone button: listens, checks against `target`, shows which words were right. */
export function MicCheck({ target, onResult, autoHide }: { target: string; onResult?: (r: MicResult) => void; autoHide?: boolean }) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [state, setState] = useState<'idle' | 'listening' | 'checking'>('idle')
  const [result, setResult] = useState<MicResult | null>(null)
  const [error, setError] = useState('')
  const alive = useRef(true)

  useEffect(() => { canListen().then(setSupported); return () => { alive.current = false; stopListening() } }, [])
  useEffect(() => { setResult(null); setError('') }, [target])

  const go = async () => {
    if (state === 'listening') { stopListening(); return }
    setError(''); setResult(null); setState('listening')
    try {
      const guesses = await listen()
      if (!alive.current) return
      if (!guesses.length) { setError('કંઈ સંભળાયું નહીં. ફરી બોલો. (Nothing heard, try again.)'); return }
      const best = bestOf(target, guesses)
      const r = { ...best, heard: best.heard || guesses[0], pass: best.score >= SPEAK_PASS }
      setResult(r)
      onResult?.(r)
    } catch (e) {
      if (!alive.current) return
      setError(e instanceof MicError && e.kind === 'permission'
        ? 'માઇક્રોફોનની પરવાનગી આપો. (Please allow the microphone in phone settings.)'
        : 'માઇક ચાલુ ન થયું. ફરી પ્રયત્ન કરો. (Could not start the mic.)')
    } finally {
      if (alive.current) setState('idle')
    }
  }

  if (supported === false)
    return <p className="rounded-2xl bg-soft p-3 text-sm text-muted">આ ફોનમાં બોલીને ચેક કરવાનું ચાલતું નથી. "Google" એપ ચાલુ છે કે નહીં તે તપાસો.</p>

  return (
    <div className="flex flex-col items-center gap-3">
      {result && !(autoHide && result.pass) && (
        <div className={cx('pop w-full rounded-2xl p-3', result.pass ? 'bg-good-soft' : 'bg-bad-soft')}>
          <div className="mb-1 flex items-center justify-between">
            <span className={cx('font-bold', result.pass ? 'text-good' : 'text-bad')}>
              {result.pass ? (result.score === 1 ? '🎉 Perfect! સરસ!' : '👍 Good! સારું!') : '🔁 Try again! ફરી બોલો'}
            </span>
            <span className="text-sm font-bold text-muted">{Math.round(result.score * 100)}%</span>
          </div>
          <Words marks={result.marks} />
          <p className="mt-1 text-sm text-muted">You said: “{result.heard}”</p>
        </div>
      )}
      {error && <p className="w-full rounded-2xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}
      <button onClick={go} disabled={supported === null || state === 'checking'} aria-label={state === 'listening' ? 'Stop' : 'Speak'}
        className={cx('grid size-20 place-items-center rounded-full text-white shadow-lg transition active:scale-95',
          state === 'listening' ? 'listening bg-bad' : 'bg-accent text-accent-ink')}>
        {state === 'listening' ? <Square className="size-8 fill-current" /> : <Mic className="size-9" />}
      </button>
      <p className="text-sm font-semibold text-muted">{state === 'listening' ? 'Listening... હવે બોલો' : 'Tap and speak · દબાવીને બોલો'}</p>
    </div>
  )
}

export function Sheet({ children, tone }: { children: ReactNode; tone: 'good' | 'bad' }) {
  return (
    <div className={cx("slide-up fixed inset-x-0 bottom-0 z-20 rounded-t-3xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]", tone === 'good' ? 'bg-good-soft' : 'bg-bad-soft')}>
      <div className="mx-auto max-w-xl">{children}</div>
    </div>
  )
}
