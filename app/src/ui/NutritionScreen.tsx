import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { addDays, todayStr } from '../core/dates';
import { dayInsight, dayNutrition, type InsightMacro } from '../core/dayCheck';
import { computeTargets } from '../core/nutrition';
import type { Slot } from '../core/types';
import { fmt, t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dateLabel, r } from './helpers';
import { Icon } from './Icon';
import { Chip, Muted, Pill, Row } from './kit';
import { useNav } from './nav';
import { Ring } from './Ring';
import { C, MEAL, RADIUS, SHADOW } from './theme';

const MACRO_COLOR: Record<'protein' | 'carbs' | 'fat' | 'fiber', string> = {
  protein: '#E8553A',
  carbs: '#FFB020',
  fat: '#35C2E0',
  fiber: '#19B58A',
};

/** One bar split by meal, with a tick where the target is. */
function StackBar({ parts, target }: { parts: { slot: Slot; v: number }[]; target: number }) {
  const total = parts.reduce((a, p) => a + p.v, 0);
  const max = Math.max(total, target) * 1.05 || 1;
  return (
    <View style={{ height: 16, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: C.surface }}>
        {parts.map((p) => (
          <View key={p.slot} style={{ width: `${(p.v / max) * 100}%`, backgroundColor: MEAL[p.slot].strong }} />
        ))}
      </View>
      <View style={{ position: 'absolute', left: `${(target / max) * 100}%`, top: 0, width: 3, height: 16, borderRadius: 2, backgroundColor: C.ink }} />
    </View>
  );
}

