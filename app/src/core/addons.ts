export type AddonId = 'chai' | 'curd' | 'fruit' | 'nuts';

/** Small daily extras that are not part of the planned meals. Values are per person. */
export const ADDONS: { id: AddonId; label: string; kcal: number; protein: number }[] = [
  { id: 'chai', label: 'Chai / milk', kcal: 60, protein: 3 },
  { id: 'curd', label: 'Curd / chaas', kcal: 90, protein: 4 },
  { id: 'fruit', label: '1 fruit', kcal: 60, protein: 1 },
  { id: 'nuts', label: 'Nuts', kcal: 90, protein: 3 },
];

export type Addons = Record<AddonId, boolean>;
export const NO_ADDONS: Addons = { chai: false, curd: false, fruit: false, nuts: false };

export function addonTotals(on: Addons): { kcal: number; protein: number } {
  return ADDONS.filter((a) => on[a.id]).reduce((t, a) => ({ kcal: t.kcal + a.kcal, protein: t.protein + a.protein }), { kcal: 0, protein: 0 });
}
