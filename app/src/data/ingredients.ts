import type { Ingredient } from '../core/types';

// Approximate values per 100 g (raw), rounded from IFCT 2017 / USDA tables.
// Used for planning only; not medical or lab-grade data.
type Row = [
  id: string,
  en: string,
  hi: string,
  gu: string,
  group: Ingredient['group'],
  kcal: number,
  p: number,
  c: number,
  f: number,
  flags?: Ingredient['flags'],
  basic?: boolean,
];

const rows: Row[] = [
  // grains & flours
  ['atta', 'Wheat flour (atta)', 'Atta', 'ઘઉંનો લોટ', 'grain', 340, 12, 71, 1.7, ['gluten']],
  ['rice', 'Rice', 'Chawal', 'ચોખા', 'grain', 345, 6.8, 78, 0.5, ['high_gi']],
  ['bajra', 'Bajra flour', 'Bajra atta', 'બાજરીનો લોટ', 'grain', 361, 11.6, 67.5, 5],
  ['jowar', 'Jowar flour', 'Jowar atta', 'જુવારનો લોટ', 'grain', 349, 10, 72.6, 1.9],
  ['oats', 'Oats', 'Oats', 'ઓટ્સ', 'grain', 389, 17, 66, 7],
  ['poha', 'Poha (flattened rice)', 'Poha', 'પૌવા', 'grain', 346, 6.6, 77, 1.2, ['high_gi']],
  ['suji', 'Semolina (suji)', 'Suji', 'સોજી (રવો)', 'grain', 348, 10, 73, 1, ['gluten']],
  ['bread', 'Whole wheat bread', 'Brown bread', 'બ્રાઉન બ્રેડ', 'grain', 247, 13, 41, 3.4, ['gluten']],
  // pulses & protein
  ['moong_dal', 'Moong dal', 'Moong dal', 'મગની દાળ', 'pulse', 347, 24, 59, 1.2],
  ['toor_dal', 'Toor dal', 'Toor dal', 'તુવેરની દાળ', 'pulse', 335, 22, 58, 1.5],
  ['chana_dal', 'Chana dal', 'Chana dal', 'ચણાની દાળ', 'pulse', 360, 21, 61, 5.6],
  ['masoor_dal', 'Masoor dal', 'Masoor dal', 'મસૂર દાળ', 'pulse', 343, 25, 60, 1.1],
  ['rajma', 'Rajma', 'Rajma', 'રાજમા', 'pulse', 333, 24, 60, 0.8],
  ['chole', 'Chickpeas (kabuli chana)', 'Kabuli chana', 'કાબુલી ચણા', 'pulse', 364, 19, 61, 6],
  ['besan', 'Besan (gram flour)', 'Besan', 'ચણાનો લોટ', 'pulse', 387, 22, 58, 6.7],
  ['sprouts', 'Sprouted moong', 'Sprouts', 'ફણગાવેલા મગ', 'pulse', 62, 5, 11, 0.4],
  ['roasted_chana', 'Roasted chana', 'Bhuna chana', 'શેકેલા ચણા', 'pulse', 380, 22, 58, 5],
  ['sattu', 'Sattu (chana)', 'Sattu', 'સત્તુ', 'pulse', 400, 22, 60, 5],
  ['soya_chunks', 'Soya chunks', 'Soya chunks', 'સોયા ચંક્સ', 'pulse', 345, 52, 33, 0.5, ['soy']],
  ['tofu', 'Tofu', 'Tofu', 'ટોફુ', 'pulse', 76, 8, 1.9, 4.8, ['soy']],
  // dairy
  ['paneer', 'Paneer', 'Paneer', 'પનીર', 'dairy', 265, 18, 1.2, 21, ['dairy']],
  ['curd', 'Curd (dahi)', 'Dahi', 'દહીં', 'dairy', 61, 3.5, 4.7, 3.3, ['dairy']],
  ['milk', 'Milk', 'Doodh', 'દૂધ', 'dairy', 62, 3.2, 4.7, 3.4, ['dairy']],
  ['whey', 'Protein powder', 'Protein powder', 'પ્રોટીન પાવડર', 'dairy', 400, 78, 8, 6, ['dairy']],
  ['ghee', 'Ghee', 'Ghee', 'ઘી', 'fat', 900, 0, 0, 100, ['dairy', 'high_fat']],
  // fats
  ['oil', 'Cooking oil', 'Tel', 'તેલ', 'fat', 900, 0, 0, 100, ['high_fat'], true],
  ['masala', 'Spices / masala', 'Masala', 'મસાલા', 'other', 280, 10, 50, 10, undefined, true],
  // nuts
  ['peanuts', 'Peanuts', 'Moongfali', 'સીંગદાણા', 'nut', 567, 26, 16, 49, ['peanut', 'high_fat']],
  ['almonds', 'Almonds', 'Badam', 'બદામ', 'nut', 579, 21, 22, 50, ['nuts', 'high_fat']],
  ['makhana', 'Makhana', 'Makhana', 'મખાના', 'nut', 347, 9.7, 77, 0.1],
  // veg
  ['aloo', 'Potato', 'Aloo', 'બટાકા', 'veg', 77, 2, 17, 0.1, ['high_gi']],
  ['matar', 'Green peas', 'Matar', 'વટાણા', 'veg', 81, 5.4, 14, 0.4],
  ['tomato', 'Tomato', 'Tamatar', 'ટામેટાં', 'veg', 18, 0.9, 3.9, 0.2],
  ['onion', 'Onion', 'Pyaaz', 'ડુંગળી', 'veg', 40, 1.1, 9, 0.1, ['onion_garlic']],
  ['garlic', 'Garlic', 'Lehsun', 'લસણ', 'veg', 149, 6.4, 33, 0.5, ['onion_garlic']],
  ['palak', 'Spinach (palak)', 'Palak', 'પાલક', 'veg', 23, 2.9, 3.6, 0.4],
  ['methi', 'Fenugreek leaves (methi)', 'Methi', 'મેથી', 'veg', 49, 4.4, 6, 0.9],
  ['cauliflower', 'Cauliflower', 'Gobi', 'ફૂલકોબી', 'veg', 25, 1.9, 5, 0.3],
  ['cabbage', 'Cabbage', 'Patta gobi', 'કોબી', 'veg', 25, 1.3, 5.8, 0.1],
  ['brinjal', 'Brinjal', 'Baingan', 'રીંગણ', 'veg', 25, 1, 6, 0.2],
  ['bhindi', 'Okra (bhindi)', 'Bhindi', 'ભીંડા', 'veg', 33, 1.9, 7, 0.2],
  ['lauki', 'Bottle gourd (lauki)', 'Lauki', 'દૂધી', 'veg', 15, 0.6, 3.4, 0],
  ['carrot', 'Carrot', 'Gajar', 'ગાજર', 'veg', 41, 0.9, 10, 0.2],
  ['capsicum', 'Capsicum', 'Shimla mirch', 'શિમલા મરચાં', 'veg', 20, 0.9, 4.6, 0.2],
  ['cucumber', 'Cucumber', 'Kheera', 'કાકડી', 'veg', 15, 0.7, 3.6, 0.1],
  ['beans', 'French beans', 'Fansi', 'ફણસી', 'veg', 31, 1.8, 7, 0.2],
  // fruit
  ['banana', 'Banana', 'Kela', 'કેળું', 'fruit', 89, 1.1, 23, 0.3],
  ['apple', 'Apple', 'Seb', 'સફરજન', 'fruit', 52, 0.3, 14, 0.2],

  // ---- more pulses, flours, grains
  ['urad_dal', 'Urad dal', 'Urad dal', 'અડદની દાળ', 'pulse', 347, 25, 59, 1.6],
  ['kala_chana', 'Black chana', 'Kala chana', 'કાળા ચણા', 'pulse', 360, 20, 61, 5],
  ['chawli', 'Black-eyed peas (chawli)', 'Lobia (chawli)', 'ચોળા', 'pulse', 323, 24, 54, 1],
  ['moth', 'Moth beans (matki)', 'Matki', 'મઠ', 'pulse', 330, 23, 56, 1.6],
  ['ragi', 'Ragi flour', 'Ragi atta', 'રાગીનો લોટ', 'flour', 328, 7.3, 72, 1.3],
  ['maida', 'Refined flour (maida)', 'Maida', 'મેંદો', 'flour', 348, 11, 74, 1, ['gluten', 'high_gi']],
  ['makai', 'Corn flour (makai)', 'Makai atta', 'મકાઈનો લોટ', 'flour', 355, 8, 73, 3.8],
  ['kuttu', 'Buckwheat flour (kuttu)', 'Kuttu atta', 'કુટ્ટુનો લોટ', 'flour', 343, 13, 72, 3.4],
  ['rice_flour', 'Rice flour', 'Chawal ka atta', 'ચોખાનો લોટ', 'flour', 366, 6, 80, 1.4, ['high_gi']],
  ['dalia', 'Broken wheat (dalia)', 'Dalia', 'દલિયા', 'grain', 342, 12, 72, 1.5, ['gluten']],
  ['sabudana', 'Sabudana', 'Sabudana', 'સાબુદાણા', 'grain', 351, 0.2, 87, 0.2, ['high_gi']],
  ['seviyan', 'Vermicelli (seviyan)', 'Seviyan', 'સેવ (વર્મિસેલી)', 'grain', 352, 11, 74, 0.8, ['gluten', 'high_gi']],
  ['murmura', 'Puffed rice (murmura)', 'Murmura', 'મમરા', 'grain', 325, 6, 75, 0.5, ['high_gi']],
  ['pasta', 'Pasta', 'Pasta', 'પાસ્તા', 'grain', 358, 12, 73, 1.5, ['gluten', 'high_gi']],
  ['noodles', 'Noodles', 'Noodles', 'નૂડલ્સ', 'grain', 360, 11, 75, 2, ['gluten', 'high_gi']],
  // ---- dairy and nuts
  ['cheese', 'Cheese', 'Cheese', 'ચીઝ', 'dairy', 330, 22, 3, 25, ['dairy', 'high_fat']],
  ['butter', 'Butter', 'Makkhan', 'માખણ', 'dairy', 717, 0.9, 0.1, 81, ['dairy', 'high_fat']],
  ['cream', 'Cream', 'Malai', 'મલાઈ', 'dairy', 340, 2.1, 2.8, 36, ['dairy', 'high_fat']],
  ['coconut', 'Coconut', 'Nariyal', 'નાળિયેર', 'nut', 354, 3.3, 15, 33, ['high_fat']],
  ['cashew', 'Cashew', 'Kaju', 'કાજુ', 'nut', 553, 18, 30, 44, ['nuts', 'high_fat']],
  ['sesame', 'Sesame (til)', 'Til', 'તલ', 'nut', 573, 18, 23, 50, ['high_fat']],
  ['dates', 'Dates', 'Khajoor', 'ખજૂર', 'fruit', 280, 2.5, 75, 0.4, ['high_gi']],
  // ---- more vegetables
  ['sarson', 'Mustard greens (sarson)', 'Sarson ka saag', 'સરસવની ભાજી', 'leafy', 27, 2.7, 4.7, 0.2],
  ['sweet_potato', 'Sweet potato', 'Shakarkand', 'શક્કરિયાં', 'root', 86, 1.6, 20, 0.1],
  ['beetroot', 'Beetroot', 'Chukandar', 'બીટ', 'root', 43, 1.6, 10, 0.2],
  ['radish', 'Radish (mooli)', 'Mooli', 'મૂળા', 'root', 16, 0.7, 3.4, 0.1],
  ['pumpkin', 'Pumpkin (kaddu)', 'Kaddu', 'કોળું', 'veg', 26, 1, 6.5, 0.1],
  ['mushroom', 'Mushroom', 'Mushroom', 'મશરૂમ', 'veg', 22, 3.1, 3.3, 0.3],
  ['sweetcorn', 'Sweet corn', 'Makai (corn)', 'મકાઈ', 'veg', 86, 3.3, 19, 1.4],
  ['tindora', 'Ivy gourd (tindora)', 'Tinda / tindora', 'ટીંડોળા', 'veg', 18, 1.2, 3.1, 0.1],
  ['turai', 'Ridge gourd (turai)', 'Turai', 'તુરિયા', 'veg', 20, 0.5, 4.4, 0.1],
  ['karela', 'Bitter gourd (karela)', 'Karela', 'કારેલા', 'veg', 17, 1, 3.7, 0.2],
  ['guar', 'Cluster beans (guar)', 'Gavar', 'ગુવાર', 'veg', 30, 3.2, 5, 0.3],
  ['raw_banana', 'Raw banana', 'Kaccha kela', 'કાચા કેળા', 'veg', 110, 1.3, 28, 0.4],
  ['drumstick', 'Drumstick', 'Sahjan', 'સરગવો', 'veg', 37, 2.1, 8.5, 0.2],
  // ---- more fruit
  ['orange', 'Orange', 'Santra', 'સંતરા', 'fruit', 47, 0.9, 12, 0.1],
  ['papaya', 'Papaya', 'Papita', 'પપૈયું', 'fruit', 43, 0.5, 11, 0.3],
  ['pomegranate', 'Pomegranate', 'Anaar', 'દાડમ', 'fruit', 83, 1.7, 19, 1.2],
  ['guava', 'Guava', 'Amrood', 'જામફળ', 'fruit', 68, 2.6, 14, 1],
  ['watermelon', 'Watermelon', 'Tarbooj', 'તરબૂચ', 'fruit', 30, 0.6, 7.6, 0.2],
  // ---- kitchen essentials: assumed to be at home, small amounts
  ['ginger', 'Ginger', 'Adrak', 'આદુ', 'veg', 80, 1.8, 18, 0.8, undefined, true],
  ['green_chilli', 'Green chilli', 'Hari mirch', 'લીલા મરચાં', 'veg', 40, 2, 9, 0.2, undefined, true],
  ['coriander', 'Coriander leaves', 'Dhaniya patta', 'કોથમીર', 'leafy', 23, 2.1, 3.7, 0.5, undefined, true],
  ['curry_leaves', 'Curry leaves', 'Curry patta', 'મીઠો લીમડો', 'leafy', 108, 6, 19, 1, undefined, true],
  ['mint', 'Mint', 'Pudina', 'ફુદીનો', 'leafy', 44, 3.3, 8, 0.7, undefined, true],
  ['lemon', 'Lemon', 'Nimbu', 'લીંબુ', 'veg', 29, 1.1, 9, 0.3, undefined, true],
  ['tamarind', 'Tamarind', 'Imli', 'આમલી', 'other', 239, 2.8, 63, 0.6, undefined, true],
  ['jaggery', 'Jaggery', 'Gud', 'ગોળ', 'other', 383, 0.4, 98, 0.1, undefined, true],
  ['sugar', 'Sugar', 'Cheeni', 'ખાંડ', 'other', 387, 0, 100, 0, ['high_gi'], true],
  // other
  ['papad', 'Papad', 'Papad', 'પાપડ', 'other', 371, 25, 60, 3, ['high_sodium']],
];

