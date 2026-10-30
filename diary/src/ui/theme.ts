// "Rasoi at night" by default: a dark kitchen-green page, warm cream text and one marigold accent. A light set is
// there too. Colours are read through `C` at the moment they are used, so a theme change shows everywhere.
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
  bg: '#101713',
  card: '#1B261F',
  surface: '#233128',
  text: '#F3EFE4',
  muted: '#9AA79C',
  line: '#2E3E33',
  ink: '#F2B138',
  inkSoft: '#D99A1F',
  primary: '#F2B138',
  primarySoft: '#2A2A17',
  onPrimary: '#1B1405',
  accent: '#F2B138',
  accentSoft: '#33290F',
  good: '#7DD3A8',
  goodSoft: '#1D3A2C',
  danger: '#F28B82',
  dangerSoft: '#3D2220',
  header: '#101713',
  headerSoft: '#1B261F',
};

const light: Palette = {
  bg: '#F7F4EA',
  card: '#FFFFFF',
  surface: '#ECE8DB',
  text: '#1C241E',
  muted: '#68726A',
  line: '#DDD8C8',
  ink: '#E5A21B',
  inkSoft: '#C98A0E',
  primary: '#E5A21B',
  primarySoft: '#FBEFD2',
  onPrimary: '#1B1405',
  accent: '#E5A21B',
  accentSoft: '#FBEFD2',
  good: '#1F7A55',
  goodSoft: '#DDEFE4',
  danger: '#B3362B',
  dangerSoft: '#F8E2DF',
  header: '#F7F4EA',
  headerSoft: '#FFFFFF',
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
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

/** Font families, one per weight (React Native cannot synthesise weights for custom fonts). */
export const FONT = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semi: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  heavy: 'Manrope_800ExtraBold',
};

/** Flat look: no shadow, a thin line around cards. */
export const SHADOW = {
  get borderWidth() {
    return 1;
  },
  get borderColor() {
    return C.line;
  },
};
