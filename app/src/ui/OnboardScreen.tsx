import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Condition, Goal, Lang, Person } from '../core/types';
import { LANG_LABEL, t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Chip, Field, H, Label, Muted, Row, Segmented } from './kit';
import { PantryShelves } from './PantryPicker';
import { C } from './theme';

const LANGS: Lang[] = ['hi', 'en', 'gu'];
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
  const tx = (k: StrKey) => t(lang, k);
  const toggle = (c: Condition) =>
    update(index, {
      conditions: p.conditions.includes(c) ? p.conditions.filter((x) => x !== c) : [...p.conditions, c],
    });
  const numField = (label: string, key: 'age' | 'heightCm' | 'weightKg') => (
    <Field
      label={label}
      keyboardType="numeric"
      value={p[key] ? String(p[key]) : ''}
      onChangeText={(v) => update(index, { [key]: num(v) } as Partial<Person>)}
    />
  );
  return (
    <View style={{ gap: 16 }}>
      <Field label={tx('name')} value={p.name} onChangeText={(v) => update(index, { name: v })} />
      <Segmented
        value={p.sex}
        onChange={(v) => update(index, { sex: v })}
        options={[{ value: 'male', label: tx('male') }, { value: 'female', label: tx('female') }]}
      />
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
      <View>
        <Label>{tx('obLimitsHint')}</Label>
        <Row>
          {CONDITIONS.map((c) => (
            <Chip key={c} tone="accent" label={tx(`cond_${c}` as StrKey)} on={p.conditions.includes(c)} onPress={() => toggle(c)} />
          ))}
        </Row>
      </View>
    </View>
  );
}

export function OnboardScreen() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const count = useStore((s) => s.persons.length);
  const setMemberCount = useStore((s) => s.setMemberCount);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const makePlan = useStore((s) => s.makePlan);
  const [step, setStep] = useState(0);
  const tx = (k: StrKey) => t(lang, k);

  // 0 language, 1 family size, 2..count+1 each member, then the pantry
  const LAST = count + 2;
  const isPerson = step >= 2 && step <= count + 1;
  const title =
    step === 0
      ? tx('obChooseLang')
      : step === 1
        ? tx('howMany')
        : isPerson
          ? `${tx('obAbout')} ${step - 1}/${count}`
          : tx('obHome');

  const finish = () => {
    makePlan();
    setOnboarded(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 6 }}>
          <Muted>{step + 1} / {LAST + 1}</Muted>
          <H>{title}</H>
          {step === 0 && <Muted>{tx('obWelcome')}</Muted>}
          {step === LAST && <Muted>{tx('obHomeHint')}</Muted>}
        </View>

        {step === 0 && (
          <View style={{ gap: 10 }}>
            {LANGS.map((l) => (
              <Chip key={l} label={LANG_LABEL[l]} on={lang === l} onPress={() => setLang(l)} />
            ))}
          </View>
        )}
        {step === 1 && (
          <Segmented
            value={count}
            onChange={setMemberCount}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))}
          />
        )}
        {isPerson && <PersonStep key={step} index={step - 2} />}
        {step === LAST && <PantryShelves ids={COMMON} />}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: C.line, justifyContent: 'space-between' }}>
        {step > 0 ? <Button kind="soft" label={tx('back')} onPress={() => setStep(step - 1)} /> : <View />}
        <Row style={{ flexWrap: 'nowrap' }}>
          {step === LAST && <Button kind="soft" label={tx('skip')} onPress={finish} />}
          {step < LAST ? (
            <Button label={tx('next')} onPress={() => setStep(step + 1)} />
          ) : (
            <Button label={tx('obFinish')} onPress={finish} />
          )}
        </Row>
      </View>
    </View>
  );
}
