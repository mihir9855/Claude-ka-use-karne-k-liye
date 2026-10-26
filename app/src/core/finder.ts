import { INGREDIENT_BY_ID, INGREDIENTS } from '../data/ingredients';
import { dishFlags, dishMacros, excludedFlags } from './nutrition';
import { firstJson, gemini, normalizeNutrition, NUTRITION_SHAPE, type Nutrition } from './scan';
import type { Cuisine, Dish, DishRole, Flag, MealCategory, Person } from './types';

type Fetch = typeof fetch;

const ROLES: DishRole[] = ['complete', 'main', 'staple', 'side', 'snack'];
const MEALS: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const CUISINES: Cuisine[] = ['north', 'west', 'south', 'east', 'northeast', 'continental', 'indochinese'];

export interface Suggestion {
  name: { en: string; hi: string; gu: string };
  role: DishRole;
  meals: MealCategory[];
  cuisine: Cuisine;
  /** ingredients from the list, by id, grams for one person */
  items: { ing: string; g: number }[];
  /** ingredients not in the list, with their own nutrition per 100 g */
  extras: (Nutrition & { name: string; g: number })[];
}

const FLAG_WORDS: Partial<Record<Flag, string>> = {
  dairy: 'dairy (milk, curd, paneer, ghee, butter, cheese)',
  gluten: 'gluten (wheat, maida, suji, pasta, bread)',
  peanut: 'peanuts',
  soy: 'soy (tofu, soya chunks)',
  nuts: 'tree nuts (almonds, cashew)',
  onion_garlic: 'onion and garlic',
  high_gi: 'rice, potato, sugar, maida (fast-digesting carbs)',
  high_sodium: 'very salty foods like papad',
};

/** The words for the foods that must not appear, taken from the family's health limits. */
export function avoidWords(persons: Person[]): string[] {
  return [...excludedFlags(persons)].map((f) => FLAG_WORDS[f]).filter((x): x is string => !!x);
}

/** Foods outside the ingredient list carry no flags, so their names are checked against the family's limits. */
const NAME_RULES: Partial<Record<Flag, RegExp>> = {
  dairy: /milk|curd|dahi|paneer|ghee|butter|cheese|cream|khoya|mawa|yogurt|yoghurt|lassi|chaas|buttermilk/i,
  gluten: /wheat|atta|maida|bread|pasta|noodle|suji|semolina|rava|seviyan|vermicelli|dalia|barley/i,
  nuts: /almond|cashew|pista|walnut|badam|kaju|hazelnut|pecan/i,
  peanut: /peanut|groundnut|moongfali|singdana/i,
  soy: /soy|tofu|soya/i,
  onion_garlic: /onion|garlic|pyaaz|lehsun|shallot/i,
};
const extraViolates = (name: string, banned: Set<Flag>) => [...banned].some((f) => NAME_RULES[f]?.test(name));

/** What the model should know: the exact ingredient ids it may use. */
function catalog(): string {
  return INGREDIENTS.filter((i) => !i.basic || ['oil', 'salt', 'sugar'].includes(i.id)).map((i) => `${i.id}=${i.name.en}`).join(', ');
}

/** Ask Gemini (free tier) for up to three new vegetarian dishes. */
export async function findDishes(
  opts: { request: string; apiKey: string; avoid: string[]; homeStock?: string[] },
  fetchFn: Fetch = fetch,
): Promise<Suggestion[]> {
  const prompt =
    'You are an Indian home-cooking nutritionist. Suggest 3 different VEGETARIAN dishes (no egg, fish or meat) for this request: ' +
    `"${opts.request.slice(0, 200)}". ` +
    (opts.avoid.length ? `Never use: ${opts.avoid.join('; ')}. ` : '') +
    (opts.homeStock?.length ? `Prefer these items that are at home: ${opts.homeStock.join(', ')}. ` : '') +
    'Use ONLY these ingredient ids where possible: ' + catalog() + '. ' +
    'If a needed ingredient is not in that list, put it in "extras" with nutrition. Amounts are grams for ONE person, raw. ' +
    'role is one of ' + ROLES.join('|') + ' (complete = a whole meal on its own, main = sabzi or dal, staple = roti or rice, side, snack). ' +
    'meals is a list from ' + MEALS.join('|') + '. cuisine is one of ' + CUISINES.join('|') + '. ' +
    'Give name_en, name_hi (Hindi in Latin letters) and name_gu (Gujarati script). ' +
    `Reply as JSON: {"dishes":[{"name_en":"","name_hi":"","name_gu":"","role":"","meals":[],"cuisine":"","items":[{"id":"","g":0}],"extras":[{"name":"","g":0,${NUTRITION_SHAPE}}]}]}`;
  const text = await gemini([{ text: prompt }], opts.apiKey, fetchFn);
  return parseSuggestions(text, opts.avoid.length ? excludedFlagsFromWords(opts.avoid) : new Set());
}

