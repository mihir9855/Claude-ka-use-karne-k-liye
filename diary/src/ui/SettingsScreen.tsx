import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { entriesToCsv, makeBackup, parseBackup, type Backup } from '../core/backup';
import { personName, useStore } from '../state/store';
import { APP_VERSION, CHANGELOG, WHAT_IT_DOES } from '../version';
import { DataPage } from './DataPage';
import { Icon, type IconName } from './Icon';
import { Button, Card, Choice, Label, Muted, Tile } from './kit';
import { ProfilesPage } from './ProfilesPage';
import { pickTextFile, saveTextFile } from './saveFile';
import { Text } from './Text';
import { BORDER, C, RADIUS, SETS, SET_IDS, TILE, TILE_INK, themed } from './theme';

type Page = 'profiles' | 'theme' | 'backup' | 'data' | 'features' | 'news';

const ROWS: { page: Page; icon: IconName; title: string; sub: string }[] = [
  { page: 'profiles', icon: 'users', title: 'Profiles', sub: 'Name, body, goal, health and family' },
  { page: 'theme', icon: 'sparkle', title: 'Theme', sub: 'Dark, light or follow the phone' },
  { page: 'backup', icon: 'file', title: 'Backup and export', sub: 'Save a file to your phone, restore' },
  { page: 'data', icon: 'chart', title: 'Learning and data', sub: 'What it learned, sample meals, delete' },
  { page: 'features', icon: 'heart', title: 'What this app can do', sub: 'Everything in one list' },
  { page: 'news', icon: 'flame', title: `What's new`, sub: `Version ${APP_VERSION}` },
];

const ROW_COLOR: Record<Page, string> = { profiles: TILE.green, theme: TILE.pink, backup: TILE.yellow, data: TILE.blue, features: TILE.orange, news: TILE.lilac };

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
          <Tile key={r.page} onPress={() => setPage(r.page)} label={r.title} style={s.row}>
            <View style={[s.ico, { backgroundColor: ROW_COLOR[r.page] }]}>
              <Icon name={r.icon} size={20} color={TILE_INK} width={2} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.rowTitle} numberOfLines={1}>{r.title}</Text>
              <Text style={s.rowSub} numberOfLines={1}>{r.sub}</Text>
            </View>
            <Icon name="right" size={18} color={C.text} width={2.4} />
          </Tile>
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
  const accent = useStore((st) => st.accent);
  const setAccent = useStore((st) => st.setAccent);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.group}>Page colour</Text>
      <View style={s.swatches}>
        {SET_IDS.map((id) => {
          const on = id === accent;
          return (
            <Pressable key={id} accessibilityRole="radio" accessibilityLabel={`${SETS[id].name} page colour`} accessibilityState={{ selected: on }} onPress={() => setAccent(id)} style={s.swatchCell}>
              <View style={[s.swatch, { backgroundColor: SETS[id].swatch }, on && s.swatchOn]}>{on && <Icon name="check" size={22} color="#14110E" width={3.2} />}</View>
              <Text style={[s.swatchName, on && { fontWeight: '800' }]} numberOfLines={1}>{SETS[id].name}</Text>
            </Pressable>
          );
        })}
      </View>
      <Muted>Used in the light theme. The tiles keep their bright colours.</Muted>
      <Text style={s.group}>Light or dark</Text>
      <Choice title="Follow my phone" sub="Light by day, dark at night, as the phone is set" on={theme === 'system'} onPress={() => setTheme('system')} />
      <Choice title="Light" sub="Bright page with black outlines" on={theme === 'light'} onPress={() => setTheme('light')} />
      <Choice title="Dark" sub="Dark page with cream outlines" on={theme === 'dark'} onPress={() => setTheme('dark')} />
    </ScrollView>
  );
}

