import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SLOT_LABEL, SLOT_ORDER, dayMenu, daysAgo, entryLabel, hints, nextSlot, readMessage, totalsFor, ymd, type Entry, type SlotId } from '../core/diary';
import { readListCommand } from '../core/lists';
import { personName, useActive, useStore } from '../state/store';
import { Icon } from './Icon';
import { Muted, Tile } from './kit';
import { SLOT_ICON_ID, slotLabel } from './slots';
import { Text, TextInput } from './Text';
import { BORDER, C, RADIUS, TILE, TILE_INK, themed } from './theme';

const SHOWN_DAYS = 3;

interface Batch {
  id: string;
  slot: SlotId;
  at: number;
  entries: Entry[];
}

const atOf = (e: Entry) => e.at ?? new Date(`${e.date}T12:00:00`).getTime();
const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

function dayName(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === daysAgo(1)) return 'Yesterday';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** The reply the app gives to one logged message. */
function reply(batch: Batch, dayTotal: { kcal: number; protein: number }): string {
  const known = batch.entries.filter((e) => e.kcal != null);
  const unknown = batch.entries.filter((e) => e.kcal == null);
  const kcal = known.reduce((a, e) => a + (e.kcal ?? 0), 0);
  const prot = known.reduce((a, e) => a + (e.protein ?? 0), 0);
  let out = known.length ? `Noted. That is ${kcal} kcal and ${prot} g protein.` : 'Noted.';
  if (unknown.length) out += ` I do not have numbers for ${unknown.map(entryLabel).join(', ')}, so I left ${unknown.length === 1 ? 'it' : 'them'} out of the count.`;
  out += ` Today so far: ${Math.round(dayTotal.kcal)} kcal, ${Math.round(dayTotal.protein)} g protein.`;
  out += ` I will remember ${batch.entries.length > 1 ? 'this meal' : batch.entries[0].name} for ${SLOT_LABEL[batch.slot].toLowerCase()}.`;
  return out;
}

