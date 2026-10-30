import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { listToText } from '../core/lists';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { Muted, Tile } from './kit';
import { Text, TextInput } from './Text';
import { BORDER, C, RADIUS, TILE, TILE_INK, themed } from './theme';

export function ListsScreen() {
  const lists = useStore((st) => st.lists);
  const addListItems = useStore((st) => st.addListItems);
  const toggle = useStore((st) => st.toggleListItem);
  const removeItem = useStore((st) => st.removeListItem);
  const clearDone = useStore((st) => st.clearDoneItems);
  const addList = useStore((st) => st.addList);
  const removeList = useStore((st) => st.removeList);
  const [sel, setSel] = useState<string>('');
  const [text, setText] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [sure, setSure] = useState(false);
  const [note, setNote] = useState('');

  const list = lists.find((l) => l.id === sel) ?? lists[0];
  const open = list.items.filter((i) => !i.done);
  const done = list.items.filter((i) => i.done);

  const put = () => {
    const parts = text.split(/,|\n/).map((t) => t.trim()).filter(Boolean).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    if (!parts.length) return;
    addListItems(list.name, parts);
    setText('');
  };
  const shareList = async () => {
    const msg = listToText(list);
    try {
      await Share.share({ message: msg, title: list.name });
    } catch {
      try {
        await Clipboard.setStringAsync(msg);
        setNote('List copied.');
      } catch {
        setNote('Could not share here.');
      }
    }
  };
  const copyList = async () => {
    try {
      await Clipboard.setStringAsync(listToText(list));
      setNote('List copied.');
    } catch {
      setNote('Could not copy here.');
    }
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.chips}>
        {lists.map((l) => {
          const on = l.id === list.id;
          const left = l.items.filter((i) => !i.done).length;
          return (
            <Tile key={l.id} bg={on ? TILE_INK : C.card} onPress={() => { setSel(l.id); setSure(false); setNote(''); }} label={`${l.name} list`} selected={on} radius={RADIUS.pill} offset={3} style={s.chip}>
              <Text style={[s.chipText, on && s.chipTextOn]} numberOfLines={1}>{`${l.name} · ${left}`}</Text>
            </Tile>
          );
        })}
        <Tile bg={TILE.yellow} onPress={() => setAdding(!adding)} label="New list" radius={RADIUS.pill} offset={3} style={s.chip}>
          <Icon name="plus" size={16} color={TILE_INK} width={2.6} />
          <Text style={[s.chipText, { color: TILE_INK }]} numberOfLines={1}>New list</Text>
        </Tile>
      </ScrollView>

      {adding && (
        <View style={s.addRow}>
          <TextInput style={s.input} value={newName} onChangeText={setNewName} placeholder="List name, like Pharmacy" placeholderTextColor={C.muted} accessibilityLabel="List name" onSubmitEditing={() => { addList(newName); setNewName(''); setAdding(false); }} />
          <Tile bg={TILE_INK} onPress={() => { addList(newName); setNewName(''); setAdding(false); }} label="Create list" radius={RADIUS.pill} offset={3} style={s.go}>
            <Icon name="check" size={18} color={TILE.yellow} width={3} />
          </Tile>
        </View>
      )}

      <View style={s.addRow}>
        <TextInput style={s.input} value={text} onChangeText={setText} placeholder={`Add to ${list.name}: rice, oil`} placeholderTextColor={C.muted} accessibilityLabel={`Add to ${list.name}`} returnKeyType="done" onSubmitEditing={put} />
        <Tile bg={TILE_INK} onPress={put} label="Add items" radius={RADIUS.pill} offset={3} wrap={!text.trim() ? { opacity: 0.45 } : undefined} style={s.go}>
          <Icon name="plus" size={20} color={TILE.yellow} width={3} />
        </Tile>
      </View>
      <Muted>You can also add from Chat: type "add grocery list rice, daal, sugar, oil".</Muted>

      {list.items.length === 0 && (
        <View style={s.empty}>
          <Icon name="cart" size={28} color={C.muted} width={1.6} />
          <Text style={s.emptyText} numberOfLines={1}>{`${list.name} is empty`}</Text>
        </View>
      )}

      {open.length > 0 && (
        <Tile style={s.group}>
          <Text style={s.head}>{`To get · ${open.length}`}</Text>
          {open.map((i) => (
            <Row key={i.id} text={i.text} done={false} onToggle={() => toggle(list.id, i.id)} onRemove={() => removeItem(list.id, i.id)} />
          ))}
        </Tile>
      )}
      {done.length > 0 && (
        <Tile style={s.group}>
          <View style={s.headRow}>
            <Text style={[s.head, { flex: 1 }]} numberOfLines={1}>{`Done · ${done.length}`}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Clear done items" onPress={() => clearDone(list.id)} hitSlop={8}>
              <Text style={s.link} numberOfLines={1}>Clear done</Text>
            </Pressable>
          </View>
          {done.map((i) => (
            <Row key={i.id} text={i.text} done onToggle={() => toggle(list.id, i.id)} onRemove={() => removeItem(list.id, i.id)} />
          ))}
        </Tile>
      )}

      {list.items.length > 0 && (
        <View style={s.actions}>
          <Tile wrap={s.actWrap} onPress={shareList} label="Share list" radius={RADIUS.pill} offset={3} style={s.act}>
            <Icon name="share" size={17} color={C.text} width={1.9} />
            <Text style={s.actText} numberOfLines={1}>Share</Text>
          </Tile>
          <Tile wrap={s.actWrap} onPress={copyList} label="Copy list" radius={RADIUS.pill} offset={3} style={s.act}>
            <Icon name="copy" size={17} color={C.text} width={1.9} />
            <Text style={s.actText} numberOfLines={1}>Copy</Text>
          </Tile>
        </View>
      )}
      {!!note && <Text style={s.note}>{note}</Text>}

      {lists.length > 1 && (
        sure ? (
          <View style={s.actions}>
            <Tile wrap={s.actWrap} bg={C.dangerSoft} onPress={() => { removeList(list.id); setSel(''); setSure(false); }} label={`Yes, delete ${list.name}`} radius={RADIUS.pill} offset={3} style={s.act}>
              <Text style={[s.actText, { color: C.danger }]} numberOfLines={1}>Yes, delete list</Text>
            </Tile>
            <Tile wrap={s.actWrap} onPress={() => setSure(false)} label="Keep list" radius={RADIUS.pill} offset={3} style={s.act}>
              <Text style={s.actText} numberOfLines={1}>Keep it</Text>
            </Tile>
          </View>
        ) : (
          <Tile bg={C.dangerSoft} onPress={() => setSure(true)} label={`Delete ${list.name} list`} radius={RADIUS.pill} offset={3} style={s.delete}>
            <Icon name="trash" size={16} color={C.danger} width={2.2} />
            <Text style={s.deleteText} numberOfLines={1}>{`Delete ${list.name}`}</Text>
          </Tile>
        )
      )}
    </ScrollView>
  );
}

