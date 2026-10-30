import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { C, RADIUS, SHADOW } from './theme';

const ONE_LINE = { numberOfLines: 1, ellipsizeMode: 'tail' } as const;

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text style={s.label} {...ONE_LINE}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Button({ label, onPress, icon, kind = 'primary' }: { label: string; onPress: () => void; icon?: IconName; kind?: 'primary' | 'soft' | 'outline' | 'danger' }) {
  const fg = kind === 'primary' ? C.onPrimary : kind === 'danger' ? C.danger : C.text;
  const bg = kind === 'primary' ? C.ink : kind === 'danger' ? C.dangerSoft : kind === 'soft' ? C.surface : C.card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: bg }, kind === 'outline' && { borderWidth: 1, borderColor: C.ink }, pressed && { opacity: 0.75 }]}
    >
      {icon && <Icon name={icon} size={17} color={fg} width={2.2} />}
      <Text style={[s.btnText, { color: fg }]} {...ONE_LINE}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, on, onPress, icon }: { label: string; on?: boolean; onPress: () => void; icon?: IconName }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={({ pressed }) => [s.chip, on && { backgroundColor: C.ink, borderColor: C.ink }, pressed && { opacity: 0.75 }]}
    >
      {icon && <Icon name={icon} size={15} color={on ? '#fff' : C.muted} width={2} />}
      <Text style={[s.chipText, on && { color: '#fff', fontWeight: '700' }]} {...ONE_LINE}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({ label, warn }: { label: string; warn?: boolean }) {
  return (
    <View style={[s.pill, { backgroundColor: warn ? C.accentSoft : C.goodSoft }]}>
      <Text style={[s.pillText, { color: warn ? C.accent : C.good }]} {...ONE_LINE}>
        {label}
      </Text>
    </View>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={s.barBg}>
      <View style={[s.barFg, { width: `${pct * 100}%` }]} />
    </View>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={s.muted}>{children}</Text>;
}

const s = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.1 },
  card: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, gap: 12, ...SHADOW },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, paddingHorizontal: 16, borderRadius: RADIUS.md },
  btnText: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 12, borderRadius: RADIUS.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, maxWidth: '100%' },
  chipText: { fontSize: 14, color: C.text, fontWeight: '500', flexShrink: 1 },
  pill: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: RADIUS.sm, maxWidth: '100%' },
  pillText: { fontSize: 12, fontWeight: '700' },
  barBg: { height: 6, backgroundColor: C.surface, borderRadius: 3, overflow: 'hidden' },
  barFg: { height: 6, borderRadius: 3, backgroundColor: C.ink },
  muted: { fontSize: 14, color: C.muted, lineHeight: 20 },
});
