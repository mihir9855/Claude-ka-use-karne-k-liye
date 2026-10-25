import { StatusBar } from 'expo-status-bar';
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { t, type StrKey } from './src/i18n/strings';
import { useStore } from './src/state/store';
import { DishesScreen } from './src/ui/DishesScreen';
import { Icon, type IconName } from './src/ui/Icon';
import { OnboardScreen } from './src/ui/OnboardScreen';
import { PantryScreen } from './src/ui/PantryScreen';
import { ProfileScreen } from './src/ui/ProfileScreen';
import { C } from './src/ui/theme';
import { TodayScreen } from './src/ui/TodayScreen';
import { UndoBar } from './src/ui/UndoBar';

type Tab = 'today' | 'pantry' | 'settings';
const TABS: { key: Tab; label: StrKey; icon: IconName }[] = [
  { key: 'today', label: 'tabToday', icon: 'today' },
  { key: 'pantry', label: 'tabPantry', icon: 'pantry' },
  { key: 'settings', label: 'tabProfile', icon: 'settings' },
];

/** Shows the real error on screen so a failure can be reported and fixed, instead of a blank page. */
class Guard extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(_e: Error, _i: ErrorInfo) {}
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const lang = useStore.getState().lang;
    return (
      <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: C.text }}>{t(lang, 'somethingWrong')}</Text>
        <Text style={{ color: C.muted }}>{t(lang, 'sendThis')}</Text>
        <Text selectable style={{ backgroundColor: C.surface, padding: 12, borderRadius: 12, color: C.text }}>
          {String(error.message).slice(0, 400)}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => this.setState({ error: null })} style={s.bigBtn}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{t(lang, 'tryAgain')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            useStore.getState().resetAll();
            this.setState({ error: null });
          }}
          style={[s.bigBtn, { backgroundColor: C.surface }]}
        >
          <Text style={{ color: C.danger, fontWeight: '700' }}>{t(lang, 'resetAll')}</Text>
        </Pressable>
      </ScrollView>
    );
  }
}

function Shell() {
  const [tab, setTab] = useState<Tab>('today');
  const [dishes, setDishes] = useState(false);
  const lang = useStore((st) => st.lang);
  const onboarded = useStore((st) => st.onboarded);
  const [ready, setReady] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const off = useStore.persist.onFinishHydration(() => setReady(true));
    // never leave a blank screen if saved data cannot be read
    const timer = setTimeout(() => setReady(true), 2000);
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);

  const main = !ready ? null : !onboarded ? (
    <OnboardScreen />
  ) : dishes ? (
    <DishesScreen onClose={() => setDishes(false)} />
  ) : tab === 'today' ? (
    <TodayScreen onMore={() => setDishes(true)} />
  ) : tab === 'pantry' ? (
    <PantryScreen />
  ) : (
    <ProfileScreen onOpenDishes={() => setDishes(true)} />
  );

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>{main}</View>
      <UndoBar />
      {ready && onboarded && !dishes && (
        <View style={s.tabs}>
          {TABS.map((x) => {
            const on = tab === x.key;
            return (
              <Pressable key={x.key} onPress={() => setTab(x.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={s.tab}>
                <Icon name={x.icon} size={22} color={on ? C.primary : C.muted} />
                <Text style={[s.tabText, on && { color: C.text, fontWeight: '700' }]}>{t(lang, x.label)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Guard>
        <Shell />
      </Guard>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 3 },
  tabText: { fontSize: 13, color: C.muted },
  bigBtn: { backgroundColor: C.primary, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
});
