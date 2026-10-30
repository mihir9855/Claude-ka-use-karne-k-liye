import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { SLOT_LABEL, SLOT_ORDER, type SlotId } from '../../core/diary';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { C, RADIUS, themed } from '../theme';
import { dayLabel, greeting, slotClock, type Home } from './useHome';

/** Sky colours for the hour: night, dawn, day, dusk. */
function sky(hour: number): [string, string, string] {
  if (hour < 5 || hour >= 20) return ['#0B1026', '#1B1A4B', '#3A2A6B'];
  if (hour < 8) return ['#2B3A67', '#C06C84', '#F6A23A'];
  if (hour < 16) return ['#2E5BA8', '#4F86C6', '#9CC9EE'];
  return ['#1B1A4B', '#5B2A7A', '#E4572E'];
}

const CX = 150;
const CY = 170;
const R = 130;
const at = (h: number) => {
  const t = Math.max(0, Math.min(1, (h - 6) / 16));
  return { x: CX - R * Math.cos(Math.PI * t), y: CY - R * Math.sin(Math.PI * t) };
};
const hourOf = (s: SlotId) => {
  const [hh, mm] = { b: [8, 30], m: [11, 0], l: [13, 30], s: [17, 0], d: [20, 30] }[s];
  return hh + mm / 60;
};

export function SunHome({ h, go }: { h: Home; go: (t: 'chat' | 'menu') => void }) {
  const hour = h.now.getHours() + h.now.getMinutes() / 60;
  const [c1, c2, c3] = sky(hour);
  const sun = at(hour);
  const next = h.nextRow;
  const opt = h.nextOpt;
  return (
    <View style={{ flex: 1, backgroundColor: c1 }}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="0.5" stopColor={c2} />
            <Stop offset="1" stopColor={c3} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#sky)" />
      </Svg>
      <ScrollView contentContainerStyle={s.page}>
        <View>
          <Text style={s.hi} numberOfLines={1}>{greeting(h.now.getHours())}</Text>
          <Text style={s.small} numberOfLines={1}>{h.now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        <View style={{ aspectRatio: 300 / 200 }}>
          <Svg width="100%" height="100%" viewBox="0 0 300 200">
            <Path d={`M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="#FFF4E2" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 6" />
            <Line x1="5" y1={CY} x2="295" y2={CY} stroke="#FFF4E2" strokeOpacity="0.5" strokeWidth="2" />
            {SLOT_ORDER.map((slot) => {
              const p = at(hourOf(slot));
              const row = h.menu.find((m) => m.slot === slot);
              const eaten = !!row?.eaten;
              return (
                <G key={slot}>
                  <Circle cx={p.x} cy={p.y} r="9" fill={eaten ? '#FFF4E2' : 'none'} stroke="#FFF4E2" strokeWidth="2.5" />
                  <SvgText x={p.x} y={p.y - 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="#FFF4E2">{slotClock(slot).replace(' am', '').replace(' pm', '')}</SvgText>
                </G>
              );
            })}
            <Circle cx={sun.x} cy={sun.y} r="21" fill="#FFC857" fillOpacity="0.25" />
            <Circle cx={sun.x} cy={sun.y} r="12" fill="#FFC857" />
            <SvgText x="150" y="140" textAnchor="middle" fontSize="38" fontWeight="800" fill="#FFF4E2">{Math.round(h.tot.kcal).toLocaleString('en-IN')}</SvgText>
            <SvgText x="150" y="158" textAnchor="middle" fontSize="11" fill="#FFF4E2" fillOpacity="0.85">{`of ${h.target.kcal.toLocaleString('en-IN')} kcal`}</SvgText>
          </Svg>
        </View>

        <View style={s.nextc}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.nextTag} numberOfLines={1}>{next ? `Next · ${slotClock(next.slot)} · ${SLOT_LABEL[next.slot]}` : 'All meals done'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`${opt?.name ?? ''}. Tap for another option`} onPress={() => next && h.cycle(next.slot)}>
              <Text style={s.nextDish} numberOfLines={1}>{opt ? opt.name : h.logged.length ? 'Nothing left today' : 'Log your first meal'}</Text>
            </Pressable>
          </View>
          {next && opt && (
            <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${opt.name}`} onPress={() => h.eat(next.slot)} style={s.tick}>
              <Icon name="check" size={20} color={C.onPrimary} width={3} />
            </Pressable>
          )}
        </View>
        <Text style={s.small} numberOfLines={1}>{`Protein ${Math.round(h.tot.protein)} of ${h.target.protein} g · ${h.days} day streak`}</Text>

        <View style={s.panel}>
          <Text style={s.h2} numberOfLines={1}>Coming up</Text>
          {h.upcoming.map((u, i) => (
            <View key={`${u.date}${u.slot}`}>
              {(i === 0 || h.upcoming[i - 1].date !== u.date) && <Text style={s.day}>{dayLabel(u.date, h.today)}</Text>}
              <Pressable accessibilityRole="button" accessibilityLabel={`${SLOT_LABEL[u.slot]}: ${u.dish.name}`} onPress={() => go('menu')} style={s.row}>
                <Text style={s.time} numberOfLines={1}>{u.at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
                <Text style={s.dish} numberOfLines={1}>{`${SLOT_LABEL[u.slot]} · ${u.dish.name}`}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  page: { padding: 20, gap: 14, paddingBottom: 32 },
  hi: { fontFamily: 'display', fontSize: 34, fontWeight: '700', color: C.text, lineHeight: 38 },
  small: { fontSize: 12, color: C.text, opacity: 0.8, fontWeight: '600' },
  nextc: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(20,10,40,0.45)', borderRadius: RADIUS.lg, padding: 14 },
  nextTag: { fontSize: 12, fontWeight: '600', color: C.text, opacity: 0.8 },
  nextDish: { fontFamily: 'display', fontSize: 22, fontWeight: '700', color: C.text },
  tick: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: 'rgba(20,10,40,0.35)', borderRadius: RADIUS.lg, padding: 14, gap: 2 },
  h2: { fontFamily: 'display', fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 },
  day: { fontSize: 13, fontWeight: '800', color: C.accent, paddingTop: 8 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', minHeight: 40 },
  time: { width: 66, fontSize: 12, fontWeight: '700', color: C.text, opacity: 0.75 },
  dish: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', color: C.text },
}));
