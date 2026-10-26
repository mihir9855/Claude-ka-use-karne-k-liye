import { ScrollView, View } from 'react-native';
import type { PlanRules } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Chip, Label, Row } from './kit';

export function RulesScreen() {
  const lang = useStore((s) => s.lang);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const tx = (k: StrKey) => t(lang, k);
  const opts: { value: PlanRules['stapleRule']; label: string }[] = [
    { value: 'any', label: tx('stapleAny') },
    { value: 'rice', label: tx('stapleRice') },
    { value: 'bread', label: tx('stapleBread') },
    { value: 'alternate', label: tx('stapleAlt') },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 22 }}>
      <View style={{ gap: 8 }}>
        <Label>{tx('stapleQ')}</Label>
        <Row>
          {opts.map((o) => (
            <Chip key={o.value} label={o.label} on={rules.stapleRule === o.value} onPress={() => setRules({ stapleRule: o.value })} />
          ))}
        </Row>
      </View>
      <Row>
        <Chip label={tx('ruleFried')} on={rules.avoidFried} onPress={() => setRules({ avoidFried: !rules.avoidFried })} />
        <Chip label={tx('ruleSweet')} on={rules.avoidSweet} onPress={() => setRules({ avoidSweet: !rules.avoidSweet })} />
        <Chip label={tx('ruleQuick')} on={rules.quickWeekdays} onPress={() => setRules({ quickWeekdays: !rules.quickWeekdays })} />
      </Row>
    </ScrollView>
  );
}
