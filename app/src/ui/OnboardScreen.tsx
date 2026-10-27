import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Pressable } from 'react-native';
import { computeTargets } from '../core/nutrition';
import type { Activity, Condition, Goal, Person } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { MealArt } from './Art';
import { CuisinePicker } from './CuisineScreen';
import { Button, Chip, Field, H, Label, Muted, Row, Segmented } from './kit';
import { PantryShelves } from './PantryPicker';
import { AddItem } from './PantryScreen';
import { C, RADIUS, SHADOW } from './theme';

const GOALS: Goal[] = ['fat_loss', 'maintain', 'muscle_gain'];
const CONDITIONS: Condition[] = [
  'diabetes', 'bp', 'thyroid', 'pcos', 'cholesterol', 'lactose', 'gluten',
  'kidney', 'peanut', 'soy', 'nuts', 'no_onion_garlic',
];
const ACTS: { id: Activity; title: string; sub: string }[] = [
  { id: 'sedentary', title: 'Sedentary', sub: 'Desk job, little exercise' },
  { id: 'light', title: 'Lightly active', sub: 'Light exercise 1-3 days a week' },
  { id: 'moderate', title: 'Moderately active', sub: 'Exercise or sport 3-5 days' },
  { id: 'active', title: 'Very active', sub: 'Hard exercise or physical job' },
];
const GOAL_INFO: Record<Goal, { title: string; sub: string }> = {
  fat_loss: { title: 'Lose weight', sub: 'Gentle calorie deficit' },
  maintain: { title: 'Maintain weight', sub: 'Stay where you are' },
  muscle_gain: { title: 'Gain lean mass', sub: 'More protein and calories' },
};
const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

function Choice({ title, sub, on, onPress }: { title: string; sub: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityLabel={title} accessibilityState={{ selected: on }} onPress={onPress} style={[o.row, on && o.rowOn]}>
      <View style={[o.dot, on && o.dotOn]}>{on && <View style={o.dotIn} />}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={o.title} numberOfLines={1}>{title}</Text>
        <Text style={o.sub} numberOfLines={1}>{sub}</Text>
      </View>
    </Pressable>
  );
}

