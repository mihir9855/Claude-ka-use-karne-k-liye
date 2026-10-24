import { INGREDIENT_BY_ID } from '../data/ingredients';
import { dishMacros } from './nutrition';
import { computeTargets } from './nutrition';
import { dishTags } from './planner';
import type { DayPlan, Dish, Person } from './types';

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
