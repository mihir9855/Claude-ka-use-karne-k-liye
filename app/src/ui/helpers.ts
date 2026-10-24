import { INGREDIENT_BY_ID } from '../data/ingredients';
import type { Dish, Lang } from '../core/types';

export const dishName = (d: Dish | undefined, lang: Lang) => (d ? d.name[lang] || d.name.en : '?');
export const ingName = (id: string, lang: Lang) => INGREDIENT_BY_ID[id]?.name[lang] ?? id;
export const r = (n: number) => Math.round(n);
