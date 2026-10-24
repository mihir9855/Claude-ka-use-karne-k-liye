import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { todayStr } from '../core/dates';
import { computeTargets } from '../core/nutrition';
import { shoppingGap } from '../core/planner';
import type { MealOption } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { allDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Bar, Button, Collapse, H, Muted, Row } from './kit';
import { C, R } from './theme';

const LETTER = ['A', 'B'];

export function TodayScreen() {
  const date = todayStr();
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const plan = useStore((s) => s.plans[date]);
  const custom = useStore((s) => s.customDishes);
  const pantry = useStore((s) => s.pantry);
  const log = useStore((s) => s.log);
  const { makePlan, reshuffleSlot, choose, logMeal, unlog } = useStore.getState();

  const dishes = useMemo(() => allDishes(custom), [custom]);
  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);
  const targets = persons.map(computeTargets);
  const tx = (k: StrKey) => t(lang, k);
  const todayLog = log.filter((e) => e.date === date);
  const names = (ids: string[]) => ids.map((id) => dishName(byId.get(id), lang)).join(' + ');
  const who = (i: number) => persons[i].name || `${tx('person')} ${i + 1}`;

  const picked = (sp: { options: MealOption[]; chosen?: number }) => sp.options[sp.chosen ?? 0];
  const totals = plan
    ? persons.map((_, i) => ({
        kcal: plan.slots.reduce((a, sp) => a + (picked(sp)?.kcal[i] ?? 0), 0),
        protein: plan.slots.reduce((a, sp) => a + (picked(sp)?.protein[i] ?? 0), 0),
      }))
    : [];
  const gap = plan ? shoppingGap(plan, dishes, pantry) : [];
  const extra = todayLog.filter((e) => !plan?.slots.some((sp) => sp.slot === e.slot));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <View style={{ flex: 1 }}>
          <H>{tx('tabToday')}</H>
          <Muted>
            {date}
            {plan ? ` · ${plan.mealCount} ${tx('mealsToday')}` : ''}
          </Muted>
        </View>
        <Button label={plan ? tx('newPlan') : tx('makePlan')} onPress={() => makePlan(date)} />
      </Row>

      {!plan && <Muted>{tx('noPlan')}</Muted>}

      {plan && (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {persons.map((_, i) => (
            <View key={i} style={{ flex: 1, gap: 6 }}>
              <Text style={{ fontSize: 13, color: C.muted }} numberOfLines={1}>{who(i)}</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>
                {r(totals[i].protein)}
                <Text style={{ fontSize: 13, fontWeight: '400', color: C.muted }}>
                  {' '}/ {r(targets[i].protein)} {tx('g')} {tx('proteinShort')}
                </Text>
              </Text>
              <Bar value={totals[i].protein} max={targets[i].protein} />
              <Muted>{r(totals[i].kcal)} / {r(targets[i].kcal)} {tx('kcal')}</Muted>
            </View>
          ))}
        </View>
      )}

      {plan?.slots.map((sp, si) => {
        const slotLog = todayLog.filter((e) => e.slot === sp.slot);
        const eaten = slotLog.length > 0;
        return (
          <View key={sp.slot} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>{tx(`slot_${sp.slot}` as StrKey)}</Text>
              <Row style={{ flexWrap: 'nowrap' }}>
                <Pressable accessibilityRole="button" accessibilityLabel={tx('reshuffle')} onPress={() => reshuffleSlot(date, si)} hitSlop={8}>
                  <Text style={{ fontSize: 18, color: C.muted }}>↻</Text>
                </Pressable>
                {sp.chosen === undefined && !eaten ? (
                  <Text style={{ fontSize: 13, color: C.accent, fontWeight: '600' }}>{tx('pickOne')}</Text>
                ) : (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: eaten }}
                    onPress={() =>
                      eaten ? slotLog.forEach((e) => unlog(e.id)) : logMeal(date, sp.slot, picked(sp).dishIds)
                    }
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: eaten ? C.primary : C.surface,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: eaten ? '#fff' : C.text }}>
                      {eaten ? '✓' : '☐'} {tx('ate')}
                    </Text>
                  </Pressable>
                )}
              </Row>
            </Row>
            {sp.options.map((opt, oi) => {
              const on = sp.chosen === oi;
              return (
                <Pressable
                  key={oi}
                  onPress={() => choose(date, si, oi)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: R - 4,
                    backgroundColor: on ? C.primarySoft : C.surface,
                    borderWidth: 1.5,
                    borderColor: on ? C.primary : 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? C.primary : '#fff',
                    }}
                  >
                    <Text style={{ fontWeight: '700', color: on ? '#fff' : C.muted }}>{LETTER[oi]}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }}>{names(opt.dishIds)}</Text>
                    <Muted>
                      {persons.map((_, i) => `${who(i)} ×${opt.servings[i]} · ${r(opt.protein[i])}${tx('g')}`).join('   ')}
                    </Muted>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}

      {extra.length > 0 && (
        <Collapse title={tx('eatenToday')} summary={`${extra.length}`}>
          {extra.map((e) => (
            <Row key={e.id} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Text style={{ color: C.text, flex: 1 }}>
                {tx(`slot_${e.slot}` as StrKey)}: {names(e.dishIds)}
              </Text>
              <Button kind="danger" label={tx('remove')} onPress={() => unlog(e.id)} />
            </Row>
          ))}
        </Collapse>
      )}

      {plan && (
        <Collapse
          title={tx('shopping')}
          summary={gap.length === 0 ? tx('shoppingNone') : gap.map((g) => ingName(g.ing, lang)).join(', ')}
        >
          {gap.map((g) => (
            <Text key={g.ing} style={{ color: C.text }}>
              {ingName(g.ing, lang)} · {g.grams} {tx('g')}
            </Text>
          ))}
        </Collapse>
      )}
    </ScrollView>
  );
}
