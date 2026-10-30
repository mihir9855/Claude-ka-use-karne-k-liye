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

let current: ThemeName = 'dark';
let accentId = 'mono';

export const themeName = () => current;
export function setThemeName(n: ThemeName, accent: string = accentId) {
  current = n;
  accentId = ACCENTS[accent] ? accent : 'mono';
}

/** The colours of the theme in use. */
export const C = new Proxy({} as Palette, {
  get: (_t, k: string) => (ACCENTS[accentId][current] as Record<string, string>)[k] ?? PALETTES[current][k as keyof Palette],
});

/** Styles that are built once per theme, the first time a screen asks for them. */
export function themed<T extends object>(make: () => T): T {
  const cache: Record<string, T> = {};
  return new Proxy({} as T, {
    get: (_t, prop) => {
      const set = (cache[`${current}:${accentId}`] ??= make());
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
export const DISPLAY = { regular: 'BricolageGrotesque_600SemiBold', semi: 'BricolageGrotesque_700Bold', bold: 'BricolageGrotesque_800ExtraBold' };

/** Flat look: no shadow, a thin line around cards. */
export const SHADOW = {
  get borderWidth() {
    return 1;
  },
  get borderColor() {
    return C.line;
  },
};
