import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { addDays, todayStr } from '../core/dates';
import { addonTotals } from '../core/addons';
import { dayInsight, dayNutrition, type InsightMacro } from '../core/dayCheck';
import { computeTargets } from '../core/nutrition';
import { fmt, t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dateLabel, r } from './helpers';
import { Icon, IconTile, SLOT_ICON, type IconName } from './Icon';
import { Bar, Chip, Muted, Pill, Row } from './kit';
import { useNav } from './nav';
import { Ring } from './Ring';
import { C, MEAL, RADIUS, SHADOW } from './theme';

// one ink, four shades: the screen stays black and white
const MACRO_COLOR: Record<'protein' | 'carbs' | 'fat' | 'fiber', string> = {
  protein: '#1A1A18',
  carbs: '#5C5A52',
  fat: '#8E8B80',
  fiber: '#B9B5A8',
};

const MACRO_ICON: Record<'protein' | 'carbs' | 'fat' | 'fiber', IconName> = {
  protein: 'dumbbell',
  carbs: 'wheat',
  fat: 'drop',
  fiber: 'leaf',
};

export function NutritionScreen() {
  const nav = useNav();
  const lang = useStore((s) => s.lang);
  const persons = useStore((s) => s.persons);
  const addons = useStore((s) => s.addons);
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
  const day = useMemo(() => (plan ? dayNutrition(plan, dishes, persons, addonTotals(addons))[idx] : undefined), [plan, dishes, persons, idx, addons]);
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
            <Ring size={140} stroke={16} target={target.kcal} parts={slotsInOrder.map((slot) => ({ v: day.bySlot[slot]?.kcal ?? 0, color: MEAL[slot].strong }))}>
              <Text style={s.ringBig} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {r(day.total.kcal)}
              </Text>
              <Text style={s.ringUnit} numberOfLines={1}>
                {tx('kcal')}
              </Text>
            </Ring>
            <View style={{ flex: 1, minWidth: 0, gap: 8, alignItems: 'flex-start' }}>
              <IconTile name="flame" size={44} icon={24} width={1.5} />
              <Text style={s.cap} numberOfLines={1}>
                {tx('nutTarget')}
              </Text>
              <Text style={s.ofTarget} numberOfLines={1}>
                {`of ${r(target.kcal)} ${tx('kcal')}`}
              </Text>
              {status('kcal')}
            </View>
          </View>

          <View style={s.meals}>
            {slotsInOrder.map((slot) => (
              <View key={slot} style={s.mealCell}>
                <Icon name={SLOT_ICON[slot]} size={26} color={C.text} width={1.5} />
                <Text style={s.mealKcal} numberOfLines={1}>
                  {r(day.bySlot[slot]?.kcal ?? 0)}
                </Text>
                <Text style={s.legend} numberOfLines={1}>
                  {tx(`slot_${slot}` as StrKey)}
                </Text>
              </View>
            ))}
          </View>

          {insight && (
            <View style={[s.insight, { backgroundColor: insight.diff > 0 ? C.dangerSoft : C.accentSoft }]}>
              <Icon name="flame" size={22} color={insight.diff > 0 ? C.danger : C.accent} width={1.8} />
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

          <View style={s.grid}>
            {(['protein', 'carbs', 'fat', 'fiber'] as const).map((k) => (
              <View key={k} style={s.macroCard}>
                <IconTile name={MACRO_ICON[k]} size={56} icon={30} width={1.4} />
                <Text style={s.macroName} numberOfLines={1}>
                  {tx(`macro_${k}` as StrKey)}
                </Text>
                <Text style={s.macroVal} numberOfLines={1}>
                  {`${r(day.total[k])} / ${r(target[k])} ${tx('g')}`}
                </Text>
                <Bar value={day.total[k]} max={target[k]} color={MACRO_COLOR[k]} />
                {status(k)}
              </View>
            ))}
          </View>

          <View style={s.card}>
            <Text style={s.cap} numberOfLines={1}>
              {tx('caloriesFrom')}
            </Text>
            <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 3 }}>
              {share.map((x) => (
                <View key={x.k} style={{ flex: Math.max(x.v, 0.02), backgroundColor: MACRO_COLOR[x.k], borderRadius: 6 }} />
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
  switcher: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: RADIUS.md, padding: 4, ...SHADOW },
  arrow: { width: 40, height: 40, borderRadius: RADIUS.sm, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  switchText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.text },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 18, ...SHADOW },
  ringBig: { fontSize: 28, fontWeight: '700', color: C.text, maxWidth: 90, textAlign: 'center' },
  ringUnit: { fontSize: 12, color: C.muted, fontWeight: '500' },
  cap: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  ofTarget: { fontSize: 20, fontWeight: '700', color: C.text },
  legend: { fontSize: 12, color: C.muted, fontWeight: '500', flexShrink: 1 },
  meals: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mealCell: { flexBasis: '22%', flexGrow: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 4, backgroundColor: C.card, borderRadius: RADIUS.lg, ...SHADOW },
  mealKcal: { fontSize: 16, fontWeight: '700', color: C.text, maxWidth: '100%' },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: RADIUS.lg, paddingHorizontal: 14, minHeight: 52 },
  insightText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  macroCard: { flexBasis: '47%', flexGrow: 1, minWidth: 0, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, gap: 8, ...SHADOW },
  macroName: { fontSize: 13, fontWeight: '600', color: C.muted },
  macroVal: { fontSize: 17, fontWeight: '700', color: C.text },
  card: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, gap: 14, ...SHADOW },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
