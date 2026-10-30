import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_ORDER, daysAgo, hints, nextSlot, splitNames, totalsFor, type SlotId } from '../core/diary';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { Bar, Button, Card, Chip, Label, Muted } from './kit';
import { SLOT_ICON_ID, slotLabel } from './slots';
import { Text, TextInput } from './Text';
import { C, RADIUS } from './theme';

const DAYS = [
  { off: 0, label: 'Today' },
  { off: 1, label: 'Yesterday' },
  { off: 2, label: '2 days ago' },
];

export function TodayScreen() {
  const entries = useStore((s) => s.entries);
  const target = useStore((s) => s.target);
  const add = useStore((s) => s.add);
  const remove = useStore((s) => s.remove);
  const [off, setOff] = useState(0);
  const [slot, setSlot] = useState<SlotId>(() => nextSlot(entries));
  const [text, setText] = useState('');
  const date = daysAgo(off);
  const tot = useMemo(() => totalsFor(entries, date), [entries, date]);
  const day = useMemo(() => entries.filter((e) => e.date === date), [entries, date]);
  const suggestions = hints(text.split(',').pop() ?? '');

  const submit = () => {
    const names = splitNames(text);
    if (!names.length) return;
    add(names, slot, date);
    setText('');
  };
  const fill = (name: string) => {
    const parts = text.split(',');
    parts[parts.length - 1] = ` ${name}`;
    setText(parts.join(',').replace(/^\s+/, ''));
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <View style={s.row}>
        {DAYS.map((d) => (
          <Chip key={d.off} label={d.label} on={off === d.off} onPress={() => setOff(d.off)} />
        ))}
      </View>

      <Card>
        <Label>What did you eat?</Label>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="poha, chai, dal tadka"
          placeholderTextColor={C.muted}
          accessibilityLabel="What you ate"
          returnKeyType="done"
          onSubmitEditing={submit}
          autoCapitalize="none"
        />
        {suggestions.length > 0 && (
          <View style={s.row}>
            {suggestions.map((n) => (
              <Chip key={n} label={n} onPress={() => fill(n)} />
            ))}
          </View>
        )}
        <View style={s.slots}>
          {SLOT_ORDER.map((id) => (
            <Pressable key={id} accessibilityRole="button" accessibilityLabel={slotLabel(id)} accessibilityState={{ selected: slot === id }} onPress={() => setSlot(id)} style={[s.slot, slot === id && s.slotOn]}>
              <Icon name={SLOT_ICON_ID[id]} size={18} color={slot === id ? '#fff' : C.muted} width={1.8} />
              <Text style={[s.slotText, slot === id && { color: '#fff' }]} numberOfLines={1}>
                {slotLabel(id)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button icon="plus" label="Add" onPress={submit} />
        <Muted>Type only the names. Separate several dishes with a comma.</Muted>
      </Card>

      <View style={s.meters}>
        <Meter label="Calories" value={tot.kcal} goal={target.kcal} unit="kcal" />
        <Meter label="Protein" value={tot.protein} goal={target.protein} unit="g" />
      </View>
      {tot.unknown > 0 && <Muted>{`${tot.unknown} ${tot.unknown === 1 ? 'item has' : 'items have'} no nutrition in the library, so ${tot.unknown === 1 ? 'it is' : 'they are'} not counted.`}</Muted>}

      {day.length === 0 ? (
        <Muted>{`Nothing logged for ${DAYS[off].label.toLowerCase()} yet.`}</Muted>
      ) : (
        SLOT_ORDER.map((id) => {
          const rows = day.filter((e) => e.slot === id);
          if (!rows.length) return null;
          return (
            <View key={id} style={{ gap: 2 }}>
              <View style={s.groupHead}>
                <Icon name={SLOT_ICON_ID[id]} size={16} color={C.muted} width={1.8} />
                <Text style={s.groupText}>{slotLabel(id)}</Text>
              </View>
              {rows.map((e) => (
                <View key={e.id} style={s.entry}>
                  <Text style={s.entryName} numberOfLines={1}>
                    {e.name}
                  </Text>
                  <Text style={s.entryNum} numberOfLines={1}>
                    {e.kcal != null ? `${e.kcal} kcal · ${e.protein} g` : 'no data'}
                  </Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${e.name}`} onPress={() => remove(e.id)} hitSlop={8} style={s.x}>
                    <Icon name="close" size={18} color={C.muted} width={2} />
                  </Pressable>
                </View>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function Meter({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  return (
    <View style={s.meter}>
      <Label>{label}</Label>
      <Text style={s.meterBig} numberOfLines={1}>
        {Math.round(value)}
        <Text style={s.meterSmall}>{` / ${goal} ${unit}`}</Text>
      </Text>
      <Bar value={value} max={goal} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 28 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.text, minHeight: 48 },
  slots: { flexDirection: 'row', gap: 6 },
  slot: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.line },
  slotOn: { backgroundColor: C.ink, borderColor: C.ink },
  slotText: { fontSize: 12, fontWeight: '500', color: C.muted, maxWidth: '100%' },
  meters: { flexDirection: 'row', gap: 16 },
  meter: { flex: 1, minWidth: 0, gap: 6 },
  meterBig: { fontSize: 22, fontWeight: '700', color: C.text },
  meterSmall: { fontSize: 13, fontWeight: '400', color: C.muted },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6, paddingBottom: 2 },
  groupText: { fontSize: 13, fontWeight: '600', color: C.muted },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46, borderTopWidth: 1, borderTopColor: C.line },
  entryName: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '500', color: C.text },
  entryNum: { fontSize: 13, color: C.muted, maxWidth: '45%' },
  x: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
