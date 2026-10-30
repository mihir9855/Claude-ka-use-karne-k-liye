import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChalkFill } from './Chalk';
import { Icon, type IconName } from './Icon';
import { Text, TextInput } from './Text';
import { BORDER, C, OFFSET, RADIUS, TILE, TILE_INK, themeName, themed } from './theme';

const ONE_LINE = { numberOfLines: 1, ellipsizeMode: 'tail' } as const;

/**
 * The building block of the look: a flat tile with a thick outline and a hard shadow pushed down and right.
 * `wrap` is for layout (width, flex), `style` is the tile itself. With `onPress` it sinks into its shadow when pressed.
 */
export function Tile({
  children, style, wrap, bg, onPress, label, role = 'button', radius = RADIUS.lg, offset = OFFSET, selected, disabled,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  wrap?: StyleProp<ViewStyle>;
  bg?: string;
  onPress?: () => void;
  label?: string;
  role?: 'button' | 'radio' | 'tab' | 'checkbox';
  radius?: number;
  offset?: number;
  selected?: boolean;
  disabled?: boolean;
}) {
  const [down, setDown] = useState(false);
  // at night the bright tiles look rubbed in with chalk
  const chalky = themeName() === 'dark' && bg != null && [TILE.yellow, TILE.green, TILE.lilac, TILE.orange, TILE.blue, TILE.pink].includes(bg);
  const box: StyleProp<ViewStyle> = [
    { backgroundColor: bg ?? C.card, borderWidth: BORDER, borderColor: C.line, borderRadius: radius },
    style,
    down && { transform: [{ translateX: offset - 1 }, { translateY: offset - 1 }] },
  ];
  return (
    <View style={[{ paddingRight: offset, paddingBottom: offset }, wrap]}>
      <View pointerEvents="none" style={{ position: 'absolute', left: offset, top: offset, right: 0, bottom: 0, borderRadius: radius, backgroundColor: C.shadow }} />
      {onPress ? (
        <Pressable accessibilityRole={role} accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress} onPressIn={() => setDown(true)} onPressOut={() => setDown(false)} style={box}>
          {chalky && <ChalkFill radius={radius - BORDER} />}
          {children}
        </Pressable>
      ) : (
        <View style={box}>
          {chalky && <ChalkFill radius={radius - BORDER} />}
          {children}
        </View>
      )}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text style={s.label} {...ONE_LINE}>
      {children}
    </Text>
  );
}

export function Card({ children, style, bg }: { children: ReactNode; style?: object; bg?: string }) {
  return (
    <Tile bg={bg} style={[s.card, style]}>
      {children}
    </Tile>
  );
}

export function Button({ label, onPress, icon, kind = 'primary' }: { label: string; onPress: () => void; icon?: IconName; kind?: 'primary' | 'soft' | 'outline' | 'danger' }) {
  const fg = kind === 'primary' ? C.onPrimary : kind === 'danger' ? C.danger : kind === 'soft' ? TILE_INK : C.text;
  const bg = kind === 'primary' ? C.ink : kind === 'danger' ? C.dangerSoft : kind === 'soft' ? '#FFE14A' : C.card;
  return (
    <Tile bg={bg} onPress={onPress} label={label} radius={RADIUS.pill} offset={3} style={s.btn}>
      {icon && <Icon name={icon} size={17} color={fg} width={2.4} />}
      <Text style={[s.btnText, { color: fg }]} {...ONE_LINE}>
        {label}
      </Text>
    </Tile>
  );
}

export function Chip({ label, on, onPress, icon }: { label: string; on?: boolean; onPress: () => void; icon?: IconName }) {
  const fg = on ? C.onPrimary : C.text;
  return (
    <Tile bg={on ? C.ink : C.card} onPress={onPress} label={label} selected={!!on} radius={RADIUS.pill} offset={2} wrap={{ maxWidth: '100%' }} style={s.chip}>
      {icon && <Icon name={icon} size={15} color={fg} width={2.2} />}
      <Text style={[s.chipText, { color: fg }, on && { fontWeight: '800' }]} {...ONE_LINE}>
        {label}
      </Text>
    </Tile>
  );
}

export function Pill({ label, warn }: { label: string; warn?: boolean }) {
  return (
    <View style={[s.pill, { backgroundColor: warn ? '#FF9B6B' : '#7BE0A4' }]}>
      <Text style={s.pillText} {...ONE_LINE}>
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
    <Tile bg={on ? '#FFE14A' : C.card} onPress={onPress} label={title} role="radio" selected={on} offset={3} style={s.choice}>
      <View style={[s.dot, on && { backgroundColor: TILE_INK, borderColor: TILE_INK }]}>{on && <Icon name="check" size={12} color="#FFE14A" width={3.5} />}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.choiceTitle, on && { color: TILE_INK }]} {...ONE_LINE}>
          {title}
        </Text>
        {sub ? (
          <Text style={[s.choiceSub, on && { color: TILE_INK }]} {...ONE_LINE}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Tile>
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
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 56 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: BORDER, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { fontFamily: 'script', fontSize: 24, lineHeight: 28, color: C.text },
  choiceSub: { fontSize: 12, color: C.muted, fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.text },
  input: { backgroundColor: C.card, borderWidth: BORDER, borderColor: C.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.text, minHeight: 48 },
  label: { fontFamily: 'script', fontSize: 28, lineHeight: 32, fontWeight: '800', color: C.text },
  card: { padding: 16, gap: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, paddingHorizontal: 20 },
  btnText: { fontSize: 15, fontWeight: '800', flexShrink: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14 },
  chipText: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  pill: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 9, borderRadius: RADIUS.pill, borderWidth: 2, borderColor: TILE_INK, maxWidth: '100%' },
  pillText: { fontSize: 12, fontWeight: '800', color: TILE_INK },
  barBg: { height: 14, backgroundColor: C.card, borderRadius: 7, borderWidth: 2, borderColor: C.line, overflow: 'hidden' },
  barFg: { height: '100%', backgroundColor: C.ink },
  muted: { fontSize: 14, color: C.muted, lineHeight: 20, fontWeight: '500' },
}));
