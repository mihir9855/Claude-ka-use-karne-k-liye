import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import type { PlanRules } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { DishArt } from './Art';
import { Icon } from './Icon';
import { Label, Toggle } from './kit';
import { C, RADIUS, SHADOW } from './theme';

export function RulesScreen() {
  const lang = useStore((s) => s.lang);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const tx = (k: StrKey) => t(lang, k);
  const opts: { value: PlanRules['stapleRule']; label: StrKey; art: ReactArt }[] = [
    { value: 'any', label: 'stapleAny', art: 'veggiePan' },
    { value: 'rice', label: 'stapleRice', art: 'riceBowl' },
    { value: 'bread', label: 'stapleBread', art: 'rotiStack' },
    { value: 'alternate', label: 'stapleAlt', art: 'dalBowl' },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Label>{tx('stapleQ')}</Label>
        <View style={s.grid}>
          {opts.map((o) => {
            const on = rules.stapleRule === o.value;
            return (
              <Pressable key={o.value} accessibilityRole="button" accessibilityLabel={tx(o.label)} accessibilityState={{ selected: on }} onPress={() => setRules({ stapleRule: o.value })} style={[s.tile, on && s.tileOn]}>
                <DishArt kind={o.art} size={64} />
                <View style={s.tileLabelRow}>
                  {on && <Icon name="check" size={15} color={C.primary} width={3} />}
                  <Text style={[s.tileLabel, on && { color: C.primary }]} numberOfLines={1}>
                    {tx(o.label)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <Toggle label={tx('ruleFried')} on={rules.avoidFried} onChange={(v) => setRules({ avoidFried: v })} />
        <Toggle label={tx('ruleSweet')} on={rules.avoidSweet} onChange={(v) => setRules({ avoidSweet: v })} />
        <Toggle label={tx('ruleQuick')} on={rules.quickWeekdays} onChange={(v) => setRules({ quickWeekdays: v })} />
      </View>
    </ScrollView>
  );
}

type ReactArt = 'veggiePan' | 'riceBowl' | 'rotiStack' | 'dalBowl';

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '47%', flexGrow: 1, minWidth: 0, alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 8, backgroundColor: C.card, borderRadius: RADIUS.xl, borderWidth: 2, borderColor: 'transparent', ...SHADOW },
  tileOn: { borderColor: C.primary, backgroundColor: C.primarySoft },
  tileLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  tileLabel: { fontSize: 15, fontWeight: '700', color: C.text, flexShrink: 1 },
});
