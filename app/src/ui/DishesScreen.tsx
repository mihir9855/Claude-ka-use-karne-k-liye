import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { todayStr } from '../core/dates';
import { topDishes } from '../core/habits';
import { dishMacros } from '../core/nutrition';
import { SLOTS_BY_COUNT } from '../core/planner';
import type { Dish, DishItem, DishRole, MealCategory, Slot } from '../core/types';
import { INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { allDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Button, Card, Chip, Field, H, Label, Muted, Row } from './kit';
import { C } from './theme';

const ROLES: DishRole[] = ['complete', 'main', 'staple', 'side', 'snack'];
const CATS: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function AddDishForm({ onDone }: { onDone: () => void }) {
  const lang = useStore((s) => s.lang);
  const addDish = useStore((s) => s.addDish);
  const [name, setName] = useState('');
  const [role, setRole] = useState<DishRole>('main');
  const [meals, setMeals] = useState<MealCategory[]>(['lunch', 'dinner']);
  const [items, setItems] = useState<DishItem[]>([]);
  const [q, setQ] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return INGREDIENTS.filter(
      (i) => !items.some((x) => x.ing === i.id) && Object.values(i.name).some((n) => n.toLowerCase().includes(needle)),
    ).slice(0, 8);
  }, [q, items]);

  const preview = dishMacros({ id: 'x', name: { en: '', hi: '', gu: '' }, role, meals, items });
  const manual = items.length === 0 && Number(kcal) > 0;
  const canSave = name.trim().length > 0 && meals.length > 0 && (items.length > 0 || manual);

  const step = (ing: string, delta: number) =>
    setItems((cur) =>
      cur.flatMap((x) => (x.ing !== ing ? [x] : x.g + delta <= 0 ? [] : [{ ...x, g: x.g + delta }])),
    );

  const save = () => {
    const n = name.trim();
    addDish({
      name: { en: n, hi: n, gu: n },
      role,
      meals,
      items,
      macros: manual
        ? { kcal: Number(kcal), protein: Number(protein) || 0, carbs: 0, fat: 0 }
        : undefined,
    });
    onDone();
  };

  return (
    <Card>
      <Field label={tx('dishName')} value={name} onChangeText={setName} />
      <Label>{tx('role')}</Label>
      <Row>
        {ROLES.map((x) => (
          <Chip key={x} label={tx(`role_${x}` as StrKey)} on={role === x} onPress={() => setRole(x)} />
        ))}
      </Row>
      <Label>{tx('mealTime')}</Label>
      <Row>
        {CATS.map((c) => (
          <Chip
            key={c}
            label={tx(`cat_${c}` as StrKey)}
            on={meals.includes(c)}
            onPress={() => setMeals((m) => (m.includes(c) ? m.filter((x) => x !== c) : [...m, c]))}
          />
        ))}
      </Row>
      <Label>{tx('ingredients')}</Label>
      {items.map((it) => (
        <Row key={it.ing} style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, flex: 1 }}>{ingName(it.ing, lang)}</Text>
          <Button small kind="ghost" label="−" onPress={() => step(it.ing, -10)} />
          <Text style={{ width: 56, textAlign: 'center', color: C.text }}>
            {it.g} {tx('g')}
          </Text>
          <Button small kind="ghost" label="+" onPress={() => step(it.ing, 10)} />
        </Row>
      ))}
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={tx('search')}
        placeholderTextColor={C.muted}
        style={{ borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, fontSize: 16, color: C.text }}
      />
      <Row>
        {matches.map((i) => (
          <Chip
            key={i.id}
            label={`+ ${i.name[lang]}`}
            onPress={() => {
              setItems((cur) => [...cur, { ing: i.id, g: 50 }]);
              setQ('');
            }}
          />
        ))}
      </Row>
      {items.length > 0 ? (
        <Muted>
          {r(preview.kcal)} {tx('kcal')} · {r(preview.protein)} {tx('g')} {tx('proteinShort')}
        </Muted>
      ) : (
        <>
          <Muted>{tx('orMacros')}</Muted>
          <Row>
            <Field label={tx('kcal')} keyboardType="numeric" value={kcal} onChangeText={setKcal} />
            <Field label={`${tx('proteinShort')} (${tx('g')})`} keyboardType="numeric" value={protein} onChangeText={setProtein} />
          </Row>
        </>
      )}
      <Row>
        {canSave && <Button label={tx('save')} onPress={save} />}
        <Button kind="ghost" label={tx('cancel')} onPress={onDone} />
      </Row>
    </Card>
  );
}