function BackupPage() {
  const entries = useStore((st) => st.entries);
  const persons = useStore((st) => st.persons);
  const activeId = useStore((st) => st.activeId);
  const picks = useStore((st) => st.picks);
  const lists = useStore((st) => st.lists);
  const saveDir = useStore((st) => st.saveDir);
  const setSaveDir = useStore((st) => st.setSaveDir);
  const restore = useStore((st) => st.restore);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const [checked, setChecked] = useState<{ ok: true; data: Backup } | { ok: false; error: string } | null>(null);
  const day = new Date().toISOString().slice(0, 10);

  const save = async (name: string, text: string, mime: string) => {
    const r = await saveTextFile(name, text, mime, saveDir || null);
    if (r.ok) {
      if (r.dir && r.dir !== saveDir) setSaveDir(r.dir);
      setNote({ text: r.message, bad: false });
    } else if (!r.cancelled) setNote({ text: r.error, bad: true });
    else setNote({ text: r.error, bad: true });
  };
  const pick = async () => {
    setNote(null);
    const r = await pickTextFile();
    if (r.ok) setChecked(parseBackup(r.text));
    else if (!r.cancelled) setNote({ text: r.error, bad: true });
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Card>
        <Text style={s.big}>{`${entries.length} ${entries.length === 1 ? 'item' : 'items'} · ${persons.length} ${persons.length === 1 ? 'profile' : 'profiles'}`}</Text>
        <Muted>{saveDir ? 'One tap saves a backup file in your chosen folder.' : 'The first time you pick a folder, like Downloads. After that it is one tap.'}</Muted>
        <Button icon="file" label="Save backup to phone" onPress={() => save(`khana-diary-backup-${day}.json`, makeBackup({ entries, persons, activeId, picks, lists }, APP_VERSION), 'application/json')} />
        <Button kind="soft" icon="chart" label="Save meals as spreadsheet" onPress={() => save(`khana-diary-meals-${day}.csv`, entriesToCsv(entries, persons), 'text/csv')} />
      </Card>

      <Card>
        <Text style={s.big}>Restore</Text>
        <Muted>Pick a backup file you saved before. It replaces what is on this phone.</Muted>
        <Button kind="soft" icon="up" label="Choose backup file" onPress={pick} />
        {checked && !checked.ok && <Text style={s.err}>{checked.error}</Text>}
        {checked && checked.ok && (
          <View style={{ gap: 8 }}>
            <Text style={s.ok}>{`Found ${checked.data.entries.length} items and ${checked.data.persons.length} ${checked.data.persons.length === 1 ? 'profile' : 'profiles'} (${checked.data.persons.map((p, i) => personName(p, i)).join(', ')}).`}</Text>
            <Button
              kind="danger"
              label="Replace my data with this"
              onPress={() => {
                restore(checked.data);
                setChecked(null);
                setNote({ text: 'Backup restored.', bad: false });
              }}
            />
          </View>
        )}
      </Card>
      {!!note && <Text style={note.bad ? s.err : s.ok}>{note.text}</Text>}
    </ScrollView>
  );
}

function FeaturesPage() {
  return (
    <ScrollView contentContainerStyle={s.page}>
      {WHAT_IT_DOES.map((f) => (
        <Tile key={f.title} style={s.feature}>
          <View style={[s.ico, { backgroundColor: TILE.yellow }]}>
            <Icon name={f.icon} size={20} color={TILE_INK} width={2} />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={s.rowTitle}>{f.title}</Text>
            <Text style={s.featText}>{f.text}</Text>
          </View>
        </Tile>
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
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 8, gap: 16, paddingBottom: 32 },
  group: { fontFamily: 'display', fontSize: 20, fontWeight: '800', color: C.text, marginTop: 4 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  swatchCell: { width: '25%', minWidth: 0, alignItems: 'center', gap: 6 },
  swatch: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: BORDER, borderColor: C.line },
  swatchOn: { borderWidth: 4 },
  swatchName: { fontSize: 12, fontWeight: '700', color: C.text, maxWidth: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 68 },
  ico: { width: 42, height: 42, borderRadius: RADIUS.md, borderWidth: 2, borderColor: TILE_INK, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: 'display', fontSize: 18, fontWeight: '800', color: C.text },
  rowSub: { fontSize: 12, fontWeight: '600', color: C.muted },
  version: { textAlign: 'center', color: C.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 20, paddingVertical: 6 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  barTitle: { flex: 1, minWidth: 0, fontFamily: 'display', fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  big: { fontFamily: 'display', fontSize: 22, fontWeight: '800', color: C.text },
  paste: { minHeight: 90, maxHeight: 160, backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: RADIUS.md, padding: 12, fontSize: 14, color: C.text, textAlignVertical: 'top' },
  err: { color: C.danger, fontWeight: '800', fontSize: 14 },
  ok: { color: C.good, fontWeight: '800', fontSize: 14 },
  feature: { flexDirection: 'row', gap: 12, padding: 14 },
  featText: { fontSize: 14, color: C.muted, lineHeight: 20, flexShrink: 1, fontWeight: '500' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginTop: 7 },
}));
