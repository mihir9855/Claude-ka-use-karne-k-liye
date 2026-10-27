import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { dishMacros } from '../core/nutrition';
import { portionText } from '../core/portion';
import type { Dish, MealOption } from '../core/types';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dateLabel, dishName, ingName, r } from './helpers';
import { Icon } from './Icon';
import { Button, Chip, Muted, Pill, Row, Segmented } from './kit';
import { C, MEAL, RADIUS, SHADOW } from './theme';

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
  const { reshuffleSlot, logMeal, unlog, setPref, toggleMenuDish, choose } = useStore.getState();
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
  const col = MEAL[sp.slot];
  const who = (i: number) => persons[i].name || `${tx('person')} ${i + 1}`;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col.strong }} />
          <Text style={s.heroLabel} numberOfLines={1}>
            {tx(`slot_${sp.slot}` as StrKey)}
          </Text>
        </View>
        <Text style={s.heroDate} numberOfLines={1}>
          {`${lab.weekday} ${lab.day} ${lab.month}`}
        </Text>
      </View>

      {sp.options.length > 1 && !eaten && (
        <Segmented
          value={sp.chosen ?? 0}
          onChange={(k) => choose(date, index, k)}
          options={sp.options.slice(0, 3).map((_, k) => ({ value: k, label: `Option ${'ABC'[k]}` }))}
        />
      )}
      <Row>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={eaten ? tx('ate') : tx('markEaten')}
          accessibilityState={{ checked: eaten }}
          onPress={() => (eaten ? eatenEntries.forEach((e) => unlog(e.id)) : logMeal(date, sp.slot, opt.dishIds))}
          style={[s.eatBtn, eaten ? { backgroundColor: C.good } : { backgroundColor: C.ink }]}
        >
          <Icon name="check" size={18} color="#fff" width={3} />
          <Text style={s.eatText} numberOfLines={1}>
            {eaten ? tx('ate') : tx('markEaten')}
          </Text>
        </Pressable>
        {!eaten && <Button icon="refresh" kind="soft" label={tx('anotherOption')} onPress={() => reshuffleSlot(date, index)} />}
      </Row>

      {opt.dishIds.map((id) => {
        const d = byId.get(id);
        const liked = prefs[id] === 'like';
        const items = cookItems(d, people);
        return (
          <View key={id} style={s.dish}>
            <Row style={{ flexWrap: 'nowrap', gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
                {d && <Pill label={tx(`role_${d.role}` as StrKey)} />}
                {d && (
                  <Text style={s.dishSub} numberOfLines={1}>
                    {`${r(dishMacros(d).kcal)} ${tx('kcal')} · ${r(dishMacros(d).protein)} ${tx('g')} ${tx('proteinShort')}`}
                  </Text>
                )}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={tx('liked')} onPress={() => setPref(id, liked ? undefined : 'like')} hitSlop={10} style={s.heart}>
                <Icon name="heart" size={20} color={liked ? C.danger : C.muted} />
              </Pressable>
            </Row>
            <Text style={s.dishTitle} numberOfLines={1}>
              {dishName(d, lang)}
            </Text>
            <Muted>{tx('cookNeeds')}</Muted>
            <Row>
              {items.map((it) => (
                <View key={it.ing} style={s.ing}>
                  <Text style={s.ingText} numberOfLines={1}>{`${ingName(it.ing, lang)}  ${it.g} ${tx('g')}`}</Text>
                </View>
              ))}
            </Row>
            <Row>
              <Chip label="Watch recipe" onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${dishName(d, 'en')} recipe`)}`)} />
              {!menuOff[id] && <Chip tone="accent" label={tx('removeFromMenu')} onPress={() => toggleMenuDish(id)} />}
            </Row>
          </View>
        );
      })}

      <View style={s.portion}>
        <Text style={s.portionTitle} numberOfLines={1}>
          {tx('portionWord')}
        </Text>
        <Row style={{ gap: 10 }}>
          {persons.map((_, i) => (
            <View key={i} style={s.person}>
              <Text style={s.personName} numberOfLines={1}>
                {who(i)}
              </Text>
              <Text style={s.personPortion} numberOfLines={1}>
                {portionText(opt.servings[i])}
              </Text>
              <Text style={s.personSub} numberOfLines={1}>
                {`${r(opt.kcal[i])} ${tx('kcal')}`}
              </Text>
            </View>
          ))}
        </Row>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  heroLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.1, color: C.muted },
  heroDate: { fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: -0.6 },
  eatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 46, paddingHorizontal: 18, borderRadius: RADIUS.md, maxWidth: '100%' },
  eatText: { color: '#fff', fontSize: 15, fontWeight: '600', flexShrink: 1 },
  dish: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, gap: 10, ...SHADOW },
  dishTitle: { fontSize: 20, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  dishSub: { fontSize: 13, color: C.muted, fontWeight: '500' },
  heart: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  ing: { backgroundColor: C.surface, borderRadius: RADIUS.sm, paddingVertical: 6, paddingHorizontal: 10, maxWidth: '100%' },
  ingText: { fontSize: 13, color: C.text, fontWeight: '500' },
  portion: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, gap: 12, ...SHADOW },
  portionTitle: { color: C.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.1 },
  person: { flexBasis: '30%', flexGrow: 1, minWidth: 96, backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: 12, gap: 2 },
  personName: { color: C.muted, fontSize: 12, fontWeight: '500' },
  personPortion: { color: C.text, fontSize: 24, fontWeight: '700' },
  personSub: { color: C.muted, fontSize: 12 },
});
