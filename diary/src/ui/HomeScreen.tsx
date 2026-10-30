import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { SLOT_LABEL, SLOT_ORDER, entryLabel, type SlotId } from '../core/diary';
import { Icon } from './Icon';
import { Bar, Tile } from './kit';
import { Text } from './Text';
import { BORDER, C, RADIUS, TILE, TILE_CYCLE, TILE_INK, displayFonts, themed } from './theme';
import { dayLabel, inText, slotClock, useHome } from './useHome';

export type Tab = 'home' | 'chat' | 'menu' | 'nutrition' | 'lists' | 'profile';

export function HomeScreen({ go }: { go: (t: Tab) => void }) {
  const h = useHome();
  const next = h.nextRow;
  const opt = h.nextOpt;
  const others = h.menu.filter((m) => m !== next);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.headRow}>
        <View style={s.col}>
          <Text style={s.date} numberOfLines={1}>{h.now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          <Text style={s.title} numberOfLines={1}>{"What's on"}</Text>
          <Text style={s.title} numberOfLines={1}>{h.name === 'Me' ? 'your plate?' : `${h.name}'s plate?`}</Text>
        </View>
        <Tile bg={TILE.pink} onPress={() => go('chat')} label="Log a meal" radius={RADIUS.pill} offset={4} style={s.logBtn}>
          <Icon name="plus" size={26} color={TILE_INK} width={3} />
        </Tile>
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

      <Tile style={s.donutTile}>
        <Donut h={h} />
        <View style={s.legend}>
          <Text style={s.legendTitle} numberOfLines={1}>Today by meal</Text>
          {SLOT_ORDER.map((slot) => {
            const kcal = Math.round(h.menu.find((m) => m.slot === slot)?.eaten?.reduce((a, e) => a + (e.kcal ?? 0), 0) ?? 0);
            return (
              <View key={slot} style={s.legendRow}>
                <View style={[s.swatch, { backgroundColor: SLOT_COLOR[slot] }]} />
                <Text style={s.legendName} numberOfLines={1}>{SLOT_LABEL[slot]}</Text>
                <Text style={s.legendVal} numberOfLines={1}>{kcal > 0 ? String(kcal) : '-'}</Text>
              </View>
            );
          })}
        </View>
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
              <Text style={s.tagSoft} numberOfLines={1}>{eaten ? `${slotClock(m.slot)} · ${Math.round(m.eaten!.reduce((a, e) => a + (e.kcal ?? 0), 0))} kcal` : `${slotClock(m.slot)}${o?.kcal != null ? ` · ${o.kcal} kcal` : ''}`}</Text>
            </Tile>
          );
        })}
      </View>

      <View style={s.grid}>
        <Tile wrap={s.half} bg={TILE.yellow} style={s.tile}>
          <View style={s.streakTop}>
            <View style={s.flame}>
              <Icon name="flame" size={20} color={TILE_INK} width={2.2} />
            </View>
            <Text style={s.bigInk} numberOfLines={1}>{h.days}</Text>
          </View>
          <Text style={s.tag} numberOfLines={1}>{h.days === 1 ? 'DAY STREAK' : 'DAYS STREAK'}</Text>
          <View style={s.dots}>
            {h.week.map((d) => (
              <View key={d.date} style={[s.dot, d.has && { backgroundColor: TILE_INK }, d.date === h.today && s.dotToday]}>
                <Text style={[s.dotText, d.has && { color: TILE.yellow }]}>{d.letter}</Text>
              </View>
            ))}
          </View>
        </Tile>
        <Tile wrap={s.half} bg={C.card} onPress={() => go('nutrition')} label="Protein today. Open nutrition details" style={s.tile}>
          <Text style={s.big} numberOfLines={1}>{Math.round(h.tot.protein)}</Text>
          <Text style={s.muted} numberOfLines={1}>{`g protein of ${h.target.protein}`}</Text>
          <Bar value={h.tot.protein} max={h.target.protein} color={TILE.green} />
          <Text style={s.muted} numberOfLines={1}>{h.left >= 0 ? `${Math.round(h.left).toLocaleString('en-IN')} kcal left` : `${Math.round(-h.left)} kcal over`}</Text>
        </Tile>
      </View>

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

const SLOT_COLOR: Record<SlotId, string> = { b: TILE.yellow, m: TILE.orange, l: TILE.green, s: TILE.blue, d: TILE.lilac };

