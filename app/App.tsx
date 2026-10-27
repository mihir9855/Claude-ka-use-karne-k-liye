import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './src/ui/Text';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { todayStr } from './src/core/dates';
import { t, type StrKey } from './src/i18n/strings';
import { useStore } from './src/state/store';
import { AppHeader, BottomNav, Drawer, type DrawerItem, type NavItem } from './src/ui/Chrome';
import { CuisineScreen } from './src/ui/CuisineScreen';
import { CustomizeScreen } from './src/ui/CustomizeScreen';
import { DishesScreen } from './src/ui/DishesScreen';
import { FamilyScreen } from './src/ui/FamilyScreen';
import { GroceryScreen } from './src/ui/GroceryScreen';
import { MealDetail } from './src/ui/MealDetail';
import { MenuScreen } from './src/ui/MenuScreen';
import { NavContext, type Nav, type Page, type Tab } from './src/ui/nav';
import { NutritionScreen } from './src/ui/NutritionScreen';
import { OnboardScreen } from './src/ui/OnboardScreen';
import { PantryScreen } from './src/ui/PantryScreen';
import { PlannerScreen } from './src/ui/PlannerScreen';
import { RulesScreen } from './src/ui/RulesScreen';
import { SettingsScreen } from './src/ui/SettingsScreen';
import { C } from './src/ui/theme';
import { UndoBar } from './src/ui/UndoBar';

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

const PAGE_TITLE: Record<string, StrKey> = {
  family: 'navFamily',
  cuisine: 'navCuisine',
  rules: 'navRules',
  menu: 'navMenu',
  customize: 'navCustomize',
  saved: 'navSaved',
  pantry: 'tabPantry',
  settings: 'navSettings',
  meal: 'mealDetail',
};

const TABS: NavItem<Tab>[] = [
  { key: 'planner', label: 'tabPlanner' },
  { key: 'grocery', label: 'tabGrocery' },
  { key: 'nutrition', label: 'tabNutrition' },
];

function Shell() {
  const [tab, setTab] = useState<Tab>('planner');
  const [stack, setStack] = useState<Page[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [nutDate, setNutDate] = useState(todayStr());
  const lang = useStore((st) => st.lang);
  const onboarded = useStore((st) => st.onboarded);
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  const [fonts, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
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

  const page = stack[stack.length - 1];
  const nav: Nav = {
    tab,
    setTab,
    go: (p) => setStack((st) => [...st, p]),
    back: () => setStack((st) => st.slice(0, -1)),
    nutDate,
    setNutDate,
  };

  // Android back button: close the menu, then leave the page
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (drawer) {
        setDrawer(false);
        return true;
      }
      if (stack.length > 0) {
        setStack((st) => st.slice(0, -1));
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [drawer, stack.length]);

  const open = (k: Exclude<Page['k'], 'meal'>) => () => setStack([{ k }]);
  const sections: { title?: StrKey; items: DrawerItem[] }[] = [
    { items: [{ key: 'home', label: 'tabPlanner', onPress: () => { setStack([]); setTab('planner'); } }] },
    {
      title: 'secPrefs',
      items: [
        { key: 'family', label: 'navFamily', onPress: open('family') },
        { key: 'cuisine', label: 'navCuisine', onPress: open('cuisine') },
        { key: 'rules', label: 'navRules', onPress: open('rules') },
      ],
    },
    {
      title: 'secKitchen',
      items: [
        { key: 'menu', label: 'navMenu', onPress: open('menu') },
        { key: 'customize', label: 'navCustomize', onPress: open('customize') },
        { key: 'saved', label: 'navSaved', onPress: open('saved') },
        { key: 'pantry', label: 'tabPantry', onPress: open('pantry') },
      ],
    },
    { items: [{ key: 'settings', label: 'navSettings', onPress: open('settings') }] },
  ];

  let body: ReactNode = null;
  if (ready && !onboarded) body = <OnboardScreen />;
  else if (ready && page) {
    switch (page.k) {
      case 'family': body = <FamilyScreen />; break;
      case 'cuisine': body = <CuisineScreen />; break;
      case 'rules': body = <RulesScreen />; break;
      case 'menu': body = <MenuScreen />; break;
      case 'customize': body = <CustomizeScreen />; break;
      case 'saved': body = <DishesScreen />; break;
      case 'pantry': body = <PantryScreen />; break;
      case 'settings': body = <SettingsScreen />; break;
      case 'meal': body = <MealDetail date={page.date} index={page.i} />; break;
    }
  } else if (ready) {
    body = tab === 'planner' ? <PlannerScreen /> : tab === 'grocery' ? <GroceryScreen /> : <NutritionScreen />;
  }

  const showChrome = ready && onboarded;
  const title = page ? t(lang, PAGE_TITLE[page.k]) : t(lang, TABS.find((x) => x.key === tab)!.label);

  return (
    <NavContext.Provider value={nav}>
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {showChrome && <AppHeader title={title} onMenu={() => setDrawer(true)} onBack={page ? nav.back : undefined} />}
        <View style={{ flex: 1 }}>{body}</View>
        <UndoBar />
        {showChrome && !page && <BottomNav items={TABS} active={tab} onPick={setTab} />}
        {drawer && showChrome && <Drawer sections={sections} onClose={() => setDrawer(false)} />}
      </SafeAreaView>
    </NavContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Guard><Shell /></Guard>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  bigBtn: { backgroundColor: C.primary, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
});
