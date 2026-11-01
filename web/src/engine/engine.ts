// All mileage logic lives here. Screens only call these functions.
export type VehicleId = string

export interface Vehicle {
  id: VehicleId
  name: string
  hue: number // 0-5, picks the vehicle's colour
  fuel: string
  unit: string
  avgUnit: string
  startOdo: number
  lo: number // lowest believable average, used to catch typing mistakes
  hi: number // highest believable average
}

export interface Fill {
  id: string
  v: VehicleId
  date: string
  odo: number
  qty: number
  price: number
  full: boolean // tank filled to the top
  ts: number
}

export interface DB {
  version: 1
  sample: boolean
  vehicles: Vehicle[]
  fills: Fill[]
}

export interface Row extends Fill {
  km: number // km since the previous fill
  avg: number | null // only set on full-tank fills
  cost: number
  spanKm: number // km covered since the previous full tank
  spanQty: number
  spanCost: number
}

export interface Summary {
  overall: number | null
  last: Row | null
  prev: Row | null
  best: number | null
  worst: number | null
  costPerKm: number | null
  totalKm: number
  spent: number
  fillCount: number
}

export const defaultVehicles = (): Vehicle[] => [
  { id: 'car', name: 'My Car', hue: 0, fuel: 'CNG', unit: 'kg', avgUnit: 'km/kg', startOdo: 0, lo: 8, hi: 50 },
  { id: 'bike', name: 'Royal Enfield', hue: 1, fuel: 'Petrol', unit: 'L', avgUnit: 'km/L', startOdo: 0, lo: 10, hi: 70 },
]

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)

export const vehicleOf = (db: DB, id: VehicleId) => db.vehicles.find((v) => v.id === id) ?? db.vehicles[0]

export function rows(db: DB, id: VehicleId, extra?: Fill): Row[] {
  const veh = vehicleOf(db, id)
  const list = db.fills.filter((f) => f.v === id).concat(extra ? [extra] : []).sort((a, b) => a.odo - b.odo)
  // Starting km 0 means "not set yet": the first fill-up becomes the starting point and has no average.
  const base = veh.startOdo === 0 && list.length ? list[0].odo : veh.startOdo
  let prevOdo = base
  let fullOdo = base
  let accQ = 0
  let accC = 0
  return list.map((f) => {
    const cost = f.qty * f.price
    accQ += f.qty
    accC += cost
    const km = f.odo - prevOdo
    prevOdo = f.odo
    if (!f.full) return { ...f, km, cost, avg: null, spanKm: 0, spanQty: 0, spanCost: 0 }
    const spanKm = f.odo - fullOdo
    const row: Row = { ...f, km, cost, avg: accQ > 0 && spanKm > 0 ? spanKm / accQ : null, spanKm, spanQty: accQ, spanCost: accC }
    fullOdo = f.odo
    accQ = 0
    accC = 0
    return row
  })
}

export function summary(rs: Row[], veh: Vehicle): Summary {
  const fulls = rs.filter((r) => r.avg !== null)
  const sk = fulls.reduce((a, r) => a + r.spanKm, 0)
  const sq = fulls.reduce((a, r) => a + r.spanQty, 0)
  const sc = fulls.reduce((a, r) => a + r.spanCost, 0)
  const avgs = fulls.map((r) => r.avg as number)
  const lastOdo = rs.length ? rs[rs.length - 1].odo : veh.startOdo
  return {
    overall: sq > 0 ? sk / sq : null,
    last: fulls.length ? fulls[fulls.length - 1] : null,
    prev: fulls.length > 1 ? fulls[fulls.length - 2] : null,
    best: avgs.length ? Math.max(...avgs) : null,
    worst: avgs.length ? Math.min(...avgs) : null,
    costPerKm: sk > 0 ? sc / sk : null,
    totalKm: lastOdo - (veh.startOdo === 0 && rs.length ? rs[0].odo : veh.startOdo),
    spent: rs.reduce((a, r) => a + r.cost, 0),
    fillCount: rs.length,
  }
}

export const lastOdoOf = (db: DB, id: VehicleId) => {
  const rs = rows(db, id)
  return rs.length ? rs[rs.length - 1].odo : vehicleOf(db, id).startOdo
}

export interface Draft {
  v: VehicleId
  date: string
  odo: number
  qty: number
  price: number
  full: boolean
}

const toFill = (d: Draft): Fill => ({ id: 'preview', ts: 0, ...d })

/** The row this draft would become. Pass editId when changing an existing fill-up. */
export function previewRow(db: DB, d: Draft, editId?: string): Row | null {
  const base = editId ? { ...db, fills: db.fills.filter((f) => f.id !== editId) } : db
  if (!(d.odo > 0) || (!editId && !(d.odo > lastOdoOf(base, d.v)))) return null
  return rows(base, d.v, toFill(d)).find((x) => x.id === 'preview') ?? null
}

