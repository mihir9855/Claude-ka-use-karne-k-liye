import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { todayStr } from '../core/dates';
import { generateDayPlan, regenerateSlot, type PlanInput } from '../core/planner';
import type { ShoppingList } from '../core/shopping';
import { setCustomIngredients, GROUP_DEFAULTS } from '../data/ingredients';
import type { DayPlan, Dish, Ingredient, DishPref, Lang, LogEntry, Pantry, Person, Slot } from '../core/types';
import { BUILTIN_DISHES } from '../data/dishes';

export const MAX_MEMBERS = 6;

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
  onboarded: boolean;
  /** Google Gemini key for photo detection, kept only on this device */
  geminiKey: string;
  persons: Person[];
  mealCount: number | 'auto';
  strictPantry: boolean;
  pantry: Pantry;
  /** things to buy: id -> grams (0 = unknown) */
  shopping: ShoppingList;
  customDishes: Dish[];
  customIngredients: Ingredient[];
  prefs: Record<string, DishPref>;
  log: LogEntry[];
  plans: Record<string, DayPlan>;
  saltByDate: Record<string, number>;
  /** last delete, kept briefly so it can be undone (not saved to disk) */
  undoSnapshot:
    | { kind: 'person'; persons: Person[]; plans: Record<string, DayPlan> }
    | { kind: 'dish'; customDishes: Dish[] }
    | null;

  undoDelete: () => void;
  clearUndo: () => void;
  setLang: (l: Lang) => void;
  setOnboarded: (v: boolean) => void;
  setGeminiKey: (k: string) => void;
  addToPantry: (ids: string[]) => void;
  togglePantry: (ing: string) => void;
  updatePerson: (i: number, patch: Partial<Person>) => void;
  setMemberCount: (n: number) => void;
  addPerson: () => void;
  removePerson: (i: number) => void;
  setMealCount: (n: number | 'auto') => void;
  setStrictPantry: (v: boolean) => void;
  cyclePantry: (ing: string) => void;
  addToShopping: (items: { id: string; g?: number }[]) => void;
  removeFromShopping: (id: string) => void;
  markBought: (id: string) => void;
  clearPantry: () => void;
  addIngredient: (name: string, group: Ingredient['group'], nutrition?: Partial<Pick<Ingredient, 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber'>>, to?: 'have' | 'buy') => void;
  removeIngredient: (id: string) => void;
  addDish: (d: Omit<Dish, 'id' | 'custom'>) => string;
  removeDish: (id: string) => void;
  setPref: (id: string, pref: DishPref | undefined) => void;
  makePlan: (date?: string) => void;
  reshuffleSlot: (date: string, slotIndex: number) => void;
  choose: (date: string, slotIndex: number, optionIndex: number) => void;
  logMeal: (date: string, slot: Slot, dishIds: string[]) => void;
  unlog: (id: string) => void;
}

