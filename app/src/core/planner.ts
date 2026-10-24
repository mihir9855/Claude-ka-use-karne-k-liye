import { INGREDIENT_BY_ID } from '../data/ingredients';
import { habitScore, habitStats, pairCounts, pairKey } from './habits';
import { autoMealCount, computeTargets, dishFlags, dishMacros, excludedFlags, softFlags } from './nutrition';
import type {
  DayPlan,
  Dish,
  DishPref,
  Flag,
  LogEntry,
  MealCategory,
  MealOption,
  Pantry,
  Person,
  Slot,
  SlotPlan,
} from './types';

export const SLOTS_BY_COUNT: Record<number, Slot[]> = {
  3: ['breakfast', 'lunch', 'dinner'],
  4: ['breakfast', 'lunch', 'evening', 'dinner'],
  5: ['breakfast', 'midmorning', 'lunch', 'evening', 'dinner'],
  6: ['breakfast', 'midmorning', 'lunch', 'evening', 'dinner', 'bedtime'],
};

/** Share of the day's calories and protein for each slot, per meal count. */
const SHARE: Record<number, number[]> = {
  3: [0.27, 0.4, 0.33],
  4: [0.25, 0.33, 0.12, 0.3],
  5: [0.22, 0.1, 0.3, 0.1, 0.28],
  6: [0.2, 0.1, 0.28, 0.1, 0.22, 0.1],
};

export function slotCategory(slot: Slot): MealCategory {
  if (slot === 'breakfast' || slot === 'lunch' || slot === 'dinner') return slot;
  return 'snack';
}

