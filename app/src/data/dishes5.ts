import type { Dish } from '../core/types';
import { d } from './dishBuilder';

const B = 'breakfast' as const;
const L = 'lunch' as const;
const D = 'dinner' as const;
const S = 'snack' as const;

// South, East and North-East Indian, plus continental and Indo-Chinese.
export const MORE_SOUTH_EAST: Dish[] = [
  // ---- South
  d('sambar', 'Sambar', 'Sambar', 'સાંભાર', 'main', [L, D, B], ['toor_dal:40', 'drumstick:30', 'carrot:20', 'tomato:40', 'tamarind:5', 'oil:6', 'masala:4'], 'south'),
  d('rasam', 'Rasam', 'Rasam', 'રસમ', 'main', [L, D], ['toor_dal:15', 'tomato:80', 'tamarind:5', 'oil:4', 'masala:3'], 'south', ['quick']),
  d('avial', 'Avial', 'Avial', 'અવિયલ', 'main', [L, D], ['raw_banana:60', 'drumstick:30', 'carrot:30', 'beans:30', 'coconut:30', 'curd:40', 'oil:8'], 'south'),
  d('cabbage_poriyal', 'Cabbage poriyal', 'Cabbage poriyal', 'કોબી પોરિયલ', 'main', [L, D], ['cabbage:150', 'coconut:20', 'urad_dal:5', 'oil:6'], 'south'),
  d('beans_poriyal', 'Beans poriyal', 'Beans poriyal', 'ફણસી પોરિયલ', 'main', [L, D], ['beans:150', 'coconut:20', 'urad_dal:5', 'oil:6'], 'south'),
  d('beetroot_poriyal', 'Beetroot poriyal', 'Beetroot poriyal', 'બીટ પોરિયલ', 'main', [L, D], ['beetroot:150', 'coconut:20', 'oil:6'], 'south'),
  d('kootu', 'Moong dal kootu', 'Kootu', 'કૂટુ', 'main', [L, D], ['moong_dal:40', 'pumpkin:100', 'coconut:15', 'oil:5'], 'south'),
  d('parippu_curry', 'Parippu curry', 'Parippu curry', 'પરિપ્પુ કરી', 'main', [L, D], ['moong_dal:50', 'coconut:15', 'ghee:4', 'masala:2'], 'south'),
  d('kerala_stew', 'Kerala vegetable stew', 'Kerala veg stew', 'કેરળ વેજ સ્ટૂ', 'main', [L, D], ['aloo:60', 'carrot:40', 'beans:30', 'matar:30', 'coconut:40', 'oil:5'], 'south'),
  d('raw_banana_fry', 'Raw banana fry', 'Kaccha kela fry', 'કાચા કેળાનું શાક', 'main', [L, D], ['raw_banana:120', 'oil:8', 'masala:3'], 'south'),
  d('lemon_rice', 'Lemon rice', 'Lemon rice', 'લેમન રાઈસ', 'complete', [L, D], ['rice:65', 'peanuts:10', 'lemon:10', 'oil:8', 'curry_leaves:2'], 'south'),
  d('curd_rice', 'Curd rice', 'Curd rice', 'દહીં ભાત', 'complete', [L, D], ['rice:60', 'curd:150', 'oil:3'], 'south', ['quick']),
  d('tamarind_rice', 'Tamarind rice', 'Puliyogare', 'આમલીના ભાત', 'complete', [L, D], ['rice:65', 'tamarind:10', 'peanuts:10', 'oil:8'], 'south'),
  d('coconut_rice', 'Coconut rice', 'Coconut rice', 'નારિયેળના ભાત', 'complete', [L, D], ['rice:65', 'coconut:25', 'oil:6'], 'south'),
  d('bisi_bele_bath', 'Bisi bele bath', 'Bisi bele bath', 'બિસી બેલે બાથ', 'complete', [L, D], ['rice:50', 'toor_dal:30', 'carrot:25', 'beans:25', 'matar:25', 'oil:8', 'masala:4'], 'south'),
  d('ven_pongal', 'Ven pongal', 'Ven pongal', 'વેણ પોંગલ', 'complete', [B, L], ['rice:50', 'moong_dal:30', 'ghee:8', 'cashew:5'], 'south'),
  d('sambar_rice', 'Sambar rice', 'Sambar rice', 'સાંભાર ભાત', 'complete', [L, D], ['rice:60', 'toor_dal:35', 'drumstick:20', 'carrot:20', 'oil:5', 'masala:3'], 'south'),
  d('idli_sambar', 'Idli with sambar', 'Idli sambar', 'ઈડલી સાંભાર', 'complete', [B, D], ['rice:45', 'urad_dal:15', 'toor_dal:25', 'carrot:20', 'drumstick:20', 'oil:5'], 'south'),
  d('medu_vada', 'Medu vada', 'Medu vada', 'મેદુ વડા', 'complete', [B, S], ['urad_dal:60', 'oil:25', 'curry_leaves:2'], 'south', ['fried']),
  d('coconut_chutney', 'Coconut chutney', 'Coconut chutney', 'નારિયેળની ચટણી', 'side', [B, L, D], ['coconut:40', 'roasted_chana:10'], 'south', ['quick']),
  d('tomato_chutney', 'Tomato chutney', 'Tomato chutney', 'ટામેટાની ચટણી', 'side', [B, L, D], ['tomato:80', 'oil:5', 'tamarind:2'], 'south', ['quick']),
  d('pepper_rasam', 'Pepper rasam', 'Pepper rasam', 'મરીનો રસમ', 'main', [L, D], ['toor_dal:15', 'tomato:60', 'oil:4', 'masala:3'], 'south', ['quick']),
  // ---- East
  d('cholar_dal', 'Cholar dal', 'Cholar dal', 'ચણાની દાળ (બંગાળી)', 'main', [L, D], ['chana_dal:55', 'coconut:10', 'oil:8', 'masala:3'], 'east'),
  d('aloo_dum_bengali', 'Bengali aloo dum', 'Aloo dum', 'આલૂ દમ (બંગાળી)', 'main', [L, D], ['aloo:150', 'tomato:40', 'oil:12', 'masala:4'], 'east'),
  d('lau_ghonto', 'Lau ghonto', 'Lau ghonto', 'દૂધીનું ઘંટો', 'main', [L, D], ['lauki:200', 'chana_dal:15', 'oil:8', 'masala:3'], 'east'),
  d('shukto', 'Shukto', 'Shukto', 'શુક્તો', 'main', [L, D], ['raw_banana:40', 'karela:30', 'drumstick:30', 'brinjal:40', 'milk:50', 'oil:8'], 'east'),
  d('dalma', 'Dalma', 'Dalma', 'દાળમા', 'main', [L, D], ['toor_dal:40', 'pumpkin:50', 'raw_banana:40', 'coconut:10', 'ghee:5'], 'east'),
  d('khichuri', 'Bengali khichuri', 'Khichuri', 'બંગાળી ખીચડી', 'complete', [L, D], ['rice:50', 'moong_dal:40', 'cauliflower:40', 'matar:20', 'ghee:8'], 'east'),
  d('misti_doi_bowl', 'Curd with jaggery', 'Meetha dahi', 'ગોળ સાથે દહીં', 'snack', [S], ['curd:200', 'jaggery:10'], 'east', ['sweet', 'quick']),
  // ---- North-East
  d('aloo_pitika', 'Aloo pitika', 'Aloo pitika', 'આલૂ પિટિકા', 'main', [L, D], ['aloo:150', 'onion:20', 'oil:6', 'ginger:3'], 'northeast'),
  d('ne_mixed_veg', 'North-East mixed vegetables', 'NE mixed sabzi', 'ઉત્તર-પૂર્વ મિક્સ શાક', 'main', [L, D], ['cabbage:100', 'carrot:30', 'beans:30', 'ginger:5', 'oil:6'], 'northeast'),
  d('ne_dal', 'Simple dal (Assamese style)', 'Assam dal', 'આસામી દાળ', 'main', [L, D], ['masoor_dal:50', 'tomato:40', 'lemon:5', 'oil:5'], 'northeast'),
  // ---- Continental
  d('pasta_primavera', 'Veg pasta (olive oil)', 'Veg pasta', 'વેજ પાસ્તા', 'complete', [L, D], ['pasta:70', 'capsicum:30', 'mushroom:40', 'tomato:50', 'oil:8'], 'continental'),
  d('white_sauce_pasta', 'White sauce pasta', 'White sauce pasta', 'વ્હાઇટ સોસ પાસ્તા', 'complete', [L, D], ['pasta:70', 'milk:100', 'cheese:15', 'capsicum:30', 'butter:6'], 'continental'),
  d('tomato_soup', 'Tomato soup', 'Tamatar soup', 'ટામેટાંનો સૂપ', 'snack', [S, D], ['tomato:200', 'butter:3', 'masala:1'], 'continental', ['quick']),
  d('sweetcorn_soup', 'Sweet corn soup', 'Sweet corn soup', 'સ્વીટ કોર્ન સૂપ', 'snack', [S, D], ['sweetcorn:60', 'carrot:20', 'cabbage:20'], 'continental', ['quick']),
  d('veg_clear_soup', 'Clear vegetable soup', 'Veg soup', 'વેજ સૂપ', 'snack', [S, D], ['carrot:40', 'cabbage:40', 'beans:30', 'tomato:30'], 'continental', ['quick']),
  d('minestrone', 'Minestrone soup', 'Minestrone', 'મિનેસ્ટ્રોન સૂપ', 'snack', [S, D], ['rajma:15', 'pasta:20', 'tomato:60', 'carrot:30', 'beans:30'], 'continental'),
  d('grilled_paneer_salad', 'Grilled paneer salad', 'Paneer salad', 'ગ્રીલ્ડ પનીર સલાડ', 'complete', [L, D], ['paneer:80', 'capsicum:60', 'mushroom:50', 'cucumber:40', 'oil:6'], 'continental'),
  d('chickpea_salad', 'Chickpea salad', 'Chana salad', 'ચણા સલાડ', 'complete', [L, D, S], ['chole:60', 'cucumber:50', 'tomato:50', 'lemon:5', 'oil:5'], 'continental', ['quick']),
  d('stuffed_potato', 'Baked stuffed potato', 'Stuffed aloo', 'સ્ટફ્ડ બટાકા', 'complete', [D], ['aloo:200', 'cheese:20', 'sweetcorn:30'], 'continental'),
  d('mushroom_toast', 'Mushroom toast', 'Mushroom toast', 'મશરૂમ ટોસ્ટ', 'complete', [B, S], ['bread:60', 'mushroom:80', 'butter:5', 'cheese:10'], 'continental', ['quick']),
  // ---- Indo-Chinese
  d('veg_fried_rice', 'Veg fried rice', 'Veg fried rice', 'વેજ ફ્રાઈડ રાઈસ', 'complete', [L, D], ['rice:70', 'carrot:20', 'beans:20', 'cabbage:30', 'capsicum:20', 'oil:10'], 'indochinese'),
  d('hakka_noodles', 'Veg hakka noodles', 'Hakka noodles', 'હક્કા નૂડલ્સ', 'complete', [L, D], ['noodles:60', 'cabbage:40', 'carrot:20', 'capsicum:20', 'oil:10'], 'indochinese'),
  d('veg_manchurian', 'Veg manchurian', 'Veg manchurian', 'વેજ મંચુરિયન', 'main', [L, D], ['cabbage:80', 'carrot:30', 'maida:20', 'oil:25'], 'indochinese', ['fried']),
  d('chilli_paneer', 'Chilli paneer', 'Chilli paneer', 'ચિલી પનીર', 'main', [L, D], ['paneer:90', 'capsicum:50', 'onion:30', 'oil:12'], 'indochinese'),
  d('tofu_chilli', 'Chilli tofu', 'Chilli tofu', 'ચિલી ટોફુ', 'main', [L, D], ['tofu:120', 'capsicum:40', 'oil:8'], 'indochinese'),
  d('schezwan_rice', 'Schezwan rice', 'Schezwan rice', 'શેઝવાન રાઈસ', 'complete', [L, D], ['rice:70', 'cabbage:30', 'carrot:20', 'capsicum:20', 'oil:10'], 'indochinese'),
  d('veg_spring_roll', 'Veg spring roll', 'Spring roll', 'સ્પ્રિંગ રોલ', 'snack', [S], ['maida:40', 'cabbage:50', 'carrot:20', 'oil:20'], 'indochinese', ['fried']),
];