// dietary fibre, g per 100 g
const FIBER: Record<string, number> = {
  atta: 11, rice: 0.4, bajra: 11.5, jowar: 10, oats: 10, poha: 1, suji: 3, bread: 7,
  moong_dal: 16, toor_dal: 15, chana_dal: 13, masoor_dal: 11, rajma: 25, chole: 17, besan: 11,
  sprouts: 1.8, roasted_chana: 17, sattu: 18, soya_chunks: 13, tofu: 0.3,
  paneer: 0, curd: 0, milk: 0, whey: 0, ghee: 0, oil: 0, masala: 20,
  peanuts: 8.5, almonds: 12.5, makhana: 14,
  aloo: 2.2, matar: 5.7, tomato: 1.2, onion: 1.7, garlic: 2.1, palak: 2.2, methi: 4.9, cauliflower: 2,
  cabbage: 2.5, brinjal: 3, bhindi: 3.2, lauki: 0.5, carrot: 2.8, capsicum: 1.7, cucumber: 0.5, beans: 2.7,
  banana: 2.6, apple: 2.4, papad: 5,
  urad_dal: 18, kala_chana: 17, chawli: 11, moth: 12, ragi: 11, maida: 3, makai: 7, kuttu: 10, rice_flour: 2,
  dalia: 12, sabudana: 0.9, seviyan: 3, murmura: 1, cheese: 0, butter: 0, cream: 0, coconut: 9, cashew: 3.3,
  pasta: 3, noodles: 3, sesame: 12, dates: 8, sarson: 3.2, sweet_potato: 3, beetroot: 2.8, radish: 1.6, pumpkin: 0.5, mushroom: 1,
  sweetcorn: 2, tindora: 1.6, turai: 1.5, karela: 2.8, guar: 3, raw_banana: 2.3, drumstick: 3.2, orange: 2.4,
  papaya: 1.7, pomegranate: 4, guava: 5.4, watermelon: 0.4, ginger: 2, green_chilli: 1.5, coriander: 2.8,
  curry_leaves: 6.4, mint: 6.8, lemon: 2.8, tamarind: 5, jaggery: 0, sugar: 0,
};

