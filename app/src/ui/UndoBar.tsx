import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { t } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon } from './Icon';
import { C } from './theme';

/** Appears after a delete and offers to bring it back for a few seconds. */
export function UndoBar() {
  const lang = useStore((s) => s.lang);
  const snapshot = useStore((s) => s.undoSnapshot);
  const undo = useStore((s) => s.undoDelete);
  const clear = useStore((s) => s.clearUndo);

  useEffect(() => {
    if (!snapshot) return;
    const timer = setTimeout(clear, 8000);
    return () => clearTimeout(timer);
  }, [snapshot, clear]);

  if (!snapshot) return null;
  return (
    <View style={s.wrap} pointerEvents="box-none">
      <View style={s.bar}>
        <Text style={s.text}>{t(lang, 'removed')}</Text>
        <Pressable accessibilityRole="button" onPress={undo} style={s.btn}>
          <Icon name="undo" size={16} color="#fff" width={2.5} />
          <Text style={s.btnText}>{t(lang, 'undo')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 84, alignItems: 'center' },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.text, borderRadius: 14, paddingVertical: 10, paddingLeft: 16, paddingRight: 10 },
  text: { color: '#fff', fontSize: 14, flexShrink: 1 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
