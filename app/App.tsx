import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { t, type StrKey } from './src/i18n/strings';
import { useStore } from './src/state/store';
import { OnboardScreen } from './src/ui/OnboardScreen';
import { DishesScreen } from './src/ui/DishesScreen';
import { PantryScreen } from './src/ui/PantryScreen';
import { ProfileScreen } from './src/ui/ProfileScreen';
import { TodayScreen } from './src/ui/TodayScreen';
import { Icon, type IconName } from './src/ui/Icon';
import { C } from './src/ui/theme';

const TABS = [
  { key: 'today', label: 'tabToday', icon: 'today', Screen: TodayScreen },
  { key: 'pantry', label: 'tabPantry', icon: 'pantry', Screen: PantryScreen },
  { key: 'dishes', label: 'tabDishes', icon: 'dishes', Screen: DishesScreen },
  { key: 'profile', label: 'tabProfile', icon: 'settings', Screen: ProfileScreen },
] as { key: string; label: string; icon: IconName; Screen: () => React.JSX.Element }[];

export default function App() {
  const [tab, setTab] = useState('today');
  const lang = useStore((s) => s.lang);
  const onboarded = useStore((s) => s.onboarded);
  const [ready, setReady] = useState(useStore.persist.hasHydrated());
  useEffect(() => useStore.persist.onFinishHydration(() => setReady(true)), []);
  const Active = TABS.find((x) => x.key === tab)!.Screen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>{!ready ? null : onboarded ? <Active /> : <OnboardScreen />}</View>
        {ready && onboarded && (
        <View style={s.tabs}>
          {TABS.map((x) => {
            const on = tab === x.key;
            return (
              <Pressable key={x.key} onPress={() => setTab(x.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={s.tab}>
                <Icon name={x.icon} size={22} color={on ? C.primary : C.muted} />
                <Text style={[s.tabText, on && { color: C.text, fontWeight: '700' }]}>{t(lang, x.label as StrKey)}</Text>
              </Pressable>
            );
          })}
        </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 3 },
  tabText: { fontSize: 13, color: C.muted },
});
