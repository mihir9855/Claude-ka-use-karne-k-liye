import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { addDays, totalsFor, ymd } from '../core/diary';
import { useActive } from '../state/store';
import { Bar, Card, Label, Muted, Pill } from './kit';
import { Text } from './Text';
import { C, RADIUS, TILE, themed } from './theme';

const MACROS = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
  { key: 'fiber', label: 'Fibre' },
] as const;

const CHART_H = 110;

export function NutritionScreen() {
  const { target, entries } = useActive();
  const today = ymd(new Date());
  const [date, setDate] = useState(today);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)), [today]);
  const per = useMemo(() => days.map((d) => ({ date: d, ...totalsFor(entries, d) })), [days, entries]);
  const tot = totalsFor(entries, date);
  const logged = entries.filter((e) => e.date === date).length;
  const maxK = Math.max(target.kcal * 1.25, ...per.map((p) => p.kcal));
  const left = target.kcal - tot.kcal;
  const loggedDays = per.filter((p) => p.kcal > 0);
  const avgK = loggedDays.length ? Math.round(loggedDays.reduce((a, p) => a + p.kcal, 0) / loggedDays.length) : 0;
  const avgP = loggedDays.length ? Math.round(loggedDays.reduce((a, p) => a + p.protein, 0) / loggedDays.length) : 0;
  const top = useMemo(() => {
    const keep = new Set(days);
    const m = new Map<string, { name: string; n: number }>();
    for (const e of entries) if (keep.has(e.date)) m.set(e.key, { name: e.name, n: (m.get(e.key)?.n ?? 0) + 1 });
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 5);
  }, [days, entries]);

  const short = MACROS.map((m) => ({ ...m, gap: target[m.key] - tot[m.key] })).filter((m) => (m.key === 'protein' || m.key === 'fiber') && m.gap > target[m.key] * 0.15).sort((a, b) => b.gap / target[b.key] - a.gap / target[a.key])[0];

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Card>
        <Label>Calories</Label>
        <Text style={s.hero} numberOfLines={1}>
          {Math.round(tot.kcal).toLocaleString('en-IN')}
          <Text style={s.heroSmall}>{` of ${target.kcal.toLocaleString('en-IN')} kcal`}</Text>
        </Text>
        <Bar value={tot.kcal} max={target.kcal} />
        <Text style={s.left} numberOfLines={1}>
          {logged === 0 ? 'Nothing logged for this day.' : left >= 0 ? `${Math.round(left)} kcal left` : `${Math.round(-left)} kcal over`}
        </Text>
        {short && logged > 0 && <Pill warn label={`${short.label} is ${Math.round(short.gap)} g short`} />}
        {tot.unknown > 0 && <Muted>{`${tot.unknown} ${tot.unknown === 1 ? 'item has' : 'items have'} no numbers in the library, so ${tot.unknown === 1 ? 'it is' : 'they are'} not counted.`}</Muted>}
      </Card>

      <Card>
        <Label>Last 7 days</Label>
        <View style={s.chart}>
          <View style={[s.targetLine, { bottom: 22 + (target.kcal / maxK) * CHART_H }]} />
          {per.map((p) => {
            const on = p.date === date;
            const d = new Date(`${p.date}T12:00:00`);
            return (
              <Pressable key={p.date} accessibilityRole="button" accessibilityLabel={`${d.toDateString()}, ${Math.round(p.kcal)} kcal`} accessibilityState={{ selected: on }} onPress={() => setDate(p.date)} style={s.col}>
                <View style={[s.bar, { height: Math.max(3, (p.kcal / maxK) * CHART_H), backgroundColor: on ? TILE.orange : C.surface, borderWidth: 2, borderColor: C.line }]} />
                <Text style={[s.dayLetter, on && { color: C.text, fontWeight: '800' }]} numberOfLines={1}>
                  {d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Muted>{loggedDays.length ? `Average on the days you logged: ${avgK.toLocaleString('en-IN')} kcal and ${avgP} g protein.` : 'Tap a bar to look at that day. The line is your daily goal.'}</Muted>
      </Card>

      <Card>
        <Label>Nutrients</Label>
        {MACROS.map((m) => {
          const v = tot[m.key];
          const goal = target[m.key];
          const diff = v - goal;
          const ok = m.key === 'fiber' ? diff >= 0 : Math.abs(diff) <= goal * 0.1 || (m.key === 'protein' && diff > 0);
          return (
            <View key={m.key} style={s.macro}>
              <View style={s.macroHead}>
                <Text style={s.macroName} numberOfLines={1}>{m.label}</Text>
                <Text style={s.macroVal} numberOfLines={1}>{`${Math.round(v)} / ${goal} g`}</Text>
                {logged > 0 && <Pill label={`${diff > 0 ? '+' : ''}${Math.round(diff)} g`} warn={!ok} />}
              </View>
              <Bar value={v} max={goal} />
            </View>
          );
        })}
      </Card>

      {top.length > 0 && (
        <Card>
          <Label>Most eaten this week</Label>
          {top.map((t) => (
            <View key={t.name} style={s.topRow}>
              <Text style={s.topName} numberOfLines={1}>{t.name}</Text>
              <Text style={s.topN}>{`${t.n}×`}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, gap: 16, paddingBottom: 32 },
  hero: { fontFamily: 'display', fontSize: 36, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  heroSmall: { fontSize: 14, fontWeight: '500', color: C.muted, letterSpacing: 0 },
  left: { fontSize: 14, fontWeight: '600', color: C.text },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_H + 26, gap: 8 },
  targetLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.line },
  col: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: CHART_H + 26 },
  bar: { width: '70%', borderRadius: 6 },
  dayLetter: { fontSize: 12, fontWeight: '600', color: C.muted, height: 16 },
  macro: { gap: 6 },
  macroHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  macroName: { fontSize: 15, fontWeight: '700', color: C.text, width: 64 },
  macroVal: { flex: 1, minWidth: 0, fontSize: 13, color: C.muted, textAlign: 'right' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 42, borderTopWidth: 2, borderTopColor: C.line },
  topName: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '600', color: C.text },
  topN: { fontSize: 13, color: C.muted },
}));