function excludedFlagsFromWords(words: string[]): Set<Flag> {
  const out = new Set<Flag>();
  for (const [flag, text] of Object.entries(FLAG_WORDS) as [Flag, string][]) if (words.includes(text)) out.add(flag);
  return out;
}

/** A dish made of the suggestion, for checking numbers and health flags. */
export function toDish(s: Suggestion, extraId = (i: number) => `tmp_${i}`): Dish {
  return {
    id: 'suggestion',
    name: s.name,
    role: s.role,
    meals: s.meals,
    cuisine: s.cuisine,
    items: [...s.items, ...s.extras.map((e, i) => ({ ing: extraId(i), g: e.g }))],
  };
}

/**
 * The model's dishes that are safe to show: real ingredient ids, believable amounts,
 * believable calories and protein, and none of the foods the family must avoid.
 */
export function parseSuggestions(text: string, banned: Set<Flag> = new Set()): Suggestion[] {
  const raw = (firstJson(text) as { dishes?: unknown } | null)?.dishes;
  if (!Array.isArray(raw)) return [];
  const out: Suggestion[] = [];
  for (const d of raw.slice(0, 5)) {
    const o = d as Record<string, unknown>;
    const en = typeof o.name_en === 'string' ? o.name_en.trim().slice(0, 60) : '';
    if (!en) continue;
    const role = ROLES.includes(o.role as DishRole) ? (o.role as DishRole) : null;
    const meals = Array.isArray(o.meals) ? (o.meals.filter((m) => MEALS.includes(m as MealCategory)) as MealCategory[]) : [];
    if (!role || meals.length === 0) continue;

    const items: Suggestion['items'] = [];
    for (const it of Array.isArray(o.items) ? o.items : []) {
      const row = it as { id?: unknown; g?: unknown };
      if (typeof row.id !== 'string' || !INGREDIENT_BY_ID[row.id] || typeof row.g !== 'number') continue;
      if (row.g <= 0 || row.g > 400 || items.some((x) => x.ing === row.id)) continue;
      items.push({ ing: row.id, g: Math.round(row.g) });
    }
    const extras: Suggestion['extras'] = [];
    let violates = false;
    for (const ex of Array.isArray(o.extras) ? o.extras : []) {
      const e = ex as { name?: unknown; g?: unknown };
      const nut = normalizeNutrition(ex);
      if (typeof e.name !== 'string' || !e.name.trim() || typeof e.g !== 'number' || e.g <= 0 || e.g > 400 || !nut) continue;
      if (extraViolates(e.name, banned)) {
        violates = true;
        continue;
      }
      extras.push({ ...nut, name: e.name.trim().slice(0, 40), g: Math.round(e.g) });
    }
    if (violates || items.length + extras.length < 2 || items.length + extras.length > 14) continue;

    const s: Suggestion = {
      name: {
        en,
        hi: typeof o.name_hi === 'string' && o.name_hi.trim() ? o.name_hi.trim().slice(0, 60) : en,
        gu: typeof o.name_gu === 'string' && o.name_gu.trim() ? o.name_gu.trim().slice(0, 60) : en,
      },
      role,
      meals,
      cuisine: CUISINES.includes(o.cuisine as Cuisine) ? (o.cuisine as Cuisine) : 'north',
      items,
      extras,
    };
    // numbers for one serving, with the extras counted through a temporary ingredient table
    const table = { ...INGREDIENT_BY_ID };
    extras.forEach((e, i) => {
      table[`tmp_${i}`] = { id: `tmp_${i}`, name: { en: e.name, hi: e.name, gu: e.name }, group: e.group, kcal: e.kcal, protein: e.protein, carbs: e.carbs, fat: e.fat, fiber: e.fiber };
    });
    const dish = toDish(s);
    const m = dishMacros(dish, table);
    const light = role === 'side' || /soup|salad|raita|chaas/i.test(en);
    if (m.kcal < (light ? 20 : 60) || m.kcal > 1000 || m.protein > 70) continue;
    if ([...dishFlags(dish, table)].some((f) => banned.has(f))) continue;
    out.push(s);
  }
  return out;
}
