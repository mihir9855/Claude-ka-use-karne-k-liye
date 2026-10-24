import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Icon, type IconName } from './Icon';
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
  icon,
}: {
  icon?: IconName;
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'soft' | 'danger';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        kind === 'soft' && { backgroundColor: C.surface },
        kind === 'danger' && { backgroundColor: 'transparent' },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon && <Icon name={icon} size={16} color={kind === 'primary' ? '#fff' : C.text} width={2.5} />}
        <Text
          style={[
            s.btnText,
            kind === 'soft' && { color: C.text },
            kind === 'danger' && { color: C.danger },
          ]}
        >
          {label}
        </Text>
      </View>
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={[s.chip, on && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[s.chipText, on && { color: '#fff', fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

/** One row of mutually exclusive options. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable
          key={String(o.value)}
          accessibilityRole="button"
          accessibilityState={{ selected: o.value === value }}
          onPress={() => onChange(o.value)}
          style={[s.segItem, o.value === value && s.segOn]}
        >
          <Text style={[s.segText, o.value === value && { color: C.text, fontWeight: '700' }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Tap-to-open section: keeps long screens short. */
export function Collapse({
  title,
  summary,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon?: IconName;
  summary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={s.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={s.collapseHead}>
        {icon && <Icon name={icon} size={20} color={C.primary} />}
        <View style={{ flex: 1 }}>
          <Text style={s.collapseTitle}>{title}</Text>
          {!!summary && <Text style={s.muted} numberOfLines={1}>{summary}</Text>}
        </View>
        <Icon name={open ? 'up' : 'down'} size={18} color={C.muted} />
      </Pressable>
      {open && <View style={{ gap: 12 }}>{children}</View>}
    </View>
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

export function Search(p: TextInputProps) {
  return <TextInput placeholderTextColor={C.muted} {...p} style={[s.input, { flex: 1 }]} />;
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
  card: { backgroundColor: C.surface, borderRadius: R, padding: 14, gap: 10 },
  h: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  muted: { fontSize: 13, color: C.muted },
  btn: { backgroundColor: C.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line },
  chipText: { color: C.text, fontSize: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.text },
  barBg: { height: 4, backgroundColor: C.line, borderRadius: 2, overflow: 'hidden' },
  barFg: { height: 4, borderRadius: 2 },
  seg: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 12, padding: 3 },
  segItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  segOn: { backgroundColor: '#fff' },
  segText: { fontSize: 14, color: C.muted },
  collapseHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  collapseTitle: { fontSize: 16, fontWeight: '700', color: C.text },
});
