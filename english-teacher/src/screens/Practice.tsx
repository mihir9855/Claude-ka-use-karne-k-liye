import { Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { findLesson } from '../data'
import { compare, sameSentence, TYPE_PASS } from '../lib/match'
import { finishPractice, type PracticeResult } from '../lib/progress'
import { buildQuiz, type Question } from '../lib/quiz'
import { canListen, speak, stopSpeaking } from '../lib/speech'
import type { Nav } from '../App'
import { Bar, Btn, cx, ListenButtons, MicCheck, Sheet, Stars } from '../ui'

type Verdict = { ok: boolean; answer: string; gu?: string; skipped?: boolean }

export function PracticeScreen({ nav, id }: { nav: Nav; id: string }) {
  const { lesson, level } = findLesson(id)!
  const [canSpeak, setCanSpeak] = useState<boolean | null>(null)
  const [round, setRound] = useState(0)
  useEffect(() => { canListen().then(setCanSpeak) }, [])
  const quiz = useMemo(() => (canSpeak === null ? [] : buildQuiz(lesson, level.id, canSpeak)), [lesson, level.id, canSpeak, round])
  const [i, setI] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [score, setScore] = useState({ right: 0, counted: 0 })
  const [mistakes, setMistakes] = useState<Verdict[]>([])
  const [result, setResult] = useState<PracticeResult | null>(null)
  useEffect(() => () => stopSpeaking(), [])

  if (canSpeak === null || !quiz.length) return <div className="min-h-dvh" />

  const q = quiz[i]
  const judge = (v: Verdict) => {
    setVerdict(v)
    if (!v.skipped) {
      setScore(s => ({ right: s.right + (v.ok ? 1 : 0), counted: s.counted + 1 }))
      if (!v.ok) setMistakes(m => [...m, v])
    }
    if (v.ok || v.skipped) speak(v.answer)
  }
  const next = () => {
    setVerdict(null)
    if (i + 1 < quiz.length) { setI(i + 1); return }
    const pct = score.counted ? score.right / score.counted : 0
    setResult(finishPractice(id, pct, score.right))
  }
  const restart = () => { setRound(r => r + 1); setI(0); setScore({ right: 0, counted: 0 }); setMistakes([]); setResult(null); setVerdict(null) }

  if (result) {
    const pct = score.counted ? Math.round((score.right / score.counted) * 100) : 0
    return (
      <div data-level={level.id} className="safe-top flex min-h-dvh flex-col px-4 pb-6">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-7xl">{result.passed ? (result.stars === 3 ? '🏆' : '🎉') : '💪'}</p>
          <h2 className="mt-3 text-3xl font-extrabold">{result.passed ? 'Lesson complete!' : 'Almost there!'}</h2>
          <p className="text-lg text-muted">{result.passed ? 'પાઠ પૂરો થયો! શાબાશ!' : 'થોડી વધુ પ્રેક્ટિસ કરો. 60% જોઈએ.'}</p>
          <div className="mt-4"><Stars n={result.stars} size="text-4xl" /></div>
          <div className="mt-5 grid w-full max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card p-3 shadow-sm"><div className="text-3xl font-extrabold">{pct}%</div><div className="text-sm text-muted">Score</div></div>
            <div className="rounded-2xl bg-card p-3 shadow-sm"><div className="text-3xl font-extrabold text-warn">+{result.xp}</div><div className="text-sm text-muted">XP</div></div>
          </div>
          {result.levelDone && <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 font-bold text-accent">🏅 {result.levelDone} level complete! હવે આગળનું લેવલ ખુલી ગયું.</p>}
          {!result.levelDone && result.unlocked && <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 font-bold text-accent">🔓 Next lesson unlocked! આગળનો પાઠ ખુલી ગયો.</p>}
          {mistakes.length > 0 && (
            <div className="mt-5 w-full max-w-sm text-left">
              <p className="mb-2 font-extrabold">Review · ફરી જુઓ</p>
              <div className="space-y-2">
                {mistakes.map((m, k) => (
                  <div key={k} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
                    <div className="min-w-0 flex-1"><p className="font-bold leading-tight">{m.answer}</p>{m.gu && <p className="text-sm text-muted">{m.gu}</p>}</div>
                    <ListenButtons text={m.answer} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-3 pt-6">
          {result.passed && result.unlocked
            ? <Btn onClick={() => nav.replace({ name: 'lesson', id: result.unlocked! })}>Next lesson · આગળનો પાઠ →</Btn>
            : <Btn onClick={nav.back}>{result.passed ? 'Continue · આગળ' : 'Back to lesson'}</Btn>}
          <Btn kind="soft" onClick={restart}>↺ Try again · ફરી કરો</Btn>
        </div>
      </div>
    )
  }

  return (
    <div data-level={level.id} className="flex min-h-dvh flex-col">
      <div className="safe-top"><div className="flex items-center gap-3 px-3 py-3">
        <button onClick={nav.back} aria-label="Close" className="grid size-10 place-items-center rounded-full hover:bg-soft"><X className="size-6" /></button>
        <Bar value={(i + (verdict ? 1 : 0)) / quiz.length} className="flex-1" />
        <span className="w-10 text-right text-sm font-bold text-muted">{i + 1}/{quiz.length}</span></div>
      </div>
      <div className="flex-1 px-4 pt-2 pb-40">
        <QuestionView key={`${round}-${i}`} q={q} locked={!!verdict} onJudge={judge} />
      </div>
      {verdict && (
        <Sheet tone={verdict.ok || verdict.skipped ? 'good' : 'bad'}>
          <p className={cx('text-xl font-extrabold', verdict.ok ? 'text-good' : verdict.skipped ? 'text-muted' : 'text-bad')}>
            {verdict.skipped ? 'Skipped · છોડ્યું' : verdict.ok ? '✅ Correct! સાચું!' : '❌ Not quite · ખોટું'}
          </p>
          {!verdict.ok && <p className="mt-1 text-sm text-muted">Correct answer · સાચો જવાબ:</p>}
          <div className="mt-1 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-snug">{verdict.answer}</p>
              {verdict.gu && <p className="text-muted">{verdict.gu}</p>}
            </div>
            <button onClick={() => speak(verdict.answer)} aria-label="Listen" className="grid size-11 shrink-0 place-items-center rounded-full bg-card"><Volume2 className="size-5" /></button>
          </div>
          <Btn kind={verdict.ok || verdict.skipped ? 'good' : 'bad'} className="mt-3 w-full" onClick={next}>Continue · આગળ</Btn>
        </Sheet>
      )}
    </div>
  )
}

const PROMPTS: Record<string, [string, string]> = {
  'hear-gu': ['What does it mean?', 'સાંભળો અને તેનો અર્થ પસંદ કરો'],
  'gu-en': ['Choose the English', 'આ વાક્ય અંગ્રેજીમાં કેવી રીતે કહેવાય?'],
  'hear-en': ['What did you hear?', 'સાંભળો અને સાચું વાક્ય પસંદ કરો'],
  speak: ['Say this sentence', 'માઇક દબાવીને આ વાક્ય બોલો'],
  arrange: ['Put the words in order', 'શબ્દો સાચા ક્રમમાં ગોઠવો'],
  fill: ['Fill in the blank', 'ખાલી જગ્યા પૂરો'],
  type: ['Type what you hear', 'સાંભળો અને અંગ્રેજીમાં લખો'],
}

function QuestionView({ q, locked, onJudge }: { q: Question; locked: boolean; onJudge: (v: Verdict) => void }) {
  const kind = q.kind === 'choice' ? q.mode : q.kind
  const [title, gu] = PROMPTS[kind]
  return (
    <div className="pop">
      <h2 className="text-2xl font-extrabold leading-tight">{title}</h2>
      <p className="mb-5 text-muted">{gu}</p>
      {q.kind === 'choice' && <Choice q={q} locked={locked} onJudge={onJudge} />}
      {q.kind === 'speak' && <Speak q={q} locked={locked} onJudge={onJudge} />}
      {q.kind === 'arrange' && <Arrange q={q} locked={locked} onJudge={onJudge} />}
      {q.kind === 'fill' && <FillBlank q={q} locked={locked} onJudge={onJudge} />}
      {q.kind === 'type' && <TypeIt q={q} locked={locked} onJudge={onJudge} />}
    </div>
  )
}

type QP<K extends Question['kind']> = { q: Extract<Question, { kind: K }>; locked: boolean; onJudge: (v: Verdict) => void }

function useAutoPlay(text: string, on: boolean) {
  useEffect(() => { if (on) { const t = setTimeout(() => speak(text), 300); return () => clearTimeout(t) } }, [text, on])
}

function Choice({ q, locked, onJudge }: QP<'choice'>) {
  const [pick, setPick] = useState<string | null>(null)
  const hear = q.mode !== 'gu-en'
  useAutoPlay(q.phrase.en, hear)
  return (
    <>
      {hear
        ? <div className="mb-6 flex justify-center"><ListenButtons text={q.phrase.en} big /></div>
        : <div className="mb-6 rounded-3xl bg-card p-5 text-2xl font-bold shadow-sm">{q.phrase.gu}</div>}
      <div className="space-y-3">
        {q.options.map(o => {
          const chosen = pick === o
          const show = locked && (o === q.answer || chosen)
          return (
            <button key={o} disabled={locked} onClick={() => setPick(o)}
              className={cx('w-full rounded-2xl border-2 bg-card p-4 text-left text-lg font-semibold leading-snug transition active:scale-[.99]',
                show ? (o === q.answer ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : chosen ? 'border-accent bg-accent-soft' : 'border-line')}>
              {o}
            </button>
          )
        })}
      </div>
      {!locked && <CheckBar disabled={!pick} onCheck={() => onJudge({ ok: pick === q.answer, answer: q.phrase.en, gu: q.phrase.gu })} />}
    </>
  )
}

function Speak({ q, locked, onJudge }: QP<'speak'>) {
  const [tries, setTries] = useState(0)
  return (
    <>
      <div className="mb-5 rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-2xl font-extrabold leading-tight">{q.phrase.en}</p>
        <p className="mt-1 text-lg text-muted">{q.phrase.gu}</p>
        <div className="mt-3"><ListenButtons text={q.phrase.en} /></div>
      </div>
      {!locked && (
        <>
          <MicCheck target={q.phrase.en} onResult={r => {
            const t = tries + 1
            setTries(t)
            if (r.pass) setTimeout(() => onJudge({ ok: true, answer: q.phrase.en, gu: q.phrase.gu }), 700)
            else if (t >= 3) setTimeout(() => onJudge({ ok: false, answer: q.phrase.en, gu: q.phrase.gu }), 1200)
          }} />
          <p className="mt-2 text-center text-sm text-muted">{3 - tries} tries left · બાકી પ્રયત્નો</p>
          <button onClick={() => onJudge({ ok: false, skipped: true, answer: q.phrase.en, gu: q.phrase.gu })}
            className="mt-2 w-full py-2 text-sm font-bold text-muted">Can't speak now · હમણાં બોલી શકું તેમ નથી</button>
        </>
      )}
    </>
  )
}

function Arrange({ q, locked, onJudge }: QP<'arrange'>) {
  const [chosen, setChosen] = useState<number[]>([])
  const sentence = chosen.map(k => q.chips[k]).join(' ')
  return (
    <>
      <div className="mb-4 flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm">
        <p className="flex-1 text-xl font-bold">{q.phrase.gu}</p>
        <ListenButtons text={q.phrase.en} />
      </div>
      <div className="mb-5 flex min-h-28 flex-wrap content-start gap-2 border-b-2 border-line pb-3">
        {chosen.map((k, n) => (
          <button key={k} disabled={locked} onClick={() => setChosen(chosen.filter((_, m) => m !== n))}
            className="pop rounded-xl border-2 border-line bg-card px-3 py-2 text-lg font-bold shadow-[0_2px_0_var(--line)]">{q.chips[k]}</button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {q.chips.map((w, k) => {
          const used = chosen.includes(k)
          return (
            <button key={k} disabled={locked || used} onClick={() => setChosen([...chosen, k])}
              className={cx('rounded-xl border-2 px-3 py-2 text-lg font-bold transition',
                used ? 'border-soft bg-soft text-transparent' : 'border-line bg-card shadow-[0_2px_0_var(--line)] active:translate-y-px')}>{w}</button>
          )
        })}
      </div>
      {!locked && <CheckBar disabled={!chosen.length} onCheck={() => onJudge({ ok: sameSentence(sentence, q.answer), answer: q.phrase.en, gu: q.phrase.gu })} />}
    </>
  )
}

function FillBlank({ q, locked, onJudge }: QP<'fill'>) {
  const [pick, setPick] = useState<string | null>(null)
  const [before, after] = q.fill.text.split('___')
  const full = q.fill.text.replace('___', q.fill.answer)
  return (
    <>
      <div className="mb-6 rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-2xl font-bold leading-relaxed">
          {before}
          <span className={cx('mx-1 inline-block min-w-20 border-b-4 px-2 text-center',
            locked ? (pick === q.fill.answer ? 'border-good text-good' : 'border-bad text-bad') : pick ? 'border-accent text-accent' : 'border-line')}>
            {pick ?? ' '}
          </span>
          {after}
        </p>
        <p className="mt-2 text-muted">{q.fill.gu}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {q.options.map(o => (
          <button key={o} disabled={locked} onClick={() => setPick(o)}
            className={cx('rounded-2xl border-2 px-5 py-3 text-xl font-bold transition active:scale-95',
              pick === o ? 'border-accent bg-accent-soft' : 'border-line bg-card')}>{o}</button>
        ))}
      </div>
      {!locked && <CheckBar disabled={!pick} onCheck={() => onJudge({ ok: pick === q.fill.answer, answer: full, gu: q.fill.gu })} />}
    </>
  )
}

function TypeIt({ q, locked, onJudge }: QP<'type'>) {
  const [text, setText] = useState('')
  useAutoPlay(q.phrase.en, true)
  return (
    <>
      <div className="mb-5 flex justify-center"><ListenButtons text={q.phrase.en} big /></div>
      <textarea value={text} onChange={e => setText(e.target.value)} disabled={locked} rows={3}
        autoCapitalize="sentences" autoCorrect="off" spellCheck={false} placeholder="Type in English... અંગ્રેજીમાં લખો"
        className="w-full resize-none rounded-2xl border-2 border-line bg-card p-4 text-xl outline-none focus:border-accent" />
      {!locked && <CheckBar disabled={!text.trim()} onCheck={() => onJudge({ ok: compare(q.phrase.en, text, true).score >= TYPE_PASS, answer: q.phrase.en, gu: q.phrase.gu })} />}
    </>
  )
}

function CheckBar({ disabled, onCheck }: { disabled: boolean; onCheck: () => void }) {
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 bg-bg px-4 py-3">
      <div className="mx-auto max-w-xl"><Btn className="w-full" disabled={disabled} onClick={onCheck}>Check · તપાસો</Btn></div>
    </div>
  )
}