export interface PlanInput {
  date: string;
  persons: Person[];
  mealCount: number | 'auto';
  dishes: Dish[];
  pantry: Pantry;
  log: LogEntry[];
  prefs: Record<string, DishPref>;
  /** only suggest dishes you can mostly cook from the pantry */
  strictPantry: boolean;
  /** change to get a different plan for the same day */
  salt?: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function compositions(cat: MealCategory, dishes: Dish[]): Dish[][] {
  const pool = dishes.filter((d) => d.meals.includes(cat));
  const role = (r: Dish['role']) => pool.filter((d) => d.role === r);
  const sides = role('side');
  const out: Dish[][] = [];
  if (cat === 'snack') {
    for (const d of [...role('snack'), ...role('complete')]) out.push([d]);
    return out;
  }
  for (const c of role('complete')) {
    out.push([c]);
    for (const s of sides) out.push([c, s]);
  }
  if (cat === 'breakfast') return out;
  for (const m of role('main'))
    for (const st of role('staple')) {
      out.push([m, st]);
      for (const s of sides) out.push([m, st, s]);
    }
  return out;
}

function pantryHas(pantry: Pantry): boolean {
  return Object.values(pantry.have).some(Boolean);
}

/** Share (by weight) of a meal's non-basic ingredients that are at home, and share that should be used first. */
function coverage(dishes: Dish[], pantry: Pantry): { cov: number; soon: number } {
  let total = 0;
  let have = 0;
  let soon = 0;
  for (const d of dishes)
    for (const it of d.items) {
      const ing = INGREDIENT_BY_ID[it.ing];
      if (!ing || ing.basic) continue;
      total += it.g;
      if (pantry.have[it.ing]) have += it.g;
      if (pantry.soon[it.ing]) soon += it.g;
    }
  return total === 0 ? { cov: 1, soon: 0 } : { cov: have / total, soon: soon / total };
}

const KEY_ROLES: Dish['role'][] = ['complete', 'main', 'snack'];

interface Scored {
  dishes: Dish[];
  option: MealOption;
  score: number;
}

function planSlot(
  input: PlanInput,
  slot: Slot,
  share: number,
  usedToday: Set<string>,
  salt: number,
): SlotPlan {
  const { persons, pantry } = input;
  const targets = persons.map((p) => {
    const t = computeTargets(p);
    return { kcal: t.kcal * share, protein: t.protein * share };
  });
  const banned = excludedFlags(persons);
  const soft = softFlags(persons);
  const stats = habitStats(input.log, input.date);
  const pairs = pairCounts(input.log);
  const rng = mulberry32(hash(`${input.date}|${slot}|${salt}`));
  const hasPantry = pantryHas(pantry);

  const flagCache = new Map<string, Set<Flag>>();
  const flagsOf = (d: Dish) => {
    let f = flagCache.get(d.id);
    if (!f) flagCache.set(d.id, (f = dishFlags(d)));
    return f;
  };

  const allowedDish = (d: Dish) =>
    input.prefs[d.id] !== 'dislike' && ![...flagsOf(d)].some((f) => banned.has(f));

  const pool = input.dishes.filter(allowedDish);
  const comps = compositions(slotCategory(slot), pool);

  const score = (dishes: Dish[]): Scored => {
    let kcal = 0;
    let protein = 0;
    for (const d of dishes) {
      const m = dishMacros(d);
      kcal += m.kcal;
      protein += m.protein;
    }
    const servings: number[] = [];
    const kc: number[] = [];
    const pr: number[] = [];
    let protErr = 0;
    let kcalErr = 0;
    persons.forEach((_, i) => {
      const raw = targets[i].kcal / Math.max(kcal, 1);
      const m = Math.min(2.5, Math.max(0.5, Math.round(raw * 4) / 4));
      servings.push(m);
      kc.push(m * kcal);
      pr.push(m * protein);
      protErr += Math.abs(m * protein - targets[i].protein) / Math.max(targets[i].protein, 1);
      kcalErr += Math.abs(m * kcal - targets[i].kcal) / Math.max(targets[i].kcal, 1);
    });
    protErr /= persons.length;
    kcalErr /= persons.length;

    const { cov, soon } = hasPantry ? coverage(dishes, pantry) : { cov: 1, soon: 0 };
    let s = 4 * (1 - Math.min(1, protErr)) - 2 * kcalErr;
    s += 2 * cov + 0.8 * soon;

    for (const d of dishes) {
      s += habitScore(stats.get(d.id));
      if (input.prefs[d.id] === 'like') s += 0.8;
      if (usedToday.has(d.id) && KEY_ROLES.includes(d.role)) s -= 1.5;
      for (const f of flagsOf(d)) if (soft.has(f)) s -= 0.7;
    }
    for (let i = 0; i < dishes.length; i++)
      for (let j = i + 1; j < dishes.length; j++)
        if ((pairs.get(pairKey(dishes[i].id, dishes[j].id)) ?? 0) >= 2) s += 0.5;
    s += rng() * 0.6;

    return {
      dishes,
      score: s,
      option: { dishIds: dishes.map((d) => d.id), servings, kcal: kc, protein: pr, coverage: cov },
    };
  };

  let scored = comps.map(score);
  if (input.strictPantry && hasPantry) {
    const strict = scored.filter((c) => c.option.coverage >= 0.75);
    if (strict.length >= 2) scored = strict;
  }
  scored.sort((a, b) => b.score - a.score);

  const options: MealOption[] = [];
  if (scored.length > 0) {
    const a = scored[0];
    options.push(a.option);
    const keyIds = new Set(a.dishes.filter((d) => KEY_ROLES.includes(d.role)).map((d) => d.id));
    const b =
      scored.find((c) => !c.dishes.some((d) => KEY_ROLES.includes(d.role) && keyIds.has(d.id))) ??
      scored[1];
    if (b) options.push(b.option);
  }
  return { slot, targets, options };
}

function keyIdsOf(option: MealOption | undefined, dishes: Dish[]): string[] {
  if (!option) return [];
  const byId = new Map(dishes.map((d) => [d.id, d]));
  return option.dishIds.filter((id) => KEY_ROLES.includes(byId.get(id)?.role ?? 'side'));
}

export function generateDayPlan(input: PlanInput): DayPlan {
  const count =
    input.mealCount === 'auto'
      ? autoMealCount(input.persons.map(computeTargets))
      : input.mealCount;
  const slots = SLOTS_BY_COUNT[count];
  const shares = SHARE[count];
  const used = new Set<string>();
  const out: SlotPlan[] = [];
  slots.forEach((slot, i) => {
    const sp = planSlot(input, slot, shares[i], used, input.salt ?? 0);
    for (const o of sp.options) for (const id of keyIdsOf(o, input.dishes)) used.add(id);
    out.push(sp);
  });
  return { date: input.date, mealCount: count, slots: out };
}

/** New suggestions for one slot, keeping the rest of the day. */
export function regenerateSlot(plan: DayPlan, slotIndex: number, input: PlanInput, salt: number): DayPlan {
  const used = new Set<string>();
  plan.slots.forEach((sp, i) => {
    if (i === slotIndex) return;
    for (const o of sp.options) for (const id of keyIdsOf(o, input.dishes)) used.add(id);
  });
  const shares = SHARE[plan.mealCount];
  const sp = planSlot(input, plan.slots[slotIndex].slot, shares[slotIndex], used, salt);
  const slots = plan.slots.slice();
  slots[slotIndex] = sp;
  return { ...plan, slots };
}

export interface ShoppingItem {
  ing: string;
  grams: number;
}

/** What the day's chosen meals need that is not in the pantry. */
export function shoppingGap(plan: DayPlan, dishes: Dish[], pantry: Pantry): ShoppingItem[] {
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const need = new Map<string, number>();
  for (const sp of plan.slots) {
    const opt = sp.options[sp.chosen ?? 0];
    if (!opt) continue;
    const totalServings = opt.servings.reduce((a, b) => a + b, 0);
    for (const id of opt.dishIds) {
      for (const it of byId.get(id)?.items ?? []) {
        const ing = INGREDIENT_BY_ID[it.ing];
        if (!ing || ing.basic || pantry.have[it.ing]) continue;
        need.set(it.ing, (need.get(it.ing) ?? 0) + it.g * totalServings);
      }
    }
  }
  return [...need.entries()]
    .map(([ing, g]) => ({ ing, grams: Math.ceil(g / 10) * 10 }))
    .sort((a, b) => b.grams - a.grams);
}
