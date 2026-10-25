import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { lookupNutrition, type NutritionResult } from '../core/scan';
import type { Ingredient } from '../core/types';
import { GROUP_DEFAULTS, INGREDIENTS } from '../data/ingredients';
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

/** Only what is at home, shelf by shelf; one tap sends an item to the buy list. */
function FinishPicker({ onDone }: { onDone: () => void }) {
  const lang = useStore((s) => s.lang);
  const have = useStore((s) => s.pantry.have);
  const finish = useStore((s) => s.finishItem);
  const mine = useStore((s) => s.customIngredients);
  const [note, setNote] = useState('');
  const tx = (k: StrKey) => t(lang, k);
  const ids = Object.keys(have).filter((id) => have[id]);
  const shelves = GROUP_ORDER.map((g) => ({
    g,
    items: INGREDIENTS.filter((i) => i.group === g && have[i.id]),
  })).filter((x) => x.items.length > 0);
  void mine;
  return (
    <Card>
      <Muted>{tx('finishHint')}</Muted>
      {ids.length === 0 && <Muted>{tx('nothingHome')}</Muted>}
      {shelves.map(({ g, items }) => (
        <View key={g} style={{ gap: 6 }}>
          <Label>{tx(`group_${g}` as StrKey)}</Label>
          <Row>
            {items.map((i) => (
              <Chip
                key={i.id}
                tone="accent"
                label={i.name[lang]}
                onPress={() => {
                  finish(i.id);
                  setNote(`${i.name[lang]}: ${tx('moved')}`);
                }}
              />
            ))}
          </Row>
        </View>
      ))}
      {!!note && <Muted style={{ color: C.primary }}>{note}</Muted>}
      <Button label={tx('doneBtn')} onPress={onDone} />
    </Card>
  );
}

export function PantryScreen() {
  const lang = useStore((s) => s.lang);
  const have = useStore((s) => s.pantry.have);
  const mine = useStore((s) => s.customIngredients);
  const removeIngredient = useStore((s) => s.removeIngredient);
  const count = Object.values(have).filter(Boolean).length;
  const buyCount = useStore((s) => Object.keys(s.shopping).length);
  const [view, setView] = useState<'home' | 'buy'>('home');
  const [panel, setPanel] = useState<'none' | 'add' | 'name' | 'finish'>('none');
  const [scan, setScan] = useState<'barcode' | 'photo' | null>(null);
  const tx = (k: StrKey) => t(lang, k);
  if (scan === 'barcode') return <BarcodeScan onClose={() => setScan(null)} />;
  if (scan === 'photo') return <PhotoScan onClose={() => setScan(null)} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <H>{tx('tabPantry')}</H>
      <Segmented
        value={view}
        onChange={(v) => {
          setView(v);
          setPanel('none');
        }}
        options={[
          { value: 'home', label: `${tx('tabHome')} · ${count}` },
          { value: 'buy', label: `${tx('tabBuy')}${buyCount ? ` · ${buyCount}` : ''}` },
        ]}
      />

      {panel === 'name' && <AddItem to={view === 'buy' ? 'buy' : 'have'} onDone={() => setPanel('none')} />}

      {view === 'buy' ? (
        <ShoppingList onAddOwn={() => setPanel('name')} />
      ) : panel === 'finish' ? (
        <FinishPicker onDone={() => setPanel('none')} />
      ) : (
        <>
          {panel === 'add' ? (
            <Card>
              <Button icon="plus" label={tx('typeName')} onPress={() => setPanel('name')} />
              <Button icon="barcode" kind="soft" label={tx('scanBarcode')} onPress={() => setScan('barcode')} />
              <Button icon="camera" kind="soft" label={tx('scanPhoto')} onPress={() => setScan('photo')} />
              <Button kind="soft" label={tx('close')} onPress={() => setPanel('none')} />
            </Card>
          ) : (
            panel === 'none' && (
              <Row>
                <Button icon="plus" label={tx('addMenu')} onPress={() => setPanel('add')} />
                {count > 0 && <Button kind="soft" label={tx('finishedQ')} onPress={() => setPanel('finish')} />}
              </Row>
            )
          )}
          <Muted>{tx('pantryHint')}</Muted>
          <PantryShelves collapsible />
          {mine.length > 0 && (
            <View style={{ gap: 8 }}>
              <Label>{tx('yourItems')}</Label>
              {mine.map((i) => (
                <Row key={i.id} style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                  <Muted style={{ flex: 1, color: C.text }}>
                    {i.name[lang]} · {tx(`group_${i.group}` as StrKey)}
                  </Muted>
                  <Button icon="trash" kind="danger" label={tx('remove')} onPress={() => removeIngredient(i.id)} />
                </Row>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
