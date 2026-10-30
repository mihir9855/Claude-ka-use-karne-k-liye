import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ACTIVITIES, CONDITIONS, GOALS, MAX_PEOPLE, type Condition } from '../core/profile';
import { personName, useActive, useStore } from '../state/store';
import { Button, Card, Chip, Choice, Field, Label, Muted } from './kit';
import { Text } from './Text';
import { C, themed } from './theme';

const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

/** Who the diary is for: name, body, goal and health, one profile for each person. */
export function ProfilesPage() {
  const { person, target } = useActive();
  const persons = useStore((s) => s.persons);
  const setActive = useStore((s) => s.setActive);
  const update = useStore((s) => s.updatePerson);
  const addPerson = useStore((s) => s.addPerson);
  const removePerson = useStore((s) => s.removePerson);
  const [sure, setSure] = useState(false);
  const idx = persons.indexOf(person);
  const toggle = (c: Condition) => update(person.id, { conditions: person.conditions.includes(c) ? person.conditions.filter((x) => x !== c) : [...person.conditions, c] });

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

      {persons.length > 1 && (
        <View style={{ gap: 10 }}>
          {sure ? (
            <>
              <Muted>{`This removes ${personName(person, idx)} and their diary.`}</Muted>
              <Button kind="danger" label="Yes, remove" onPress={() => { removePerson(person.id); setSure(false); }} />
              <Button kind="soft" label="No" onPress={() => setSure(false)} />
            </>
          ) : (
            <Button kind="danger" label={`Remove ${personName(person, idx)}`} onPress={() => setSure(true)} />
          )}
        </View>
      )}
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

const s = themed(() => StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  three: { flexDirection: 'row', gap: 10 },
  kcal: { fontSize: 32, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  stat: { flexBasis: '22%', flexGrow: 1, minWidth: 0 },
  statV: { fontSize: 17, fontWeight: '800', color: C.text },
  statL: { fontSize: 11, color: C.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
}));
