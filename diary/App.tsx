import { SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk/400Regular';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black/400Regular';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from './src/state/store';
import { ChatScreen } from './src/ui/ChatScreen';
import { HomeScreen, type Tab } from './src/ui/HomeScreen';
import { Icon, type IconName } from './src/ui/Icon';
import { ListsScreen } from './src/ui/ListsScreen';
import { MenuScreen } from './src/ui/MenuScreen';
import { OnboardScreen } from './src/ui/OnboardScreen';
import { NutritionScreen } from './src/ui/NutritionScreen';
import { SettingsScreen } from './src/ui/SettingsScreen';
import { Text } from './src/ui/Text';
import { BORDER, C, setThemeName, themed } from './src/ui/theme';

const TABS: { key: Tab; label: string; title: string; icon: IconName }[] = [
  { key: 'home', label: 'Home', title: '', icon: 'home' },
  { key: 'chat', label: 'Chat', title: '', icon: 'pen' },
  { key: 'menu', label: 'Menu', title: 'Your menu', icon: 'calendar' },
  { key: 'lists', label: 'Lists', title: 'Lists', icon: 'cart' },
  { key: 'profile', label: 'Settings', title: 'Settings', icon: 'settings' },
];

function Shell({ dark }: { dark: boolean }) {
  const [tab, setTab] = useState<Tab>('home');
  const [fonts, fontError] = useFonts({ SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, ArchivoBlack_400Regular });
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
  const cur = TABS.find((t) => t.key === tab) ?? { key: tab, label: 'Nutrition', title: 'Nutrition', icon: 'chart' as IconName };
  const detail = tab === 'nutrition'; // opens from Home, so Home stays lit and Back returns there
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab === 'nutrition') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [tab]);

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {ready && !onboarded && <OnboardScreen />}
      {ready && onboarded && (
        <>
          {cur.title !== '' && (
            <View style={s.header}>
              {detail && (
                <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => setTab('home')} hitSlop={8} style={s.back}>
                  <Icon name="back" size={22} color={C.text} width={2} />
                </Pressable>
              )}
              <Text style={s.title} numberOfLines={1}>
                {cur.title}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            {tab === 'home' ? <HomeScreen go={setTab} /> : tab === 'chat' ? <ChatScreen /> : tab === 'menu' ? <MenuScreen /> : tab === 'nutrition' ? <NutritionScreen /> : tab === 'lists' ? <ListsScreen /> : <SettingsScreen />}
          </View>
          <View style={s.nav}>
            {TABS.map((t) => {
              const on = t.key === tab || (detail && t.key === 'home');
              return (
                <Pressable key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} onPress={() => setTab(t.key)} style={s.navItem}>
                  <View style={[s.navPill, on && { backgroundColor: C.hero, borderColor: C.line }]}>
                    <Icon name={t.icon} size={22} color={on ? C.onHero : C.text} width={on ? 2.4 : 1.8} />
                  </View>
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
  const pref = useStore((st) => st.theme);
  const accent = useStore((st) => st.accent);
  const system = useColorScheme();
  const base = pref === 'system' ? (system === 'light' ? 'light' : 'dark') : pref;
  const name = base;
  // styles read the palette when they are first used, so set it before the tree renders
  setThemeName(name, accent);
  return (
    <SafeAreaProvider>
      <Shell dark={name === "dark"} />
    </SafeAreaProvider>
  );
}

const s = themed(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  back: { width: 40, height: 40, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, fontFamily: 'display', fontSize: 30, fontWeight: '800', color: C.text, letterSpacing: -1.4 },
  nav: { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: BORDER, borderTopColor: C.line },
  navItem: { flex: 1, minWidth: 0, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 8, paddingBottom: 10 },
  navPill: { width: 62, height: 32, borderRadius: 16, borderWidth: BORDER, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 12, fontWeight: '500', color: C.muted, maxWidth: '100%' },
}));
