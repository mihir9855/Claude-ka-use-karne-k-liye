import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_ORDER, addDays, learned, streak, todayMenu, totalsFor, weekMenu, ymd } from '../core/diary';
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
  const [pick, setPick] = useState<Record<string, number>>({});
  const now = new Date();
  const today = ymd(now);
  const tot = totalsFor(entries, today);
  const left = target.kcal - tot.kcal;
  const logged = entries.filter((e) => e.date === today);
  const menu = useMemo(() => todayMenu(entries, target, new Date(), person.conditions), [entries, target, person.conditions]);
  const info = useMemo(() => learned(entries), [entries]);
  const picks = useStore((s) => s.picks);
  const upcoming = useMemo(() => weekMenu(entries, target, picks, new Date(), person.conditions).slice(1, 4), [entries, target, picks, person.conditions]);
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
        <Label>Today's menu</Label>
        {menu.map((m) => {
          const isNext = !m.eaten && !m.missed && menu.find((x) => !x.eaten && !x.missed)?.slot === m.slot;
          if (m.eaten) {
            return (
              <Pressable key={m.slot} accessibilityRole="button" accessibilityLabel={`${slotLabel(m.slot)}: ${m.eaten.map((e) => e.name).join(', ')}`} onPress={() => go('chat')} style={s.slotRow}>
                <View style={[s.slotIco, { backgroundColor: C.goodSoft }]}>
                  <Icon name="check" size={18} color={C.good} width={2.4} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.slotName} numberOfLines={1}>{`${slotLabel(m.slot)} · eaten`}</Text>
                  <Text style={s.slotWhat} numberOfLines={1}>{m.eaten.map((e) => e.name).join(', ')}</Text>
                  <Text style={s.slotWhy} numberOfLines={1}>{`${Math.round(m.eaten.reduce((a, e) => a + (e.kcal ?? 0), 0))} kcal`}</Text>
                </View>
              </Pressable>
            );
          }
          const o = m.options[(pick[m.slot] ?? 0) % Math.max(1, m.options.length)];
          if (!o) return null;
          return (
            <View key={m.slot} style={s.slotRow}>
              <View style={s.slotIco}>
                <Icon name={SLOT_ICON_ID[m.slot]} size={18} color={C.text} width={1.8} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`${slotLabel(m.slot)}: ${o.name}. Tap for another option`} onPress={() => setPick({ ...pick, [m.slot]: (pick[m.slot] ?? 0) + 1 })} style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.slotName} numberOfLines={1}>{m.missed ? `${slotLabel(m.slot)} · not logged` : slotLabel(m.slot)}</Text>
                <Text style={s.slotWhat} numberOfLines={1}>{o.name}</Text>
                <Text style={s.slotWhy} numberOfLines={1}>{[o.kcal != null ? `${o.kcal} kcal` : '', o.why[0]?.text].filter(Boolean).join(' · ')}</Text>
              </Pressable>
              {isNext && <Pill label="Next" />}
              <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${o.name}`} onPress={() => add(o.items, m.slot, today)} style={s.tick}>
                <Icon name="check" size={18} color={C.onPrimary} width={2.6} />
              </Pressable>
            </View>
          );
        })}
        <Text style={s.hint}>This changes when you log a meal in Chat. Tap a dish for another option, tap the tick when you eat it.</Text>
      </Card>

      <Card>
        <Label>Upcoming</Label>
        {upcoming.map((d) => (
          <Pressable key={d.date} accessibilityRole="button" accessibilityLabel={`Menu for ${dayLabel(d.date, today)}`} onPress={() => go('menu')} style={s.upDay}>
            <View style={s.upHead}>
              <Text style={s.upName} numberOfLines={1}>{dayLabel(d.date, today)}</Text>
              <Text style={s.upNum} numberOfLines={1}>{`${Math.round(d.kcal).toLocaleString('en-IN')} kcal · ${Math.round(d.protein)} g`}</Text>
            </View>
            <View style={s.upGrid}>
              {d.slots.map((sl) => (
                <View key={sl.slot} style={s.upCell}>
                  <Icon name={SLOT_ICON_ID[sl.slot]} size={14} color={C.muted} width={1.8} />
                  <Text style={s.upDish} numberOfLines={1}>{sl.chosen?.name ?? ''}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
        <Button kind="soft" icon="calendar" label="See the whole week" onPress={() => go('menu')} />
      </Card>

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

      <Card>
        <Label>What I have learned</Label>
        {info.meals === 0 ? (
          <Text style={s.hint}>Nothing yet. Log what you eat in Chat and I will start planning around it.</Text>
        ) : (
          <>
            <Text style={s.hint}>{`From ${info.meals} items over ${info.days} ${info.days === 1 ? 'day' : 'days'}. Your usual meals:`}</Text>
            {SLOT_ORDER.map((id) => (info.usual[id] ? (
              <View key={id} style={s.learnRow}>
                <Text style={s.learnTag} numberOfLines={1}>{slotLabel(id)}</Text>
                <Text style={s.learnVal} numberOfLines={1}>{info.usual[id]!.name}</Text>
                <Text style={s.learnN}>{`${info.usual[id]!.n}×`}</Text>
              </View>
            ) : null))}
          </>
        )}
      </Card>

      <View style={{ gap: 10 }}>
        <Button icon="pen" label="Log a meal" onPress={() => go('chat')} />
        <Button kind="soft" icon="calendar" label="See this week's menu" onPress={() => go('menu')} />
      </View>
    </ScrollView>
  );
}

function dayLabel(date: string, today: string): string {
  if (date === addDays(today, 1)) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
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
  upDay: { gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  upHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  upName: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '800', color: C.text },
  upNum: { fontSize: 12, color: C.muted, fontWeight: '600', maxWidth: '55%' },
  upGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  upCell: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8 },
  upDish: { flex: 1, minWidth: 0, fontSize: 13, fontWeight: '600', color: C.text },
  slotWhy: { fontSize: 12, color: C.muted },
  learnRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 38, borderTopWidth: 1, borderTopColor: C.line },
  learnTag: { width: 84, fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  learnVal: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '700', color: C.text },
  learnN: { fontSize: 13, color: C.muted },
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
