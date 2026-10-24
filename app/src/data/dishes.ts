import type { Dish, DishRole, MealCategory } from '../core/types';

const B: MealCategory = 'breakfast';
const L: MealCategory = 'lunch';
const D: MealCategory = 'dinner';
const S: MealCategory = 'snack';

/** items are "ingredientId:grams" for ONE serving (raw weights) */
function d(
  id: string,
  en: string,
  hi: string,
  gu: string,
  role: DishRole,
  meals: MealCategory[],
  items: string[],
): Dish {
  return {
    id,
    name: { en, hi, gu },
    role,
    meals,
    items: items.map((s) => {
      const [ing, g] = s.split(':');
      return { ing, g: Number(g) };
    }),
  };
}

// Indian vegetarian. Quantities are for one person-serving before portion scaling.
export const BUILTIN_DISHES: Dish[] = [
  // ---- complete meals (breakfast / light dinner) ----
  d('poha', 'Poha', 'Poha', 'પૌવા', 'complete', [B, S], ['poha:60', 'onion:30', 'peanuts:10', 'matar:20', 'oil:6', 'masala:3']),
  d('moong_chilla', 'Moong dal chilla', 'Moong dal chilla', 'મગની દાળના ચીલા', 'complete', [B, D], ['moong_dal:70', 'onion:20', 'tomato:20', 'oil:6', 'masala:3']),
  d('paneer_chilla', 'Paneer-stuffed moong chilla', 'Paneer moong chilla', 'પનીર મગ ચીલા', 'complete', [B, D], ['moong_dal:60', 'paneer:50', 'oil:6', 'masala:3']),
  d('besan_chilla', 'Besan chilla (pudla)', 'Besan chilla', 'ચણાના લોટના પુડલા', 'complete', [B, D], ['besan:60', 'tomato:30', 'onion:20', 'oil:6', 'masala:3']),
  d('masala_oats', 'Masala oats', 'Masala oats', 'મસાલા ઓટ્સ', 'complete', [B, D], ['oats:50', 'matar:20', 'carrot:20', 'peanuts:10', 'oil:5', 'masala:3']),
  d('dhokla', 'Dhokla', 'Dhokla', 'ઢોકળા', 'complete', [B, S], ['besan:80', 'curd:50', 'oil:6', 'masala:2']),
  d('suji_upma', 'Upma', 'Upma', 'ઉપમા', 'complete', [B], ['suji:60', 'matar:20', 'carrot:20', 'peanuts:10', 'oil:6', 'masala:2']),
  d('khichdi', 'Moong dal khichdi', 'Moong dal khichdi', 'મગની દાળની ખીચડી', 'complete', [L, D], ['rice:50', 'moong_dal:40', 'matar:20', 'ghee:8', 'masala:3']),
  d('soya_pulao', 'Soya pulao', 'Soya pulao', 'સોયા પુલાવ', 'complete', [L, D], ['rice:60', 'soya_chunks:30', 'matar:20', 'oil:8', 'masala:3']),
  d('paneer_sandwich', 'Paneer sandwich', 'Paneer sandwich', 'પનીર સેન્ડવિચ', 'complete', [B], ['bread:60', 'paneer:40', 'cucumber:30', 'tomato:30']),
  d('methi_thepla', 'Methi thepla', 'Methi thepla', 'મેથીના થેપલા', 'complete', [B, D], ['atta:60', 'methi:40', 'besan:10', 'oil:8', 'masala:3']),
  d('paneer_paratha', 'Paneer paratha', 'Paneer paratha', 'પનીર પરાઠા', 'complete', [B], ['atta:70', 'paneer:50', 'oil:8', 'masala:2']),
  d('tofu_bhurji', 'Tofu bhurji', 'Tofu bhurji', 'ટોફુ ભુર્જી', 'complete', [B, D], ['tofu:120', 'onion:30', 'tomato:30', 'oil:6', 'masala:3']),
  d('overnight_oats', 'Overnight oats with fruit', 'Overnight oats', 'ઓવરનાઇટ ઓટ્સ', 'complete', [B], ['oats:50', 'milk:150', 'almonds:10', 'apple:80']),
  d('sprouts_chaat', 'Sprouts chaat', 'Sprouts chaat', 'સ્પ્રાઉટ્સ ચાટ', 'complete', [B, S, D], ['sprouts:120', 'tomato:40', 'onion:20', 'cucumber:40', 'peanuts:10']),

  // ---- snacks ----
  d('protein_shake', 'Banana protein shake', 'Banana protein shake', 'કેળા પ્રોટીન શેક', 'snack', [S], ['milk:250', 'whey:25', 'banana:80']),
  d('roasted_chana', 'Roasted chana', 'Bhuna chana', 'શેકેલા ચણા', 'snack', [S], ['roasted_chana:40']),
  d('makhana', 'Roasted makhana', 'Makhana', 'શેકેલા મખાના', 'snack', [S], ['makhana:30', 'ghee:4']),
  d('curd_fruit', 'Curd with fruit', 'Dahi with fruit', 'દહીં સાથે ફળ', 'snack', [S], ['curd:200', 'apple:100']),
  d('sattu_drink', 'Sattu drink', 'Sattu sharbat', 'સત્તુ શરબત', 'snack', [S], ['sattu:40']),
  d('paneer_cubes', 'Grilled paneer cubes', 'Grilled paneer', 'શેકેલું પનીર', 'snack', [S], ['paneer:60', 'capsicum:30', 'oil:3', 'masala:2']),
  d('haldi_milk', 'Haldi doodh', 'Haldi doodh', 'હળદરવાળું દૂધ', 'snack', [S], ['milk:250']),

  d('soya_stirfry', 'Soya chunk stir-fry', 'Soya chunk fry', 'સોયા ચંક્સ સ્ટર-ફ્રાય', 'snack', [S], ['soya_chunks:30', 'capsicum:40', 'oil:4', 'masala:3']),
  d('tofu_tikka', 'Tofu tikka', 'Tofu tikka', 'ટોફુ ટિક્કા', 'snack', [S], ['tofu:150', 'capsicum:40', 'oil:4', 'masala:3']),
  d('dal_soup', 'Moong dal soup', 'Moong dal soup', 'મગની દાળનો સૂપ', 'snack', [S], ['moong_dal:40', 'tomato:40', 'masala:2']),
  d('chana_chaat', 'Chana chaat', 'Chana chaat', 'ચણા ચાટ', 'snack', [S], ['chole:50', 'tomato:40', 'cucumber:40', 'masala:2']),
  d('protein_lassi', 'Protein lassi', 'Protein lassi', 'પ્રોટીન લસ્સી', 'snack', [S], ['curd:200', 'whey:20']),

  // ---- mains (sabji / dal) ----
  d('aloo_matar', 'Aloo matar sabji', 'Aloo matar ki sabji', 'બટાકા વટાણાનું શાક', 'main', [L, D], ['aloo:100', 'matar:80', 'tomato:60', 'onion:40', 'oil:10', 'masala:5']),
  d('matar_paneer', 'Matar paneer', 'Matar paneer', 'વટાણા પનીર', 'main', [L, D], ['matar:80', 'paneer:80', 'tomato:80', 'onion:40', 'oil:10', 'masala:5']),
  d('palak_paneer', 'Palak paneer', 'Palak paneer', 'પાલક પનીર', 'main', [L, D], ['palak:150', 'paneer:80', 'onion:30', 'garlic:5', 'oil:10', 'masala:4']),
  d('paneer_bhurji', 'Paneer bhurji', 'Paneer bhurji', 'પનીર ભુર્જી', 'main', [L, D], ['paneer:100', 'tomato:60', 'onion:40', 'capsicum:30', 'oil:8', 'masala:4']),
  d('dal_tadka', 'Dal tadka', 'Dal tadka', 'દાળ તડકા', 'main', [L, D], ['toor_dal:50', 'tomato:40', 'onion:20', 'garlic:5', 'oil:6', 'ghee:4', 'masala:3']),
  d('moong_dal', 'Moong dal', 'Moong dal', 'મગની દાળ', 'main', [L, D], ['moong_dal:50', 'tomato:30', 'oil:6', 'masala:3']),
  d('masoor_dal', 'Masoor dal', 'Masoor dal', 'મસૂર દાળ', 'main', [L, D], ['masoor_dal:50', 'tomato:30', 'oil:6', 'masala:3']),
  d('lauki_chana_dal', 'Lauki chana dal', 'Lauki chana dal', 'દૂધી ચણાની દાળ', 'main', [L, D], ['chana_dal:40', 'lauki:100', 'tomato:30', 'oil:6', 'masala:3']),
  d('palak_dal', 'Palak dal', 'Palak dal', 'પાલક દાળ', 'main', [L, D], ['moong_dal:40', 'palak:100', 'garlic:3', 'oil:6', 'masala:3']),
  d('gujarati_dal', 'Gujarati dal', 'Gujarati dal', 'ગુજરાતી દાળ', 'main', [L, D], ['toor_dal:45', 'tomato:30', 'peanuts:5', 'oil:6', 'masala:3']),
  d('rajma', 'Rajma masala', 'Rajma', 'રાજમા', 'main', [L, D], ['rajma:50', 'tomato:80', 'onion:40', 'oil:8', 'masala:5']),
  d('chole', 'Chole', 'Chole', 'છોલે', 'main', [L, D], ['chole:55', 'tomato:80', 'onion:40', 'oil:8', 'masala:5']),
  d('soya_curry', 'Soya chunk curry', 'Soya chunk sabji', 'સોયા ચંક્સનું શાક', 'main', [L, D], ['soya_chunks:40', 'tomato:80', 'onion:40', 'oil:8', 'masala:5']),
  d('tofu_capsicum', 'Tofu capsicum sabji', 'Tofu capsicum', 'ટોફુ શિમલા મરચાં', 'main', [L, D], ['tofu:120', 'capsicum:80', 'oil:8', 'masala:3']),
  d('bhindi', 'Bhindi masala', 'Bhindi ki sabji', 'ભીંડાનું શાક', 'main', [L, D], ['bhindi:150', 'onion:40', 'oil:10', 'masala:4']),
  d('gobi_matar', 'Gobi matar', 'Gobi matar', 'ફૂલકોબી વટાણા', 'main', [L, D], ['cauliflower:150', 'matar:30', 'tomato:30', 'oil:8', 'masala:4']),
  d('baingan_bharta', 'Baingan bharta', 'Baingan bharta', 'રીંગણનો ઓળો', 'main', [L, D], ['brinjal:200', 'onion:30', 'tomato:50', 'oil:8', 'masala:4']),
  d('mix_veg_paneer', 'Mix veg with paneer', 'Mix veg paneer', 'મિક્સ વેજ પનીર', 'main', [L, D], ['beans:50', 'carrot:50', 'cabbage:50', 'matar:30', 'paneer:40', 'oil:8', 'masala:4']),
  d('kadhi', 'Gujarati kadhi', 'Gujarati kadhi', 'ગુજરાતી કઢી', 'main', [L, D], ['besan:30', 'curd:150', 'oil:5', 'masala:2']),

  // ---- staples ----
  d('roti', 'Roti (2)', 'Roti (2)', 'રોટલી (2)', 'staple', [L, D], ['atta:60', 'oil:2']),
  d('bajra_rotla', 'Bajra rotla', 'Bajra rotla', 'બાજરીનો રોટલો', 'staple', [L, D], ['bajra:60', 'ghee:3']),
  d('jowar_roti', 'Jowar roti', 'Jowar roti', 'જુવારની રોટલી', 'staple', [L, D], ['jowar:60']),
  d('missi_roti', 'Missi roti', 'Missi roti', 'ચણાના લોટની રોટલી', 'staple', [L, D], ['atta:40', 'besan:25', 'oil:3']),
  d('rice', 'Steamed rice', 'Chawal', 'ભાત', 'staple', [L, D], ['rice:60']),

  // ---- sides ----
  d('raita', 'Cucumber raita', 'Kheera raita', 'કાકડીનું રાયતું', 'side', [L, D, B], ['curd:150', 'cucumber:40']),
  d('salad', 'Kachumber salad', 'Kachumber', 'કચુંબર', 'side', [L, D], ['cucumber:60', 'tomato:50', 'carrot:30', 'onion:20']),
  d('chaas', 'Chaas (buttermilk)', 'Chaas', 'છાશ', 'side', [L, D], ['curd:100']),
  d('papad', 'Papad', 'Papad', 'પાપડ', 'side', [], ['papad:10']),
];
