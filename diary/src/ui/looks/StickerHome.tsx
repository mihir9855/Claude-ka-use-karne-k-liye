import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SLOT_LABEL, entryLabel } from '../../core/diary';
import { Text } from '../Text';
import { C, themed } from '../theme';
import { dayLabel, slotClock, type Home } from './useHome';

const TILE = ['#7BE0A4', '#B9A6FF', '#FFFFFF', '#FF9B6B', '#8FD3FF'];
const TILT = ['1deg', '-0.8deg', '0.8deg', '-1deg', '0.6deg'];

export function StickerHome({ h, go }: { h: Home; go: (t: 'chat' | 'menu') => void }) {
  const next = h.nextRow;
  const opt = h.nextOpt;
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>{"What's"}</Text>
      <Text style={[s.title, { marginTop: -8 }]} numberOfLines={1}>{`on ${h.name === 'Me' ? 'your' : `${h.name}'s`} plate?`}</Text>

      <View style={s.bento}>
        <View style={[s.stk, s.big]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.tag} numberOfLines={1}>{next ? `NEXT · ${slotClock(next.slot).toUpperCase()}` : 'ALL DONE'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`${opt?.name ?? ''}. Tap for another option`} onPress={() => next && h.cycle(next.slot)}>
              <Text style={s.bigDish} numberOfLines={1}>{opt ? opt.name : h.logged.length ? 'Nothing left' : 'Log a meal'}</Text>
            </Pressable>
          </View>
          {next && opt && (
            <Pressable accessibilityRole="button" accessibilityLabel={`I ate ${opt.name}`} onPress={() => h.eat(next.slot)} style={s.go}>
              <Text style={s.goText} numberOfLines={1}>I ate it</Text>
            </Pressable>
          )}
        </View>

        {h.menu.filter((m) => m !== next).map((m, i) => {
          const o = h.optOf(m.slot);
          const eaten = !!m.eaten;
          return (
            <Pressable
              key={m.slot}
              accessibilityRole="button"
              accessibilityLabel={`${SLOT_LABEL[m.slot]}: ${eaten ? m.eaten!.map(entryLabel).join(', ') : o?.name ?? ''}`}
              onPress={() => (eaten ? go('chat') : h.cycle(m.slot))}
              style={[s.stk, s.half, { backgroundColor: eaten ? '#7BE0A4' : TILE[i % TILE.length], transform: [{ rotate: TILT[i % TILT.length] }] }]}
            >
              <Text style={s.tag} numberOfLines={1}>{`${slotClock(m.slot).toUpperCase()} ${SLOT_LABEL[m.slot].toUpperCase()}`}</Text>
              <Text style={s.dish} numberOfLines={1}>{eaten ? m.eaten!.map(entryLabel).join(', ') : o?.name ?? '-'}</Text>
              <Text style={s.tag} numberOfLines={1}>{eaten ? `done · ${Math.round(m.eaten!.reduce((a, e) => a + (e.kcal ?? 0), 0))} kcal` : o?.kcal != null ? `${o.kcal} kcal` : ''}</Text>
            </Pressable>
          );
        })}

        <View style={[s.stk, s.wide]}>
          <Text style={s.bigDish} numberOfLines={1}>{`${Math.round(h.tot.kcal)} kcal`}</Text>
          <Text style={s.tag} numberOfLines={1}>{`${h.left >= 0 ? `${Math.round(h.left)} left` : `${Math.round(-h.left)} over`} · ${h.days} day streak`}</Text>
        </View>
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
  page: { padding: 20, gap: 14, paddingBottom: 32 },
  title: { fontFamily: 'display', fontSize: 38, fontWeight: '800', color: C.text, letterSpacing: -1.6, lineHeight: 40 },
  bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stk: { borderWidth: 3, borderColor: '#14110E', borderRadius: 20, padding: 12, gap: 2, minWidth: 0, backgroundColor: '#FFFFFF' },
  big: { width: '100%', backgroundColor: '#FFE14A', flexDirection: 'row', alignItems: 'center', gap: 10, transform: [{ rotate: '-1.2deg' }] },
  half: { width: '47%', flexGrow: 1 },
  wide: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { fontSize: 10, fontWeight: '800', color: '#14110E', opacity: 0.8 },
  dish: { fontFamily: 'display', fontSize: 17, fontWeight: '800', color: '#14110E' },
  bigDish: { fontFamily: 'display', fontSize: 22, fontWeight: '800', color: '#14110E' },
  go: { backgroundColor: '#14110E', borderRadius: 999, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  goText: { color: '#FFE14A', fontSize: 14, fontWeight: '800' },
  h2: { fontFamily: 'display', fontSize: 24, fontWeight: '800', color: C.text, marginTop: 6 },
  day: { fontFamily: 'display', fontSize: 16, fontWeight: '800', color: C.text, paddingTop: 8 },
  upRow: { flexDirection: 'row', gap: 10, minHeight: 40, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#14110E' },
  upT: { width: 66, fontSize: 12, fontWeight: '800', color: C.text },
  upD: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', color: C.text },
}));
