import { INGREDIENT_BY_ID } from '../data/ingredients';
import type { Dish } from './types';

export type DishArtKey =
  | 'riceBowl'
  | 'rotiStack'
  | 'dalBowl'
  | 'paneerBowl'
  | 'veggiePan'
  | 'fruitBowl'
  | 'glass'
  | 'dosa'
  | 'idli'
  | 'soup'
  | 'snackTri'
  | 'salad'
  | 'ladoo';

const has = (id: string, ...words: string[]) => words.some((w) => id.includes(w));
/** Whole-word match on the id parts, for short words that hide inside others (bar in sambar, dal in dalia). */
const tok = (id: string, ...words: string[]) => id.split('_').some((p) => words.includes(p));

/** Which picture suits a dish, from its name, type and what it is made of. */
export function artFor(dish: Dish): DishArtKey {
  const id = dish.id;
  let total = 0;
  const by: Record<string, number> = {};
  const used = new Set<string>();
  for (const it of dish.items) {
    const ing = INGREDIENT_BY_ID[it.ing];
    if (!ing || ing.basic) continue;
    total += it.g;
    by[ing.group] = (by[ing.group] ?? 0) + it.g;
    used.add(it.ing);
  }
  const share = (g: string) => (total ? (by[g] ?? 0) / total : 0);
  const grams = (...ids: string[]) => dish.items.filter((i) => ids.includes(i.ing)).reduce((a, i) => a + i.g, 0);

  if (has(id, 'idli', 'dhokla', 'khaman', 'handvo', 'muthia', 'appam', 'puttu', 'idiyappam')) return 'idli';
  if (has(id, 'dosa', 'chilla', 'uttapam', 'pesarattu')) return 'dosa';
  if (dish.role === 'snack' && (grams('milk', 'curd') >= 150 || has(id, 'lassi', 'shake', 'smoothie', 'juice', 'milk', 'chaas', 'doodh'))) return 'glass';
  if (has(id, 'chaas') && dish.role === 'side') return 'glass';
  if (has(id, 'soup')) return 'soup';
  if (dish.tags?.includes('sweet') || has(id, 'ladoo', 'laddu', 'chikki') || tok(id, 'bar')) return 'ladoo';
  if (share('fruit') >= 0.6) return 'fruitBowl';
  if (has(id, 'samosa', 'pakoda', 'vada', 'cutlet', 'spring_roll', 'tikka', 'khakhra', 'puri', 'bhatura')) return 'snackTri';
  if (has(id, 'salad', 'sprouts_', 'chaat', 'bhel', 'kosambari', 'sambharo', 'raita', 'hummus')) return 'salad';
  if (dish.staple === 'bread' || (dish.role === 'staple' && !dish.staple) || has(id, 'roti', 'paratha', 'thepla', 'naan', 'kulcha', 'wrap', 'sandwich', 'toast', 'phulka', 'rotla') || tok(id, 'roll')) return 'rotiStack';
  if (dish.staple === 'rice' || has(id, 'rice', 'pulao', 'biryani', 'khichdi', 'khichuri', 'pongal', 'poha', 'upma') || tok(id, 'bath')) return 'riceBowl';
  if (grams('paneer', 'tofu') >= 60) return 'paneerBowl';
  if (share('pulse') >= 0.3 || tok(id, 'dal') || has(id, 'sambar', 'rasam', 'kadhi', 'rajma', 'chole', 'usal', 'curry')) return 'dalBowl';
  return 'veggiePan';
}
