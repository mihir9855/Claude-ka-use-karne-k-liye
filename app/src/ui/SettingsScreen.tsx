import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { t } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Collapse, Field, Label, Muted, Row, Segmented } from './kit';

export function SettingsScreen() {
  const lang = useStore((s) => s.lang);
  const mealCount = useStore((s) => s.mealCount);
  const setMealCount = useStore((s) => s.setMealCount);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const resetAll = useStore((s) => s.resetAll);
  const geminiKey = useStore((s) => s.geminiKey);
  const setGeminiKey = useStore((s) => s.setGeminiKey);
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 6 }}>
        <Label>{t(lang, 'mealsPerDay')}</Label>
        <Segmented
          value={mealCount}
          onChange={setMealCount}
          options={(['auto', 3, 4, 5, 6] as const).map((n) => ({ value: n, label: n === 'auto' ? t(lang, 'auto') : String(n) }))}
        />
      </View>
      <Collapse icon="sparkle" title={t(lang, 'smartScan')} summary={geminiKey ? '••••' + geminiKey.slice(-4) : undefined}>
        <Field label={t(lang, 'geminiKey')} value={geminiKey} onChangeText={setGeminiKey} autoCapitalize="none" autoCorrect={false} secureTextEntry />
        <Muted>{t(lang, 'keyHint')}</Muted>
      </Collapse>
      <Button kind="soft" label={t(lang, 'redoSetup')} onPress={() => setOnboarded(false)} />
      {confirmReset ? (
        <View style={{ gap: 8 }}>
          <Muted>{t(lang, 'sure')}</Muted>
          <Row>
            <Button kind="danger" icon="trash" label={t(lang, 'yesDelete')} onPress={() => resetAll()} />
            <Button kind="soft" label={t(lang, 'no')} onPress={() => setConfirmReset(false)} />
          </Row>
        </View>
      ) : (
        <Button kind="danger" label={t(lang, 'resetAll')} onPress={() => setConfirmReset(true)} />
      )}
    </ScrollView>
  );
}
