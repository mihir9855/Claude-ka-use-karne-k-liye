import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_ORDER, nextSlot, suggest, ymd, type SlotId } from '../core/diary';
import { useStore } from '../state/store';
import { LineScene } from './Icon';
import { Button, Card, Chip, Label, Muted, Pill } from './kit';
import { slotLabel } from './slots';
import { Text } from './Text';
import { C } from './theme';

export function NextScreen() {
  const entries = useStore((s) => s.entries);
  const target = useStore((s) => s.target);
  const add = useStore((s) => s.add);
  const loadSample = useStore((s) => s.loadSample);
  const [slot, setSlot] = useState<SlotId>(() => nextSlot(entries));
  const [note, setNote] = useState('');
  const items = useMemo(() => suggest(entries, slot, target), [entries, slot, target]);

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Label>Suggest for</Label>
      <View style={s.row}>
        {SLOT_ORDER.map((id) => (
          <Chip key={id} label={slotLabel(id)} on={slot === id} onPress={() => setSlot(id)} />
        ))}
      </View>

      {entries.length < 6 && (
        <View style={s.empty}>
          <LineScene size={130} />
          <Muted>These are starting ideas. Log what you eat for a few days and the suggestions will follow your habits.</Muted>
          <Button kind="outline" label="Try with sample meals" onPress={loadSample} />
        </View>
      )}

      {!!note && <Muted>{note}</Muted>}

      {items.map((c) => (
        <Card key={c.name}>
          <View style={s.top}>
            <Text style={s.name} numberOfLines={1}>
              {c.name}
            </Text>
            {c.kcal != null && (
              <Text style={s.num} numberOfLines={1}>
                {`${c.kcal} kcal · ${c.protein} g`}
              </Text>
            )}
          </View>
          <View style={s.why}>
            {c.why.map((w) => (
              <Pill key={w.text} label={w.text} warn={w.warn} />
            ))}
          </View>
          <Button
            kind="outline"
            icon="check"
            label="I ate this"
            onPress={() => {
              add([c.name], slot, ymd(new Date()));
              setNote(`Added ${c.name} to ${slotLabel(slot).toLowerCase()} today.`);
            }}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 16, gap: 14, paddingBottom: 28 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, minWidth: 0, fontSize: 18, fontWeight: '700', color: C.text, letterSpacing: -0.2 },
  num: { fontSize: 13, color: C.muted, maxWidth: '45%' },
  why: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
