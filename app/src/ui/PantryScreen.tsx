import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import type { Ingredient } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Card, Chip, Field, H, Label, Muted, Row } from './kit';
import { GROUP_ORDER } from './PantryPicker';
import { PantryShelves } from './PantryPicker';
import { BarcodeScan, PhotoScan } from './ScanScreens';

function AddItem({ onDone }: { onDone: () => void }) {
  const lang = useStore((s) => s.lang);
  const add = useStore((s) => s.addIngredient);
  const [name, setName] = useState('');
  const [group, setGroup] = useState<Ingredient['group']>('veg');
  const [protein, setProtein] = useState('');
  const [kcal, setKcal] = useState('');
  const tx = (k: StrKey) => t(lang, k);
  const save = () => {
    add(name, group, protein === '' ? undefined : Number(protein), kcal === '' ? undefined : Number(kcal));
    setName('');
    setProtein('');
    setKcal('');
  };
  return (
    <Card>
      <Field label={tx('itemName')} value={name} onChangeText={setName} />
      <View>
        <Label>{tx('chooseShelf')}</Label>
        <Row>
          {GROUP_ORDER.map((g) => (
            <Chip key={g} label={tx(`group_${g}` as StrKey)} on={group === g} onPress={() => setGroup(g)} />
          ))}
        </Row>
      </View>
      <Label>{tx('optNutrition')}</Label>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Field label={`${tx('proteinShort')} (${tx('g')})`} keyboardType="numeric" value={protein} onChangeText={setProtein} />
        <Field label={tx('kcal')} keyboardType="numeric" value={kcal} onChangeText={setKcal} />
      </Row>
      <Row>
        {name.trim().length > 0 && <Button icon="plus" label={tx('addShort')} onPress={save} />}
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
  const mine = useStore((s) => s.customIngredients);
  const removeIngredient = useStore((s) => s.removeIngredient);
  const [scan, setScan] = useState<'barcode' | 'photo' | null>(null);
  if (scan === 'barcode') return <BarcodeScan onClose={() => setScan(null)} />;
  if (scan === 'photo') return <PhotoScan onClose={() => setScan(null)} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <View style={{ flex: 1 }}>
          <H>{t(lang, 'tabPantry')}</H>
          <Muted>
            {count} {t(lang, 'itemsHome')}
          </Muted>
        </View>
        {count > 0 && <Button kind="soft" label={t(lang, 'clearPantry')} onPress={clear} />}
      </Row>
      <Row style={{ flexWrap: 'nowrap' }}>
        <View style={{ flex: 1 }}>
          <Button icon="barcode" label={t(lang, 'scanBarcode')} onPress={() => setScan('barcode')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button icon="camera" label={t(lang, 'scanPhoto')} onPress={() => setScan('photo')} />
        </View>
      </Row>
      {adding ? (
        <AddItem onDone={() => setAdding(false)} />
      ) : (
        <Button icon="plus" kind="soft" label={t(lang, 'addOwnItem')} onPress={() => setAdding(true)} />
      )}
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
              <Muted style={{ flex: 1, color: '#161614' }}>
                {i.name[lang]} · {t(lang, `group_${i.group}` as StrKey)}
              </Muted>
              <Button icon="trash" kind="danger" label={t(lang, 'remove')} onPress={() => removeIngredient(i.id)} />
            </Row>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
