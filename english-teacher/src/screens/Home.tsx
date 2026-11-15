import { ChevronRight, Lock, Settings as Cog } from 'lucide-react'
import { findLesson, LEVELS } from '../data'
import { dayKey, lessonUnlocked, levelUnlocked, liveStreak, nextLessonId, useProgress } from '../lib/progress'
import type { Nav } from '../App'
import { Bar, cx, Stars } from '../ui'

export function Home({ nav }: { nav: Nav }) {
  const p = useProgress()
  const streak = liveStreak(p)
  const today = p.days[dayKey()] ?? 0
  const goal = p.settings.dailyGoal
  const nextId = nextLessonId(p)
  const next = nextId ? findLesson(nextId) : undefined
  const learned = Object.values(p.lessons).filter(l => l.done).length * 8

  return (
    <div className="pb-8">
      <header className="safe-top">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="grid size-11 place-items-center rounded-2xl bg-[linear-gradient(140deg,#22c55e,#15803d)] text-2xl text-white">🗣️</div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold leading-tight">English Teacher</h1>
            <p className="text-sm leading-tight text-muted">ગુજરાતીમાંથી અંગ્રેજી શીખો</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-card px-3 py-1.5 font-bold shadow-sm" title="Days in a row">
            <span className={cx(streak === 0 && 'grayscale')}>🔥</span>{streak}
          </div>
          <button onClick={() => nav.push({ name: 'settings' })} aria-label="Settings" className="grid size-10 place-items-center rounded-full hover:bg-soft">
            <Cog className="size-6" />
          </button>
        </div>
      </header>

      <div className="space-y-4 px-4">
        <section data-level={next?.level.id ?? 'advanced'} className="rounded-3xl p-5 text-white shadow-md" style={{ background: 'var(--hero)' }}>
          <div className="flex items-center justify-between text-sm font-semibold opacity-90">
            <span>Today · આજનો ધ્યેય</span>
            <span>{Math.min(today, goal)} / {goal} XP</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.min(1, today / goal) * 100}%` }} />
          </div>
          {next ? (
            <>
              <p className="mt-4 text-sm font-semibold opacity-90">{next.level.name} · Lesson {next.index + 1}</p>
              <p className="text-2xl font-extrabold leading-tight">{next.lesson.emoji} {next.lesson.title}</p>
              <p className="opacity-90">{next.lesson.gu}</p>
              <button onClick={() => nav.push({ name: 'lesson', id: next.lesson.id })}
                className="mt-4 flex h-12 w-full items-center justify-center gap-1 rounded-2xl bg-white text-lg font-extrabold text-[#14532d] shadow active:translate-y-px">
                {p.lessons[next.lesson.id] ? 'Continue · ચાલુ રાખો' : 'Start · શરૂ કરો'} <ChevronRight className="size-5" />
              </button>
            </>
          ) : (
            <p className="mt-4 text-xl font-extrabold">🏆 બધા લેવલ પૂરા! You finished every level.</p>
          )}
        </section>

        <div className="grid grid-cols-3 gap-3">
          <Stat value={p.xp} label="Total XP" />
          <Stat value={learned} label="Phrases" />
          <Stat value={streak} label="Day streak" />
        </div>

        <h2 className="px-1 pt-2 text-lg font-extrabold">Levels · લેવલ</h2>
        {LEVELS.map((lv, li) => {
          const open = levelUnlocked(p, li)
          const done = lv.lessons.filter(l => p.lessons[l.id]?.done).length
          return (
            <button key={lv.id} data-level={lv.id} disabled={!open}
              onClick={() => nav.push({ name: 'level', id: lv.id })}
              className="flex w-full items-center gap-4 rounded-3xl bg-card p-4 text-left shadow-sm transition active:scale-[.99] disabled:opacity-60">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl text-2xl font-extrabold text-white" style={{ background: 'var(--hero)' }}>
                {open ? li + 1 : <Lock className="size-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-extrabold">{lv.name}</span>
                  <span className="text-muted">{lv.gu}</span>
                </div>
                <p className="text-sm leading-snug text-muted">{open ? lv.about : `પહેલાં ${LEVELS[li - 1].name} પૂરું કરો`}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Bar value={done / lv.lessons.length} className="flex-1" />
                  <span className="text-xs font-bold text-muted">{done}/{lv.lessons.length}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-sm">
      <div className="text-2xl font-extrabold leading-tight">{value}</div>
      <div className="text-xs font-semibold text-muted">{label}</div>
    </div>
  )
}

export function LevelScreen({ nav, id }: { nav: Nav; id: string }) {
  const p = useProgress()
  const li = LEVELS.findIndex(l => l.id === id)
  const lv = LEVELS[li]
  return (
    <div data-level={lv.id} className="pb-8">
      <div className="safe-top text-white" style={{ background: 'var(--hero)' }}>
        <div className="px-4 pt-3 pb-6">
          <button onClick={nav.back} className="-ml-1 mb-2 rounded-full px-2 py-1 text-sm font-bold opacity-90 hover:bg-white/15">← Back</button>
          <h1 className="text-3xl font-extrabold">{lv.name} <span className="font-semibold opacity-85">· {lv.gu}</span></h1>
          <p className="opacity-90">{lv.about}</p>
        </div>
      </div>
      <ol className="relative mx-4 -mt-3 space-y-3">
        {lv.lessons.map((ls, i) => {
          const open = lessonUnlocked(p, li, i)
          const lp = p.lessons[ls.id]
          return (
            <li key={ls.id}>
              <button disabled={!open} onClick={() => nav.push({ name: 'lesson', id: ls.id })}
                className={cx('flex w-full items-center gap-3 rounded-3xl bg-card p-3 text-left shadow-sm transition active:scale-[.99]', !open && 'opacity-55')}>
                <div className={cx('grid size-14 shrink-0 place-items-center rounded-2xl text-3xl', lp?.done ? 'bg-accent-soft' : 'bg-soft')}>
                  {open ? ls.emoji : <Lock className="size-6 text-muted" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-muted">LESSON {i + 1}</p>
                  <p className="font-extrabold leading-tight">{ls.title}</p>
                  <p className="text-sm text-muted">{ls.gu}</p>
                </div>
                {lp?.done ? <Stars n={lp.stars ?? 0} /> : open ? <ChevronRight className="size-5 text-muted" /> : null}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
