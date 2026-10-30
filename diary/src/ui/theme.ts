// "Haldi": loud turmeric colour blocks on ivory (day) or near-black (night), ink-black type, one chilli accent. Colours are read through `C` at the moment they are used, so a theme change shows everywhere.
export interface Palette {
  bg: string;
  card: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
  ink: string;
  inkSoft: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  good: string;
  goodSoft: string;
  danger: string;
  dangerSoft: string;
  header: string;
  headerSoft: string;
  /** the big colour block (turmeric) and the text on it */
  hero: string;
  onHero: string;
  mint: string;
}

const dark: Palette = {
  bg: '#0F0D0B',
  card: '#1B1814',
  surface: '#27221C',
  text: '#FBF3E2',
  muted: '#A39A8B',
  line: '#2F2922',
  ink: '#FFB800',
  inkSoft: '#E0A000',
  primary: '#FFB800',
  primarySoft: '#33280A',
  onPrimary: '#17120D',
  accent: '#FFB800',
  accentSoft: '#33280A',
  good: '#5FD59B',
  goodSoft: '#17301F',
  danger: '#FF8A78',
  dangerSoft: '#3E211C',
  header: '#0F0D0B',
  headerSoft: '#1B1814',
  hero: '#FFB800',
  onHero: '#17120D',
  mint: '#5FD59B',
};

const light: Palette = {
  bg: '#FFF8E7',
  card: '#FFFFFF',
  surface: '#F6EBCF',
  text: '#17120D',
  muted: '#6B6254',
  line: '#EADFC2',
  ink: '#E8391D',
  inkSoft: '#C92E15',
  primary: '#E8391D',
  primarySoft: '#FFE0D8',
  onPrimary: '#FFFFFF',
  accent: '#E8391D',
  accentSoft: '#FFE0D8',
  good: '#12804F',
  goodSoft: '#D7F0E2',
  danger: '#B3261E',
  dangerSoft: '#F9DEDC',
  header: '#FFF8E7',
  headerSoft: '#FFFFFF',
  hero: '#FFB800',
  onHero: '#17120D',
  mint: '#12804F',
};

export const PALETTES = { dark, light };
export type ThemeName = keyof typeof PALETTES;

/** Colour themes: the loud block colour and the accent, for day and night. Everything else stays the same. */
export interface Accent {
  name: string;
  swatch: string;
  light: Partial<Palette>;
  dark: Partial<Palette>;
}
const tint = (hero: string, accent: string, soft: string, onPrimary: string, onHero = '#17120D'): Partial<Palette> => ({ hero, onHero, ink: accent, inkSoft: accent, primary: accent, accent, accentSoft: soft, primarySoft: soft, onPrimary });
export const ACCENTS: Record<string, Accent> = {
  mono: { name: 'Mono', swatch: '#17120D', light: tint('#17120D', '#17120D', '#E9E1CC', '#FFF8E7', '#FFF8E7'), dark: tint('#F4EFE3', '#F4EFE3', '#2A2620', '#17120D', '#17120D') },
  kesari: { name: 'Kesari', swatch: '#FF6A13', light: tint('#FF6A13', '#C84600', '#FFE3D1', '#FFFFFF'), dark: tint('#FF7A2B', '#FF8A45', '#3A200F', '#1F0E00') },
  laal: { name: 'Laal', swatch: '#D62839', light: tint('#D62839', '#C41E2E', '#FFDDE0', '#FFFFFF', '#FFFFFF'), dark: tint('#D62839', '#FF6B78', '#3D1519', '#2A0508', '#FFFFFF') },
  zamurd: { name: 'Zamurd', swatch: '#0B8A5A', light: tint('#0B8A5A', '#0B7A50', '#D6F0E3', '#FFFFFF', '#FFFFFF'), dark: tint('#0B8A5A', '#3DDC97', '#12301F', '#04170F', '#FFFFFF') },
  neel: { name: 'Neel', swatch: '#2B50E6', light: tint('#2B50E6', '#2B50E6', '#DCE4FF', '#FFFFFF', '#FFFFFF'), dark: tint('#2B50E6', '#7B97FF', '#161F45', '#0A1033', '#FFFFFF') },
  firozi: { name: 'Firozi', swatch: '#08808C', light: tint('#08808C', '#08808C', '#D2EEF0', '#FFFFFF', '#FFFFFF'), dark: tint('#08808C', '#2FD0DE', '#0F2E32', '#021A1D', '#FFFFFF') },
  magenta: { name: 'Magenta', swatch: '#A3128F', light: tint('#A3128F', '#A3128F', '#F6D9F1', '#FFFFFF', '#FFFFFF'), dark: tint('#A3128F', '#F06BDA', '#3A1536', '#2B0626', '#FFFFFF') },
  haldi: { name: 'Haldi', swatch: '#FFB800', light: {}, dark: {} },
};
export const ACCENT_IDS = Object.keys(ACCENTS);

