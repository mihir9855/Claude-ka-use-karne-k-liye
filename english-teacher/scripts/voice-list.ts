// Writes voice/list.json: every English sentence the app can speak, with its clip id.
// The GitHub build turns this list into natural-voice recordings (scripts/make-voices.py).
import { writeFileSync } from 'node:fs'
import { ALL_LESSONS } from '../src/data'
import { voiceKey } from '../src/lib/voicekey'
import { EXTRA_SENTENCES } from '../src/lib/speech-texts'

const texts = new Set<string>(EXTRA_SENTENCES)
for (const l of ALL_LESSONS) {
  l.phrases.forEach(p => texts.add(p.en))
  l.tip.examples.forEach(p => texts.add(p.en))
  l.talk.lines.forEach(x => texts.add(x.en))
  l.fill.forEach(f => texts.add(f.text.replace('___', f.answer)))
}
const list = [...texts].map(text => ({ key: voiceKey(text), text }))
const keys = new Set(list.map(x => x.key))
if (keys.size !== list.length) throw new Error('Two sentences got the same voice id')
writeFileSync('voice/list.json', JSON.stringify(list, null, 1) + '\n')
console.log(`voice/list.json: ${list.length} sentences`)
