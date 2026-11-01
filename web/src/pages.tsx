import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Moon, Sun } from 'lucide-react'
import { rows, summary, vehicleOf } from './engine/engine'
import type { DB, VehicleId } from './engine/engine'
import { actions } from './engine/store'
import { Card, Count, FillRow, Spend, Trend } from './components/parts'
import { cn, getTheme, saveTextFile, setTheme } from './lib/utils'

const Chip = ({ label, value, sub }: { label: string; value: string; sub: string }) => (
  <div className="flex min-w-0 flex-col gap-1 rounded-2xl border border-line bg-card p-3">
    <span className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">{label}</span>
    <span className="truncate font-display text-[26px] font-semibold leading-none tnum">{value}</span>
    <span className="truncate text-[11.5px] text-muted">{sub}</span>
  </div>
)

export function Home({ db, v, go }: { db: DB; v: VehicleId; go: () => void }) {
  const veh = vehicleOf(db, v)
  const rs = rows(db, v)
  const s = summary(rs, veh)
  const delta = s.last && s.prev ? (s.last.avg as number) - (s.prev.avg as number) : null
  return (
    <div className="flex flex-col gap-4">
      {db.sample && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-4 py-3 text-sm">
          <span>These are sample fill-ups so you can see how it looks.</span>
          <button type="button" onClick={() => { actions.clearSample(); toast.success('Sample data cleared') }} className="shrink-0 font-semibold text-accent">Clear</button>
        </div>
      )}
      <section className="flex flex-col gap-1.5 rounded-[28px] p-5 text-white" style={{ background: 'var(--hero)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-[.1em] opacity-80">Overall average</span>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[84px] font-bold leading-[.9] tnum">{s.overall !== null ? <Count value={s.overall} /> : '–'}</span>
          <span className="font-display text-2xl font-semibold opacity-90">{veh.avgUnit}</span>
        </div>
        <span className="text-[13px] opacity-90">
          {s.last ? `Last fill-up ${(s.last.avg as number).toFixed(1)} ${veh.avgUnit}` : 'Add two full-tank fill-ups to get an average'}
          {delta !== null && ` · ${delta >= 0 ? 'up' : 'down'} ${Math.abs(delta).toFixed(1)}`}
        </span>
        <span className="text-[13px] opacity-80">{veh.name} · {veh.fuel} · {s.fillCount} fill-ups</span>
      </section>
      <div className="grid grid-cols-3 gap-2">
        <Chip label="Best" value={s.best !== null ? s.best.toFixed(1) : '–'} sub={veh.avgUnit} />
        <Chip label="Cost / km" value={s.costPerKm !== null ? '₹' + s.costPerKm.toFixed(2) : '–'} sub="all fill-ups" />
        <Chip label="Driven" value={String(s.totalKm)} sub="km in total" />
      </div>
      <div className="grid gap-4 desk:grid-cols-2">
        <Card title="Average per fill-up" hint="dashed = overall"><Trend rs={rs} mean={s.overall} unit={veh.avgUnit} /></Card>
        <Card title="Spent per month"><Spend rs={rs} /></Card>
      </div>
      <Card title="Recent fill-ups" hint={`${veh.avgUnit} · cost`}>
        {rs.length ? [...rs].reverse().slice(0, 3).map((r) => <FillRow key={r.id} r={r} unit={veh.unit} />) : <p className="py-4 text-center text-sm text-muted">No fill-ups yet. Tap + to add the first one.</p>}
        {rs.length > 3 && <button type="button" onClick={go} className="mt-1 w-full py-2 text-sm font-semibold text-accent">See all</button>}
      </Card>
    </div>
  )
}

export function History({ db, v }: { db: DB; v: VehicleId }) {
  const veh = vehicleOf(db, v)
  const rs = [...rows(db, v)].reverse()
  const [ask, setAsk] = useState<string | null>(null)
  return (
    <Card title="All fill-ups" hint={veh.name}>
      {rs.length ? rs.map((r) => (
        <FillRow key={r.id} r={r} unit={veh.unit} confirming={ask === r.id} onDelete={() => {
          if (ask === r.id) { actions.remove(r.id); setAsk(null); toast.success('Fill-up deleted') } else setAsk(r.id)
        }} />
      )) : <p className="py-6 text-center text-sm text-muted">No fill-ups yet.</p>}
    </Card>
  )
}

const field = 'w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-base outline-none focus:border-accent'

export function Settings({ db }: { db: DB }) {
  const [dark, setDark] = useState(getTheme() === 'dark')
  const [paste, setPaste] = useState('')
  const [wipe, setWipe] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const backup = async () => {
    try {
      const where = await saveTextFile(`mileage-backup-${new Date().toISOString().slice(0, 10)}.json`, actions.exportText())
      toast.success(`Backup saved (${where})`)
    } catch (e) {
      toast.error('Could not save the backup: ' + String(e))
    }
  }
  const restore = (text: string) => (actions.restore(text) ? toast.success('Backup restored') : toast.error('That is not a Mileage Log backup'))

  return (
    <div className="flex flex-col gap-4">
      <Card title="Vehicles">
        <div className="flex flex-col gap-4">
          {db.vehicles.map((x) => (
            <div key={x.id} className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Name</span>
                <input id={`n-${x.id}`} className={field} value={x.name} onChange={(e) => actions.vehicle(x.id, { name: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[.09em] text-muted">Starting km</span>
                <input id={`o-${x.id}`} className={field} type="number" inputMode="numeric" value={x.startOdo} onChange={(e) => actions.vehicle(x.id, { startOdo: +e.target.value })} />
              </label>
            </div>
          ))}
          <p className="text-xs text-muted">Starting km is the odometer reading when you first filled a full tank.</p>
        </div>
      </Card>

      <Card title="Appearance">
        <button type="button" onClick={() => { const t = dark ? 'light' : 'dark'; setTheme(t); setDark(!dark) }} className="flex w-full items-center justify-between rounded-xl bg-soft px-4 py-3 font-semibold">
          {dark ? 'Dark theme' : 'Light theme'}
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </Card>

      <Card title="Backup">
        <div className="flex flex-col gap-3">
          <button type="button" onClick={backup} className="rounded-xl bg-accent py-3 font-semibold text-white">Download backup</button>
          <input ref={file} type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) restore(await f.text()); e.target.value = '' }} />
          <button type="button" onClick={() => file.current?.click()} className="rounded-xl border border-line py-3 font-semibold">Restore from file</button>
          <textarea id="paste" className={cn(field, 'h-20 resize-none text-sm')} placeholder="Or paste backup text here" value={paste} onChange={(e) => setPaste(e.target.value)} />
          {paste.trim() && <button type="button" onClick={() => { restore(paste); setPaste('') }} className="rounded-xl border border-line py-3 font-semibold">Restore pasted text</button>}
          <button type="button" onClick={() => { if (wipe) { actions.reset(); setWipe(false); toast.success('All data erased') } else setWipe(true) }} className={cn('py-2 text-sm', wipe ? 'font-semibold text-bad' : 'text-muted')}>
            {wipe ? 'Tap again to erase everything' : 'Erase all data'}
          </button>
        </div>
      </Card>

      <p className="pb-2 text-center text-xs text-muted tnum">App version: v{__APP_VERSION__} · {__BUILD_ID__}</p>
    </div>
  )
}
