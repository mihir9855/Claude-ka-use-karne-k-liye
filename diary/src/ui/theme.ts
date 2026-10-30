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
const tint = (hero: string, accent: string, soft: string, onPrimary: string): Partial<Palette> => ({ hero, ink: accent, inkSoft: accent, primary: accent, accent, accentSoft: soft, primarySoft: soft, onPrimary });
export const ACCENTS: Record<string, Accent> = {
  haldi: { name: 'Haldi', swatch: '#FFB800', light: {}, dark: {} },
  pudina: { name: 'Pudina', swatch: '#6FD3A0', light: tint('#7FD8A8', '#0F7A4D', '#D3F0E0', '#FFFFFF'), dark: tint('#6FD3A0', '#6FD3A0', '#16301F', '#0F1A14') },
  jamun: { name: 'Jamun', swatch: '#B79BFF', light: tint('#C4AEFF', '#5B34C9', '#E6DDFF', '#FFFFFF'), dark: tint('#B79BFF', '#B79BFF', '#2A2142', '#17112B') },
  gulab: { name: 'Gulab', swatch: '#FF8FB3', light: tint('#FF9DBC', '#D6246E', '#FFDCE8', '#FFFFFF'), dark: tint('#FF8FB3', '#FF8FB3', '#3D1D2A', '#2A0F1A') },
  neela: { name: 'Neela', swatch: '#7CB8FF', light: tint('#8CC3FF', '#1F5FD1', '#D9EAFF', '#FFFFFF'), dark: tint('#7CB8FF', '#7CB8FF', '#15283F', '#0B1829') },
};
export const ACCENT_IDS = Object.keys(ACCENTS);

let current: ThemeName = 'dark';
let accentId = 'haldi';

export const themeName = () => current;
export function setThemeName(n: ThemeName, accent: string = accentId) {
  current = n;
  accentId = ACCENTS[accent] ? accent : 'haldi';
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
