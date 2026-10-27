import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import type { Cuisine } from '../core/types';
import { BUILTIN_DISHES } from '../data/dishes';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon, IconTile, type IconName } from './Icon';
import { Label, Muted, Toggle } from './kit';
import { C, RADIUS, SHADOW } from './theme';

const ICON: Record<Cuisine, IconName> = {
  north: 'wheat',
  west: 'bean',
  south: 'bowl',
  east: 'drop',
  northeast: 'leaf',
  continental: 'apple',
  indochinese: 'coffee',
};

export const CUISINES: Cuisine[] = ['north', 'west', 'south', 'east', 'northeast', 'continental', 'indochinese'];
function CuisineTile({ cuisine, count, on, star, onPress, onStar }: { cuisine: Cuisine; count: number; on: boolean; star: boolean; onPress: () => void; onStar?: () => void }) {
  const lang = useStore((s) => s.lang);
  const name = t(lang, `cuisine_${cuisine}` as StrKey);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={name} accessibilityState={{ selected: on }} onPress={onPress} style={[s.tile, on && s.tileOn]}>
      {onStar && (
        <Pressable accessibilityRole="button" accessibilityLabel={`Favourite ${name}`} onPress={onStar} hitSlop={8} style={s.star}>
          <Icon name="heart" size={16} color={star ? C.danger : C.muted} />
        </Pressable>
      )}
      <IconTile name={ICON[cuisine]} size={48} icon={26} width={1.5} />
      <Text style={[s.name, on && { color: C.primary }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={s.count} numberOfLines={1}>{`${count} dishes`}</Text>
    </Pressable>
  );
}

export function CuisinePicker() {
  const lang = useStore((s) => s.lang);
  const menu = useStore((s) => s.menu);
  const setMenu = useStore((s) => s.setMenu);
  const tx = (k: StrKey) => t(lang, k);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of BUILTIN_DISHES) if (d.cuisine) c[d.cuisine] = (c[d.cuisine] ?? 0) + 1;
    return c;
  }, []);
  const toggle = (c: Cuisine) => {
    const on = menu.cuisines.includes(c);
    const cuisines = on ? menu.cuisines.filter((x) => x !== c) : [...menu.cuisines, c];
    // a cuisine that is switched off cannot stay a favourite
    setMenu({ cuisines, usual: menu.usual.filter((x) => cuisines.length === 0 || cuisines.includes(x)) });
  };
  // up to two favourites; picking a third replaces the oldest
  const toggleUsual = (c: Cuisine) => setMenu({ usual: menu.usual.includes(c) ? menu.usual.filter((x) => x !== c) : [...menu.usual, c].slice(-2) });

  return (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Label>{tx('cuisinesInclude')}</Label>
        <Muted>{tx('cuisinesHint')}</Muted>
        <View style={s.grid}>
          {CUISINES.map((c) => (
            <CuisineTile key={c} cuisine={c} count={counts[c] ?? 0} on={menu.cuisines.includes(c)} star={menu.usual.includes(c)} onPress={() => toggle(c)} onStar={() => toggleUsual(c)} />
          ))}
        </View>
        <Muted>{tx('usualQ')}</Muted>
      </View>
      <Toggle label={tx('includeNew')} on={menu.includeNew} onChange={(v) => setMenu({ includeNew: v })} />
    </View>
  );
}

export function CuisineScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
      <CuisinePicker />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '47%', flexGrow: 1, minWidth: 0, alignItems: 'flex-start', gap: 2, paddingVertical: 14, paddingLeft: 14, paddingRight: 14, backgroundColor: C.card, borderRadius: RADIUS.xl, ...SHADOW },
  tileOn: { borderColor: C.primary, backgroundColor: C.primarySoft },
  name: { fontSize: 15, fontWeight: '700', color: C.text, maxWidth: '100%' },
  count: { fontSize: 12, color: C.muted, fontWeight: '600', maxWidth: '100%' },
  star: { position: 'absolute', right: 8, top: 8, width: 30, height: 30, borderRadius: 8, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
});
