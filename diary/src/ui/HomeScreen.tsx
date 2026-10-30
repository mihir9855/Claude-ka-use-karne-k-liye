import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_ORDER, addDays, dayMenu, slotAt, streak, totalsFor, ymd } from '../core/diary';
import { personName, useActive, useStore } from '../state/store';
import { Icon } from './Icon';
import { Bar, Button, Card, Label, Pill } from './kit';
import { Ring } from './Ring';
import { SLOT_ICON_ID, slotLabel } from './slots';
import { Text } from './Text';
import { C, RADIUS } from './theme';

export type Tab = 'home' | 'chat' | 'menu' | 'nutrition' | 'profile';

const greeting = (h: number) => (h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');

export function HomeScreen({ go }: { go: (t: Tab) => void }) {
  const { person, target, entries } = useActive();
  const persons = useStore((s) => s.persons);
  const add = useStore((s) => s.add);
  const [pick, setPick] = useState(0);
  const now = new Date();
  const today = ymd(now);
  const tot = totalsFor(entries, today);
  const left = target.kcal - tot.kcal;
  const logged = entries.filter((e) => e.date === today);
  const menu = useMemo(() => dayMenu(entries, target, new Date(), person.conditions), [entries, target, person.conditions]);
  const nextUp = menu[0];
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => ({ d, ...totalsFor(entries, d) })), [entries, today]);
  const maxK = Math.max(target.kcal * 1.25, ...week.map((w) => w.kcal));
  const days = streak(entries);
  const shortProtein = tot.protein < target.protein * 0.7 && logged.length > 0;
  const name = personName(person, persons.indexOf(person));

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View>
        <Text style={s.hello} numberOfLines={1}>{`${greeting(now.getHours())}, ${name}`}</Text>
        <Text style={s.date} numberOfLines={1}>{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      <Card>
        <View style={s.hero}>
          <Ring value={tot.kcal} max={target.kcal}>
            <Text style={s.ringBig} numberOfLines={1}>{Math.round(tot.kcal).toLocaleString('en-IN')}</Text>
            <Text style={s.ringSmall} numberOfLines={1}>{`of ${target.kcal.toLocaleString('en-IN')} kcal`}</Text>
          </Ring>
          <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
            <Text style={s.left} numberOfLines={1}>{logged.length === 0 ? 'Nothing logged yet' : left >= 0 ? `${Math.round(left).toLocaleString('en-IN')} kcal left` : `${Math.round(-left)} kcal over`}</Text>
            <Label>Protein</Label>
            <Text style={s.protein} numberOfLines={1}>{`${Math.round(tot.protein)} / ${target.protein} g`}</Text>
            <Bar value={tot.protein} max={target.protein} />
            {shortProtein && <Pill warn label="Protein is behind" />}
          </View>
        </View>
      </Card>

      <View style={s.stats}>
        <Stat big={String(days)} label={days === 1 ? 'day streak' : 'day streak'} icon="flame" />
        <Stat big={String(logged.length)} label="items today" icon="check" />
        <Stat big={String(entries.length)} label="meals logged" icon="pen" />
      </View>

      <Card>
        <Label>Today's meals</Label>
        {SLOT_ORDER.map((id) => {
          const mine = logged.filter((e) => e.slot === id);
          const isNext = nextUp?.slot === id;
          const passed = SLOT_ORDER.indexOf(id) < SLOT_ORDER.indexOf(slotAt(now.getHours()));
          return (
            <Pressable key={id} accessibilityRole="button" accessibilityLabel={`${slotLabel(id)}: ${mine.length ? mine.map((e) => e.name).join(', ') : 'not yet'}`} onPress={() => go('chat')} style={s.slotRow}>
              <View style={[s.slotIco, mine.length > 0 && { backgroundColor: C.goodSoft }]}>
                <Icon name={mine.length ? 'check' : SLOT_ICON_ID[id]} size={18} color={mine.length ? C.good : C.muted} width={2} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.slotName} numberOfLines={1}>{slotLabel(id)}</Text>
                <Text style={[s.slotWhat, !mine.length && { color: C.muted }]} numberOfLines={1}>
                  {mine.length ? mine.map((e) => e.name).join(', ') : passed ? 'Not logged' : 'Not yet'}
                </Text>
              </View>
              {isNext && <Pill label="Next" />}
            </Pressable>
          );
        })}
      </Card>

      {nextUp && (
        <Card>
          <Label>{`Up next · ${slotLabel(nextUp.slot)}`}</Label>
          {(() => {
            const o = nextUp.options[pick % nextUp.options.length];
            return (
              <View style={s.next}>
                <Pressable accessibilityRole="button" accessibilityLabel="Show another option" onPress={() => setPick(pick + 1)} style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={s.nextName} numberOfLines={1}>{o.name}</Text>
                  <Text style={s.nextWhy} numberOfLines={1}>{[o.kcal != null ? `${o.kcal} kcal` : '', o.protein != null ? `${o.protein} g protein` : '', o.why[0]?.text].filter(Boolean).join(' · ')}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${o.name}`} onPress={() => add([o.name], nextUp.slot, today)} style={s.tick}>
                  <Icon name="check" size={18} color={C.onPrimary} width={2.6} />
                </Pressable>
              </View>
            );
          })()}
          <Text style={s.hint}>Tap the dish to see another one. Tap the tick when you eat it.</Text>
        </Card>
      )}

      <Card>
        <Label>Nutrients today</Label>
        <View style={s.grid}>
          {([['Carbs', tot.carbs, target.carbs], ['Fat', tot.fat, target.fat], ['Fibre', tot.fiber, target.fiber]] as const).map(([l, v, g]) => (
            <View key={l} style={s.cell}>
              <Text style={s.cellName} numberOfLines={1}>{l}</Text>
              <Text style={s.cellVal} numberOfLines={1}>{`${Math.round(v)} / ${g} g`}</Text>
              <Bar value={v} max={g} />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Label>Last 7 days</Label>
        <View style={s.chart}>
          {week.map((w) => (
            <View key={w.d} style={s.col}>
              <View style={[s.bar, { height: Math.max(3, (w.kcal / maxK) * 64), backgroundColor: w.d === today ? C.accent : '#3B5244' }]} />
              <Text style={s.dayL} numberOfLines={1}>{new Date(`${w.d}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2)}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ gap: 10 }}>
        <Button icon="pen" label="Log a meal" onPress={() => go('chat')} />
        <Button kind="soft" icon="calendar" label="See this week's menu" onPress={() => go('menu')} />
      </View>
    </ScrollView>
  );
}

