import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './src/state/store';
import { Icon, type IconName } from './src/ui/Icon';
import { LearnedScreen } from './src/ui/LearnedScreen';
import { NextScreen } from './src/ui/NextScreen';
import { Text } from './src/ui/Text';
import { TodayScreen } from './src/ui/TodayScreen';
import { C } from './src/ui/theme';

type Tab = 'today' | 'next' | 'learned';
const TABS: { key: Tab; label: string; title: string; icon: IconName }[] = [
  { key: 'today', label: 'Log', title: 'What did you eat?', icon: 'pen' },
  { key: 'next', label: 'Next', title: 'What to eat next', icon: 'sparkle' },
  { key: 'learned', label: 'Learned', title: 'What I have learned', icon: 'chart' },
];

function Shell() {
  const [tab, setTab] = useState<Tab>('today');
  const [fonts, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const off = useStore.persist.onFinishHydration(() => setHydrated(true));
    // never leave a blank screen if saved data or fonts cannot be loaded
    const timer = setTimeout(() => {
      setHydrated(true);
      setWaited(true);
    }, 2500);
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);
  const ready = hydrated && (fonts || !!fontError || waited);
  const cur = TABS.find((t) => t.key === tab)!;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      {ready && (
        <>
          <View style={s.header}>
            <Text style={s.title} numberOfLines={1}>
              {cur.title}
            </Text>
          </View>
          <View style={{ flex: 1 }}>{tab === 'today' ? <TodayScreen /> : tab === 'next' ? <NextScreen /> : <LearnedScreen />}</View>
          <View style={s.nav}>
            {TABS.map((t) => {
              const on = t.key === tab;
              return (
                <Pressable key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} onPress={() => setTab(t.key)} style={s.navItem}>
                  <View style={[s.navBar, on && { backgroundColor: C.ink }]} />
                  <Icon name={t.icon} size={24} color={on ? C.text : C.muted} width={on ? 2 : 1.6} />
                  <Text style={[s.navText, on && { color: C.text, fontWeight: '700' }]} numberOfLines={1}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '700', color: C.text, letterSpacing: -0.6 },
  nav: { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line },
  navItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingBottom: 8 },
  navBar: { alignSelf: 'stretch', height: 2, backgroundColor: 'transparent', marginBottom: 6 },
  navText: { fontSize: 13, fontWeight: '500', color: C.muted, maxWidth: '100%' },
});
