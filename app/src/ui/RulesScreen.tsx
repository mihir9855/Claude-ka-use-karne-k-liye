import { ScrollView, View } from 'react-native';
import type { PlanRules, ThaliStyle } from '../core/types';
import { t, type StrKey } from '../i18n/strings';
import { useStore } from '../state/store';
import { Icon, type IconName } from './Icon';
import { Choice, Field, Label, Toggle } from './kit';

const LUNCH: { v: ThaliStyle; t: string; sub: string }[] = [
  { v: 'any', t: 'Any', sub: 'Let the planner choose' },
  { v: 'full', t: 'Full thali', sub: 'Sabji or dal, roti or rice, side' },
  { v: 'simple', t: 'Simple', sub: 'Sabji or dal, roti or rice' },
  { v: 'onebowl', t: 'One bowl', sub: 'Khichdi, chilla, pulao' },
];
const DINNER: { v: ThaliStyle; t: string; sub: string }[] = [
  ...LUNCH,
  { v: 'light', t: 'Light dinner', sub: 'Khichdi, soup, bhurji, chilla' },
];

export function RulesScreen() {
  const lang = useStore((s) => s.lang);
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const tx = (k: StrKey) => t(lang, k);
  const opts: { value: PlanRules['stapleRule']; label: StrKey; art: IconName }[] = [
    { value: 'any', label: 'stapleAny', art: 'grid' },
    { value: 'rice', label: 'stapleRice', art: 'bowl' },
    { value: 'bread', label: 'stapleBread', art: 'wheat' },
    { value: 'alternate', label: 'stapleAlt', art: 'refresh' },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Label>{tx('stapleQ')}</Label>
        {opts.map((o) => (
          <Choice key={o.value} title={tx(o.label)} lead={<Icon name={o.art} size={22} width={1.6} />} on={rules.stapleRule === o.value} onPress={() => setRules({ stapleRule: o.value })} />
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <Label>Lunch style</Label>
        {LUNCH.map((o) => (
          <Choice key={o.v} title={o.t} sub={o.sub} on={(rules.lunchStyle ?? 'any') === o.v} onPress={() => setRules({ lunchStyle: o.v })} />
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <Label>Dinner style</Label>
        {DINNER.map((o) => (
          <Choice key={o.v} title={o.t} sub={o.sub} on={(rules.dinnerStyle ?? 'any') === o.v} onPress={() => setRules({ dinnerStyle: o.v })} />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Toggle label="Prefer high-protein dishes" on={!!rules.highProtein} onChange={(v) => setRules({ highProtein: v })} />
        <Toggle label="Curd, chaas or raita daily" on={!!rules.dailyCurd} onChange={(v) => setRules({ dailyCurd: v })} />
        <Toggle label={tx('ruleFried')} on={rules.avoidFried} onChange={(v) => setRules({ avoidFried: v })} />
        <Toggle label={tx('ruleSweet')} on={rules.avoidSweet} onChange={(v) => setRules({ avoidSweet: v })} />
        <Toggle label={tx('ruleQuick')} on={rules.quickWeekdays} onChange={(v) => setRules({ quickWeekdays: v })} />
      </View>
      <Field label="Household notes" value={rules.notes ?? ''} onChangeText={(v) => setRules({ notes: v })} placeholder="e.g. no onion on Tuesday" />
    </ScrollView>
  );
}