function Stat({ big, label, icon }: { big: string; label: string; icon: 'flame' | 'check' | 'pen' }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={16} color={C.accent} width={2} />
      <Text style={s.statBig} numberOfLines={1}>{big}</Text>
      <Text style={s.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 16, gap: 14, paddingBottom: 28 },
  hello: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.6 },
  date: { fontSize: 13, color: C.muted, fontWeight: '500', marginTop: 2 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringBig: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5, maxWidth: 92 },
  ringSmall: { fontSize: 11, color: C.muted, fontWeight: '600', maxWidth: 92 },
  left: { fontSize: 17, fontWeight: '800', color: C.text },
  protein: { fontSize: 14, fontWeight: '600', color: C.text },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, minWidth: 0, backgroundColor: C.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.line, padding: 12, gap: 2 },
  statBig: { fontSize: 24, fontWeight: '800', color: C.text },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  slotIco: { width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  slotName: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  slotWhat: { fontSize: 15, fontWeight: '700', color: C.text },
  next: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextName: { fontSize: 20, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  nextWhy: { fontSize: 12, color: C.muted },
  tick: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 12, color: C.muted },
  grid: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1, minWidth: 0, gap: 6 },
  cellName: { fontSize: 12, fontWeight: '700', color: C.muted },
  cellVal: { fontSize: 13, fontWeight: '700', color: C.text },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 88 },
  col: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: 88 },
  bar: { width: '70%', borderRadius: 5 },
  dayL: { fontSize: 11, fontWeight: '600', color: C.muted, height: 14 },
});
