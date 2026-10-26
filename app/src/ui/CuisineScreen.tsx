import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import type { Cuisine } from '../core/types';
import { BUILTIN_DISHES } from '../data/dishes';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { CUISINE_TONE, DishArt } from './Art';
import { Icon } from './Icon';
import { Label, Muted, Toggle } from './kit';
import { C, RADIUS, SHADOW } from './theme';

export const CUISINES: Cuisine[] = ['north', 'west', 'south', 'east', 'northeast', 'continental', 'indochinese'];
const ART: Record<Cuisine, 'dalBowl' | 'dosa' | 'idli' | 'riceBowl' | 'veggiePan' | 'salad' | 'paneerBowl'> = {
  north: 'paneerBowl',
  west: 'dalBowl',
  south: 'dosa',
  east: 'riceBowl',
  northeast: 'veggiePan',
  continental: 'salad',
  indochinese: 'riceBowl',
};

function CuisineTile({ cuisine, on, star, onPress, onStar }: { cuisine: Cuisine; on: boolean; star: boolean; onPress: () => void; onStar?: () => void }) {
  const lang = useStore((s) => s.lang);
  const name = t(lang, `cuisine_${cuisine}` as StrKey);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={name} accessibilityState={{ selected: on }} onPress={onPress} style={[s.tile, on && s.tileOn]}>
      {onStar && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Favourite ${name}`} onPress={onStar} hitSlop={8} style={s.star}>
          <Icon name="heart" size={16} color={star ? C.danger : C.muted} />
        </Pressable>
      )}
      <DishArt kind={ART[cuisine]} tone={CUISINE_TONE[cuisine]} size={64} />
      <Text style={[s.name, on && { color: C.primary }]} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

export function CuisineScreen() {
  const lang = useStore((s) => s.lang);
  const menu = useStore((s) => s.menu);
  const setMenu = useStore((s) => s.setMenu);
  const tx = (k: StrKey) => t(lang, k);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of BUILTIN_DISHES) if (d.cuisine) c[d.cuisine] = (c[d.cuisine] ?? 0) + 1;
    return c;
  }, []);
  void counts;
  const toggle = (c: Cuisine) => {
    const on = menu.cuisines.includes(c);
    const cuisines = on ? menu.cuisines.filter((x) => x !== c) : [...menu.cuisines, c];
    // a cuisine that is switched off cannot stay a favourite
    setMenu({ cuisines, usual: menu.usual.filter((x) => cuisines.length === 0 || cuisines.includes(x)) });
  };
  // up to two favourites; picking a third replaces the oldest
  const toggleUsual = (c: Cuisine) => setMenu({ usual: menu.usual.includes(c) ? menu.usual.filter((x) => x !== c) : [...menu.usual, c].slice(-2) });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 28 }}>
      <View style={{ gap: 8 }}>
        <Label>{tx('cuisinesInclude')}</Label>
        <Muted>{tx('cuisinesHint')}</Muted>
        <View style={s.grid}>
          {CUISINES.map((c) => (
            <CuisineTile key={c} cuisine={c} on={menu.cuisines.includes(c)} star={menu.usual.includes(c)} onPress={() => toggle(c)} onStar={() => toggleUsual(c)} />
          ))}
        </View>
        <Muted>{tx('usualQ')}</Muted>
      </View>
      <Toggle label={tx('includeNew')} on={menu.includeNew} onChange={(v) => setMenu({ includeNew: v })} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '47%', flexGrow: 1, minWidth: 0, alignItems: 'center', gap: 6, paddingVertical: 16, paddingHorizontal: 8, backgroundColor: C.card, borderRadius: RADIUS.xl, borderWidth: 2, borderColor: 'transparent', ...SHADOW },
  tileOn: { borderColor: C.primary, backgroundColor: C.primarySoft },
  name: { fontSize: 15, fontWeight: '700', color: C.text, maxWidth: '100%' },
  star: { position: 'absolute', right: 8, top: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});
