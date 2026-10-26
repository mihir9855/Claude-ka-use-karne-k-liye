import { INGREDIENT_BY_ID } from '../data/ingredients';
import type { Dish, Lang } from '../core/types';

export const dishName = (d: Dish | undefined, lang: Lang) => (d ? d.name[lang] || d.name.en : '?');
export const ingName = (id: string, lang: Lang) => INGREDIENT_BY_ID[id]?.name[lang] ?? id;
export const r = (n: number) => Math.round(n);

const WEEKDAYS: Record<Lang, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['Ravi', 'Som', 'Mangal', 'Budh', 'Guru', 'Shukra', 'Shani'],
  gu: ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'],
};
const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  hi: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  gu: ['જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઑગસ્ટ', 'સપ્ટે', 'ઑક્ટો', 'નવે', 'ડિસે'],
};

/** "Mon, 26 Oct" in the chosen language. */
export function dateLabel(date: string, lang: Lang): { day: string; month: string; weekday: string } {
  const [y, m, d] = date.split('-').map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { day: String(d), month: MONTHS[lang][m - 1], weekday: WEEKDAYS[lang][w] };
}
