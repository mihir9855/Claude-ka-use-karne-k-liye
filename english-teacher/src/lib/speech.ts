// Listening (text-to-speech) and speaking (speech recognition).
// In the APK we use Android's own engines through Capacitor plugins; in a browser we use the Web Speech API.
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { voiceKey } from './voicekey'

export type Accent = 'en-US' | 'en-GB' | 'en-IN'
export type Gender = 'female' | 'male'

const native = Capacitor.isNativePlatform()
const opts = { accent: 'en-US' as Accent, speed: 1, natural: true, gender: 'female' as Gender }

export function configureSpeech(accent: Accent, speed: number, natural: boolean, gender: Gender) {
  Object.assign(opts, { accent, speed, natural, gender })
}

// Natural voice: clips recorded with a neural voice by the GitHub build (scripts/make-voices.py),
// built into the app. Sentences without a clip use the phone's own voice.
// voice/<voice name>/<sentence id>.ogg -> "<voice name>/<sentence id>"
const CLIPS: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob('../../voice/*/*.ogg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)
    .map(([path, url]) => [path.split('/').slice(-2).join('/').replace('.ogg', ''), url]),
)
const NATURAL: Record<Gender, string> = { female: 'af_heart', male: 'am_michael' }
export const hasNaturalVoice = () => Object.keys(CLIPS).length > 0
let clip: HTMLAudioElement | undefined

function playClip(url: string, rate: number, token: number): Promise<void> {
  return new Promise(resolve => {
    const a = new Audio(url)
    clip = a
    a.playbackRate = rate
    a.preservesPitch = true
    a.onended = a.onerror = a.onpause = () => resolve()
    a.play().catch(() => resolve())
    if (token !== speakToken) a.pause()
  })
}

// ---------- Listening ----------

type WebSR = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void; stop(): void; abort(): void
}
const WebRecognition: (new () => WebSR) | undefined =
  typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : undefined

// ---------- Choosing a real voice for the accent ----------
// The accent only changes the sound if we pick a voice made for that accent; the phone's default voice ignores it.

type VoiceInfo = { name: string; lang: string; localService?: boolean }
const normLang = (l: string) => l.toLowerCase().replace('_', '-')

// Android's Google voices are named like "en-gb-x-gbb-local"; the 3-letter code tells male from female.
const MALE_CODES = ['iol', 'iom', 'tpd', 'gbb', 'gbd', 'rjs', 'end', 'ene']
const FEMALE_CODES = ['sfg', 'iob', 'iog', 'tpc', 'tpf', 'gba', 'gbc', 'gbg', 'ahp', 'cxx']
function genderOf(name: string): Gender | undefined {
  const n = name.toLowerCase()
  if (/\bfemale\b|woman|samantha|zira|susan|hazel|heera|veena|karen|serena/.test(n)) return 'female'
  if (/\bmale\b|\bman\b|david|mark|george|ravi|rishi|daniel|alex/.test(n)) return 'male'
  const code = n.match(/-x-([a-z]{3})-/)?.[1]
  if (code && MALE_CODES.includes(code)) return 'male'
  if (code && FEMALE_CODES.includes(code)) return 'female'
}

function score(v: VoiceInfo, want: string): number {
  const lang = normLang(v.lang)
  if (lang !== want) return -1
  let s = 10
  const g = genderOf(v.name)
  if (g === opts.gender) s += 8
  else if (g) s -= 2
  if (/google/i.test(v.name)) s += 3
  if (/natural|neural|enhanced|premium|wavenet/i.test(v.name)) s += 4
  if (v.localService !== false) s += 1 // works without internet
  return s
}

function bestIndex(voices: VoiceInfo[], accent: Accent): number {
  let best = -1, bestScore = -1
  voices.forEach((v, i) => { const sc = score(v, accent.toLowerCase()); if (sc > bestScore) { best = i; bestScore = sc } })
  return best
}

let nativeVoices: Promise<VoiceInfo[]> | undefined
const getNativeVoices = () => (nativeVoices ??= TextToSpeech.getSupportedVoices().then(r => r.voices).catch(() => []))
const webVoices = () => (typeof speechSynthesis === 'undefined' ? [] : speechSynthesis.getVoices())

/** The voice used for the current accent, or undefined if the phone has none for it. */
async function voiceFor(accent: Accent): Promise<{ index: number; info: VoiceInfo } | undefined> {
  const list = native ? await getNativeVoices() : webVoices()
  const index = bestIndex(list, accent)
  return index >= 0 ? { index, info: list[index] } : undefined
}

