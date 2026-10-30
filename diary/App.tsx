import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './src/state/store';
import { ChatScreen } from './src/ui/ChatScreen';
import { HomeScreen, type Tab } from './src/ui/HomeScreen';
import { Icon, type IconName } from './src/ui/Icon';
import { MenuScreen } from './src/ui/MenuScreen';
import { OnboardScreen } from './src/ui/OnboardScreen';
import { NutritionScreen } from './src/ui/NutritionScreen';
import { ProfileScreen } from './src/ui/ProfileScreen';
import { Text } from './src/ui/Text';
import { C } from './src/ui/theme';

const TABS: { key: Tab; label: string; title: string; icon: IconName }[] = [
  { key: 'home', label: 'Home', title: '', icon: 'home' },
  { key: 'chat', label: 'Chat', title: '', icon: 'pen' },
  { key: 'menu', label: 'Menu', title: 'Your menu', icon: 'calendar' },
  { key: 'nutrition', label: 'Nutrition', title: 'Nutrition', icon: 'chart' },
  { key: 'profile', label: 'Profile', title: 'Profile', icon: 'user' },
];

function Shell() {
  const [tab, setTab] = useState<Tab>('home');
  const [fonts, fontError] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });
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
  const onboarded = useStore((st) => st.onboarded);
  const ready = hydrated && (fonts || !!fontError || waited);
  const cur = TABS.find((t) => t.key === tab)!;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      {ready && !onboarded && <OnboardScreen />}
      {ready && onboarded && (
        <>
          {cur.title !== '' && (
            <View style={s.header}>
              <Text style={s.title} numberOfLines={1}>
                {cur.title}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            {tab === 'home' ? <HomeScreen go={setTab} /> : tab === 'chat' ? <ChatScreen /> : tab === 'menu' ? <MenuScreen /> : tab === 'nutrition' ? <NutritionScreen /> : <ProfileScreen />}
          </View>
          <View style={s.nav}>
            {TABS.map((t) => {
              const on = t.key === tab;
              return (
                <Pressable key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} onPress={() => setTab(t.key)} style={s.navItem}>
                  <View style={[s.navBar, on && { backgroundColor: C.accent }]} />
                  <Icon name={t.icon} size={22} color={on ? C.accent : C.muted} width={on ? 2 : 1.6} />
                  <Text style={[s.navText, on && { color: C.accent, fontWeight: '700' }]} numberOfLines={1}>
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
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  title: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  nav: { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line },
  navItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingBottom: 8 },
  navBar: { alignSelf: 'stretch', height: 2, backgroundColor: 'transparent', marginBottom: 6 },
  navText: { fontSize: 12, fontWeight: '500', color: C.muted, maxWidth: '100%' },
});
