export type Lang = 'en' | 'hi' | 'gu';
export type L10n = Record<Lang, string>;

export type Sex = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active';
export type Goal = 'fat_loss' | 'muscle_gain' | 'maintain';

export type Condition =
  | 'diabetes'
  | 'bp'
  | 'thyroid'
  | 'pcos'
  | 'cholesterol'
  | 'lactose'
  | 'gluten'
  | 'kidney'
  | 'peanut'
  | 'soy'
  | 'nuts'
  | 'no_onion_garlic';

export type Flag =
  | 'dairy'
  | 'gluten'
  | 'peanut'
  | 'soy'
  | 'nuts'
  | 'onion_garlic'
  | 'high_gi'
  | 'high_sodium'
  | 'high_fat';

export type Slot = 'breakfast' | 'midmorning' | 'lunch' | 'evening' | 'dinner' | 'bedtime';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DishRole = 'complete' | 'main' | 'staple' | 'side' | 'snack';

export interface Person {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  conditions: Condition[];
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  id: string;
  name: L10n;
  group: 'grain' | 'pulse' | 'dairy' | 'veg' | 'fruit' | 'fat' | 'nut' | 'other';
  /** per 100 g, raw */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  flags?: Flag[];
  /** assumed always in the kitchen (oil, masala) */
  basic?: boolean;
}

export interface DishItem {
  ing: string;
  g: number;
}

export interface Dish {
  id: string;
  name: L10n;
  role: DishRole;
  meals: MealCategory[];
  items: DishItem[];
  custom?: boolean;
  /** used when a custom dish has no ingredient list */
  macros?: Macros;
}

export interface Pantry {
  have: Record<string, boolean>;
  /** use these first (about to spoil) */
  soon: Record<string, boolean>;
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  slot: Slot;
  dishIds: string[];
}

export type DishPref = 'like' | 'dislike';

export interface MealOption {
  dishIds: string[];
  /** servings multiplier for each person */
  servings: number[];
  kcal: number[];
  protein: number[];
  coverage: number;
}

export interface SlotPlan {
  slot: Slot;
  targets: { kcal: number; protein: number }[];
  options: MealOption[];
  chosen?: number;
}

export interface DayPlan {
  date: string;
  mealCount: number;
  slots: SlotPlan[];
}
