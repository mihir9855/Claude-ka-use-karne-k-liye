// Browser build: camera and photo APIs need the Android app, so this version only explains that.
// (Keeping expo-camera out of the web bundle also avoids its lazily loaded barcode chunk.)
import { View } from 'react-native';
import { t } from '../i18n/strings';
import { useStore } from '../state/store';
import { Button, H, Muted, Row } from './kit';

function Unavailable({ title, onClose }: { title: string; onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
        <H>{title}</H>
        <Button kind="soft" icon="close" label={t(lang, 'close')} onPress={onClose} />
      </Row>
      <Muted>{t(lang, 'needApp')}</Muted>
    </View>
  );
}

export function BarcodeScan({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  return <Unavailable title={t(lang, 'scanBarcode')} onClose={onClose} />;
}

export function PhotoScan({ onClose }: { onClose: () => void }) {
  const lang = useStore((s) => s.lang);
  return <Unavailable title={t(lang, 'scanPhoto')} onClose={onClose} />;
}
