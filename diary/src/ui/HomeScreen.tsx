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
        <Text style={s.legendTitle} numberOfLines={1}>Today by meal</Text>
        <View style={s.donutBox}>
          <Donut h={h} />
        </View>
        <View style={s.chips}>
          {SLOT_ORDER.map((slot) => {
            const kcal = Math.round(h.menu.find((m) => m.slot === slot)?.eaten?.reduce((a, e) => a + (e.kcal ?? 0), 0) ?? 0);
            return (
              <View key={slot} style={[s.legendChip, { backgroundColor: kcal > 0 ? SLOT_COLOR[slot] : '#FFFFFF' }]}>
                <View style={[s.swatch, { backgroundColor: SLOT_COLOR[slot] }]} />
                <Text style={s.legendName} numberOfLines={1}>{SLOT_LABEL[slot]}</Text>
                <Text style={s.legendVal} numberOfLines={1}>{kcal > 0 ? String(kcal) : '-'}</Text>
              </View>
            );
          })}
        </View>
      </Tile>

      <View style={s.stack}>
        {others.map((m, i) => {
          const o = h.optOf(m.slot);
          const eaten = !!m.eaten;
          const bg = eaten ? TILE.green : TILE_CYCLE[(i + 1) % TILE_CYCLE.length];
          const kcal = eaten ? Math.round(m.eaten!.reduce((a, e) => a + (e.kcal ?? 0), 0)) : o?.kcal;
          return (
            <Tile
              key={m.slot}
              bg={bg}
              onPress={() => (eaten ? go('chat') : h.cycle(m.slot))}
              label={`${SLOT_LABEL[m.slot]}: ${eaten ? m.eaten!.map(entryLabel).join(', ') : o?.name ?? ''}`}
              style={s.meal}
            >
              <View style={s.col}>
                <Text style={s.tag} numberOfLines={1}>{`${SLOT_LABEL[m.slot].toUpperCase()} · ${slotClock(m.slot).toUpperCase()}`}</Text>
                <Text style={s.dish} numberOfLines={1}>{eaten ? m.eaten!.map(entryLabel).join(', ') : o?.name ?? '-'}</Text>
              </View>
              <View style={s.mealEnd}>
                {eaten && (
                  <View style={s.check}>
                    <Icon name="check" size={16} color={TILE.green} width={3.4} />
                  </View>
                )}
                <Text style={s.mealKcal} numberOfLines={1}>{kcal != null ? `${kcal}` : ''}</Text>
                <Text style={s.tagSoft} numberOfLines={1}>{kcal != null ? 'kcal' : ''}</Text>
              </View>
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

const SLOT_KEY: Record<SlotId, 'yellow' | 'orange' | 'green' | 'blue' | 'lilac'> = { b: 'yellow', m: 'orange', l: 'green', s: 'blue', d: 'lilac' };
/** read when drawn, so it follows the day and night tile colours */
const SLOT_COLOR = new Proxy({} as Record<SlotId, string>, { get: (_t, k: string) => TILE[SLOT_KEY[k as SlotId]] });

/** Today's calories as a big sticker ring: one outlined slice per meal eaten, a hard shadow, and a yellow centre. */
function Donut({ h }: { h: ReturnType<typeof useHome> }) {
  const R = 78;
  const W = 46;
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
  const left = Math.round(h.target.kcal - h.tot.kcal);
  const C0 = 125;
  const ring = (dx: number, color: string, width: number, extra?: object) => <Circle cx={C0 + dx} cy={C0 + dx} r={R} fill="none" stroke={color} strokeWidth={width} {...extra} />;
  return (
    <View style={{ width: '100%', aspectRatio: 1, maxWidth: 270 }}>
      <Svg width="100%" height="100%" viewBox="0 0 250 250">
        {/* hard shadow */}
        {ring(7, C.shadow, W + 6)}
        {/* empty track */}
        {ring(0, C.surface, W)}
        <Circle cx={C0} cy={C0} r={R + W / 2} fill="none" stroke={C.line} strokeWidth="3.5" />
        <Circle cx={C0} cy={C0} r={R - W / 2} fill="none" stroke={C.line} strokeWidth="3.5" />
        {segs.map((g) => ring(0, C.line, W + 3, { key: `i${g.slot}`, strokeDasharray: `${Math.min(LEN, g.len + 4)} ${LEN}`, strokeDashoffset: -g.start + 2, transform: `rotate(-90 ${C0} ${C0})` }))}
        {segs.map((g) => ring(0, SLOT_COLOR[g.slot], W - 4, { key: `c${g.slot}`, strokeDasharray: `${Math.max(0, g.len - 1)} ${LEN}`, strokeDashoffset: -g.start, transform: `rotate(-90 ${C0} ${C0})` }))}
        {/* yellow sticker in the middle */}
        <Circle cx={C0 + 4} cy={C0 + 4} r="47" fill={C.shadow} />
        <Circle cx={C0} cy={C0} r="47" fill={TILE.yellow} stroke={C.line} strokeWidth="3.5" />
        <SvgText x={C0} y={C0 + 2} textAnchor="middle" fontSize="27" fontFamily={displayFonts().bold} fill={TILE_INK}>{Math.round(h.tot.kcal).toLocaleString('en-IN')}</SvgText>
        <SvgText x={C0} y={C0 + 19} textAnchor="middle" fontSize="11" fontFamily="SpaceGrotesk_700Bold" fill={TILE_INK}>{left >= 0 ? `${left.toLocaleString('en-IN')} left` : `${-left} over`}</SvgText>
      </Svg>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  // the right padding is 4 smaller so the tiles' shadows end where the left edge begins
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, paddingBottom: 32, gap: 16 },
  date: { fontSize: 13, fontWeight: '700', color: C.muted, marginBottom: 2 },
  title: { fontFamily: 'script', fontSize: 44, color: C.text, lineHeight: 57 },
  col: { flex: 1, minWidth: 0 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  logBtn: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  donutTile: { padding: 14, gap: 10 },
  donutBox: { alignItems: 'center', paddingVertical: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, minHeight: 36, borderRadius: RADIUS.pill, borderWidth: 2, borderColor: C.line, flexGrow: 1, flexBasis: '45%' },
  legendTitle: { fontFamily: 'script', fontSize: 26, lineHeight: 30, fontWeight: '800', color: C.text, marginBottom: 2 },
  swatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 2, borderColor: TILE_INK },
  legendName: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: '700', color: TILE_INK },
  legendVal: { fontSize: 12, fontWeight: '800', color: TILE_INK },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flame: { width: 36, height: 36, borderRadius: 18, backgroundColor: TILE.orange, borderWidth: 2, borderColor: TILE_INK, alignItems: 'center', justifyContent: 'center' },
  bigInk: { fontFamily: 'display', fontSize: 40, fontWeight: '800', color: TILE_INK, letterSpacing: -1.5 },
  dots: { flexDirection: 'row', gap: 3, marginTop: 6 },
  dot: { flex: 1, aspectRatio: 1, borderRadius: 99, borderWidth: 2, borderColor: TILE_INK, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  dotToday: { borderWidth: BORDER + 0.5 },
  dotText: { fontSize: 8, fontWeight: '800', color: TILE_INK },
  next: { padding: 16, gap: 2 },
  nextDish: { fontFamily: 'script', fontSize: 38, lineHeight: 44, fontWeight: '800', color: TILE_INK, letterSpacing: -0.5 },
  goWrap: { marginTop: 10 },
  go: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  goText: { color: TILE.yellow, fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  half: { width: '48.5%' },
  tile: { padding: 14, gap: 4, justifyContent: 'center' },
  tag: { fontSize: 12, fontWeight: '800', color: TILE_INK },
  tagSoft: { fontSize: 13, fontWeight: '700', color: TILE_INK, opacity: 0.75 },
  stack: { gap: 16 },
  meal: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 76 },
  mealEnd: { alignItems: 'flex-end', minWidth: 52 },
  mealKcal: { fontFamily: 'display', fontSize: 20, color: TILE_INK },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: TILE_INK, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  dish: { fontFamily: 'script', fontSize: 32, lineHeight: 38, fontWeight: '800', color: TILE_INK },
  big: { fontFamily: 'display', fontSize: 40, fontWeight: '800', color: C.text, letterSpacing: -1.5 },
  muted: { fontSize: 13, fontWeight: '700', color: C.muted },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  h2: { fontFamily: 'script', fontSize: 38, fontWeight: '800', color: C.text, flexShrink: 1 },
  link: { fontSize: 14, fontWeight: '800', color: C.text, textDecorationLine: 'underline' },
  list: { paddingHorizontal: 14, paddingVertical: 6 },
  day: { fontFamily: 'script', fontSize: 26, lineHeight: 30, fontWeight: '800', color: C.text, paddingTop: 10, paddingBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58 },
  rowLine: { borderTopWidth: 2, borderTopColor: C.line },
  time: { width: 66, fontSize: 12, fontWeight: '800', color: C.text },
  rowSlot: { fontSize: 12, fontWeight: '700', color: C.muted },
  rowDish: { fontFamily: 'script', fontSize: 24, lineHeight: 28, fontWeight: '800', color: C.text },
  soon: { fontSize: 12, fontWeight: '800', color: C.text },
}));
