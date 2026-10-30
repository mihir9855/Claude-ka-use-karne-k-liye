import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { makeEntry, newBatch, sampleEntries, type Entry, type SlotId } from '../core/diary';
import { MAX_PEOPLE, computeTargets, newPerson, type Person, type Target } from '../core/profile';

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

export const FIRST_ID = 'me';
const uid = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

interface State {
  entries: Entry[];
  persons: Person[];
  activeId: string;
  /** dishes swapped into the week menu, keyed "date|slot" */
  picks: Record<string, string>;

  /** type the names of what was eaten; each becomes one entry in the active person's diary */
  add: (names: string[], slot: SlotId, date: string) => void;
  /** dishes that each name their own meal, as read from one chat message; one chat bubble per meal */
  addItems: (items: { name: string; slot: SlotId }[], date: string) => void;
  remove: (id: string) => void;
  removeBatch: (batch: string) => void;
  setPick: (key: string, name: string | null) => void;
  clearPicks: () => void;
  setActive: (id: string) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  addPerson: () => void;
  removePerson: (id: string) => void;
  loadSample: () => void;
  clearSample: () => void;
  clearAll: () => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      persons: [newPerson(FIRST_ID, '')],
      activeId: FIRST_ID,
      picks: {},
      add: (names, slot, date) =>
        set((s) => {
          const batch = newBatch();
          const at = Date.now();
          return { entries: [...s.entries, ...names.map((n) => makeEntry(n, slot, date, false, at, batch, s.activeId))] };
        }),
      addItems: (items, date) =>
        set((s) => {
          const at = Date.now();
          const batches = new Map<SlotId, string>();
          const added = items.map((it, i) => {
            const batch = batches.get(it.slot) ?? newBatch();
            batches.set(it.slot, batch);
            return makeEntry(it.name, it.slot, date, false, at + i, batch, s.activeId);
          });
          return { entries: [...s.entries, ...added] };
        }),
      remove: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
      removeBatch: (batch) => set((s) => ({ entries: s.entries.filter((e) => e.batch !== batch) })),
      setPick: (key, name) =>
        set((s) => {
          const picks = { ...s.picks };
          if (name) picks[key] = name;
          else delete picks[key];
          return { picks };
        }),
      clearPicks: () => set({ picks: {} }),
      setActive: (activeId) => set({ activeId }),
      updatePerson: (id, patch) => set((s) => ({ persons: s.persons.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      addPerson: () =>
        set((s) => {
          if (s.persons.length >= MAX_PEOPLE) return {};
          const p = newPerson(uid(), '');
          return { persons: [...s.persons, p], activeId: p.id };
        }),
      removePerson: (id) =>
        set((s) => {
          if (s.persons.length <= 1) return {};
          const persons = s.persons.filter((p) => p.id !== id);
          return { persons, entries: s.entries.filter((e) => (e.pid ?? FIRST_ID) !== id), activeId: s.activeId === id ? persons[0].id : s.activeId };
        }),
      loadSample: () => set((s) => ({ entries: [...s.entries.filter((e) => !(e.sample && (e.pid ?? FIRST_ID) === s.activeId)), ...sampleEntries().map((e) => ({ ...e, pid: s.activeId }))] })),
      clearSample: () => set((s) => ({ entries: s.entries.filter((e) => !e.sample) })),
      clearAll: () => set({ entries: [], picks: {}, persons: [newPerson(FIRST_ID, '')], activeId: FIRST_ID }),
    }),
    {
      name: 'khana-diary-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ entries, persons, activeId, picks }) => ({ entries, persons, activeId, picks }) as State,
    },
  ),
);

/** The active person, their targets and their own diary. */
export function useActive(): { person: Person; target: Target; entries: Entry[] } {
  const persons = useStore((s) => s.persons);
  const activeId = useStore((s) => s.activeId);
  const all = useStore((s) => s.entries);
  const person = persons.find((p) => p.id === activeId) ?? persons[0];
  const target = useMemo(() => computeTargets(person), [person]);
  const entries = useMemo(() => all.filter((e) => (e.pid ?? FIRST_ID) === person.id), [all, person.id]);
  return { person, target, entries };
}

export const personName = (p: Person, i = 0) => p.name.trim() || (i === 0 ? 'Me' : `Person ${i + 1}`);
