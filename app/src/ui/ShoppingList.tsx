import { useMemo, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { todayStr } from '../core/dates';
import { AISLES, aisleOf, type Aisle, groupShopping, shoppingHtml, shoppingText } from '../core/shopping';
import { INGREDIENT_BY_ID, INGREDIENTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { AisleArt } from './Art';
import { Icon } from './Icon';
import { Button, Chip, Collapse, Muted, Pill, Row } from './kit';
import { C, RADIUS, SHADOW } from './theme';

/** Every food, grouped by store aisle, tap to put it on (or take it off) the list. */
function Picker({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const shopping = useStore((s) => s.shopping);
  const add = useStore((s) => s.addToShopping);
  const remove = useStore((s) => s.removeFromShopping);
  const mine = useStore((s) => s.customIngredients);
  const all = useMemo(() => INGREDIENTS.filter((i) => !i.basic || ['oil', 'sugar', 'salt'].includes(i.id)), [mine]);
  return (
    <View style={{ gap: 10 }}>
      {AISLES.map((a) => {
        const items = all.filter((i) => aisleOf(i) === a);
        if (items.length === 0) return null;
        return (
          <Collapse key={a} title={t(lang, `aisle_${a}` as StrKey)} summary={`${items.filter((i) => shopping[i.id] !== undefined).length}/${items.length}`}>
            <Row>
              {items.map((i) => (
                <Chip key={i.id} tone="accent" label={i.name[lang]} on={shopping[i.id] !== undefined} onPress={() => (shopping[i.id] !== undefined ? remove(i.id) : add([{ id: i.id }]))} />
              ))}
            </Row>
          </Collapse>
        );
      })}
      <Button kind="soft" label={t(lang, 'close')} onPress={onClose} />
    </View>
  );
}

export function ShoppingList({ onAddOwn, planItems = {}, usedIn = {} }: { onAddOwn: () => void; /** what the week's plan needs, id -> grams */ planItems?: Record<string, number>; /** which dishes need an item, id -> short text */ usedIn?: Record<string, string> }) {
  const lang = useStore((s) => s.lang);
  const manual = useStore((s) => s.shopping);
  const bought = useStore((s) => s.markBought);
  const remove = useStore((s) => s.removeFromShopping);
  const mine = useStore((s) => s.customIngredients);
  const [picking, setPicking] = useState(false);
  const [notice, setNotice] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  // one list: what the plan needs plus what was added by hand
  const shopping = useMemo(() => {
    const merged: Record<string, number> = { ...planItems };
    for (const [id, g] of Object.entries(manual)) merged[id] = Math.max(merged[id] ?? 0, g);
    return merged;
  }, [planItems, manual]);
  const groups = useMemo(() => groupShopping(shopping, INGREDIENT_BY_ID, lang), [shopping, lang, mine]);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  const aisleName = (a: Aisle) => tx(`aisle_${a}` as StrKey);
  const text = () => shoppingText(groups, aisleName, tx('listTitle'), tx('g'));
  const say = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(''), 3000);
  };
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(text());
      say(tx('copied'));
    } catch {
      say(tx('copyFailed'));
    }
  };
  const share = async () => {
    try {
      await Share.share({ message: text() });
    } catch {
      /* sharing is not available here */
    }
  };
  const pdf = async () => {
    try {
      const html = shoppingHtml(groups, aisleName, tx('listTitle'), tx('g'), todayStr());
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: tx('listTitle') });
      else say(uri);
    } catch {
      say(tx('pdfFailed'));
    }
  };

  if (picking) return <Picker onClose={() => setPicking(false)} />;

  return (
    <View style={{ gap: 16 }}>
      <View style={s.hero}>
        <View style={s.heroDot} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <Text style={s.heroBig} numberOfLines={1}>
            {count === 0 ? tx('allSet') : `${count} ${tx('itemsToBuy')}`}
          </Text>
          <Text style={s.heroSub} numberOfLines={1}>
            {tx('listTitle')}
          </Text>
        </View>
        <AisleArt aisle="other" size={64} />
      </View>

      <Row>
        <Button icon="plus" kind="ink" label={tx('addItemBuy')} onPress={() => setPicking(true)} />
        <Button icon="pen" kind="soft" label={tx('addOwnItem')} onPress={onAddOwn} />
      </Row>
      {count > 0 && (
        <Row>
          <Button icon="copy" kind="soft" label={tx('copyList')} onPress={copy} />
          <Button icon="file" kind="soft" label={tx('pdfList')} onPress={pdf} />
          <Button icon="share" kind="soft" label={tx('shareList')} onPress={share} />
        </Row>
      )}
      {!!notice && <Muted style={{ color: C.good }}>{notice}</Muted>}

      {count === 0 ? (
        <Muted>{tx('groceryEmpty')}</Muted>
      ) : (
        groups.map((g) => (
          <View key={g.aisle} style={s.aisle}>
            <View style={s.aisleHead}>
              <View style={s.aisleArt}>
                <AisleArt aisle={g.aisle} size={34} />
              </View>
              <Text style={s.aisleName} numberOfLines={1}>
                {aisleName(g.aisle)}
              </Text>
              <Pill label={String(g.items.length)} />
            </View>
            {g.items.map((it, i) => (
              <View key={it.id} style={[s.item, i > 0 && s.itemLine]}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: false }} accessibilityLabel={it.name} onPress={() => bought(it.id)} hitSlop={8} style={s.check}>
                  <Icon name="check" size={15} color={C.primary} width={3.2} />
                </Pressable>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.itemName} numberOfLines={1}>
                    {it.name}
                  </Text>
                  {usedIn[it.id] ? (
                    <Text style={s.itemUsed} numberOfLines={1}>
                      {usedIn[it.id]}
                    </Text>
                  ) : null}
                </View>
                {it.grams > 0 && (
                  <Text style={s.itemQty} numberOfLines={1}>
                    {`${it.grams} ${tx('g')}`}
                  </Text>
                )}
                {manual[it.id] !== undefined && planItems[it.id] === undefined && (
                  <Pressable accessibilityRole="button" accessibilityLabel={tx('remove')} onPress={() => remove(it.id)} hitSlop={8}>
                    <Icon name="close" size={18} color={C.muted} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.ink, borderRadius: RADIUS.xl, padding: 20, overflow: 'hidden', ...SHADOW },
  heroDot: { position: 'absolute', right: -30, top: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: '#19B58A', opacity: 0.25 },
  heroBig: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { color: '#B5B1E6', fontSize: 14 },
  aisle: { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, gap: 4, ...SHADOW },
  aisleHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 },
  aisleArt: { width: 46, height: 46, borderRadius: 16, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  aisleName: { flex: 1, minWidth: 0, fontSize: 17, fontWeight: '800', color: C.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50 },
  itemLine: { borderTopWidth: 1, borderTopColor: C.line },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  itemUsed: { fontSize: 12, color: C.muted },
  itemName: { minWidth: 0, fontSize: 16, fontWeight: '600', color: C.text },
  itemQty: { fontSize: 14, color: C.muted, fontWeight: '600', maxWidth: '40%' },
});
