import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { ADDONS, addonTotals } from '../core/addons';
import { addDays, todayStr } from '../core/dates';
import { computeTargets } from '../core/nutrition';
import type { DayPlan, MealOption } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { planSignature, useAllDishes, useStore } from '../state/store';
import { dateLabel, dishName, r } from './helpers';
import { Icon } from './Icon';
import { Button, Chip, Muted, Pill, Row, Segmented } from './kit';
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
  const addons = useStore((s) => s.addons);
  const ateOut = useStore((s) => s.ateOut);
  const { toggleAddon, toggleAteOut, makePlan, choose } = useStore.getState();
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
  const [copied, setCopied] = useState(false);
  const extra = addonTotals(addons);
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const stale = hasAny && planSig !== planSignature({ persons, rules, menu, mealCount, dishEdits, prefs });
  const eatenOn = (date: string) => new Set(log.filter((e) => e.date === date).map((e) => e.slot));
  const dishesOf = (opt: MealOption) => opt.dishIds.map((id) => dishName(byId.get(id), lang)).join(', ');

  const copyWeek = async () => {
    const lines: string[] = [];
    for (const d of days) {
      const pl = valid(plans[d]);
      if (!pl) continue;
      const lb = dateLabel(d, lang);
      lines.push(`${lb.weekday} ${lb.day} ${lb.month}`);
      if (ateOut[d]) {
        lines.push('  Eating out');
        continue;
      }
      for (const sp of pl.slots) {
        const o = pick(sp);
        if (o) lines.push(`  ${tx(`slot_${sp.slot}` as StrKey)}: ${dishesOf(o)}`);
      }
    }
    await Clipboard.setStringAsync(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extras = (
    <View style={s.extras}>
      <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
        <Text style={s.extrasTitle} numberOfLines={1}>
          Daily extras
        </Text>
        {extra.kcal > 0 && <Pill tone="good" label={`+${extra.kcal} kcal · +${extra.protein} g`} />}
      </Row>
      <Row>
        {ADDONS.map((a) => (
          <Chip key={a.id} label={`${a.label} +${a.protein} g`} on={addons[a.id]} onPress={() => toggleAddon(a.id)} />
        ))}
      </Row>
    </View>
  );

  const top = (
    <View style={{ gap: 12 }}>
      <Row style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Segmented value={view} onChange={setView} options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]} />
        </View>
        {hasAny && (
          <Pressable accessibilityRole="button" accessibilityLabel={tx('replanWeek')} onPress={makeWeek} style={({ pressed }) => [s.planBtn, pressed && { opacity: 0.8 }]}>
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
          <Text style={s.emptyTitle} numberOfLines={1}>
            {tx('weekHero')}
          </Text>
          <Muted>{tx('noWeek')}</Muted>
          <Pressable accessibilityRole="button" accessibilityLabel={tx('planWeek')} onPress={makeWeek} style={({ pressed }) => [s.planBtn, { alignSelf: 'center', minHeight: 50, paddingHorizontal: 26 }, pressed && { opacity: 0.8 }]}>
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
        <Text style={s.wSlot} numberOfLines={1}>
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
        {extras}
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
              {ateOut[date] ? (
                <View style={s.wRow}>
                  <View style={[s.dot, { backgroundColor: C.muted }]} />
                  <Text style={s.wDish} numberOfLines={1}>
                    Eating out. Nothing planned.
                  </Text>
                </View>
              ) : (
                plan.slots.map((_, i) => <MealRow key={i} date={date} i={i} />)
              )}
            </View>
          );
        })}
        <Row>
          <Button icon="copy" kind="soft" label={copied ? 'Copied' : 'Copy week'} onPress={copyWeek} />
        </Row>
      </ScrollView>
    );

  const plan = valid(plans[sel]) ?? valid(plans[today]);
  const date = plan ? sel : today;
  const lab = dateLabel(date, lang);
  const eatenSlots = eatenOn(date);
  const protein = plan ? persons.map((_, i) => extra.protein + plan.slots.reduce((a, sp) => a + (pick(sp)?.protein[i] ?? 0), 0)) : [];
  const kcalAvg = plan ? avg(persons.map((_, i) => extra.kcal + plan.slots.reduce((a, sp) => a + (pick(sp)?.kcal[i] ?? 0), 0))) : 0;
  const out = !!ateOut[date];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
      {top}
      {extras}
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
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
            <Text style={s.dayHeadTitle} numberOfLines={1}>
              {`${lab.weekday} ${lab.day} ${lab.month}`}
            </Text>
            {date === today && <Pill tone="primary" label={tx('todayWord')} />}
          </Row>
          {!out && (
            <Row>
              {persons.map((_, i) => {
                const ok = (protein[i] ?? 0) >= targets[i].protein * 0.9;
                return <Pill key={i} tone={ok ? 'good' : 'warn'} label={`${initial(i)}  ${r(protein[i] ?? 0)}/${r(targets[i].protein)} ${tx('g')}`} />;
              })}
              <Pill label={`~${r(kcalAvg)} kcal`} />
            </Row>
          )}
          <Row>
            <Pressable accessibilityRole="button" accessibilityLabel="Replan this day" onPress={() => makePlan(date)} style={s.dayBtn}>
              <Icon name="refresh" size={14} color={C.text} width={2.4} />
              <Text style={s.dayBtnText} numberOfLines={1}>
                Replan day
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={out ? 'Plan this day' : 'Ate out'} onPress={() => toggleAteOut(date)} style={[s.dayBtn, out && { backgroundColor: C.ink }]}>
              <Text style={[s.dayBtnText, out && { color: '#fff' }]} numberOfLines={1}>
                {out ? 'Plan this day' : 'Ate out'}
              </Text>
            </Pressable>
          </Row>
        </View>
      </View>
      {out && <Muted>Eating out today. No meals planned and nothing to buy for this day.</Muted>}
      {!out && plan?.slots.map((sp, i) => {
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
            style={({ pressed }) => [s.meal, eaten && { backgroundColor: C.goodSoft }, pressed && { opacity: 0.85 }]}
          >
            <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
              <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                  <View style={[s.dot, { backgroundColor: col.strong }]} />
                  <Text style={s.mealLabel} numberOfLines={1}>
                    {tx(`slot_${sp.slot}` as StrKey)}
                  </Text>
                </View>
                {eaten && <Icon name="check" size={16} color={C.good} width={3} />}
                {!eaten && sp.options.length > 1 && (
                  <Row style={{ flexWrap: 'nowrap', gap: 6 }}>
                    {sp.options.slice(0, 3).map((_, k) => {
                      const on = (sp.chosen ?? 0) === k;
                      return (
                        <Pressable key={k} accessibilityRole="button" accessibilityLabel={`Option ${'ABC'[k]}`} accessibilityState={{ selected: on }} onPress={() => choose(date, i, k)} hitSlop={6} style={[s.opt, on && { backgroundColor: C.ink }]}>
                          <Text style={[s.optText, on && { color: '#fff' }]}>{'ABC'[k]}</Text>
                        </Pressable>
                      );
                    })}
                  </Row>
                )}
              </Row>
              <Text style={s.mealSub} numberOfLines={1}>
                {`${r(avg(opt.kcal))} kcal · ${r(avg(opt.protein))} g protein`}
              </Text>
              {opt.dishIds.slice(0, 3).map((id) => {
                const d = byId.get(id);
                return (
                  <View key={id} style={s.dishRow}>
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
      <Row>
        <Button icon="copy" kind="soft" label={copied ? 'Copied' : 'Copy week'} onPress={copyWeek} />
      </Row>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  planBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.ink, borderRadius: RADIUS.md, minHeight: 44, paddingHorizontal: 16, flexShrink: 0 },
  planBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 32, ...SHADOW },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  extras: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, gap: 10, ...SHADOW },
  extrasTitle: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 1 },
  stale: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.accentSoft, borderRadius: RADIUS.md, paddingHorizontal: 14, minHeight: 46 },
  staleText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
  dayChip: { width: 54, alignItems: 'center', gap: 2, paddingVertical: 10, borderRadius: RADIUS.md, backgroundColor: C.card, ...SHADOW },
  dayChipOn: { backgroundColor: C.ink, borderColor: C.ink },
  dayChipWk: { fontSize: 12, fontWeight: '500', color: C.muted },
  dayChipNum: { fontSize: 18, fontWeight: '700', color: C.text },
  dayHead: { gap: 10, paddingVertical: 4 },
  dayHeadTitle: { color: C.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.5, flexShrink: 1 },
  dayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: RADIUS.md, minHeight: 36, paddingHorizontal: 12, ...SHADOW },
  dayBtnText: { color: C.text, fontSize: 13, fontWeight: '600' },
  opt: { width: 28, height: 28, borderRadius: RADIUS.sm, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  optText: { fontSize: 12, fontWeight: '700', color: C.text },
  meal: { gap: 6, borderRadius: RADIUS.xl, padding: 14, backgroundColor: C.card, ...SHADOW },
  mealLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: C.muted, flexShrink: 1 },
  mealSub: { fontSize: 13, color: C.muted },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dishName: { flex: 1, fontSize: 16, fontWeight: '600', color: C.text },
  wCard: { backgroundColor: C.card, borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOW },
  wHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 16, minHeight: 44, backgroundColor: C.surface },
  wHeadText: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },
  wToday: { color: '#fff', fontSize: 12, fontWeight: '700' },
  wRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 42 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  wSlot: { width: 76, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: C.muted },
  wMore: { fontSize: 12, fontWeight: '600', color: C.muted },
  wDish: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '500', color: C.text },
});
