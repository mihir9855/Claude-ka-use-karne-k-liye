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
