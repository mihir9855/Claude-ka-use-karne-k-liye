import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { makeEntry, newBatch, sampleEntries, type Entry, type SlotId } from '../core/diary';
import type { BackupData } from '../core/backup';
import type { LookId } from '../ui/theme';
import { addToList, defaultLists, type ShopList } from '../core/lists';
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
  /** light, dark, or follow the phone */
  theme: 'system' | 'dark' | 'light';
  /** colour theme id, see ACCENTS */
  accent: string;
  /** whole-app design, see LOOKS */
  look: LookId;
  /** folder (Android SAF uri) where backups are saved, remembered after the first pick */
  saveDir: string;
  /** false until the welcome and the first questions are done */
  onboarded: boolean;
  /** dishes swapped into the week menu, keyed "date|slot" */
  picks: Record<string, string>;
  /** grocery and other lists */
  lists: ShopList[];

  /** type the names of what was eaten; each becomes one entry in the active person's diary */
  add: (names: string[], slot: SlotId, date: string) => void;
  /** dishes that each name their own meal, as read from one chat message; one chat bubble per meal */
  addItems: (items: { name: string; slot: SlotId; qty?: number }[], date: string) => void;
  remove: (id: string) => void;
  removeBatch: (batch: string) => void;
  setPick: (key: string, name: string | null) => void;
  clearPicks: () => void;
  setTheme: (t: 'system' | 'dark' | 'light') => void;
  setAccent: (id: string) => void;
  setLook: (id: LookId) => void;
  setSaveDir: (dir: string) => void;
  /** replace everything with a backup that was checked by parseBackup */
  restore: (data: BackupData) => void;
  setOnboarded: (v: boolean) => void;
  setActive: (id: string) => void;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  addPerson: () => void;
  removePerson: (id: string) => void;
  loadSample: () => void;
  clearSample: () => void;
  clearAll: () => void;
  /** put items on a list by name (made if new); returns what was really added */
  addListItems: (name: string, items: string[]) => string[];
  toggleListItem: (listId: string, itemId: string) => void;
  removeListItem: (listId: string, itemId: string) => void;
  clearDoneItems: (listId: string) => void;
  addList: (name: string) => void;
  removeList: (listId: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      persons: [newPerson(FIRST_ID, '')],
      activeId: FIRST_ID,
      onboarded: false,
      theme: 'system',
      accent: 'mono',
      look: 'classic',
      saveDir: '',
      picks: {},
      lists: defaultLists(),
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
            return makeEntry(it.name, it.slot, date, false, at + i, batch, s.activeId, it.qty);
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
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setLook: (look) => set({ look }),
      setSaveDir: (saveDir) => set({ saveDir }),
      restore: (d) => set({ entries: d.entries, persons: d.persons, activeId: d.activeId, picks: d.picks, lists: d.lists ?? defaultLists(), onboarded: true }),
      setOnboarded: (onboarded) => set({ onboarded }),
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
      clearAll: () => set({ entries: [], picks: {}, lists: defaultLists(), persons: [newPerson(FIRST_ID, '')], activeId: FIRST_ID, onboarded: false }),
      addListItems: (name, items) => {
        const r = addToList(get().lists, name, items);
        set({ lists: r.lists });
        return r.added;
      },
      toggleListItem: (listId, itemId) => set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) } : l)) })),
      removeListItem: (listId, itemId) => set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l)) })),
      clearDoneItems: (listId) => set((s) => ({ lists: s.lists.map((l) => (l.id === listId ? { ...l, items: l.items.filter((i) => !i.done) } : l)) })),
      addList: (name) =>
        set((s) => {
          const n = name.trim();
          if (!n || s.lists.some((l) => l.name.toLowerCase() === n.toLowerCase())) return {};
          return { lists: [...s.lists, { id: uid(), name: n, items: [] }] };
        }),
      removeList: (listId) => set((s) => ({ lists: s.lists.filter((l) => l.id !== listId) })),
    }),
    {
      name: 'khana-diary-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ entries, persons, activeId, picks, onboarded, theme, accent, look, saveDir, lists }) => ({ entries, persons, activeId, picks, onboarded, theme, accent, look, saveDir, lists }) as State,
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