function PersonStep({ index }: { index: number }) {
  const lang = useStore((s) => s.lang);
  const p = useStore((s) => s.persons[index]);
  const update = useStore((s) => s.updatePerson);
  const tx = (k: StrKey) => t(lang, k);
  const [ftIn, setFtIn] = useState(false);
  const inches = Math.round(p.heightCm / 2.54);
  const tg = computeTargets(p);
  const numField = (label: string, key: 'age' | 'heightCm' | 'weightKg') => (
    <Field label={label} keyboardType="numeric" value={p[key] ? String(p[key]) : ''} onChangeText={(v) => update(index, { [key]: num(v) } as Partial<Person>)} />
  );
  return (
    <View style={{ gap: 16 }}>
      <Field label={tx('name')} value={p.name} onChangeText={(v) => update(index, { name: v })} />
      <Segmented value={p.sex} onChange={(v) => update(index, { sex: v })} options={[{ value: 'male', label: tx('male') }, { value: 'female', label: tx('female') }]} />
      <Row style={{ flexWrap: 'nowrap' }}>
        {numField(tx('age'), 'age')}
        {numField(tx('weight'), 'weightKg')}
      </Row>
      <View style={{ gap: 8 }}>
        <Segmented value={ftIn ? 'ft' : 'cm'} onChange={(v) => setFtIn(v === 'ft')} options={[{ value: 'cm', label: 'cm' }, { value: 'ft', label: 'ft / in' }]} />
        {ftIn ? (
          <Row style={{ flexWrap: 'nowrap' }}>
            <Field label="Feet" keyboardType="numeric" value={String(Math.floor(inches / 12))} onChangeText={(v) => update(index, { heightCm: Math.round((num(v) * 12 + (inches % 12)) * 2.54) })} />
            <Field label="Inches" keyboardType="numeric" value={String(inches % 12)} onChangeText={(v) => update(index, { heightCm: Math.round((Math.floor(inches / 12) * 12 + Math.min(11, num(v))) * 2.54) })} />
          </Row>
        ) : (
          numField(tx('height'), 'heightCm')
        )}
      </View>
      {p.age > 0 && p.age < 18 && <Muted>{tx('kidNote')}</Muted>}
      <View style={{ gap: 8 }}>
        <Label>How active are you?</Label>
        {ACTS.map((a) => (
          <Choice key={a.id} title={a.title} sub={a.sub} on={p.activity === a.id} onPress={() => update(index, { activity: a.id })} />
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <Label>{tx('goal')}</Label>
        {GOALS.map((g) => (
          <Choice key={g} title={GOAL_INFO[g].title} sub={GOAL_INFO[g].sub} on={p.goal === g} onPress={() => update(index, { goal: g })} />
        ))}
      </View>
      <View style={o.target}>
        <Text style={o.targetTop} numberOfLines={1}>Your daily target</Text>
        <Text style={o.targetBig} numberOfLines={1}>{Math.round(tg.kcal)} kcal · {Math.round(tg.protein)} g protein</Text>
      </View>
    </View>
  );
}

function HealthStep({ index }: { index: number }) {
  const lang = useStore((s) => s.lang);
  const p = useStore((s) => s.persons[index]);
  const update = useStore((s) => s.updatePerson);
  const tx = (k: StrKey) => t(lang, k);
  const toggle = (c: Condition) =>
    update(index, { conditions: p.conditions.includes(c) ? p.conditions.filter((x) => x !== c) : [...p.conditions, c] });
  return (
    <View style={{ gap: 12 }}>
      <Muted>Pick any that apply. Skip if none.</Muted>
      <Row>
        {CONDITIONS.map((c) => (
          <Chip key={c} tone="accent" label={tx(`cond_${c}` as StrKey)} on={p.conditions.includes(c)} onPress={() => toggle(c)} />
        ))}
      </Row>
    </View>
  );
}

export function OnboardScreen() {
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const count = persons.length;
  const setMemberCount = useStore((s) => s.setMemberCount);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const makeWeek = useStore((s) => s.makeWeek);
  const [step, setStep] = useState(0);
  const [adding, setAdding] = useState(false);
  const tx = (k: StrKey) => t(lang, k);

  // 0 welcome, 1 family size, then each member's profile, each member's health limits, cuisines, pantry
  const LAST = 2 * count + 3;
  const isPerson = step >= 2 && step <= count + 1;
  const isHealth = step >= count + 2 && step <= 2 * count + 1;
  const isCuisine = step === 2 * count + 2;
  const hi = step - count - 2;
  const title =
    step === 1
      ? tx('howMany')
      : isPerson
        ? `${tx('obAbout')} ${step - 1} of ${count}`
        : isHealth
          ? (count > 1 ? `Health · ${persons[hi]?.name || `Person ${hi + 1}`}` : 'Health & allergies')
          : isCuisine
            ? 'Cuisines you like'
            : tx('obHome');

  const finish = () => {
    makeWeek();
    setOnboarded(true);
  };

  if (step === 0)
    return (
      <View style={s.welcome}>
        <View style={s.blobA} />
        <View style={s.blobB} />
        <View style={s.welcomeArt}>
          <MealArt slot="lunch" size={190} />
        </View>
        <View style={{ gap: 0 }}>
          <Text style={s.welcomeTitle} numberOfLines={1}>Plan your</Text>
          <Text style={s.welcomeTitle} numberOfLines={1}>family's meals</Text>
          <Text style={s.welcomeSub}>{tx('obWelcomeSub')}</Text>
        </View>
        <Button label={tx('start')} kind="ink" onPress={() => setStep(1)} />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <View style={s.dots}>
        {Array.from({ length: LAST }, (_, i) => (
          <View key={i} style={[s.dotBar, i < step && { backgroundColor: C.primary }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
        <H>{title}</H>
        {step === LAST && <Muted>Your plan uses these first.</Muted>}
        {step === 1 && <Segmented value={count} onChange={setMemberCount} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))} />}
        {isPerson && <PersonStep key={step} index={step - 2} />}
        {isHealth && <HealthStep key={step} index={hi} />}
        {isCuisine && <CuisinePicker />}
        {step === LAST && <PantryShelves collapsible />}
        {step === LAST && (adding ? <AddItem to="have" onDone={() => setAdding(false)} /> : <Button kind="soft" label="Not listed? Add by name" onPress={() => setAdding(true)} />)}
      </ScrollView>
      <View style={s.foot}>
        <Button kind="soft" label={tx('back')} onPress={() => setStep(step - 1)} />
        <View style={{ flex: 1 }} />
        {step === LAST && <Button kind="soft" label={tx('skip')} onPress={finish} />}
        {step < LAST ? <Button label={tx('next')} onPress={() => setStep(step + 1)} /> : <Button label={tx('obFinish')} onPress={finish} />}
      </View>
    </View>
  );
}

const o = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg, backgroundColor: C.card, borderWidth: 2, borderColor: 'transparent', ...SHADOW },
  rowOn: { borderColor: C.primary, backgroundColor: C.primarySoft },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  dotOn: { borderColor: C.primary },
  dotIn: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  sub: { fontSize: 13, color: C.muted },
  target: { backgroundColor: C.ink, borderRadius: RADIUS.xl, padding: 18, gap: 4 },
  targetTop: { fontSize: 13, color: '#C9C4F5', fontWeight: '600' },
  targetBig: { fontSize: 22, color: '#fff', fontWeight: '800' },
});

const s = StyleSheet.create({
  welcome: { flex: 1, padding: 24, justifyContent: 'space-between', overflow: 'hidden' },
  blobA: { position: 'absolute', right: -90, top: -60, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FFE3DC' },
  blobB: { position: 'absolute', left: -80, top: 160, width: 220, height: 220, borderRadius: 110, backgroundColor: '#E5E0FF' },
  welcomeArt: { alignItems: 'center', marginTop: 40 },
  welcomeTitle: { fontSize: 34, fontWeight: '800', color: C.text, letterSpacing: -1, lineHeight: 40 },
  welcomeSub: { fontSize: 16, color: C.muted },
  dots: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 16 },
  dotBar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: C.line },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: C.card, ...SHADOW, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl },
});
