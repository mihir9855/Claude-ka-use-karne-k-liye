import { useMemo, useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { AISLES, aisleOf, groupShopping, shoppingText } from '../core/shopping';
import { INGREDIENT_BY_ID, INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { Button, Chip, Collapse, Label, Muted, Row } from './kit';
import { C } from './theme';

/** Every food, grouped by store aisle, tap to put it on (or take it off) the list. */
function Picker({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const shopping = useStore((s) => s.shopping);
  const add = useStore((s) => s.addToShopping);
  const remove = useStore((s) => s.removeFromShopping);
  const mine = useStore((s) => s.customIngredients);
  const all = useMemo(() => INGREDIENTS.filter((i) => !i.basic || i.id === 'oil'), [mine]);
  return (
    <View style={{ gap: 10 }}>
      {AISLES.map((a) => {
        const items = all.filter((i) => aisleOf(i) === a);
        if (items.length === 0) return null;
        return (
          <Collapse key={a} title={t(lang, `aisle_${a}` as StrKey)} summary={`${items.filter((i) => shopping[i.id] !== undefined).length}/${items.length}`}>
            <Row>
              {items.map((i) => (
                <Chip
                  key={i.id}
                  tone="accent"
                  label={i.name[lang]}
                  on={shopping[i.id] !== undefined}
                  onPress={() => (shopping[i.id] !== undefined ? remove(i.id) : add([{ id: i.id }]))}
                />
              ))}
            </Row>
          </Collapse>
        );
      })}
      <Button kind="soft" label={t(lang, 'close')} onPress={onClose} />
    </View>
  );
}

export function ShoppingList({ onAddOwn }: { onAddOwn: () => void }) {
  const lang = useStore((s) => s.lang);
  const shopping = useStore((s) => s.shopping);
  const bought = useStore((s) => s.markBought);
  const remove = useStore((s) => s.removeFromShopping);
  const mine = useStore((s) => s.customIngredients);
  const [picking, setPicking] = useState(false);
  const tx = (k: StrKey) => t(lang, k);

  const groups = useMemo(() => groupShopping(shopping, INGREDIENT_BY_ID, lang), [shopping, lang, mine]);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  const share = async () => {
    const message = shoppingText(groups, (a) => tx(`aisle_${a}` as StrKey), tx('listTitle'), tx('g'));
    try {
      await Share.share({ message });
    } catch {
      /* sharing is not available here */
    }
  };

  if (picking) return <Picker onClose={() => setPicking(false)} />;

  return (
    <View style={{ gap: 16 }}>
      <Row>
        <Button icon="plus" kind="soft" label={tx('addItemBuy')} onPress={() => setPicking(true)} />
        <Button icon="plus" kind="soft" label={tx('addOwnItem')} onPress={onAddOwn} />
        {count > 0 && <Button icon="share" kind="soft" label={tx('shareList')} onPress={share} />}
      </Row>
      {count === 0 ? (
        <Muted>{tx('buyEmpty')}</Muted>
      ) : (
        <>
          <Muted>{tx('boughtHint')}</Muted>
          {groups.map((g) => (
            <View key={g.aisle} style={{ gap: 4 }}>
              <Label>
                {tx(`aisle_${g.aisle}` as StrKey)} · {g.items.length}
              </Label>
              {g.items.map((it) => (
                <Row key={it.id} style={{ flexWrap: 'nowrap', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: false }}
                    accessibilityLabel={it.name}
                    onPress={() => bought(it.id)}
                    hitSlop={8}
                    style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon name="check" size={14} color={C.primary} width={3} />
                  </Pressable>
                  <Text style={{ flex: 1, fontSize: 16, color: C.text }}>
                    {it.name}
                    {it.grams > 0 ? <Text style={{ color: C.muted }}>{`  ${it.grams} ${tx('g')}`}</Text> : null}
                  </Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={tx('remove')} onPress={() => remove(it.id)} hitSlop={8}>
                    <Icon name="close" size={18} color={C.muted} />
                  </Pressable>
                </Row>
              ))}
            </View>
          ))}
        </>
      )}
    </View>
  );
}
