import { EXTRAS, LIBRARY, SAYS, type LibraryDish } from '../data/library';
import { allowed, conditionScore, type Condition, type Target } from './profile';

export type { Target };

/** b breakfast, m morning snack, l lunch, s evening snack, d dinner */
export type SlotId = 'b' | 'm' | 'l' | 's' | 'd';
export const SLOT_ORDER: SlotId[] = ['b', 'm', 'l', 's', 'd'];
export const SLOT_LABEL: Record<SlotId, string> = { b: 'Breakfast', m: 'Morning snack', l: 'Lunch', s: 'Evening snack', d: 'Dinner' };
/** When each meal is usually eaten, as an hour and minute, for the timeline of what comes next. */
export const SLOT_TIME: Record<SlotId, [number, number]> = { b: [8, 30], m: [11, 0], l: [13, 30], s: [17, 0], d: [20, 30] };

export interface Entry {
  id: string;
  date: string; // yyyy-mm-dd
  slot: SlotId;
  name: string;
  /** normalised name, the same for the same dish however it was typed */
  key: string;
  kcal: number | null;
  protein: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  /** how many were eaten, when the message said ("5 roti"); the numbers above already include it */
  qty?: number;
  /** whose diary this is; older entries have none and belong to the first person */
  pid?: string;
  /** true for the demo meals, so they can be cleared on their own */
  sample?: boolean;
  /** when it was logged (ms); older saved entries may not have it */
  at?: number;
  /** entries typed in one go share a batch, like one chat message */
  batch?: string;
}

/* ---------- dates ---------- */

