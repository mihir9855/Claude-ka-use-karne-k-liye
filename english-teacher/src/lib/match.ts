// Compares what the learner said (or typed) with the sentence they were asked for.

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are', "he's": 'he is', "she's": 'she is',
  "it's": 'it is', "that's": 'that is', "what's": 'what is', "there's": 'there is', "here's": 'here is', "let's": 'let us',
  "i'll": 'i will', "you'll": 'you will', "we'll": 'we will', "they'll": 'they will', "he'll": 'he will', "she'll": 'she will',
  "i've": 'i have', "we've": 'we have', "you've": 'you have', "i'd": 'i would', "you'd": 'you would',
  "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "can't": 'can not', cannot: 'can not', "won't": 'will not',
  "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not',
  "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not',
}
const SAME: Record<string, string> = { mr: 'mister', ok: 'okay', okey: 'okay', tv: 'tv', mom: 'mother', mum: 'mother', dad: 'father' }

// Words the phone often mixes up because they sound the same.
const SOUNDS_LIKE = [
  ['two', 'to', 'too'], ['four', 'for'], ['eight', 'ate'], ['one', 'won'], ['hear', 'here'], ['right', 'write'],
  ['son', 'sun'], ['no', 'know'], ['see', 'sea'], ['by', 'buy', 'bye'], ['meet', 'meat'], ['weak', 'week'],
  ['there', 'their'], ['whole', 'hole'], ['our', 'hour'], ['tea', 't'], ['dosa', 'dosha', 'dossa'], ['roti', 'rotti'],
]
const soundKey = new Map<string, string>()
for (const g of SOUNDS_LIKE) for (const w of g) soundKey.set(w, g[0])

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

function numberWords(n: number): string {
  if (n < 20) return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numberWords(n % 100) : '')
  if (n < 10000) return numberWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numberWords(n % 1000) : '')
  return String(n).split('').map(d => ONES[+d]).join(' ')
}

/** One written word -> the simple tokens we compare. */
function normWord(raw: string): string[] {
  let w = raw.toLowerCase().replace(/[’‘`]/g, "'")
  const time = w.match(/^(\d{1,2}):(\d{2})$/)
  if (time) return [...numberWords(+time[1]).split(' '), ...(time[2] === '00' ? ['oclock'] : numberWords(+time[2]).split(' '))]
  w = w.replace(/[^a-z0-9'\- ]/g, '').replace(/^'+|'+$/g, '')
  const out: string[] = []
  for (const part of w.split('-')) {
    if (!part) continue
    if (/^\d+$/.test(part)) { out.push(...numberWords(+part).split(' ')); continue }
    const expanded = CONTRACTIONS[part]
    for (const t of (expanded ?? part).split(' ')) {
      const clean = t.replace(/'/g, '')
      if (clean) out.push(SAME[clean] ?? clean)
    }
  }
  return out
}

function tokens(text: string): string[] {
  const out = text.split(/\s+/).flatMap(normWord)
  // "u p i" -> "upi", "t v" -> "tv" (the phone sometimes spells out short words)
  const joined: string[] = []
  for (let i = 0; i < out.length; i++) {
    if (out[i].length === 1 && out[i + 1]?.length === 1 && !(out[i] === 'a' || out[i] === 'i')) {
      let s = out[i]
      while (out[i + 1]?.length === 1) s += out[++i]
      joined.push(s)
    } else joined.push(out[i])
  }
  return joined
}

function lev(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

export type Compare = {
  score: number // 0..1, share of the target's words that were said/typed
  marks: { word: string; ok: boolean }[] // the target sentence, word by word
}

export function compare(target: string, attempt: string, typed = false): Compare {
  const words = target.split(/\s+/).filter(Boolean)
  const tt: { t: string; w: number }[] = []
  words.forEach((w, i) => normWord(w).forEach(t => tt.push({ t, w: i })))
  const at = tokens(attempt)
  const eq = (a: string, b: string) =>
    a === b ||
    (!typed && soundKey.has(a) && soundKey.get(a) === soundKey.get(b)) ||
    (typed && a.length > 3 && lev(a, b) <= 1) ||
    (!typed && a.length > 4 && lev(a, b) <= 1)

  // Longest common subsequence: which target words appear, in order, in the attempt.
  const n = tt.length, m = at.length
  const L = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = eq(tt[i].t, at[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const hit = new Array<boolean>(n).fill(false)
  for (let i = 0, j = 0; i < n && j < m;) {
    if (eq(tt[i].t, at[j]) && L[i][j] === L[i + 1][j + 1] + 1) { hit[i] = true; i++; j++ }
    else if (L[i + 1][j] >= L[i][j + 1]) i++
    else j++
  }
  const marks = words.map((word, wi) => ({ word, ok: tt.every((t, k) => t.w !== wi || hit[k]) }))
  let score = n ? hit.filter(Boolean).length / n : 0
  // Typed answers with lots of extra words aren't right either.
  if (typed && m > n + 1) score = Math.min(score, n / m)
  return { score, marks }
}

/** Best result over several guesses from the phone. */
export function bestOf(target: string, guesses: string[]): Compare & { heard: string } {
  let best: Compare & { heard: string } = { ...compare(target, ''), heard: '' }
  for (const g of guesses) {
    const c = compare(target, g)
    if (c.score > best.score) best = { ...c, heard: g }
  }
  return best
}

export const SPEAK_PASS = 0.8
export const TYPE_PASS = 0.9

/** Same sentence, ignoring case and punctuation (for word-order answers). */
export const sameSentence = (a: string, b: string) => tokens(a).join(' ') === tokens(b).join(' ')
