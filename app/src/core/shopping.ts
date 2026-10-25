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

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A printable page: title, date, and each category as a block with a tick box per item. */
export function shoppingHtml(
  groups: AisleGroup[],
  aisleName: (a: Aisle) => string,
  title: string,
  gramUnit: string,
  date: string,
): string {
  const blocks = groups
    .map(
      (g) =>
        `<h2>${esc(aisleName(g.aisle))} <span>${g.items.length}</span></h2><ul>` +
        g.items
          .map((it) => `<li><i></i>${esc(it.name)}${it.grams > 0 ? `<b>${it.grams} ${esc(gramUnit)}</b>` : ''}</li>`)
          .join('') +
        '</ul>',
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:sans-serif;color:#161614;padding:8px}
h1{font-size:22px;margin:0 0 2px}p{margin:0 0 14px;color:#8A8A83;font-size:12px}
h2{font-size:14px;margin:16px 0 4px;padding-bottom:3px;border-bottom:1px solid #ccc;text-transform:uppercase;letter-spacing:.5px}
h2 span{color:#8A8A83;font-weight:normal}
ul{list-style:none;margin:0;padding:0}li{display:flex;align-items:center;gap:10px;padding:5px 0;font-size:15px}
i{display:inline-block;width:13px;height:13px;border:1.5px solid #1B7F55;border-radius:3px}
b{margin-left:auto;font-weight:normal;color:#555}
</style></head><body><h1>${esc(title)}</h1><p>${esc(date)}</p>${blocks}</body></html>`;
}
