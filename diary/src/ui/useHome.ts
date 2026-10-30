import { useMemo, useState } from 'react';
import { SLOT_TIME, addDays, streak, todayMenu, totalsFor, upcomingMeals, ymd, type SlotId } from '../core/diary';
import { personName, useActive, useStore } from '../state/store';

export const clock = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
export const slotClock = (s: SlotId) => clock(new Date(2000, 0, 1, SLOT_TIME[s][0], SLOT_TIME[s][1]));
export const greeting = (h: number) => (h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');

export function inText(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min <= 5) return 'Now';
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `in ${h} h ${m} min` : `in ${h} h`;
}

export function dayLabel(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

/** Everything the home screens of every look show, so each look only draws it. */
export function useHome() {
  const { person, target, entries } = useActive();
  const persons = useStore((s) => s.persons);
  const add = useStore((s) => s.add);
  const picks = useStore((s) => s.picks);
  const [pick, setPick] = useState<Record<string, number>>({});
  const now = new Date();
  const today = ymd(now);
  const tot = totalsFor(entries, today);
  const logged = entries.filter((e) => e.date === today);
  const menu = useMemo(() => todayMenu(entries, target, new Date(), person.conditions), [entries, target, person.conditions]);
  const upcoming = useMemo(() => upcomingMeals(entries, target, picks, new Date(), person.conditions, 5), [entries, target, picks, person.conditions]);
  const nextRow = menu.find((x) => !x.eaten && !x.missed && x.options.length > 0);
  const optOf = (slot: SlotId) => {
    const row = menu.find((m) => m.slot === slot);
    if (!row || row.options.length === 0) return undefined;
    return row.options[(pick[slot] ?? 0) % row.options.length];
  };
  return {
    now, today, target, tot, logged, menu, upcoming, nextRow, optOf,
    nextOpt: nextRow ? optOf(nextRow.slot) : undefined,
    cycle: (slot: SlotId) => setPick((p) => ({ ...p, [slot]: (p[slot] ?? 0) + 1 })),
    eat: (slot: SlotId) => {
      const o = optOf(slot);
      if (o) add(o.items, slot, today);
    },
    days: streak(entries),
    name: personName(person, persons.indexOf(person)),
    left: target.kcal - tot.kcal,
  };
}
export type Home = ReturnType<typeof useHome>;