export function ChatScreen() {
  const { person, target, entries } = useActive();
  const persons = useStore((s) => s.persons);
  const setActive = useStore((s) => s.setActive);
  const add = useStore((s) => s.add);
  const addItems = useStore((s) => s.addItems);
  const addListItems = useStore((s) => s.addListItems);
  const [listNote, setListNote] = useState('');
  const removeBatch = useStore((s) => s.removeBatch);
  const [slot, setSlot] = useState<SlotId>(() => nextSlot(entries));
  const [text, setText] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, number>>({});
  const scroll = useRef<ScrollViewInstance>(null);
  const today = ymd(new Date());

  const days = useMemo(() => {
    const keep = new Set(Array.from({ length: SHOWN_DAYS }, (_, i) => daysAgo(i)));
    const by = new Map<string, Batch>();
    for (const e of entries) {
      if (!keep.has(e.date)) continue;
      const id = e.batch ?? `${e.date}-${e.slot}`;
      const b = by.get(id) ?? { id, slot: e.slot, at: atOf(e), entries: [] };
      b.entries.push(e);
      by.set(id, b);
    }
    const perDay = new Map<string, Batch[]>();
    for (const b of by.values()) {
      const d = ymd(new Date(b.at));
      const date = b.entries[0].date;
      perDay.set(date || d, [...(perDay.get(date || d) ?? []), b]);
    }
    return [...perDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([date, list]) => ({ date, list: list.sort((a, b) => a.at - b.at) }));
  }, [entries]);
  const tot = useMemo(() => totalsFor(entries, today), [entries, today]);
  const menu = useMemo(() => dayMenu(entries, target, new Date(), person.conditions), [entries, target, person.conditions]);
  const suggestions = hints(text.split(',').pop() ?? '');
  const count = entries.length;

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(t);
  }, [count, menu.length]);

  // the meal comes from the words: "rice in lunch", "chai evening snacks". Without any, it is the meal button.
  const reading = useMemo(() => readMessage(text, slot), [text, slot]);
  const shownSlot = reading.slot ?? slot;
  const cmd = useMemo(() => readListCommand(text), [text]);
  const send = () => {
    if (cmd) {
      const added = addListItems(cmd.list, cmd.items);
      setListNote(added.length ? `Added ${added.join(', ')} to your ${cmd.list} list.` : `Those are already on your ${cmd.list} list.`);
      setText('');
      return;
    }
    if (!reading.items.length) return;
    setListNote('');
    addItems(reading.items, today);
    setText('');
    const last = reading.items[reading.items.length - 1].slot;
    setSlot(reading.slot ? nextAfter(last) : nextAfter(slot));
  };
  const fill = (name: string) => {
    const parts = text.split(',');
    parts[parts.length - 1] = ` ${name}`;
    setText(parts.join(',').replace(/^\s+/, ''));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.head}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.title} numberOfLines={1}>
            {persons.length > 1 ? personName(person, persons.indexOf(person)) : 'Khana'}
          </Text>
          <Text style={s.sub} numberOfLines={1}>
            {`${Math.round(tot.kcal)} / ${target.kcal} kcal · ${Math.round(tot.protein)} / ${target.protein} g protein`}
          </Text>
        </View>
        {persons.length > 1 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Diary of ${personName(person, persons.indexOf(person))}. Tap to switch`}
            onPress={() => setActive(persons[(persons.indexOf(person) + 1) % persons.length].id)}
            hitSlop={8}
            style={s.avatar}
          >
            <Text style={s.avatarText} numberOfLines={1}>
              {personName(person, persons.indexOf(person)).charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView ref={scroll} contentContainerStyle={s.feed} keyboardShouldPersistTaps="handled">
        {days.length === 0 && (
          <Bubble side="app">
            <Text style={s.appText}>Hi. Tell me what you ate, just the names, like "poha, chai". I will remember it and plan your next meals from it.</Text>
          </Bubble>
        )}

        {days.map(({ date, list }) => (
          <View key={date} style={{ gap: 10 }}>
            <Text style={s.dayTag}>{dayName(date, today)}</Text>
            {list.map((b) => (
              <View key={b.id} style={{ gap: 8 }}>
                <Bubble side="me">
                  <Pressable accessibilityRole="button" accessibilityLabel="Show options" onPress={() => setOpen(open === b.id ? null : b.id)} style={{ gap: 6 }}>
                    <View style={s.meta}>
                      <Icon name={SLOT_ICON_ID[b.slot]} size={14} color={TILE_INK} width={2.2} />
                      <Text style={s.metaText} numberOfLines={1}>{`${slotLabel(b.slot)} · ${clock(b.at)}`}</Text>
                    </View>
                    {b.entries.map((e) => (
                      <Text key={e.id} style={s.meText} numberOfLines={1}>
                        {e.kcal != null ? `${entryLabel(e)}  ·  ${e.kcal} kcal` : entryLabel(e)}
                      </Text>
                    ))}
                  </Pressable>
                </Bubble>
                {open === b.id && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Remove this message" onPress={() => { removeBatch(b.id); setOpen(null); }} style={s.remove}>
                    <Icon name="trash" size={15} color={C.danger} width={2} />
                    <Text style={s.removeText}>Remove</Text>
                  </Pressable>
                )}
                {date === today && (
                  <Bubble side="app">
                    <Text style={s.appText}>{reply(b, tot)}</Text>
                  </Bubble>
                )}
              </View>
            ))}
          </View>
        ))}

        {!!listNote && (
          <Bubble side="app">
            <Text style={s.appText}>{`${listNote} See it in the Lists tab.`}</Text>
          </Bubble>
        )}

        {menu.length > 0 && (
          <Tile style={s.menu}>
            <Text style={s.menuTitle} numberOfLines={1}>{entries.length === 0 ? 'Ideas for today' : 'Menu for the rest of today'}</Text>
            {entries.length < 6 && <Muted>{entries.length === 0 ? 'Log a few meals and these will follow your habits.' : 'These get better as you log more days.'}</Muted>}
            {menu.map((m) => {
              const idx = (pick[m.slot] ?? 0) % m.options.length;
              const o = m.options[idx];
              return (
                <View key={m.slot} style={s.menuRow}>
                  <View style={s.menuIcon}>
                    <Icon name={SLOT_ICON_ID[m.slot]} size={18} color={TILE_INK} width={2} />
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Other options for ${slotLabel(m.slot)}`} onPress={() => setPick({ ...pick, [m.slot]: idx + 1 })} style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text style={s.menuSlot} numberOfLines={1}>
                      {slotLabel(m.slot)}
                    </Text>
                    <Text style={s.menuName} numberOfLines={1}>
                      {o.name}
                    </Text>
                    <Text style={s.menuWhy} numberOfLines={1}>
                      {[o.kcal != null ? `${o.kcal} kcal` : '', o.why[0]?.text].filter(Boolean).join(' · ')}
                    </Text>
                  </Pressable>
                  <Tile bg={TILE_INK} onPress={() => add(o.items, m.slot, today)} label={`I ate ${o.name}`} radius={RADIUS.pill} offset={3} style={s.ate}>
                    <Icon name="check" size={18} color={TILE.yellow} width={3} />
                  </Tile>
                </View>
              );
            })}
            <Text style={s.hint}>Tap a dish to see another option. Tap the tick when you eat it.</Text>
          </Tile>
        )}
      </ScrollView>

      <View style={s.composer}>
        {suggestions.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
            {suggestions.map((n) => (
              <Pressable key={n} accessibilityRole="button" accessibilityLabel={n} onPress={() => fill(n)} style={s.hintChip}>
                <Text style={s.hintText} numberOfLines={1}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={s.chipRow}>
            {cmd ? (
              <View style={s.slotBtn} accessibilityLabel={`List: ${cmd.list}`}>
                <Icon name="cart" size={17} color={TILE_INK} width={2} />
                <Text style={s.slotText} numberOfLines={1}>
                  {cmd.list}
                </Text>
              </View>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel={`Meal: ${slotLabel(shownSlot)}. Tap to change`} onPress={() => setSlot(nextAfter(reading.slot ?? slot))} style={s.slotBtn}>
                <Icon name={SLOT_ICON_ID[shownSlot]} size={17} color={TILE_INK} width={2} />
                <Text style={s.slotText} numberOfLines={1}>
                  {slotLabel(shownSlot)}
                </Text>
              </Pressable>
            )}
        </View>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={text}
            onChangeText={setText}
            placeholder="rice in lunch, chai evening"
            placeholderTextColor={C.muted}
            accessibilityLabel="What you ate"
            returnKeyType="send"
            onSubmitEditing={send}
            autoCapitalize="none"
          />
          <Tile bg={TILE_INK} onPress={send} label="Send" radius={RADIUS.pill} offset={3} wrap={!reading.items.length && !cmd ? { opacity: 0.45 } : undefined} style={s.send}>
            <Icon name="right" size={20} color={TILE.yellow} width={3} />
          </Tile>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const nextAfter = (s: SlotId): SlotId => SLOT_ORDER[(SLOT_ORDER.indexOf(s) + 1) % SLOT_ORDER.length];

function Bubble({ side, children }: { side: 'me' | 'app'; children: React.ReactNode }) {
  return (
    <Tile bg={side === 'me' ? TILE.yellow : C.card} wrap={side === 'me' ? s.meWrap : s.appWrap} style={s.bubble} offset={3}>
      {children}
    </Tile>
  );
}

const s = themed(() => StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 10 },
  title: { fontFamily: 'display', fontSize: 36, fontWeight: '800', color: C.text, letterSpacing: -1.4 },
  sub: { fontSize: 12, color: C.muted, fontWeight: '700' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: TILE.yellow, borderWidth: BORDER, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800', color: TILE_INK },
  feed: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, gap: 16, paddingBottom: 20 },
  dayTag: { alignSelf: 'center', fontSize: 12, fontWeight: '800', color: C.muted },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, gap: 4 },
  meWrap: { alignSelf: 'flex-end', maxWidth: '88%' },
  appWrap: { alignSelf: 'flex-start', maxWidth: '88%' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '800', color: TILE_INK, opacity: 0.75, flexShrink: 1 },
  meText: { fontSize: 16, fontWeight: '800', color: TILE_INK },
  appText: { fontSize: 15, color: C.text, lineHeight: 21, fontWeight: '500' },
  remove: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.sm, backgroundColor: C.dangerSoft, borderWidth: 2, borderColor: C.line },
  removeText: { fontSize: 13, fontWeight: '800', color: C.danger },
  menu: { padding: 14, gap: 10 },
  menuTitle: { fontFamily: 'display', fontSize: 22, fontWeight: '800', color: C.text },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10, borderTopWidth: 2, borderTopColor: C.line },
  menuIcon: { width: 42, height: 42, borderRadius: RADIUS.md, backgroundColor: TILE.green, borderWidth: 2, borderColor: TILE_INK, alignItems: 'center', justifyContent: 'center' },
  menuSlot: { fontSize: 12, fontWeight: '700', color: C.muted },
  menuName: { fontFamily: 'display', fontSize: 18, fontWeight: '800', color: C.text },
  menuWhy: { fontSize: 12, color: C.muted, fontWeight: '600' },
  ate: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 12, color: C.muted, fontWeight: '600' },
  composer: { gap: 10, paddingTop: 10, paddingBottom: 10, borderTopWidth: BORDER, borderTopColor: C.line, backgroundColor: C.bg },
  hintChip: { paddingHorizontal: 12, minHeight: 36, borderRadius: RADIUS.pill, backgroundColor: C.card, borderWidth: 2, borderColor: C.line, justifyContent: 'center' },
  hintText: { fontSize: 14, color: C.text, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 20, paddingRight: 16 },
  chipRow: { flexDirection: 'row', paddingLeft: 20, paddingRight: 16 },
  slotBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: TILE.green, borderWidth: BORDER, borderColor: C.line, maxWidth: '100%' },
  slotText: { fontSize: 14, fontWeight: '800', color: TILE_INK, flexShrink: 1 },
  input: { flex: 1, minWidth: 0, height: 48, backgroundColor: C.card, borderWidth: BORDER, borderColor: C.line, borderRadius: RADIUS.pill, paddingHorizontal: 16, fontSize: 16, color: C.text },
  send: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
}));
