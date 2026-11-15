import { useEffect, useState } from 'react'
import { resetProgress, updateSettings, useProgress, type Settings } from '../lib/progress'
import { hasNaturalVoice, speak, voiceName, type Accent, type Gender } from '../lib/speech'
import { MIC_TEST, VOICE_PREVIEW } from '../lib/speech-texts'
import type { Nav } from '../App'
import { Btn, cx, Header, MicCheck } from '../ui'

declare const __APP_VERSION__: string

export function SettingsScreen({ nav }: { nav: Nav }) {
  const { settings: s } = useProgress()
  const [confirm, setConfirm] = useState(false)
  const [micTest, setMicTest] = useState(false)
  const set = (patch: Partial<Settings>) => updateSettings(patch)
  const [voice, setVoice] = useState<string | null | undefined>(undefined)
  useEffect(() => { setVoice(undefined); const t = setTimeout(() => voiceName(s.accent).then(n => setVoice(n ?? null))); return () => clearTimeout(t) }, [s.accent, s.gender])

  return (
    <div className="pb-10">
      <Header title="Settings" sub="સેટિંગ્સ" onBack={nav.back} />
      <div className="space-y-4 px-4">
        <Group title="Voice · અવાજ">
          <Choice<Gender> label="Voice" gu="સ્ત્રી કે પુરુષ અવાજ" value={s.gender} cols={2}
            options={[['female', '👩 Female'], ['male', '👨 Male']]}
            onChange={gender => { set({ gender }); setTimeout(() => speak(VOICE_PREVIEW), 50) }} />
          {hasNaturalVoice() && (
            <Toggle label="Natural voice (recommended)" gu="માણસ જેવો કુદરતી અવાજ. બંધ કરો તો ફોનનો અવાજ વપરાશે." on={s.natural}
              onChange={natural => { set({ natural }); setTimeout(() => speak(VOICE_PREVIEW), 50) }} />
          )}
          {!(hasNaturalVoice() && s.natural) && (
            <Choice<Accent> label="Phone voice accent" gu="ફોનના અવાજનો ઉચ્ચાર" value={s.accent}
              options={[['en-US', 'American'], ['en-GB', 'British'], ['en-IN', 'Indian']]}
              onChange={accent => { set({ accent }); setTimeout(() => speak(VOICE_PREVIEW), 50) }} />
          )}
          {!(hasNaturalVoice() && s.natural) && voice !== undefined && (
            <p className={cx('px-4 pb-3 text-sm', voice ? 'text-muted' : 'text-bad')}>
              {voice
                ? <>🔈 Voice: {voice}</>
                : <>આ ઉચ્ચારનો અવાજ ફોનમાં નથી. Phone Settings → Text-to-speech → Google → Install voice data માંથી English (UK / India) ડાઉનલોડ કરો.</>}
            </p>
          )}
          <Choice<number> label="Speed" gu="ઝડપ" value={s.speed}
            options={[[0.7, 'Slow'], [1, 'Normal'], [1.3, 'Fast']]}
            onChange={speed => { set({ speed }); setTimeout(() => speak(VOICE_PREVIEW), 50) }} />
          <Toggle label="Play phrases automatically" gu="વાક્ય આપમેળે બોલાય" on={s.autoPlay} onChange={autoPlay => set({ autoPlay })} />
        </Group>

        <Group title="Look · દેખાવ">
          <Toggle label="Dark theme" gu="ઘાટા રંગો (રાત્રે આંખ માટે આરામદાયક)" on={s.dark} onChange={dark => set({ dark })} />
        </Group>

        <Group title="Help · મદદ">
          <Toggle label="Pronunciation in Gujarati" gu="ઉચ્ચાર ગુજરાતી લિપિમાં બતાવો (Beginner)" on={s.showSay} onChange={showSay => set({ showSay })} />
          <Toggle label="Gujarati in conversations" gu="વાતચીતમાં ગુજરાતી અર્થ બતાવો" on={s.showGu} onChange={showGu => set({ showGu })} />
        </Group>

        <Group title="Goal · ધ્યેય">
          <Choice<number> label="Daily goal" gu="રોજનો ધ્યેય (XP)" value={s.dailyGoal}
            options={[[30, '30'], [50, '50'], [100, '100']]} onChange={dailyGoal => set({ dailyGoal })} />
          <Toggle label="Unlock all levels" gu="બધા લેવલ ખોલો (જો તમે પહેલેથી થોડું જાણતા હો)" on={s.unlockAll} onChange={unlockAll => set({ unlockAll })} />
        </Group>

        <Group title="Microphone test · માઇક તપાસો">
          {micTest
            ? <div className="p-4"><p className="mb-3 text-center text-lg font-bold">Say: “{MIC_TEST}”</p><MicCheck target={MIC_TEST} /></div>
            : <div className="p-3"><Btn kind="soft" className="w-full" onClick={() => setMicTest(true)}>🎤 Test my microphone</Btn></div>}
        </Group>

        <Group title="Progress · પ્રગતિ">
          <div className="p-3">
            {confirm
              ? <div className="space-y-2">
                  <p className="text-center font-bold text-bad">બધી પ્રગતિ ભૂંસાઈ જશે. ખાતરી છે?</p>
                  <div className="flex gap-2">
                    <Btn kind="soft" className="flex-1" onClick={() => setConfirm(false)}>Cancel</Btn>
                    <Btn kind="bad" className="flex-1" onClick={() => { resetProgress(); setConfirm(false) }}>Reset</Btn>
                  </div>
                </div>
              : <Btn kind="soft" className="w-full text-bad" onClick={() => setConfirm(true)}>Reset all progress</Btn>}
          </div>
        </Group>

        <p className="pt-2 text-center text-sm text-muted">English Teacher v{__APP_VERSION__}<br />તમારી પ્રગતિ ફક્ત આ ફોનમાં સાચવાય છે.</p>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="px-1 pb-1.5 text-sm font-extrabold text-muted">{title}</h2>
      <div className="divide-y divide-line overflow-hidden rounded-3xl bg-card shadow-sm">{children}</div>
    </section>
  )
}

function Toggle({ label, gu, on, onChange }: { label: string; gu: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center gap-3 p-4 text-left">
      <div className="min-w-0 flex-1"><p className="font-bold leading-tight">{label}</p><p className="text-sm leading-snug text-muted">{gu}</p></div>
      <span className={cx('relative h-7 w-12 shrink-0 rounded-full transition', on ? 'bg-accent' : 'bg-line')}>
        <span className={cx('absolute top-1 size-5 rounded-full bg-white shadow transition-all', on ? 'left-6' : 'left-1')} />
      </span>
    </button>
  )
}

function Choice<T extends string | number>({ label, gu, value, options, onChange, cols = 3 }: {
  label: string; gu: string; value: T; options: [T, string][]; onChange: (v: T) => void; cols?: number
}) {
  return (
    <div className="p-4">
      <p className="font-bold leading-tight">{label}</p>
      <p className="mb-2 text-sm text-muted">{gu}</p>
      <div className={cx('grid gap-1 rounded-2xl bg-soft p-1', cols === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {options.map(([v, name]) => (
          <button key={String(v)} onClick={() => onChange(v)}
            className={cx('rounded-xl py-2 text-sm font-bold', v === value ? 'bg-card shadow-sm' : 'text-muted')}>{name}</button>
        ))}
      </div>
    </div>
  )
}
