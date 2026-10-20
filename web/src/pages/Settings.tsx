import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Cloud, CloudOff, Copy, Moon, RefreshCw, RotateCcw, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, TextInput, Chips } from '@/components/app/fields'
import { SectionTitle } from '@/components/app/common'
import { useData } from '@/lib/store'
import { useModal } from '@/app/modal'
import { SY } from '@/engine/sync.js'
import { toast, fallbackCopy } from '@/engine/engine.js'
import { backupText, saveBiz, setLetterheadBW } from '@/engine/actions.js'
import { useSyncState } from '@/lib/sync'

const ACCENTS: [string, string, string][] = [['indigo', 'Indigo', '#33439e'], ['teal', 'Teal', '#0e7490'], ['green', 'Green', '#0f7a5f'], ['purple', 'Purple', '#6d3fd1'], ['rose', 'Rose', '#c0305a'], ['black', 'Black', '#1c2230']]

export default function Settings() {
  const { biz } = useData()
  const { open } = useModal()
  const { theme, setTheme } = useTheme()
  const [style, setStyle] = useState(document.documentElement.dataset.style || 'calm')
  const [accent, setAccent] = useState(document.documentElement.dataset.accent || 'indigo')
  const [b, setB] = useState({ name: biz.name, phone: biz.phone || '', addr: biz.addr || '' })

  const copyBackup = () => {
    const txt = backupText()
    navigator.clipboard.writeText(txt).then(() => toast('Backup copied. Paste it somewhere safe.'), () => fallbackCopy(txt))
  }
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl p-5">
        <SectionTitle>Business details</SectionTitle>
        <p className="-mt-2 text-sm text-muted-foreground">Shown at the top of every voucher and statement.</p>
        <Field label="Business name"><TextInput value={b.name} onChange={(v) => setB({ ...b, name: v })} /></Field>
        <Field label="Phone number"><TextInput value={b.phone} onChange={(v) => setB({ ...b, phone: v })} inputMode="tel" placeholder="+91 98XXX XXXXX" /></Field>
        <Field label="Address"><TextInput value={b.addr} onChange={(v) => setB({ ...b, addr: v })} placeholder="Office address, city, state" /></Field>
        <Button className="mt-5 h-11 rounded-xl px-6 font-bold" onClick={() => saveBiz(b)}>Save details</Button>
      </Card>

      <SyncCard />

      <Card className="rounded-3xl p-5">
        <SectionTitle>Backup</SectionTitle>
        <p className="-mt-2 text-sm leading-relaxed text-muted-foreground">Your data is saved on this device, and online if Sync is on. Copy a backup now and then and keep it in WhatsApp notes or email. Restoring a backup replaces everything, on synced devices too.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="rounded-xl" onClick={copyBackup}><Copy className="size-4" /> Copy backup</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => open('restore')}><RotateCcw className="size-4" /> Restore from backup</Button>
        </div>
      </Card>

      <Card className="rounded-3xl p-5">
        <SectionTitle>Look</SectionTitle>
        <div className="text-sm font-semibold text-muted-foreground">Letterhead for client receipts</div>
        <Chips className="mt-2" options={[{ value: 'c', label: 'Colour' }, { value: 'b', label: 'Black and white' }]} value={biz.lhBW ? 'b' : 'c'} onChange={(v) => setLetterheadBW(v === 'b')} />
        <div className="mt-5 text-sm font-semibold text-muted-foreground">Style</div>
        <Chips className="mt-2" options={[{ value: 'calm', label: 'Calm' }, { value: 'vivid', label: 'Vivid (colourful)' }, { value: 'mandir', label: 'Mandir (gold)' }, { value: 'clean', label: 'Clean' }]} value={style} onChange={(v) => { document.documentElement.dataset.style = v; try { localStorage.setItem('bt-style', v) } catch { /* private mode */ } setStyle(v) }} />
        <div className="mt-5 text-sm font-semibold text-muted-foreground">Accent colour</div>
        <div className="mt-2 flex flex-wrap gap-3" role="group" aria-label="Accent colour">
          {ACCENTS.map(([k, label, col]) => (
            <button key={k} type="button" aria-label={label} aria-pressed={accent === k} title={label} onClick={() => { if (k === 'indigo') delete document.documentElement.dataset.accent; else document.documentElement.dataset.accent = k; try { localStorage.setItem('bt-accent', k === 'indigo' ? '' : k) } catch { /* private mode */ } setAccent(k) }}
              className={'grid size-10 place-items-center rounded-full ring-offset-2 ring-offset-card transition ' + (accent === k ? 'ring-2 ring-foreground' : 'hover:scale-105')} style={{ background: col }}>
              {accent === k ? <span className="size-2 rounded-full bg-white" /> : null}
            </button>
          ))}
        </div>
        <div className="mt-5 text-sm font-semibold text-muted-foreground">Theme</div>
        <Chips className="mt-2" options={[{ value: 'light', label: <span className="flex items-center gap-1.5"><Sun className="size-4" /> Light</span> }, { value: 'dark', label: <span className="flex items-center gap-1.5"><Moon className="size-4" /> Dark</span> }]} value={theme === 'dark' ? 'dark' : 'light'} onChange={(v) => setTheme(v)} />
      </Card>
      <p className="text-center text-xs text-muted-foreground lg:col-span-2">App version: {__BUILD_ID__}</p>
    </div>
  )
}

