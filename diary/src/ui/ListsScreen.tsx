import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { listToText } from '../core/lists';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { Muted } from './kit';
import { Text, TextInput } from './Text';
import { C, RADIUS, themed } from './theme';

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
        {lists.map((l) => {
          const on = l.id === list.id;
          const left = l.items.filter((i) => !i.done).length;
          return (
            <Pressable key={l.id} accessibilityRole="button" accessibilityLabel={`${l.name} list`} onPress={() => { setSel(l.id); setSure(false); setNote(''); }} style={[s.chip, on && s.chipOn]}>
              <Text style={[s.chipText, on && s.chipTextOn]} numberOfLines={1}>{`${l.name} · ${left}`}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" accessibilityLabel="New list" onPress={() => setAdding(!adding)} style={s.chip}>
          <Icon name="plus" size={16} color={C.text} width={2.2} />
          <Text style={s.chipText} numberOfLines={1}>New list</Text>
        </Pressable>
      </ScrollView>

      {adding && (
        <View style={s.addRow}>
          <TextInput style={s.input} value={newName} onChangeText={setNewName} placeholder="List name, like Pharmacy" placeholderTextColor={C.muted} accessibilityLabel="List name" onSubmitEditing={() => { addList(newName); setNewName(''); setAdding(false); }} />
          <Pressable accessibilityRole="button" accessibilityLabel="Create list" onPress={() => { addList(newName); setNewName(''); setAdding(false); }} style={s.go}>
            <Icon name="check" size={18} color={C.onPrimary} width={2.6} />
          </Pressable>
        </View>
      )}

      <View style={s.addRow}>
        <TextInput style={s.input} value={text} onChangeText={setText} placeholder={`Add to ${list.name}: rice, oil`} placeholderTextColor={C.muted} accessibilityLabel={`Add to ${list.name}`} returnKeyType="done" onSubmitEditing={put} />
        <Pressable accessibilityRole="button" accessibilityLabel="Add items" onPress={put} style={[s.go, !text.trim() && { opacity: 0.4 }]}>
          <Icon name="plus" size={20} color={C.onPrimary} width={2.6} />
        </Pressable>
      </View>
      <Muted>You can also add from Chat: type "add grocery list rice, daal, sugar, oil".</Muted>

      {list.items.length === 0 && (
        <View style={s.empty}>
          <Icon name="cart" size={28} color={C.muted} width={1.6} />
          <Text style={s.emptyText} numberOfLines={1}>{`${list.name} is empty`}</Text>
        </View>
      )}

      {open.length > 0 && (
        <View style={s.group}>
          <Text style={s.head}>{`To get · ${open.length}`}</Text>
          {open.map((i) => (
            <Row key={i.id} text={i.text} done={false} onToggle={() => toggle(list.id, i.id)} onRemove={() => removeItem(list.id, i.id)} />
          ))}
        </View>
      )}
      {done.length > 0 && (
        <View style={s.group}>
          <View style={s.headRow}>
            <Text style={[s.head, { flex: 1 }]} numberOfLines={1}>{`Done · ${done.length}`}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Clear done items" onPress={() => clearDone(list.id)} hitSlop={8}>
              <Text style={s.link} numberOfLines={1}>Clear done</Text>
            </Pressable>
          </View>
          {done.map((i) => (
            <Row key={i.id} text={i.text} done onToggle={() => toggle(list.id, i.id)} onRemove={() => removeItem(list.id, i.id)} />
          ))}
        </View>
      )}

      {list.items.length > 0 && (
        <View style={s.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Share list" onPress={shareList} style={s.act}>
            <Icon name="share" size={17} color={C.text} width={1.9} />
            <Text style={s.actText} numberOfLines={1}>Share</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Copy list" onPress={copyList} style={s.act}>
            <Icon name="copy" size={17} color={C.text} width={1.9} />
            <Text style={s.actText} numberOfLines={1}>Copy</Text>
          </Pressable>
        </View>
      )}
      {!!note && <Text style={s.note}>{note}</Text>}

      {lists.length > 1 && (
        sure ? (
          <View style={s.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Yes, delete ${list.name}`} onPress={() => { removeList(list.id); setSel(''); setSure(false); }} style={[s.act, { borderColor: C.danger }]}>
              <Text style={[s.actText, { color: C.danger }]} numberOfLines={1}>Yes, delete list</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Keep list" onPress={() => setSure(false)} style={s.act}>
              <Text style={s.actText} numberOfLines={1}>Keep it</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${list.name} list`} onPress={() => setSure(true)} style={s.delete}>
            <Icon name="trash" size={16} color={C.danger} width={2} />
            <Text style={s.deleteText} numberOfLines={1}>{`Delete ${list.name}`}</Text>
          </Pressable>
        )
      )}
    </ScrollView>
  );
}

function Row({ text, done, onToggle, onRemove }: { text: string; done: boolean; onToggle: () => void; onRemove: () => void }) {
  return (
    <View style={s.item}>
      <Pressable accessibilityRole="checkbox" accessibilityLabel={text} accessibilityState={{ checked: done }} onPress={onToggle} style={s.itemMain}>
        <View style={[s.box, done && s.boxOn]}>{done && <Icon name="check" size={14} color={C.onPrimary} width={3} />}</View>
        <Text style={[s.itemText, done && s.itemDone]} numberOfLines={1}>{text}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${text}`} onPress={onRemove} hitSlop={8} style={s.x}>
        <Icon name="close" size={16} color={C.muted} width={2} />
      </Pressable>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 19, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { fontSize: 14, fontWeight: '600', color: C.text, maxWidth: 160 },
  chipTextOn: { color: C.onPrimary, fontWeight: '800' },
  addRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minWidth: 0, height: 46, borderRadius: RADIUS.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, fontSize: 15, color: C.text },
  go: { width: 46, height: 46, borderRadius: RADIUS.md, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 28 },
  emptyText: { fontSize: 15, fontWeight: '600', color: C.muted },
  group: { borderRadius: RADIUS.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, paddingVertical: 8 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  head: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.2, paddingVertical: 8 },
  link: { fontSize: 13, fontWeight: '700', color: C.accent },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderTopWidth: 1, borderTopColor: C.line },
  itemMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: C.accent, borderColor: C.accent },
  itemText: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '600', color: C.text },
  itemDone: { color: C.muted, textDecorationLine: 'line-through', fontWeight: '500' },
  x: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 8 },
  act: { flex: 1, minWidth: 0, height: 44, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  actText: { fontSize: 14, fontWeight: '700', color: C.text },
  note: { color: C.good, fontWeight: '600', fontSize: 14 },
  delete: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 44 },
  deleteText: { fontSize: 14, fontWeight: '700', color: C.danger },
}));
