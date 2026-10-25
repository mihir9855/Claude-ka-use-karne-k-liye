import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { todayStr } from '../core/dates';
import { dayChecks, type CheckKey } from '../core/dayCheck';
import { computeTargets } from '../core/nutrition';
import { portionText } from '../core/portion';
import { shoppingGap } from '../core/planner';
import type { Dish, MealOption } from '../core/types';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { allDishes, useStore } from '../state/store';
import { dishName, ingName, r } from './helpers';
import { Icon, SLOT_ICON } from './Icon';
import { Bar, Button, Collapse, H, Muted, Row } from './kit';
import { C, R } from './theme';

const CHECKS: CheckKey[] = ['protein', 'fiber', 'veg', 'pulse', 'dairy', 'fruit'];

/** What the cook needs for everyone eating this meal, in grams. */
function cookList(opt: MealOption, byId: Map<string, Dish>) {
  const people = opt.servings.reduce((a, b) => a + b, 0);
  return opt.dishIds.map((id) => ({
    id,
    items: (byId.get(id)?.items ?? [])
      .filter((it) => !INGREDIENT_BY_ID[it.ing]?.basic)
      .map((it) => ({ ing: it.ing, g: Math.round((it.g * people) / 10) * 10 })),
  }));
}

export function TodayScreen({ onMore }: { onMore: () => void }) {
  const date = todayStr();
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const rawPlan = useStore((s) => s.plans[date]);
  // a plan built for a different family size is stale
  const plan = rawPlan && rawPlan.slots[0]?.targets.length === persons.length ? rawPlan : undefined;
  const custom = useStore((s) => s.customDishes);
  const pantry = useStore((s) => s.pantry);
  const shopping = useStore((s) => s.shopping);
  const log = useStore((s) => s.log);
  const { makePlan, reshuffleSlot, logMeal, unlog, addToShopping } = useStore.getState();
  const [open, setOpen] = useState<string | null>(null);

  const dishes = useMemo(() => allDishes(custom), [custom]);
  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);
  const targets = persons.map(computeTargets);
  const tx = (k: StrKey) => t(lang, k);
  const todayLog = log.filter((e) => e.date === date);
  const names = (ids: string[]) => ids.map((id) => dishName(byId.get(id), lang)).join(' + ');
  const who = (i: number) => persons[i].name || `${tx('person')} ${i + 1}`;
  const short = (i: number) => (persons[i].name.trim() ? Array.from(persons[i].name.trim())[0].toUpperCase() : String(i + 1));

  const pick = (sp: { options: MealOption[]; chosen?: number }) => sp.options[sp.chosen ?? 0];
  const totals = plan
    ? persons.map((_, i) => plan.slots.reduce((a, sp) => a + (pick(sp)?.protein[i] ?? 0), 0))
    : [];
  const gap = plan ? shoppingGap(plan, dishes, pantry) : [];
  const checks = plan ? dayChecks(plan, dishes, persons) : undefined;
  const okCount = checks ? CHECKS.filter((k) => checks[k]).length : 0;
  const extra = todayLog.filter((e) => !plan?.slots.some((sp) => sp.slot === e.slot));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <View style={{ flex: 1 }}>
          <H>{tx('tabToday')}</H>
          <Muted>{date}</Muted>
        </View>
        <Button icon="refresh" kind={plan ? 'soft' : 'primary'} label={plan ? tx('newPlan') : tx('makePlan')} onPress={() => makePlan(date)} />
      </Row>

      {!plan && <Muted>{tx('noPlan')}</Muted>}

      {plan && (
        <View style={{ gap: 12 }}>
          {persons.map((_, i) => {
            const left = Math.max(0, Math.round(targets[i].protein - totals[i]));
            return (
              <View key={i} style={{ gap: 5 }}>
                <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: C.text }} numberOfLines={1}>
                    {who(i)}
                  </Text>
                  <Muted>
                    {r(totals[i])} / {r(targets[i].protein)} {tx('g')} {tx('proteinShort')}
                  </Muted>
                </Row>
                <Bar value={totals[i]} max={targets[i].protein} />
                <Muted>{left > 0 ? `${left} ${tx('g')} ${tx('proteinLeft')}` : `✓ ${tx('proteinDone')}`}</Muted>
              </View>
            );
          })}
        </View>
      )}

      {plan?.slots.map((sp, si) => {
        const opt = pick(sp);
        if (!opt) return null;
        const slotLog = todayLog.filter((e) => e.slot === sp.slot);
        const eaten = slotLog.length > 0;
        const isOpen = open === sp.slot;
        return (
          <View key={sp.slot} style={{ backgroundColor: eaten ? C.primarySoft : C.surface, borderRadius: R, padding: 14, gap: 10 }}>
            <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Row style={{ flexWrap: 'nowrap', gap: 8 }}>
                <Icon name={SLOT_ICON[sp.slot]} size={18} color={C.primary} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  {tx(`slot_${sp.slot}` as StrKey)}
                </Text>
              </Row>
              {!eaten && (
                <Pressable accessibilityRole="button" onPress={() => reshuffleSlot(date, si)} hitSlop={8}>
                  <Row style={{ flexWrap: 'nowrap', gap: 4 }}>
                    <Icon name="refresh" size={16} color={C.primary} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.primary }}>{tx('reshuffle')}</Text>
                  </Row>
                </Pressable>
              )}
            </Row>

            <Text style={{ fontSize: 20, fontWeight: '700', color: C.text }}>{names(opt.dishIds)}</Text>
            <Muted>
              {persons.length === 1
                ? `${r(opt.kcal[0])} ${tx('kcal')} · ${r(opt.protein[0])} ${tx('g')} ${tx('proteinShort')}`
                : `${tx('portion')}: ${persons.map((_, i) => `${short(i)}: ${portionText(opt.servings[i])}`).join(' · ')}`}
            </Muted>

            <Row>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: eaten }}
                onPress={() => (eaten ? slotLog.forEach((e) => unlog(e.id)) : logMeal(date, sp.slot, opt.dishIds))}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, backgroundColor: eaten ? C.primary : '#fff', borderWidth: 1, borderColor: eaten ? C.primary : C.line }}
              >
                {eaten && <Icon name="check" size={15} color="#fff" width={3} />}
                <Text style={{ fontWeight: '600', color: eaten ? '#fff' : C.text }}>{eaten ? tx('ate') : tx('ateIt')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setOpen(isOpen ? null : sp.slot)} hitSlop={8}>
                <Text style={{ color: C.primary, fontWeight: '600' }}>{isOpen ? tx('hideCook') : tx('cookNeeds')}</Text>
              </Pressable>
            </Row>

            {isOpen &&
              cookList(opt, byId).map((d) => (
                <View key={d.id} style={{ gap: 2 }}>
                  <Text style={{ fontWeight: '700', color: C.text }}>{dishName(byId.get(d.id), lang)}</Text>
                  <Muted>{d.items.map((it) => `${ingName(it.ing, lang)} ${it.g} ${tx('g')}`).join(' · ')}</Muted>
                </View>
              ))}
          </View>
        );
      })}

      {extra.length > 0 && (
        <View style={{ gap: 6 }}>
          <Muted>{tx('eatenToday')}</Muted>
          {extra.map((e) => (
            <Row key={e.id} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <Text style={{ color: C.text, flex: 1 }}>
                {tx(`slot_${e.slot}` as StrKey)}: {names(e.dishIds)}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel={tx('remove')} onPress={() => unlog(e.id)} hitSlop={8}>
                <Icon name="close" size={18} color={C.muted} />
              </Pressable>
            </Row>
          ))}
        </View>
      )}

      {plan && <Button icon="plus" kind="soft" label={tx('moreAte')} onPress={onMore} />}

      {checks && (
        <Collapse icon="check" title={tx('healthCheck')} summary={`${okCount}/${CHECKS.length} ${tx('okOf')}`}>
          <Row>
            {CHECKS.map((k) => (
              <Row key={k} style={{ flexWrap: 'nowrap', gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: checks[k] ? C.primarySoft : C.accentSoft }}>
                {checks[k] && <Icon name="check" size={13} color={C.primary} width={3} />}
                <Text style={{ fontSize: 13, color: checks[k] ? C.primary : C.accent, fontWeight: '600' }}>{tx(`chk_${k}` as StrKey)}</Text>
              </Row>
            ))}
          </Row>
          {!checks.protein && <Muted>{tx('proteinTip')}</Muted>}
        </Collapse>
      )}

      {plan && (
        <Collapse icon="cart" title={tx('shopping')} summary={gap.length === 0 ? tx('shoppingNone') : gap.map((g) => ingName(g.ing, lang)).join(', ')}>
          {gap.map((g) => (
            <Text key={g.ing} style={{ color: C.text }}>
              {ingName(g.ing, lang)} · {g.grams} {tx('g')}
            </Text>
          ))}
          {gap.length > 0 &&
            (gap.every((g) => shopping[g.ing] !== undefined) ? (
              <Muted>{tx('inList')}</Muted>
            ) : (
              <Button icon="plus" kind="soft" label={tx('addToList')} onPress={() => addToShopping(gap.map((g) => ({ id: g.ing, g: g.grams })))} />
            ))}
        </Collapse>
      )}
    </ScrollView>
  );
}
