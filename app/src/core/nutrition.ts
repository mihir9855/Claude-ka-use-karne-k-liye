import { INGREDIENT_BY_ID } from '../data/ingredients';
import type { Condition, Dish, Flag, Macros, Person } from './types';

const ACTIVITY: Record<Person['activity'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

const PROTEIN_PER_KG: Record<Person['goal'], number> = {
  fat_loss: 1.6,
  muscle_gain: 1.8,
  maintain: 1.2,
};

export interface Targets extends Macros {
  waterL: number;
}

/** Mifflin-St Jeor BMR */
export function bmr(p: Person): number {
  // guard against half-typed profile fields
  const w = Math.max(p.weightKg, 30);
  const h = Math.max(p.heightCm, 120);
  const a = Math.min(Math.max(p.age, 15), 90);
  const base = 10 * w + 6.25 * h - 5 * a;
  return p.sex === 'male' ? base + 5 : base - 161;
}

/** Approximate growing-child needs (kcal by age band); protein about 1 g per kg. */
function childKcal(p: Person): number {
  const boy = p.sex === 'male';
  if (p.age <= 3) return 1000;
  if (p.age <= 6) return 1350;
  if (p.age <= 9) return 1800;
  if (p.age <= 12) return boy ? 2200 : 2000;
  if (p.age <= 15) return boy ? 2500 : 2200;
  return boy ? 2700 : 2200;
}

export function computeTargets(p: Person): Targets {
  if (p.age > 0 && p.age < 18) {
    const kcal = childKcal(p);
    const weight = Math.max(p.weightKg, 8);
    const protein = Math.round(weight * 1.0);
    const fat = Math.round((kcal * 0.3) / 9);
    return {
      kcal,
      protein,
      carbs: Math.round((kcal - protein * 4 - fat * 9) / 4),
      fat,
      fiber: Math.round((kcal * 14) / 1000),
      waterL: Math.round(weight * 0.04 * 10) / 10,
    };
  }
  const tdee = bmr(p) * ACTIVITY[p.activity];
  const floor = p.sex === 'male' ? 1500 : 1200;
  let kcal = tdee;
  if (p.goal === 'fat_loss') kcal = Math.max(floor, tdee * 0.8);
  if (p.goal === 'muscle_gain') kcal = tdee * 1.1;

  const weight = Math.max(p.weightKg, 30);
  let protein = weight * PROTEIN_PER_KG[p.goal];
  // kidney conditions: keep protein modest; a doctor should set the real number
  if (p.conditions.includes('kidney')) protein = Math.min(protein, weight * 0.8);
  // never more than 35% of calories from protein
  protein = Math.min(protein, (kcal * 0.35) / 4);

  const carbShare = p.conditions.includes('diabetes') ? 0.4 : 0.5;
  const fat = Math.round((kcal * (1 - carbShare) - protein * 4) / 9);
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);

  return {
    kcal: Math.round(kcal / 10) * 10,
    protein: Math.round(protein),
    carbs,
    fat,
    fiber: Math.round((kcal * 14) / 1000),
    waterL: Math.round((weight * 0.035) * 10) / 10,
  };
}

/** How many meals the household needs when set to "auto". */
export function autoMealCount(targets: Targets[]): number {
  const maxProtein = Math.max(...targets.map((t) => t.protein));
  const maxKcal = Math.max(...targets.map((t) => t.kcal));
  const n = Math.max(Math.ceil(maxProtein / 38), Math.ceil(maxKcal / 750));
  return Math.min(6, Math.max(3, n));
}

export function dishMacros(dish: Dish, ingredients = INGREDIENT_BY_ID): Macros {
  if (dish.macros && dish.items.length === 0) return dish.macros;
  const m: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const it of dish.items) {
    const ing = ingredients[it.ing];
    if (!ing) continue;
    const f = it.g / 100;
    m.kcal += ing.kcal * f;
    m.protein += ing.protein * f;
    m.carbs += ing.carbs * f;
    m.fat += ing.fat * f;
    m.fiber += ing.fiber * f;
  }
  return m;
}

/** Allergy-type flags count if present at all; GI/fat flags only when they dominate the dish. */
export function dishFlags(dish: Dish, ingredients = INGREDIENT_BY_ID): Set<Flag> {
  const flags = new Set<Flag>();
  const total = dishMacros(dish, ingredients);
  const kcalByFlag: Partial<Record<Flag, number>> = {};
  for (const it of dish.items) {
    const ing = ingredients[it.ing];
    if (!ing?.flags) continue;
    const kcal = (ing.kcal * it.g) / 100;
    for (const f of ing.flags) {
      if (f === 'high_gi' || f === 'high_fat') kcalByFlag[f] = (kcalByFlag[f] ?? 0) + kcal;
      else flags.add(f);
    }
  }
  if (total.kcal > 0) {
    if ((kcalByFlag.high_gi ?? 0) / total.kcal > 0.45) flags.add('high_gi');
    if ((total.fat * 9) / total.kcal > 0.45) flags.add('high_fat');
  }
  return flags;
}

/** Flags a condition forbids outright. */
export const HARD_EXCLUDE: Partial<Record<Condition, Flag>> = {
  lactose: 'dairy',
  gluten: 'gluten',
  peanut: 'peanut',
  soy: 'soy',
  nuts: 'nuts',
  no_onion_garlic: 'onion_garlic',
  diabetes: 'high_gi',
  bp: 'high_sodium',
  thyroid: 'soy',
};

/** Flags a condition only discourages. */
export const SOFT_AVOID: Partial<Record<Condition, Flag>> = {
  pcos: 'high_gi',
  cholesterol: 'high_fat',
};

export function excludedFlags(persons: Person[]): Set<Flag> {
  const out = new Set<Flag>();
  for (const p of persons)
    for (const c of p.conditions) {
      const f = HARD_EXCLUDE[c];
      if (f) out.add(f);
    }
  return out;
}

export function softFlags(persons: Person[]): Set<Flag> {
  const out = new Set<Flag>();
  for (const p of persons)
    for (const c of p.conditions) {
      const f = SOFT_AVOID[c];
      if (f) out.add(f);
    }
  return out;
}

/** Share of a meal's calories that come from fast-digesting (high-GI) ingredients. */
export function giShare(dishes: Dish[], ingredients = INGREDIENT_BY_ID): number {
  let total = 0;
  let gi = 0;
  for (const d of dishes)
    for (const it of d.items) {
      const ing = ingredients[it.ing];
      if (!ing) continue;
      const kcal = (ing.kcal * it.g) / 100;
      total += kcal;
      if (ing.flags?.includes('high_gi')) gi += kcal;
    }
  return total > 0 ? gi / total : 0;
}
