import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { t, type StrKey } from './src/i18n/strings';
import { useStore } from './src/state/store';
import { DishesScreen } from './src/ui/DishesScreen';
import { PantryScreen } from './src/ui/PantryScreen';
import { ProfileScreen } from './src/ui/ProfileScreen';
import { TodayScreen } from './src/ui/TodayScreen';
import { C } from './src/ui/theme';

const TABS = [
  { key: 'today', label: 'tabToday', Screen: TodayScreen },
  { key: 'pantry', label: 'tabPantry', Screen: PantryScreen },
  { key: 'dishes', label: 'tabDishes', Screen: DishesScreen },
  { key: 'profile', label: 'tabProfile', Screen: ProfileScreen },
] as const;

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('today');
  const lang = useStore((s) => s.lang);
  const Active = TABS.find((x) => x.key === tab)!.Screen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          <Active />
        </View>
        <View style={s.tabs}>
          {TABS.map((x) => {
            const on = tab === x.key;
            return (
              <Pressable key={x.key} onPress={() => setTab(x.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={s.tab}>
                <View style={[s.dot, on && { backgroundColor: C.primary }]} />
                <Text style={[s.tabText, on && { color: C.text, fontWeight: '700' }]}>{t(lang, x.label as StrKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4 },
  dot: { width: 18, height: 3, borderRadius: 2, backgroundColor: 'transparent' },
  tabText: { fontSize: 13, color: C.muted },
});
