import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { todayStr } from '../core/dates';
import { computeTargets } from '../core/nutrition';
import { shoppingGap } from '../core/planner';
import type { MealOption } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { allDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Bar, Button, Card, H, Label, Muted, Row } from './kit';
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

  const picked = (sp: { options: MealOption[]; chosen?: number }) => sp.options[sp.chosen ?? 0];
  const totals = plan
    ? persons.map((_, i) => ({
        kcal: plan.slots.reduce((a, sp) => a + (picked(sp)?.kcal[i] ?? 0), 0),
        protein: plan.slots.reduce((a, sp) => a + (picked(sp)?.protein[i] ?? 0), 0),
      }))
    : [];
  const gap = plan ? shoppingGap(plan, dishes, pantry) : [];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <H>{tx('tabToday')}</H>
          <Muted>
            {date}
            {plan ? ` · ${plan.mealCount} ${tx('mealsToday')}` : ''}
          </Muted>
        </View>
        <Button small label={plan ? tx('newPlan') : tx('makePlan')} onPress={() => makePlan(date)} />
      </Row>

      {!plan && <Muted>{tx('noPlan')}</Muted>}

      {plan && (
        <Card>
          <Label>{tx('dayTotal')}</Label>
          {persons.map((p, i) => (
            <View key={i} style={{ gap: 4 }}>
              <Text style={{ color: C.text, fontWeight: '700' }}>
                {p.name || `${tx('person')} ${i + 1}`}: {r(totals[i].protein)}/{r(targets[i].protein)} {tx('g')} {tx('proteinShort')} ·{' '}
                {r(totals[i].kcal)}/{r(targets[i].kcal)} {tx('kcal')}
              </Text>
              <Bar value={totals[i].protein} max={targets[i].protein} />
            </View>
          ))}
        </Card>
      )}

      {plan?.slots.map((sp, si) => {
        const slotLog = todayLog.filter((e) => e.slot === sp.slot);
        const chosen = picked(sp);
        return (
          <Card key={sp.slot}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: C.text }}>{tx(`slot_${sp.slot}` as StrKey)}</Text>
              <Button small kind="ghost" label={tx('reshuffle')} onPress={() => reshuffleSlot(date, si)} />
            </Row>
            {sp.options.map((opt, oi) => {
              const on = (sp.chosen ?? 0) === oi && sp.chosen !== undefined;
              return (
                <Pressable
                  key={oi}
                  onPress={() => choose(date, si, oi)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? C.primary : C.border,
                    backgroundColor: on ? C.primarySoft : C.card,
                    borderRadius: R - 4,
                    padding: 12,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontWeight: '800', color: on ? C.primary : C.muted }}>
                    {tx('option')} {LETTER[oi]} {on ? `· ${tx('picked')}` : ''}
                  </Text>
                  <Text style={{ fontSize: 16, color: C.text }}>
                    {opt.dishIds.map((id) => dishName(byId.get(id), lang)).join(' + ')}
                  </Text>
                  {persons.map((p, i) => (
                    <Muted key={i}>
                      {p.name || `${tx('person')} ${i + 1}`}: ×{opt.servings[i]} · {r(opt.kcal[i])} {tx('kcal')} · {r(opt.protein[i])} {tx('g')}{' '}
                      {tx('proteinShort')}
                    </Muted>
                  ))}
                </Pressable>
              );
            })}
            {slotLog.length > 0 ? (
              slotLog.map((e) => (
                <Row key={e.id} style={{ justifyContent: 'space-between' }}>
                  <Text style={{ color: C.primary, flex: 1 }}>
                    ✓ {tx('ate')}: {e.dishIds.map((id) => dishName(byId.get(id), lang)).join(' + ')}
                  </Text>
                  <Button small kind="danger" label={tx('remove')} onPress={() => unlog(e.id)} />
                </Row>
              ))
            ) : (
              <Button small label={tx('ateIt')} onPress={() => logMeal(date, sp.slot, chosen.dishIds)} />
            )}
          </Card>
        );
      })}

      {plan && (
        <Card>
          <Label>{tx('shopping')}</Label>
          {gap.length === 0 ? (
            <Muted>{tx('shoppingNone')}</Muted>
          ) : (
            gap.map((g) => (
              <Text key={g.ing} style={{ color: C.text }}>
                • {ingName(g.ing, lang)} — {g.grams} {tx('g')}
              </Text>
            ))
          )}
        </Card>
      )}

      {todayLog.some((e) => !plan?.slots.some((sp) => sp.slot === e.slot)) && (
        <Card>
          <Label>{tx('eatenToday')}</Label>
          {todayLog
            .filter((e) => !plan?.slots.some((sp) => sp.slot === e.slot))
            .map((e) => (
              <Row key={e.id} style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: C.text, flex: 1 }}>
                  {tx(`slot_${e.slot}` as StrKey)}: {e.dishIds.map((id) => dishName(byId.get(id), lang)).join(' + ')}
                </Text>
                <Button small kind="danger" label={tx('remove')} onPress={() => unlog(e.id)} />
              </Row>
            ))}
        </Card>
      )}
    </ScrollView>
  );
}
