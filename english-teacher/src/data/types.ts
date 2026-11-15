// One English phrase: English text, Gujarati meaning, and (Beginner only) how to say it, written in Gujarati script.
export type Phrase = { en: string; gu: string; say?: string }
// One line of a conversation. 'B' is always the learner ("You").
export type Line = { who: 'A' | 'B'; en: string; gu: string }
// Fill-in-the-blank: `text` contains ___ where `answer` goes.
export type Fill = { text: string; answer: string; options: string[]; gu: string }
export type Tip = { title: string; gu: string; examples: Phrase[] }
export type Talk = { title: string; gu: string; lines: Line[] }

export type Lesson = {
  id: string
  emoji: string
  title: string
  gu: string
  phrases: Phrase[]
  tip: Tip
  talk: Talk
  fill: Fill[]
}

export type LevelId = 'beginner' | 'intermediate' | 'advanced'
export type Level = { id: LevelId; name: string; gu: string; about: string; lessons: Lesson[] }

// Short helpers so the lesson files stay readable.
export const p = (en: string, gu: string, say?: string): Phrase => ({ en, gu, say })
export const A = (en: string, gu: string): Line => ({ who: 'A', en, gu })
export const B = (en: string, gu: string): Line => ({ who: 'B', en, gu })
export const f = (text: string, answer: string, options: string[], gu: string): Fill => ({ text, answer, options, gu })
