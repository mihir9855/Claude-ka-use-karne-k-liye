import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon, type IconName } from './Icon';
import { C } from './theme';

/** Green bar at the top of every screen: menu (or back) button, title, optional action. */
export function AppHeader({ title, subtitle, onMenu, onBack, right }: { title: string; subtitle?: string; onMenu?: () => void; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={s.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={onBack ? 'Back' : 'Menu'} onPress={onBack ?? onMenu} hitSlop={10} style={s.hBtn}>
        <Icon name={onBack ? 'back' : 'menu'} size={24} color="#fff" />
      </Pressable>
      <View style={{ flex: 1 }}>
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

export interface DrawerItem {
  key: string;
  label: StrKey;
  icon: IconName;
  onPress: () => void;
}

/** Slide-in side menu with grouped entries. */
export function Drawer({ sections, onClose }: { sections: { title?: StrKey; items: DrawerItem[] }[]; onClose: () => void }) {
  const lang = useStore((st) => st.lang);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={onClose} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View style={s.panel}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 6 }}>
          <Text style={s.brand}>{t(lang, 'appName')}</Text>
          {sections.map((sec, i) => (
            <View key={i} style={{ marginTop: 14, gap: 2 }}>
              {sec.title && <Text style={s.secTitle}>{t(lang, sec.title)}</Text>}
              {sec.items.map((it) => (
                <Pressable
                  key={it.key}
                  accessibilityRole="button"
                  onPress={() => {
                    onClose();
                    it.onPress();
                  }}
                  style={({ pressed }) => [s.item, pressed && { backgroundColor: C.surface }]}
                >
                  <Icon name={it.icon} size={22} color={C.primary} />
                  <Text style={s.itemText}>{t(lang, it.label)}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.header, paddingHorizontal: 16, paddingVertical: 14 },
  hBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  hSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '78%', maxWidth: 320, backgroundColor: C.bg },
  brand: { fontSize: 26, fontWeight: '800', color: C.primary, letterSpacing: -0.5 },
  secTitle: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12 },
  itemText: { fontSize: 16, color: C.text, fontWeight: '500' },
});
