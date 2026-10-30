export interface ListItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ShopList {
  id: string;
  name: string;
  items: ListItem[];
}

export const GROCERY = 'Grocery';
export const defaultLists = (): ShopList[] => [{ id: 'grocery', name: GROCERY, items: [] }];

export interface ListCommand {
  list: string;
  items: string[];
}

const GROCERY_WORDS = new Set(['grocery', 'grocory', 'grocary', 'groceries', 'shopping', 'bazaar', 'kirana', 'ration']);
const NOT_A_NAME = new Set(['add', 'the', 'my', 'our', 'new', 'a', 'to', 'in', 'into', 'on', 'for', 'please', 'also', 'and']);
const VERB = /^(?:please\s+|also\s+)*(?:add|put|buy|get|need|include|write|note|save)\b\s*/i;
// "to my grocery list", "in shopping list", "list:" ... the list word and the name before it
const LIST_WORD = /\b(?:(?:to|in|into|on|for)\s+)?(?:(?:my|the|our)\s+)?(?:([a-z]+)\s+)?lists?\b\s*[:\-]?/i;

const titled = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * Reads "add grocery list rice, daal, sugar" or "add rice and oil to my grocery list".
 * Only a message that names a list AND starts with a verb (or has a colon) counts, so meals are never mistaken for it.
 */
export function readListCommand(text: string): ListCommand | null {
  const t = text.trim();
  const m = LIST_WORD.exec(t);
  if (!m) return null;
  const named = (m[1] ?? '').toLowerCase();
  const name = !named || NOT_A_NAME.has(named) ? '' : named;
  const before = t.slice(0, m.index);
  const after = t.slice(m.index + m[0].length);
  const colon = /[:\-]/.test(m[0]);
  const rest = `${before} ${after}`.replace(/\s+/g, ' ').trim();
  const verbed = VERB.test(rest);
  if (!verbed && !colon) return null;
  const body = rest.replace(VERB, '').replace(/^(?:to|in|into|on)\s+/i, '').replace(/\s+(?:to|in|into|on)$/i, '');
  const seen = new Set<string>();
  const items: string[] = [];
  for (const raw of body.split(/,|;|\n|&|\+|\band\b|\baur\b/i)) {
    const w = raw.replace(/\s+/g, ' ').trim().replace(/^[-•*]\s*/, '');
    if (!w || NOT_A_NAME.has(w.toLowerCase())) continue;
    const k = w.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    items.push(titled(w));
  }
  if (!items.length) return null;
  const list = !name || GROCERY_WORDS.has(name) ? GROCERY : titled(name);
  return { list, items };
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

let counter = 0;
const nid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Adds items to the named list (made if it does not exist). Items already on it are not doubled. */
export function addToList(lists: ShopList[], name: string, items: string[]): { lists: ShopList[]; added: string[] } {
  const target = lists.find((l) => same(l.name, name));
  const base: ShopList = target ?? { id: nid(), name, items: [] };
  const added: string[] = [];
  const next = [...base.items];
  for (const text of items) {
    const old = next.find((i) => same(i.text, text));
    if (old) {
      if (old.done) {
        next[next.indexOf(old)] = { ...old, done: false };
        added.push(text);
      }
      continue;
    }
    next.push({ id: nid(), text, done: false });
    added.push(text);
  }
  const merged = { ...base, items: next };
  return { lists: target ? lists.map((l) => (l === target ? merged : l)) : [...lists, merged], added };
}

/** The list as plain text, to copy or share into a chat. */
export function listToText(l: ShopList): string {
  const open = l.items.filter((i) => !i.done).map((i) => `- ${i.text}`);
  const done = l.items.filter((i) => i.done).map((i) => `- ${i.text} (done)`);
  return [l.name, ...open, ...done].join('\n');
}

export function cleanLists(raw: unknown): ShopList[] {
  if (!Array.isArray(raw)) return defaultLists();
  const out: ShopList[] = [];
  for (const l of raw as Partial<ShopList>[]) {
    if (!l || typeof l.id !== 'string' || typeof l.name !== 'string' || !Array.isArray(l.items)) continue;
    const items = (l.items as Partial<ListItem>[]).filter((i) => i && typeof i.id === 'string' && typeof i.text === 'string').map((i) => ({ id: i.id as string, text: i.text as string, done: !!i.done }));
    out.push({ id: l.id, name: l.name, items });
  }
  return out.length ? out : defaultLists();
}
