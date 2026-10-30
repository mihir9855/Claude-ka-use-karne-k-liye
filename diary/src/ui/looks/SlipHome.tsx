import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { entryLabel } from '../../core/diary';
import { SLOT_LABEL } from '../../core/diary';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { C, themed } from '../theme';
import { dayLabel, slotClock, type Home } from './useHome';

const DOTS = '. '.repeat(60);
const BARS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 4, 1, 2, 1, 3, 1];

export function SlipHome({ h, go }: { h: Home; go: (t: 'chat' | 'menu') => void }) {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.slip}>
        <Text style={s.brand} numberOfLines={1}>KHANA DIARY</Text>
        <Text style={s.sub} numberOfLines={1}>{`Order slip · ${h.now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · Table: ${h.name}`}</Text>
        <Text style={s.cut} numberOfLines={1}>{'- '.repeat(60)}</Text>

        {h.menu.map((m) => {
          const opt = h.optOf(m.slot);
          const label = `${slotClock(m.slot).replace(' am', '').replace(' pm', '')} ${SLOT_LABEL[m.slot].toUpperCase()}`;
          if (m.eaten) {
            return (
              <Pressable key={m.slot} accessibilityRole="button" accessibilityLabel={`${SLOT_LABEL[m.slot]}: ${m.eaten.map(entryLabel).join(', ')}`} onPress={() => go('chat')} style={s.row}>
                <Text style={s.l} numberOfLines={1}>{label}</Text>
                <Text style={s.dots} numberOfLines={1}>{DOTS}</Text>
                <Text style={s.r} numberOfLines={1}>{m.eaten.map(entryLabel).join(', ')}</Text>
                <Text style={s.stamp}>EATEN</Text>
              </Pressable>
            );
          }
          return (
            <Pressable key={m.slot} accessibilityRole="button" accessibilityLabel={`${SLOT_LABEL[m.slot]}: ${opt?.name ?? ''}. Tap for another option`} onPress={() => h.cycle(m.slot)} style={s.row}>
              <Text style={s.l} numberOfLines={1}>{label}</Text>
              <Text style={s.dots} numberOfLines={1}>{DOTS}</Text>
              <Text style={[s.r, s.todo]} numberOfLines={1}>{opt?.name ?? '-'}</Text>
              {opt && (
                <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${opt.name}`} onPress={() => h.eat(m.slot)} hitSlop={6} style={s.tick}>
                  <Icon name="check" size={14} color={C.accent} width={3} />
                </Pressable>
              )}
            </Pressable>
          );
        })}

        <Text style={s.cut} numberOfLines={1}>{'- '.repeat(60)}</Text>
        <View style={s.tot}>
          <Text style={s.totL} numberOfLines={1}>KCAL SO FAR</Text>
          <Text style={s.totR} numberOfLines={1}>{`${Math.round(h.tot.kcal)} / ${h.target.kcal.toLocaleString('en-IN')}`}</Text>
        </View>
        <View style={s.tot}>
          <Text style={s.totL} numberOfLines={1}>PROTEIN</Text>
          <Text style={s.totR} numberOfLines={1}>{`${Math.round(h.tot.protein)} / ${h.target.protein} g`}</Text>
        </View>
        <View style={s.tot}>
          <Text style={s.totL} numberOfLines={1}>STREAK</Text>
          <Text style={s.totR} numberOfLines={1}>{`${h.days} ${h.days === 1 ? 'day' : 'days'}`}</Text>
        </View>
        <View style={s.bars}>
          {BARS.map((w, i) => (
            <View key={i} style={{ width: w * 2, height: 26, backgroundColor: C.text, marginRight: 2 }} />
          ))}
        </View>
        <Text style={s.cut} numberOfLines={1}>{'- '.repeat(60)}</Text>
        <Text style={s.foot} numberOfLines={1}>{h.nextRow && h.nextOpt ? `NEXT: ${h.nextOpt.name.toUpperCase()} · TAP TICK WHEN EATEN` : 'ALL ORDERS DONE'}</Text>
      </View>

      <Text style={s.h2} numberOfLines={1}>Coming up</Text>
      {h.upcoming.map((u, i) => (
        <View key={`${u.date}${u.slot}`}>
          {(i === 0 || h.upcoming[i - 1].date !== u.date) && <Text style={s.day}>{dayLabel(u.date, h.today)}</Text>}
          <View style={s.upRow}>
            <Text style={s.upT} numberOfLines={1}>{u.at.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
            <Text style={s.upD} numberOfLines={1}>{`${SLOT_LABEL[u.slot]} · ${u.dish.name}`}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  page: { padding: 16, gap: 14, paddingBottom: 32 },
  slip: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, padding: 18, gap: 6 },
  brand: { fontFamily: 'display', fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center', letterSpacing: 2 },
  sub: { fontFamily: 'display', fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center' },
  cut: { color: C.muted, fontSize: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  l: { fontFamily: 'display', fontSize: 12, fontWeight: '600', color: C.text, flexShrink: 0 },
  dots: { flex: 1, minWidth: 6, color: C.muted, fontSize: 12, overflow: 'hidden' },
  r: { fontFamily: 'display', fontSize: 12, fontWeight: '700', color: C.text, flexShrink: 1, maxWidth: '48%' },
  todo: { opacity: 0.6, fontWeight: '600' },
  stamp: { position: 'absolute', left: '40%', top: 6, borderWidth: 2, borderColor: C.accent, color: C.accent, fontFamily: 'display', fontWeight: '700', fontSize: 11, paddingHorizontal: 5, transform: [{ rotate: '-10deg' }], backgroundColor: C.card },
  tick: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  tot: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  totL: { fontFamily: 'display', fontSize: 13, fontWeight: '600', color: C.text },
  totR: { fontFamily: 'display', fontSize: 13, fontWeight: '700', color: C.text },
  bars: { flexDirection: 'row', marginTop: 10, overflow: 'hidden' },
  foot: { fontFamily: 'display', fontSize: 10, fontWeight: '600', color: C.muted, textAlign: 'center' },
  h2: { fontFamily: 'display', fontSize: 18, fontWeight: '700', color: C.text, marginTop: 6 },
  day: { fontFamily: 'display', fontSize: 13, fontWeight: '700', color: C.accent, paddingTop: 8 },
  upRow: { flexDirection: 'row', gap: 10, minHeight: 36, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.line },
  upT: { width: 66, fontFamily: 'display', fontSize: 12, fontWeight: '600', color: C.muted },
  upD: { flex: 1, minWidth: 0, fontFamily: 'display', fontSize: 13, fontWeight: '600', color: C.text },
}));