/** Phone storage, falling back to memory when the browser blocks it, so the app still opens. */
const memory = new Map<string, string>();
const safeStorage = {
  getItem: async (k: string) => {
    try {
      return await AsyncStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  setItem: async (k: string, v: string) => {
    try {
      await AsyncStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
  removeItem: async (k: string) => {
    try {
      await AsyncStorage.removeItem(k);
    } catch {
      memory.delete(k);
    }
  },
};

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      lang: 'hi',
      onboarded: false,
      geminiKey: '',
      persons: [newPerson('', 'male'), newPerson('', 'female')],
      mealCount: 'auto',
      strictPantry: true,
      pantry: { have: {}, soon: {} },
      shopping: {},
      customDishes: [],
      customIngredients: [],
      prefs: {},
      log: [],
      plans: {},
      saltByDate: {},
      undoSnapshot: null,

      undoDelete: () =>
        set((s) => {
          const u = s.undoSnapshot;
          if (!u) return {};
          return u.kind === 'person'
            ? { persons: u.persons, plans: u.plans, undoSnapshot: null }
            : { customDishes: u.customDishes, undoSnapshot: null };
        }),
      clearUndo: () => set({ undoSnapshot: null }),
      setLang: (lang) => set({ lang }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setGeminiKey: (geminiKey) => set({ geminiKey: geminiKey.trim() }),
      addToPantry: (ids) =>
        set((s) => ({ pantry: { ...s.pantry, have: { ...s.pantry.have, ...Object.fromEntries(ids.map((id) => [id, true])) } } })),
      togglePantry: (ing) =>
        set((s) => {
          const have = { ...s.pantry.have };
          const soon = { ...s.pantry.soon };
          if (have[ing]) {
            delete have[ing];
            delete soon[ing];
          } else have[ing] = true;
          return { pantry: { have, soon } };
        }),
      updatePerson: (i, patch) =>
        set((s) => {
          const persons = [...s.persons];
          persons[i] = { ...persons[i], ...patch };
          return { persons };
        }),
      // plans store one entry per member, so they are rebuilt when the family size changes
      setMemberCount: (n) =>
        set((s) => {
          const count = Math.min(MAX_MEMBERS, Math.max(1, n));
          if (count === s.persons.length) return {};
          const persons = s.persons.slice(0, count);
          while (persons.length < count) persons.push(newPerson('', persons.length % 2 === 0 ? 'male' : 'female'));
          return { persons, plans: {} };
        }),
      addPerson: () => get().setMemberCount(get().persons.length + 1),
      removePerson: (i) =>
        set((s) =>
          s.persons.length <= 1
            ? {}
            : {
                undoSnapshot: { kind: 'person', persons: s.persons, plans: s.plans },
                persons: s.persons.filter((_, k) => k !== i),
                plans: {},
              },
        ),
      setMealCount: (mealCount) => set({ mealCount }),
      setStrictPantry: (strictPantry) => set({ strictPantry }),
      // tap: have -> use first -> finished (leaves the pantry and goes on the shopping list)
      cyclePantry: (ing) =>
        set((s) => {
          const have = { ...s.pantry.have };
          const soon = { ...s.pantry.soon };
          if (!have[ing]) {
            have[ing] = true;
            return { pantry: { have, soon } };
          }
          if (!soon[ing]) {
            soon[ing] = true;
            return { pantry: { have, soon } };
          }
          delete have[ing];
          delete soon[ing];
          return { pantry: { have, soon }, shopping: { ...s.shopping, [ing]: s.shopping[ing] ?? 0 } };
        }),
      addToShopping: (items) =>
        set((s) => {
          const shopping = { ...s.shopping };
          for (const { id, g } of items) shopping[id] = Math.max(shopping[id] ?? 0, g ?? 0);
          return { shopping };
        }),
      removeFromShopping: (id) =>
        set((s) => {
          const shopping = { ...s.shopping };
          delete shopping[id];
          return { shopping };
        }),
      // bought: off the list, into the pantry
      markBought: (id) =>
        set((s) => {
          const shopping = { ...s.shopping };
          delete shopping[id];
          return { shopping, pantry: { ...s.pantry, have: { ...s.pantry.have, [id]: true } } };
        }),
      clearPantry: () => set({ pantry: { have: {}, soon: {} } }),
      addIngredient: (name, group, nutrition, to = 'have') => {
        const n = name.trim();
        if (!n) return;
        const id = `x_${uid()}`;
        const ing: Ingredient = { id, name: { en: n, hi: n, gu: n }, group, ...GROUP_DEFAULTS[group], ...nutrition };
        const customIngredients = [...get().customIngredients, ing];
        setCustomIngredients(customIngredients);
        set((s) =>
          to === 'buy'
            ? { customIngredients, shopping: { ...s.shopping, [id]: 0 } }
            : { customIngredients, pantry: { ...s.pantry, have: { ...s.pantry.have, [id]: true } } },
        );
      },
      removeIngredient: (id) => {
        const customIngredients = get().customIngredients.filter((i) => i.id !== id);
        setCustomIngredients(customIngredients);
        set((s) => {
          const have = { ...s.pantry.have };
          const soon = { ...s.pantry.soon };
          delete have[id];
          delete soon[id];
          const shopping = { ...s.shopping };
          delete shopping[id];
          return { customIngredients, shopping, pantry: { have, soon } };
        });
      },
      addDish: (d) => {
        const id = `c_${uid()}`;
        set((s) => ({ customDishes: [...s.customDishes, { ...d, id, custom: true }] }));
        return id;
      },
      removeDish: (id) =>
        set((s) => ({
          undoSnapshot: { kind: 'dish', customDishes: s.customDishes },
          customDishes: s.customDishes.filter((d) => d.id !== id),
        })),
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
        const fresh = generateDayPlan(planInput(s, date, salt));
        // meals already eaten today stay as they were
        const old = s.plans[date];
        const eatenSlots = new Set(s.log.filter((e) => e.date === date).map((e) => e.slot));
        const plan = old
          ? {
              ...fresh,
              slots: fresh.slots.map((sp) => {
                const prev = old.slots.find((o) => o.slot === sp.slot);
                return prev && eatenSlots.has(sp.slot) ? prev : sp;
              }),
            }
          : fresh;
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
      // custom pantry items must be registered before any screen reads the ingredient lists
      onRehydrateStorage: () => (state) => {
        if (state?.customIngredients) setCustomIngredients(state.customIngredients);
      },
      partialize: ({ undoSnapshot: _u, ...rest }) => rest as State,
      storage: createJSONStorage(() => safeStorage),
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
