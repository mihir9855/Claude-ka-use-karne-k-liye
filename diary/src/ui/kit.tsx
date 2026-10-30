import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text, TextInput } from './Text';
import { C, RADIUS, SHADOW, themed } from './theme';

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
      style={({ pressed }) => [s.btn, { backgroundColor: bg }, kind === 'outline' && { borderWidth: 1, borderColor: C.line }, pressed && { opacity: 0.75 }]}
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
      {icon && <Icon name={icon} size={15} color={on ? C.onPrimary : C.muted} width={2} />}
      <Text style={[s.chipText, on && { color: C.onPrimary, fontWeight: '700' }]} {...ONE_LINE}>
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

export function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={s.barBg}>
      <View style={[s.barFg, { width: `${pct * 100}%` }, color ? { backgroundColor: color } : null]} />
    </View>
  );
}

export function Choice({ title, sub, on, onPress }: { title: string; sub?: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityLabel={title} accessibilityState={{ selected: on }} onPress={onPress} style={[s.choice, on && { borderColor: C.accent, backgroundColor: C.accentSoft }]}>
      <View style={[s.dot, on && { borderColor: C.accent }]}>{on && <View style={s.dotIn} />}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.choiceTitle} {...ONE_LINE}>
          {title}
        </Text>
        {sub ? (
          <Text style={s.choiceSub} {...ONE_LINE}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, numeric, placeholder }: { label: string; value: string; onChangeText: (v: string) => void; numeric?: boolean; placeholder?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
      <Text style={s.fieldLabel} {...ONE_LINE}>
        {label}
      </Text>
      <TextInput style={s.input} value={value} onChangeText={onChangeText} keyboardType={numeric ? 'numeric' : 'default'} placeholder={placeholder} placeholderTextColor={C.muted} accessibilityLabel={label} />
    </View>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={s.muted}>{children}</Text>;
}

const s = themed(() => StyleSheet.create({
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: RADIUS.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  dotIn: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.accent },
  choiceTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  choiceSub: { fontSize: 12, color: C.muted },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.text, minHeight: 46 },
  label: { fontFamily: 'display', fontSize: 20, fontWeight: '800', color: C.text },
  card: { backgroundColor: C.card, borderRadius: RADIUS.lg, padding: 16, gap: 12, ...SHADOW },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, paddingHorizontal: 20, borderRadius: RADIUS.pill },
  btnText: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, maxWidth: '100%' },
  chipText: { fontSize: 14, color: C.text, fontWeight: '500', flexShrink: 1 },
  pill: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: RADIUS.sm, maxWidth: '100%' },
  pillText: { fontSize: 12, fontWeight: '700' },
  barBg: { height: 12, backgroundColor: C.surface, borderRadius: 6, overflow: 'hidden' },
  barFg: { height: 12, borderRadius: 6, backgroundColor: C.ink },
  muted: { fontSize: 14, color: C.muted, lineHeight: 20 },
}));