function SyncCard() {
  const s = useSyncState()
  const [key, setKey] = useState(s.cfg?.key || '')
  const [pid, setPid] = useState(s.cfg?.pid || '')
  const [mail, setMail] = useState(s.mail || '')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const go = (create: boolean) => {
    if (!key.trim() || !pid.trim() || !mail.trim() || !pw) return setMsg('Fill in all four boxes.')
    setMsg('')
    setBusy(true)
    SY.signIn(create, key.trim(), pid.trim(), mail.trim(), pw).catch((e: Error) => setMsg(e.message)).finally(() => setBusy(false))
  }
  const last = s.last ? new Date(s.last).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  if (s.on) {
    return (
      <Card className="rounded-3xl p-5">
        <SectionTitle right={<Cloud className="size-5 text-income" />}>Sync between phone and PC</SectionTitle>
        <p className="-mt-2 text-sm leading-relaxed text-muted-foreground">Signed in as <b className="text-foreground">{s.email}</b>. Your projects, people, payments and proposals are kept the same on every device that signs in with this account.</p>
        <div className={'mt-3 text-sm font-semibold ' + (s.err ? 'text-expense' : 'text-muted-foreground')}>{s.busy ? 'Syncing…' : s.err ? s.err : last ? 'Last synced ' + last : 'Not synced yet'}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="rounded-xl" onClick={() => SY.run()}><RefreshCw className={'size-4 ' + (s.busy ? 'animate-spin' : '')} /> Sync now</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => SY.signOut()}><CloudOff className="size-4" /> Sign out</Button>
        </div>
      </Card>
    )
  }
  return (
    <Card className="rounded-3xl p-5">
      <SectionTitle right={<CloudOff className="size-5 text-muted-foreground" />}>Sync between phone and PC</SectionTitle>
      <p className="-mt-2 text-sm leading-relaxed text-muted-foreground">Sign in on the phone and on the PC with the same email and password. Both stay up to date, and the data is also stored safely online.</p>
      <Field label="Firebase API key"><TextInput value={key} onChange={setKey} autoCapitalize="off" spellCheck={false} /></Field>
      <Field label="Firebase project ID"><TextInput value={pid} onChange={setPid} autoCapitalize="off" spellCheck={false} /></Field>
      <Field label="Email"><TextInput value={mail} onChange={setMail} type="email" autoComplete="username" autoCapitalize="off" /></Field>
      <Field label="Password"><TextInput value={pw} onChange={setPw} type="password" autoComplete="current-password" /></Field>
      <div className="mt-3 min-h-5 text-sm font-semibold text-expense">{msg}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button className="rounded-xl" disabled={busy} onClick={() => go(false)}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <Button variant="outline" className="rounded-xl" disabled={busy} onClick={() => go(true)}>Create account</Button>
      </div>
    </Card>
  )
}
