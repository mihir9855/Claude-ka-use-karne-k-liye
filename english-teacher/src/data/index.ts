import { advanced } from './advanced'
import { beginner } from './beginner'
import { intermediate } from './intermediate'
import type { Lesson, Level, LevelId } from './types'

export const LEVELS: Level[] = [
  { id: 'beginner', name: 'Beginner', gu: 'શરૂઆત', about: 'રોજના સરળ વાક્યો: નમસ્તે, પરિચય, ખરીદી, રસ્તો', lessons: beginner },
  { id: 'intermediate', name: 'Intermediate', gu: 'મધ્યમ', about: 'ભૂતકાળ, ભવિષ્ય, ઓફિસ, ફોન અને મુસાફરી', lessons: intermediate },
  { id: 'advanced', name: 'Advanced', gu: 'ઉચ્ચ', about: 'ઇન્ટરવ્યૂ, ઔપચારિક અંગ્રેજી, રૂઢિપ્રયોગો અને ચર્ચા', lessons: advanced },
]

export const ALL_LESSONS: Lesson[] = LEVELS.flatMap(l => l.lessons)

export function findLesson(id: string): { lesson: Lesson; level: Level; index: number } | undefined {
  for (const level of LEVELS) {
    const index = level.lessons.findIndex(l => l.id === id)
    if (index >= 0) return { lesson: level.lessons[index], level, index }
  }
}

export const levelOf = (id: LevelId) => LEVELS.find(l => l.id === id)!