/** Today's calories as a ring, one chunky outlined slice per meal that was eaten. */
function Donut({ h }: { h: ReturnType<typeof useHome> }) {
  const R = 40;
  const LEN = 2 * Math.PI * R;
  const goal = Math.max(1, h.target.kcal);
  let used = 0;
  const segs = SLOT_ORDER.map((slot) => {
    const kcal = h.menu.find((m) => m.slot === slot)?.eaten?.reduce((a, e) => a + (e.kcal ?? 0), 0) ?? 0;
    const len = Math.min(LEN - used, (kcal / goal) * LEN);
    const seg = { slot, start: used, len: Math.max(0, len) };
    used += Math.max(0, len);
    return seg;
  }).filter((x) => x.len > 0.5);
  return (
    <View style={{ width: 128, height: 128 }}>
      <Svg width="100%" height="100%" viewBox="0 0 128 128">
        <Circle cx="64" cy="64" r={R} fill="none" stroke={C.surface} strokeWidth="24" />
        <Circle cx="64" cy="64" r={R + 12} fill="none" stroke={C.line} strokeWidth="2.5" />
        <Circle cx="64" cy="64" r={R - 12} fill="none" stroke={C.line} strokeWidth="2.5" />
        {segs.map((g) => (
          <Circle key={`i${g.slot}`} cx="64" cy="64" r={R} fill="none" stroke={C.line} strokeWidth="26" strokeDasharray={`${Math.min(LEN, g.len + 3)} ${LEN}`} strokeDashoffset={-g.start + 1.5} transform="rotate(-90 64 64)" />
        ))}
        {segs.map((g) => (
          <Circle key={`c${g.slot}`} cx="64" cy="64" r={R} fill="none" stroke={SLOT_COLOR[g.slot]} strokeWidth="21" strokeDasharray={`${Math.max(0, g.len - 1)} ${LEN}`} strokeDashoffset={-g.start} transform="rotate(-90 64 64)" />
        ))}
        <SvgText x="64" y="66" textAnchor="middle" fontSize="15" fontFamily={displayFonts().bold} fill={C.text}>{Math.round(h.tot.kcal).toLocaleString('en-IN')}</SvgText>
        <SvgText x="64" y="80" textAnchor="middle" fontSize="9" fontFamily="SpaceGrotesk_700Bold" fill={C.muted}>{`of ${h.target.kcal.toLocaleString('en-IN')}`}</SvgText>
      </Svg>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  // the right padding is 4 smaller so the tiles' shadows end where the left edge begins
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 32, gap: 16 },
  date: { fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 2 },
  title: { fontFamily: 'display', fontSize: 34, color: C.text, letterSpacing: -1, lineHeight: 40 },
  col: { flex: 1, minWidth: 0 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  logBtn: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  donutTile: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  legend: { flex: 1, minWidth: 0, gap: 6 },
  legendTitle: { fontFamily: 'display', fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  swatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 2, borderColor: C.line },
  legendName: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: '700', color: C.text },
  legendVal: { fontSize: 12, fontWeight: '800', color: C.text },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flame: { width: 36, height: 36, borderRadius: 18, backgroundColor: TILE.orange, borderWidth: 2, borderColor: TILE_INK, alignItems: 'center', justifyContent: 'center' },
  bigInk: { fontFamily: 'display', fontSize: 32, fontWeight: '800', color: TILE_INK, letterSpacing: -1.5 },
  dots: { flexDirection: 'row', gap: 3, marginTop: 6 },
  dot: { flex: 1, aspectRatio: 1, borderRadius: 99, borderWidth: 2, borderColor: TILE_INK, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  dotToday: { borderWidth: BORDER + 0.5 },
  dotText: { fontSize: 8, fontWeight: '800', color: TILE_INK },
  next: { padding: 16, gap: 2 },
  nextDish: { fontFamily: 'display', fontSize: 21, fontWeight: '800', color: TILE_INK, letterSpacing: -0.5 },
  goWrap: { marginTop: 10 },
  go: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  goText: { color: TILE.yellow, fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  half: { width: '48.5%' },
  tile: { padding: 12, gap: 2, minHeight: 100, justifyContent: 'center' },
  tag: { fontSize: 11, fontWeight: '800', color: TILE_INK },
  tagSoft: { fontSize: 12, fontWeight: '700', color: TILE_INK, opacity: 0.75 },
  dish: { fontFamily: 'display', fontSize: 15, fontWeight: '800', color: TILE_INK },
  big: { fontFamily: 'display', fontSize: 32, fontWeight: '800', color: C.text, letterSpacing: -1.5 },
  muted: { fontSize: 12, fontWeight: '700', color: C.muted },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  h2: { fontFamily: 'display', fontSize: 22, fontWeight: '800', color: C.text, flexShrink: 1 },
  link: { fontSize: 14, fontWeight: '800', color: C.text, textDecorationLine: 'underline' },
  list: { paddingHorizontal: 14, paddingVertical: 6 },
  day: { fontFamily: 'display', fontSize: 14, fontWeight: '800', color: C.text, paddingTop: 10, paddingBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58 },
  rowLine: { borderTopWidth: 2, borderTopColor: C.line },
  time: { width: 66, fontSize: 12, fontWeight: '800', color: C.text },
  rowSlot: { fontSize: 12, fontWeight: '700', color: C.muted },
  rowDish: { fontFamily: 'display', fontSize: 14, fontWeight: '800', color: C.text },
  soon: { fontSize: 12, fontWeight: '800', color: C.text },
}));
