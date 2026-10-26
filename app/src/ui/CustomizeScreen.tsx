import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from './Text';
import { dishMacros } from '../core/nutrition';
import type { Dish, DishItem } from '../core/types';
import { INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Button, Chip, Muted, Row, Search } from './kit';
import { C, R } from './theme';

function Editor({ dish }: { dish: Dish }) {
  const lang = useStore((s) => s.lang);
  const edited = useStore((s) => !!s.dishEdits[dish.id]);
  const setItems = useStore((s) => s.setDishItems);
  const reset = useStore((s) => s.resetDishItems);
  const mine = useStore((s) => s.customIngredients);
  const [q, setQ] = useState('');
  const tx = (k: StrKey) => t(lang, k);
  const items = dish.items;

  const change = (ing: string, delta: number) =>
    setItems(
      dish.id,
      items.flatMap((x): DishItem[] => (x.ing !== ing ? [x] : x.g + delta <= 0 ? (items.length > 1 ? [] : [x]) : [{ ...x, g: x.g + delta }])),
    );
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return INGREDIENTS.filter((i) => !items.some((x) => x.ing === i.id) && Object.values(i.name).some((n) => n.toLowerCase().includes(needle))).slice(0, 8);
  }, [q, items, mine]);
  const m = dishMacros(dish);

  return (
    <View style={{ gap: 10, paddingTop: 8 }}>
      {items.map((it) => (
        <Row key={it.ing} style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
          <Text style={{ color: C.text, flex: 1 }}>{ingName(it.ing, lang)}</Text>
          <Button kind="soft" label="−" onPress={() => change(it.ing, -10)} />
          <Text style={{ width: 58, textAlign: 'center', color: C.text }}>
            {it.g} {tx('g')}
          </Text>
          <Button kind="soft" label="+" onPress={() => change(it.ing, 10)} />
        </Row>
      ))}
      <Row>
        <Search value={q} onChangeText={setQ} placeholder={tx('addIngredient')} />
      </Row>
      <Row>
        {matches.map((i) => (
          <Chip
            key={i.id}
            label={`+ ${i.name[lang]}`}
            onPress={() => {
              setItems(dish.id, [...items, { ing: i.id, g: 50 }]);
              setQ('');
            }}
          />
        ))}
      </Row>
      <Muted>
        {r(m.kcal)} {tx('kcal')} · {r(m.protein)} {tx('g')} {tx('proteinShort')}
      </Muted>
      {edited && <Button kind="soft" label={tx('resetDish')} onPress={() => reset(dish.id)} />}
    </View>
  );
}

export function CustomizeScreen() {
  const lang = useStore((s) => s.lang);
  const edits = useStore((s) => s.dishEdits);
  const dishes = useAllDishes();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const tx = (k: StrKey) => t(lang, k);
  const needle = q.trim().toLowerCase();
  const shown = dishes
    .filter((d) => !needle || Object.values(d.name).some((n) => n.toLowerCase().includes(needle)))
    .sort((a, b) => Number(!!edits[b.id]) - Number(!!edits[a.id]))
    .slice(0, 60);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
      <Muted>{tx('customizeHint')}</Muted>
      <Row>
        <Search value={q} onChangeText={setQ} placeholder={tx('search')} />
      </Row>
      {shown.map((d) => (
        <View key={d.id} style={{ backgroundColor: C.surface, borderRadius: R, padding: 14 }}>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: '700', color: C.text }} onPress={() => setOpen(open === d.id ? null : d.id)}>
              {dishName(d, lang)}
              {edits[d.id] ? `  ·  ${tx('edited')}` : ''}
            </Text>
            <Button kind="soft" label={open === d.id ? tx('close') : tx('reshuffle')} onPress={() => setOpen(open === d.id ? null : d.id)} />
          </Row>
          {open === d.id && <Editor dish={d} />}
        </View>
      ))}
    </ScrollView>
  );
}
