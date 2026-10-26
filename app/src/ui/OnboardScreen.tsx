import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import type { Condition, Goal, Person } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { MealArt } from './Art';
import { Button, Chip, Field, H, Label, Muted, Row, Segmented } from './kit';
import { PantryShelves } from './PantryPicker';
import { C, RADIUS, SHADOW } from './theme';

const GOALS: Goal[] = ['fat_loss', 'muscle_gain', 'maintain'];
const CONDITIONS: Condition[] = [
  'diabetes', 'bp', 'thyroid', 'pcos', 'cholesterol', 'lactose', 'gluten',
  'kidney', 'peanut', 'soy', 'nuts', 'no_onion_garlic',
];
const COMMON = [
  'atta', 'rice', 'moong_dal', 'toor_dal', 'chana_dal', 'besan', 'oats', 'paneer', 'curd', 'milk',
  'aloo', 'matar', 'tomato', 'onion', 'palak', 'cauliflower', 'bhindi', 'lauki', 'carrot', 'banana', 'peanuts',
];
const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

function PersonStep({ index }: { index: number }) {
  const lang = useStore((s) => s.lang);
  const p = useStore((s) => s.persons[index]);
  const update = useStore((s) => s.updatePerson);
  const [showHealth, setShowHealth] = useState(p.conditions.length > 0);
  const tx = (k: StrKey) => t(lang, k);
  const toggle = (c: Condition) =>
    update(index, { conditions: p.conditions.includes(c) ? p.conditions.filter((x) => x !== c) : [...p.conditions, c] });
  const numField = (label: string, key: 'age' | 'heightCm' | 'weightKg') => (
    <Field label={label} keyboardType="numeric" value={p[key] ? String(p[key]) : ''} onChangeText={(v) => update(index, { [key]: num(v) } as Partial<Person>)} />
  );
  return (
    <View style={{ gap: 16 }}>
      <Field label={tx('name')} value={p.name} onChangeText={(v) => update(index, { name: v })} />
      <Segmented value={p.sex} onChange={(v) => update(index, { sex: v })} options={[{ value: 'male', label: tx('male') }, { value: 'female', label: tx('female') }]} />
      <Row style={{ flexWrap: 'nowrap' }}>
        {numField(tx('age'), 'age')}
        {numField(tx('height'), 'heightCm')}
        {numField(tx('weight'), 'weightKg')}
      </Row>
      {p.age > 0 && p.age < 18 && <Muted>{tx('kidNote')}</Muted>}
      <View>
        <Label>{tx('goal')}</Label>
        <Row>
          {GOALS.map((g) => (
            <Chip key={g} label={tx(`goal_${g}` as StrKey)} on={p.goal === g} onPress={() => update(index, { goal: g })} />
          ))}
        </Row>
      </View>
      {showHealth ? (
        <View>
          <Label>{tx('obLimitsHint')}</Label>
          <Row>
            {CONDITIONS.map((c) => (
              <Chip key={c} tone="accent" label={tx(`cond_${c}` as StrKey)} on={p.conditions.includes(c)} onPress={() => toggle(c)} />
            ))}
          </Row>
        </View>
      ) : (
        <Row>
          <Chip label={tx('obLimitsHint')} onPress={() => setShowHealth(true)} />
        </Row>
      )}
    </View>
  );
}

export function OnboardScreen() {
  const lang = useStore((s) => s.lang);
  const count = useStore((s) => s.persons.length);
  const setMemberCount = useStore((s) => s.setMemberCount);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const makeWeek = useStore((s) => s.makeWeek);
  const [step, setStep] = useState(0);
  const tx = (k: StrKey) => t(lang, k);

  // 0 welcome, 1 family size, 2..count+1 each member, then the pantry
  const LAST = count + 2;
  const isPerson = step >= 2 && step <= count + 1;
  const title = step === 1 ? tx('howMany') : isPerson ? `${tx('obAbout')} ${step - 1} of ${count}` : tx('obHome');

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
        {step === LAST && <Muted>{tx('obHomeHint')}</Muted>}
        {step === 1 && <Segmented value={count} onChange={setMemberCount} options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))} />}
        {isPerson && <PersonStep key={step} index={step - 2} />}
        {step === LAST && <PantryShelves ids={COMMON} />}
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
