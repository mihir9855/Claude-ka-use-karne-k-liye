import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { addDays, todayStr } from '../core/dates';
import { shoppingGapWeek } from '../core/planner';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dateLabel } from './helpers';
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
  const ateOut = useStore((s) => s.ateOut);
  const [adding, setAdding] = useState(false);
  const tx = (k: StrKey) => t(lang, k);

  // what the plan for today and the next six days needs that is not at home
  const planItems = useMemo(() => {
    const today = todayStr();
    const week = Array.from({ length: 7 }, (_, i) => addDays(today, i)).filter((d) => !ateOut[d]).map((d) => plans[d]).filter((p) => p && p.slots[0]?.targets.length === persons.length);
    const out: Record<string, number> = {};
    for (const it of shoppingGapWeek(week, dishes, pantry)) out[it.ing] = it.grams;
    return out;
  }, [plans, persons.length, dishes, pantry, ateOut]);

  // which dishes of the week need each item, e.g. "Poha (Wed), Upma (Sat)"
  const usedIn = useMemo(() => {
    const today = todayStr();
    const byId = new Map(dishes.map((d) => [d.id, d]));
    const seen: Record<string, string[]> = {};
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const plan = plans[date];
      if (ateOut[date] || !plan) continue;
      const day = dateLabel(date, 'en').weekday.slice(0, 3);
      for (const sp of plan.slots) {
        const opt = sp.options[sp.chosen ?? 0];
        for (const id of opt?.dishIds ?? []) {
          const d = byId.get(id);
          if (!d) continue;
          for (const it of d.items) {
            const list = (seen[it.ing] ??= []);
            list.push(`${d.id}|${day}`);
          }
        }
      }
    }
    return Object.fromEntries(
      Object.entries(seen).map(([k, v]) => {
        const meals = new Set(v).size;
        const days = [...new Set(v.map((x) => x.split('|')[1]))];
        return [k, `${meals} ${meals === 1 ? 'meal' : 'meals'} · ${days.join(', ')}`];
      }),
    );
  }, [plans, dishes, ateOut]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      {adding && <AddItem to="buy" onDone={() => setAdding(false)} />}
      <ShoppingList onAddOwn={() => setAdding(true)} planItems={planItems} usedIn={usedIn} />
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
