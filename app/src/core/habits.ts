import { daysBetween } from './dates';
import type { Dish, LogEntry } from './types';

export interface HabitStat {
  /** times eaten in the last 30 days */
  count30: number;
  /** days since last eaten (Infinity if never) */
  daysAgo: number;
}

/** What we actually eat: counts and recency per dish, from the meal log. */
export function habitStats(log: LogEntry[], today: string): Map<string, HabitStat> {
  const map = new Map<string, HabitStat>();
  for (const e of log) {
    const ago = daysBetween(e.date, today);
    if (ago < 0) continue;
    for (const id of e.dishIds) {
      const s = map.get(id) ?? { count30: 0, daysAgo: Infinity };
      if (ago <= 30) s.count30 += 1;
      s.daysAgo = Math.min(s.daysAgo, ago);
      map.set(id, s);
    }
  }
  return map;
}

/** Often-eaten dishes get a bonus; very recent ones are held back for variety. */
export function habitScore(stat: HabitStat | undefined): number {
  if (!stat) return 0;
  const freq = Math.min(1.2, 0.25 * stat.count30);
  const recent = [-3, -1.5, -0.8, -0.4][stat.daysAgo] ?? 0;
  return freq + recent;
}

/** How many times two dishes were eaten in the same meal. */
export function pairCounts(log: LogEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of log) {
    const ids = [...e.dishIds].sort();
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const k = `${ids[i]}|${ids[j]}`;
        map.set(k, (map.get(k) ?? 0) + 1);
      }
  }
  return map;
}

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Most-eaten dishes, for the "our usual foods" view. */
export function topDishes(log: LogEntry[], dishes: Dish[], limit = 8): { dish: Dish; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of log) for (const id of e.dishIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const byId = new Map(dishes.map((d) => [d.id, d]));
  return [...counts.entries()]
    .map(([id, count]) => ({ dish: byId.get(id)!, count }))
    .filter((x) => x.dish)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
