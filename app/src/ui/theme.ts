// "Paper and ink": a warm off-white page, near-black ink, thin lines, and one terracotta accent.
export const C = {
  bg: '#FAF9F6',
  card: '#FFFFFF',
  surface: '#F1EFE9',
  text: '#1A1A18',
  muted: '#77746B',
  line: '#E7E4DC',
  ink: '#1A1A18',
  inkSoft: '#2E2D2A',
  primary: '#1A1A18',
  primarySoft: '#EFEDE6',
  onPrimary: '#FFFFFF',
  accent: '#C2410C',
  accentSoft: '#FBEADF',
  good: '#2F7D5B',
  goodSoft: '#E3F1EA',
  danger: '#B42318',
  dangerSoft: '#FBE7E4',
  // legacy names used by older screens
  header: '#1A1A18',
  headerSoft: '#2E2D2A',
};

/** One small dot colour per time of day. The tile itself stays plain. */
export const MEAL = {
  breakfast: { strong: '#1A1A18', soft: '#F6F3EC', ink: '#3A3833' },
  midmorning: { strong: '#4A4843', soft: '#F6F3EC', ink: '#3A3833' },
  lunch: { strong: '#77746B', soft: '#F6F3EC', ink: '#3A3833' },
  evening: { strong: '#A19D91', soft: '#F6F3EC', ink: '#3A3833' },
  dinner: { strong: '#C5C1B5', soft: '#F6F3EC', ink: '#3A3833' },
  bedtime: { strong: '#DDD9CD', soft: '#F6F3EC', ink: '#3A3833' },
} as const;

export const R = 12;
export const RADIUS = { sm: 8, md: 10, lg: 12, xl: 14, pill: 999 };

/** Font families, one per weight (React Native cannot synthesise weights for custom fonts). */
export const FONT = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  heavy: 'Inter_700Bold',
};

/** Flat look: no shadow, just a thin line around cards. */
export const SHADOW = {
  borderWidth: 1,
  borderColor: '#E7E4DC',
} as const;
