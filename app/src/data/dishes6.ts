import type { Dish } from '../core/types';
import { d } from './dishBuilder';

const B = 'breakfast' as const;
const L = 'lunch' as const;
const D = 'dinner' as const;
const S = 'snack' as const;

// Breads and rice, sides, snacks and drinks.
export const MORE_SIDES_SNACKS: Dish[] = [
  // ---- breads (staples)
  d('phulka', 'Phulka (2)', 'Phulka (2)', 'ફૂલકા રોટલી (2)', 'staple', [L, D], ['atta:55'], 'north', ['quick'], 'bread'),
  d('plain_paratha', 'Plain paratha', 'Paratha', 'સાદા પરાઠા', 'staple', [L, D], ['atta:60', 'oil:10'], 'north', undefined, 'bread'),
  d('puri', 'Puri (3)', 'Puri (3)', 'પૂરી (3)', 'staple', [L, D], ['atta:55', 'oil:25'], 'north', ['fried'], 'bread'),
  d('bhatura', 'Bhatura (1)', 'Bhatura', 'ભટુરા', 'staple', [L, D], ['maida:60', 'curd:15', 'oil:30'], 'north', ['fried'], 'bread'),
  d('naan', 'Naan', 'Naan', 'નાન', 'staple', [L, D], ['maida:70', 'curd:20', 'butter:6'], 'north', undefined, 'bread'),
  d('tandoori_roti', 'Tandoori roti (2)', 'Tandoori roti (2)', 'તંદૂરી રોટી (2)', 'staple', [L, D], ['atta:60'], 'north', undefined, 'bread'),
  d('kulcha', 'Kulcha', 'Kulcha', 'કુલચા', 'staple', [L, D], ['maida:65', 'curd:20', 'butter:4'], 'north', undefined, 'bread'),
  d('makki_roti', 'Makki ki roti', 'Makki ki roti', 'મકાઈની રોટલી', 'staple', [L, D], ['makai:65', 'butter:5'], 'north', undefined, 'bread'),
  d('ragi_roti', 'Ragi roti', 'Ragi roti', 'રાગીની રોટલી', 'staple', [L, D], ['ragi:60', 'oil:3'], 'south', undefined, 'bread'),
  d('kuttu_roti', 'Kuttu roti', 'Kuttu roti', 'કુટ્ટુની રોટલી', 'staple', [L, D], ['kuttu:50', 'aloo:20', 'ghee:4'], 'north', undefined, 'bread'),
  d('jowar_bajra_roti', 'Jowar-bajra roti', 'Jowar bajra roti', 'જુવાર બાજરાની રોટલી', 'staple', [L, D], ['jowar:30', 'bajra:30', 'ghee:3'], 'west', undefined, 'bread'),
  d('jeera_rice', 'Jeera rice', 'Jeera rice', 'જીરા ભાત', 'staple', [L, D], ['rice:65', 'ghee:5'], 'north', undefined, 'rice'),
  d('ghee_rice', 'Ghee rice', 'Ghee rice', 'ઘી ભાત', 'staple', [L, D], ['rice:65', 'ghee:8'], 'south', undefined, 'rice'),
  d('plain_khichdi_rice', 'Steamed rice (small)', 'Chawal (kam)', 'ભાત (ઓછા)', 'staple', [L, D], ['rice:45'], 'north', ['quick'], 'rice'),
  // ---- sides
  d('boondi_raita', 'Boondi raita', 'Boondi raita', 'બુંદી રાયતું', 'side', [L, D], ['curd:150', 'besan:10', 'masala:1'], 'north', ['quick']),
  d('mixed_raita', 'Mixed vegetable raita', 'Mix raita', 'મિક્સ રાયતું', 'side', [L, D], ['curd:150', 'cucumber:30', 'carrot:20', 'tomato:15'], 'north', ['quick']),
  d('masala_chaas', 'Masala chaas', 'Masala chaas', 'મસાલા છાશ', 'side', [L, D, S], ['curd:100', 'mint:3', 'masala:1'], 'west', ['quick']),
  d('sprouts_salad', 'Sprouts salad', 'Sprouts salad', 'સ્પ્રાઉટ્સ સલાડ', 'side', [L, D], ['sprouts:80', 'cucumber:40', 'tomato:30', 'lemon:5'], 'north', ['quick']),
  d('kosambari', 'Kosambari', 'Kosambari', 'કોસંબરી', 'side', [L, D], ['moong_dal:30', 'cucumber:50', 'carrot:20', 'coconut:10'], 'south', ['quick']),
  d('green_salad', 'Green salad', 'Green salad', 'લીલું સલાડ', 'side', [L, D], ['cucumber:60', 'tomato:40', 'carrot:40', 'radish:20'], 'north', ['quick']),
  d('beetroot_raita', 'Beetroot raita', 'Beetroot raita', 'બીટ રાયતું', 'side', [L, D], ['beetroot:100', 'curd:100'], 'north', ['quick']),
  d('dahi_bowl', 'Plain curd', 'Dahi', 'દહીં', 'side', [L, D, B], ['curd:150'], 'north', ['quick']),
  d('peanut_chutney', 'Peanut chutney', 'Moongfali chutney', 'સીંગની ચટણી', 'side', [B, L, D], ['peanuts:20', 'coconut:10'], 'south', ['quick']),
  d('mint_chutney_side', 'Mint-coconut chutney', 'Pudina chutney', 'ફુદીનાની ચટણી', 'side', [B, L, D], ['mint:10', 'coconut:15'], 'north', ['quick']),
  // ---- fruit
  d('fruit_bowl', 'Fruit bowl', 'Fal ka bowl', 'ફળની પ્લેટ', 'snack', [S, B], ['apple:100', 'papaya:100', 'pomegranate:40'], 'north', ['quick']),
  d('guava_chaat', 'Guava chaat', 'Amrood chaat', 'જામફળ ચાટ', 'snack', [S], ['guava:150', 'lemon:3'], 'north', ['quick']),
  d('orange_snack', 'Orange', 'Santra', 'સંતરા', 'snack', [S], ['orange:150'], 'north', ['quick']),
  d('watermelon_bowl', 'Watermelon', 'Tarbooj', 'તરબૂચ', 'snack', [S], ['watermelon:250'], 'north', ['quick']),
  d('banana_peanut', 'Banana with peanuts', 'Kela aur moongfali', 'કેળા અને સીંગ', 'snack', [S, B], ['banana:100', 'peanuts:20'], 'north', ['quick']),
  d('dates_nuts', 'Dates and nuts', 'Khajoor aur badam', 'ખજૂર અને બદામ', 'snack', [S], ['dates:30', 'almonds:15', 'cashew:10'], 'north', ['quick', 'sweet']),
  // ---- savoury snacks
  d('murmura_bhel', 'Bhel (puffed rice)', 'Murmura bhel', 'મમરાની ભેળ', 'snack', [S], ['murmura:40', 'tomato:30', 'onion:20', 'cucumber:30', 'peanuts:10'], 'west', ['quick']),
  d('murmura_chivda', 'Murmura chivda', 'Murmura chivda', 'મમરાનો ચેવડો', 'snack', [S], ['murmura:40', 'peanuts:15', 'roasted_chana:10', 'oil:5'], 'west'),
  d('corn_chaat', 'Corn chaat', 'Corn chaat', 'કોર્ન ચાટ', 'snack', [S], ['sweetcorn:120', 'tomato:20', 'onion:15', 'lemon:5'], 'north', ['quick']),
  d('steamed_corn', 'Steamed corn with butter', 'Bhutta', 'બાફેલી મકાઈ', 'snack', [S], ['sweetcorn:150', 'butter:5'], 'north', ['quick']),
  d('sprouts_bhel', 'Sprouts bhel', 'Sprouts bhel', 'સ્પ્રાઉટ્સ ભેળ', 'snack', [S], ['sprouts:100', 'tomato:30', 'onion:20', 'cucumber:30'], 'west', ['quick']),
  d('hummus_veg', 'Hummus with veg sticks', 'Hummus', 'હમસ અને શાકભાજી', 'snack', [S], ['chole:40', 'sesame:8', 'oil:5', 'carrot:50', 'cucumber:50'], 'continental'),
  d('paneer_tikka', 'Paneer tikka', 'Paneer tikka', 'પનીર ટિક્કા', 'snack', [S, D], ['paneer:100', 'curd:30', 'capsicum:40', 'oil:5'], 'north'),
  d('paneer_roll', 'Paneer roll', 'Paneer roll', 'પનીર રોલ', 'snack', [S, D], ['atta:40', 'paneer:60', 'onion:15', 'oil:5'], 'north'),
  d('veg_cutlet', 'Veg cutlet', 'Veg cutlet', 'વેજ કટલેસ', 'snack', [S], ['aloo:60', 'matar:20', 'carrot:20', 'oil:15'], 'north', ['fried']),
  d('onion_pakoda', 'Onion pakoda', 'Pyaaz pakoda', 'ડુંગળીના ભજિયા', 'snack', [S], ['onion:80', 'besan:30', 'oil:25'], 'north', ['fried']),
  d('samosa', 'Samosa', 'Samosa', 'સમોસા', 'snack', [S], ['maida:40', 'aloo:60', 'matar:15', 'oil:25'], 'north', ['fried']),
  d('dahi_vada', 'Dahi vada', 'Dahi vada', 'દહીં વડા', 'snack', [S], ['urad_dal:40', 'curd:100', 'oil:20'], 'north', ['fried']),
  d('methi_khakhra', 'Methi khakhra (2)', 'Methi khakhra', 'મેથી ખાખરા', 'snack', [S, B], ['atta:30', 'methi:10', 'oil:5'], 'west', ['quick']),
  d('roasted_peanuts', 'Roasted peanuts', 'Bhuni moongfali', 'શેકેલી સીંગ', 'snack', [S], ['peanuts:40'], 'north', ['quick']),
  // ---- sweet and energy snacks
  d('peanut_chikki', 'Peanut chikki', 'Moongfali chikki', 'સીંગ ચીક્કી', 'snack', [S], ['peanuts:30', 'jaggery:20'], 'west', ['sweet']),
  d('dry_fruit_ladoo', 'Dry fruit ladoo', 'Dry fruit ladoo', 'ડ્રાયફ્રૂટ લાડુ', 'snack', [S], ['dates:30', 'almonds:10', 'cashew:10', 'sesame:5'], 'north', ['sweet']),
  d('sattu_ladoo', 'Sattu ladoo', 'Sattu ladoo', 'સત્તુ લાડુ', 'snack', [S], ['sattu:40', 'jaggery:20', 'ghee:8'], 'east', ['sweet']),
  d('murmura_laddu', 'Murmura laddu', 'Murmura laddu', 'મમરાના લાડુ', 'snack', [S], ['murmura:30', 'jaggery:20'], 'north', ['sweet']),
  d('oats_energy_bar', 'Oats energy bar', 'Oats bar', 'ઓટ્સ બાર', 'snack', [S], ['oats:30', 'peanuts:10', 'jaggery:15', 'dates:10'], 'continental', ['sweet']),
  // ---- drinks
  d('sweet_lassi', 'Sweet lassi', 'Meethi lassi', 'મીઠી લસ્સી', 'snack', [S], ['curd:200', 'sugar:15'], 'north', ['sweet']),
  d('salted_lassi', 'Salted lassi', 'Namkeen lassi', 'ખારી લસ્સી', 'snack', [S, L], ['curd:200', 'masala:1'], 'north', ['quick']),
  d('banana_oats_smoothie', 'Banana oats smoothie', 'Banana oats smoothie', 'કેળા ઓટ્સ સ્મૂધી', 'snack', [S, B], ['banana:100', 'oats:25', 'milk:200'], 'continental', ['quick']),
  d('badam_milk', 'Badam milk', 'Badam doodh', 'બદામ દૂધ', 'snack', [S], ['milk:250', 'almonds:15', 'jaggery:5'], 'north', ['sweet']),
  d('beetroot_apple_juice', 'Beetroot apple juice', 'Chukandar seb juice', 'બીટ સફરજન જ્યુસ', 'snack', [S], ['beetroot:100', 'apple:50', 'lemon:5'], 'north', ['quick']),
  d('palak_soup', 'Palak soup', 'Palak soup', 'પાલક સૂપ', 'snack', [S, D], ['palak:150', 'milk:50', 'butter:3'], 'continental', ['quick']),
  d('moong_soup', 'Moong sprouts soup', 'Moong soup', 'મગનો સૂપ', 'snack', [S, D], ['sprouts:80', 'tomato:50', 'masala:2'], 'north', ['quick']),
];
