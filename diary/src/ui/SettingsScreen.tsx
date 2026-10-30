import * as Clipboard from 'expo-clipboard';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { entriesToCsv, makeBackup, parseBackup, type Backup } from '../core/backup';
import { personName, useStore } from '../state/store';
import { APP_VERSION, CHANGELOG, WHAT_IT_DOES } from '../version';
import { DataPage } from './DataPage';
import { Icon, type IconName } from './Icon';
import { Button, Card, Choice, Label, Muted } from './kit';
import { ProfilesPage } from './ProfilesPage';
import { Text, TextInput } from './Text';
import { C, RADIUS, themed } from './theme';

type Page = 'profiles' | 'theme' | 'backup' | 'data' | 'features' | 'news';

const ROWS: { page: Page; icon: IconName; title: string; sub: string }[] = [
  { page: 'profiles', icon: 'users', title: 'Profiles', sub: 'Name, body, goal, health and family' },
  { page: 'theme', icon: 'sparkle', title: 'Theme', sub: 'Dark, light or follow the phone' },
  { page: 'backup', icon: 'file', title: 'Backup and export', sub: 'Copy, share, restore, spreadsheet' },
  { page: 'data', icon: 'chart', title: 'Learning and data', sub: 'What it learned, sample meals, delete' },
  { page: 'features', icon: 'heart', title: 'What this app can do', sub: 'Everything in one list' },
  { page: 'news', icon: 'flame', title: `What's new`, sub: `Version ${APP_VERSION}` },
];

export function SettingsScreen() {
  const [page, setPage] = useState<Page | null>(null);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page) {
        setPage(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [page]);

  if (!page) {
    return (
      <ScrollView contentContainerStyle={s.page}>
        {ROWS.map((r) => (
          <Pressable key={r.page} accessibilityRole="button" accessibilityLabel={r.title} onPress={() => setPage(r.page)} style={s.row}>
            <View style={s.ico}>
              <Icon name={r.icon} size={20} color={C.text} width={1.8} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.rowTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={s.rowSub} numberOfLines={1}>{r.sub}</Text>
            </View>
            <Icon name="right" size={18} color={C.muted} width={2} />
          </Pressable>
        ))}
        <Text style={s.version}>{`Khana Diary · version ${APP_VERSION}`}</Text>
      </ScrollView>
    );
  }

  const row = ROWS.find((r) => r.page === page)!;
  return (
    <View style={{ flex: 1 }}>
      <View style={s.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to settings" onPress={() => setPage(null)} hitSlop={8} style={s.back}>
          <Icon name="back" size={22} color={C.text} width={2} />
        </Pressable>
        <Text style={s.barTitle} numberOfLines={1}>{row.title}</Text>
      </View>
      {page === 'profiles' && <ProfilesPage />}
      {page === 'theme' && <ThemePage />}
      {page === 'backup' && <BackupPage />}
      {page === 'data' && <DataPage />}
      {page === 'features' && <FeaturesPage />}
      {page === 'news' && <NewsPage />}
    </View>
  );
}

function ThemePage() {
  const theme = useStore((st) => st.theme);
  const setTheme = useStore((st) => st.setTheme);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Choice title="Follow my phone" sub="Light by day, dark at night, as the phone is set" on={theme === 'system'} onPress={() => setTheme('system')} />
      <Choice title="Dark" sub="Easy on the eyes in the evening" on={theme === 'dark'} onPress={() => setTheme('dark')} />
      <Choice title="Light" sub="Bright and clear in daylight" on={theme === 'light'} onPress={() => setTheme('light')} />
    </ScrollView>
  );
}