function Row({ text, done, onToggle, onRemove }: { text: string; done: boolean; onToggle: () => void; onRemove: () => void }) {
  return (
    <View style={s.item}>
      <Pressable accessibilityRole="checkbox" accessibilityLabel={text} accessibilityState={{ checked: done }} onPress={onToggle} style={s.itemMain}>
        <View style={[s.box, done && s.boxOn]}>{done && <Icon name="check" size={14} color={TILE_INK} width={3.4} />}</View>
        <Text style={[s.itemText, done && s.itemDone]} numberOfLines={1}>{text}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${text}`} onPress={onRemove} hitSlop={8} style={s.x}>
        <Icon name="close" size={16} color={C.muted} width={2} />
      </Pressable>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, gap: 16, paddingBottom: 32 },
  chips: { gap: 10, paddingRight: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, minHeight: 44 },
  chipText: { fontSize: 14, fontWeight: '800', color: C.text, maxWidth: 160 },
  chipTextOn: { color: TILE.yellow },
  addRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, minWidth: 0, height: 48, borderRadius: RADIUS.pill, backgroundColor: C.card, borderWidth: BORDER, borderColor: C.line, paddingHorizontal: 16, fontSize: 15, color: C.text },
  go: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 28 },
  emptyText: { fontSize: 15, fontWeight: '800', color: C.muted },
  group: { paddingHorizontal: 14, paddingVertical: 8 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  head: { fontFamily: 'display', fontSize: 20, fontWeight: '800', color: C.text, paddingVertical: 8 },
  link: { fontSize: 13, fontWeight: '800', color: C.text, textDecorationLine: 'underline' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, borderTopWidth: 2, borderTopColor: C.line },
  itemMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: BORDER, borderColor: C.line, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: TILE.green },
  itemText: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '700', color: C.text },
  itemDone: { color: C.muted, textDecorationLine: 'line-through', fontWeight: '600' },
  x: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  actWrap: { flex: 1, minWidth: 0 },
  act: { minHeight: 48, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  actText: { fontSize: 14, fontWeight: '800', color: C.text },
  note: { color: C.good, fontWeight: '800', fontSize: 14 },
  delete: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  deleteText: { fontSize: 14, fontWeight: '800', color: C.danger },
}));
