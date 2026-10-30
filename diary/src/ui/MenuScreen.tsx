import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_ORDER, addDays, entryLabel, weekMenu, ymd } from '../core/diary';
import { useActive, useStore } from '../state/store';
import { Icon } from './Icon';
import { Button, Card, Label, Muted, Pill } from './kit';
import { SLOT_ICON_ID, slotLabel } from './slots';
import { Text } from './Text';
import { C, RADIUS, themed } from './theme';

function dayName(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

export function MenuScreen() {
  const { person, target, entries } = useActive();
  const picks = useStore((s) => s.picks);
  const setPick = useStore((s) => s.setPick);
  const clearPicks = useStore((s) => s.clearPicks);
  const add = useStore((s) => s.add);
  const today = ymd(new Date());
  const week = useMemo(() => weekMenu(entries, target, picks, new Date(), person.conditions), [entries, target, picks, person.conditions]);
  const avgK = Math.round(week.reduce((a, d) => a + d.kcal, 0) / week.length);
  const avgP = Math.round(week.reduce((a, d) => a + d.protein, 0) / week.length);

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.heroCard}>
        <Text style={s.heroTitle} numberOfLines={1}>This week at a glance</Text>
        <View style={s.glance}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[s.big, { color: C.onHero, fontSize: 28 }]} numberOfLines={1}>{`${avgK.toLocaleString('en-IN')} kcal`}</Text>
            <Text style={[s.small, { color: C.onHero, opacity: 0.75, fontWeight: '600' }]} numberOfLines={1}>{`a day, goal ${target.kcal.toLocaleString('en-IN')}`}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[s.big, { color: C.onHero, fontSize: 28 }]} numberOfLines={1}>{`${avgP} g`}</Text>
            <Text style={[s.small, { color: C.onHero, opacity: 0.75, fontWeight: '600' }]} numberOfLines={1}>{`protein a day, goal ${target.protein}`}</Text>
          </View>
        </View>
        <Text style={s.heroNote} numberOfLines={1}>Built from your habits. Tap a dish to swap.</Text>
      </View>

      {week.map((d) => {
        const low = d.protein < target.protein * 0.8;
        return (
          <View key={d.date} style={s.day}>
            <View style={s.dayHead}>
              <Text style={s.dayName} numberOfLines={1}>
                {dayName(d.date, today)}
              </Text>
              <Text style={s.dayNum} numberOfLines={1}>{`${Math.round(d.kcal).toLocaleString('en-IN')} kcal · ${Math.round(d.protein)} g`}</Text>
            </View>
            {low && d.slots.length > 0 && <Pill label="Protein looks low" warn />}
            {d.slots.map((sl) => {
              const key = `${d.date}|${sl.slot}`;
              if (sl.eaten) {
                return (
                  <View key={sl.slot} style={s.row}>
                    <View style={s.ico}>
                      <Icon name={SLOT_ICON_ID[sl.slot]} size={18} color={C.muted} width={1.7} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.slot} numberOfLines={1}>{slotLabel(sl.slot)}</Text>
                      <Text style={s.name} numberOfLines={1}>{sl.eaten.map(entryLabel).join(', ')}</Text>
                    </View>
                    <View style={[s.tick, { backgroundColor: C.goodSoft }]}>
                      <Icon name="check" size={18} color={C.good} width={2.6} />
                    </View>
                  </View>
                );
              }
              const c = sl.chosen!;
              const idx = sl.options.findIndex((o) => o.name === c.name);
              const next = sl.options[(idx + 1) % sl.options.length];
              return (
                <View key={sl.slot} style={s.row}>
                  <View style={s.ico}>
                    <Icon name={SLOT_ICON_ID[sl.slot]} size={18} color={C.text} width={1.7} />
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${slotLabel(sl.slot)}: ${c.name}. Tap for another option`} onPress={() => setPick(key, next.name)} style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.slot} numberOfLines={1}>{slotLabel(sl.slot)}</Text>
                    <Text style={s.name} numberOfLines={1}>{c.name}</Text>
                    <Text style={s.why} numberOfLines={1}>{[c.kcal != null ? `${c.kcal} kcal` : '', c.protein != null ? `${c.protein} g protein` : ''].filter(Boolean).join(' · ')}</Text>
                  </Pressable>
                  {d.date === today && (
                    <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${c.name}`} onPress={() => add(c.items, sl.slot, d.date)} style={s.tick}>
                      <Icon name="check" size={18} color={C.onPrimary} width={2.6} />
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
      {Object.keys(picks).length > 0 && <Button kind="soft" label="Reset my swaps" onPress={clearPicks} />}
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  page: { padding: 16, gap: 14, paddingBottom: 28 },
  glance: { flexDirection: 'row', gap: 16 },
  heroCard: { backgroundColor: C.hero, borderRadius: RADIUS.xl, padding: 20, gap: 10 },
  heroTitle: { fontFamily: 'display', fontSize: 20, fontWeight: '800', color: C.onHero },
  heroNote: { fontSize: 13, fontWeight: '600', color: C.onHero, opacity: 0.75 },
  big: { fontFamily: 'display', fontSize: 26, fontWeight: '700', color: C.text, letterSpacing: -0.4 },
  small: { fontSize: 12, color: C.muted },
  day: { backgroundColor: C.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.line, padding: 14, gap: 10 },
  dayHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  dayName: { flex: 1, minWidth: 0, fontFamily: 'display', fontSize: 20, fontWeight: '600', color: C.text },
  dayNum: { fontSize: 12, color: C.muted, fontWeight: '600', maxWidth: '55%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line },
  ico: { width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  slot: { fontSize: 12, fontWeight: '700', color: C.muted },
  name: { fontSize: 16, fontWeight: '700', color: C.text },
  why: { fontSize: 12, color: C.muted },
  tick: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
}));
