import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon } from './Icon';
import { SLOT_ORDER, SLOT_LABEL, learned } from '../core/diary';
import { useStore } from '../state/store';
import { Button, Card, Label, Muted } from './kit';
import { Text, TextInput } from './Text';
import { C, RADIUS } from './theme';

const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

export function LearnedScreen({ onClose }: { onClose: () => void }) {
  const entries = useStore((s) => s.entries);
  const target = useStore((s) => s.target);
  const setTarget = useStore((s) => s.setTarget);
  const loadSample = useStore((s) => s.loadSample);
  const clearSample = useStore((s) => s.clearSample);
  const clearAll = useStore((s) => s.clearAll);
  const [sure, setSure] = useState(false);
  const info = useMemo(() => learned(entries), [entries]);
  const days = useMemo(() => {
    const by = new Map<string, string[]>();
    for (const e of entries) by.set(e.date, [...(by.get(e.date) ?? []), e.name]);
    return [...by.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);
  }, [entries]);
  const hasSample = entries.some((e) => e.sample);

  return (
    <View style={{ flex: 1 }}>
      <View style={s.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onClose} hitSlop={8} style={s.back}>
          <Icon name="back" size={22} color={C.text} width={2} />
        </Pressable>
        <Text style={s.barTitle} numberOfLines={1}>
          What I have learned
        </Text>
      </View>
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Card>
        <Label>What the app has learned</Label>
        {info.meals === 0 ? (
          <Muted>Log a few meals and your usual dishes will show up here.</Muted>
        ) : (
          <View>
            <Line tag="Days logged" value={String(info.days)} />
            {SLOT_ORDER.map((id) => (info.usual[id] ? <Line key={id} tag={SLOT_LABEL[id]} value={info.usual[id]!.name} n={info.usual[id]!.n} /> : null))}
            {info.top && <Line tag="Top dish" value={info.top.name} n={info.top.n} />}
          </View>
        )}
      </Card>

      <Card>
        <Label>Daily targets</Label>
        <View style={s.targets}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.fieldLabel}>Calories (kcal)</Text>
            <TextInput style={s.input} keyboardType="numeric" defaultValue={String(target.kcal)} onEndEditing={(e) => setTarget({ kcal: Math.min(5000, Math.max(800, num(e.nativeEvent.text))) })} accessibilityLabel="Calories target" />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.fieldLabel}>Protein (g)</Text>
            <TextInput style={s.input} keyboardType="numeric" defaultValue={String(target.protein)} onEndEditing={(e) => setTarget({ protein: Math.min(250, Math.max(20, num(e.nativeEvent.text))) })} accessibilityLabel="Protein target" />
          </View>
        </View>
      </Card>

      {days.length > 0 && (
        <View style={{ gap: 4 }}>
          <Label>Recent days</Label>
          {days.map(([date, names]) => (
            <View key={date} style={s.day}>
              <Text style={s.dayDate}>{date.slice(5).replace('-', '/')}</Text>
              <Text style={s.dayNames} numberOfLines={1}>
                {names.join(' · ')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Button kind="soft" label="Load sample meals" onPress={loadSample} />
        {hasSample && <Button kind="soft" label="Remove sample meals" onPress={clearSample} />}
        {sure ? (
          <View style={{ gap: 8 }}>
            <Muted>This deletes every meal you logged on this phone.</Muted>
            <Button
              kind="danger"
              label="Yes, delete everything"
              onPress={() => {
                clearAll();
                setSure(false);
              }}
            />
            <Button kind="soft" label="No" onPress={() => setSure(false)} />
          </View>
        ) : (
          <Button kind="danger" label="Delete all my data" onPress={() => setSure(true)} />
        )}
      </View>
    </ScrollView>
    </View>
  );
}

function Line({ tag, value, n }: { tag: string; value: string; n?: number }) {
  return (
    <View style={s.line}>
      <Text style={s.tag} numberOfLines={1}>
        {tag}
      </Text>
      <Text style={s.value} numberOfLines={1}>
        {value}
      </Text>
      {n != null && <Text style={s.n}>{`${n}×`}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  barTitle: { flex: 1, minWidth: 0, fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  page: { padding: 16, gap: 16, paddingBottom: 28 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42, borderTopWidth: 1, borderTopColor: C.line },
  tag: { width: 92, fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '500', color: C.text },
  n: { fontSize: 13, color: C.muted },
  targets: { flexDirection: 'row', gap: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.text, minHeight: 46 },
  day: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40, borderTopWidth: 1, borderTopColor: C.line },
  dayDate: { width: 44, fontSize: 13, fontWeight: '600', color: C.muted },
  dayNames: { flex: 1, minWidth: 0, fontSize: 14, color: C.text },
});
