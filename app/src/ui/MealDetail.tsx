import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { portionText } from '../core/portion';
import type { Dish, MealOption } from '../core/types';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dateLabel, dishName, ingName, r } from './helpers';
import { Icon, SLOT_ICON } from './Icon';
import { Button, Muted, Row } from './kit';
import { C, R } from './theme';

/** What the cook needs for everyone eating this meal, in grams. */
function cookItems(dish: Dish | undefined, people: number) {
  return (dish?.items ?? [])
    .filter((it) => !INGREDIENT_BY_ID[it.ing]?.basic)
    .map((it) => ({ ing: it.ing, g: Math.max(10, Math.round((it.g * people) / 10) * 10) }));
}

export function MealDetail({ date, index }: { date: string; index: number }) {
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const plan = useStore((s) => s.plans[date]);
  const log = useStore((s) => s.log);
  const prefs = useStore((s) => s.prefs);
  const menuOff = useStore((s) => s.menu.menuOff);
  const { reshuffleSlot, logMeal, unlog, setPref, toggleMenuDish } = useStore.getState();
  const dishes = useAllDishes();
  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);
  const tx = (k: StrKey) => t(lang, k);
  const sp = plan?.slots[index];
  const opt: MealOption | undefined = sp?.options[sp?.chosen ?? 0];
  if (!sp || !opt) return <Muted>{tx('noPlan')}</Muted>;

  const eatenEntries = log.filter((e) => e.date === date && e.slot === sp.slot);
  const eaten = eatenEntries.length > 0;
  const people = opt.servings.reduce((a, b) => a + b, 0);
  const lab = dateLabel(date, lang);
  const who = (i: number) => persons[i].name || `${tx('person')} ${i + 1}`;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Row style={{ flexWrap: 'nowrap', gap: 8 }}>
        <Icon name={SLOT_ICON[sp.slot]} size={18} color={C.primary} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {tx(`slot_${sp.slot}` as StrKey)} · {lab.weekday}, {lab.day} {lab.month}
        </Text>
      </Row>

      <View style={{ gap: 6 }}>
        {opt.dishIds.map((id) => (
          <Text key={id} style={{ fontSize: 24, fontWeight: '800', color: C.text }}>
            {dishName(byId.get(id), lang)}
          </Text>
        ))}
      </View>

      <Row>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: eaten }}
          onPress={() => (eaten ? eatenEntries.forEach((e) => unlog(e.id)) : logMeal(date, sp.slot, opt.dishIds))}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999, backgroundColor: eaten ? C.primary : '#fff', borderWidth: 1, borderColor: eaten ? C.primary : C.line }}
        >
          {eaten && <Icon name="check" size={16} color="#fff" width={3} />}
          <Text style={{ fontWeight: '700', color: eaten ? '#fff' : C.text }}>{eaten ? tx('ate') : tx('ateIt')}</Text>
        </Pressable>
        {!eaten && <Button icon="refresh" kind="soft" label={tx('swapMeal')} onPress={() => reshuffleSlot(date, index)} />}
      </Row>

      <View style={{ backgroundColor: C.surface, borderRadius: R, padding: 14, gap: 8 }}>
        <Text style={{ fontWeight: '700', color: C.text }}>{tx('portion')}</Text>
        {persons.map((_, i) => (
          <Row key={i} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <Text style={{ color: C.text, flex: 1 }} numberOfLines={1}>
              {who(i)}
            </Text>
            <Muted>
              {portionText(opt.servings[i])} · {r(opt.kcal[i])} {tx('kcal')} · {r(opt.protein[i])} {tx('g')} {tx('proteinShort')}
            </Muted>
          </Row>
        ))}
      </View>

      <View style={{ gap: 14 }}>
        <Text style={{ fontWeight: '700', color: C.text, fontSize: 16 }}>{tx('cookNeeds')}</Text>
        {opt.dishIds.map((id) => {
          const d = byId.get(id);
          const liked = prefs[id] === 'like';
          return (
            <View key={id} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <Text style={{ fontWeight: '700', color: C.text, flex: 1 }}>{dishName(d, lang)}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={tx('liked')} onPress={() => setPref(id, liked ? undefined : 'like')} hitSlop={8}>
                  <Icon name="heart" size={20} color={liked ? C.danger : C.muted} />
                </Pressable>
              </Row>
              <Muted>{cookItems(d, people).map((it) => `${ingName(it.ing, lang)} ${it.g} ${tx('g')}`).join(' · ')}</Muted>
              {!menuOff[id] && (
                <Pressable accessibilityRole="button" onPress={() => toggleMenuDish(id)} hitSlop={6}>
                  <Text style={{ color: C.danger, fontSize: 13, fontWeight: '600' }}>{tx('removeFromMenu')}</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