/** Average this draft would give, or null when it is a partial fill or the numbers are not usable yet. */
export function previewAvg(db: DB, d: Draft, editId?: string): number | null {
  if (!(d.qty > 0) || !d.full) return null
  return previewRow(db, d, editId)?.avg ?? null
}

/** Returns a message when the draft should not be saved. */
export function validate(db: DB, d: Draft, editId?: string): string | null {
  const veh = vehicleOf(db, d.v)
  if (editId) {
    // An edited fill-up must stay between its neighbours.
    const list = db.fills.filter((f) => f.v === d.v).sort((a, b) => a.odo - b.odo)
    const i = list.findIndex((f) => f.id === editId)
    const prev = i > 0 ? list[i - 1].odo : veh.startOdo > 0 ? veh.startOdo : null
    const next = i >= 0 && i < list.length - 1 ? list[i + 1].odo : null
    if (prev !== null && !(d.odo > prev)) return `Odometer must be higher than ${prev} km`
    if (next !== null && !(d.odo < next)) return `Odometer must be lower than ${next} km`
    if (!(d.odo > 0)) return 'Enter the odometer reading'
  } else {
    const last = lastOdoOf(db, d.v)
    if (!(d.odo > last)) return `Odometer must be higher than ${last} km`
  }
  if (!(d.qty > 0)) return `Enter how many ${veh.unit} you filled`
  if (d.price < 0) return 'Price cannot be negative'
  const a = previewAvg(db, d, editId)
  if (a !== null && (a < veh.lo || a > veh.hi)) {
    return `${a.toFixed(1)} ${veh.avgUnit} does not look right. Check the odometer and the ${veh.unit}.`
  }
  return null
}

export function addFill(db: DB, d: Draft): DB {
  return { ...db, fills: [...db.fills, { id: newId(), ts: Date.now(), ...d }] }
}

export const updateFill = (db: DB, id: string, d: Draft): DB => ({ ...db, fills: db.fills.map((f) => (f.id === id ? { ...f, ...d } : f)) })

export const deleteFill =(db: DB, id: string): DB => ({ ...db, fills: db.fills.filter((f) => f.id !== id) })

export const updateVehicle = (db: DB, id: VehicleId, patch: Partial<Vehicle>): DB => ({
  ...db,
  vehicles: db.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
})

/** Fuel types you can pick when adding a vehicle. lo/hi are the believable average range. */
export const FUELS: Record<string, { unit: string; avgUnit: string; lo: number; hi: number }> = {
  Petrol: { unit: 'L', avgUnit: 'km/L', lo: 8, hi: 70 },
  Diesel: { unit: 'L', avgUnit: 'km/L', lo: 6, hi: 45 },
  CNG: { unit: 'kg', avgUnit: 'km/kg', lo: 8, hi: 50 },
  Electric: { unit: 'kWh', avgUnit: 'km/kWh', lo: 2, hi: 20 },
}

export function addVehicle(db: DB, name: string, fuel: string, startOdo: number): { db: DB; id: VehicleId } {
  const f = FUELS[fuel] ?? FUELS.Petrol
  const used = db.vehicles.map((v) => v.hue)
  const hue = [0, 1, 2, 3, 4, 5].find((h) => !used.includes(h)) ?? db.vehicles.length % 6
  const id = 'v-' + newId().slice(0, 8)
  return { id, db: { ...db, vehicles: [...db.vehicles, { id, name: name.trim() || 'My Vehicle', hue, fuel, startOdo, ...f }] } }
}

export const removeVehicle = (db: DB, id: VehicleId): DB =>
  db.vehicles.length < 2 ? db : { ...db, vehicles: db.vehicles.filter((v) => v.id !== id), fills: db.fills.filter((f) => f.v !== id) }

export function monthlySpend(rs: Row[]) {
  const m = new Map<string, number>()
  rs.forEach((r) => m.set(r.date.slice(0, 7), (m.get(r.date.slice(0, 7)) ?? 0) + r.cost))
  return [...m.entries()].sort().map(([k, spend]) => ({ k, spend: Math.round(spend) }))
}

export function seed(): DB {
  return { version: 1, sample: false, vehicles: defaultVehicles(), fills: [] }
}

/** Accepts only data that looks like a backup of this app. */
export function parseBackup(text: string): DB | null {
  try {
    const d = JSON.parse(text)
    if (d && d.version === 1 && Array.isArray(d.vehicles) && Array.isArray(d.fills)) {
      const vehicles = (d.vehicles as Vehicle[]).map((v, i) => ({ ...v, hue: typeof v.hue === 'number' ? v.hue : i % 6 }))
      return { ...d, vehicles, sample: !!d.sample }
    }
  } catch {
    /* fall through */
  }
  return null
}
