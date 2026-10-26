import type { Dish } from '../core/types';
import { d } from './dishBuilder';

const B = 'breakfast' as const;
const L = 'lunch' as const;
const D = 'dinner' as const;

// Gujarati, Maharashtrian and Rajasthani home cooking.
export const MORE_WEST: Dish[] = [
  d('sev_tamatar', 'Sev tamatar nu shaak', 'Sev tamatar', 'સેવ ટામેટાનું શાક', 'main', [L, D], ['tomato:150', 'besan:25', 'oil:10', 'jaggery:3', 'masala:3'], 'west'),
  d('undhiyu', 'Undhiyu', 'Undhiyu', 'ઊંધિયું', 'main', [L, D], ['raw_banana:40', 'aloo:50', 'sweet_potato:40', 'guar:40', 'matar:40', 'brinjal:40', 'oil:15', 'coconut:10', 'masala:4'], 'west'),
  d('bhinda_sabzi', 'Bhinda nu shaak', 'Bhindi sabzi', 'ભીંડાનું શાક', 'main', [L, D], ['bhindi:150', 'onion:40', 'besan:10', 'oil:10', 'masala:3'], 'west'),
  d('ringan_bataka', 'Ringan bataka nu shaak', 'Baingan aloo', 'રીંગણ બટાકાનું શાક', 'main', [L, D], ['brinjal:120', 'aloo:60', 'tomato:30', 'oil:10', 'masala:3'], 'west'),
  d('tindora_sabzi', 'Tindora nu shaak', 'Tindora sabzi', 'ટીંડોળાનું શાક', 'main', [L, D], ['tindora:180', 'besan:8', 'oil:9', 'masala:3'], 'west'),
  d('ravaiya', 'Ravaiya', 'Ravaiya', 'રવૈયા', 'main', [L, D], ['brinjal:80', 'aloo:60', 'raw_banana:40', 'coconut:10', 'peanuts:10', 'oil:12', 'masala:3'], 'west'),
  d('lauki_shaak', 'Dudhi nu shaak', 'Lauki sabzi', 'દૂધીનું શાક', 'main', [L, D], ['lauki:200', 'tomato:30', 'oil:8', 'masala:3'], 'west'),
  d('kobi_batata', 'Kobi bataka nu shaak', 'Patta gobi aloo', 'કોબી બટાકાનું શાક', 'main', [L, D], ['cabbage:120', 'aloo:60', 'oil:9', 'masala:3'], 'west'),
  d('mag_nu_shaak', 'Mag nu shaak (whole moong)', 'Moong sabzi', 'મગનું શાક', 'main', [L, D], ['sprouts:100', 'tomato:40', 'oil:8', 'masala:3'], 'west'),
  d('batata_bhaji', 'Batata bhaji', 'Aloo sabzi', 'બટાકાની સૂકી ભાજી', 'main', [L, D], ['aloo:150', 'onion:30', 'oil:8', 'masala:3'], 'west'),
  d('dal_dhokli', 'Dal dhokli', 'Dal dhokli', 'દાળ ઢોકળી', 'complete', [L, D], ['toor_dal:40', 'atta:40', 'peanuts:8', 'jaggery:5', 'oil:6', 'masala:3'], 'west'),
  d('khichdi_kadhi', 'Gujarati khichdi kadhi', 'Khichdi kadhi', 'ખીચડી કઢી', 'complete', [L, D], ['rice:50', 'moong_dal:30', 'curd:100', 'besan:20', 'ghee:8'], 'west'),
  d('vaghareli_khichdi', 'Vaghareli khichdi', 'Vaghareli khichdi', 'વઘારેલી ખીચડી', 'complete', [D], ['rice:50', 'toor_dal:20', 'moong_dal:20', 'ghee:8', 'peanuts:8'], 'west'),
  d('bajra_khichdi', 'Bajra khichdi', 'Bajra khichdi', 'બાજરાની ખીચડી', 'complete', [L, D], ['bajra:50', 'moong_dal:30', 'ghee:8'], 'west'),
  d('bharli_vangi', 'Bharli vangi', 'Bharli vangi', 'ભરેલા રીંગણ', 'main', [L, D], ['brinjal:200', 'peanuts:20', 'coconut:15', 'oil:12', 'masala:4'], 'west'),
  d('pithla', 'Pithla', 'Pithla', 'પીઠલા', 'main', [L, D], ['besan:50', 'onion:30', 'oil:10', 'masala:3'], 'west'),
  d('zunka', 'Zunka', 'Zunka', 'ઝુણકા', 'main', [L, D], ['besan:50', 'onion:30', 'oil:12', 'masala:3'], 'west'),
  d('matki_usal', 'Matki usal', 'Matki usal', 'મઠની ઉસળ', 'main', [L, D], ['moth:60', 'onion:30', 'tomato:40', 'oil:8', 'masala:4'], 'west'),
  d('amti_dal', 'Amti dal', 'Amti dal', 'આમટી દાળ', 'main', [L, D], ['toor_dal:50', 'jaggery:5', 'coconut:10', 'tamarind:5', 'oil:6', 'masala:3'], 'west'),
  d('varan_bhaat', 'Varan bhaat', 'Varan bhaat', 'વરણ ભાત', 'complete', [L, D], ['toor_dal:40', 'rice:60', 'ghee:6'], 'west'),
  d('pav_bhaji', 'Pav bhaji', 'Pav bhaji', 'પાવ ભાજી', 'complete', [L, D], ['aloo:100', 'cauliflower:40', 'matar:30', 'tomato:60', 'bread:70', 'butter:12', 'onion:30', 'masala:5'], 'west'),
  d('sev_usal', 'Usal with bread', 'Usal pav', 'ઉસળ પાવ', 'complete', [B, L], ['matar:80', 'bread:60', 'onion:30', 'tomato:40', 'oil:8', 'masala:4'], 'west'),
  d('gujarati_kadhi_light', 'Light buttermilk kadhi', 'Chaas kadhi', 'છાશની કઢી', 'main', [L, D], ['curd:150', 'besan:15', 'ghee:3', 'ginger:3', 'masala:2'], 'west', ['quick']),
  d('rajasthani_dal', 'Panchmel dal', 'Panchmel dal', 'પંચમેલ દાળ', 'main', [L, D], ['toor_dal:15', 'moong_dal:10', 'chana_dal:10', 'masoor_dal:10', 'urad_dal:8', 'ghee:6', 'masala:3'], 'west'),
  d('kobi_sambharo', 'Cabbage carrot sambharo', 'Patta gobi sambharo', 'કોબી ગાજરનો સંભારો', 'side', [L, D], ['cabbage:60', 'carrot:40', 'oil:4', 'lemon:5'], 'west', ['quick']),
];
