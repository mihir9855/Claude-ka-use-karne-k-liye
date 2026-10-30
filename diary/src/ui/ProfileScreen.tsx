import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_LABEL, SLOT_ORDER, entryLabel, learned } from '../core/diary';
import { ACTIVITIES, CONDITIONS, GOALS, MAX_PEOPLE, type Condition } from '../core/profile';
import { personName, useActive, useStore } from '../state/store';
import { Button, Card, Chip, Choice, Field, Label, Muted } from './kit';
import { Text } from './Text';
import { C } from './theme';

const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

export function ProfileScreen() {
  const { person, target, entries } = useActive();
  const persons = useStore((s) => s.persons);
  const setActive = useStore((s) => s.setActive);
  const update = useStore((s) => s.updatePerson);
  const addPerson = useStore((s) => s.addPerson);
  const removePerson = useStore((s) => s.removePerson);
  const loadSample = useStore((s) => s.loadSample);
  const clearSample = useStore((s) => s.clearSample);
  const clearAll = useStore((s) => s.clearAll);
  const [sure, setSure] = useState<'person' | 'all' | null>(null);
  const info = useMemo(() => learned(entries), [entries]);
  const days = useMemo(() => {
    const by = new Map<string, string[]>();
    for (const e of entries) by.set(e.date, [...(by.get(e.date) ?? []), entryLabel(e)]);
    return [...by.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 10);
  }, [entries]);
  const idx = persons.indexOf(person);
  const toggle = (c: Condition) => update(person.id, { conditions: person.conditions.includes(c) ? person.conditions.filter((x) => x !== c) : [...person.conditions, c] });
  const hasSample = entries.some((e) => e.sample);

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <View style={s.row}>
        {persons.map((p, i) => (
          <Chip key={p.id} label={personName(p, i)} on={p.id === person.id} onPress={() => setActive(p.id)} />
        ))}
        {persons.length < MAX_PEOPLE && <Chip icon="plus" label="Add person" onPress={addPerson} />}
      </View>

      <Card>
        <Label>About {personName(person, idx)}</Label>
        <View style={s.row}>
          <Field label="Name" value={person.name} onChangeText={(v) => update(person.id, { name: v })} placeholder={idx === 0 ? 'Me' : `Person ${idx + 1}`} />
        </View>
        <View style={s.row}>
          <Chip label="Male" on={person.sex === 'male'} onPress={() => update(person.id, { sex: 'male' })} />
          <Chip label="Female" on={person.sex === 'female'} onPress={() => update(person.id, { sex: 'female' })} />
        </View>
        <View style={s.three}>
          <Field label="Age" numeric value={person.age ? String(person.age) : ''} onChangeText={(v) => update(person.id, { age: num(v) })} />
          <Field label="Height (cm)" numeric value={person.heightCm ? String(person.heightCm) : ''} onChangeText={(v) => update(person.id, { heightCm: num(v) })} />
          <Field label="Weight (kg)" numeric value={person.weightKg ? String(person.weightKg) : ''} onChangeText={(v) => update(person.id, { weightKg: num(v) })} />
        </View>
      </Card>

      <View style={{ gap: 8 }}>
        <Label>How active are you?</Label>
        {ACTIVITIES.map((a) => (
          <Choice key={a.id} title={a.label} sub={a.sub} on={person.activity === a.id} onPress={() => update(person.id, { activity: a.id })} />
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <Label>Goal</Label>
        {GOALS.map((g) => (
          <Choice key={g.id} title={g.label} sub={g.sub} on={person.goal === g.id} onPress={() => update(person.id, { goal: g.id })} />
        ))}
      </View>

      <Card>
        <Label>Health</Label>
        <View style={s.row}>
          {CONDITIONS.map((c) => (
            <Chip key={c.id} label={c.label} on={person.conditions.includes(c.id)} onPress={() => toggle(c.id)} />
          ))}
        </View>
        <Muted>Your menu avoids heavy dishes for these. "No dairy" and "No gluten" hide dishes by their names, so check the ingredients too. This is not medical advice.</Muted>
      </Card>

      <Card>
        <Label>Daily target</Label>
        <Text style={s.kcal} numberOfLines={1}>{`${target.kcal.toLocaleString('en-IN')} kcal`}</Text>
        <View style={s.row}>
          <Stat label="Protein" v={`${target.protein} g`} />
          <Stat label="Carbs" v={`${target.carbs} g`} />
          <Stat label="Fat" v={`${target.fat} g`} />
          <Stat label="Fibre" v={`${target.fiber} g`} />
        </View>
      </Card>

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
            <Muted>{sure === 'all' ? 'This deletes every meal and profile on this phone.' : `This removes ${personName(person, idx)} and their diary.`}</Muted>
            <Button
              kind="danger"
              label="Yes, delete"
              onPress={() => {
                if (sure === 'all') clearAll();
                else removePerson(person.id);
                setSure(null);
              }}
            />
            <Button kind="soft" label="No" onPress={() => setSure(null)} />
          </View>
        ) : (
          <>
            {persons.length > 1 && <Button kind="danger" label={`Remove ${personName(person, idx)}`} onPress={() => setSure('person')} />}
            <Button kind="danger" label="Delete all my data" onPress={() => setSure('all')} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statV} numberOfLines={1}>{v}</Text>
      <Text style={s.statL} numberOfLines={1}>{label}</Text>
    </View>
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

const s = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  three: { flexDirection: 'row', gap: 10 },
  kcal: { fontSize: 32, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  stat: { flexBasis: '22%', flexGrow: 1, minWidth: 0 },
  statV: { fontSize: 17, fontWeight: '800', color: C.text },
  statL: { fontSize: 11, color: C.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42, borderTopWidth: 1, borderTopColor: C.line },
  tag: { width: 92, fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '600', color: C.text },
  n: { fontSize: 13, color: C.muted },
  day: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 38, borderTopWidth: 1, borderTopColor: C.line },
  dayDate: { width: 44, fontSize: 13, fontWeight: '700', color: C.muted },
  dayNames: { flex: 1, minWidth: 0, fontSize: 14, color: C.text },
});
