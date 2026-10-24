import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { lookupBarcode, detectItemsFromImage, ScanError, type BarcodeResult } from '../core/scan';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { Button, Chip, Field, H, Muted, Row } from './kit';
import { C } from './theme';

function Header({ title, onClose }: { title: string; onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  return (
    <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap', padding: 20, paddingBottom: 8 }}>
      <H>{title}</H>
      <Button kind="soft" icon="close" label={t(lang, 'close')} onPress={onClose} />
    </Row>
  );
}

/** Items found by a scan, all ticked, so one tap adds them. */
function Found({ ids, onAdd, onSkip, skipLabel }: { ids: string[]; onAdd: (ids: string[]) => void; onSkip?: () => void; skipLabel?: string }) {
  const lang = useStore((s) => s.lang);
  const [picked, setPicked] = useState<string[]>(ids);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  return (
    <View style={{ gap: 12 }}>
      <Row>
        {ids.map((id) => (
          <Chip key={id} label={INGREDIENT_BY_ID[id].name[lang]} on={picked.includes(id)} onPress={() => toggle(id)} />
        ))}
      </Row>
      <Row>
        {picked.length > 0 && <Button icon="plus" label={`${t(lang, 'addCount')} (${picked.length})`} onPress={() => onAdd(picked)} />}
        {onSkip && <Button kind="soft" label={skipLabel ?? t(lang, 'scanNext')} onPress={onSkip} />}
      </Row>
    </View>
  );
}

export function BarcodeScan({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const addToPantry = useStore((s) => s.addToPantry);
  const [perm, requestPerm] = useCameraPermissions();
  const [result, setResult] = useState<(BarcodeResult & { code: string }) | null>(null);
  const [error, setError] = useState<StrKey | null>(null);
  const busy = useRef(false);
  const tx = (k: StrKey) => t(lang, k);

  const onScan = async ({ data }: { data: string }) => {
    if (busy.current || result) return;
    busy.current = true;
    setError(null);
    try {
      setResult({ ...(await lookupBarcode(data)), code: data });
    } catch {
      setError('errNet');
      busy.current = false;
    }
  };
  const next = () => {
    setResult(null);
    busy.current = false;
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title={tx('scanBarcode')} onClose={onClose} />
      {!perm ? null : !perm.granted ? (
        <View style={{ padding: 20, gap: 12 }}>
          <Button label={tx('allowCamera')} onPress={requestPerm} />
        </View>
      ) : (
        <View style={{ flex: 1, margin: 20, marginTop: 8, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
            onBarcodeScanned={result ? undefined : onScan}
          />
          <View style={s.frame} pointerEvents="none" />
        </View>
      )}
      <View style={{ padding: 20, paddingTop: 0, minHeight: 120, gap: 10 }}>
        {error && <Text style={{ color: C.danger }}>{tx(error)}</Text>}
        {result && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>
              {result.found ? result.name || result.code : tx('notFound')}
            </Text>
            {result.ids.length > 0 ? (
              <Found
                key={result.code}
                ids={result.ids}
                onAdd={(ids) => {
                  addToPantry(ids);
                  next();
                }}
                onSkip={next}
              />
            ) : (
              <Button kind="soft" label={tx('scanNext')} onPress={next} />
            )}
          </>
        )}
      </View>
    </View>
  );
}

export function PhotoScan({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  const key = useStore((s) => s.geminiKey);
  const setKey = useStore((s) => s.setGeminiKey);
  const addToPantry = useStore((s) => s.addToPantry);
  const [draftKey, setDraftKey] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [ids, setIds] = useState<string[]>([]);
  const [error, setError] = useState<StrKey | null>(null);
  const tx = (k: StrKey) => t(lang, k);

  const pick = async (source: 'camera' | 'gallery') => {
    setError(null);
    try {
      const perm = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : { granted: true };
      if (!perm.granted) return setError('allowCamera');
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.5, base64: true };
      const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      const asset = res.canceled ? undefined : res.assets[0];
      if (!asset?.base64) return;
      setState('busy');
      const found = await detectItemsFromImage({ base64: asset.base64, mime: asset.mimeType ?? 'image/jpeg', apiKey: key });
      setIds(found);
      setState('done');
    } catch (e) {
      setState('idle');
      const kind = e instanceof ScanError ? e.kind : 'network';
      setError(kind === 'key' ? 'errKey' : kind === 'limit' ? 'errLimit' : 'errNet');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Header title={tx('scanPhoto')} onClose={onClose} />
      <View style={{ padding: 20, paddingTop: 8, gap: 16 }}>
        {!key ? (
          <View style={{ gap: 10 }}>
            <Muted>{tx('needKey')}</Muted>
            <Field label={tx('geminiKey')} value={draftKey} onChangeText={setDraftKey} autoCapitalize="none" autoCorrect={false} secureTextEntry />
            <Muted>{tx('keyHint')}</Muted>
            {draftKey.trim().length > 10 && <Button label={tx('save')} onPress={() => setKey(draftKey)} />}
          </View>
        ) : state === 'busy' ? (
          <Row>
            <ActivityIndicator color={C.primary} />
            <Muted>{tx('detecting')}</Muted>
          </Row>
        ) : state === 'done' ? (
          ids.length === 0 ? (
            <View style={{ gap: 10 }}>
              <Muted>{tx('nothingFound')}</Muted>
              <Button kind="soft" label={tx('scanNext')} onPress={() => setState('idle')} />
            </View>
          ) : (
            <Found
              ids={ids}
              onAdd={(picked) => {
                addToPantry(picked);
                onClose();
              }}
              onSkip={() => setState('idle')}
              skipLabel={tx('scanNext')}
            />
          )
        ) : (
          <View style={{ gap: 10 }}>
            <Button icon="camera" label={tx('takePhoto')} onPress={() => pick('camera')} />
            <Button icon="image" kind="soft" label={tx('fromGallery')} onPress={() => pick('gallery')} />
          </View>
        )}
        {error && <Text style={{ color: C.danger }}>{tx(error)}</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  frame: { position: 'absolute', left: '12%', right: '12%', top: '30%', bottom: '30%', borderWidth: 2, borderColor: '#fff', borderRadius: 12, opacity: 0.8 },
});
