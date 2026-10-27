import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon, IconTile, type IconName } from './Icon';
import { C, RADIUS, SHADOW } from './theme';

/** Slim top bar: round menu (or back) button and a one-line title. */
export function AppHeader({ title, subtitle, onMenu, onBack, right }: { title: string; subtitle?: string; onMenu?: () => void; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={onBack ? 'Back' : 'Menu'} onPress={onBack ?? onMenu} hitSlop={6} style={({ pressed }) => [s.hBtn, pressed && { opacity: 0.6 }]}>
        <Icon name={onBack ? 'back' : 'menu'} size={22} color={C.text} width={2} />
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
  art: IconName;
}

/** Flat bar with the main tabs: a picture and a one-line label, a thin line marks the open one. */
export function BottomNav<K extends string>({ items, active, onPick }: { items: NavItem<K>[]; active: K; onPick: (k: K) => void }) {
  const lang = useStore((st) => st.lang);
  return (
    <View style={s.nav}>
      {items.map((it) => {
        const on = it.key === active;
        return (
          <Pressable key={it.key} accessibilityRole="tab" accessibilityLabel={t(lang, it.label)} accessibilityState={{ selected: on }} onPress={() => onPick(it.key)} style={s.navItem}>
            <View style={[s.navBar, on && { backgroundColor: C.ink }]} />
            <Icon name={it.art} size={24} color={on ? C.text : C.muted} width={on ? 2 : 1.6} />
            <Text style={[s.navText, on && { color: C.text, fontWeight: '700' }]} numberOfLines={1}>
              {t(lang, it.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export interface DrawerItem {
  key: string;
  label: StrKey;
  badge: IconName;
  onPress: () => void;
}

/** Slide-in menu: a light panel, each entry with its own small picture. */
export function Drawer({ sections, onClose }: { sections: { title?: StrKey; items: DrawerItem[] }[]; onClose: () => void }) {
  const lang = useStore((st) => st.lang);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(26,26,24,0.4)' }]} />
      <View style={s.panel}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 4 }}>
          <View style={s.brandRow}>
            <IconTile name="bowl" size={44} />
            <Text style={s.brand} numberOfLines={1}>
              {t(lang, 'appName')}
            </Text>
          </View>
          {sections.map((sec, i) => (
            <View key={i} style={{ marginTop: 22, gap: 2 }}>
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
                  style={({ pressed }) => [s.item, pressed && { backgroundColor: C.surface }]}
                >
                  <IconTile name={it.badge} size={38} icon={20} />
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  hBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  hTitle: { color: C.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  hSub: { color: C.muted, fontSize: 13 },
  nav: { flexDirection: 'row', backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line },
  navItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingBottom: 8 },
  navBar: { alignSelf: 'stretch', height: 2, backgroundColor: 'transparent' },
  navText: { fontSize: 13, fontWeight: '500', color: C.muted, maxWidth: '100%' },
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '78%', maxWidth: 320, backgroundColor: C.bg, borderRightWidth: 1, borderRightColor: C.line },
  brand: { color: C.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  secTitle: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 8, marginBottom: 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 38, height: 38, borderRadius: RADIUS.md, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, paddingHorizontal: 8, borderRadius: RADIUS.md },
  itemText: { fontSize: 16, color: C.text, fontWeight: '500', flexShrink: 1 },
});
