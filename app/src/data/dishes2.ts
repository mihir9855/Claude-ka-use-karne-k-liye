import type { Dish } from '../core/types';
import { d } from './dishBuilder';
import { MORE_NORTH } from './dishes3';
import { MORE_WEST } from './dishes4';
import { MORE_SOUTH_EAST } from './dishes5';
import { MORE_SIDES_SNACKS } from './dishes6';

const B = 'breakfast' as const;
const L = 'lunch' as const;
const D = 'dinner' as const;
const S = 'snack' as const;

// Breakfast and tiffin. Quantities are one person-serving, raw weights.
const BREAKFAST: Dish[] = [
  d('idli', 'Idli (3)', 'Idli (3)', 'ઈડલી (3)', 'complete', [B, S], ['rice:45', 'urad_dal:15', 'oil:1'], 'south', ['quick']),
  d('dosa', 'Plain dosa', 'Dosa', 'ઢોસા', 'complete', [B, D], ['rice:45', 'urad_dal:15', 'oil:6'], 'south'),
  d('masala_dosa', 'Masala dosa', 'Masala dosa', 'મસાલા ઢોસા', 'complete', [B, D], ['rice:45', 'urad_dal:15', 'aloo:80', 'onion:20', 'oil:8', 'masala:3'], 'south'),
  d('rava_dosa', 'Rava dosa', 'Rava dosa', 'રવા ઢોસા', 'complete', [B, D], ['suji:50', 'rice_flour:10', 'curd:30', 'onion:15', 'oil:8'], 'south'),
  d('rava_idli', 'Rava idli', 'Rava idli', 'રવા ઈડલી', 'complete', [B], ['suji:55', 'curd:60', 'carrot:20', 'oil:4'], 'south'),
  d('uttapam', 'Veg uttapam', 'Uttapam', 'ઉત્તપમ', 'complete', [B, D], ['rice:40', 'urad_dal:15', 'onion:25', 'tomato:25', 'carrot:15', 'oil:6'], 'south'),
  d('ragi_dosa', 'Ragi dosa', 'Ragi dosa', 'રાગી ઢોસા', 'complete', [B, D], ['ragi:50', 'curd:30', 'onion:15', 'oil:6'], 'south'),
  d('ragi_porridge', 'Ragi porridge', 'Ragi porridge', 'રાગીની રાબ', 'complete', [B], ['ragi:30', 'milk:200', 'jaggery:10'], 'south', ['quick']),
  d('oats_idli', 'Oats idli', 'Oats idli', 'ઓટ્સ ઈડલી', 'complete', [B], ['oats:40', 'curd:60', 'suji:20', 'carrot:15', 'oil:3'], 'south'),
  d('pesarattu', 'Pesarattu (moong dosa)', 'Pesarattu', 'પેસરટ્ટુ (મગ ઢોસા)', 'complete', [B, D], ['moong_dal:60', 'rice:10', 'ginger:5', 'green_chilli:3', 'oil:6', 'masala:2'], 'south'),
  d('appam', 'Appam with coconut', 'Appam', 'અપ્પમ', 'complete', [B], ['rice:50', 'coconut:20', 'sugar:3'], 'south'),
  d('puttu', 'Puttu with coconut', 'Puttu', 'પુટ્ટુ', 'complete', [B], ['rice_flour:60', 'coconut:25'], 'south'),
  d('idiyappam', 'Idiyappam', 'Idiyappam', 'ઈડિયપ્પમ', 'complete', [B, D], ['rice_flour:60', 'coconut:15'], 'south'),
  d('semiya_upma', 'Semiya upma', 'Semiya upma', 'સેવૈયા ઉપમા', 'complete', [B], ['seviyan:55', 'carrot:20', 'matar:15', 'peanuts:8', 'oil:6'], 'south', ['quick']),
  d('sabudana_khichdi', 'Sabudana khichdi', 'Sabudana khichdi', 'સાબુદાણા ખીચડી', 'complete', [B, S], ['sabudana:50', 'aloo:50', 'peanuts:20', 'oil:8'], 'west'),
  d('batata_poha', 'Batata poha', 'Batata poha', 'બટાકા પૌવા', 'complete', [B, S], ['poha:55', 'aloo:50', 'peanuts:10', 'onion:20', 'oil:7'], 'west', ['quick']),
  d('dalia_upma', 'Dalia upma', 'Dalia upma', 'દલિયા ઉપમા', 'complete', [B], ['dalia:55', 'carrot:20', 'matar:20', 'beans:15', 'oil:6'], 'north'),
  d('dalia_porridge', 'Sweet dalia porridge', 'Meetha dalia', 'ગળ્યો દલિયા', 'complete', [B], ['dalia:40', 'milk:200', 'jaggery:10', 'almonds:8'], 'north', ['sweet']),
  d('misal_pav', 'Misal pav', 'Misal pav', 'મિસળ પાવ', 'complete', [B, L], ['moth:60', 'tomato:40', 'onion:30', 'bread:60', 'oil:10', 'masala:5'], 'west'),
  d('vada_pav', 'Vada pav', 'Vada pav', 'વડા પાવ', 'complete', [B, S], ['aloo:100', 'besan:25', 'bread:50', 'oil:18'], 'west', ['fried']),
  d('thalipeeth', 'Thalipeeth', 'Thalipeeth', 'થાલીપીઠ', 'complete', [B, D], ['atta:40', 'jowar:20', 'besan:15', 'onion:30', 'oil:8'], 'west'),
  d('khaman', 'Khaman', 'Khaman', 'ખમણ', 'complete', [B, S], ['besan:70', 'curd:30', 'sugar:5', 'oil:6'], 'west'),
  d('khandvi', 'Khandvi', 'Khandvi', 'ખાંડવી', 'complete', [B, S], ['besan:40', 'curd:80', 'oil:8'], 'west'),
  d('muthia', 'Lauki muthia', 'Dudhi muthia', 'દૂધીના મુઠિયા', 'complete', [B, D, S], ['atta:30', 'besan:20', 'lauki:100', 'oil:8'], 'west'),
  d('handvo', 'Handvo', 'Handvo', 'હાંડવો', 'complete', [B, D], ['rice:30', 'toor_dal:20', 'chana_dal:15', 'urad_dal:10', 'lauki:60', 'oil:10'], 'west'),
  d('dhebra', 'Bajra methi dhebra', 'Dhebra', 'ઢેબરા', 'complete', [B, D], ['bajra:50', 'methi:40', 'curd:20', 'oil:12'], 'west'),
  d('khakhra_curd', 'Khakhra with curd', 'Khakhra aur dahi', 'ખાખરા સાથે દહીં', 'complete', [B, S], ['atta:30', 'oil:6', 'curd:150'], 'west', ['quick']),
  d('plain_thepla', 'Plain thepla', 'Thepla', 'થેપલા', 'complete', [B, D], ['atta:60', 'oil:8', 'curd:20', 'masala:2'], 'west'),
  d('dudhi_thepla', 'Dudhi thepla', 'Dudhi thepla', 'દૂધીના થેપલા', 'complete', [B, D], ['atta:50', 'lauki:80', 'besan:10', 'oil:8'], 'west'),
  d('sattu_paratha', 'Sattu paratha', 'Sattu paratha', 'સત્તુ પરાઠા', 'complete', [B], ['atta:50', 'sattu:40', 'onion:15', 'oil:8'], 'east'),
  d('aloo_paratha', 'Aloo paratha', 'Aloo paratha', 'બટાકા પરાઠા', 'complete', [B], ['atta:60', 'aloo:80', 'oil:10'], 'north'),
  d('gobhi_paratha', 'Gobhi paratha', 'Gobhi paratha', 'ફૂલકોબી પરાઠા', 'complete', [B], ['atta:60', 'cauliflower:80', 'oil:10'], 'north'),
  d('mooli_paratha', 'Mooli paratha', 'Mooli paratha', 'મૂળા પરાઠા', 'complete', [B], ['atta:60', 'radish:80', 'oil:10'], 'north'),
  d('methi_puri', 'Methi puri', 'Methi puri', 'મેથી પૂરી', 'complete', [B], ['atta:50', 'methi:30', 'oil:25'], 'west', ['fried']),
  d('poori_bhaji', 'Poori with aloo bhaji', 'Poori bhaji', 'પૂરી ભાજી', 'complete', [B], ['atta:55', 'aloo:100', 'oil:30'], 'north', ['fried']),
  d('chole_bhature', 'Chole bhature', 'Chole bhature', 'છોલે ભટુરે', 'complete', [B, L], ['chole:55', 'maida:60', 'curd:20', 'oil:35'], 'north', ['fried']),
  d('veg_sandwich', 'Veg sandwich', 'Veg sandwich', 'વેજ સેન્ડવિચ', 'complete', [B, S], ['bread:70', 'cucumber:30', 'tomato:30', 'carrot:15', 'butter:5'], 'continental', ['quick']),
  d('paneer_wrap', 'Paneer wrap', 'Paneer wrap', 'પનીર રેપ', 'complete', [B, L, D], ['atta:50', 'paneer:50', 'capsicum:30', 'onion:15', 'oil:6'], 'continental'),
  d('oats_chilla', 'Oats chilla', 'Oats chilla', 'ઓટ્સ ચીલા', 'complete', [B], ['oats:40', 'besan:25', 'onion:15', 'tomato:20', 'oil:5'], 'north', ['quick']),
  d('sprouts_dosa', 'Sprouts and moong dosa', 'Sprouts dosa', 'સ્પ્રાઉટ્સ ઢોસા', 'complete', [B, D], ['moong_dal:40', 'sprouts:50', 'onion:15', 'oil:6'], 'south'),
  d('besan_sandwich', 'Besan toast', 'Besan toast', 'બેસન ટોસ્ટ', 'complete', [B], ['bread:50', 'besan:30', 'onion:15', 'tomato:15', 'oil:6'], 'west', ['quick']),
  d('corn_poha', 'Corn poha', 'Corn poha', 'કોર્ન પૌવા', 'complete', [B], ['poha:50', 'sweetcorn:40', 'peanuts:10', 'oil:6'], 'west', ['quick']),
  d('paneer_uttapam', 'Paneer uttapam', 'Paneer uttapam', 'પનીર ઉત્તપમ', 'complete', [B, D], ['rice:35', 'urad_dal:12', 'paneer:50', 'onion:15', 'oil:6'], 'south'),
  d('kuttu_chilla', 'Kuttu chilla (fasting)', 'Kuttu chilla', 'કુટ્ટુ ચીલા', 'complete', [B, D], ['kuttu:50', 'aloo:40', 'curd:30', 'oil:6'], 'north'),
  d('sabudana_vada', 'Sabudana vada', 'Sabudana vada', 'સાબુદાણા વડા', 'complete', [S], ['sabudana:40', 'aloo:60', 'peanuts:15', 'oil:25'], 'west', ['fried']),
  d('upma_vegetable', 'Rava upma with vegetables', 'Veg upma', 'શાક વાળો ઉપમા', 'complete', [B], ['suji:55', 'carrot:25', 'beans:20', 'matar:15', 'oil:6'], 'south', ['quick']),
  d('paneer_toast', 'Paneer toast', 'Paneer toast', 'પનીર ટોસ્ટ', 'complete', [B, S], ['bread:60', 'paneer:50', 'tomato:20', 'oil:4'], 'continental', ['quick']),
];

export const MORE_DISHES: Dish[] = [
  ...BREAKFAST,
  ...MORE_NORTH,
  ...MORE_WEST,
  ...MORE_SOUTH_EAST,
  ...MORE_SIDES_SNACKS,
];
