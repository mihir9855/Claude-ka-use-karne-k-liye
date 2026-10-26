// "Thali" look: deep indigo ink, grape as the main colour, and one warm colour per time of day.
export const C = {
  bg: '#F4F3FB',
  card: '#FFFFFF',
  surface: '#ECEAF8',
  text: '#17143C',
  muted: '#625F8C',
  line: '#E0DEF2',
  ink: '#17143C',
  inkSoft: '#2A2563',
  primary: '#5B45E0',
  primarySoft: '#E5E0FF',
  onPrimary: '#FFFFFF',
  accent: '#E8553A',
  accentSoft: '#FFE5DE',
  good: '#0E8C69',
  goodSoft: '#D6F4EA',
  danger: '#D1364A',
  dangerSoft: '#FDE4E7',
  // legacy names used by older screens
  header: '#17143C',
  headerSoft: '#2A2563',
};

/** One colour pair per time of day: strong for art, soft for tile backgrounds. */
export const MEAL = {
  breakfast: { strong: '#FFB020', soft: '#FFF1CE', ink: '#7A4B00' },
  midmorning: { strong: '#35C2E0', soft: '#D8F3FA', ink: '#0B5568' },
  lunch: { strong: '#FF6A4D', soft: '#FFE3DC', ink: '#8A2A17' },
  evening: { strong: '#19B58A', soft: '#D5F5EA', ink: '#0A5C44' },
  dinner: { strong: '#5B45E0', soft: '#E5E0FF', ink: '#2F2394' },
  bedtime: { strong: '#3B2F8F', soft: '#DDD8F5', ink: '#241B66' },
} as const;

export const R = 20;
export const RADIUS = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };

/** Font families, one per weight (React Native cannot synthesise weights for custom fonts). */
export const FONT = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  heavy: 'PlusJakartaSans_800ExtraBold',
};

/** Soft card shadow that also works on Android. */
export const SHADOW = {
  shadowColor: '#17143C',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;
