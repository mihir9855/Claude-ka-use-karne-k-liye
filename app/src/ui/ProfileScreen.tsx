import { ScrollView, Text } from 'react-native';
import { computeTargets } from '../core/nutrition';
import type { Activity, Condition, Goal, Person } from '../core/types';
import { t } from '../i18n/strings';
import { useStore } from '../state/store';
import { Bar, Card, Chip, Field, H, Label, Muted, Row } from './kit';
import { C } from './theme';
import { r } from './helpers';

const ACTIVITIES: Activity[] = ['sedentary', 'light', 'moderate', 'active'];
const GOALS: Goal[] = ['fat_loss', 'muscle_gain', 'maintain'];
const CONDITIONS: Condition[] = [
  'diabetes', 'bp', 'thyroid', 'pcos', 'cholesterol', 'lactose', 'gluten',
  'kidney', 'peanut', 'soy', 'nuts', 'no_onion_garlic',
];

const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

function PersonCard({ index }: { index: 0 | 1 }) {
  const lang = useStore((s) => s.lang);
  const p = useStore((s) => s.persons[index]);
  const update = useStore((s) => s.updatePerson);
  const tg = computeTargets(p);
  const tx = (k: Parameters<typeof t>[1]) => t(lang, k);
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
    <Card>
      <H>{`${tx('person')} ${index + 1}`}</H>
      <Row>
        <Field label={tx('name')} value={p.name} onChangeText={(v) => update(index, { name: v })} />
      </Row>
      <Label>{tx('sex')}</Label>
      <Row>
        <Chip label={tx('male')} on={p.sex === 'male'} onPress={() => update(index, { sex: 'male' })} />
        <Chip label={tx('female')} on={p.sex === 'female'} onPress={() => update(index, { sex: 'female' })} />
      </Row>
      <Row>
        {numField(tx('age'), 'age')}
        {numField(tx('height'), 'heightCm')}
        {numField(tx('weight'), 'weightKg')}
      </Row>
      <Label>{tx('activity')}</Label>
      <Row>
        {ACTIVITIES.map((a) => (
          <Chip key={a} label={tx(`act_${a}`)} on={p.activity === a} onPress={() => update(index, { activity: a })} />
        ))}
      </Row>
      <Label>{tx('goal')}</Label>
      <Row>
        {GOALS.map((g) => (
          <Chip key={g} label={tx(`goal_${g}`)} on={p.goal === g} onPress={() => update(index, { goal: g })} />
        ))}
      </Row>
      <Label>{tx('conditions')}</Label>
      <Row>
        {CONDITIONS.map((c) => (
          <Chip key={c} tone="accent" label={tx(`cond_${c}`)} on={p.conditions.includes(c)} onPress={() => toggle(c)} />
        ))}
      </Row>
      <Label>{tx('yourTargets')}</Label>
      <Text style={{ fontSize: 22, fontWeight: '800', color: C.primary }}>
        {r(tg.kcal)} {tx('kcal')} · {r(tg.protein)} {tx('g')} {tx('proteinShort')}
      </Text>
      <Bar value={tg.protein * 4} max={tg.kcal} color={C.accent} />
      <Muted>
        {r(tg.carbs)} {tx('g')} {tx('carbs')} · {r(tg.fat)} {tx('g')} {tx('fat')} · {tx('water')} {tg.waterL} L
      </Muted>
    </Card>
  );
}

export function ProfileScreen() {
  const lang = useStore((s) => s.lang);
  const mealCount = useStore((s) => s.mealCount);
  const setMealCount = useStore((s) => s.setMealCount);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      <H>{t(lang, 'profileTitle')}</H>
      <PersonCard index={0} />
      <PersonCard index={1} />
      <Card>
        <Label>{t(lang, 'mealsPerDay')}</Label>
        <Row>
          {(['auto', 3, 4, 5, 6] as const).map((n) => (
            <Chip
              key={n}
              label={n === 'auto' ? t(lang, 'auto') : String(n)}
              on={mealCount === n}
              onPress={() => setMealCount(n)}
            />
          ))}
        </Row>
      </Card>
      <Muted>{t(lang, 'disclaimer')}</Muted>
    </ScrollView>
  );
}
