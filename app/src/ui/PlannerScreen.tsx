import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { addDays, todayStr } from '../core/dates';
import { computeTargets } from '../core/nutrition';
import type { DayPlan, MealOption } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { planSignature, useAllDishes, useStore } from '../state/store';
import { dateLabel, dishName, r } from './helpers';
import { Icon, SLOT_ICON } from './Icon';
import { Button, H, Muted, Row } from './kit';
import { useNav } from './nav';
import { C, R } from './theme';

const pick = (sp: { options: MealOption[]; chosen?: number }) => sp.options[sp.chosen ?? 0];

export function PlannerScreen() {
  const nav = useNav();
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const plans = useStore((s) => s.plans);
  const log = useStore((s) => s.log);
  const makeWeek = useStore((s) => s.makeWeek);
  const rules = useStore((s) => s.rules);
  const menu = useStore((s) => s.menu);
  const mealCount = useStore((s) => s.mealCount);
  const dishEdits = useStore((s) => s.dishEdits);
  const prefs = useStore((s) => s.prefs);
  const planSig = useStore((s) => s.planSig);
  const dishes = useAllDishes();
  const byId = useMemo(() => new Map(dishes.map((d) => [d.id, d])), [dishes]);
  const targets = useMemo(() => persons.map(computeTargets), [persons]);
  const tx = (k: StrKey) => t(lang, k);

  const today = todayStr();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  // a plan built for a different family size is stale
  const valid = (p: DayPlan | undefined) => (p && p.slots[0]?.targets.length === persons.length ? p : undefined);
  const hasAny = days.some((d) => valid(plans[d]));
  const short = (i: number) => (persons[i].name.trim() ? Array.from(persons[i].name.trim())[0].toUpperCase() : String(i + 1));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
      <Row style={{ flexWrap: 'nowrap' }}>
        <View style={{ flex: 1 }}>
          <Button icon="refresh" label={hasAny ? tx('replanWeek') : tx('planWeek')} onPress={makeWeek} />
        </View>
        <Button icon="cart" kind="soft" label={tx('getGrocery')} onPress={() => nav.setTab('grocery')} />
      </Row>

      {!hasAny && <Muted>{tx('noWeek')}</Muted>}
      {hasAny && planSig !== planSignature({ persons, rules, menu, mealCount, dishEdits, prefs }) && (
        <Pressable accessibilityRole="button" onPress={makeWeek} style={{ backgroundColor: C.accentSoft, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="refresh" size={18} color={C.accent} />
          <Text style={{ flex: 1, color: C.text, fontSize: 14 }}>{tx('planStale')}</Text>
        </Pressable>
      )}

      {days.map((date) => {
        const plan = valid(plans[date]);
        if (!plan) return null;
        const lab = dateLabel(date, lang);
        const eatenSlots = new Set(log.filter((e) => e.date === date).map((e) => e.slot));
        const protein = persons.map((_, i) => plan.slots.reduce((a, sp) => a + (pick(sp)?.protein[i] ?? 0), 0));
        return (
          <View key={date} style={{ backgroundColor: C.surface, borderRadius: R, padding: 14, gap: 12 }}>
            <Row style={{ flexWrap: 'nowrap', gap: 10 }}>
              <H>{`${lab.month} ${lab.day}`}</H>
              <Text style={{ color: C.muted, fontWeight: '600' }}>{date === today ? tx('todayCaps') : lab.weekday}</Text>
            </Row>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {plan.slots.map((sp, i) => {
                const opt = pick(sp);
                if (!opt) return null;
                const eaten = eatenSlots.has(sp.slot);
                return (
                  <Pressable
                    key={sp.slot}
                    accessibilityRole="button"
                    onPress={() => nav.go({ k: 'meal', date, i })}
                    style={{ width: 190, backgroundColor: eaten ? C.primarySoft : '#fff', borderRadius: 14, padding: 12, gap: 8, borderWidth: 1, borderColor: eaten ? C.primary : C.line }}
                  >
                    <Row style={{ flexWrap: 'nowrap', gap: 6, justifyContent: 'space-between' }}>
                      <Row style={{ flexWrap: 'nowrap', gap: 6, flex: 1 }}>
                        <Icon name={SLOT_ICON[sp.slot]} size={15} color={C.primary} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 1 }}>
                          {tx(`slot_${sp.slot}` as StrKey)}
                        </Text>
                      </Row>
                      {eaten && <Icon name="check" size={15} color={C.primary} width={3} />}
                    </Row>
                    {opt.dishIds.map((id) => (
                      <View key={id} style={{ backgroundColor: C.accentSoft, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start', maxWidth: '100%' }}>
                        <Text style={{ fontSize: 15, color: C.text }} numberOfLines={2}>
                          {dishName(byId.get(id), lang)}
                        </Text>
                      </View>
                    ))}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Row style={{ gap: 8 }}>
              {persons.map((_, i) => {
                const ok = protein[i] >= targets[i].protein * 0.9;
                return (
                  <View key={i} style={{ backgroundColor: ok ? C.primarySoft : C.accentSoft, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: ok ? C.primary : C.accent }}>
                      {short(i)} · {r(protein[i])}/{r(targets[i].protein)} {tx('g')}
                    </Text>
                  </View>
                );
              })}
            </Row>
          </View>
        );
      })}
    </ScrollView>
  );
}
