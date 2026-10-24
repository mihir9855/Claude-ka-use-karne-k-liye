import { ScrollView, View } from 'react-native';
import { t } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Chip, H, Muted, Row } from './kit';
import { PantryShelves } from './PantryPicker';

export function PantryScreen() {
  const lang = useStore((s) => s.lang);
  const have = useStore((s) => s.pantry.have);
  const clear = useStore((s) => s.clearPantry);
  const strict = useStore((s) => s.strictPantry);
  const setStrict = useStore((s) => s.setStrictPantry);
  const count = Object.values(have).filter(Boolean).length;

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
      <Row>
        <Chip label={t(lang, 'strictPantry')} on={strict} onPress={() => setStrict(!strict)} />
      </Row>
      <Muted>{t(lang, 'pantryHint')}</Muted>
      <PantryShelves collapsible />
    </ScrollView>
  );
}
