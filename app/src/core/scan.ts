import type { Ingredient } from './types';
import { INGREDIENTS } from '../data/ingredients';
import { matchIngredients } from './match';

type Fetch = typeof fetch;

export interface BarcodeResult {
  found: boolean;
  name?: string;
  ids: string[];
  /** the packet's own printed nutrition per 100 g, when the database has it */
  nutrition?: Nutrition;
}

/** Look a packet up in Open Food Facts (free, no key) and map it to pantry items. */
export async function lookupBarcode(code: string, fetchFn: Fetch = fetch): Promise<BarcodeResult> {
  const clean = code.replace(/\D/g, '');
  if (clean.length < 8) return { found: false, ids: [] };
  const url = `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=product_name,generic_name,categories_tags,nutriments`;
  const res = await fetchFn(url, { headers: { 'User-Agent': 'HamariThali/1.0 (personal meal planner)' } });
  if (!res.ok) throw new Error(`lookup ${res.status}`);
  const json = (await res.json()) as {
    status?: number;
    product?: { product_name?: string; generic_name?: string; categories_tags?: string[]; nutriments?: Record<string, number> };
  };
  if (json.status !== 1 || !json.product) return { found: false, ids: [] };
  const p = json.product;
  const cats = (p.categories_tags ?? []).map((c) => c.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')).join(' ');
  const name = p.product_name || p.generic_name || '';
  // the product's own name is the strongest signal; categories only fill in when the name says nothing
  const ids = matchIngredients(`${name} ${p.generic_name ?? ''}`);
  const x = p.nutriments ?? {};
  const nutrition =
    normalizeNutrition({ group: 'other', kcal: x['energy-kcal_100g'], protein: x['proteins_100g'], carbs: x['carbohydrates_100g'], fat: x['fat_100g'], fiber: x['fiber_100g'] ?? 0 }) ?? undefined;
  return { found: true, name, ids: ids.length ? ids : matchIngredients(cats), ...(nutrition ? { nutrition } : {}) };
}

const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest'];

export class ScanError extends Error {
  constructor(public kind: 'key' | 'limit' | 'network' | 'bad', message: string) {
    super(message);
  }
}

/** Short text from Google's error body, so a failure says what really happened. */
async function reason(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { message?: string } };
    return (j.error?.message ?? '').slice(0, 160);
  } catch {
    return '';
  }
}

export type Part = { text: string } | { inline_data: { mime_type: string; data: string } };

