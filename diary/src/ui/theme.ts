// "Recipe-book": warm paper and ink with one terracotta accent, and a night-kitchen dark set. Colours are read through `C` at the moment they are used, so a theme change shows everywhere.
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
}

const dark: Palette = {
  bg: '#1C1713',
  card: '#26201A',
  surface: '#30281F',
  text: '#F2E9DA',
  muted: '#A8998A',
  line: '#3A3027',
  ink: '#E0805F',
  inkSoft: '#C96E4F',
  primary: '#E0805F',
  primarySoft: '#33231B',
  onPrimary: '#1C1713',
  accent: '#E0805F',
  accentSoft: '#33231B',
  good: '#A9C58C',
  goodSoft: '#2A3322',
  danger: '#F09A8C',
  dangerSoft: '#3E2420',
  header: '#1C1713',
  headerSoft: '#26201A',
};

const light: Palette = {
  bg: '#F6F0E4',
  card: '#FFFBF3',
  surface: '#EFE5D2',
  text: '#2B2118',
  muted: '#75675A',
  line: '#E3D8C3',
  ink: '#B5472B',
  inkSoft: '#9C3B22',
  primary: '#B5472B',
  primarySoft: '#F6DDD2',
  onPrimary: '#FFF8EE',
  accent: '#B5472B',
  accentSoft: '#F6DDD2',
  good: '#4F6B3A',
  goodSoft: '#E1E8D3',
  danger: '#A32D2D',
  dangerSoft: '#F5DAD6',
  header: '#F6F0E4',
  headerSoft: '#FFFBF3',
};

export const PALETTES = { dark, light };
export type ThemeName = keyof typeof PALETTES;
let current: ThemeName = 'dark';

export const themeName = () => current;
export function setThemeName(n: ThemeName) {
  current = n;
}

/** The colours of the theme in use. */
export const C = new Proxy({} as Palette, { get: (_t, k: string) => PALETTES[current][k as keyof Palette] });

/** Styles that are built once per theme, the first time a screen asks for them. */
export function themed<T extends object>(make: () => T): T {
  const cache: Partial<Record<ThemeName, T>> = {};
  return new Proxy({} as T, {
    get: (_t, prop) => {
      const set = (cache[current] ??= make());
      return set[prop as keyof T];
    },
  });
}

export const R = 14;
export const RADIUS = { sm: 8, md: 10, lg: 14, xl: 18, pill: 999 };

/** Font families, one per weight (React Native cannot synthesise weights for custom fonts). */
export const FONT = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semi: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  heavy: 'Manrope_800ExtraBold',
};

/** Headings and numerals use this serif. Use as `fontFamily: 'display'` in a text style. */
export const DISPLAY = { regular: 'Fraunces_400Regular', semi: 'Fraunces_600SemiBold', bold: 'Fraunces_700Bold' };

/** Flat look: no shadow, a thin line around cards. */
export const SHADOW = {
  get borderWidth() {
    return 1;
  },
  get borderColor() {
    return C.line;
  },
};