function DishRow({ dish }: { dish: Dish }) {
  const lang = useStore((s) => s.lang);
  const pref = useStore((s) => s.prefs[dish.id]);
  const setPref = useStore((s) => s.setPref);
  const logMeal = useStore((s) => s.logMeal);
  const removeDish = useStore((s) => s.removeDish);
  const [open, setOpen] = useState(false);
  const m = dishMacros(dish);
  const slots = SLOTS_BY_COUNT[6];

  return (
    <Card style={pref === 'dislike' ? { opacity: 0.5 } : undefined}>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>
            {dishName(dish, lang)}
            {dish.custom ? '  ✦' : ''}
          </Text>
          <Muted>
            {t(lang, `role_${dish.role}` as StrKey)} · {r(m.kcal)} {t(lang, 'kcal')} · {r(m.protein)} {t(lang, 'g')}{' '}
            {t(lang, 'proteinShort')}
          </Muted>
        </View>
        <Pressable onPress={() => setPref(dish.id, pref === 'like' ? undefined : 'like')} accessibilityLabel={t(lang, 'liked')}>
          <Text style={{ fontSize: 22, opacity: pref === 'like' ? 1 : 0.35 }}>👍</Text>
        </Pressable>
        <Pressable onPress={() => setPref(dish.id, pref === 'dislike' ? undefined : 'dislike')} accessibilityLabel={t(lang, 'dislike')}>
          <Text style={{ fontSize: 22, opacity: pref === 'dislike' ? 1 : 0.35 }}>👎</Text>
        </Pressable>
      </Row>
      <Row>
        <Button small kind="ghost" label={t(lang, 'ateIt')} onPress={() => setOpen((o) => !o)} />
        {dish.custom && <Button small kind="danger" label={t(lang, 'remove')} onPress={() => removeDish(dish.id)} />}
      </Row>
      {open && (
        <>
          <Muted>{t(lang, 'logAs')}</Muted>
          <Row>
            {slots.map((sl: Slot) => (
              <Chip
                key={sl}
                label={t(lang, `slot_${sl}` as StrKey)}
                onPress={() => {
                  logMeal(todayStr(), sl, [dish.id]);
                  setOpen(false);
                }}
              />
            ))}
          </Row>
        </>
      )}
    </Card>
  );
}

export function DishesScreen() {
  const lang = useStore((s) => s.lang);
  const custom = useStore((s) => s.customDishes);
  const log = useStore((s) => s.log);
  const [onlyOurs, setOnlyOurs] = useState(false);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');

  const dishes = useMemo(() => allDishes(custom), [custom]);
  const usual = useMemo(() => topDishes(log, dishes, 6), [log, dishes]);
  const shown = dishes
    .filter((d) => (onlyOurs ? d.custom : true))
    .filter((d) => !q.trim() || Object.values(d.name).some((n) => n.toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => Number(!!b.custom) - Number(!!a.custom));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
      <H>{t(lang, 'dishesTitle')}</H>
      {adding ? (
        <AddDishForm onDone={() => setAdding(false)} />
      ) : (
        <Button label={t(lang, 'addDish')} onPress={() => setAdding(true)} />
      )}
      {usual.length > 0 && (
        <Card>
          <Label>{t(lang, 'usualFoods')}</Label>
          {usual.map(({ dish, count }) => (
            <Text key={dish.id} style={{ color: C.text }}>
              {dishName(dish, lang)} · {count} {t(lang, 'times')}
            </Text>
          ))}
        </Card>
      )}
      <Row>
        <Chip label={t(lang, 'all')} on={!onlyOurs} onPress={() => setOnlyOurs(false)} />
        <Chip label={t(lang, 'ours')} on={onlyOurs} onPress={() => setOnlyOurs(true)} />
      </Row>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t(lang, 'search')}
        placeholderTextColor={C.muted}
        style={{ borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, fontSize: 16, color: C.text, backgroundColor: '#fff' }}
      />
      {shown.map((d) => (
        <DishRow key={d.id} dish={d} />
      ))}
    </ScrollView>
  );
}