/** One Gemini call (free tier). Returns the model's text, or throws a ScanError saying what went wrong. */
export async function gemini(parts: Part[], apiKey: string, fetchFn: Fetch = fetch): Promise<string> {
  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  });
  let res: Response | undefined;
  for (const model of MODELS) {
    try {
      res = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body,
      });
    } catch (e) {
      throw new ScanError('network', String((e as Error)?.message ?? 'network'));
    }
    if (res.status !== 404) break; // 404 = model name retired, try the next one
  }
  if (!res) throw new ScanError('network', 'network');
  if (res.status === 429) throw new ScanError('limit', `429 ${await reason(res)}`);
  if (res.status === 401 || res.status === 403) throw new ScanError('key', `${res.status} ${await reason(res)}`);
  if (res.status === 400) {
    const why = await reason(res);
    // 400 is also used for an invalid key, but other 400s are about the request itself
    throw new ScanError(/api key|API_KEY/i.test(why) ? 'key' : 'bad', `400 ${why}`);
  }
  if (!res.ok) throw new ScanError('bad', `${res.status} ${await reason(res)}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

const GROUPS: Ingredient['group'][] = ['grain', 'flour', 'pulse', 'dairy', 'leafy', 'root', 'veg', 'fruit', 'nut', 'fat', 'other'];

export interface Nutrition {
  group: Ingredient['group'];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const NUTRITION_SHAPE =
  '"group": one of ' + GROUPS.join('|') + ', "kcal": number, "protein": number, "carbs": number, "fat": number, "fiber": number (all per 100 g, as bought/raw)';

/** Accept a model's numbers only when they are plausible for 100 g of food. */
export function normalizeNutrition(o: unknown): Nutrition | null {
  if (!o || typeof o !== 'object') return null;
  const r = o as Record<string, unknown>;
  const n = (k: string) => (typeof r[k] === 'number' && Number.isFinite(r[k]) ? (r[k] as number) : NaN);
  const kcal = n('kcal');
  const protein = n('protein');
  const carbs = n('carbs');
  const fat = n('fat');
  const fiber = Number.isNaN(n('fiber')) ? 0 : n('fiber');
  if ([kcal, protein, carbs, fat].some(Number.isNaN)) return null;
  if (kcal < 0 || kcal > 950 || protein < 0 || protein > 100 || carbs < 0 || carbs > 100 || fat < 0 || fat > 100) return null;
  if (fiber < 0 || fiber > 60 || protein + carbs + fat > 105) return null;
  const group = GROUPS.includes(r.group as Ingredient['group']) ? (r.group as Ingredient['group']) : 'other';
  const round = (x: number) => Math.round(x * 10) / 10;
  return { group, kcal: Math.round(kcal), protein: round(protein), carbs: round(carbs), fat: round(fat), fiber: round(fiber) };
}

export function firstJson(text: string): unknown {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

export type NutritionSource = 'ai' | 'web' | 'estimate';
export interface NutritionResult extends Nutrition {
  source: NutritionSource;
}

/** Packaged-food database lookup by name (free, no key). Used when there is no Gemini key. */
async function searchOpenFoodFacts(name: string, fetchFn: Fetch): Promise<Nutrition | null> {
  const url =
    'https://world.openfoodfacts.org/cgi/search.pl?json=1&page_size=5&fields=product_name,nutriments&search_terms=' +
    encodeURIComponent(name);
  const res = await fetchFn(url, { headers: { 'User-Agent': 'HamariThali/1.0 (personal meal planner)' } });
  if (!res.ok) return null;
  const j = (await res.json()) as { products?: { nutriments?: Record<string, number> }[] };
  const rows = (j.products ?? [])
    .map((p) => p.nutriments ?? {})
    .map((x) => ({ kcal: x['energy-kcal_100g'], protein: x['proteins_100g'], carbs: x['carbohydrates_100g'], fat: x['fat_100g'], fiber: x['fiber_100g'] ?? 0 }))
    .filter((x) => [x.kcal, x.protein, x.carbs, x.fat].every((v) => typeof v === 'number'));
  if (rows.length === 0) return null;
  // the median of a few matches beats trusting one noisy entry
  const med = (k: 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber') => {
    const v = rows.map((r) => Number(r[k])).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };
  return normalizeNutrition({ group: 'other', kcal: med('kcal'), protein: med('protein'), carbs: med('carbs'), fat: med('fat'), fiber: med('fiber') });
}

/**
 * Nutrition for a food typed by name. Order: Gemini (understands Hindi/Gujarati/Hinglish names),
 * then Open Food Facts, else null so the caller can fall back to a shelf average.
 */
export async function lookupNutrition(
  name: string,
  apiKey: string | undefined,
  fetchFn: Fetch = fetch,
): Promise<NutritionResult | null> {
  const clean = name.trim().slice(0, 80);
  if (!clean) return null;
  if (apiKey) {
    const prompt =
      `Food item from an Indian kitchen, named "${clean}" (the name may be in Hindi, Gujarati or Hinglish). ` +
      `Give typical nutrition for it. Reply as JSON: {${NUTRITION_SHAPE}}`;
    const out = normalizeNutrition(firstJson(await gemini([{ text: prompt }], apiKey, fetchFn)));
    if (out) return { ...out, source: 'ai' };
  }
  try {
    const out = await searchOpenFoodFacts(clean, fetchFn);
    if (out) return { ...out, source: 'web' };
  } catch {
    /* offline: caller falls back */
  }
  return null;
}

export interface PhotoResult {
  /** items from the built-in list */
  ids: string[];
  /** other food seen that is not in the list, with nutrition */
  extras: (Nutrition & { name: string })[];
}

/** Ask Gemini (free tier) which foods are visible in a photo or listed on a bill. */
export async function detectItemsFromImage(
  opts: { base64: string; mime?: string; apiKey: string },
  fetchFn: Fetch = fetch,
): Promise<PhotoResult> {
  const catalog = INGREDIENTS.filter((i) => !i.basic && !i.id.startsWith('x_')).map((i) => `${i.id} = ${i.name.en}`).join('\n');
  const prompt =
    'This is a photo of groceries, a fridge, a shelf or a grocery bill from an Indian home. ' +
    'Part 1: list which of the items below are clearly visible or written, using ONLY the ids given. ' +
    'Part 2: list other food items clearly visible or written that are NOT in the list, at most 8, ' +
    'each with an English name and nutrition. Do not guess items you cannot see. ' +
    `Reply as JSON: {"items": ["id"], "others": [{"name": "...", ${NUTRITION_SHAPE}}]}\n\n` +
    catalog;
  const text = await gemini(
    [{ text: prompt }, { inline_data: { mime_type: opts.mime || 'image/jpeg', data: opts.base64 } }],
    opts.apiKey,
    fetchFn,
  );
  return { ids: parseItems(text), extras: parseExtras(text) };
}

/** Valid "others" from the model's reply; entries with implausible numbers are dropped. */
export function parseExtras(text: string): (Nutrition & { name: string })[] {
  const raw = (firstJson(text) as { others?: unknown } | null)?.others;
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: (Nutrition & { name: string })[] = [];
  for (const o of raw) {
    const name = typeof (o as { name?: unknown })?.name === 'string' ? (o as { name: string }).name.trim().slice(0, 60) : '';
    const nut = normalizeNutrition(o);
    if (!name || !nut || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({ name, ...nut });
  }
  return out.slice(0, 8);
}

/** Pull valid pantry ids out of the model's reply, tolerating code fences and extra words. */
export function parseItems(text: string): string[] {
  const valid = new Set(INGREDIENTS.filter((i) => !i.basic).map((i) => i.id));
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const items = (JSON.parse(match[0]) as { items?: unknown }).items;
    if (!Array.isArray(items)) return [];
    return [...new Set(items.filter((x): x is string => typeof x === 'string' && valid.has(x)))];
  } catch {
    return [];
  }
}
