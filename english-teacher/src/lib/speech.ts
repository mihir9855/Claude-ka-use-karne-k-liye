// Listening (text-to-speech) and speaking (speech recognition).
// In the APK we use Android's own engines through Capacitor plugins; in a browser we use the Web Speech API.
import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { voiceKey } from './voicekey'

export type Accent = 'en-US' | 'en-GB' | 'en-IN'

const native = Capacitor.isNativePlatform()
const opts = { accent: 'en-US' as Accent, speed: 1, natural: true }

export function configureSpeech(accent: Accent, speed: number, natural: boolean) {
  opts.accent = accent
  opts.speed = speed
  opts.natural = natural
}

// Natural voice: clips recorded with a neural voice by the GitHub build (scripts/make-voices.py),
// built into the app. Sentences without a clip use the phone's own voice.
const CLIPS: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob('../../voice/af_heart/*.ogg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)
    .map(([path, url]) => [path.split('/').pop()!.replace('.ogg', ''), url]),
)
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

let webVoice: SpeechSynthesisVoice | undefined
function pickWebVoice() {
  if (typeof speechSynthesis === 'undefined') return undefined
  const voices = speechSynthesis.getVoices()
  const want = opts.accent.toLowerCase()
  webVoice =
    voices.find(v => v.lang.toLowerCase().replace('_', '-') === want && /google/i.test(v.name)) ||
    voices.find(v => v.lang.toLowerCase().replace('_', '-') === want) ||
    voices.find(v => v.lang.toLowerCase().startsWith('en'))
  return webVoice
}
if (typeof speechSynthesis !== 'undefined') speechSynthesis.onvoiceschanged = () => { webVoice = undefined }

let speakToken = 0

/** Reads `text` aloud. Resolves when it finishes (or is stopped). */
export async function speak(text: string, slow = false): Promise<void> {
  const token = ++speakToken
  clip?.pause()
  const url = opts.natural ? CLIPS[voiceKey(text)] : undefined
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
      await TextToSpeech.speak({ text, lang: opts.accent, rate, pitch: 1, volume: 1, category: 'playback' })
    } catch (e) {
      console.warn('TTS failed', e)
    }
    return
  }
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  await new Promise<void>(resolve => {
    const u = new SpeechSynthesisUtterance(text)
    const voice = webVoice || pickWebVoice()
    if (voice) u.voice = voice
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
