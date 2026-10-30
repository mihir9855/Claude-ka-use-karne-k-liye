import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_LABEL, entryLabel } from '../core/diary';
import { Bar, Tile } from './kit';
import { Text } from './Text';
import { C, RADIUS, TILE, TILE_CYCLE, TILE_INK, themed } from './theme';
import { dayLabel, inText, slotClock, useHome } from './useHome';

export type Tab = 'home' | 'chat' | 'menu' | 'nutrition' | 'lists' | 'profile';

export function HomeScreen({ go }: { go: (t: Tab) => void }) {
  const h = useHome();
  const next = h.nextRow;
  const opt = h.nextOpt;
  const others = h.menu.filter((m) => m !== next);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View>
        <Text style={s.date} numberOfLines={1}>{h.now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <Text style={s.title} numberOfLines={1}>{"What's on"}</Text>
        <Text style={s.title} numberOfLines={1}>{h.name === 'Me' ? 'your plate?' : `${h.name}'s plate?`}</Text>
      </View>

      <Tile bg={TILE.yellow} style={s.next}>
        <Text style={s.tag} numberOfLines={1}>{next ? `NEXT · ${slotClock(next.slot).toUpperCase()} · ${SLOT_LABEL[next.slot].toUpperCase()}` : 'ALL DONE'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`${opt?.name ?? ''}. Tap for another option`} onPress={() => next && h.cycle(next.slot)}>
          <Text style={s.nextDish} numberOfLines={1}>{opt ? opt.name : h.logged.length ? 'Nothing left today' : 'Log your first meal'}</Text>
        </Pressable>
        <Text style={s.tagSoft} numberOfLines={1}>{opt ? [opt.kcal != null ? `${opt.kcal} kcal` : '', opt.why[0]?.text].filter(Boolean).join(' · ') : 'Tap Chat to add what you ate'}</Text>
        {next && opt && (
          <Tile bg={TILE_INK} onPress={() => h.eat(next.slot)} label={`I ate ${opt.name}`} radius={RADIUS.pill} offset={3} wrap={s.goWrap} style={s.go}>
            <Text style={s.goText} numberOfLines={1}>I ate it</Text>
          </Tile>
        )}
      </Tile>

      <View style={s.grid}>
        {others.map((m, i) => {
          const o = h.optOf(m.slot);
          const eaten = !!m.eaten;
          const bg = eaten ? TILE.green : TILE_CYCLE[(i + 1) % TILE_CYCLE.length];
          return (
            <Tile
              key={m.slot}
              wrap={s.half}
              bg={bg}
              onPress={() => (eaten ? go('chat') : h.cycle(m.slot))}
              label={`${SLOT_LABEL[m.slot]}: ${eaten ? m.eaten!.map(entryLabel).join(', ') : o?.name ?? ''}`}
              style={s.tile}
            >
              <Text style={s.tag} numberOfLines={1}>{SLOT_LABEL[m.slot].toUpperCase()}</Text>
              <Text style={s.dish} numberOfLines={1}>{eaten ? m.eaten!.map(entryLabel).join(', ') : o?.name ?? '-'}</Text>
              <Text style={s.tagSoft} numberOfLines={1}>{eaten ? `${slotClock(m.slot)} · done · ${Math.round(m.eaten!.reduce((a, e) => a + (e.kcal ?? 0), 0))} kcal` : `${slotClock(m.slot)}${o?.kcal != null ? ` · ${o.kcal} kcal` : ''}`}</Text>
            </Tile>
          );
        })}
      </View>

      <View style={s.grid}>
        <Tile wrap={s.half} bg={C.card} onPress={() => go('nutrition')} label="Calories today. Open nutrition details" style={s.tile}>
          <Text style={s.big} numberOfLines={1}>{Math.round(h.tot.kcal).toLocaleString('en-IN')}</Text>
          <Text style={s.muted} numberOfLines={1}>{`kcal of ${h.target.kcal.toLocaleString('en-IN')}`}</Text>
          <Bar value={h.tot.kcal} max={h.target.kcal} color={TILE.orange} />
        </Tile>
        <Tile wrap={s.half} bg={C.card} onPress={() => go('nutrition')} label="Protein today. Open nutrition details" style={s.tile}>
          <Text style={s.big} numberOfLines={1}>{Math.round(h.tot.protein)}</Text>
          <Text style={s.muted} numberOfLines={1}>{`g protein of ${h.target.protein}`}</Text>
          <Bar value={h.tot.protein} max={h.target.protein} color={TILE.green} />
        </Tile>
      </View>
      <Text style={s.muted} numberOfLines={1}>{`${h.left >= 0 ? `${Math.round(h.left).toLocaleString('en-IN')} kcal left` : `${Math.round(-h.left)} kcal over`} · ${h.days} day streak`}</Text>

      <View style={s.head}>
        <Text style={s.h2} numberOfLines={1}>Coming up</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="See the whole week" onPress={() => go('menu')} hitSlop={10}>
          <Text style={s.link} numberOfLines={1}>Whole week</Text>
        </Pressable>
      </View>
      <Tile style={s.list}>
        {h.upcoming.length === 0 && <Text style={s.muted}>Nothing planned yet.</Text>}
        {h.upcoming.map((u, i) => (
          <View key={`${u.date}${u.slot}`}>
            {(i === 0 || h.upcoming[i - 1].date !== u.date) && <Text style={s.day}>{dayLabel(u.date, h.today)}</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel={`${SLOT_LABEL[u.slot]} at ${u.at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}: ${u.dish.name}`} onPress={() => go('menu')} style={[s.row, i > 0 && h.upcoming[i - 1].date === u.date && s.rowLine]}>
              <Text style={s.time} numberOfLines={1}>{u.at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
              <View style={s.col}>
                <Text style={s.rowSlot} numberOfLines={1}>{SLOT_LABEL[u.slot]}</Text>
                <Text style={s.rowDish} numberOfLines={1}>{u.dish.name}</Text>
              </View>
              {i === 0 && <Text style={s.soon} numberOfLines={1}>{inText(u.at.getTime() - Date.now())}</Text>}
            </Pressable>
          </View>
        ))}
      </Tile>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  // the right padding is 4 smaller so the tiles' shadows end where the left edge begins
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 32, gap: 16 },
  date: { fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 2 },
  title: { fontFamily: 'display', fontSize: 40, fontWeight: '800', color: C.text, letterSpacing: -1.6, lineHeight: 42 },
  col: { flex: 1, minWidth: 0 },
  next: { padding: 16, gap: 2 },
  nextDish: { fontFamily: 'display', fontSize: 24, fontWeight: '800', color: TILE_INK, letterSpacing: -0.5 },
  goWrap: { marginTop: 10 },
  go: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  goText: { color: TILE.yellow, fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  half: { width: '48.5%' },
  tile: { padding: 12, gap: 2, minHeight: 100, justifyContent: 'center' },
  tag: { fontSize: 11, fontWeight: '800', color: TILE_INK },
  tagSoft: { fontSize: 12, fontWeight: '700', color: TILE_INK, opacity: 0.75 },
  dish: { fontFamily: 'display', fontSize: 18, fontWeight: '800', color: TILE_INK },
  big: { fontFamily: 'display', fontSize: 38, fontWeight: '800', color: C.text, letterSpacing: -1.5 },
  muted: { fontSize: 12, fontWeight: '700', color: C.muted },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  h2: { fontFamily: 'display', fontSize: 26, fontWeight: '800', color: C.text, flexShrink: 1 },
  link: { fontSize: 14, fontWeight: '800', color: C.text, textDecorationLine: 'underline' },
  list: { paddingHorizontal: 14, paddingVertical: 6 },
  day: { fontFamily: 'display', fontSize: 16, fontWeight: '800', color: C.text, paddingTop: 10, paddingBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58 },
  rowLine: { borderTopWidth: 2, borderTopColor: C.line },
  time: { width: 66, fontSize: 12, fontWeight: '800', color: C.text },
  rowSlot: { fontSize: 12, fontWeight: '700', color: C.muted },
  rowDish: { fontFamily: 'display', fontSize: 16, fontWeight: '800', color: C.text },
  soon: { fontSize: 12, fontWeight: '800', color: C.text },
}));
