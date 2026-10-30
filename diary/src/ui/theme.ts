// Neo-brutalist "sticker" look: flat bright tiles, thick black outlines, hard offset shadows with no blur, chunky type.
// Light and dark sets, and a few page colours to choose from. Colours are read through `C` when used, so a change shows everywhere.
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
  /** the big yellow block and the text on it */
  hero: string;
  onHero: string;
  mint: string;
}

/** Page colours to choose from. The bright tile colours stay the same on every page colour. */
export interface PageSet {
  name: string;
  swatch: string;
  bg: string;
  surface: string;
}
export const SETS: Record<string, PageSet> = {
  butter: { name: 'Butter', swatch: '#FFF1C1', bg: '#FFF1C1', surface: '#FFE49A' },
  mint: { name: 'Mint', swatch: '#D8F3E3', bg: '#D8F3E3', surface: '#B9E8CE' },
  sky: { name: 'Sky', swatch: '#D9ECFF', bg: '#D9ECFF', surface: '#B9DAF7' },
  lilac: { name: 'Lilac', swatch: '#E8DEFF', bg: '#E8DEFF', surface: '#D3C2FA' },
  pink: { name: 'Pink', swatch: '#FFD9E8', bg: '#FFD9E8', surface: '#FFB9D3' },
  paper: { name: 'Paper', swatch: '#F3EFE6', bg: '#F3EFE6', surface: '#E4DDCC' },
};
export const SET_IDS = Object.keys(SETS);

/** Flat tile colours, used for meals. Text on them is always TILE_INK. */
export const TILE = { yellow: '#FFE14A', green: '#7BE0A4', lilac: '#B9A6FF', orange: '#FF9B6B', blue: '#8FD3FF', pink: '#FFB3D1' };
export const TILE_INK = '#14110E';
export const TILE_CYCLE = [TILE.green, TILE.lilac, TILE.orange, TILE.blue, TILE.pink];

function light(set: PageSet): Palette {
  return {
    bg: set.bg, card: '#FFFFFF', surface: set.surface, text: '#14110E', muted: '#5A5148', line: '#14110E',
    ink: '#14110E', inkSoft: '#14110E', primary: '#14110E', primarySoft: set.surface, onPrimary: '#FFE14A',
    accent: '#14110E', accentSoft: set.surface, good: '#0E7A46', goodSoft: '#7BE0A4', danger: '#B3261E', dangerSoft: '#FFD0C7',
    header: set.bg, headerSoft: '#FFFFFF', hero: TILE.yellow, onHero: '#14110E', mint: '#2DBE7A',
  };
}
const dark: Palette = {
  bg: '#141210', card: '#211E1A', surface: '#2C2823', text: '#F5F0E6', muted: '#ABA397', line: '#F5F0E6',
  ink: '#FFE14A', inkSoft: '#FFE14A', primary: '#FFE14A', primarySoft: '#3A3419', onPrimary: '#14110E',
  accent: '#FFE14A', accentSoft: '#3A3419', good: '#7BE0A4', goodSoft: '#1D3A2A', danger: '#FF9A8A', dangerSoft: '#40231F',
  header: '#141210', headerSoft: '#211E1A', hero: TILE.yellow, onHero: '#14110E', mint: '#7BE0A4',
};

export type ThemeName = 'light' | 'dark';
let current: ThemeName = 'light';
let setId = 'butter';

export const themeName = () => current;
export function setThemeName(n: ThemeName, set: string = setId) {
  current = n;
  setId = SETS[set] ? set : 'butter';
}

/** The colours of the theme in use. */
export const C = new Proxy({} as Palette, {
  get: (_t, k: string) => (current === 'dark' ? dark : light(SETS[setId]))[k as keyof Palette],
});

/** Styles that are built once per theme, the first time a screen asks for them. */
export function themed<T extends object>(make: () => T): T {
  const cache: Record<string, T> = {};
  return new Proxy({} as T, {
    get: (_t, prop) => {
      const set = (cache[`${current}:${setId}`] ??= make());
      return set[prop as keyof T];
    },
  });
}

export const R = 14;
export const RADIUS = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 };
/** Outline thickness and how far the hard shadow is pushed down and right. */
export const BORDER = 2.5;
export const OFFSET = 4;

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
export const displayFonts = () => GROTESK;

/** Outline for anything that needs a plain bordered box. */
export const SHADOW = {
  get borderWidth() {
    return BORDER;
  },
  get borderColor() {
    return C.line;
  },
};
