import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import type { Cuisine } from '../core/types';
import { BUILTIN_DISHES } from '../data/dishes';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Chip, Label, Muted, Row } from './kit';

export const CUISINES: Cuisine[] = ['north', 'west', 'south', 'east', 'northeast', 'continental', 'indochinese'];

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
  const toggle = (c: Cuisine) => {
    const on = menu.cuisines.includes(c);
    const cuisines = on ? menu.cuisines.filter((x) => x !== c) : [...menu.cuisines, c];
    // a cuisine that is switched off cannot stay a favourite
    setMenu({ cuisines, usual: menu.usual.filter((x) => cuisines.length === 0 || cuisines.includes(x)) });
  };
  // up to two favourites; picking a third replaces the oldest
  const toggleUsual = (c: Cuisine) =>
    setMenu({ usual: menu.usual.includes(c) ? menu.usual.filter((x) => x !== c) : [...menu.usual, c].slice(-2) });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
      <View style={{ gap: 8 }}>
        <Label>{tx('cuisinesInclude')}</Label>
        <Muted>{tx('cuisinesHint')}</Muted>
        <Row>
          {CUISINES.map((c) => (
            <Chip key={c} label={`${tx(`cuisine_${c}` as StrKey)} · ${counts[c] ?? 0}`} on={menu.cuisines.includes(c)} onPress={() => toggle(c)} />
          ))}
        </Row>
      </View>
      <View style={{ gap: 8 }}>
        <Label>{tx('usualQ')}</Label>
        <Row>
          {CUISINES.filter((c) => menu.cuisines.length === 0 || menu.cuisines.includes(c)).map((c) => (
            <Chip key={c} tone="accent" label={tx(`cuisine_${c}` as StrKey)} on={menu.usual.includes(c)} onPress={() => toggleUsual(c)} />
          ))}
        </Row>
      </View>
      <Row>
        <Chip label={tx('includeNew')} on={menu.includeNew} onPress={() => setMenu({ includeNew: !menu.includeNew })} />
      </Row>
    </ScrollView>
  );
}
