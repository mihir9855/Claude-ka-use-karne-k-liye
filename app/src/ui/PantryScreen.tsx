import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { lookupNutrition, type NutritionResult } from '../core/scan';
import type { Ingredient } from '../core/types';
import { GROUP_DEFAULTS } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Card, Chip, Field, H, Label, Muted, Row, Segmented } from './kit';
import { GROUP_ORDER } from './PantryPicker';
import { ShoppingList } from './ShoppingList';
import { C } from './theme';
import { PantryShelves } from './PantryPicker';
import { BarcodeScan, PhotoScan } from './ScanScreens';

function AddItem({ onDone, to = 'have' }: { onDone: () => void; to?: 'have' | 'buy' }) {
  const lang = useStore((s) => s.lang);
  const key = useStore((s) => s.geminiKey);
  const add = useStore((s) => s.addIngredient);
  const [name, setName] = useState('');
  const [group, setGroup] = useState<Ingredient['group'] | 'auto'>('auto');
  const [manual, setManual] = useState(false);
  const [protein, setProtein] = useState('');
  const [kcal, setKcal] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const tx = (k: StrKey) => t(lang, k);

  const save = async () => {
    const n = name.trim();
    if (!n || busy) return;
    setNote('');
    if (manual && kcal !== '') {
      add(n, group === 'auto' ? 'other' : group, { protein: Number(protein) || 0, kcal: Number(kcal) }, to);
      setNote(`${tx('addedWith')}: ${n}`);
    } else {
      setBusy(true);
      let found: NutritionResult | null = null;
      try {
        found = await lookupNutrition(n, key || undefined);
      } catch {
        found = null; // no internet, bad key or limit: fall back to the shelf average
      }
      setBusy(false);
      const g = group === 'auto' ? found?.group ?? 'other' : group;
      add(n, g, found ? { kcal: found.kcal, protein: found.protein, carbs: found.carbs, fat: found.fat, fiber: found.fiber } : undefined, to);
      const src = found ? (found.source === 'ai' ? tx('srcAi') : tx('srcWeb')) : tx('srcEstimate');
      const d = found ?? GROUP_DEFAULTS[g];
      setNote(`${tx('addedWith')}: ${n} · ${d.kcal} ${tx('kcal')} · ${d.protein} ${tx('g')} ${tx('proteinShort')} ${tx('perHundred')} (${tx('approx')}, ${src})`);
    }
    setName('');
    setProtein('');
    setKcal('');
  };

  return (
    <Card>
      <Field label={tx('itemName')} value={name} onChangeText={setName} onSubmitEditing={save} returnKeyType="done" />
      <View>
        <Label>{tx('chooseShelf')}</Label>
        <Row>
          <Chip label={tx('shelfAuto')} on={group === 'auto'} onPress={() => setGroup('auto')} />
          {GROUP_ORDER.map((g) => (
            <Chip key={g} label={tx(`group_${g}` as StrKey)} on={group === g} onPress={() => setGroup(g)} />
          ))}
        </Row>
      </View>
      <Row>
        <Chip label={tx('editNumbers')} on={manual} onPress={() => setManual(!manual)} />
      </Row>
      {manual && (
        <Row style={{ flexWrap: 'nowrap' }}>
          <Field label={`${tx('proteinShort')} (${tx('g')})`} keyboardType="numeric" value={protein} onChangeText={setProtein} />
          <Field label={tx('kcal')} keyboardType="numeric" value={kcal} onChangeText={setKcal} />
        </Row>
      )}
      {busy && (
        <Row>
          <ActivityIndicator color={C.primary} />
          <Muted>{tx('lookingUp')}</Muted>
        </Row>
      )}
      {!!note && <Muted style={{ color: C.primary }}>{note}</Muted>}
      <Row>
        {name.trim().length > 0 && !busy && <Button icon="plus" label={tx('addShort')} onPress={save} />}
        <Button kind="soft" label={tx('close')} onPress={onDone} />
      </Row>
    </Card>
  );
}

export function PantryScreen() {
  const lang = useStore((s) => s.lang);
  const have = useStore((s) => s.pantry.have);
  const clear = useStore((s) => s.clearPantry);
  const strict = useStore((s) => s.strictPantry);
  const setStrict = useStore((s) => s.setStrictPantry);
  const count = Object.values(have).filter(Boolean).length;
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<'home' | 'buy'>('home');
  const buyCount = useStore((s) => Object.keys(s.shopping).length);
  const mine = useStore((s) => s.customIngredients);
  const removeIngredient = useStore((s) => s.removeIngredient);
  const [scan, setScan] = useState<'barcode' | 'photo' | null>(null);
  if (scan === 'barcode') return <BarcodeScan onClose={() => setScan(null)} />;
  if (scan === 'photo') return <PhotoScan onClose={() => setScan(null)} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <H>{t(lang, 'tabPantry')}</H>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'home', label: `${t(lang, 'tabHome')} · ${count}` },
          { value: 'buy', label: `${t(lang, 'tabBuy')}${buyCount ? ` · ${buyCount}` : ''}` },
        ]}
      />
      {adding && <AddItem to={view === 'buy' ? 'buy' : 'have'} onDone={() => setAdding(false)} />}
      {view === 'buy' ? (
        <ShoppingList onAddOwn={() => setAdding(true)} />
      ) : (
        <>
          <Row style={{ flexWrap: 'nowrap' }}>
            <View style={{ flex: 1 }}>
              <Button icon="barcode" label={t(lang, 'scanBarcode')} onPress={() => setScan('barcode')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button icon="camera" label={t(lang, 'scanPhoto')} onPress={() => setScan('photo')} />
            </View>
          </Row>
          <Row>
            {!adding && <Button icon="plus" kind="soft" label={t(lang, 'addOwnItem')} onPress={() => setAdding(true)} />}
            {count > 0 && <Button kind="soft" label={t(lang, 'clearPantry')} onPress={clear} />}
          </Row>
          <Row>
            <Chip label={t(lang, 'strictPantry')} on={strict} onPress={() => setStrict(!strict)} />
          </Row>
          <Muted>{t(lang, 'pantryHint')}</Muted>
          <PantryShelves collapsible />
          {mine.length > 0 && (
            <View style={{ gap: 8 }}>
              <Label>{t(lang, 'yourItems')}</Label>
              {mine.map((i) => (
                <Row key={i.id} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                  <Muted style={{ flex: 1, color: C.text }}>
                    {i.name[lang]} · {t(lang, `group_${i.group}` as StrKey)}
                  </Muted>
                  <Button icon="trash" kind="danger" label={t(lang, 'remove')} onPress={() => removeIngredient(i.id)} />
                </Row>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
