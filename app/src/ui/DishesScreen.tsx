import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { todayStr } from '../core/dates';
import { topDishes } from '../core/habits';
import { dishMacros } from '../core/nutrition';
import { SLOTS_BY_COUNT } from '../core/planner';
import type { Dish, DishItem, DishRole, MealCategory } from '../core/types';
import { INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { allDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Icon } from './Icon';
import { Button, Card, Chip, Field, H, Label, Muted, Row, Search, Segmented } from './kit';
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
      macros: manual ? { kcal: Number(kcal), protein: Number(protein) || 0, carbs: 0, fat: 0 } : undefined,
    });
    onDone();
  };

  return (
    <Card>
      <Field label={tx('dishName')} value={name} onChangeText={setName} />
      <View>
        <Label>{tx('role')}</Label>
        <Row>
          {ROLES.map((x) => (
            <Chip key={x} label={tx(`role_${x}` as StrKey)} on={role === x} onPress={() => setRole(x)} />
          ))}
        </Row>
      </View>
      <View>
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
      </View>
      <Label>{tx('ingredients')}</Label>
      {items.map((it) => (
        <Row key={it.ing} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <Text style={{ color: C.text, flex: 1 }}>{ingName(it.ing, lang)}</Text>
          <Button kind="soft" label="−" onPress={() => step(it.ing, -10)} />
          <Text style={{ width: 58, textAlign: 'center', color: C.text }}>
            {it.g} {tx('g')}
          </Text>
          <Button kind="soft" label="+" onPress={() => step(it.ing, 10)} />
        </Row>
      ))}
      <Row>
        <Search value={q} onChangeText={setQ} placeholder={tx('search')} />
      </Row>
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
          <Row style={{ flexWrap: 'nowrap' }}>
            <Field label={tx('kcal')} keyboardType="numeric" value={kcal} onChangeText={setKcal} />
            <Field label={`${tx('proteinShort')} (${tx('g')})`} keyboardType="numeric" value={protein} onChangeText={setProtein} />
          </Row>
        </>
      )}
      <Row>
        {canSave && <Button label={tx('save')} onPress={save} />}
        <Button kind="soft" label={tx('cancel')} onPress={onDone} />
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
  const [logging, setLogging] = useState(false);
  const m = dishMacros(dish);
  const tx = (k: StrKey) => t(lang, k);

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.line }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ paddingVertical: 12, gap: 2, opacity: pref === 'dislike' ? 0.45 : 1 }}
      >
        <Row style={{ flexWrap: 'nowrap', gap: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.text, flexShrink: 1 }}>{dishName(dish, lang)}</Text>
          {pref === 'like' && <Icon name="heart" size={14} color={C.danger} />}
          {dish.custom && <Icon name="user" size={14} color={C.primary} />}
        </Row>
        <Muted>
          {tx(`role_${dish.role}` as StrKey)} · {r(m.kcal)} {tx('kcal')} · {r(m.protein)} {tx('g')} {tx('proteinShort')}
        </Muted>
      </Pressable>
      {open && (
        <View style={{ gap: 10, paddingBottom: 12 }}>
          <Row>
            <Chip label={tx('ateIt')} on={logging} onPress={() => setLogging(!logging)} />
            <Chip label={tx('liked')} on={pref === 'like'} onPress={() => setPref(dish.id, pref === 'like' ? undefined : 'like')} />
            <Chip label={tx('disliked')} tone="accent" on={pref === 'dislike'} onPress={() => setPref(dish.id, pref === 'dislike' ? undefined : 'dislike')} />
            {dish.custom && <Button kind="danger" label={tx('remove')} onPress={() => removeDish(dish.id)} />}
          </Row>
          {logging && (
            <View style={{ gap: 6 }}>
              <Muted>{tx('logAs')}</Muted>
              <Row>
                {SLOTS_BY_COUNT[6].map((sl) => (
                  <Chip
                    key={sl}
                    label={tx(`slot_${sl}` as StrKey)}
                    onPress={() => {
                      logMeal(todayStr(), sl, [dish.id]);
                      setLogging(false);
                      setOpen(false);
                    }}
                  />
                ))}
              </Row>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export function DishesScreen() {
  const lang = useStore((s) => s.lang);
  const custom = useStore((s) => s.customDishes);
  const log = useStore((s) => s.log);
  const [onlyOurs, setOnlyOurs] = useState(false);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  const dishes = useMemo(() => allDishes(custom), [custom]);
  const usual = useMemo(() => topDishes(log, dishes, 5), [log, dishes]);
  const shown = dishes
    .filter((d) => (onlyOurs ? d.custom : true))
    .filter((d) => !q.trim() || Object.values(d.name).some((n) => n.toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => Number(!!b.custom) - Number(!!a.custom));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <H>{tx('dishesTitle')}</H>
        {!adding && <Button icon="plus" label={tx('addShort')} onPress={() => setAdding(true)} />}
      </Row>
      {adding && <AddDishForm onDone={() => setAdding(false)} />}
      {usual.length > 0 && (
        <View style={{ gap: 6 }}>
          <Label>{tx('usualFoods')}</Label>
          <Row>
            {usual.map(({ dish, count }) => (
              <Chip key={dish.id} label={`${dishName(dish, lang)} · ${count}`} />
            ))}
          </Row>
        </View>
      )}
      <Search value={q} onChangeText={setQ} placeholder={tx('search')} />
      <Segmented
        value={onlyOurs ? 'ours' : 'all'}
        onChange={(v) => setOnlyOurs(v === 'ours')}
        options={[{ value: 'all', label: tx('all') }, { value: 'ours', label: tx('ours') }]}
      />
      <View>
        {shown.map((d) => (
          <DishRow key={d.id} dish={d} />
        ))}
      </View>
    </ScrollView>
  );
}
