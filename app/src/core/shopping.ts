import type { Ingredient, Lang } from './types';

/** Store-aisle order, like walking through a supermarket. */
export type Aisle = 'veg' | 'fruit' | 'dairy' | 'pulse' | 'staple' | 'dry' | 'oil' | 'other';
export const AISLES: Aisle[] = ['veg', 'fruit', 'dairy', 'pulse', 'staple', 'dry', 'oil', 'other'];

const AISLE_OF: Record<Ingredient['group'], Aisle> = {
  leafy: 'veg',
  root: 'veg',
  veg: 'veg',
  fruit: 'fruit',
  dairy: 'dairy',
  pulse: 'pulse',
  grain: 'staple',
  flour: 'staple',
  nut: 'dry',
  fat: 'oil',
  other: 'other',
};

export const aisleOf = (ing: Ingredient): Aisle => AISLE_OF[ing.group] ?? 'other';

/** id -> grams needed (0 when the quantity is not known) */
export type ShoppingList = Record<string, number>;

export interface AisleGroup {
  aisle: Aisle;
  items: { id: string; name: string; grams: number }[];
}

/** The list split by aisle, empty aisles left out, items sorted by name. */
export function groupShopping(list: ShoppingList, byId: Record<string, Ingredient>, lang: Lang): AisleGroup[] {
  const groups = new Map<Aisle, AisleGroup['items']>();
  for (const [id, grams] of Object.entries(list)) {
    const ing = byId[id];
    if (!ing) continue;
    const a = aisleOf(ing);
    const arr = groups.get(a) ?? [];
    arr.push({ id, name: ing.name[lang] || ing.name.en, grams });
    groups.set(a, arr);
  }
  return AISLES.filter((a) => groups.has(a)).map((aisle) => ({
    aisle,
    items: groups.get(aisle)!.sort((x, y) => x.name.localeCompare(y.name)),
  }));
}

/** Plain text of the list, ready to send on WhatsApp. */
export function shoppingText(groups: AisleGroup[], aisleName: (a: Aisle) => string, title: string, gramUnit: string): string {
  const lines = [title];
  for (const g of groups) {
    lines.push('', aisleName(g.aisle));
    for (const it of g.items) lines.push(`• ${it.name}${it.grams > 0 ? ` – ${it.grams} ${gramUnit}` : ''}`);
  }
  return lines.join('\n');
}
