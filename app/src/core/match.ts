import { INGREDIENTS } from '../data/ingredients';

// Words a packet, bill or product name might use for each pantry item.
const EXTRA: Record<string, string[]> = {
  atta: ['atta', 'wheat flour', 'whole wheat flour', 'chakki', 'gehu'],
  rice: ['rice', 'basmati', 'chawal', 'sona masoori'],
  poha: ['poha', 'flattened rice', 'beaten rice'],
  bajra: ['bajra', 'pearl millet'],
  jowar: ['jowar', 'sorghum'],
  oats: ['oats', 'oatmeal'],
  suji: ['suji', 'semolina', 'rava', 'sooji'],
  bread: ['bread'],
  moong_dal: ['moong dal', 'mung dal', 'moong', 'mung bean', 'green gram'],
  toor_dal: ['toor', 'tur dal', 'arhar', 'pigeon pea'],
  chana_dal: ['chana dal', 'bengal gram', 'split chickpea'],
  masoor_dal: ['masoor', 'red lentil', 'lentil'],
  rajma: ['rajma', 'kidney bean'],
  chole: ['chole', 'kabuli', 'chickpea', 'garbanzo', 'chana'],
  besan: ['besan', 'gram flour', 'chickpea flour'],
  sprouts: ['sprouts', 'sprouted'],
  roasted_chana: ['roasted chana', 'bhuna chana', 'roasted gram'],
  sattu: ['sattu'],
  soya_chunks: ['soya chunk', 'soy chunk', 'nutrela', 'meal maker', 'soya granule', 'textured soy'],
  tofu: ['tofu'],
  paneer: ['paneer', 'cottage cheese'],
  curd: ['curd', 'dahi', 'yogurt', 'yoghurt'],
  milk: ['milk', 'doodh'],
  whey: ['whey', 'protein powder', 'protein isolate'],
  ghee: ['ghee', 'clarified butter'],
  peanuts: ['peanut', 'groundnut', 'moongfali'],
  almonds: ['almond', 'badam'],
  makhana: ['makhana', 'fox nut', 'lotus seed'],
  aloo: ['potato', 'aloo', 'batata'],
  matar: ['green peas', 'matar', 'peas'],
  tomato: ['tomato', 'tamatar'],
  onion: ['onion', 'pyaaz', 'kanda'],
  garlic: ['garlic', 'lehsun', 'lasan'],
  palak: ['spinach', 'palak'],
  methi: ['fenugreek', 'methi'],
  cauliflower: ['cauliflower', 'gobi', 'phool gobi'],
  cabbage: ['cabbage', 'patta gobi'],
  brinjal: ['brinjal', 'eggplant', 'baingan'],
  bhindi: ['okra', 'bhindi', 'lady finger'],
  lauki: ['bottle gourd', 'lauki', 'dudhi'],
  carrot: ['carrot', 'gajar'],
  capsicum: ['capsicum', 'bell pepper', 'shimla'],
  cucumber: ['cucumber', 'kheera', 'kakdi'],
  beans: ['french bean', 'beans', 'fansi'],
  banana: ['banana', 'kela'],
  apple: ['apple', 'seb'],
  papad: ['papad'],
};

// Packaged foods that merely mention an ingredient are not that ingredient.
const NOT_STAPLE = ['chocolate', 'biscuit', 'cookie', 'cake', 'chips', 'noodle', 'sauce', 'ice cream', 'drink', 'juice', 'candy', 'namkeen', 'soap'];

const KEYWORDS: [id: string, keyword: string][] = INGREDIENTS.flatMap((i) => {
  const words = new Set([...(EXTRA[i.id] ?? []), i.name.en.toLowerCase(), i.name.hi.toLowerCase()]);
  return [...words].filter((w) => w.length >= 3 && /^[a-z ]+$/.test(w)).map((w): [string, string] => [i.id, w]);
});

/** Pantry item ids mentioned in free text (product name, categories, a bill line). The most specific wording wins. */
export function matchIngredients(text: string): string[] {
  const t = ` ${text.toLowerCase().replace(/[^a-z ]+/g, ' ').replace(/\s+/g, ' ')} `;
  if (NOT_STAPLE.some((w) => t.includes(` ${w}`))) return [];
  const hits = KEYWORDS.filter(([, w]) => t.includes(` ${w}`) || t.includes(` ${w}s `) || t.includes(` ${w}es `));
  const kept = hits.filter(([id, w]) => !hits.some(([id2, w2]) => id2 !== id && w2.length > w.length && w2.includes(w)));
  return [...new Set(kept.map(([id]) => id))];
}
