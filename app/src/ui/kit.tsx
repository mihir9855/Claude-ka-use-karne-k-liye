import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Text, TextInput } from './Text';
import { Icon, type IconName } from './Icon';
import { C, RADIUS, SHADOW } from './theme';

/*
 * One rule for every compact element (button, chip, tab, tile title): the label stays on ONE line,
 * may shrink, and is cut with an ellipsis if it still does not fit. It never wraps or leaves its box.
 */
const ONE_LINE = { numberOfLines: 1, ellipsizeMode: 'tail' } as const;

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/** A coloured bento tile. */
export function Tile({ children, tint = C.card, style }: { children: ReactNode; tint?: string; style?: ViewStyle }) {
  return <View style={[s.tile, { backgroundColor: tint }, style]}>{children}</View>;
}

export function H({ children }: { children: ReactNode }) {
  return (
    <Text style={s.h} {...ONE_LINE}>
      {children}
    </Text>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text style={s.label} {...ONE_LINE}>
      {children}
    </Text>
  );
}

/** Helper text. May wrap: it sits in the page, never inside a tile or control. */
export function Muted({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[s.muted, style]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'soft' | 'danger' | 'ink';
  icon?: IconName;
}) {
  const fg = kind === 'primary' || kind === 'ink' ? '#fff' : kind === 'danger' ? C.danger : C.text;
  const bg = kind === 'primary' ? C.primary : kind === 'ink' ? C.ink : kind === 'danger' ? C.dangerSoft : C.surface;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: bg }, pressed && { opacity: 0.75 }]}
    >
      {icon && <Icon name={icon} size={17} color={fg} width={2.4} />}
      <Text style={[s.btnText, { color: fg }]} {...ONE_LINE}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  on,
  onPress,
  tone = 'primary',
  dim,
}: {
  label: string;
  on?: boolean;
  onPress?: () => void;
  tone?: 'primary' | 'accent';
  dim?: boolean;
}) {
  const color = tone === 'accent' ? C.accent : C.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={({ pressed }) => [s.chip, on && { backgroundColor: color, borderColor: color }, dim && { opacity: 0.4 }, pressed && { opacity: 0.75 }]}
    >
      <Text style={[s.chipText, on && { color: '#fff', fontWeight: '700' }]} {...ONE_LINE}>
        {label}
      </Text>
    </Pressable>
  );
}

/** On/off row: a one-line label and a switch. */
export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on }} onPress={() => onChange(!on)} style={s.toggleRow}>
      <Text style={s.toggleLabel} {...ONE_LINE}>
        {label}
      </Text>
      <View style={[s.track, on && { backgroundColor: C.primary }]}>
        <View style={[s.knob, on && { left: 24 }]} />
      </View>
    </Pressable>
  );
}

/** Small status label. */
export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'primary' }) {
  const map = {
    neutral: { bg: C.surface, fg: C.muted },
    good: { bg: C.goodSoft, fg: C.good },
    warn: { bg: C.accentSoft, fg: C.accent },
    bad: { bg: C.dangerSoft, fg: C.danger },
    primary: { bg: C.primarySoft, fg: C.primary },
  }[tone];
  return (
    <View style={[s.pill, { backgroundColor: map.bg }]}>
      <Text style={[s.pillText, { color: map.fg }]} {...ONE_LINE}>
        {label}
      </Text>
    </View>
  );
}

/** One row of mutually exclusive options; labels share the width equally and stay on one line. */
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
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[s.segItem, on && s.segOn]}
          >
            <Text style={[s.segText, on && { color: C.text, fontWeight: '700' }]} {...ONE_LINE} adjustsFontSizeToFit minimumFontScale={0.85}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Tap-to-open section: keeps long screens short. */
export function Collapse({
  title,
  summary,
  icon,
  lead,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary?: string;
  icon?: IconName;
  /** a picture shown before the title (replaces the icon) */
  lead?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={s.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={s.collapseHead}>
        {lead ? <View style={s.lead}>{lead}</View> : icon ? <Icon name={icon} size={20} color={C.primary} /> : null}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.collapseTitle} {...ONE_LINE}>
            {title}
          </Text>
          {!!summary && (
            <Text style={s.muted} {...ONE_LINE}>
              {summary}
            </Text>
          )}
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
      <TextInput placeholderTextColor={C.muted} accessibilityLabel={label} {...p} style={s.input} />
    </View>
  );
}

/** A tappable row with a radio dot, a title and one line of detail. */
export function Choice({ title, sub, on, onPress }: { title: string; sub?: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityLabel={title} accessibilityState={{ selected: on }} onPress={onPress} style={[s.choice, on && s.choiceOn]}>
      <View style={[s.choiceDot, on && { borderColor: C.primary }]}>{on && <View style={s.choiceIn} />}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.choiceTitle} numberOfLines={1}>
          {title}
        </Text>
        {sub ? (
          <Text style={s.choiceSub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
    </Pressable>
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
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg, backgroundColor: C.card, ...SHADOW },
  choiceOn: { borderColor: C.primary, backgroundColor: C.primarySoft },
  choiceDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  choiceIn: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
  choiceTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  choiceSub: { fontSize: 13, color: C.muted },
  card: { backgroundColor: C.card, borderRadius: RADIUS.lg, padding: 16, gap: 12, ...SHADOW },
  tile: { borderRadius: RADIUS.xl, padding: 16, gap: 10, overflow: 'hidden' },
  h: { fontSize: 26, fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: '700', color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  muted: { fontSize: 13, color: C.muted, lineHeight: 19 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, paddingHorizontal: 18, borderRadius: RADIUS.md, maxWidth: '100%' },
  btnText: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', minHeight: 38, paddingHorizontal: 14, borderRadius: RADIUS.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, maxWidth: '100%' },
  chipText: { fontSize: 14, color: C.text, fontWeight: '500', flexShrink: 1 },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: RADIUS.sm, maxWidth: '100%' },
  pillText: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.text, minHeight: 48 },
  barBg: { height: 8, backgroundColor: C.surface, borderRadius: 4, overflow: 'hidden' },
  barFg: { height: 8, borderRadius: 4 },
  seg: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: RADIUS.md, padding: 3 },
  segItem: { flex: 1, minWidth: 0, minHeight: 38, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.sm },
  segOn: { backgroundColor: C.card, ...SHADOW },
  segText: { fontSize: 14, fontWeight: '500', color: C.muted },
  lead: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  collapseHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, backgroundColor: C.card, borderRadius: RADIUS.lg, paddingHorizontal: 16, ...SHADOW },
  toggleLabel: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '600', color: C.text },
  track: { width: 52, height: 30, borderRadius: 15, backgroundColor: '#D8D5CB', justifyContent: 'center' },
  knob: { position: 'absolute', left: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  collapseTitle: { fontSize: 16, fontWeight: '700', color: C.text },
});
