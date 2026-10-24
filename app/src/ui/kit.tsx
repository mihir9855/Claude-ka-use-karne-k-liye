import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { C, R } from './theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function H({ children }: { children: ReactNode }) {
  return <Text style={s.h}>{children}</Text>;
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[s.muted, style]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  small,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost' | 'danger';
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        kind === 'ghost' && s.btnGhost,
        kind === 'danger' && s.btnDanger,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[s.btnText, kind !== 'primary' && { color: kind === 'danger' ? C.danger : C.primary }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  on,
  onPress,
  tone = 'primary',
}: {
  label: string;
  on?: boolean;
  onPress?: () => void;
  tone?: 'primary' | 'accent';
}) {
  const color = tone === 'accent' ? C.accent : C.primary;
  const soft = tone === 'accent' ? C.accentSoft : C.primarySoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={[s.chip, on && { backgroundColor: soft, borderColor: color }]}
    >
      <Text style={[s.chipText, on && { color, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.row, style]}>{children}</View>;
}

export function Field({ label, ...p }: TextInputProps & { label: string }) {
  return (
    <View style={{ flex: 1, minWidth: 90 }}>
      <Label>{label}</Label>
      <TextInput placeholderTextColor={C.muted} {...p} style={s.input} />
    </View>
  );
}

export function Bar({ value, max, color = C.primary }: { value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={s.barBg}>
      <View style={[s.barFg, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: R, borderWidth: 1, borderColor: C.border, padding: 14, gap: 8 },
  h: { fontSize: 20, fontWeight: '800', color: C.text },
  label: { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  muted: { fontSize: 13, color: C.muted },
  btn: { backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center' },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.primary },
  btnDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.danger },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  chipText: { color: C.text, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9, fontSize: 16, color: C.text, backgroundColor: '#fff' },
  barBg: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  barFg: { height: 8, borderRadius: 4 },
});
