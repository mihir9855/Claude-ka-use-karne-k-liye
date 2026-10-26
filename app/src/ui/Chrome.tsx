import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { BadgeArt, MealArt, NavArt, type BadgeArtKey, type NavArtKey } from './Art';
import { Icon } from './Icon';
import { C, RADIUS, SHADOW } from './theme';

/** Slim top bar: round menu (or back) button and a one-line title. */
export function AppHeader({ title, subtitle, onMenu, onBack, right }: { title: string; subtitle?: string; onMenu?: () => void; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={onBack ? 'Back' : 'Menu'} onPress={onBack ?? onMenu} hitSlop={6} style={({ pressed }) => [s.hBtn, pressed && { opacity: 0.7 }]}>
        <Icon name={onBack ? 'back' : 'menu'} size={22} color={C.text} width={2.4} />
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.hTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={s.hSub} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

export interface NavItem<K extends string> {
  key: K;
  label: StrKey;
  art: NavArtKey;
}

/** Floating dark bar with the main tabs. Each tab is a picture with a one-line label. */
export function BottomNav<K extends string>({ items, active, onPick }: { items: NavItem<K>[]; active: K; onPick: (k: K) => void }) {
  const lang = useStore((st) => st.lang);
  return (
    <View style={s.navWrap}>
      <View style={s.nav}>
        {items.map((it) => {
          const on = it.key === active;
          return (
            <Pressable
              key={it.key}
              accessibilityRole="tab"
              accessibilityLabel={t(lang, it.label)}
              accessibilityState={{ selected: on }}
              onPress={() => onPick(it.key)}
              style={[s.navItem, on && { backgroundColor: C.inkSoft }]}
            >
              <NavArt name={it.art} on={on} size={26} />
              <Text style={[s.navText, on && { color: '#fff', fontWeight: '700' }]} numberOfLines={1}>
                {t(lang, it.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export interface DrawerItem {
  key: string;
  label: StrKey;
  badge: BadgeArtKey | 'home';
  onPress: () => void;
}

/** Slide-in menu on a dark panel; every entry has its own little picture. */
export function Drawer({ sections, onClose }: { sections: { title?: StrKey; items: DrawerItem[] }[]; onClose: () => void }) {
  const lang = useStore((st) => st.lang);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(23,20,60,0.55)' }]} />
      <View style={s.panel}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 4 }}>
          <View style={s.brandRow}>
            <MealArt slot="lunch" size={44} />
            <Text style={s.brand} numberOfLines={1}>
              {t(lang, 'appName')}
            </Text>
          </View>
          {sections.map((sec, i) => (
            <View key={i} style={{ marginTop: 18, gap: 4 }}>
              {sec.title && (
                <Text style={s.secTitle} numberOfLines={1}>
                  {t(lang, sec.title)}
                </Text>
              )}
              {sec.items.map((it) => (
                <Pressable
                  key={it.key}
                  accessibilityRole="button"
                  accessibilityLabel={t(lang, it.label)}
                  onPress={() => {
                    onClose();
                    it.onPress();
                  }}
                  style={({ pressed }) => [s.item, pressed && { backgroundColor: C.inkSoft }]}
                >
                  <View style={s.badge}>{it.badge === 'home' ? <NavArt name="plan" on size={28} /> : <BadgeArt name={it.badge} size={28} />}</View>
                  <Text style={s.itemText} numberOfLines={1}>
                    {t(lang, it.label)}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 10 },
  hBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', ...SHADOW },
  hTitle: { color: C.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  hSub: { color: C.muted, fontSize: 13 },
  navWrap: { paddingHorizontal: 14, paddingBottom: 8, paddingTop: 4 },
  nav: { flexDirection: 'row', gap: 6, backgroundColor: C.ink, borderRadius: RADIUS.xl, padding: 6, ...SHADOW, shadowOpacity: 0.25 },
  navItem: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8, borderRadius: RADIUS.lg },
  navText: { fontSize: 12, fontWeight: '500', color: '#A9A5D6', maxWidth: '100%' },
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '80%', maxWidth: 330, backgroundColor: C.ink },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5, flexShrink: 1 },
  secTitle: { fontSize: 11, fontWeight: '700', color: '#8C88C4', textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 8, marginBottom: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 52, paddingHorizontal: 8, borderRadius: RADIUS.md },
  badge: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#F4F3FB', alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: 16, color: '#fff', fontWeight: '600', flexShrink: 1 },
});
