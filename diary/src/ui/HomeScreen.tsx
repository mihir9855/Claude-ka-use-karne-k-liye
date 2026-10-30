import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_TIME, addDays, entryLabel, streak, todayMenu, totalsFor, upcomingMeals, ymd } from '../core/diary';
import { personName, useActive, useStore } from '../state/store';
import { Icon } from './Icon';
import { Bar } from './kit';
import { SLOT_ICON_ID, slotLabel } from './slots';
import { Text } from './Text';
import { C, RADIUS, themed } from './theme';

export type Tab = 'home' | 'chat' | 'menu' | 'nutrition' | 'lists' | 'profile';

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
  const picks = useStore((s) => s.picks);
  const upcoming = useMemo(() => upcomingMeals(entries, target, picks, new Date(), person.conditions, 5), [entries, target, picks, person.conditions]);
  const days = streak(entries);
  const name = personName(person, persons.indexOf(person));
  const nextRow = menu.find((x) => !x.eaten && !x.missed && x.options.length > 0);
  const nextOpt = nextRow ? nextRow.options[(pick[nextRow.slot] ?? 0) % nextRow.options.length] : undefined;
  const nextSlot = nextRow?.slot;
  const kcalLine = logged.length === 0 ? 'Nothing logged yet' : left >= 0 ? `${Math.round(left).toLocaleString('en-IN')} kcal left` : `${Math.round(-left).toLocaleString('en-IN')} kcal over`;

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={{ gap: 2 }}>
        <Text style={s.hello} numberOfLines={1}>{`${greeting(now.getHours())}, ${name}`}</Text>
        <Text style={s.date} numberOfLines={1}>{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
      </View>

      <View style={s.heroBlock}>
        <Text style={s.heroTag} numberOfLines={1}>{nextRow ? `Next up · ${clock(new Date(2000, 0, 1, SLOT_TIME[nextRow.slot][0], SLOT_TIME[nextRow.slot][1]))}` : 'All set'}</Text>
        {nextRow && nextOpt ? (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel={`${slotLabel(nextRow.slot)}: ${nextOpt.name}. Tap for another option`} onPress={() => setPick({ ...pick, [nextRow.slot]: (pick[nextRow.slot] ?? 0) + 1 })}>
              <Text style={s.heroDish} numberOfLines={1}>{nextOpt.name}</Text>
              <Text style={s.heroMeta} numberOfLines={1}>{[slotLabel(nextRow.slot), nextOpt.kcal != null ? `${nextOpt.kcal} kcal` : '', nextOpt.why[0]?.text].filter(Boolean).join(' · ')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${nextOpt.name}`} onPress={() => add(nextOpt.items, nextRow.slot, today)} style={s.heroBtn}>
              <Icon name="check" size={20} color={C.hero} width={3} />
              <Text style={s.heroBtnText} numberOfLines={1}>I ate this</Text>
            </Pressable>
          </>
        ) : (
          <Text style={s.heroDish} numberOfLines={1}>{logged.length ? 'Nothing left today' : 'Log your first meal'}</Text>
        )}
      </View>

      <View style={s.tiles}>
        <Pressable accessibilityRole="button" accessibilityLabel="Calories today. Open nutrition details" onPress={() => go('nutrition')} style={s.tile}>
          <Text style={s.tileBig} numberOfLines={1}>{Math.round(tot.kcal).toLocaleString('en-IN')}</Text>
          <Text style={s.tileSmall} numberOfLines={1}>{`kcal of ${target.kcal.toLocaleString('en-IN')}`}</Text>
          <Bar value={tot.kcal} max={target.kcal} />
          <Text style={s.tileSmall} numberOfLines={1}>{kcalLine}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Protein today. Open nutrition details" onPress={() => go('nutrition')} style={s.tile}>
          <Text style={s.tileBig} numberOfLines={1}>{Math.round(tot.protein)}</Text>
          <Text style={s.tileSmall} numberOfLines={1}>{`g protein of ${target.protein}`}</Text>
          <Bar value={tot.protein} max={target.protein} color={C.mint} />
          <Text style={s.tileSmall} numberOfLines={1}>{`${days} day streak`}</Text>
        </Pressable>
      </View>

      <View style={s.head}>
        <Text style={s.h2} numberOfLines={1}>Today</Text>
        <Text style={s.small} numberOfLines={1}>Tap a dish for another idea</Text>
      </View>
      <View style={s.rule}>
        {menu.map((m) => {
          const [h, mi] = SLOT_TIME[m.slot];
          const time = clock(new Date(2000, 0, 1, h, mi));
          if (m.eaten) {
            return (
              <Pressable key={m.slot} accessibilityRole="button" accessibilityLabel={`${slotLabel(m.slot)}: ${m.eaten.map(entryLabel).join(', ')}`} onPress={() => go('chat')} style={s.row}>
                <Text style={s.time} numberOfLines={1}>{time}</Text>
                <View style={s.body}>
                  <Text style={s.slot} numberOfLines={1}>{`${slotLabel(m.slot)} · eaten`}</Text>
                  <Text style={s.dish} numberOfLines={1}>{m.eaten.map(entryLabel).join(', ')}</Text>
                  <Text style={s.meta} numberOfLines={1}>{`${Math.round(m.eaten.reduce((a, e) => a + (e.kcal ?? 0), 0))} kcal`}</Text>
                </View>
                <View style={s.done}>
                  <Icon name="check" size={18} color={C.good} width={2.6} />
                </View>
              </Pressable>
            );
          }
          const o = m.options[(pick[m.slot] ?? 0) % Math.max(1, m.options.length)];
          if (!o) return null;
          const isNext = m.slot === nextSlot;
          return (
            <View key={m.slot} style={s.row}>
              <Text style={s.time} numberOfLines={1}>{time}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`${slotLabel(m.slot)}: ${o.name}. Tap for another option`} onPress={() => setPick({ ...pick, [m.slot]: (pick[m.slot] ?? 0) + 1 })} style={s.body}>
                <Text style={s.slot} numberOfLines={1}>{m.missed ? `${slotLabel(m.slot)} · not logged` : isNext ? `${slotLabel(m.slot)} · next` : slotLabel(m.slot)}</Text>
                <Text style={s.dish} numberOfLines={1}>{o.name}</Text>
                <Text style={s.meta} numberOfLines={1}>{[o.kcal != null ? `${o.kcal} kcal` : '', o.why[0]?.text].filter(Boolean).join(' · ')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${o.name}`} onPress={() => add(o.items, m.slot, today)} style={[s.tick, isNext && s.tickOn]}>
                <Icon name="check" size={18} color={isNext ? C.onPrimary : C.accent} width={2.6} />
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={s.head}>
        <Text style={s.h2} numberOfLines={1}>Coming up</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="See the whole week" onPress={() => go('menu')} hitSlop={10}>
          <Text style={s.link} numberOfLines={1}>Whole week</Text>
        </Pressable>
      </View>
      <View style={s.rule}>
        {upcoming.length === 0 && <Text style={[s.meta, { paddingVertical: 14 }]}>Nothing planned yet.</Text>}
        {upcoming.map((u, i) => (
          <View key={`${u.date}${u.slot}`}>
            {(i === 0 || upcoming[i - 1].date !== u.date) && <Text style={s.upDay}>{dayLabel(u.date, today)}</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={`${slotLabel(u.slot)} at ${clock(u.at)}: ${u.dish.name}`} onPress={() => go('menu')} style={s.row}>
              <Text style={s.time} numberOfLines={1}>{clock(u.at)}</Text>
              <View style={s.body}>
                <Text style={s.slot} numberOfLines={1}>{slotLabel(u.slot)}</Text>
                <Text style={s.dish} numberOfLines={1}>{u.dish.name}</Text>
              </View>
              {i === 0 ? <Text style={s.soon} numberOfLines={1}>{inText(u.at.getTime() - Date.now())}</Text> : u.dish.kcal != null ? <Text style={s.meta} numberOfLines={1}>{`${u.dish.kcal} kcal`}</Text> : null}
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const clock = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

function inText(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min <= 5) return 'Now';
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `in ${h} h ${m} min` : `in ${h} h`;
}

function dayLabel(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDays(today, 1)) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

const s = themed(() => StyleSheet.create({
  page: { padding: 20, gap: 14, paddingBottom: 32 },
  hello: { fontSize: 14, color: C.muted, fontWeight: '600' },
  date: { fontFamily: 'display', fontSize: 30, fontWeight: '800', color: C.text, letterSpacing: -1 },
  heroBlock: { backgroundColor: C.hero, borderRadius: RADIUS.xl, padding: 20, gap: 6 },
  heroTag: { fontSize: 13, fontWeight: '800', color: C.onHero, opacity: 0.7 },
  heroDish: { fontFamily: 'display', fontSize: 26, fontWeight: '800', color: C.onHero, letterSpacing: -1 },
  heroMeta: { fontSize: 13, fontWeight: '600', color: C.onHero, opacity: 0.75 },
  heroBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52, borderRadius: RADIUS.pill, backgroundColor: C.onHero },
  heroBtnText: { fontSize: 16, fontWeight: '800', color: C.hero },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, minWidth: 0, backgroundColor: C.card, borderRadius: RADIUS.lg, padding: 16, gap: 6, borderWidth: 1, borderColor: C.line },
  tileBig: { fontFamily: 'display', fontSize: 42, fontWeight: '800', color: C.text, letterSpacing: -1.5 },
  tileSmall: { fontSize: 12, color: C.muted, fontWeight: '600' },
  small: { fontSize: 12, color: C.muted, fontWeight: '500', flexShrink: 1 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  h2: { fontFamily: 'display', fontSize: 24, fontWeight: '800', color: C.text, flexShrink: 1 },
  link: { fontSize: 14, fontWeight: '700', color: C.accent },
  rule: { borderTopWidth: 1, borderTopColor: C.line },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 68, borderBottomWidth: 1, borderBottomColor: C.line },
  time: { width: 60, fontSize: 12, fontWeight: '600', color: C.muted },
  body: { flex: 1, minWidth: 0, paddingVertical: 8 },
  slot: { fontSize: 12, fontWeight: '600', color: C.muted },
  dish: { fontFamily: 'display', fontSize: 19, fontWeight: '700', color: C.text },
  meta: { fontSize: 12, color: C.muted },
  soon: { fontSize: 12, fontWeight: '700', color: C.accent },
  upDay: { fontFamily: 'display', fontSize: 17, fontWeight: '700', color: C.text, paddingTop: 14, paddingBottom: 4 },
  tick: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  tickOn: { backgroundColor: C.accent },
  done: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
}));
