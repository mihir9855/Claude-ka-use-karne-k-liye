import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { entryLabel, type SlotId } from '../../core/diary';
import { Icon } from '../Icon';
import { slotLabel } from '../slots';
import { Text } from '../Text';
import { C, RADIUS, themed } from '../theme';
import { clock, dayLabel, inText, slotClock, type Home } from './useHome';

const BOWLS: { slot: SlotId; x: number; y: number }[] = [
  { slot: 'b', x: 150, y: 52 },
  { slot: 'm', x: 252, y: 115 },
  { slot: 'l', x: 215, y: 228 },
  { slot: 's', x: 85, y: 228 },
  { slot: 'd', x: 48, y: 115 },
];
const FOOD = ['#E8A33A', '#7FB069', '#D1495B', '#C97A1B', '#9B5DE5'];

export function ThaliHome({ h, go }: { h: Home; go: (t: 'chat' | 'menu') => void }) {
  const next = h.nextRow;
  const opt = h.nextOpt;
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View>
        <Text style={s.small} numberOfLines={1}>{h.now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <Text style={s.title} numberOfLines={1}>{h.name === 'Me' ? 'Your thali today' : `${h.name}'s thali today`}</Text>
      </View>

      <View style={{ aspectRatio: 300 / 290 }}>
        <Svg width="100%" height="100%" viewBox="0 0 300 290">
          <Defs>
            <RadialGradient id="steel" cx="40%" cy="35%" r="70%">
              <Stop offset="0" stopColor="#F1F1EE" />
              <Stop offset="1" stopColor="#A9A9A4" />
            </RadialGradient>
            <RadialGradient id="bowl" cx="40%" cy="35%" r="70%">
              <Stop offset="0" stopColor="#E6E6E2" />
              <Stop offset="1" stopColor="#8F8F8A" />
            </RadialGradient>
          </Defs>
          <Circle cx="150" cy="145" r="138" fill="url(#steel)" />
          <Circle cx="150" cy="145" r="124" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="2" />
          <Circle cx="150" cy="145" r="46" fill="#24170F" fillOpacity="0.92" />
          <SvgText x="150" y="148" textAnchor="middle" fontSize="30" fontWeight="800" fill="#F6E9D2">{Math.round(h.tot.kcal).toLocaleString('en-IN')}</SvgText>
          <SvgText x="150" y="166" textAnchor="middle" fontSize="10" fill="#F6E9D2" fillOpacity="0.75">{`of ${h.target.kcal.toLocaleString('en-IN')} kcal`}</SvgText>
          {BOWLS.map((b, i) => {
            const row = h.menu.find((m) => m.slot === b.slot);
            const eaten = !!row?.eaten;
            const isNext = row === next;
            return (
              <G key={b.slot}>
                <Circle cx={b.x} cy={b.y} r="32" fill="url(#bowl)" />
                {eaten ? (
                  <>
                    <Circle cx={b.x} cy={b.y} r="25" fill={FOOD[i % FOOD.length]} />
                    <Circle cx={b.x - 8} cy={b.y - 4} r="6" fill="#FFFFFF" fillOpacity="0.45" />
                  </>
                ) : (
                  <Circle cx={b.x} cy={b.y} r="25" fill={isNext ? '#F2B33D' : 'none'} stroke={isNext ? '#24170F' : '#6F6F6A'} strokeWidth={isNext ? 2.5 : 2} strokeDasharray={isNext ? undefined : '4 4'} />
                )}
                <SvgText x={b.x} y={b.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#24170F">{slotClock(b.slot).replace(' am', '').replace(' pm', '')}</SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      <View style={s.next}>
        <Text style={s.nextTag} numberOfLines={1}>{next ? `Next bowl · ${slotLabel(next.slot)}` : 'All bowls done'}</Text>
        {next && opt ? (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel={`${opt.name}. Tap for another option`} onPress={() => h.cycle(next.slot)}>
              <Text style={s.nextDish} numberOfLines={1}>{opt.name}</Text>
              <Text style={s.nextMeta} numberOfLines={1}>{[opt.kcal != null ? `${opt.kcal} kcal` : '', opt.why[0]?.text].filter(Boolean).join(' · ')}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${opt.name}`} onPress={() => h.eat(next.slot)} style={s.eat}>
              <Icon name="check" size={18} color={C.accent} width={3} />
              <Text style={s.eatText} numberOfLines={1}>Put it in the bowl</Text>
            </Pressable>
          </>
        ) : (
          <Text style={s.nextMeta} numberOfLines={1}>{h.logged.length ? 'Nothing left today' : 'Log your first meal in Chat'}</Text>
        )}
      </View>

      <View style={s.stats}>
        <Text style={s.small} numberOfLines={1}>{`Protein ${Math.round(h.tot.protein)} of ${h.target.protein} g`}</Text>
        <Text style={s.small} numberOfLines={1}>{`${h.days} day streak`}</Text>
      </View>

      <View style={s.head}>
        <Text style={s.h2} numberOfLines={1}>Coming up</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="See the whole week" onPress={() => go('menu')} hitSlop={10}>
          <Text style={s.link} numberOfLines={1}>Whole week</Text>
        </Pressable>
      </View>
      {h.upcoming.map((u, i) => (
        <View key={`${u.date}${u.slot}`}>
          {(i === 0 || h.upcoming[i - 1].date !== u.date) && <Text style={s.day}>{dayLabel(u.date, h.today)}</Text>}
          <View style={s.row}>
            <Text style={s.time} numberOfLines={1}>{clock(u.at)}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.small} numberOfLines={1}>{slotLabel(u.slot)}</Text>
              <Text style={s.dish} numberOfLines={1}>{u.dish.name}</Text>
            </View>
            {i === 0 && <Text style={s.soon} numberOfLines={1}>{inText(u.at.getTime() - Date.now())}</Text>}
          </View>
        </View>
      ))}
      {h.menu.filter((m) => m.eaten).length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="See what you ate" onPress={() => go('chat')}>
          <Text style={s.link} numberOfLines={1}>{`Eaten today: ${h.menu.filter((m) => m.eaten).flatMap((m) => m.eaten!.map(entryLabel)).join(', ')}`}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  page: { padding: 20, gap: 14, paddingBottom: 32 },
  small: { fontSize: 12, color: C.muted, fontWeight: '600', flexShrink: 1 },
  title: { fontFamily: 'display', fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  next: { backgroundColor: C.hero, borderRadius: RADIUS.lg, padding: 16, gap: 4 },
  nextTag: { fontSize: 12, fontWeight: '800', color: C.onHero, opacity: 0.7 },
  nextDish: { fontFamily: 'display', fontSize: 22, fontWeight: '800', color: C.onHero, letterSpacing: -0.4 },
  nextMeta: { fontSize: 13, fontWeight: '600', color: C.onHero, opacity: 0.75 },
  eat: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: RADIUS.pill, backgroundColor: C.onHero },
  eatText: { fontSize: 15, fontWeight: '800', color: C.accent },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 },
  h2: { fontFamily: 'display', fontSize: 22, fontWeight: '800', color: C.text },
  link: { fontSize: 13, fontWeight: '700', color: C.accent },
  day: { fontFamily: 'display', fontSize: 16, fontWeight: '700', color: C.text, paddingTop: 10, paddingBottom: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, borderBottomWidth: 1, borderBottomColor: C.line },
  time: { width: 62, fontSize: 12, fontWeight: '600', color: C.muted },
  dish: { fontFamily: 'display', fontSize: 17, fontWeight: '700', color: C.text },
  soon: { fontSize: 12, fontWeight: '700', color: C.accent },
}));
