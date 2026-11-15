// Builds the 10 practice questions for a lesson. Harder levels get harder question types.
import type { Fill, Lesson, LevelId, Phrase } from '../data/types'

export type Question =
  | { kind: 'choice'; mode: 'hear-gu' | 'gu-en' | 'hear-en'; phrase: Phrase; options: string[]; answer: string }
  | { kind: 'speak'; phrase: Phrase }
  | { kind: 'arrange'; phrase: Phrase; chips: string[]; answer: string }
  | { kind: 'fill'; fill: Fill; options: string[] }
  | { kind: 'type'; phrase: Phrase }

type Kind = 'hear-gu' | 'gu-en' | 'hear-en' | 'speak' | 'arrange' | 'fill' | 'type'

const RECIPES: Record<LevelId, Kind[]> = {
  beginner: ['hear-gu', 'hear-gu', 'gu-en', 'gu-en', 'speak', 'speak', 'arrange', 'arrange', 'fill', 'fill'],
  intermediate: ['hear-gu', 'hear-en', 'gu-en', 'speak', 'speak', 'arrange', 'arrange', 'fill', 'fill', 'type'],
  advanced: ['hear-en', 'gu-en', 'speak', 'speak', 'speak', 'arrange', 'arrange', 'fill', 'type', 'type'],
}

export function shuffle<T>(a: readonly T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Words for the word-order exercise: no end punctuation, but keep "o'clock", "Let's", "twenty-five". */
export const chipWords = (en: string) => en.split(/\s+/).map(w => w.replace(/^[^\w']+|[^\w']+$/g, '')).filter(Boolean)

export function buildQuiz(lesson: Lesson, level: LevelId, canSpeak: boolean): Question[] {
  const phrases = lesson.phrases
  const pool = shuffle(phrases)
  let k = 0
  const nextPhrase = (ok: (p: Phrase) => boolean = () => true) => {
    for (let tries = 0; tries < pool.length; tries++) {
      const p = pool[k++ % pool.length]
      if (ok(p)) return p
    }
    return pool[k++ % pool.length]
  }
  const others = (p: Phrase) => shuffle(phrases.filter(x => x !== p)).slice(0, 3)
  const fills = shuffle(lesson.fill)
  let fi = 0

  const recipe = RECIPES[level].map(kind => (kind === 'speak' && !canSpeak ? 'gu-en' : kind))
  const qs = recipe.map((kind): Question => {
    switch (kind) {
      case 'hear-gu': {
        const p = nextPhrase()
        return { kind: 'choice', mode: kind, phrase: p, answer: p.gu, options: shuffle([p, ...others(p)].map(x => x.gu)) }
      }
      case 'gu-en':
      case 'hear-en': {
        const p = nextPhrase()
        return { kind: 'choice', mode: kind, phrase: p, answer: p.en, options: shuffle([p, ...others(p)].map(x => x.en)) }
      }
      case 'speak':
        return { kind: 'speak', phrase: nextPhrase(p => chipWords(p.en).length <= 10) }
      case 'arrange': {
        const p = nextPhrase(p => { const n = chipWords(p.en).length; return n >= 3 && n <= 9 })
        const words = chipWords(p.en)
        const extra = level === 'beginner' ? [] : shuffle(
          [...new Set(phrases.flatMap(x => chipWords(x.en)).map(w => w.toLowerCase()))]
            .filter(w => !words.some(x => x.toLowerCase() === w)),
        ).slice(0, 2)
        return { kind: 'arrange', phrase: p, answer: words.join(' '), chips: shuffle([...words, ...extra]) }
      }
      case 'fill': {
        const f = fills[fi++ % fills.length]
        return { kind: 'fill', fill: f, options: shuffle(f.options) }
      }
      case 'type':
        return { kind: 'type', phrase: nextPhrase(p => chipWords(p.en).length <= 8) }
    }
  })
  return shuffle(qs)
}
