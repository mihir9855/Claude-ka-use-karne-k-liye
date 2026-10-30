export type Sex = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Condition = 'diabetes' | 'bp' | 'thyroid' | 'pcos' | 'cholesterol' | 'kidney' | 'lactose' | 'gluten';

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'bp', label: 'High BP' },
  { id: 'thyroid', label: 'Thyroid' },
  { id: 'pcos', label: 'PCOS' },
  { id: 'cholesterol', label: 'Cholesterol' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'lactose', label: 'No dairy' },
  { id: 'gluten', label: 'No gluten' },
];

export const ACTIVITIES: { id: Activity; label: string; sub: string; factor: number }[] = [
  { id: 'sedentary', label: 'Sedentary', sub: 'Desk job, little exercise', factor: 1.2 },
  { id: 'light', label: 'Lightly active', sub: 'Light exercise 1 to 3 days a week', factor: 1.375 },
  { id: 'moderate', label: 'Moderately active', sub: 'Exercise or sport 3 to 5 days', factor: 1.55 },
  { id: 'active', label: 'Very active', sub: 'Hard exercise or a physical job', factor: 1.725 },
];

export const GOALS: { id: Goal; label: string; sub: string }[] = [
  { id: 'lose', label: 'Lose weight', sub: 'A gentle calorie deficit' },
  { id: 'maintain', label: 'Maintain weight', sub: 'Stay where you are' },
  { id: 'gain', label: 'Gain lean mass', sub: 'More protein and calories' },
];

export interface Person {
  id: string;
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  conditions: Condition[];
}

export interface Target {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const MAX_PEOPLE = 6;

export function newPerson(id: string, name = ''): Person {
  return { id, name, sex: 'male', age: 30, heightCm: 170, weightKg: 70, activity: 'light', goal: 'maintain', conditions: [] };
}

/** Daily targets from the profile: Mifflin-St Jeor, an activity factor, then the goal. */
export function computeTargets(p: Person): Target {
  const w = Math.max(p.weightKg, 30);
  const h = Math.max(p.heightCm, 120);
  const a = Math.min(Math.max(p.age, 5), 90);
  const bmr = 10 * w + 6.25 * h - 5 * a + (p.sex === 'male' ? 5 : -161);
  const factor = ACTIVITIES.find((x) => x.id === p.activity)?.factor ?? 1.375;
  const tdee = bmr * factor;
  let kcal = p.goal === 'lose' ? Math.max(tdee * 0.8, bmr) : p.goal === 'gain' ? tdee * 1.1 : tdee;
  kcal = Math.round(kcal / 10) * 10;
  const perKg = p.goal === 'lose' ? 1.2 : p.goal === 'gain' ? 1.4 : 0.9;
  let protein = w * perKg;
  if (p.conditions.includes('kidney')) protein = Math.min(protein, w * 0.8); // kidney patients are kept to a lower protein intake
  if (p.age < 18) protein = Math.max(w * 1.0, 30);
  protein = Math.round(protein);
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const fiber = Math.round((14 * kcal) / 1000 + (p.conditions.includes('diabetes') ? 5 : 0));
  return { kcal, protein, carbs, fat, fiber };
}

/* ---------- health rules applied to dish names and numbers ---------- */

const DAIRY = /paneer|curd|dahi|milk|doodh|lassi|chaas|raita|kadhi|ghee|butter|cheese|kheer|shrikhand|malai|cream|yogurt|kulfi/i;
const GLUTEN = /roti|chapati|phulka|paratha|thepla|puri|naan|kulcha|bhatura|bhakri|sandwich|pasta|noodle|upma|dalia|rava|sooji|semolina|bread|wrap|pav|burger|macaroni|manchurian|spring roll|uttapam|khakhra/i;

/** Dishes ruled out by "no dairy" or "no gluten", judged from the dish name. */
export function allowed(name: string, conditions: Condition[]): boolean {
  if (conditions.includes('lactose') && DAIRY.test(name)) return false;
  if (conditions.includes('gluten') && GLUTEN.test(name)) return false;
  return true;
}

/** A score change for a dish given the person's conditions: heavy carbs for diabetes, heavy fat for cholesterol. */
export function conditionScore(carbs: number | null | undefined, fat: number | null | undefined, kcal: number | null | undefined, conditions: Condition[]): number {
  let s = 0;
  if ((conditions.includes('diabetes') || conditions.includes('pcos')) && carbs != null && carbs > 55) s -= 1.2;
  if (conditions.includes('cholesterol') && fat != null && fat > 18) s -= 1.2;
  if (conditions.includes('bp') && kcal != null && kcal > 600) s -= 0.5;
  return s;
}
