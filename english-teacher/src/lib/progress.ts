// Saves the learner's progress on the phone (localStorage) and works out what is unlocked.
import { useSyncExternalStore } from 'react'
import { LEVELS, findLesson } from '../data'
import type { Accent } from './speech'

export type Part = 'learn' | 'tip' | 'talk'
export type LessonProgress = { learn?: boolean; tip?: boolean; talk?: boolean; best?: number; stars?: number; done?: boolean }
export type Settings = { accent: Accent; speed: number; showSay: boolean; showGu: boolean; autoPlay: boolean; unlockAll: boolean; dailyGoal: number }
export type Progress = {
  lessons: Record<string, LessonProgress>
  xp: number
  streak: number
  lastDay?: string
  days: Record<string, number> // xp earned per day
  settings: Settings
}

const KEY = 'english-teacher.v1'
const DEFAULT_SETTINGS: Settings = { accent: 'en-US', speed: 1, showSay: true, showGu: true, autoPlay: true, unlockAll: false, dailyGoal: 50 }
const fresh = (): Progress => ({ lessons: {}, xp: 0, streak: 0, days: {}, settings: { ...DEFAULT_SETTINGS } })

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as Progress
      return { ...fresh(), ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } }
    }
  } catch { /* storage blocked or broken: start fresh */ }
  return fresh()
}

let state = load()
const listeners = new Set<() => void>()

function set(next: Progress) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  listeners.forEach(l => l())
}

export function useProgress(): Progress {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => state)
}
export const getProgress = () => state

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function withXp(p: Progress, xp: number): Progress {
  const today = dayKey()
  const yesterday = dayKey(new Date(Date.now() - 864e5))
  const streak = p.lastDay === today ? p.streak : p.lastDay === yesterday ? p.streak + 1 : 1
  return { ...p, xp: p.xp + xp, streak, lastDay: today, days: { ...p.days, [today]: (p.days[today] ?? 0) + xp } }
}

/** Streak to show: it is broken if the learner skipped a whole day. */
export function liveStreak(p: Progress): number {
  if (!p.lastDay) return 0
  return p.lastDay === dayKey() || p.lastDay === dayKey(new Date(Date.now() - 864e5)) ? p.streak : 0
}

export const PART_XP: Record<Part, number> = { learn: 10, tip: 5, talk: 15 }

export function completePart(lessonId: string, part: Part) {
  const lp = state.lessons[lessonId] ?? {}
  const first = !lp[part]
  const next = { ...state, lessons: { ...state.lessons, [lessonId]: { ...lp, [part]: true } } }
  set(first ? withXp(next, PART_XP[part]) : next)
}

export const PASS = 0.6
export const starsFor = (score: number) => (score >= 0.9 ? 3 : score >= 0.75 ? 2 : score >= PASS ? 1 : 0)

export type PracticeResult = { stars: number; passed: boolean; xp: number; unlocked?: string; levelDone?: string }

export function finishPractice(lessonId: string, score: number, correct: number): PracticeResult {
  const lp = state.lessons[lessonId] ?? {}
  const stars = starsFor(score)
  const passed = stars > 0
  const firstPass = passed && !lp.done
  const xp = correct * 5 + (firstPass ? 20 : 0)
  const nextBefore = nextLessonId(state)
  let next: Progress = {
    ...state,
    lessons: { ...state.lessons, [lessonId]: { ...lp, best: Math.max(lp.best ?? 0, score), stars: Math.max(lp.stars ?? 0, stars), done: lp.done || passed } },
  }
  next = withXp(next, xp)
  set(next)
  const res: PracticeResult = { stars, passed, xp }
  if (firstPass) {
    const info = findLesson(lessonId)!
    if (info.level.lessons.every(l => next.lessons[l.id]?.done)) res.levelDone = info.level.name
    const after = nextLessonId(next)
    if (after && after !== nextBefore && after !== lessonId) res.unlocked = after
  }
  return res
}

export function updateSettings(s: Partial<Settings>) {
  set({ ...state, settings: { ...state.settings, ...s } })
}

export function resetProgress() {
  set({ ...fresh(), settings: state.settings })
}

// ---------- What is unlocked ----------

export function levelDone(p: Progress, levelIndex: number) {
  return LEVELS[levelIndex].lessons.every(l => p.lessons[l.id]?.done)
}
export function levelUnlocked(p: Progress, levelIndex: number) {
  return p.settings.unlockAll || levelIndex === 0 || levelDone(p, levelIndex - 1)
}
export function lessonUnlocked(p: Progress, levelIndex: number, lessonIndex: number) {
  if (!levelUnlocked(p, levelIndex)) return false
  if (p.settings.unlockAll || lessonIndex === 0) return true
  return !!p.lessons[LEVELS[levelIndex].lessons[lessonIndex - 1].id]?.done
}
/** The first unlocked lesson that is not finished yet (where "Continue" goes). */
export function nextLessonId(p: Progress): string | undefined {
  for (let li = 0; li < LEVELS.length; li++)
    for (let i = 0; i < LEVELS[li].lessons.length; i++)
      if (lessonUnlocked(p, li, i) && !p.lessons[LEVELS[li].lessons[i].id]?.done) return LEVELS[li].lessons[i].id
}
