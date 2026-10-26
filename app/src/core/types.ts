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
export type Cuisine = 'north' | 'west' | 'south' | 'east' | 'northeast' | 'continental' | 'indochinese';
export type DishTag = 'fried' | 'quick' | 'sweet';

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
  fiber: number;
}

export interface Ingredient {
  id: string;
  name: L10n;
  group: 'grain' | 'flour' | 'pulse' | 'dairy' | 'leafy' | 'root' | 'veg' | 'fruit' | 'nut' | 'fat' | 'other';
  /** per 100 g, raw */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** g per 100 g */
  fiber: number;
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
  /** where the dish comes from, for cuisine preferences */
  cuisine?: Cuisine;
  tags?: DishTag[];
  /** for roti-or-rice rules on staples */
  staple?: 'rice' | 'bread';
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

/** How the week is planned: simple switches instead of free text. */
export interface PlanRules {
  /** which staple goes with lunch and dinner */
  stapleRule: 'any' | 'rice' | 'bread' | 'alternate';
  avoidFried: boolean;
  avoidSweet: boolean;
  /** prefer quick dishes Monday to Friday */
  quickWeekdays: boolean;
}

export interface MenuPrefs {
  /** cuisines whose dishes are in My Menu; empty means all */
  cuisines: Cuisine[];
  /** up to two cuisines cooked most weeks; these are preferred */
  usual: Cuisine[];
  /** dishes taken out of My Menu */
  menuOff: Record<string, true>;
  /** let dishes from other cuisines appear now and then */
  includeNew: boolean;
}
