import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { artFor } from '../core/artFor';
import { addDays, todayStr } from '../core/dates';
import { computeTargets } from '../core/nutrition';
import type { DayPlan, MealOption } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { planSignature, useAllDishes, useStore } from '../state/store';
import { CUISINE_TONE, DishArt, MealArt } from './Art';
import { dateLabel, dishName, r } from './helpers';
import { Icon } from './Icon';
import { Muted, Pill, Row, Segmented } from './kit';
import { useNav } from './nav';
import { C, MEAL, RADIUS, SHADOW } from './theme';

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
  const initial = (i: number) => (persons[i].name.trim() ? Array.from(persons[i].name.trim())[0].toUpperCase() : String(i + 1));
  const [view, setView] = useState<'day' | 'week'>('day');
  const [sel, setSel] = useState(today);
  const stale = hasAny && planSig !== planSignature({ persons, rules, menu, mealCount, dishEdits, prefs });
  const eatenOn = (date: string) => new Set(log.filter((e) => e.date === date).map((e) => e.slot));
  const dishesOf = (opt: MealOption) => opt.dishIds.map((id) => dishName(byId.get(id), lang)).join(', ');

  const top = (
    <View style={{ gap: 12 }}>
      <Row style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Segmented value={view} onChange={setView} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]} />
        </View>
        {hasAny && (
          <Pressable accessibilityRole="button" accessibilityLabel={tx('replanWeek')} onPress={makeWeek} style={({ pressed }) => [s.planBtn, pressed && { opacity: 0.8 }]}>
            <Icon name="refresh" size={16} color={C.ink} width={2.6} />
            <Text style={s.planBtnText} numberOfLines={1}>
              {tx('replanWeek')}
            </Text>
          </Pressable>
        )}
      </Row>
      {stale && (
        <Pressable accessibilityRole="button" accessibilityLabel={tx('planStale')} onPress={makeWeek} style={s.stale}>
          <Icon name="refresh" size={18} color={C.accent} />
          <Text style={s.staleText} numberOfLines={1}>
            {tx('planStale')}
          </Text>
        </Pressable>
      )}
    </View>
  );

  if (!hasAny)
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={s.empty}>
          <MealArt slot="lunch" size={120} />
          <Text style={s.emptyTitle} numberOfLines={1}>
            {tx('weekHero')}
          </Text>
          <Muted>{tx('noWeek')}</Muted>
          <Pressable accessibilityRole="button" accessibilityLabel={tx('planWeek')} onPress={makeWeek} style={({ pressed }) => [s.planBtn, { alignSelf: 'center', minHeight: 50, paddingHorizontal: 26 }, pressed && { opacity: 0.8 }]}>
            <Icon name="refresh" size={16} color={C.ink} width={2.6} />
            <Text style={s.planBtnText} numberOfLines={1}>
              {tx('planWeek')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );

  const MealRow = ({ date, i }: { date: string; i: number }) => {
    const plan = valid(plans[date]);
    const sp = plan?.slots[i];
    const opt = sp && pick(sp);
    if (!sp || !opt) return null;
    const eaten = eatenOn(date).has(sp.slot);
    const col = MEAL[sp.slot];
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${tx(`slot_${sp.slot}` as StrKey)}: ${dishesOf(opt)}`}
        onPress={() => nav.go({ k: 'meal', date, i })}
        style={({ pressed }) => [s.wRow, pressed && { opacity: 0.7 }]}
      >
        <View style={[s.dot, { backgroundColor: col.strong }]} />
        <Text style={[s.wSlot, { color: col.ink }]} numberOfLines={1}>
          {tx(`slot_${sp.slot}` as StrKey)}
        </Text>
        <Text style={s.wDish} numberOfLines={1}>
          {dishName(byId.get(opt.dishIds[0]), lang)}
        </Text>
        {opt.dishIds.length > 1 && <Text style={s.wMore}>{`+${opt.dishIds.length - 1}`}</Text>}
        {eaten && <Icon name="check" size={14} color={C.good} width={3} />}
      </Pressable>
    );
  };

  if (view === 'week')
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
        {top}
        {days.map((date) => {
          const plan = valid(plans[date]);
          if (!plan) return null;
          const lab = dateLabel(date, lang);
          return (
            <View key={date} style={s.wCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${lab.weekday} ${lab.day}`}
                onPress={() => {
                  setSel(date);
                  setView('day');
                }}
                style={[s.wHead, date === today && { backgroundColor: C.primary }]}
              >
                <Text style={[s.wHeadText, date === today && { color: '#fff' }]} numberOfLines={1}>
                  {`${lab.weekday} ${lab.day} ${lab.month}`}
                </Text>
                {date === today && <Text style={s.wToday}>{tx('todayWord')}</Text>}
              </Pressable>
              {plan.slots.map((_, i) => (
                <MealRow key={i} date={date} i={i} />
              ))}
            </View>
          );
        })}
      </ScrollView>
    );

  const plan = valid(plans[sel]) ?? valid(plans[today]);
  const date = plan ? sel : today;
  const lab = dateLabel(date, lang);
  const eatenSlots = eatenOn(date);
  const protein = plan ? persons.map((_, i) => plan.slots.reduce((a, sp) => a + (pick(sp)?.protein[i] ?? 0), 0)) : [];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
      {top}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {days.map((d) => {
          const l = dateLabel(d, lang);
          const on = d === date;
          return (
            <Pressable key={d} accessibilityRole="button" accessibilityLabel={`${l.weekday} ${l.day}`} accessibilityState={{ selected: on }} onPress={() => setSel(d)} style={[s.dayChip, on && s.dayChipOn]}>
              <Text style={[s.dayChipWk, on && { color: '#C9C4F5' }]} numberOfLines={1}>
                {l.weekday.slice(0, 3)}
              </Text>
              <Text style={[s.dayChipNum, on && { color: '#fff' }]} numberOfLines={1}>
                {l.day}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={s.dayHead}>
        <View style={s.heroDot1} />
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
            <Text style={s.dayHeadTitle} numberOfLines={1}>
              {`${lab.weekday} ${lab.day} ${lab.month}`}
            </Text>
            {date === today && <Pill tone="primary" label={tx('todayWord')} />}
          </Row>
          <Row>
            {persons.map((_, i) => {
              const ok = (protein[i] ?? 0) >= targets[i].protein * 0.9;
              return <Pill key={i} tone={ok ? 'good' : 'warn'} label={`${initial(i)}  ${r(protein[i] ?? 0)}/${r(targets[i].protein)} ${tx('g')}`} />;
            })}
          </Row>
        </View>
      </View>
      {plan?.slots.map((sp, i) => {
        const opt = pick(sp);
        if (!opt) return null;
        const eaten = eatenSlots.has(sp.slot);
        const col = MEAL[sp.slot];
        return (
          <Pressable
            key={sp.slot}
            accessibilityRole="button"
            accessibilityLabel={`${tx(`slot_${sp.slot}` as StrKey)}: ${dishesOf(opt)}`}
            onPress={() => nav.go({ k: 'meal', date, i })}
            style={({ pressed }) => [s.meal, { borderLeftColor: col.strong }, eaten && { backgroundColor: C.goodSoft }, pressed && { opacity: 0.85 }]}
          >
            <View style={[s.mealArt, { backgroundColor: col.soft }]}>
              <MealArt slot={sp.slot} size={56} />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                <Text style={[s.mealLabel, { color: col.ink }]} numberOfLines={1}>
                  {tx(`slot_${sp.slot}` as StrKey)}
                </Text>
                {eaten && <Icon name="check" size={16} color={C.good} width={3} />}
              </Row>
              {opt.dishIds.slice(0, 3).map((id) => {
                const d = byId.get(id);
                return (
                  <View key={id} style={s.dishRow}>
                    {d && <DishArt kind={artFor(d)} tone={CUISINE_TONE[d.cuisine ?? 'north']} size={26} />}
                    <Text style={s.dishName} numberOfLines={1}>
                      {dishName(d, lang)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  planBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFB020', borderRadius: 999, minHeight: 44, paddingHorizontal: 14, flexShrink: 0 },
  planBtnText: { color: C.ink, fontSize: 14, fontWeight: '800' },
  empty: { alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 28, ...SHADOW },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: C.text },
  stale: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.accentSoft, borderRadius: RADIUS.md, paddingHorizontal: 14, minHeight: 46 },
  staleText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  dayChip: { width: 56, alignItems: 'center', gap: 2, paddingVertical: 10, borderRadius: RADIUS.lg, backgroundColor: C.card, ...SHADOW },
  dayChipOn: { backgroundColor: C.ink },
  dayChipWk: { fontSize: 12, fontWeight: '700', color: C.muted },
  dayChipNum: { fontSize: 20, fontWeight: '800', color: C.text },
  dayHead: { backgroundColor: C.ink, borderRadius: RADIUS.xl, padding: 18, overflow: 'hidden', ...SHADOW },
  heroDot1: { position: 'absolute', right: -40, top: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: '#fff', opacity: 0.06 },
  dayHeadTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.4, flexShrink: 1 },
  meal: { flexDirection: 'row', gap: 12, borderRadius: RADIUS.xl, padding: 12, backgroundColor: C.card, borderLeftWidth: 6, ...SHADOW },
  mealArt: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  mealLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 1 },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dishName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  wCard: { backgroundColor: C.card, borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW },
  wHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 16, minHeight: 48, backgroundColor: C.surface },
  wHeadText: { flex: 1, fontSize: 16, fontWeight: '800', color: C.text },
  wToday: { color: '#fff', fontSize: 12, fontWeight: '800' },
  wRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 44 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  wSlot: { width: 84, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  wMore: { fontSize: 12, fontWeight: '800', color: C.muted },
  wDish: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '600', color: C.text },
});
