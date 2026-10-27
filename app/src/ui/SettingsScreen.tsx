import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { gemini, ScanError } from '../core/scan';
import { t } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, Collapse, Field, Label, Muted, Pill, Row, Segmented } from './kit';
import { useNav } from './nav';

export function SettingsScreen() {
  const lang = useStore((s) => s.lang);
  const mealCount = useStore((s) => s.mealCount);
  const setMealCount = useStore((s) => s.setMealCount);
  const setOnboarded = useStore((s) => s.setOnboarded);
  const resetAll = useStore((s) => s.resetAll);
  const geminiKey = useStore((s) => s.geminiKey);
  const setGeminiKey = useStore((s) => s.setGeminiKey);
  const [confirmReset, setConfirmReset] = useState(false);
  const nav = useNav();
  const [test, setTest] = useState<'idle' | 'busy' | 'ok' | 'key' | 'limit' | 'network' | 'bad'>('idle');
  const runTest = async () => {
    setTest('busy');
    try {
      await gemini([{ text: 'Reply with {"ok":true}' }], geminiKey.trim());
      setTest('ok');
    } catch (e) {
      setTest(e instanceof ScanError ? e.kind : 'bad');
    }
  };
  const msg = { ok: 'Key works', key: 'Key not accepted', limit: 'Free limit reached', network: 'No internet', bad: 'Could not check the key', busy: 'Checking...', idle: '' }[test];
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
      <Collapse defaultOpen={!geminiKey} icon="sparkle" title={t(lang, 'smartScan')} summary={geminiKey ? '••••' + geminiKey.slice(-4) : undefined}>
        <Field label={t(lang, 'geminiKey')} value={geminiKey} onChangeText={(v) => { setGeminiKey(v.trim()); setTest('idle'); }} autoCapitalize="none" autoCorrect={false} secureTextEntry />
        <Row>
          <Button label="Test key" kind="soft" onPress={runTest} />
          {test !== 'idle' && <Pill label={msg} tone={test === 'ok' ? 'good' : test === 'busy' ? 'neutral' : 'bad'} />}
        </Row>
        <Muted>{t(lang, 'keyHint')}</Muted>
      </Collapse>
      <Button label="Done" onPress={() => nav.back()} />
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