// finer shelf categories than the raw `group` column
const GROUP: Record<string, Ingredient['group']> = {
  atta: 'flour', bajra: 'flour', jowar: 'flour', besan: 'flour', suji: 'flour', sattu: 'flour',
  palak: 'leafy', methi: 'leafy', cabbage: 'leafy',
  aloo: 'root', carrot: 'root', onion: 'root', garlic: 'root',
};

export const INGREDIENTS: Ingredient[] = rows.map(
  ([id, en, hi, gu, group, kcal, protein, carbs, fat, flags, basic]) => ({
    id,
    name: { en, hi, gu },
    group: GROUP[id] ?? group,
    kcal,
    protein,
    carbs,
    fat,
    fiber: FIBER[id] ?? 0,
    flags,
    basic,
  }),
);

export const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

const BUILTIN_COUNT = INGREDIENTS.length;

/** Rough per-100 g values used when a custom item has no numbers of its own. */
export const GROUP_DEFAULTS: Record<Ingredient['group'], Pick<Ingredient, 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber'>> = {
  grain: { kcal: 350, protein: 8, carbs: 72, fat: 2, fiber: 3 },
  flour: { kcal: 350, protein: 10, carbs: 70, fat: 2, fiber: 5 },
  pulse: { kcal: 340, protein: 22, carbs: 58, fat: 2, fiber: 14 },
  dairy: { kcal: 100, protein: 6, carbs: 5, fat: 6, fiber: 0 },
  leafy: { kcal: 25, protein: 3, carbs: 4, fat: 0.4, fiber: 2.5 },
  root: { kcal: 60, protein: 1.5, carbs: 13, fat: 0.2, fiber: 2.5 },
  veg: { kcal: 30, protein: 1.5, carbs: 6, fat: 0.3, fiber: 2.5 },
  fruit: { kcal: 60, protein: 0.6, carbs: 14, fat: 0.3, fiber: 2 },
  nut: { kcal: 550, protein: 20, carbs: 20, fat: 45, fiber: 8 },
  fat: { kcal: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  other: { kcal: 200, protein: 5, carbs: 30, fat: 5, fiber: 2 },
};

/** Replace the user's own pantry items. Planner, pantry and dish editor read the same lists. */
export function setCustomIngredients(list: Ingredient[]): void {
  for (const i of INGREDIENTS.splice(BUILTIN_COUNT)) delete INGREDIENT_BY_ID[i.id];
  for (const i of list) {
    INGREDIENTS.push(i);
    INGREDIENT_BY_ID[i.id] = i;
  }
}