/** Looks: whole-app designs. "classic" follows the light/dark and colour settings; the others carry their own palette. */
export type LookId = 'classic' | 'thali' | 'slip' | 'sun' | 'sticker';
export interface Look {
  name: string;
  sub: string;
  dark: boolean;
  palette?: Palette;
  display?: { regular: string; semi: string; bold: string };
  borderWidth?: number;
}
const base = (o: Partial<Palette> & Pick<Palette, 'bg' | 'card' | 'surface' | 'text' | 'muted' | 'line' | 'accent' | 'onPrimary' | 'hero' | 'onHero'>): Palette => ({
  ink: o.accent, inkSoft: o.accent, primary: o.accent, primarySoft: o.surface, accentSoft: o.surface,
  good: '#2E9E63', goodSoft: o.surface, danger: '#C0392B', dangerSoft: o.surface, header: o.bg, headerSoft: o.card, mint: '#2E9E63', ...o,
});
export const LOOKS: Record<LookId, Look> = {
  classic: { name: 'Classic', sub: 'Bold colour blocks. Light, dark and colours you choose', dark: false },
  thali: {
    name: 'The Thali', sub: 'Your day on a steel plate with five bowls', dark: true,
    palette: base({ bg: '#24170F', card: '#33231A', surface: '#3E2B20', text: '#F6E9D2', muted: '#BBA78C', line: '#4A3526', accent: '#F2B33D', onPrimary: '#241508', hero: '#F2B33D', onHero: '#241508', good: '#8BD3A0', goodSoft: '#27402F', danger: '#FF8A78', dangerSoft: '#4A2620', mint: '#8BD3A0' }),
  },
  slip: {
    name: 'The Order Slip', sub: 'Your day printed like a tiffin bill', dark: false,
    palette: base({ bg: '#F5F0E3', card: '#FFFBF0', surface: '#E9E2CF', text: '#1D1A14', muted: '#6A6354', line: '#CFC6AF', accent: '#C2371F', onPrimary: '#FFF8EE', hero: '#12372A', onHero: '#F5F0E3', good: '#1F6B4A', goodSoft: '#D9EBDD', danger: '#B3261E', dangerSoft: '#F5DAD6', mint: '#1F6B4A' }),
    display: { regular: 'IBMPlexMono_600SemiBold', semi: 'IBMPlexMono_600SemiBold', bold: 'IBMPlexMono_700Bold' },
  },
  sun: {
    name: 'The Sun Arc', sub: 'The sky changes with the time of day', dark: true,
    palette: base({ bg: '#1B1A4B', card: 'rgba(255,255,255,0.10)', surface: 'rgba(255,255,255,0.16)', text: '#FFF4E2', muted: '#CBC0E4', line: 'rgba(255,255,255,0.20)', accent: '#FFC857', onPrimary: '#2A1550', hero: '#FFC857', onHero: '#2A1550', good: '#8FE3B0', goodSoft: 'rgba(143,227,176,0.18)', danger: '#FFA090', dangerSoft: 'rgba(255,160,144,0.18)', mint: '#8FE3B0' }),
    display: { regular: 'DMSerifDisplay_400Regular', semi: 'DMSerifDisplay_400Regular', bold: 'DMSerifDisplay_400Regular' },
  },
  sticker: {
    name: 'Stickers', sub: 'Loud tiles with thick outlines', dark: false,
    palette: base({ bg: '#FFD9E8', card: '#FFFFFF', surface: '#FFEAF2', text: '#14110E', muted: '#5E5058', line: '#14110E', accent: '#14110E', onPrimary: '#FFE14A', hero: '#FFE14A', onHero: '#14110E', good: '#0E7A46', goodSoft: '#7BE0A4', danger: '#B3261E', dangerSoft: '#FFD0C7', mint: '#2DBE7A' }),
    borderWidth: 2.5,
  },
};
export const LOOK_IDS = Object.keys(LOOKS) as LookId[];

let current: ThemeName = 'dark';
let lookId: LookId = 'classic';
let accentId = 'mono';

export const themeName = () => current;
export const lookName = () => lookId;
export function setThemeName(n: ThemeName, accent: string = accentId, look: LookId = lookId) {
  current = n;
  lookId = LOOKS[look] ? look : 'classic';
  accentId = ACCENTS[accent] ? accent : 'mono';
}

/** The colours of the theme in use. */
export const C = new Proxy({} as Palette, {
  get: (_t, k: string) => {
    const pal = LOOKS[lookId].palette;
    if (pal) return pal[k as keyof Palette];
    return (ACCENTS[accentId][current] as Record<string, string>)[k] ?? PALETTES[current][k as keyof Palette];
  },
});

/** Styles that are built once per theme, the first time a screen asks for them. */
export function themed<T extends object>(make: () => T): T {
  const cache: Record<string, T> = {};
  return new Proxy({} as T, {
    get: (_t, prop) => {
      const set = (cache[`${lookId}:${current}:${accentId}`] ??= make());
      return set[prop as keyof T];
    },
  });
}

export const R = 14;
export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };

/** Font families, one per weight (React Native cannot synthesise weights for custom fonts). */
export const FONT = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semi: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  heavy: 'Manrope_800ExtraBold',
};

/** Headings and numerals use this chunky grotesque. Use as `fontFamily: 'display'` in a text style. */
const GROTESK = { regular: 'BricolageGrotesque_600SemiBold', semi: 'BricolageGrotesque_700Bold', bold: 'BricolageGrotesque_800ExtraBold' };
export const displayFonts = () => LOOKS[lookId].display ?? GROTESK;

/** Flat look: no shadow, a thin line around cards. */
export const SHADOW = {
  get borderWidth() {
    return LOOKS[lookId].borderWidth ?? 1;
  },
  get borderColor() {
    return C.line;
  },
};
