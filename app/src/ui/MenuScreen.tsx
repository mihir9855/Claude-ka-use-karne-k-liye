import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Cuisine, Dish, DishRole } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useAllDishes, useStore } from '../state/store';
import { dishName } from './helpers';
import { Button, Chip, Label, Muted, Row, Search, Segmented } from './kit';
import { CUISINES } from './CuisineScreen';
import { useNav } from './nav';

type Tab = 'breakfast' | 'lunchdinner' | 'snack';
const ROLE_ORDER: DishRole[] = ['complete', 'main', 'staple', 'side', 'snack'];

/** Every dish, grouped; a tap takes a dish out of (or back into) the plan. */
export function MenuScreen() {
  const lang = useStore((s) => s.lang);
  const menu = useStore((s) => s.menu);
  const toggle = useStore((s) => s.toggleMenuDish);
  const setMenu = useStore((s) => s.setMenu);
  const nav = useNav();
  const [cui, setCui] = useState<Cuisine | 'all'>('all');
  const dishes = useAllDishes();
  const [tab, setTab] = useState<Tab>('lunchdinner');
  const [q, setQ] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  const inTab = (d: Dish) =>
    tab === 'breakfast' ? d.meals.includes('breakfast') : tab === 'snack' ? d.meals.includes('snack') : d.meals.includes('lunch') || d.meals.includes('dinner');
  const needle = q.trim().toLowerCase();
  const shown = useMemo(
    () => dishes.filter((d) => inTab(d) && (cui === 'all' || d.cuisine === cui) && (!needle || Object.values(d.name).some((n) => n.toLowerCase().includes(needle)))),
    [dishes, tab, needle, cui],
  );
  const offCount = Object.keys(menu.menuOff).length;
  const setAll = (on: boolean) => {
    const menuOff = { ...menu.menuOff };
    for (const d of shown) {
      if (on) delete menuOff[d.id];
      else menuOff[d.id] = true;
    }
    setMenu({ menuOff });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Muted>{tx('menuHint')}</Muted>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'breakfast', label: tx('cat_breakfast') },
          { value: 'lunchdinner', label: tx('menuLunchDinner') },
          { value: 'snack', label: tx('cat_snack') },
        ]}
      />
      <Row>
        <Chip label="All" on={cui === 'all'} onPress={() => setCui('all')} />
        {CUISINES.map((c) => (
          <Chip key={c} label={tx(`cuisine_${c}` as StrKey)} on={cui === c} onPress={() => setCui(c)} />
        ))}
      </Row>
      <Row>
        <Search value={q} onChangeText={setQ} placeholder={tx('search')} />
      </Row>
      <Row>
        <Button kind="soft" label="Select all" onPress={() => setAll(true)} />
        <Button kind="soft" label="Deselect all" onPress={() => setAll(false)} />
      </Row>
      <Muted>{`${dishes.length - offCount} of ${dishes.length} dishes on`}</Muted>
      <Row>
        <Button kind="soft" label="Add your own dish" onPress={() => nav.go({ k: 'saved' })} />
      </Row>
      {ROLE_ORDER.map((role) => {
        const list = shown.filter((d) => d.role === role);
        if (list.length === 0) return null;
        return (
          <View key={role} style={{ gap: 8 }}>
            <Label>{`${tx(`role_${role}` as StrKey)} · ${list.length}`}</Label>
            <Row>
              {list.map((d) => (
                <Chip
                  key={d.id}
                  label={dishName(d, lang)}
                  on={!menu.menuOff[d.id]}
                  dim={!menu.includeNew && menu.cuisines.length > 0 && !!d.cuisine && !menu.cuisines.includes(d.cuisine)}
                  onPress={() => toggle(d.id)}
                />
              ))}
            </Row>
          </View>
        );
      })}
    </ScrollView>
  );
}
