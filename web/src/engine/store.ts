import { useSyncExternalStore } from 'react'
import { addFill, addVehicle, deleteFill, defaultVehicles, parseBackup, removeVehicle, seed, updateVehicle } from './engine'
import type { DB, Draft, Vehicle, VehicleId } from './engine'

const KEY = 'mileage-log-v1'
const subs = new Set<() => void>()

function load(): DB {
  try {
    const s = localStorage.getItem(KEY)
    if (s) {
      const d = parseBackup(s)
      if (d) return d
    }
  } catch {
    /* storage blocked: start with sample data */
  }
  return seed()
}

let db: DB = load()

function commit(next: DB) {
  db = next
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* ignore */
  }
  subs.forEach((f) => f())
}

export const useDB = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => {
        subs.delete(cb)
      }
    },
    () => db,
  )

export const actions = {
  add: (d: Draft) => commit({ ...addFill(db, d), sample: false }),
  remove: (id: string) => commit(deleteFill(db, id)),
  vehicle: (id: VehicleId, patch: Partial<Vehicle>) => commit(updateVehicle(db, id, patch)),
  addVehicle: (name: string, fuel: string, startOdo: number) => {
    const r = addVehicle(db, name, fuel, startOdo)
    commit(r.db)
    return r.id
  },
  removeVehicle: (id: VehicleId) => commit(removeVehicle(db, id)),
  clearSample: () => commit({ version: 1, sample: false, vehicles: db.vehicles, fills: [] }),
  restore: (text: string) => {
    const d = parseBackup(text)
    if (d) commit(d)
    return !!d
  },
  reset: () => commit({ version: 1, sample: false, vehicles: defaultVehicles(), fills: [] }),
  exportText: () => JSON.stringify(db, null, 2),
}
