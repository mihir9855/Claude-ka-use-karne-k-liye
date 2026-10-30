import { SLOT_LABEL, SLOT_ORDER, entryLabel, type Entry } from './diary';
import { cleanLists, type ShopList } from './lists';
import type { Person } from './profile';

export const BACKUP_APP = 'khana-diary';
export const BACKUP_FORMAT = 1;

export interface BackupData {
  entries: Entry[];
  persons: Person[];
  activeId: string;
  picks: Record<string, string>;
  /** lists are optional so backups made before they existed still load */
  lists?: ShopList[];
}

export interface Backup extends BackupData {
  app: typeof BACKUP_APP;
  format: number;
  appVersion: string;
  exportedAt: string;
}

/** Everything the app keeps, as one piece of text that can be copied, shared and pasted back in. */
export function makeBackup(data: BackupData, appVersion: string, now: Date = new Date()): string {
  const b: Backup = { app: BACKUP_APP, format: BACKUP_FORMAT, appVersion, exportedAt: now.toISOString(), ...data };
  return JSON.stringify(b, null, 1);
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type Parsed = { ok: true; data: Backup } | { ok: false; error: string };

/** Reads pasted backup text. Anything that does not look right is refused with a reason, never half loaded. */
export function parseBackup(text: string): Parsed {
  let raw: unknown;
  try {
    raw = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: 'That is not a backup. Paste the whole text you copied.' };
  }
  const b = raw as Partial<Backup> | null;
  if (!b || typeof b !== 'object' || b.app !== BACKUP_APP) return { ok: false, error: 'This backup is not from Khana Diary.' };
  if (!isNum(b.format) || b.format > BACKUP_FORMAT) return { ok: false, error: 'This backup comes from a newer version. Update the app first.' };
  if (!Array.isArray(b.persons) || b.persons.length === 0) return { ok: false, error: 'The backup has no profiles.' };
  if (!Array.isArray(b.entries)) return { ok: false, error: 'The backup has no meals list.' };
  const persons: Person[] = [];
  for (const p of b.persons as Partial<Person>[]) {
    if (!p || !isStr(p.id) || !isStr(p.name) || !isNum(p.age) || !isNum(p.heightCm) || !isNum(p.weightKg) || !Array.isArray(p.conditions)) return { ok: false, error: 'A profile in the backup is damaged.' };
    if (p.sex !== 'male' && p.sex !== 'female') return { ok: false, error: 'A profile in the backup is damaged.' };
    persons.push(p as Person);
  }
  const entries: Entry[] = [];
  for (const e of b.entries as Partial<Entry>[]) {
    if (!e || !isStr(e.id) || !isStr(e.name) || !isStr(e.key) || !isStr(e.date) || !DATE.test(e.date) || !SLOT_ORDER.includes(e.slot as never)) return { ok: false, error: 'A meal in the backup is damaged.' };
    entries.push(e as Entry);
  }
  const activeId = isStr(b.activeId) && persons.some((p) => p.id === b.activeId) ? b.activeId : persons[0].id;
  const picks: Record<string, string> = {};
  if (b.picks && typeof b.picks === 'object') for (const [k, v] of Object.entries(b.picks)) if (isStr(v)) picks[k] = v;
  return { ok: true, data: { app: BACKUP_APP, format: b.format, appVersion: isStr(b.appVersion) ? b.appVersion : '', exportedAt: isStr(b.exportedAt) ? b.exportedAt : '', entries, persons, activeId, picks, lists: cleanLists(b.lists) } };
}

const csv = (v: string | number | null | undefined) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Every meal as one row, to open in a spreadsheet. */
export function entriesToCsv(entries: Entry[], persons: Person[]): string {
  const name = (e: Entry) => persons.find((p) => p.id === (e.pid ?? persons[0]?.id))?.name.trim() || 'Me';
  const rows = [['date', 'time', 'person', 'meal', 'dish', 'count', 'kcal', 'protein_g', 'carbs_g', 'fat_g', 'fibre_g'].join(',')];
  const sorted = [...entries].sort((a, b) => (a.date === b.date ? (a.at ?? 0) - (b.at ?? 0) : a.date < b.date ? -1 : 1));
  for (const e of sorted) {
    const time = e.at ? new Date(e.at).toTimeString().slice(0, 5) : '';
    rows.push([e.date, time, name(e), SLOT_LABEL[e.slot], entryLabel(e), e.qty ?? '', e.kcal, e.protein, e.carbs, e.fat, e.fiber].map((v) => csv(v as never)).join(','));
  }
  return rows.join('\n');
}
