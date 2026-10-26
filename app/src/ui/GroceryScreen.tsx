import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { addDays, todayStr } from '../core/dates';
import { shoppingGapWeek } from '../core/planner';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { AddItem } from './PantryScreen';
import { ShoppingList } from './ShoppingList';
import { Chip, Label, Muted, Row } from './kit';

const ESSENTIALS = ['oil', 'sugar', 'salt'];

export function GroceryScreen() {
  const lang = useStore((s) => s.lang);
  const plans = useStore((s) => s.plans);
  const persons = useStore((s) => s.persons);
  const pantry = useStore((s) => s.pantry);
  const manual = useStore((s) => s.shopping);
  const addToShopping = useStore((s) => s.addToShopping);
  const removeFromShopping = useStore((s) => s.removeFromShopping);
  const dishes = useAllDishes();
  const [adding, setAdding] = useState(false);
  const tx = (k: StrKey) => t(lang, k);

  // what the plan for today and the next six days needs that is not at home
  const planItems = useMemo(() => {
    const today = todayStr();
    const week = Array.from({ length: 7 }, (_, i) => plans[addDays(today, i)]).filter((p) => p && p.slots[0]?.targets.length === persons.length);
    const out: Record<string, number> = {};
    for (const it of shoppingGapWeek(week, dishes, pantry)) out[it.ing] = it.grams;
    return out;
  }, [plans, persons.length, dishes, pantry]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      {adding && <AddItem to="buy" onDone={() => setAdding(false)} />}
      <ShoppingList onAddOwn={() => setAdding(true)} planItems={planItems} />
      <View style={{ gap: 8 }}>
        <Label>{tx('essentials')}</Label>
        <Row>
          {ESSENTIALS.map((id) => (
            <Chip
              key={id}
              tone="accent"
              label={`${manual[id] === undefined ? '+ ' : ''}${INGREDIENT_BY_ID[id].name[lang]}`}
              on={manual[id] !== undefined}
              onPress={() => (manual[id] === undefined ? addToShopping([{ id }]) : removeFromShopping(id))}
            />
          ))}
        </Row>
      </View>
      <Muted>{tx('fromPlanNote')}</Muted>
    </ScrollView>
  );
}
