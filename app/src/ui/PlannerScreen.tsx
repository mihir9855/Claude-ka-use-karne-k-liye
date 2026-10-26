import { useMemo } from 'react';
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
import { Muted, Pill, Row } from './kit';
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
  const first = dateLabel(days[0], lang);
  const last = dateLabel(days[6], lang);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}>
      <View style={s.hero}>
        <View style={s.heroDot1} />
        <View style={s.heroDot2} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Text style={s.heroTitle} numberOfLines={1}>
            {tx('weekHero')}
          </Text>
          <Text style={s.heroSub} numberOfLines={1}>
            {`${first.day} ${first.month} - ${last.day} ${last.month}`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={hasAny ? tx('replanWeek') : tx('planWeek')} onPress={makeWeek} style={({ pressed }) => [s.heroBtn, pressed && { opacity: 0.8 }]}>
              <Icon name="refresh" size={16} color={C.ink} width={2.6} />
              <Text style={s.heroBtnText} numberOfLines={1}>
                {hasAny ? tx('replanWeek') : tx('planWeek')}
              </Text>
            </Pressable>
          </View>
        </View>
        <MealArt slot="lunch" size={104} />
      </View>

      {!hasAny && <Muted>{tx('noWeek')}</Muted>}
      {hasAny && planSig !== planSignature({ persons, rules, menu, mealCount, dishEdits, prefs }) && (
        <Pressable accessibilityRole="button" accessibilityLabel={tx('planStale')} onPress={makeWeek} style={s.stale}>
          <Icon name="refresh" size={18} color={C.accent} />
          <Text style={s.staleText} numberOfLines={1}>
            {tx('planStale')}
          </Text>
        </Pressable>
      )}

      {days.map((date) => {
        const plan = valid(plans[date]);
        if (!plan) return null;
        const lab = dateLabel(date, lang);
        const eatenSlots = new Set(log.filter((e) => e.date === date).map((e) => e.slot));
        const protein = persons.map((_, i) => plan.slots.reduce((a, sp) => a + (pick(sp)?.protein[i] ?? 0), 0));
        return (
          <View key={date} style={{ gap: 10 }}>
            <Row style={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}>
              <Text style={s.dayTitle} numberOfLines={1}>
                {`${lab.weekday} ${lab.day} ${lab.month}`}
              </Text>
              {date === today && <Pill tone="primary" label={tx('todayWord')} />}
            </Row>
            {plan.slots.map((sp, i) => {
              const opt = pick(sp);
              if (!opt) return null;
              const eaten = eatenSlots.has(sp.slot);
              const col = MEAL[sp.slot];
              return (
                <Pressable
                  key={sp.slot}
                  accessibilityRole="button"
                  accessibilityLabel={`${tx(`slot_${sp.slot}` as StrKey)}: ${opt.dishIds.map((id) => dishName(byId.get(id), lang)).join(', ')}`}
                  onPress={() => nav.go({ k: 'meal', date, i })}
                  style={({ pressed }) => [s.meal, { backgroundColor: eaten ? C.goodSoft : col.soft }, pressed && { opacity: 0.85 }]}
                >
                  <View style={s.mealArt}>
                    <MealArt slot={sp.slot} size={52} />
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
            <Row>
              {persons.map((_, i) => {
                const ok = protein[i] >= targets[i].protein * 0.9;
                return <Pill key={i} tone={ok ? 'good' : 'warn'} label={`${initial(i)}  ${r(protein[i])}/${r(targets[i].protein)} ${tx('g')}`} />;
              })}
            </Row>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.ink, borderRadius: RADIUS.xl, padding: 20, overflow: 'hidden', ...SHADOW },
  heroDot1: { position: 'absolute', right: -40, top: -50, width: 180, height: 180, borderRadius: 90, backgroundColor: '#fff', opacity: 0.06 },
  heroDot2: { position: 'absolute', left: -30, bottom: -60, width: 140, height: 140, borderRadius: 70, backgroundColor: '#FFB020', opacity: 0.18 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { color: '#B5B1E6', fontSize: 14 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFB020', borderRadius: 999, minHeight: 44, paddingHorizontal: 16, maxWidth: '100%' },
  heroBtnText: { color: C.ink, fontSize: 14, fontWeight: '800', flexShrink: 1 },
  stale: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.accentSoft, borderRadius: RADIUS.md, paddingHorizontal: 14, minHeight: 46 },
  staleText: { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  dayTitle: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.3, flexShrink: 1 },
  meal: { flexDirection: 'row', gap: 12, borderRadius: RADIUS.xl, padding: 12 },
  mealArt: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  mealLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 1 },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dishName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
});
