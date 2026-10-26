import type { Cuisine, Dish, DishRole, DishTag, MealCategory } from '../core/types';

/** items are "ingredientId:grams" for ONE serving (raw weights) */
export function d(
  id: string,
  en: string,
  hi: string,
  gu: string,
  role: DishRole,
  meals: MealCategory[],
  items: string[],
  cuisine: Cuisine = 'north',
  tags?: DishTag[],
  staple?: 'rice' | 'bread',
): Dish {
  return {
    id,
    name: { en, hi, gu },
    role,
    meals,
    items: items.map((s) => {
      const [ing, g] = s.split(':');
      return { ing, g: Number(g) };
    }),
    cuisine,
    ...(tags ? { tags } : {}),
    ...(staple ? { staple } : {}),
  };
}
