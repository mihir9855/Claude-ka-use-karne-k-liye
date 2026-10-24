import { ScrollView, Text, View } from 'react-native';
import { computeTargets } from '../core/nutrition';
import type { Activity, Condition, Goal, Lang, Person } from '../core/types';
import { LANG_LABEL, t, type StrKey } from '../i18n/strings';
import { MAX_MEMBERS, useStore } from '../state/store';
import { Bar, Button, Chip, Collapse, Field, H, Label, Muted, Row, Segmented } from './kit';
import { C } from './theme';
import { r } from './helpers';

const ACTIVITIES: Activity[] = ['sedentary', 'light', 'moderate', 'active'];
const GOALS: Goal[] = ['fat_loss', 'muscle_gain', 'maintain'];
const CONDITIONS: Condition[] = [
  'diabetes', 'bp', 'thyroid', 'pcos', 'cholesterol', 'lactose', 'gluten',
  'kidney', 'peanut', 'soy', 'nuts', 'no_onion_garlic',
];
const LANGS: Lang[] = ['en', 'hi', 'gu'];

const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

function PersonCard({ index }: { index: number }) {
  const lang = useStore((s) => s.lang);
  const p = useStore((s) => s.persons[index]);
  const update = useStore((s) => s.updatePerson);
  const removePerson = useStore((s) => s.removePerson);
  const canRemove = useStore((s) => s.persons.length > 1);
  const tg = computeTargets(p);
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
    <Collapse
      icon="user"
      title={p.name || `${tx('person')} ${index + 1}`}
      summary={`${tx(`goal_${p.goal}` as StrKey)} · ${r(tg.kcal)} ${tx('kcal')} · ${r(tg.protein)} ${tx('g')} ${tx('proteinShort')}`}
      defaultOpen={false}
    >
      <Row style={{ flexWrap: 'nowrap', alignItems: 'flex-end' }}>
        <Field label={tx('name')} value={p.name} onChangeText={(v) => update(index, { name: v })} />
        {canRemove && <Button icon="trash" kind="danger" label={tx('removeMember')} onPress={() => removePerson(index)} />}
      </Row>
      <Segmented
        value={p.sex}
        onChange={(v) => update(index, { sex: v })}
        options={[{ value: 'male', label: tx('male') }, { value: 'female', label: tx('female') }]}
      />
      <Row>
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
        <Label>{tx('activity')}</Label>
        <Row>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={tx(`act_${a}` as StrKey)} on={p.activity === a} onPress={() => update(index, { activity: a })} />
          ))}
        </Row>
      </View>
      <View>
        <Label>{tx('conditions')}</Label>
        <Row>
          {CONDITIONS.map((c) => (
            <Chip key={c} tone="accent" label={tx(`cond_${c}` as StrKey)} on={p.conditions.includes(c)} onPress={() => toggle(c)} />
          ))}
        </Row>
      </View>
      <View style={{ gap: 6 }}>
        <Label>{tx('yourTargets')}</Label>
        <Text style={{ fontSize: 20, fontWeight: '700', color: C.text }}>
          {r(tg.kcal)} {tx('kcal')} · {r(tg.protein)} {tx('g')} {tx('proteinShort')}
        </Text>
        <Bar value={tg.protein * 4} max={tg.kcal} color={C.primary} />
        <Muted>
          {r(tg.carbs)} {tx('g')} {tx('carbs')} · {r(tg.fat)} {tx('g')} {tx('fat')} · {r(tg.fiber)} {tx('g')} {tx('chk_fiber')} · {tx('water')} {tg.waterL} L
        </Muted>
      </View>
    </Collapse>
  );
}

export function ProfileScreen() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const mealCount = useStore((s) => s.mealCount);
  const setMealCount = useStore((s) => s.setMealCount);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const count = useStore((s) => s.persons.length);
  const addPerson = useStore((s) => s.addPerson);
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
      <H>{t(lang, 'profileTitle')}</H>
      <View style={{ gap: 6 }}>
        <Label>{t(lang, 'language')}</Label>
        <Segmented
          value={lang}
          onChange={setLang}
          options={LANGS.map((l) => ({ value: l, label: LANG_LABEL[l] }))}
        />
      </View>
      <View style={{ gap: 6 }}>
        <Label>{t(lang, 'mealsPerDay')}</Label>
        <Segmented
          value={mealCount}
          onChange={setMealCount}
          options={(['auto', 3, 4, 5, 6] as const).map((n) => ({
            value: n,
            label: n === 'auto' ? t(lang, 'auto') : String(n),
          }))}
        />
      </View>
      <View style={{ gap: 10 }}>
        <Label>{t(lang, 'members')}</Label>
        {Array.from({ length: count }, (_, i) => (
          <PersonCard key={i} index={i} />
        ))}
        {count < MAX_MEMBERS && <Button icon="plus" kind="soft" label={t(lang, 'addMember')} onPress={addPerson} />}
      </View>
      <Button kind="soft" label={t(lang, 'redoSetup')} onPress={() => setOnboarded(false)} />
      <Muted>{t(lang, 'disclaimer')}</Muted>
    </ScrollView>
  );
}
