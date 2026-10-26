import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { addDays, todayStr } from '../core/dates';
import { dayInsight, dayNutrition, type InsightMacro } from '../core/dayCheck';
import { computeTargets } from '../core/nutrition';
import type { Slot } from '../core/types';
import { fmt, t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dateLabel, r } from './helpers';
import { Icon } from './Icon';
import { Chip, Muted, Row } from './kit';
import { useNav } from './nav';
import { C, R } from './theme';

const SLOT_COLOR: Record<Slot, string> = {
  breakfast: '#6FA3BE',
  midmorning: '#8FB7A3',
  lunch: '#E8A04D',
  evening: '#B07FA0',
  dinner: '#4A4E8C',
  bedtime: '#7B8794',
};

/** One bar split by meal, with a tick where the target is. */
function StackBar({ parts, target }: { parts: { slot: Slot; v: number }[]; target: number }) {
  const total = parts.reduce((a, p) => a + p.v, 0);
  const max = Math.max(total, target) * 1.05 || 1;
  return (
    <View style={{ height: 14, justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: C.line }}>
        {parts.map((p) => (
          <View key={p.slot} style={{ width: `${(p.v / max) * 100}%`, backgroundColor: SLOT_COLOR[p.slot] }} />
        ))}
      </View>
      <View style={{ position: 'absolute', left: `${(target / max) * 100}%`, top: 0, width: 2, height: 14, backgroundColor: C.text }} />
    </View>
  );
}

export function NutritionScreen() {
  const nav = useNav();
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const plans = useStore((s) => s.plans);
  const [who, setWho] = [useStore((s) => s.nutPerson), useStore((s) => s.setNutPerson)];
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

  const slotsInOrder = plan?.slots.map((s) => s.slot) ?? [];
  const parts = (k: InsightMacro) => slotsInOrder.map((slot) => ({ slot, v: day?.bySlot[slot]?.[k] ?? 0 }));
  const insight = day ? dayInsight(day, target) : null;
  const unit = (k: InsightMacro) => (k === 'kcal' ? tx('kcal') : tx('g'));

  const pill = (k: InsightMacro) => {
    const diff = (day?.total[k] ?? 0) - target[k];
    const rel = target[k] ? diff / target[k] : 0;
    const good = k === 'fiber' ? diff >= 0 : Math.abs(rel) <= 0.1;
    const bad = k === 'protein' ? rel < -0.1 : k === 'fiber' ? false : rel > 0.1;
    const text = r(diff) === 0 ? tx('onTarget') : `${diff > 0 ? '+' : ''}${r(diff)} ${unit(k)} ${diff > 0 ? tx('over') : tx('under')}`;
    const tone = bad ? { bg: '#FBE3E0', fg: C.danger } : good ? { bg: C.primarySoft, fg: C.primary } : { bg: C.accentSoft, fg: C.accent };
    return (
      <View style={{ backgroundColor: tone.bg, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: tone.fg }}>{text}</Text>
      </View>
    );
  };

  const pKcal = (day?.total.protein ?? 0) * 4;
  const cKcal = (day?.total.carbs ?? 0) * 4;
  const fKcal = (day?.total.fat ?? 0) * 9;
  const sumK = pKcal + cKcal + fKcal || 1;
  const share = [
    { k: 'protein' as const, v: pKcal / sumK, color: '#B85C4A' },
    { k: 'carbs' as const, v: cKcal / sumK, color: '#D9CBB0' },
    { k: 'fat' as const, v: fKcal / sumK, color: '#E0B04A' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous day" onPress={() => nav.setNutDate(prev)} hitSlop={10} style={{ opacity: valid(prev) ? 1 : 0.3 }} disabled={!valid(prev)}>
          <Icon name="back" size={22} color={C.text} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>{date === today ? tx('tabToday') : lab.weekday}</Text>
          <Muted>{`${lab.day} ${lab.month}`}</Muted>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Next day" onPress={() => nav.setNutDate(next)} hitSlop={10} style={{ opacity: valid(next) ? 1 : 0.3 }} disabled={!valid(next)}>
          <Icon name="right" size={22} color={C.text} />
        </Pressable>
      </Row>

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
        <View style={{ backgroundColor: C.surface, borderRadius: R, padding: 16, gap: 16 }}>
          <Muted>{tx('nutTarget')}</Muted>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 34, fontWeight: '800', color: C.text }}>
              {r(day.total.kcal)}
              <Text style={{ fontSize: 16, fontWeight: '400', color: C.muted }}>{` / ${r(target.kcal)} ${tx('kcal')}`}</Text>
            </Text>
            {pill('kcal')}
          </Row>
          <StackBar parts={parts('kcal')} target={target.kcal} />
          <Row style={{ gap: 12 }}>
            {slotsInOrder.map((slot) => (
              <Row key={slot} style={{ gap: 5, flexWrap: 'nowrap' }}>
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: SLOT_COLOR[slot] }} />
                <Text style={{ fontSize: 12, color: C.muted }}>{tx(`slot_${slot}` as StrKey)}</Text>
              </Row>
            ))}
          </Row>

          {insight && (
            <View style={{ backgroundColor: insight.diff > 0 ? '#FBE3E0' : C.accentSoft, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10 }}>
              <Icon name="flame" size={20} color={insight.diff > 0 ? C.danger : C.accent} />
              <Text style={{ flex: 1, color: C.text, fontSize: 14 }}>
                {fmt(tx(insight.diff > 0 ? 'insightOver' : 'insightUnder'), {
                  macro: tx(`macro_${insight.macro}` as StrKey),
                  n: Math.abs(r(insight.diff)),
                  unit: unit(insight.macro),
                  slot: insight.slot ? tx(`slot_${insight.slot}` as StrKey) : '',
                })}
              </Text>
            </View>
          )}

          {(['protein', 'carbs', 'fat', 'fiber'] as InsightMacro[]).map((k) => (
            <View key={k} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{tx(`macro_${k}` as StrKey)}</Text>
                <Muted>
                  {r(day.total[k])} / {r(target[k])} {tx('g')}
                </Muted>
              </Row>
              <StackBar parts={parts(k)} target={target[k]} />
              <Row>{pill(k)}</Row>
            </View>
          ))}

          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{tx('caloriesFrom')}</Text>
            <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' }}>
              {share.map((x) => (
                <View key={x.k} style={{ width: `${x.v * 100}%`, backgroundColor: x.color }} />
              ))}
            </View>
            <Row style={{ justifyContent: 'space-between' }}>
              {share.map((x) => (
                <View key={x.k}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>{Math.round(x.v * 100)}%</Text>
                  <Muted>{tx(`macro_${x.k}` as StrKey)}</Muted>
                </View>
              ))}
            </Row>
          </View>
          <Muted>{tx('plannedNote')}</Muted>
        </View>
      )}
    </ScrollView>
  );
}
