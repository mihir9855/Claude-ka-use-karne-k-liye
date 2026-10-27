import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from './Text';
import { todayStr } from '../core/dates';
import { topDishes } from '../core/habits';
import { dishMacros } from '../core/nutrition';
import { SLOTS_BY_COUNT } from '../core/planner';
import type { Dish, DishItem, DishRole, MealCategory } from '../core/types';
import { INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Icon } from './Icon';
import { ActivityIndicator } from 'react-native';
import { avoidWords, findDishes, type Suggestion } from '../core/finder';
import { dishMacros as macrosOf } from '../core/nutrition';
import { ScanError } from '../core/scan';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { Button, Card, Chip, Field, H, Label, Muted, Row, Search, Segmented } from './kit';
import { IconTile } from './Icon';
import { C, RADIUS, SHADOW } from './theme';

const ROLES: DishRole[] = ['complete', 'main', 'staple', 'side', 'snack'];
const CATS: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function AddDishForm({ onDone }: { onDone: () => void }) {
  const lang = useStore((s) => s.lang);
  const addDish = useStore((s) => s.addDish);
  const mineCount = useStore((s) => s.customIngredients.length);
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
  }, [q, items, mineCount]);

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
      macros: manual ? { kcal: Number(kcal), protein: Number(protein) || 0, carbs: 0, fat: 0, fiber: 0 } : undefined,
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
    <View style={{ backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 12, marginBottom: 10, gap: 10, ...SHADOW }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dishName(dish, lang)}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pref === 'dislike' ? 0.45 : 1 }}
      >
        <IconTile name="bowl" size={46} icon={24} width={1.5} />
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Row style={{ flexWrap: 'nowrap', gap: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.text, flexShrink: 1 }} numberOfLines={1}>
              {dishName(dish, lang)}
            </Text>
            {pref === 'like' && <Icon name="heart" size={14} color={C.danger} />}
          </Row>
          <Text style={{ fontSize: 13, color: C.muted }} numberOfLines={1}>
            {`${tx(`role_${dish.role}` as StrKey)} · ${r(m.kcal)} ${tx('kcal')} · ${r(m.protein)} ${tx('g')}`}
          </Text>
        </View>
        <Icon name={open ? 'up' : 'down'} size={18} color={C.muted} />
      </Pressable>
      {open && (
        <View style={{ gap: 10, paddingBottom: 12 }}>
          <Row>
            <Chip label={tx('ateIt')} on={logging} onPress={() => setLogging(!logging)} />
            <Chip label={tx('liked')} on={pref === 'like'} onPress={() => setPref(dish.id, pref === 'like' ? undefined : 'like')} />
            <Chip label={tx('disliked')} tone="accent" on={pref === 'dislike'} onPress={() => setPref(dish.id, pref === 'dislike' ? undefined : 'dislike')} />
            {dish.custom && <Button icon="trash" kind="danger" label={tx('remove')} onPress={() => removeDish(dish.id)} />}
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

function AiFinder({ onDone }: { onDone: () => void }) {
  const lang = useStore((s) => s.lang);
  const key = useStore((s) => s.geminiKey);
  const setKey = useStore((s) => s.setGeminiKey);
  const persons = useStore((s) => s.persons);
  const have = useStore((s) => s.pantry.have);
  const addDish = useStore((s) => s.addDish);
  const addIngredient = useStore((s) => s.addIngredient);
  const [draftKey, setDraftKey] = useState('');
  const [ask, setAsk] = useState('');
  const [stock, setStock] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const [saved, setSaved] = useState<Record<number, true>>({});
  const [error, setError] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  const find = async () => {
    if (!ask.trim() || busy) return;
    setBusy(true);
    setError('');
    setResults(null);
    try {
      const homeStock = stock ? Object.keys(have).filter((id) => have[id]).map((id) => INGREDIENT_BY_ID[id]?.name.en).filter(Boolean) : undefined;
      setResults(await findDishes({ request: ask, apiKey: key, avoid: avoidWords(persons), homeStock }));
      setSaved({});
    } catch (e) {
      const kind = e instanceof ScanError ? e.kind : 'other';
      setError(`${tx(kind === 'key' ? 'errKey' : kind === 'limit' ? 'errLimit' : kind === 'network' ? 'errNet' : 'errOther')} ${(e as Error)?.message ?? ''}`.trim().slice(0, 220));
    }
    setBusy(false);
  };

  const save = (sg: Suggestion, i: number) => {
    const items = [...sg.items];
    for (const ex of sg.extras) {
      const id = addIngredient(ex.name, ex.group, { kcal: ex.kcal, protein: ex.protein, carbs: ex.carbs, fat: ex.fat, fiber: ex.fiber }, 'none');
      if (id) items.push({ ing: id, g: ex.g });
    }
    addDish({ name: sg.name, role: sg.role, meals: sg.meals, items, cuisine: sg.cuisine });
    setSaved((x) => ({ ...x, [i]: true }));
  };

  return (
    <Card>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Label>{tx('finderAsk')}</Label>
        <Button kind="soft" label={tx('close')} onPress={onDone} />
      </Row>
      {!key ? (
        <View style={{ gap: 8 }}>
          <Muted>{tx('needKey')}</Muted>
          <Field label={tx('geminiKey')} value={draftKey} onChangeText={setDraftKey} autoCapitalize="none" autoCorrect={false} secureTextEntry />
          <Muted>{tx('keyHint')}</Muted>
          {draftKey.trim().length > 10 && <Button label={tx('save')} onPress={() => setKey(draftKey)} />}
        </View>
      ) : (
        <>
          <Search value={ask} onChangeText={setAsk} placeholder={tx('finderEx1')} onSubmitEditing={find} returnKeyType="search" />
          <Row>
            {(['finderEx1', 'finderEx2', 'finderEx3'] as StrKey[]).map((k) => (
              <Chip key={k} label={tx(k)} onPress={() => setAsk(tx(k))} />
            ))}
            <Chip tone="accent" label={tx('finderUseStock')} on={stock} onPress={() => setStock(!stock)} />
          </Row>
          {busy ? (
            <Row>
              <ActivityIndicator color={C.primary} />
              <Muted>{tx('finderWorking')}</Muted>
            </Row>
          ) : (
            ask.trim().length > 0 && <Button icon="sparkle" label={tx('findBtn')} onPress={find} />
          )}
        </>
      )}
      {!!error && <Muted style={{ color: C.danger }}>{error}</Muted>}
      {results && results.length === 0 && <Muted>{tx('finderNone')}</Muted>}
      {results?.map((sg, i) => {
        const dish = { id: 'x', name: sg.name, role: sg.role, meals: sg.meals, items: sg.items };
        const m = macrosOf(dish);
        const extraKcal = sg.extras.reduce((a, e) => a + (e.kcal * e.g) / 100, 0);
        const extraProt = sg.extras.reduce((a, e) => a + (e.protein * e.g) / 100, 0);
        return (
          <View key={i} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 6, borderWidth: 1, borderColor: C.line }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{sg.name[lang] || sg.name.en}</Text>
            <Muted>
              {tx(`role_${sg.role}` as StrKey)} · {r(m.kcal + extraKcal)} {tx('kcal')} · {r(m.protein + extraProt)} {tx('g')} {tx('proteinShort')}
            </Muted>
            <Muted>
              {[...sg.items.map((it) => `${ingName(it.ing, lang)} ${it.g}${tx('g')}`), ...sg.extras.map((e) => `${e.name} ${e.g}${tx('g')}`)].join(' · ')}
            </Muted>
            {saved[i] ? <Muted style={{ color: C.primary }}>{tx('savedOk')}</Muted> : <Button icon="heart" kind="soft" label={tx('saveRecipe')} onPress={() => save(sg, i)} />}
          </View>
        );
      })}
      {results && results.length > 0 && <Muted>{tx('aiNote')}</Muted>}
    </Card>
  );
}

export function DishesScreen() {
  const lang = useStore((s) => s.lang);
  const log = useStore((s) => s.log);
  const prefs = useStore((s) => s.prefs);
  const [view, setView] = useState<'saved' | 'all'>('saved');
  const [adding, setAdding] = useState(false);
  const [finding, setFinding] = useState(false);
  const [q, setQ] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  const dishes = useAllDishes();
  const usual = useMemo(() => topDishes(log, dishes, 5), [log, dishes]);
  const needle = q.trim().toLowerCase();
  const shown = dishes
    .filter((d) => (view === 'all' ? true : prefs[d.id] === 'like' || d.custom))
    .filter((d) => !needle || Object.values(d.name).some((n) => n.toLowerCase().includes(needle)))
    .sort((a, b) => Number(!!b.custom) - Number(!!a.custom))
    .slice(0, 80);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
      <Row>
        {!adding && <Button icon="plus" label={tx('addRecipe')} onPress={() => setAdding(true)} />}
        {!finding && <Button icon="sparkle" kind="soft" label={tx('aiFinder')} onPress={() => setFinding(true)} />}
      </Row>
      {adding && <AddDishForm onDone={() => setAdding(false)} />}
      {finding && <AiFinder onDone={() => setFinding(false)} />}
      <Muted>{tx('savedHint')}</Muted>
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
        value={view}
        onChange={setView}
        options={[{ value: 'saved', label: tx('savedTab') }, { value: 'all', label: tx('allDishes') }]}
      />
      {shown.length === 0 && <Muted>{tx('savedEmpty')}</Muted>}
      <View>
        {shown.map((d) => (
          <DishRow key={d.id} dish={d} />
        ))}
      </View>
    </ScrollView>
  );
}
