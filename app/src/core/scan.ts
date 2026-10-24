import { INGREDIENTS } from '../data/ingredients';
import { matchIngredients } from './match';

type Fetch = typeof fetch;

export interface BarcodeResult {
  found: boolean;
  name?: string;
  ids: string[];
}

/** Look a packet up in Open Food Facts (free, no key) and map it to pantry items. */
export async function lookupBarcode(code: string, fetchFn: Fetch = fetch): Promise<BarcodeResult> {
  const clean = code.replace(/\D/g, '');
  if (clean.length < 8) return { found: false, ids: [] };
  const url = `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=product_name,generic_name,categories_tags`;
  const res = await fetchFn(url, { headers: { 'User-Agent': 'HamariThali/1.0 (personal meal planner)' } });
  if (!res.ok) throw new Error(`lookup ${res.status}`);
  const json = (await res.json()) as {
    status?: number;
    product?: { product_name?: string; generic_name?: string; categories_tags?: string[] };
  };
  if (json.status !== 1 || !json.product) return { found: false, ids: [] };
  const p = json.product;
  const cats = (p.categories_tags ?? []).map((c) => c.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')).join(' ');
  const name = p.product_name || p.generic_name || '';
  // the product's own name is the strongest signal; categories only fill in when the name says nothing
  const ids = matchIngredients(`${name} ${p.generic_name ?? ''}`);
  return { found: true, name, ids: ids.length ? ids : matchIngredients(cats) };
}

const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest'];

export class ScanError extends Error {
  constructor(public kind: 'key' | 'limit' | 'network' | 'bad', message: string) {
    super(message);
  }
}

/** Ask Gemini (free tier) which pantry items are visible in a photo or listed on a bill. */
export async function detectItemsFromImage(
  opts: { base64: string; mime?: string; apiKey: string },
  fetchFn: Fetch = fetch,
): Promise<string[]> {
  const catalog = INGREDIENTS.filter((i) => !i.basic).map((i) => `${i.id} = ${i.name.en}`).join('\n');
  const prompt =
    'This is a photo of groceries, a fridge, a shelf or a grocery bill from an Indian home. ' +
    'List which of the items below are clearly visible or written. Use ONLY the ids given. ' +
    'Do not guess items you cannot see. Reply as JSON: {"items": ["id", ...]}\n\n' +
    catalog;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: opts.mime || 'image/jpeg', data: opts.base64 } }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  });

  let res: Response | undefined;
  for (const model of MODELS) {
    try {
      res = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': opts.apiKey },
        body,
      });
    } catch {
      throw new ScanError('network', 'network');
    }
    if (res.status !== 404) break; // 404 = model name retired, try the next one
  }
  if (!res) throw new ScanError('network', 'network');
  if (res.status === 400 || res.status === 401 || res.status === 403) throw new ScanError('key', `key ${res.status}`);
  if (res.status === 429) throw new ScanError('limit', 'limit');
  if (!res.ok) throw new ScanError('bad', `status ${res.status}`);

  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return parseItems(text);
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
