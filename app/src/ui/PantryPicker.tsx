import { View } from 'react-native';
import type { Ingredient } from '../core/types';
import { INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { AisleArt } from './Art';
import { aisleOf } from '../core/shopping';
import { Chip, Collapse, Label, Row } from './kit';

export const GROUP_ORDER: Ingredient['group'][] = [
  'grain', 'flour', 'pulse', 'dairy', 'leafy', 'root', 'veg', 'fruit', 'nut', 'fat', 'other',
];

function groups(ids?: string[]) {
  return GROUP_ORDER.map((g) => ({
    g,
    items: INGREDIENTS.filter((i) => i.group === g && !i.basic && (!ids || ids.includes(i.id))),
  })).filter((x) => x.items.length > 0);
}

/** Pantry items shown shelf by shelf, so people find things the way they store them. */
export function PantryShelves({
  ids,
  collapsible,
}: {
  ids?: string[];
  /** true: each shelf is a tap-to-open card with a count. false: all shelves open. */
  collapsible?: boolean;
}) {
  const lang = useStore((s) => s.lang);
  const pantry = useStore((s) => s.pantry);
  const toggle = useStore((s) => s.togglePantry);
  useStore((s) => s.customIngredients); // re-render when the user adds or removes their own items

  return (
    <View style={{ gap: collapsible ? 10 : 18 }}>
      {groups(ids).map(({ g, items }) => {
        const title = t(lang, `group_${g}` as StrKey);
        const have = items.filter((i) => pantry.have[i.id]);
        const chips = (
          <Row>
            {items.map((i) => {
              const on = !!pantry.have[i.id];
              return (
                <Chip
                  key={i.id}
                  on={on}
                  label={i.name[lang]}
                  onPress={() => toggle(i.id)}
                />
              );
            })}
          </Row>
        );
        return collapsible ? (
          <Collapse
            key={g}
            lead={<AisleArt aisle={aisleOf(items[0])} size={34} />}
            title={`${title}  ${have.length}/${items.length}`}
            summary={have.length ? have.map((i) => i.name[lang]).join(', ') : undefined}
          >
            {chips}
          </Collapse>
        ) : (
          <View key={g} style={{ gap: 8 }}>
            <Label>{title}</Label>
            {chips}
          </View>
        );
      })}
    </View>
  );
}
