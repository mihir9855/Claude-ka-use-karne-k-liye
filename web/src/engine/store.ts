import { useSyncExternalStore } from 'react'
import { addFill, addVehicle, deleteFill, defaultVehicles, parseBackup, removeVehicle, seed, updateFill, updateVehicle } from './engine'
import type { DB, Draft, Fill, Vehicle, VehicleId } from './engine'

export interface VehicleSnapshot {
  vehicle: Vehicle
  index: number
  fills: Fill[]
}

const KEY = 'mileage-log-v2' // v2: starts empty, no sample data
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
  edit: (id: string, d: Draft) => commit(updateFill(db, id, d)),
  /** Deletes a fill-up and returns it so the caller can offer Undo. */
  remove: (id: string): Fill | undefined => {
    const f = db.fills.find((x) => x.id === id)
    commit(deleteFill(db, id))
    return f
  },
  restoreFill: (f: Fill) => commit({ ...db, fills: db.fills.some((x) => x.id === f.id) ? db.fills : [...db.fills, f] }),
  vehicle: (id: VehicleId, patch: Partial<Vehicle>) => commit(updateVehicle(db, id, patch)),
  addVehicle: (name: string, fuel: string, startOdo: number) => {
    const r = addVehicle(db, name, fuel, startOdo)
    commit(r.db)
    return r.id
  },
  removeVehicle: (id: VehicleId): VehicleSnapshot => {
    const index = db.vehicles.findIndex((v) => v.id === id)
    const snap = { vehicle: db.vehicles[index], index, fills: db.fills.filter((f) => f.v === id) }
    commit(removeVehicle(db, id))
    return snap
  },
  restoreVehicle: (s: VehicleSnapshot) => {
    if (db.vehicles.some((v) => v.id === s.vehicle.id)) return
    const vehicles = [...db.vehicles]
    vehicles.splice(s.index, 0, s.vehicle)
    commit({ ...db, vehicles, fills: [...db.fills, ...s.fills] })
  },
  clearSample: () => commit({ version: 1, sample: false, vehicles: db.vehicles, fills: [] }),
  restore: (text: string) => {
    const d = parseBackup(text)
    if (d) commit(d)
    return !!d
  },
  reset: () => commit({ version: 1, sample: false, vehicles: defaultVehicles(), fills: [] }),
  exportText: () => JSON.stringify(db, null, 2),
}
