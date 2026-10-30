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
  /** colour of the hard shadow under tiles (ink in the day, chalk dust at night) */
  shadow: string;
}

/** Page colours to choose from. The bright tile colours stay the same on every page colour. */
export interface PageSet {
  name: string;
  swatch: string;
  bg: string;
  surface: string;
}
export const SETS: Record<string, PageSet> = {
  paper: { name: 'Paper', swatch: '#F3EFE6', bg: '#F3EFE6', surface: '#E4DDCC' },
};
export const SET_IDS = Object.keys(SETS);

/** Flat tile colours, used for meals. Brighter in the day, chalk pastels at night. Text on them is always TILE_INK. */
const TILE_DAY = { yellow: '#FFE14A', green: '#7BE0A4', lilac: '#B9A6FF', orange: '#FF9B6B', blue: '#8FD3FF', pink: '#FFB3D1' };
const TILE_NIGHT = { yellow: '#F6E27A', green: '#9BD8B0', lilac: '#C6B8EE', orange: '#F2AD92', blue: '#9FCDE8', pink: '#F0B8CE' };
export const TILE = new Proxy({} as typeof TILE_DAY, { get: (_t, k: string) => (current === 'dark' ? TILE_NIGHT : TILE_DAY)[k as keyof typeof TILE_DAY] });
export const TILE_INK = '#14110E';
const CYCLE_KEYS = ['green', 'lilac', 'orange', 'blue', 'pink'] as const;
export const TILE_CYCLE = new Proxy([] as string[], { get: (_t, k) => (k === 'length' ? CYCLE_KEYS.length : typeof k === 'string' && /^\d+$/.test(k) ? TILE[CYCLE_KEYS[Number(k)]] : undefined) });

function light(set: PageSet): Palette {
  return {
    bg: set.bg, card: '#FFFFFF', surface: set.surface, text: '#14110E', muted: '#5A5148', line: '#14110E',
    ink: '#14110E', inkSoft: '#14110E', primary: '#14110E', primarySoft: set.surface, onPrimary: '#FFE14A',
    accent: '#14110E', accentSoft: set.surface, good: '#0E7A46', goodSoft: '#7BE0A4', danger: '#B3261E', dangerSoft: '#FFD0C7',
    header: set.bg, headerSoft: '#FFFFFF', hero: TILE.yellow, onHero: '#14110E', mint: '#2DBE7A', shadow: '#14110E',
  };
}
// Night is a blackboard: black board, chalk-white writing and outlines, chalk-pastel tiles, and shadows like chalk dust.
const dark: Palette = {
  bg: '#161616', card: '#212121', surface: '#2D2D2D', text: '#F3F0E6', muted: '#B4B2AB', line: '#F3F0E6',
  ink: '#F6E27A', inkSoft: '#F6E27A', primary: '#F6E27A', primarySoft: '#3A3720', onPrimary: '#161616',
  accent: '#F6E27A', accentSoft: '#3A3720', good: '#9BD8B0', goodSoft: '#243A2E', danger: '#F4A99B', dangerSoft: '#42302D',
  header: '#161616', headerSoft: '#212121', hero: '#F6E27A', onHero: '#161616', mint: '#9BD8B0', shadow: 'rgba(243,240,230,0.30)',
};

export type ThemeName = 'light' | 'dark';
let current: ThemeName = 'light';
let setId = 'paper';

export const themeName = () => current;
export function setThemeName(n: ThemeName, set: string = setId) {
  current = n;
  setId = SETS[set] ? set : 'paper';
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
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semi: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
  heavy: 'SpaceGrotesk_700Bold',
};

/** Headings and numerals use this heavy poster face (Archivo Black); body text is Space Grotesk. Use as `fontFamily: 'display'` in a text style. */
const GROTESK = { regular: 'ArchivoBlack_400Regular', semi: 'ArchivoBlack_400Regular', bold: 'ArchivoBlack_400Regular' };
export const displayFonts = () => GROTESK;
/** Big screen titles use this handwritten script (Oooh Baby). Use as `fontFamily: 'script'`. */
export const SCRIPT = 'OoohBaby_400Regular';

/** Outline for anything that needs a plain bordered box. */
export const SHADOW = {
  get borderWidth() {
    return BORDER;
  },
  get borderColor() {
    return C.line;
  },
};
