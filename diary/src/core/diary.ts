import { EXTRAS, LIBRARY, SAYS, type LibraryDish } from '../data/library';
import { allowed, conditionScore, type Condition, type Target } from './profile';

export type { Target };

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
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
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

export function makeEntry(name: string, slot: SlotId, date: string, sample = false, at: number = Date.now(), batch: string = uid(), pid?: string): Entry {
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
    carbs: m ? m[5] : null,
    fat: m ? m[6] : null,
    fiber: m ? m[7] : null,
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

/**
 * Three dishes for one meal. What you eat at that meal often ranks first, what you ate today or yesterday
 * ranks lower, and the day's missing protein and calories pull the right dishes up.
 */
export function suggest(entries: Entry[], slot: SlotId, target: Target, now: Date = new Date(), count = 3, conditions: Condition[] = []): Suggestion[] {
  const today = ymd(now);
  const tot = totalsFor(entries, today);
  const leftK = target.kcal - tot.kcal;
  const leftP = target.protein - tot.protein;
  const stats = statsOf(entries);
  const label = SLOT_LABEL[slot].toLowerCase();

  const pool = new Map<string, { name: string; kcal: number | null; protein: number | null; carbs?: number | null; fat?: number | null }>();
  for (const d of LIBRARY) {
    if (d[4].includes(slot) && (d[3] === 'co' || d[3] === 'ma' || d[3] === 'sn')) pool.set(norm(d[0]), { name: d[0], kcal: d[1], protein: d[2], carbs: d[5], fat: d[6] });
  }
  for (const [k, s] of stats) if (s.slotCount[slot]) pool.set(k, { name: s.name, kcal: s.kcal, protein: s.protein, carbs: s.carbs, fat: s.fat });

  const out: Suggestion[] = [];
  for (const [k, c] of pool) {
    if (!allowed(c.name, conditions)) continue;
    const s = stats.get(k);
    const inSlot = s?.slotCount[slot] ?? 0;
    let score = Math.min(inSlot, 6) + conditionScore(c.carbs, c.fat, c.kcal, conditions);
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
        score -= 5;
        why.push({ text: 'Had it yesterday', warn: true });
      } else if (ago === 2 && inSlot) {
        score -= 1.5;
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
      virtual.push(makeEntry(chosen.name, slot, date, false, at.getTime(), `plan-${date}-${slot}`));
      kcal += chosen.kcal ?? 0;
      protein += chosen.protein ?? 0;
    }
    days.push({ date, slots, kcal, protein });
  }
  return days;
}

/* ---------- reading a message ---------- */

const SLOT_WORDS: [SlotId, RegExp][] = [
  ['b', /\b(breakfast|brekfast|nashta|nasta|naashta|naasta|subah|morning)\b/gi],
  ['l', /\b(lunch|dopahar|dopehar|afternoon|lunchtime)\b/gi],
  ['s', /\b(snacks?|evening|shaam|sham|tea ?time|chai ?time)\b/gi],
  ['d', /\b(dinner|raat|night|supper|raatri)\b/gi],
];
const FILLER = /\b(i|me|my|we|ate|eat|eaten|eating|had|have|having|took|khaya|khayi|khaye|kha|liya|lia|maine|mene|humne|aaj|today|just|for|in|at|during|the|ko|ka|ki|ke|me|mein|mai|main|pe|ate|is|was|were|then|also|aur|and)\b/gi;

/** "dal rice" with no comma: split into the dishes it is made of, when every part is a known dish. */
function splitDishes(phrase: string): string[] {
  if (match(phrase)) return [phrase];
  const words = phrase.split(' ');
  if (words.length < 2) return [phrase];
  const out: string[] = [];
  let i = 0;
  while (i < words.length) {
    let took = 0;
    for (let j = words.length; j > i; j--) {
      if (match(words.slice(i, j).join(' '))) {
        out.push(words.slice(i, j).join(' '));
        took = j - i;
        break;
      }
    }
    if (!took) return [phrase];
    i += took;
  }
  return out;
}

export interface Reading {
  items: { name: string; slot: SlotId }[];
  /** the meal the message names, when it names exactly one */
  slot?: SlotId;
}

function slotsIn(text: string): SlotId[] {
  const found: SlotId[] = [];
  for (const [id, re] of SLOT_WORDS) {
    re.lastIndex = 0;
    if (re.test(text)) found.push(id);
    re.lastIndex = 0;
  }
  return found;
}

/**
 * "I ate dal rice in lunch", "chai evening snacks" or "dinner: roti, sabji" put each dish in the right meal.
 * A dish with no meal named goes to the one meal the message does name, or else to `fallback`.
 */
export function readMessage(text: string, fallback: SlotId): Reading {
  const all = slotsIn(text);
  const only = all.length === 1 ? all[0] : undefined;
  const items: Reading['items'] = [];
  for (const part of text.split(/,|;|\n|\+|&/)) {
    const mine = slotsIn(part);
    let clean = part;
    for (const [, re] of SLOT_WORDS) clean = clean.replace(re, ' ');
    clean = clean.replace(FILLER, ' ').replace(/[:\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const slot = mine[0] ?? only ?? fallback;
    for (const name of splitDishes(clean)) items.push({ name, slot });
  }
  return { items, slot: only };
}
