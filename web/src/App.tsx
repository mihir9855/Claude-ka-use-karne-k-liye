import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Toaster } from 'sonner'
import { Gauge, ListOrdered, Plus, Settings as Cog } from 'lucide-react'
import type { VehicleId } from './engine/engine'
import { useDB } from './engine/store'
import { VehicleSwitch } from './components/parts'
import { AddSheet } from './components/AddSheet'
import { History, Home, Settings } from './pages'
import { cn } from './lib/utils'

type Tab = 'home' | 'log' | 'settings'
const tabs: { id: Tab; label: string; Icon: typeof Gauge }[] = [
  { id: 'home', label: 'Home', Icon: Gauge },
  { id: 'log', label: 'History', Icon: ListOrdered },
  { id: 'settings', label: 'Settings', Icon: Cog },
]

export default function App() {
  const db = useDB()
  const [v, setV] = useState<VehicleId>('car')
  const [tab, setTab] = useState<Tab>('home')
  const [adding, setAdding] = useState(false)

  const nav = (cls: string, item: string) =>
    tabs.map(({ id, label, Icon }) => (
      <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)} className={cn(item, tab === id ? 'text-accent font-semibold' : 'text-muted', cls)}>
        <Icon size={21} strokeWidth={1.9} />
        {label}
      </button>
    ))

  return (
    <div data-v={v} className="min-h-dvh bg-bg font-sans text-fg">
      <div className="mx-auto flex w-full max-w-[460px] px-[max(1rem,env(safe-area-inset-left))] desk:max-w-[1120px] desk:gap-8 desk:px-8">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-2 py-8 desk:flex">
          <h1 className="mb-4 font-display text-2xl font-semibold uppercase tracking-wider">Mileage Log</h1>
          {nav('flex-row gap-3 rounded-xl px-3 py-2.5 text-left text-[15px]', 'flex items-center')}
          <button type="button" onClick={() => setAdding(true)} className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 font-semibold text-white">
            <Plus size={18} /> Add fill-up
          </button>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))] desk:pb-10 desk:pt-8">
          <h1 className="font-display text-[22px] font-semibold uppercase tracking-wider desk:hidden">Mileage Log</h1>
          {tab !== 'settings' && <VehicleSwitch vehicles={db.vehicles} v={v} onChange={setV} />}
          <AnimatePresence mode="wait">
            <motion.div key={tab + (tab === 'settings' ? '' : v)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
              {tab === 'home' && <Home db={db} v={v} go={() => setTab('log')} />}
              {tab === 'log' && <History db={db} v={v} />}
              {tab === 'settings' && <Settings db={db} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] desk:hidden">
        <div className="mx-auto grid max-w-[460px] grid-cols-[1fr_auto_1fr_1fr] items-center gap-1 px-2 py-1.5">
          {nav('flex-col gap-0.5 rounded-xl py-1.5 text-[11.5px]', 'flex items-center').slice(0, 1)}
          <motion.button whileTap={{ scale: 0.92 }} type="button" aria-label="Add fill-up" onClick={() => setAdding(true)} className="-mt-7 grid size-[58px] place-items-center rounded-full bg-accent text-white shadow-[0_8px_20px_rgba(0,0,0,.28)]">
            <Plus size={28} />
          </motion.button>
          {nav('flex-col gap-0.5 rounded-xl py-1.5 text-[11.5px]', 'flex items-center').slice(1)}
        </div>
      </nav>

      <AnimatePresence>{adding && <AddSheet db={db} v={v} onClose={() => setAdding(false)} />}</AnimatePresence>
      <Toaster position="top-center" offset={16} />
    </div>
  )
}
