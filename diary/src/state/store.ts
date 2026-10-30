import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { makeEntry, sampleEntries, type Entry, type SlotId, type Target } from '../core/diary';

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

export const DEFAULT_TARGET: Target = { kcal: 2000, protein: 60 };

interface State {
  entries: Entry[];
  target: Target;
  /** type the names of what was eaten; each becomes one entry */
  add: (names: string[], slot: SlotId, date: string) => void;
  remove: (id: string) => void;
  setTarget: (patch: Partial<Target>) => void;
  loadSample: () => void;
  clearSample: () => void;
  clearAll: () => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      entries: [],
      target: DEFAULT_TARGET,
      add: (names, slot, date) => set((s) => ({ entries: [...s.entries, ...names.map((n) => makeEntry(n, slot, date))] })),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      setTarget: (patch) => set((s) => ({ target: { ...s.target, ...patch } })),
      loadSample: () => set((s) => ({ entries: [...s.entries.filter((e) => !e.sample), ...sampleEntries()] })),
      clearSample: () => set((s) => ({ entries: s.entries.filter((e) => !e.sample) })),
      clearAll: () => set({ entries: [], target: DEFAULT_TARGET }),
    }),
    {
      name: 'khana-diary-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ entries, target }) => ({ entries, target }) as State,
    },
  ),
);