export function NutritionScreen() {
  const nav = useNav();
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const plans = useStore((s) => s.plans);
  const who = useStore((s) => s.nutPerson);
  const setWho = useStore((s) => s.setNutPerson);
  const dishes = useAllDishes();
  const tx = (k: StrKey) => t(lang, k);

  const today = todayStr();
  const valid = (date: string) => {
    const p = plans[date];
    return p && p.slots[0]?.targets.length === persons.length ? p : undefined;
  };
  const date = nav.nutDate;
  const plan = valid(date);
  const idx = Math.min(who, persons.length - 1);
  const target = computeTargets(persons[idx]);
  const day = useMemo(() => (plan ? dayNutrition(plan, dishes, persons)[idx] : undefined), [plan, dishes, persons, idx]);
  const lab = dateLabel(date, lang);
  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  const slotsInOrder = plan?.slots.map((sp) => sp.slot) ?? [];
  const parts = (k: InsightMacro) => slotsInOrder.map((slot) => ({ slot, v: day?.bySlot[slot]?.[k] ?? 0 }));
  const insight = day ? dayInsight(day, target) : null;
  const unit = (k: InsightMacro) => (k === 'kcal' ? tx('kcal') : tx('g'));

  const status = (k: InsightMacro) => {
    const diff = (day?.total[k] ?? 0) - target[k];
    const rel = target[k] ? diff / target[k] : 0;
    if (r(diff) === 0) return <Pill tone="good" label={tx('onTarget')} />;
    const bad = k === 'protein' ? rel < -0.1 : k === 'fiber' ? false : rel > 0.1;
    const good = k === 'fiber' ? diff >= 0 : Math.abs(rel) <= 0.1;
    return <Pill tone={bad ? 'bad' : good ? 'good' : 'warn'} label={`${diff > 0 ? '+' : ''}${r(diff)} ${unit(k)}`} />;
  };

  const pKcal = (day?.total.protein ?? 0) * 4;
  const cKcal = (day?.total.carbs ?? 0) * 4;
  const fKcal = (day?.total.fat ?? 0) * 9;
  const sumK = pKcal + cKcal + fKcal || 1;
  const share = [
    { k: 'protein' as const, v: pKcal / sumK },
    { k: 'carbs' as const, v: cKcal / sumK },
    { k: 'fat' as const, v: fKcal / sumK },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}>
      <View style={s.switcher}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous day" onPress={() => nav.setNutDate(prev)} hitSlop={8} disabled={!valid(prev)} style={[s.arrow, !valid(prev) && { opacity: 0.3 }]}>
          <Icon name="back" size={20} color={C.text} width={2.6} />
        </Pressable>
        <Text style={s.switchText} numberOfLines={1}>
          {`${date === today ? tx('todayWord') : lab.weekday} · ${lab.day} ${lab.month}`}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next day" onPress={() => nav.setNutDate(next)} hitSlop={8} disabled={!valid(next)} style={[s.arrow, !valid(next) && { opacity: 0.3 }]}>
          <Icon name="right" size={20} color={C.text} width={2.6} />
        </Pressable>
      </View>

      {persons.length > 1 && (
        <Row>
          {persons.map((p, i) => (
            <Chip key={i} label={p.name || `${tx('person')} ${i + 1}`} on={idx === i} onPress={() => setWho(i)} />
          ))}
        </Row>
      )}

      {!plan || !day ? (
        <Muted>{tx('noWeek')}</Muted>
      ) : (
        <>
          <View style={s.heroCard}>
            <Ring size={148} stroke={18} target={target.kcal} parts={slotsInOrder.map((slot) => ({ v: day.bySlot[slot]?.kcal ?? 0, color: MEAL[slot].strong }))}>
              <Text style={s.ringBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {r(day.total.kcal)}
              </Text>
            </Ring>
            <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
              <Text style={s.cap} numberOfLines={1}>
                {tx('nutTarget')}
              </Text>
              <Text style={s.ofTarget} numberOfLines={1}>
                {`of ${r(target.kcal)} ${tx('kcal')}`}
              </Text>
              {status('kcal')}
            </View>
          </View>

          <Row style={{ gap: 12 }}>
            {slotsInOrder.map((slot) => (
              <Row key={slot} style={{ gap: 6, flexWrap: 'nowrap' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: MEAL[slot].strong }} />
                <Text style={s.legend} numberOfLines={1}>
                  {tx(`slot_${slot}` as StrKey)}
                </Text>
              </Row>
            ))}
          </Row>

          {insight && (
            <View style={[s.insight, { backgroundColor: insight.diff > 0 ? C.dangerSoft : C.accentSoft }]}>
              <Icon name="flame" size={20} color={insight.diff > 0 ? C.danger : C.accent} />
              <Text style={s.insightText} numberOfLines={1}>
                {fmt(tx(insight.diff > 0 ? 'insightOver' : 'insightUnder'), {
                  macro: tx(`macro_${insight.macro}` as StrKey),
                  n: Math.abs(r(insight.diff)),
                  unit: unit(insight.macro),
                  slot: insight.slot ? tx(`slot_${insight.slot}` as StrKey) : '',
                })}
              </Text>
            </View>
          )}

          <View style={s.card}>
            {(['protein', 'carbs', 'fat', 'fiber'] as const).map((k) => (
              <View key={k} style={{ gap: 8 }}>
                <View style={s.macroRow}>
                  <View style={[s.dot, { backgroundColor: MACRO_COLOR[k] }]} />
                  <Text style={s.macroName} numberOfLines={1}>
                    {tx(`macro_${k}` as StrKey)}
                  </Text>
                  <Text style={s.macroVal} numberOfLines={1}>
                    {`${r(day.total[k])} / ${r(target[k])} ${tx('g')}`}
                  </Text>
                  {status(k)}
                </View>
                <StackBar parts={parts(k)} target={target[k]} />
              </View>
            ))}
          </View>

          <View style={s.card}>
            <Text style={s.cap} numberOfLines={1}>
              {tx('caloriesFrom')}
            </Text>
            <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', gap: 3 }}>
              {share.map((x) => (
                <View key={x.k} style={{ flex: Math.max(x.v, 0.02), backgroundColor: MACRO_COLOR[x.k], borderRadius: 7 }} />
              ))}
            </View>
            <Row style={{ gap: 14, flexWrap: 'nowrap' }}>
              {share.map((x) => (
                <Row key={x.k} style={{ gap: 6, flexWrap: 'nowrap', flexShrink: 1 }}>
                  <View style={[s.dot, { backgroundColor: MACRO_COLOR[x.k] }]} />
                  <Text style={s.legend} numberOfLines={1}>{`${tx(`macro_${x.k}` as StrKey)} ${Math.round(x.v * 100)}%`}</Text>
                </Row>
              ))}
            </Row>
          </View>
          <Muted>{tx('plannedNote')}</Muted>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  switcher: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 999, padding: 6, ...SHADOW },
  arrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  switchText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: C.text },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, ...SHADOW },
  ringBig: { fontSize: 30, fontWeight: '800', color: C.text, maxWidth: 100, textAlign: 'center' },
  cap: { fontSize: 12, fontWeight: '800', color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  ofTarget: { fontSize: 20, fontWeight: '800', color: C.text },
  legend: { fontSize: 12, color: C.muted, fontWeight: '600', flexShrink: 1 },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: RADIUS.lg, paddingHorizontal: 14, minHeight: 50 },
  insightText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, gap: 16, ...SHADOW },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  macroName: { fontSize: 15, fontWeight: '800', color: C.text },
  macroVal: { flex: 1, minWidth: 0, textAlign: 'right', fontSize: 13, color: C.muted, fontWeight: '600' },
});
