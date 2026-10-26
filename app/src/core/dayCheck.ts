import { INGREDIENT_BY_ID } from '../data/ingredients';
import { dishMacros } from './nutrition';
import { computeTargets, type Targets } from './nutrition';
import { dishTags } from './planner';
import type { DayPlan, Dish, Macros, Person, Slot } from './types';

export type CheckKey = 'protein' | 'fiber' | 'veg' | 'pulse' | 'dairy' | 'fruit';
export type DayChecks = Record<CheckKey, boolean>;

const VEG_GROUPS = new Set(['leafy', 'veg', 'root']);

/**
 * A nutritionist's quick read of the day for the picked meals:
 * protein and fibre met for every member, vegetables, dal, dairy and fruit present.
 */
export function dayChecks(plan: DayPlan, dishes: Dish[], persons: Person[]): DayChecks {
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const targets = persons.map(computeTargets);
  const protein = persons.map(() => 0);
  const fiber = persons.map(() => 0);
  const veg = persons.map(() => 0);
  const tags = new Set<string>();

  for (const sp of plan.slots) {
    const opt = sp.options[sp.chosen ?? 0];
    if (!opt) continue;
    opt.protein.forEach((p, i) => (protein[i] += p));
    for (const id of opt.dishIds) {
      const d = byId.get(id);
      if (!d) continue;
      for (const tg of dishTags(d)) tags.add(tg);
      const fib = dishMacros(d).fiber;
      let vegG = 0;
      for (const it of d.items) {
        const ing = INGREDIENT_BY_ID[it.ing];
        if (ing && VEG_GROUPS.has(ing.group) && ing.id !== 'garlic' && ing.id !== 'onion') vegG += it.g;
      }
      opt.servings.forEach((m, i) => {
        fiber[i] += fib * m;
        veg[i] += vegG * m;
      });
    }
  }

  const all = (f: (i: number) => boolean) => persons.every((_, i) => f(i));
  return {
    protein: all((i) => protein[i] >= targets[i].protein * 0.9),
    fiber: all((i) => fiber[i] >= targets[i].fiber * 0.8),
    veg: all((i) => veg[i] >= 250 * (targets[i].kcal / 2000)),
    pulse: tags.has('pulse'),
    dairy: tags.has('dairy'),
    fruit: tags.has('fruit'),
  };
}

export interface PersonDay {
  total: Macros;
  bySlot: Partial<Record<Slot, Macros>>;
}

const zero = (): Macros => ({ kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

/** Planned nutrition for one day, per person and per meal. */
export function dayNutrition(plan: DayPlan, dishes: Dish[], persons: Person[]): PersonDay[] {
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const out: PersonDay[] = persons.map(() => ({ total: zero(), bySlot: {} }));
  for (const sp of plan.slots) {
    const opt = sp.options[sp.chosen ?? 0];
    if (!opt) continue;
    persons.forEach((_, i) => {
      const m = zero();
      for (const id of opt.dishIds) {
        const d = byId.get(id);
        if (!d) continue;
        const dm = dishMacros(d);
        const f = opt.servings[i];
        m.kcal += dm.kcal * f;
        m.protein += dm.protein * f;
        m.carbs += dm.carbs * f;
        m.fat += dm.fat * f;
        m.fiber += dm.fiber * f;
      }
      out[i].bySlot[sp.slot] = m;
      for (const k of Object.keys(m) as (keyof Macros)[]) out[i].total[k] += m[k];
    });
  }
  return out;
}

export type InsightMacro = 'kcal' | 'carbs' | 'fat' | 'protein' | 'fiber';

export interface Insight {
  macro: InsightMacro;
  /** amount over (positive) or under (negative) the target */
  diff: number;
  /** the meal that contributes most, for an overshoot */
  slot?: Slot;
}

/**
 * The one thing worth telling a person about their day: the macro furthest from target
 * (more than 15% off), and which meal drives it when it is too high.
 */
export function dayInsight(day: PersonDay, target: Targets): Insight | null {
  const keys: InsightMacro[] = ['kcal', 'carbs', 'fat', 'protein', 'fiber'];
  let best: Insight | null = null;
  let bestRel = 0.15;
  for (const k of keys) {
    const goal = target[k];
    if (!goal) continue;
    const diff = day.total[k] - goal;
    const rel = diff / goal;
    // fibre above target is good news, not a warning
    if (k === 'fiber' && rel > 0) continue;
    if (Math.abs(rel) > bestRel) {
      bestRel = Math.abs(rel);
      best = { macro: k, diff };
    }
  }
  if (best && best.diff > 0) {
    let top: Slot | undefined;
    let topV = -1;
    for (const [slot, m] of Object.entries(day.bySlot) as [Slot, Macros][]) {
      if (m[best.macro] > topV) {
        topV = m[best.macro];
        top = slot;
      }
    }
    best.slot = top;
  }
  return best;
}
