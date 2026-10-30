// "Rasoi at night": a dark kitchen-green page, warm cream text, and one marigold accent.
export const C = {
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
  borderWidth: 1,
  borderColor: '#2E3E33',
} as const;
