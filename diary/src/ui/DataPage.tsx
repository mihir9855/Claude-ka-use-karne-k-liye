import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_LABEL, SLOT_ORDER, entryLabel, learned } from '../core/diary';
import { useActive, useStore } from '../state/store';
import { Button, Card, Label, Muted } from './kit';
import { Text } from './Text';
import { C, themed } from './theme';

/** What the app has learned, the recent days, sample meals, and delete. */
export function DataPage() {
  const { entries } = useActive();
  const loadSample = useStore((s) => s.loadSample);
  const clearSample = useStore((s) => s.clearSample);
  const clearAll = useStore((s) => s.clearAll);
  const [sure, setSure] = useState(false);
  const info = useMemo(() => learned(entries), [entries]);
  const days = useMemo(() => {
    const by = new Map<string, string[]>();
    for (const e of entries) by.set(e.date, [...(by.get(e.date) ?? []), entryLabel(e)]);
    return [...by.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14);
  }, [entries]);
  const hasSample = entries.some((e) => e.sample);

  return (
    <ScrollView contentContainerStyle={s.page}>
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

      {days.length > 0 && (
        <Card>
          <Label>Recent days</Label>
          {days.map(([date, names]) => (
            <View key={date} style={s.day}>
              <Text style={s.dayDate}>{date.slice(5).replace('-', '/')}</Text>
              <Text style={s.dayNames} numberOfLines={1}>{names.join(' · ')}</Text>
            </View>
          ))}
        </Card>
      )}

      <View style={{ gap: 10 }}>
        <Button kind="soft" label="Load sample meals" onPress={loadSample} />
        {hasSample && <Button kind="soft" label="Remove sample meals" onPress={clearSample} />}
        {sure ? (
          <View style={{ gap: 8 }}>
            <Muted>This deletes every meal and profile on this phone. Make a backup first if you may want them back.</Muted>
            <Button kind="danger" label="Yes, delete everything" onPress={() => { clearAll(); setSure(false); }} />
            <Button kind="soft" label="No" onPress={() => setSure(false)} />
          </View>
        ) : (
          <Button kind="danger" label="Delete all my data" onPress={() => setSure(true)} />
        )}
      </View>
    </ScrollView>
  );
}

function Line({ tag, value, n }: { tag: string; value: string; n?: number }) {
  return (
    <View style={s.line}>
      <Text style={s.tag} numberOfLines={1}>{tag}</Text>
      <Text style={s.value} numberOfLines={1}>{value}</Text>
      {n != null && <Text style={s.n}>{`${n}×`}</Text>}
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, gap: 16, paddingBottom: 32 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42, borderTopWidth: 2, borderTopColor: C.line },
  tag: { width: 92, fontSize: 12, fontWeight: '700', color: C.muted },
  value: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '600', color: C.text },
  n: { fontSize: 13, color: C.muted },
  day: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 38, borderTopWidth: 2, borderTopColor: C.line },
  dayDate: { width: 44, fontSize: 13, fontWeight: '700', color: C.muted },
  dayNames: { flex: 1, minWidth: 0, fontSize: 14, color: C.text },
}));