/** For Settings: which voice the phone will use for this accent. */
export async function voiceName(accent: Accent): Promise<string | undefined> {
  if (!native && typeof speechSynthesis !== 'undefined' && !speechSynthesis.getVoices().length)
    await new Promise(r => { speechSynthesis.onvoiceschanged = r; setTimeout(r, 1500) })
  return (await voiceFor(accent))?.info.name
}

let speakToken = 0

/** Reads `text` aloud. Resolves when it finishes (or is stopped). */
export async function speak(text: string, slow = false): Promise<void> {
  const token = ++speakToken
  clip?.pause()
  const key = voiceKey(text)
  const url = opts.natural ? CLIPS[`${NATURAL[opts.gender]}/${key}`] : undefined
  if (url) {
    if (!native && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
    if (native) await TextToSpeech.stop().catch(() => {})
    return playClip(url, (slow ? 0.75 : 1) * opts.speed, token)
  }
  const rate = (slow ? 0.65 : 1) * opts.speed
  if (native) {
    try {
      await TextToSpeech.stop()
      if (token !== speakToken) return
      const v = await voiceFor(opts.accent)
      if (token !== speakToken) return
      await TextToSpeech.speak({ text, lang: opts.accent, rate, pitch: 1, volume: 1, category: 'playback', ...(v ? { voice: v.index } : {}) })
    } catch (e) {
      console.warn('TTS failed', e)
    }
    return
  }
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  await new Promise<void>(resolve => {
    const u = new SpeechSynthesisUtterance(text)
    const list = webVoices()
    const i = bestIndex(list, opts.accent)
    try { if (i >= 0) u.voice = list[i] } catch { /* keep the default voice */ }
    u.lang = opts.accent
    u.rate = rate
    // Some browsers never fire onend; don't hang forever.
    const timer = setTimeout(resolve, 1500 + text.length * 150 / rate)
    u.onend = u.onerror = () => { clearTimeout(timer); resolve() }
    speechSynthesis.speak(u)
  })
}

export function stopSpeaking() {
  speakToken++
  clip?.pause()
  if (native) TextToSpeech.stop().catch(() => {})
  else if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

// ---------- Speaking ----------

let micSupport: Promise<boolean> | undefined
/** Whether this phone can check speech at all. */
export function canListen(): Promise<boolean> {
  if (!micSupport) {
    micSupport = native
      ? SpeechRecognition.available().then(r => r.available).catch(() => false)
      : Promise.resolve(!!WebRecognition)
  }
  return micSupport
}

export class MicError extends Error {
  constructor(public kind: 'permission' | 'unavailable' | 'failed', message: string) { super(message) }
}

let activeWeb: WebSR | undefined

/** Listens for one sentence. Resolves with what the phone heard (best guesses first); [] if nothing was heard. */
export async function listen(): Promise<string[]> {
  stopSpeaking()
  if (!(await canListen())) throw new MicError('unavailable', 'Speech recognition is not available on this phone.')
  // Indian English recognition understands Gujarati/Hindi speakers better.
  const language = 'en-IN'
  if (native) {
    let perm = await SpeechRecognition.checkPermissions()
    if (perm.speechRecognition !== 'granted') perm = await SpeechRecognition.requestPermissions()
    if (perm.speechRecognition !== 'granted') throw new MicError('permission', 'Microphone permission was not given.')
    try {
      const r = await SpeechRecognition.start({ language, maxResults: 5, partialResults: false, popup: false })
      return r.matches ?? []
    } catch (e) {
      const msg = String((e as Error)?.message ?? e)
      if (/no match|didn't understand|no speech|timeout/i.test(msg)) return []
      throw new MicError('failed', msg)
    }
  }
  return new Promise<string[]>((resolve, reject) => {
    const r = new WebRecognition!()
    activeWeb = r
    r.lang = language
    r.interimResults = false
    r.continuous = false
    r.maxAlternatives = 5
    let heard: string[] = []
    r.onresult = e => {
      const res = e.results[0]
      heard = Array.from({ length: res.length }, (_, i) => res[i].transcript)
    }
    r.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') reject(new MicError('permission', 'Microphone permission was not given.'))
      else if (e.error === 'no-speech' || e.error === 'aborted') resolve([])
      else reject(new MicError('failed', e.error))
    }
    r.onend = () => { activeWeb = undefined; resolve(heard) }
    r.start()
  })
}

export function stopListening() {
  if (native) SpeechRecognition.stop().catch(() => {})
  else activeWeb?.stop()
}
