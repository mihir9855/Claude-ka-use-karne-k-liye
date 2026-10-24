import { INGREDIENT_BY_ID } from '../data/ingredients';
import { habitScore, habitStats, pairCounts, pairKey } from './habits';
import { autoMealCount, computeTargets, dishFlags, dishMacros, excludedFlags, giShare, softFlags } from './nutrition';
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

export type FoodTag = 'dairy' | 'fruit' | 'leafy' | 'pulse';

const TAG_WEIGHT: Record<FoodTag, number> = { fruit: 1.2, leafy: 0.6, dairy: 0.5, pulse: 0.5 };

/** Food groups a dish contributes, used to cover the whole day (calcium, vitamins, iron). */
export function dishTags(dish: Dish): Set<FoodTag> {
  const tags = new Set<FoodTag>();
  for (const it of dish.items) {
    const ing = INGREDIENT_BY_ID[it.ing];
    if (!ing) continue;
    if (ing.group === 'dairy' && ing.id !== 'ghee' && ing.id !== 'whey') tags.add('dairy');
    if (ing.group === 'fruit') tags.add('fruit');
    if (ing.group === 'leafy' && it.g >= 40) tags.add('leafy');
    if (ing.group === 'pulse' && it.g >= 30) tags.add('pulse');
  }
  return tags;
}

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
  covered: Set<FoodTag>,
  salt: number,
  /** protein already delivered earlier today, and the share of the day still to come (incl. this slot) */
  carry: { delivered: number[]; remainingShare: number },
): SlotPlan {
  const { persons, pantry } = input;
  const targets = persons.map((p, i) => {
    const t = computeTargets(p);
    // spread any protein shortfall so far over the meals that are left
    const base = t.protein * share;
    const left = (t.protein - carry.delivered[i]) * (share / Math.max(carry.remainingShare, share));
    const protein = Math.min(base * 1.5, Math.max(base * 0.6, left));
    return { kcal: t.kcal * share, protein };
  });
  const banned = excludedFlags(persons);
  const soft = softFlags(persons);
  const stats = habitStats(input.log, input.date);
  const pairs = pairCounts(input.log);
  const rng = mulberry32(hash(`${input.date}|${slot}|${salt}`));
  const hasPantry = pantryHas(pantry);
  // dishes already eaten today are not suggested again
  const eatenToday = new Set(input.log.filter((e) => e.date === input.date).flatMap((e) => e.dishIds));

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
    let worstProt = 0;
    let kcalErr = 0;
    persons.forEach((_, i) => {
      const raw = targets[i].kcal / Math.max(kcal, 1);
      const m = Math.min(2.5, Math.max(0.5, Math.round(raw * 4) / 4));
      servings.push(m);
      kc.push(m * kcal);
      pr.push(m * protein);
      // falling short of protein costs more than overshooting it
      const tp = Math.max(targets[i].protein, 1);
      const gap = (m * protein - targets[i].protein) / tp;
      const err = gap < 0 ? -gap : gap * 0.4;
      protErr += err;
      worstProt = Math.max(worstProt, err);
      kcalErr += Math.abs(m * kcal - targets[i].kcal) / Math.max(targets[i].kcal, 1);
    });
    protErr = 0.5 * (protErr / persons.length) + 0.5 * worstProt;
    kcalErr /= persons.length;

    // steady energy: fibre per meal, and no big spike from fast carbs
    const mealFiber = dishes.reduce((a, d) => a + dishMacros(d).fiber, 0);
    let fiberScore = 0;
    persons.forEach((_, i) => {
      const need = (14 * targets[i].kcal) / 1000;
      fiberScore += Math.min(1, (servings[i] * mealFiber) / Math.max(need, 1));
    });
    fiberScore /= persons.length;
    const spike = slotCategory(slot) === 'snack' ? 0 : Math.max(0, giShare(dishes) - 0.4) * 2.5;

    const { cov, soon } = hasPantry ? coverage(dishes, pantry) : { cov: 1, soon: 0 };
    let s = 6 * (1 - Math.min(1, protErr)) - 2 * kcalErr;
    s += 2 * cov + 0.8 * soon + 1.0 * fiberScore - spike;
    const tags = new Set<FoodTag>();
    for (const d of dishes) for (const tg of dishTags(d)) tags.add(tg);
    for (const tg of tags) if (!covered.has(tg)) s += TAG_WEIGHT[tg];

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
  const fresh = scored.filter(
    (c) => !c.dishes.some((d) => KEY_ROLES.includes(d.role) && eatenToday.has(d.id)),
  );
  if (fresh.length >= 2) scored = fresh;
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
  const covered = new Set<FoodTag>();
  const byId = new Map(input.dishes.map((d) => [d.id, d]));
  const markCovered = (ids: string[]) => {
    for (const id of ids) {
      const d = byId.get(id);
      if (d) for (const tg of dishTags(d)) covered.add(tg);
    }
  };
  for (const e of input.log) if (e.date === input.date) markCovered(e.dishIds);
  const out: SlotPlan[] = [];
  const delivered = input.persons.map(() => 0);
  slots.forEach((slot, i) => {
    const remainingShare = shares.slice(i).reduce((a, b) => a + b, 0);
    const sp = planSlot(input, slot, shares[i], used, covered, input.salt ?? 0, { delivered: delivered.slice(), remainingShare });
    sp.options[0]?.protein.forEach((p, k) => (delivered[k] += p));
    for (const o of sp.options) for (const id of keyIdsOf(o, input.dishes)) used.add(id);
    if (sp.options[0]) markCovered(sp.options[0].dishIds);
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
  const byId = new Map(input.dishes.map((d) => [d.id, d]));
  const covered = new Set<FoodTag>();
  plan.slots.forEach((sp, i) => {
    if (i === slotIndex || !sp.options[0]) return;
    for (const id of sp.options[0].dishIds) {
      const d = byId.get(id);
      if (d) for (const tg of dishTags(d)) covered.add(tg);
    }
  });
  const delivered = input.persons.map(() => 0);
  plan.slots.slice(0, slotIndex).forEach((sp) => sp.options[0]?.protein.forEach((p, k) => (delivered[k] += p)));
  const remainingShare = shares.slice(slotIndex).reduce((a, b) => a + b, 0);
  const sp = planSlot(input, plan.slots[slotIndex].slot, shares[slotIndex], used, covered, salt, { delivered, remainingShare });
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
