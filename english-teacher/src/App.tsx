import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect, useRef, useState } from 'react'
import { getProgress, useProgress } from './lib/progress'
import { configureSpeech, stopListening, stopSpeaking } from './lib/speech'
import { Home, LevelScreen } from './screens/Home'
import { LearnScreen, LessonScreen, TalkScreen, TipScreen } from './screens/Lesson'
import { PracticeScreen } from './screens/Practice'
import { SettingsScreen } from './screens/Settings'

export type Route =
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'level'; id: string }
  | { name: 'lesson' | 'learn' | 'tip' | 'talk' | 'practice'; id: string }

export type Nav = { push: (r: Route) => void; replace: (r: Route) => void; back: () => void }

export default function App() {
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }])
  const stackRef = useRef(stack)
  stackRef.current = stack
  const { settings } = useProgress()

  useEffect(() => { document.documentElement.classList.toggle('dark', settings.dark) }, [settings.dark])
  useEffect(() => { configureSpeech(settings.accent, settings.speed, settings.natural) }, [settings.accent, settings.speed, settings.natural])

  const nav: Nav = {
    push: r => setStack(s => [...s, r]),
    replace: r => setStack(s => [...s.slice(0, -1), r]),
    back: () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)),
  }

  // Stop any voice and scroll to top when the screen changes.
  useEffect(() => { stopSpeaking(); stopListening(); window.scrollTo(0, 0) }, [stack.length, stack[stack.length - 1]])

  // Android back button: go back one screen, or leave the app from Home.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const h = CapApp.addListener('backButton', () => {
      if (stackRef.current.length > 1) setStack(s => s.slice(0, -1))
      else CapApp.exitApp()
    })
    return () => { h.then(x => x.remove()) }
  }, [])

  const r = stack[stack.length - 1]
  switch (r.name) {
    case 'home': return <Home nav={nav} />
    case 'settings': return <SettingsScreen nav={nav} />
    case 'level': return <LevelScreen nav={nav} id={r.id} />
    case 'lesson': return <LessonScreen nav={nav} id={r.id} />
    case 'learn': return <LearnScreen nav={nav} id={r.id} />
    case 'tip': return <TipScreen nav={nav} id={r.id} />
    case 'talk': return <TalkScreen nav={nav} id={r.id} />
    case 'practice': return <PracticeScreen nav={nav} id={r.id} />
  }
}

const { accent, speed, natural } = getProgress().settings
configureSpeech(accent, speed, natural)
document.documentElement.classList.toggle('dark', getProgress().settings.dark)
