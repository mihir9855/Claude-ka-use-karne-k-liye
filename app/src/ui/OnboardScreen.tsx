import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { Condition, Goal, Lang, Person } from '../core/types';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { LANG_LABEL, t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Chip, Field, H, Label, Muted, Row, Segmented } from './kit';
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
const LAST = 3;

function PersonStep({ index }: { index: 0 | 1 }) {
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
  const pantry = useStore((s) => s.pantry);
  const toggle = useStore((s) => s.togglePantry);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const makePlan = useStore((s) => s.makePlan);
  const [step, setStep] = useState(0);
  const tx = (k: StrKey) => t(lang, k);

  const title =
    step === 0 ? tx('obChooseLang') : step === 3 ? tx('obHome') : `${tx('obAbout')} ${step}/2`;

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
          {step === 3 && <Muted>{tx('obHomeHint')}</Muted>}
        </View>

        {step === 0 && (
          <View style={{ gap: 10 }}>
            {LANGS.map((l) => (
              <Chip key={l} label={LANG_LABEL[l]} on={lang === l} onPress={() => setLang(l)} />
            ))}
          </View>
        )}
        {step === 1 && <PersonStep index={0} />}
        {step === 2 && <PersonStep index={1} />}
        {step === 3 && (
          <Row>
            {COMMON.map((id) => (
              <Chip key={id} label={INGREDIENT_BY_ID[id].name[lang]} on={!!pantry.have[id]} onPress={() => toggle(id)} />
            ))}
          </Row>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: C.line, justifyContent: 'space-between' }}>
        {step > 0 ? <Button kind="soft" label={tx('back')} onPress={() => setStep(step - 1)} /> : <View />}
        <Row style={{ flexWrap: 'nowrap' }}>
          {step === 3 && <Button kind="soft" label={tx('skip')} onPress={finish} />}
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
