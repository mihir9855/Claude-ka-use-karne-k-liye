import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { todayStr } from '../core/dates';
import { generateDayPlan, regenerateSlot, type PlanInput } from '../core/planner';
import type { DayPlan, Dish, DishPref, Lang, LogEntry, Pantry, Person, Slot } from '../core/types';
import { BUILTIN_DISHES } from '../data/dishes';

const newPerson = (name: string, sex: Person['sex']): Person => ({
  name,
  sex,
  age: 30,
  heightCm: sex === 'male' ? 170 : 158,
  weightKg: sex === 'male' ? 70 : 58,
  activity: 'light',
  goal: 'maintain',
  conditions: [],
});

interface State {
  lang: Lang;
  persons: [Person, Person];
  mealCount: number | 'auto';
  strictPantry: boolean;
  pantry: Pantry;
  customDishes: Dish[];
  prefs: Record<string, DishPref>;
  log: LogEntry[];
  plans: Record<string, DayPlan>;
  saltByDate: Record<string, number>;

  setLang: (l: Lang) => void;
  updatePerson: (i: 0 | 1, patch: Partial<Person>) => void;
  setMealCount: (n: number | 'auto') => void;
  setStrictPantry: (v: boolean) => void;
  cyclePantry: (ing: string) => void;
  clearPantry: () => void;
  addDish: (d: Omit<Dish, 'id' | 'custom'>) => string;
  removeDish: (id: string) => void;
  setPref: (id: string, pref: DishPref | undefined) => void;
  makePlan: (date?: string) => void;
  reshuffleSlot: (date: string, slotIndex: number) => void;
  choose: (date: string, slotIndex: number, optionIndex: number) => void;
  logMeal: (date: string, slot: Slot, dishIds: string[]) => void;
  unlog: (id: string) => void;
}

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: 'hi',
      persons: [newPerson('Me', 'male'), newPerson('Wife', 'female')],
      mealCount: 'auto',
      strictPantry: true,
      pantry: { have: {}, soon: {} },
      customDishes: [],
      prefs: {},
      log: [],
      plans: {},
      saltByDate: {},

      setLang: (lang) => set({ lang }),
      updatePerson: (i, patch) =>
        set((s) => {
          const persons = [...s.persons] as State['persons'];
          persons[i] = { ...persons[i], ...patch };
          return { persons };
        }),
      setMealCount: (mealCount) => set({ mealCount }),
      setStrictPantry: (strictPantry) => set({ strictPantry }),
      cyclePantry: (ing) =>
        set((s) => {
          const have = { ...s.pantry.have };
          const soon = { ...s.pantry.soon };
          if (!have[ing]) have[ing] = true;
          else if (!soon[ing]) soon[ing] = true;
          else {
            delete have[ing];
            delete soon[ing];
          }
          return { pantry: { have, soon } };
        }),
      clearPantry: () => set({ pantry: { have: {}, soon: {} } }),
      addDish: (d) => {
        const id = `c_${uid()}`;
        set((s) => ({ customDishes: [...s.customDishes, { ...d, id, custom: true }] }));
        return id;
      },
      removeDish: (id) =>
        set((s) => ({ customDishes: s.customDishes.filter((d) => d.id !== id) })),
      setPref: (id, pref) =>
        set((s) => {
          const prefs = { ...s.prefs };
          if (pref) prefs[id] = pref;
          else delete prefs[id];
          return { prefs };
        }),

      makePlan: (date = todayStr()) => {
        const s = get();
        const salt = (s.saltByDate[date] ?? -1) + 1;
        const plan = generateDayPlan(planInput(s, date, salt));
        set({ plans: { ...s.plans, [date]: plan }, saltByDate: { ...s.saltByDate, [date]: salt } });
      },
      reshuffleSlot: (date, slotIndex) => {
        const s = get();
        const plan = s.plans[date];
        if (!plan) return;
        const salt = (s.saltByDate[date] ?? 0) + 1;
        const next = regenerateSlot(plan, slotIndex, planInput(s, date, salt), salt);
        set({ plans: { ...s.plans, [date]: next }, saltByDate: { ...s.saltByDate, [date]: salt } });
      },
      choose: (date, slotIndex, optionIndex) =>
        set((s) => {
          const plan = s.plans[date];
          if (!plan) return {};
          const slots = plan.slots.map((sp, i) => (i === slotIndex ? { ...sp, chosen: optionIndex } : sp));
          return { plans: { ...s.plans, [date]: { ...plan, slots } } };
        }),
      logMeal: (date, slot, dishIds) =>
        set((s) => ({ log: [...s.log, { id: uid(), date, slot, dishIds }] })),
      unlog: (id) => set((s) => ({ log: s.log.filter((e) => e.id !== id) })),
    }),
    {
      name: 'our-thali-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function allDishes(customDishes: Dish[]): Dish[] {
  return [...BUILTIN_DISHES, ...customDishes];
}

function planInput(s: State, date: string, salt: number): PlanInput {
  return {
    date,
    persons: s.persons,
    mealCount: s.mealCount,
    dishes: allDishes(s.customDishes),
    pantry: s.pantry,
    log: s.log,
    prefs: s.prefs,
    strictPantry: s.strictPantry,
    salt,
  };
}
