import { ScrollView, View } from 'react-native';
import type { Ingredient } from '../core/types';
import { INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Chip, H, Label, Muted, Row } from './kit';

const GROUPS: Ingredient['group'][] = ['grain', 'pulse', 'dairy', 'veg', 'fruit', 'nut', 'fat', 'other'];

export function PantryScreen() {
  const lang = useStore((s) => s.lang);
  const pantry = useStore((s) => s.pantry);
  const cycle = useStore((s) => s.cyclePantry);
  const clear = useStore((s) => s.clearPantry);
  const strict = useStore((s) => s.strictPantry);
  const setStrict = useStore((s) => s.setStrictPantry);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <H>{t(lang, 'tabPantry')}</H>
        <Button kind="soft" label={t(lang, 'clearPantry')} onPress={clear} />
      </Row>
      <Muted>{t(lang, 'pantryHint')}</Muted>
      <Row>
        <Chip label={t(lang, 'strictPantry')} on={strict} onPress={() => setStrict(!strict)} />
      </Row>
      {GROUPS.map((g) => {
        const items = INGREDIENTS.filter((i) => i.group === g && !i.basic);
        if (items.length === 0) return null;
        return (
          <View key={g} style={{ gap: 8 }}>
            <Label>{t(lang, `group_${g}` as StrKey)}</Label>
            <Row>
              {items.map((i) => {
                const have = !!pantry.have[i.id];
                const soon = !!pantry.soon[i.id];
                return (
                  <Chip
                    key={i.id}
                    tone={soon ? 'accent' : 'primary'}
                    on={have}
                    label={`${i.name[lang]}${soon ? ' ★' : ''}`}
                    onPress={() => cycle(i.id)}
                  />
                );
              })}
            </Row>
          </View>
        );
      })}
      <Muted>★ = {t(lang, 'useFirst')}</Muted>
    </ScrollView>
  );
}