export function ymd(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`;
}
export function daysAgo(n: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return ymd(d);
}
export function diffDays(a: string, b: string): number {
  return Math.round((new Date(`${a}T12:00:00`).getTime() - new Date(`${b}T12:00:00`).getTime()) / 864e5);
}
export function slotAt(hour: number): SlotId {
  return hour < 10 ? 'b' : hour < 12 ? 'm' : hour < 15 ? 'l' : hour < 18 ? 's' : 'd';
}

/** The moment a meal is usually eaten on a given day. */
export function slotMoment(date: string, slot: SlotId): Date {
  const [h, m] = SLOT_TIME[slot];
  const d = new Date(`${date}T12:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

/* ---------- matching typed names to the library ---------- */

export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const STOP = new Set(['with', 'and', 'of', 'the', 'a']);
const toks = (s: string) => norm(s).split(' ').filter((t) => t && !STOP.has(t));

const INDEX = [...LIBRARY, ...EXTRAS].map((d) => ({ d, n: norm(d[0]), t: toks(d[0]) }));
const BY_NAME = new Map(INDEX.map((it) => [it.d[0], it.d]));

/** Spellings people use that the library does not, and one-letter slips. */
const SPELL: Record<string, string> = { daal: 'dal', dhal: 'dal', sabzi: 'sabji', sabzee: 'sabji', chawal: 'rice', chapati: 'roti', chapatti: 'roti', rotis: 'roti' };
function sameWord(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  // one letter added, dropped or changed
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
}
const fixed = (t: string[]) => t.map((x) => SPELL[x] ?? x);

/** The library dish a typed name stands for, or null when nothing fits well enough. */
export function match(text: string): LibraryDish | null {
  const n = norm(text);
  if (!n) return null;
  const t = fixed(toks(text));
  if (t.length === 1) {
    const key = SAYS[t[0]] ? t[0] : Object.keys(SAYS).find((k) => sameWord(t[0], k));
    const hit = key ? BY_NAME.get(SAYS[key]) : undefined;
    if (hit) return hit;
  }
  let best: LibraryDish | null = null;
  let bs = 0;
  for (const it of INDEX) {
    if (it.n === n) return it.d;
    const common = t.filter((x) => it.t.some((y) => sameWord(x, y))).length;
    if (!common) continue;
    const score = common / (t.length + it.t.length - common);
    if (score > bs || (score === bs && best && it.n.length < norm(best[0]).length)) {
      bs = score;
      best = it.d;
    }
  }
  return bs >= 0.6 ? best : null;
}

/** Library names that start with, or contain, what is being typed. */
export function hints(text: string, limit = 6): string[] {
  const q = norm(text);
  if (q.length < 2) return [];
  return INDEX.filter((it) => it.n.includes(q) || it.t.some((t) => t.startsWith(q)))
    .slice(0, limit)
    .map((it) => it.d[0]);
}

let seq = 0;
const uid = () => `${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const newBatch = uid;

/** How many pieces the library serving holds: "Roti (2)" is 2, a bowl or plate is none. */
function piecesOf(name: string): number | null {
  const m = /\((\d+)\)/.exec(name);
  return m ? Number(m[1]) : null;
}

const fmtQty = (q: number) => (Number.isInteger(q) ? String(q) : String(Math.round(q * 10) / 10));

/** What to show for an entry: "Roti ×5", or just the name. */
export function entryLabel(e: Entry): string {
  if (!e.qty || e.qty === 1) return e.name;
  return `${e.name.replace(/\s*\(\d+\)/, '')} ×${fmtQty(e.qty)}`;
}

export function makeEntry(name: string, slot: SlotId, date: string, sample = false, at: number = Date.now(), batch: string = uid(), pid?: string, qty?: number): Entry {
  const m = match(name);
  const clean = name.trim().replace(/\s+/g, ' ');
  // "5 roti": the library serving is 2 rotis, so the numbers are scaled to 5; for a bowl or plate, to the count
  const pieces = m ? piecesOf(m[0]) : null;
  const f = qty && qty !== 1 ? (pieces ? qty / pieces : qty) : 1;
  const sc = (v: number) => Math.round(v * f);
  return {
    id: uid(),
    date,
    slot,
    name: m ? m[0] : clean.charAt(0).toUpperCase() + clean.slice(1),
    key: m ? norm(m[0]) : norm(clean),
    kcal: m ? sc(m[1]) : null,
    protein: m ? sc(m[2]) : null,
    carbs: m ? sc(m[5]) : null,
    fat: m ? sc(m[6]) : null,
    fiber: m ? sc(m[7]) : null,
    qty: qty && qty !== 1 ? qty : undefined,
    pid,
    sample: sample || undefined,
    at,
    batch,
  };
}

/** "poha, chai; dal tadka" into separate names. */
export function splitNames(text: string): string[] {
  return text
    .split(/,|;|\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/* ---------- totals ---------- */

export interface Totals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  /** items with no numbers in the library, left out of the sums */
  unknown: number;
}

export function totalsFor(entries: Entry[], date: string): Totals {
  const t: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, unknown: 0 };
  for (const e of entries) {
    if (e.date !== date) continue;
    if (e.kcal == null || e.protein == null) {
      t.unknown++;
      continue;
    }
    t.kcal += e.kcal;
    t.protein += e.protein;
    t.carbs += e.carbs ?? 0;
    t.fat += e.fat ?? 0;
    t.fiber += e.fiber ?? 0;
  }
  return t;
}

/** The meal to suggest for: the next one today that has not been logged yet. */
export function nextSlot(entries: Entry[], now: Date = new Date()): SlotId {
  const today = ymd(now);
  const done = new Set(entries.filter((e) => e.date === today).map((e) => e.slot));
  const cur = slotAt(now.getHours());
  for (let i = SLOT_ORDER.indexOf(cur); i < SLOT_ORDER.length; i++) if (!done.has(SLOT_ORDER[i])) return SLOT_ORDER[i];
  return cur;
}

/* ---------- suggestions ---------- */

export interface Suggestion {
  name: string;
  /** the dishes to log when this is eaten: one, or a few that you usually eat together */
  items: string[];
  kcal: number | null;
  protein: number | null;
  score: number;
  why: { text: string; warn?: boolean }[];
}

function noise(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

interface Stat {
  name: string;
  kcal: number | null;
  protein: number | null;
  carbs?: number | null;
  fat?: number | null;
  slotCount: Partial<Record<SlotId, number>>;
  total: number;
  last: string;
}

function statsOf(entries: Entry[]): Map<string, Stat> {
  const stats = new Map<string, Stat>();
  for (const e of entries) {
    const s = stats.get(e.key) ?? { name: e.name, kcal: e.kcal, protein: e.protein, carbs: e.carbs, fat: e.fat, slotCount: {}, total: 0, last: '' };
    s.total++;
    s.slotCount[e.slot] = (s.slotCount[e.slot] ?? 0) + 1;
    if (e.date > s.last) s.last = e.date;
    stats.set(e.key, s);
  }
  return stats;
}

/** Dishes you log together in one message, like "dal" and "rice" for lunch, are one habit. */
interface Combo {
  key: string;
  names: string[];
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  slotCount: Partial<Record<SlotId, number>>;
  total: number;
  last: string;
}

function combosOf(entries: Entry[]): Map<string, Combo> {
  const batches = new Map<string, Entry[]>();
  for (const e of entries) if (e.batch && !e.batch.startsWith('plan-')) batches.set(e.batch, [...(batches.get(e.batch) ?? []), e]);
  const out = new Map<string, Combo>();
  for (const list of batches.values()) {
    const uniq = [...new Map(list.map((e) => [e.key, e])).values()];
    if (uniq.length < 2 || uniq.length > 4) continue;
    const key = uniq.map((e) => e.key).sort().join('+');
    const c = out.get(key) ?? {
      key,
      names: uniq.map((e) => e.name),
      kcal: uniq.every((e) => e.kcal != null) ? uniq.reduce((a, e) => a + (e.kcal ?? 0), 0) : null,
      protein: uniq.every((e) => e.protein != null) ? uniq.reduce((a, e) => a + (e.protein ?? 0), 0) : null,
      carbs: uniq.every((e) => e.carbs != null) ? uniq.reduce((a, e) => a + (e.carbs ?? 0), 0) : null,
      fat: uniq.every((e) => e.fat != null) ? uniq.reduce((a, e) => a + (e.fat ?? 0), 0) : null,
      slotCount: {},
      total: 0,
      last: '',
    };
    const slot = uniq[0].slot;
    c.total++;
    c.slotCount[slot] = (c.slotCount[slot] ?? 0) + 1;
    const date = uniq[0].date;
    if (date > c.last) c.last = date;
    out.set(key, c);
  }
  return out;
}

const HABIT = 2.5; // what one more time at that meal is worth: your own habits outweigh the library

/**
 * Three dishes for one meal. What you eat at that meal, alone or together, ranks first. What you ate today or
 * yesterday ranks lower, and the day's missing protein and calories pull the right dishes up.
 */
/** How many different days must be logged before the app starts suggesting. */
export const LEARN_DAYS = 3;
export const learnedDays = (entries: Entry[]) => new Set(entries.map((e) => e.date)).size;
export const isLearned = (entries: Entry[]) => learnedDays(entries) >= LEARN_DAYS;

export function suggest(entries: Entry[], slot: SlotId, target: Target, now: Date = new Date(), count = 3, conditions: Condition[] = []): Suggestion[] {
  const today = ymd(now);
  const tot = totalsFor(entries, today);
  const leftK = target.kcal - tot.kcal;
  const leftP = target.protein - tot.protein;
  const stats = statsOf(entries);
  const combos = combosOf(entries);
  const label = SLOT_LABEL[slot].toLowerCase();

  interface Cand {
    key: string;
    name: string;
    items: string[];
    kcal: number | null;
    protein: number | null;
    carbs?: number | null;
    fat?: number | null;
    inSlot: number;
    total: number;
    last: string;
    combo?: boolean;
  }
  // nothing is suggested until the app has learned: it needs a few days of what you ate, and it only offers what you ate
  if (!isLearned(entries)) return [];
  const pool = new Map<string, Cand>();
  for (const [k, st] of stats) {
    if (st.slotCount[slot]) pool.set(k, { key: k, name: st.name, items: [st.name], kcal: st.kcal, protein: st.protein, carbs: st.carbs, fat: st.fat, inSlot: st.slotCount[slot] ?? 0, total: st.total, last: st.last });
  }
  for (const c of combos.values()) {
    if (c.slotCount[slot]) pool.set(c.key, { key: c.key, name: c.names.join(' + '), items: c.names, kcal: c.kcal, protein: c.protein, carbs: c.carbs, fat: c.fat, inSlot: c.slotCount[slot] ?? 0, total: c.total, last: c.last, combo: true });
  }

  const out: Suggestion[] = [];
  for (const c of pool.values()) {
    if (!c.items.every((n) => allowed(n, conditions))) continue;
    const habit = Math.min(c.inSlot, 8) * HABIT;
    let score = habit + Math.min(c.total, 8) * 0.4 + conditionScore(c.carbs, c.fat, c.kcal, conditions);
    if (c.combo) score += 0.8; // the whole meal you usually have beats one part of it
    const why: Suggestion['why'] = [];
    if (c.inSlot >= 2) why.push({ text: `You often have it at ${label} · ${c.inSlot}×` });
    else if (c.inSlot === 1) why.push({ text: `You had it for ${label} before` });
    if (c.last) {
      const ago = diffDays(today, c.last);
      if (ago === 0) {
        score -= 6 + habit;
        why.push({ text: 'Already eaten today', warn: true });
      } else if (ago === 1 && c.inSlot) {
        score -= habit * 0.8;
        why.push({ text: 'Had it yesterday', warn: true });
      } else if (ago === 2 && c.inSlot) {
        score -= habit * 0.35;
      } else if (ago >= 4 && c.inSlot) {
        score += 0.6;
        why.push({ text: `Not for ${ago} days` });
      }
    }
    if (c.protein != null && leftP > 10 && c.protein >= 10) {
      score += Math.min(2.5, leftP / 12);
      why.push({ text: `${c.protein} g protein · need ${Math.round(leftP)} g` });
    }
    if (c.kcal != null) {
      if (c.kcal > leftK + 150) {
        score -= 2;
        why.push({ text: 'Heavy for today', warn: true });
      } else if (leftK > 0) {
        score += 0.4;
        why.push({ text: 'Fits your calories' });
      }
    }
    if (!c.total) why.push({ text: 'New idea for you' });
    score += noise(today + c.key) * 0.5;
    out.push({ name: c.name, items: c.items, kcal: c.kcal, protein: c.protein, score, why: why.slice(0, 3) });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, count);
}

/* ---------- what the app has learned ---------- */

export interface Learned {
  days: number;
  meals: number;
  top: { name: string; n: number } | null;
  usual: Partial<Record<SlotId, { name: string; n: number }>>;
}

export function learned(entries: Entry[]): Learned {
  const count = new Map<string, { name: string; n: number }>();
  const bySlot: Partial<Record<SlotId, Map<string, { name: string; n: number }>>> = {};
  const days = new Set<string>();
  for (const e of entries) {
    days.add(e.date);
    const c = count.get(e.key) ?? { name: e.name, n: 0 };
    c.n++;
    count.set(e.key, c);
    const m = (bySlot[e.slot] ??= new Map());
    const x = m.get(e.key) ?? { name: e.name, n: 0 };
    x.n++;
    m.set(e.key, x);
  }
  // a meal you always eat as a set counts as one habit, and wins over its parts when it is as common
  for (const c of combosOf(entries).values()) {
    for (const s of SLOT_ORDER) {
      const n = c.slotCount[s];
      if (!n) continue;
      const m = (bySlot[s] ??= new Map());
      m.set(c.key, { name: c.names.join(' + '), n: n + 0.5 });
    }
  }
  const best = (m: Map<string, { name: string; n: number }>) => [...m.values()].sort((a, b) => b.n - a.n)[0];
  const usual: Learned['usual'] = {};
  for (const s of SLOT_ORDER) {
    const m = bySlot[s];
    if (m) {
      const b = best(m);
      usual[s] = { name: b.name, n: Math.floor(b.n) };
    }
  }
  return { days: days.size, meals: entries.length, top: count.size ? best(count) : null, usual };
}

/* ---------- demo meals ---------- */

/** Fourteen days of repeated habits, so suggestions have something to learn from. */
export function sampleEntries(now: Date = new Date()): Entry[] {
  const habits: Record<SlotId, string[]> = {
    b: ['Poha', 'Poha', 'Moong dal chilla', 'Upma', 'Masala oats', 'Idli (3)'],
    l: ['Dal tadka', 'Palak paneer', 'Gujarati dal', 'Rajma masala', 'Dal tadka', 'Aloo matar sabji'],
    m: ['Fruit bowl', 'Banana with peanuts', 'Sprouts chaat', 'Fruit bowl', 'Curd with fruit'],
    s: ['Roasted chana', 'Haldi doodh', 'Roasted chana', 'Banana protein shake', 'Roasted makhana'],
    d: ['Moong dal khichdi', 'Dal fry', 'Mix veg with paneer', 'Moong dal khichdi', 'Gujarati kadhi'],
  };
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out: Entry[] = [];
  for (let n = 14; n >= 1; n--) {
    const date = daysAgo(n, now);
    for (const s of SLOT_ORDER) {
      if ((s === 's' || s === 'm') && rnd() < 0.35) continue;
      const list = habits[s];
      const hour = { b: 8, m: 11, l: 13, s: 17, d: 20 }[s];
      out.push(makeEntry(list[Math.floor(rnd() * list.length)], s, date, true, new Date(`${date}T${hour < 10 ? '0' : ''}${hour}:15:00`).getTime()));
    }
  }
  return out;
}

/* ---------- the menu for the rest of today ---------- */

export interface MenuSlot {
  slot: SlotId;
  options: Suggestion[];
}

/** For each meal still to come today, three dishes, best first. Meals already logged are left out. */
export function dayMenu(entries: Entry[], target: Target, now: Date = new Date(), conditions: Condition[] = []): MenuSlot[] {
  const today = ymd(now);
  const done = new Set(entries.filter((e) => e.date === today).map((e) => e.slot));
  const cur = SLOT_ORDER.indexOf(slotAt(now.getHours()));
  const used = new Set<string>();
  return SLOT_ORDER.filter((s, i) => i >= cur && !done.has(s)).map((slot) => {
    // the same dish is not offered for two meals of one day
    const all = suggest(entries, slot, target, now, 6, conditions);
    const fresh = all.filter((o) => !used.has(o.name));
    const options = [...fresh, ...all.filter((o) => used.has(o.name))].slice(0, 3);
    if (options[0]) used.add(options[0].name);
    return { slot, options };
  });
}

/* ---------- the menu for the week ---------- */

export interface WeekSlot {
  slot: SlotId;
  /** what was actually eaten, for meals already logged today */
  eaten?: Entry[];
  options: Suggestion[];
  /** the dish planned for this meal */
  chosen?: Suggestion;
}
export interface WeekDay {
  date: string;
  slots: WeekSlot[];
  kcal: number;
  protein: number;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

/**
 * Seven days of menus from today. Each planned dish counts as eaten for the days after it, so the same dish
 * does not come up every day. `picks` holds the dishes the person swapped in, keyed "date|slot".
 */
export function weekMenu(entries: Entry[], target: Target, picks: Record<string, string> = {}, now: Date = new Date(), conditions: Condition[] = []): WeekDay[] {
  const today = ymd(now);
  const virtual: Entry[] = [...entries];
  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const at = new Date(`${date}T12:00:00`);
    const loggedSlots = new Map<SlotId, Entry[]>();
    if (i === 0) for (const e of entries) if (e.date === date) loggedSlots.set(e.slot, [...(loggedSlots.get(e.slot) ?? []), e]);
    const slots: WeekSlot[] = [];
    let kcal = 0;
    let protein = 0;
    for (const slot of SLOT_ORDER) {
      const eaten = loggedSlots.get(slot);
      if (eaten) {
        slots.push({ slot, eaten, options: [] });
        for (const e of eaten) {
          kcal += e.kcal ?? 0;
          protein += e.protein ?? 0;
        }
        continue;
      }
      if (i === 0 && SLOT_ORDER.indexOf(slot) < SLOT_ORDER.indexOf(slotAt(now.getHours()))) continue; // that meal time has passed
      const options = suggest(virtual, slot, target, at, 400, conditions);
      const wanted = picks[`${date}|${slot}`];
      const chosen = options.find((o) => o.name === wanted) ?? options[0];
      if (!chosen) continue;
      const rest = options.filter((o) => o !== chosen).slice(0, 2);
      slots.push({ slot, options: [chosen, ...rest], chosen });
      for (const item of chosen.items) virtual.push(makeEntry(item, slot, date, false, at.getTime(), `plan-${date}-${slot}`));
      kcal += chosen.kcal ?? 0;
      protein += chosen.protein ?? 0;
    }
    days.push({ date, slots, kcal, protein });
  }
  return days;
}

/* ---------- reading a message ---------- */

/** 'x' is a plain "snack": the morning one before noon, the evening one after. */
type Said = SlotId | 'x';
const SLOT_VOCAB: Record<string, Said> = {
  breakfast: 'b', nashta: 'b', nasta: 'b', naashta: 'b', subah: 'b', morning: 'b', brunch: 'b',
  msnack: 'm', midmorning: 'm',
  lunch: 'l', dopahar: 'l', dopehar: 'l', afternoon: 'l', tiffin: 'l',
  esnack: 's', evening: 's', shaam: 's', sham: 's', teatime: 's', chaitime: 's',
  snack: 'x', snacks: 'x',
  dinner: 'd', raat: 'd', night: 'd', supper: 'd', raatri: 'd',
};
const SLOT_FUZZY = Object.keys(SLOT_VOCAB).filter((w) => w.length >= 5);
const FILLER = new Set(['i', 'me', 'my', 'we', 'ate', 'eat', 'eaten', 'eating', 'had', 'have', 'having', 'took', 'khaya', 'khayi', 'khaye', 'kha', 'liya', 'lia', 'maine', 'mene', 'humne', 'aaj', 'today', 'just', 'for', 'in', 'at', 'during', 'the', 'ko', 'ka', 'ki', 'ke', 'mein', 'mai', 'main', 'pe', 'is', 'was', 'were', 'then', 'also', 'a', 'an', 'of', 'time']);
const SEP = new Set(['with', 'and', 'aur', 'plus']);
const UNIT = new Set(['cup', 'cups', 'cu', 'glass', 'glasses', 'plate', 'plates', 'bowl', 'bowls', 'piece', 'pieces', 'pcs', 'pc', 'katori', 'slice', 'slices']);
const NUMBER_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, half: 0.5, aadha: 0.5, adha: 0.5 };
const GENERIC = new Set(['sabji', 'sabzi', 'curry', 'masala', 'fry', 'dal', 'daal', 'rice', 'roti']);

function quantityOf(w: string): number | null {
  if (NUMBER_WORDS[w] != null) return NUMBER_WORDS[w];
  const m = /^x?(\d+(?:\.\d+)?)x?$/.exec(w);
  return m ? Number(m[1]) : null;
}

/** Splits slot words and filler out of one piece of a message. Slot words may be misspelled or split ("break fast"). */
function scan(part: string): { slots: Said[]; words: string[] } {
  const text = part
    .toLowerCase()
    .replace(/[^a-z0-9. ]+/g, ' ')
    .replace(/\bmid ?morning\b/g, ' midmorning ')
    .replace(/\b(morning|11 ?am)\s+snacks?\b/g, ' msnack ')
    .replace(/\b(evening|shaam|sham|tea ?time|chai ?time|4 ?pm|5 ?pm)\s+snacks?\b/g, ' esnack ');
  const raw = text.split(/\s+/).filter(Boolean);
  const slots: Said[] = [];
  const words: string[] = [];
  const slotOf = (w: string): Said | undefined => SLOT_VOCAB[w] ?? (w.length >= 5 ? SLOT_VOCAB[SLOT_FUZZY.find((v) => sameWord(w, v)) ?? ''] : undefined);
  for (let i = 0; i < raw.length; i++) {
    const w = raw[i];
    const two = i + 1 < raw.length ? w + raw[i + 1] : '';
    const s2 = two ? slotOf(two) : undefined;
    if (s2) {
      slots.push(s2);
      i++;
      continue;
    }
    const s1 = slotOf(w);
    if (s1) {
      slots.push(s1);
      continue;
    }
    if (FILLER.has(w)) continue;
    words.push(w);
  }
  return { slots, words };
}

/** "dalrice" typed as one word: two known words stuck together. */
function splitJoined(w: string): string[] | null {
  if (w.length < 6) return null;
  const known = new Set(Object.keys(SAYS));
  for (let k = 3; k <= w.length - 3; k++) {
    const a = w.slice(0, k);
    const b = w.slice(k);
    if (known.has(a) && (known.has(b) || match(b))) return [a, b];
  }
  return null;
}

function readDishes(words: string[]): { name: string; qty?: number }[] {
  const out: { name: string; qty?: number }[] = [];
  const n = words.length;
  let qty: number | undefined;
  const startsMatch = (k: number) => {
    for (let j = Math.min(n, k + 4); j > k; j--) if (match(words.slice(k, j).join(' '))) return true;
    return false;
  };
  let i = 0;
  while (i < n) {
    const w = words[i];
    if (SEP.has(w) || UNIT.has(w)) {
      i++;
      continue;
    }
    const q = quantityOf(w);
    if (q != null) {
      // "roti x3" and "dal 2 katori" count the dish before them; "5 roti" counts the one after
      const last = out[out.length - 1];
      const withUnit = i + 1 < n && UNIT.has(words[i + 1]);
      if (last && last.qty == null && qty == null && (/^x\d|\dx$/.test(w) || withUnit)) {
        last.qty = q;
        i += withUnit ? 2 : 1;
        continue;
      }
      qty = q;
      i++;
      continue;
    }
    let took = 0;
    for (let j = Math.min(n, i + 4); j > i; j--) {
      const phrase = words.slice(i, j);
      if (phrase.some((x) => SEP.has(x) || UNIT.has(x) || quantityOf(x) != null)) continue;
      if (match(phrase.join(' '))) {
        out.push({ name: phrase.join(' '), qty });
        qty = undefined;
        took = j - i;
        break;
      }
    }
    if (took) {
      i += took;
      continue;
    }
    const joined = splitJoined(w);
    if (joined) {
      out.push({ name: joined[0], qty }, { name: joined[1] });
      qty = undefined;
      i++;
      continue;
    }
    // a dish the library does not know: keep the words together, with a generic word like "sabji" after it
    let k = i + 1;
    if (k < n && GENERIC.has(words[k])) k++;
    out.push({ name: words.slice(i, k).join(' '), qty });
    qty = undefined;
    i = k;
  }
  return out;
}

export interface Reading {
  items: { name: string; slot: SlotId; qty?: number }[];
  /** the meal the message names, when it names exactly one */
  slot?: SlotId;
}

/**
 * "I ate dal rice in lunch", "chai evening snacks", "5 roti dinner" put each dish in the right meal, with the
 * count when there is one. A dish with no meal named goes to the one meal the message does name, or else to `fallback`.
 */
export function readMessage(text: string, fallback: SlotId, now: Date = new Date()): Reading {
  const snack: SlotId = now.getHours() < 12 && now.getHours() >= 5 ? 'm' : 's';
  const parts = text
    .split(/,|;|\n|\+|&/)
    .map(scan)
    .map((p) => ({ ...p, slots: p.slots.map((x): SlotId => (x === 'x' ? snack : x)) }));
  const all = [...new Set(parts.flatMap((p) => p.slots))];
  const only = all.length === 1 ? all[0] : undefined;
  const items: Reading['items'] = [];
  for (const p of parts) {
    const slot = p.slots[0] ?? only ?? fallback;
    for (const d of readDishes(p.words)) items.push(d.qty != null ? { name: d.name, slot, qty: d.qty } : { name: d.name, slot });
  }
  return { items, slot: only };
}

/** How many days in a row, up to today, have at least one meal logged. Today may still be empty. */
export function streak(entries: Entry[], now: Date = new Date()): number {
  const days = new Set(entries.map((e) => e.date));
  const today = ymd(now);
  let n = 0;
  let d = days.has(today) ? today : addDays(today, -1);
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export interface TodaySlot {
  slot: SlotId;
  /** what was eaten, when this meal is already logged */
  eaten?: Entry[];
  options: Suggestion[];
  /** the meal time has gone by without anything logged */
  missed: boolean;
}

/**
 * Today's whole menu: what you ate for the meals already logged, and a dish for each of the others. Logging
 * something changes the rest, because the day's missing calories and protein and the dishes already used change.
 */
export function todayMenu(entries: Entry[], target: Target, now: Date = new Date(), conditions: Condition[] = []): TodaySlot[] {
  const today = ymd(now);
  const cur = SLOT_ORDER.indexOf(slotAt(now.getHours()));
  const virtual: Entry[] = [...entries];
  const out: TodaySlot[] = [];
  for (const slot of SLOT_ORDER) {
    const eaten = entries.filter((e) => e.date === today && e.slot === slot);
    if (eaten.length) {
      out.push({ slot, eaten, options: [], missed: false });
      continue;
    }
    const options = suggest(virtual, slot, target, now, 3, conditions);
    if (options[0]) for (const item of options[0].items) virtual.push(makeEntry(item, slot, today, false, now.getTime(), `plan-${today}-${slot}`));
    out.push({ slot, options, missed: SLOT_ORDER.indexOf(slot) < cur });
  }
  return out;
}

export interface Upcoming {
  date: string;
  slot: SlotId;
  at: Date;
  dish: Suggestion;
}

/**
 * The next meals in the order of the clock, starting from now: after breakfast the morning snack, then lunch,
 * the evening snack and dinner, and on into tomorrow. Meals already eaten or already past are left out.
 */
export function upcomingMeals(entries: Entry[], target: Target, picks: Record<string, string> = {}, now: Date = new Date(), conditions: Condition[] = [], count = 5): Upcoming[] {
  const out: Upcoming[] = [];
  for (const day of weekMenu(entries, target, picks, now, conditions)) {
    for (const sl of day.slots) {
      if (sl.eaten || !sl.chosen) continue;
      const at = slotMoment(day.date, sl.slot);
      if (at.getTime() < now.getTime() - 20 * 60 * 1000) continue;
      out.push({ date: day.date, slot: sl.slot, at, dish: sl.chosen });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, count);
}
