import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LANG_LABEL, t, type StrKey } from './src/i18n/strings';
import type { Lang } from './src/core/types';
import { useStore } from './src/state/store';
import { DishesScreen } from './src/ui/DishesScreen';
import { PantryScreen } from './src/ui/PantryScreen';
import { ProfileScreen } from './src/ui/ProfileScreen';
import { TodayScreen } from './src/ui/TodayScreen';
import { C } from './src/ui/theme';

const TABS = [
  { key: 'today', label: 'tabToday', icon: '🍽️', Screen: TodayScreen },
  { key: 'pantry', label: 'tabPantry', icon: '🧺', Screen: PantryScreen },
  { key: 'dishes', label: 'tabDishes', icon: '📖', Screen: DishesScreen },
  { key: 'profile', label: 'tabProfile', icon: '👫', Screen: ProfileScreen },
] as const;

const LANGS: Lang[] = ['en', 'hi', 'gu'];

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('today');
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const Active = TABS.find((x) => x.key === tab)!.Screen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={s.header}>
          <Text style={s.title}>{t(lang, 'appName')}</Text>
          <View style={s.langs}>
            {LANGS.map((l) => (
              <Pressable key={l} onPress={() => setLang(l)} accessibilityRole="button" style={[s.lang, l === lang && s.langOn]}>
                <Text style={[s.langText, l === lang && { color: '#fff' }]}>{LANG_LABEL[l]}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Active />
        </View>
        <View style={s.tabs}>
          {TABS.map((x) => (
            <Pressable key={x.key} onPress={() => setTab(x.key)} accessibilityRole="tab" accessibilityState={{ selected: tab === x.key }} style={s.tab}>
              <Text style={{ fontSize: 22, opacity: tab === x.key ? 1 : 0.5 }}>{x.icon}</Text>
              <Text style={[s.tabText, tab === x.key && { color: C.primary, fontWeight: '800' }]}>{t(lang, x.label as StrKey)}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  title: { fontSize: 22, fontWeight: '900', color: C.primary },
  langs: { flexDirection: 'row', gap: 6 },
  lang: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: C.primary },
  langOn: { backgroundColor: C.primary },
  langText: { fontSize: 12, fontWeight: '700', color: C.primary },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 2 },
  tabText: { fontSize: 11, color: C.muted },
});
