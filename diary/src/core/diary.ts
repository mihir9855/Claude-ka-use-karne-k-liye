import { LIBRARY, type LibraryDish } from '../data/library';

export type SlotId = 'b' | 'l' | 's' | 'd';
export const SLOT_ORDER: SlotId[] = ['b', 'l', 's', 'd'];
export const SLOT_LABEL: Record<SlotId, string> = { b: 'Breakfast', l: 'Lunch', s: 'Snack', d: 'Dinner' };

export interface Entry {
  id: string;
  date: string; // yyyy-mm-dd
  slot: SlotId;
  name: string;
  /** normalised name, the same for the same dish however it was typed */
  key: string;
  kcal: number | null;
  protein: number | null;
  /** true for the demo meals, so they can be cleared on their own */
  sample?: boolean;
  /** when it was logged (ms); older saved entries may not have it */
  at?: number;
  /** entries typed in one go share a batch, like one chat message */
  batch?: string;
}

export interface Target {
  kcal: number;
  protein: number;
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
  return hour < 11 ? 'b' : hour < 15 ? 'l' : hour < 18 ? 's' : 'd';
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

const INDEX = LIBRARY.map((d) => ({ d, n: norm(d[0]), t: toks(d[0]) }));

/** The library dish a typed name stands for, or null when nothing fits well enough. */
export function match(text: string): LibraryDish | null {
  const n = norm(text);
  const t = toks(text);
  if (!n) return null;
  let best: LibraryDish | null = null;
  let bs = 0;
  for (const it of INDEX) {
    if (it.n === n) return it.d;
    const common = t.filter((x) => it.t.includes(x)).length;
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

export function makeEntry(name: string, slot: SlotId, date: string, sample = false, at: number = Date.now(), batch: string = uid()): Entry {
  const m = match(name);
  const clean = name.trim().replace(/\s+/g, ' ');
  return {
    id: uid(),
    date,
    slot,
    name: m ? m[0] : clean.charAt(0).toUpperCase() + clean.slice(1),
    key: m ? norm(m[0]) : norm(clean),
    kcal: m ? m[1] : null,
    protein: m ? m[2] : null,
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

export function totalsFor(entries: Entry[], date: string): { kcal: number; protein: number; unknown: number } {
  let kcal = 0;
  let protein = 0;
  let unknown = 0;
  for (const e of entries) {
    if (e.date !== date) continue;
    if (e.kcal == null || e.protein == null) unknown++;
    else {
      kcal += e.kcal;
      protein += e.protein;
    }
  }
  return { kcal, protein, unknown };
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
  slotCount: Partial<Record<SlotId, number>>;
  total: number;
  last: string;
}

function statsOf(entries: Entry[]): Map<string, Stat> {
  const stats = new Map<string, Stat>();
  for (const e of entries) {
    const s = stats.get(e.key) ?? { name: e.name, kcal: e.kcal, protein: e.protein, slotCount: {}, total: 0, last: '' };
    s.total++;
    s.slotCount[e.slot] = (s.slotCount[e.slot] ?? 0) + 1;
    if (e.date > s.last) s.last = e.date;
    stats.set(e.key, s);
  }
  return stats;
}

/**
 * Three dishes for one meal. What you eat at that meal often ranks first, what you ate today or yesterday
 * ranks lower, and the day's missing protein and calories pull the right dishes up.
 */
export function suggest(entries: Entry[], slot: SlotId, target: Target, now: Date = new Date(), count = 3): Suggestion[] {
  const today = ymd(now);
  const tot = totalsFor(entries, today);
  const leftK = target.kcal - tot.kcal;
  const leftP = target.protein - tot.protein;
  const stats = statsOf(entries);
  const label = SLOT_LABEL[slot].toLowerCase();

  const pool = new Map<string, { name: string; kcal: number | null; protein: number | null }>();
  for (const d of LIBRARY) {
    if (d[4].includes(slot) && (d[3] === 'co' || d[3] === 'ma' || d[3] === 'sn')) pool.set(norm(d[0]), { name: d[0], kcal: d[1], protein: d[2] });
  }
  for (const [k, s] of stats) if (s.slotCount[slot]) pool.set(k, { name: s.name, kcal: s.kcal, protein: s.protein });

  const out: Suggestion[] = [];
  for (const [k, c] of pool) {
    const s = stats.get(k);
    const inSlot = s?.slotCount[slot] ?? 0;
    let score = Math.min(inSlot, 6);
    const why: Suggestion['why'] = [];
    if (s) score += Math.min(s.total, 8) * 0.25;
    if (inSlot >= 2) why.push({ text: `Often at ${label} · ${inSlot}×` });
    else if (inSlot === 1) why.push({ text: `You had it for ${label} before` });
    if (s) {
      const ago = diffDays(today, s.last);
      if (ago === 0) {
        score -= 4;
        why.push({ text: 'Already eaten today', warn: true });
      } else if (ago === 1 && inSlot) {
        score -= 1.6;
        why.push({ text: 'Had it yesterday', warn: true });
      } else if (ago >= 4 && inSlot) {
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
    if (!s) why.push({ text: 'New idea for you' });
    score += noise(today + k) * 0.5;
    out.push({ name: c.name, kcal: c.kcal, protein: c.protein, score, why: why.slice(0, 3) });
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
  const best = (m: Map<string, { name: string; n: number }>) => [...m.values()].sort((a, b) => b.n - a.n)[0];
  const usual: Learned['usual'] = {};
  for (const s of SLOT_ORDER) {
    const m = bySlot[s];
    if (m) usual[s] = best(m);
  }
  return { days: days.size, meals: entries.length, top: count.size ? best(count) : null, usual };
}

/* ---------- demo meals ---------- */

/** Fourteen days of repeated habits, so suggestions have something to learn from. */
export function sampleEntries(now: Date = new Date()): Entry[] {
  const habits: Record<SlotId, string[]> = {
    b: ['Poha', 'Poha', 'Moong dal chilla', 'Upma', 'Masala oats', 'Idli (3)'],
    l: ['Dal tadka', 'Palak paneer', 'Gujarati dal', 'Rajma masala', 'Dal tadka', 'Aloo matar sabji'],
    s: ['Roasted chana', 'Fruit bowl', 'Haldi doodh', 'Roasted chana', 'Banana protein shake'],
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
      if (s === 's' && rnd() < 0.35) continue;
      const list = habits[s];
      const hour = { b: 8, l: 13, s: 17, d: 20 }[s];
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
export function dayMenu(entries: Entry[], target: Target, now: Date = new Date()): MenuSlot[] {
  const today = ymd(now);
  const done = new Set(entries.filter((e) => e.date === today).map((e) => e.slot));
  const cur = SLOT_ORDER.indexOf(slotAt(now.getHours()));
  const used = new Set<string>();
  return SLOT_ORDER.filter((s, i) => i >= cur && !done.has(s)).map((slot) => {
    // the same dish is not offered for two meals of one day
    const all = suggest(entries, slot, target, now, 6);
    const fresh = all.filter((o) => !used.has(o.name));
    const options = [...fresh, ...all.filter((o) => used.has(o.name))].slice(0, 3);
    if (options[0]) used.add(options[0].name);
    return { slot, options };
  });
}