function BackupPage() {
  const entries = useStore((st) => st.entries);
  const persons = useStore((st) => st.persons);
  const activeId = useStore((st) => st.activeId);
  const picks = useStore((st) => st.picks);
  const lists = useStore((st) => st.lists);
  const restore = useStore((st) => st.restore);
  const [note, setNote] = useState('');
  const [paste, setPaste] = useState('');
  const [checked, setChecked] = useState<{ ok: true; data: Backup } | { ok: false; error: string } | null>(null);
  const backup = useMemo(() => makeBackup({ entries, persons, activeId, picks, lists }, APP_VERSION), [entries, persons, activeId, picks, lists]);
  const csv = useMemo(() => entriesToCsv(entries, persons), [entries, persons]);

  const copy = async (text: string, what: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setNote(`${what} copied.`);
    } catch {
      setNote('Could not copy here. Use Share instead.');
    }
  };
  const share = async (text: string, title: string) => {
    try {
      await Share.share({ message: text, title });
    } catch {
      await copy(text, title);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Card>
        <Label>Your data</Label>
        <Text style={s.big}>{`${entries.length} ${entries.length === 1 ? 'item' : 'items'} · ${persons.length} ${persons.length === 1 ? 'profile' : 'profiles'}`}</Text>
        <Muted>A backup holds all meals, profiles and swaps. Keep it somewhere safe, like a note to yourself or a chat.</Muted>
        <Button icon="copy" label="Copy backup" onPress={() => copy(backup, 'Backup')} />
        <Button kind="soft" icon="share" label="Share backup" onPress={() => share(backup, 'Khana Diary backup')} />
      </Card>

      <Card>
        <Label>Export meals as a spreadsheet</Label>
        <Muted>One row for each item, with calories and nutrients. Open it in Excel or Google Sheets.</Muted>
        <Button kind="soft" icon="copy" label="Copy as CSV" onPress={() => copy(csv, 'CSV')} />
        <Button kind="soft" icon="share" label="Share CSV" onPress={() => share(csv, 'Khana Diary meals')} />
      </Card>

      <Card>
        <Label>Restore from a backup</Label>
        <Muted>Paste a backup you copied before. It replaces what is on this phone.</Muted>
        <TextInput style={s.paste} value={paste} onChangeText={(v) => { setPaste(v); setChecked(null); }} multiline placeholder="Paste backup text here" placeholderTextColor={C.muted} accessibilityLabel="Backup text" />
        <Button kind="soft" label="Check backup" onPress={() => setChecked(parseBackup(paste))} />
        {checked && !checked.ok && <Text style={s.err}>{checked.error}</Text>}
        {checked && checked.ok && (
          <View style={{ gap: 8 }}>
            <Text style={s.ok}>{`Found ${checked.data.entries.length} items and ${checked.data.persons.length} ${checked.data.persons.length === 1 ? 'profile' : 'profiles'} (${checked.data.persons.map((p, i) => personName(p, i)).join(', ')}).`}</Text>
            <Button
              kind="danger"
              label="Replace my data with this"
              onPress={() => {
                restore(checked.data);
                setPaste('');
                setChecked(null);
                setNote('Backup restored.');
              }}
            />
          </View>
        )}
      </Card>
      {!!note && <Text style={s.ok}>{note}</Text>}
    </ScrollView>
  );
}

function FeaturesPage() {
  return (
    <ScrollView contentContainerStyle={s.page}>
      {WHAT_IT_DOES.map((f) => (
        <View key={f.title} style={s.feature}>
          <View style={s.ico}>
            <Icon name={f.icon} size={20} color={C.accent} width={1.8} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={s.rowTitle}>{f.title}</Text>
            <Text style={s.featText}>{f.text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function NewsPage() {
  return (
    <ScrollView contentContainerStyle={s.page}>
      {CHANGELOG.map((c) => (
        <Card key={c.version}>
          <Label>{`Version ${c.version}`}</Label>
          {c.items.map((i) => (
            <View key={i} style={s.item}>
              <View style={s.dot} />
              <Text style={s.featText}>{i}</Text>
            </View>
          ))}
        </Card>
      ))}
      <Text style={s.version}>{`You have version ${APP_VERSION}`}</Text>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: RADIUS.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  ico: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  rowSub: { fontSize: 12, color: C.muted },
  version: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  barTitle: { flex: 1, minWidth: 0, fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.4 },
  big: { fontSize: 20, fontWeight: '800', color: C.text },
  paste: { minHeight: 90, maxHeight: 160, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.md, padding: 12, fontSize: 14, color: C.text, textAlignVertical: 'top' },
  err: { color: C.danger, fontWeight: '600', fontSize: 14 },
  ok: { color: C.good, fontWeight: '600', fontSize: 14 },
  feature: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: RADIUS.lg, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  featText: { fontSize: 14, color: C.muted, lineHeight: 20, flexShrink: 1 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginTop: 7 },
}));
