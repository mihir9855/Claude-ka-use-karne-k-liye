import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ACTIVITIES, CONDITIONS, GOALS, computeTargets, type Condition } from '../core/profile';
import { FIRST_ID, useStore } from '../state/store';
import { Icon } from './Icon';
import { Button, Chip, Choice, Field, Muted } from './kit';
import { Text } from './Text';
import { Tile } from './kit';
import { BORDER, C, FONT, RADIUS, SCRIPT, TILE, TILE_INK, themed } from './theme';

const NATIVE = Platform.OS !== 'web';
const num = (v: string) => Number(v.replace(/[^0-9]/g, '')) || 0;

/** The first thing you see: a bowl settling in, the name, and a button. */
function Welcome({ onStart }: { onStart: () => void }) {
  const pop = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const sub = useRef(new Animated.Value(0)).current;
  const btn = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const steam = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: NATIVE }),
      Animated.timing(title, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }),
      Animated.timing(sub, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }),
      Animated.timing(btn, { toValue: 1, duration: 400, useNativeDriver: NATIVE }),
    ]).start();
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }));
    const float = Animated.loop(Animated.sequence([Animated.timing(steam, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }), Animated.timing(steam, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE })]));
    loop.start();
    float.start();
    return () => {
      loop.stop();
      float.stop();
    };
  }, [pop, title, sub, btn, pulse, steam]);

  const rise = (v: Animated.Value) => ({ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] });

  return (
    <View style={s.welcome}>
      <View style={s.stage}>
        <Animated.View style={[s.ring, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.5] }) }] }]} />
        <Animated.View style={[s.disc, { opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }, { translateY: steam.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}>
          <Icon name="bowl" size={92} color={TILE_INK} width={1.8} />
        </Animated.View>
      </View>
      <Animated.Text style={[s.brand, rise(title)]}>Khana</Animated.Text>
      <Animated.Text style={[s.tag, rise(sub)]}>Tell me what you ate. I will remember it and plan what you eat next.</Animated.Text>
      <Animated.View style={[{ alignSelf: 'stretch' }, rise(btn)]}>
        <Button label="Get started" onPress={onStart} />
      </Animated.View>
    </View>
  );
}

const STEPS = ['name', 'about', 'active', 'goal', 'health', 'target'] as const;

export function OnboardScreen() {
  const person = useStore((st) => st.persons.find((p) => p.id === FIRST_ID) ?? st.persons[0]);
  const update = useStore((st) => st.updatePerson);
  const setOnboarded = useStore((st) => st.setOnboarded);
  const [step, setStep] = useState(-1); // -1 is the welcome
  const target = computeTargets(person);
  const id = person.id;
  const toggle = (c: Condition) => update(id, { conditions: person.conditions.includes(c) ? person.conditions.filter((x) => x !== c) : [...person.conditions, c] });

  if (step < 0) return <Welcome onStart={() => setStep(0)} />;
  const key = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => setStep(step - 1)} hitSlop={8} style={s.back}>
          <Icon name="back" size={22} color={C.text} width={2} />
        </Pressable>
        <View style={s.progress}>
          {STEPS.map((k, i) => (
            <View key={k} style={[s.seg, i <= step && { backgroundColor: C.accent }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {key === 'name' && (
          <>
            <Text style={s.q}>What should I call you?</Text>
            <Muted>Your name shows on the home screen. You can change it later.</Muted>
            <Field label="Name" value={person.name} onChangeText={(v) => update(id, { name: v })} placeholder="Your name" />
          </>
        )}
        {key === 'about' && (
          <>
            <Text style={s.q}>A little about you</Text>
            <Muted>This sets how many calories and how much protein you need each day.</Muted>
            <View style={s.row}>
              <Chip label="Male" on={person.sex === 'male'} onPress={() => update(id, { sex: 'male' })} />
              <Chip label="Female" on={person.sex === 'female'} onPress={() => update(id, { sex: 'female' })} />
            </View>
            <View style={s.three}>
              <Field label="Age" numeric value={person.age ? String(person.age) : ''} onChangeText={(v) => update(id, { age: num(v) })} />
              <Field label="Height (cm)" numeric value={person.heightCm ? String(person.heightCm) : ''} onChangeText={(v) => update(id, { heightCm: num(v) })} />
              <Field label="Weight (kg)" numeric value={person.weightKg ? String(person.weightKg) : ''} onChangeText={(v) => update(id, { weightKg: num(v) })} />
            </View>
          </>
        )}
        {key === 'active' && (
          <>
            <Text style={s.q}>How active are you?</Text>
            {ACTIVITIES.map((a) => (
              <Choice key={a.id} title={a.label} sub={a.sub} on={person.activity === a.id} onPress={() => update(id, { activity: a.id })} />
            ))}
          </>
        )}
        {key === 'goal' && (
          <>
            <Text style={s.q}>What is your goal?</Text>
            {GOALS.map((g) => (
              <Choice key={g.id} title={g.label} sub={g.sub} on={person.goal === g.id} onPress={() => update(id, { goal: g.id })} />
            ))}
          </>
        )}
        {key === 'health' && (
          <>
            <Text style={s.q}>Any health conditions?</Text>
            <Muted>Pick any that apply, or skip. Your menu will go easier on dishes that do not suit them. This is not medical advice.</Muted>
            <View style={s.row}>
              {CONDITIONS.map((c) => (
                <Chip key={c.id} label={c.label} on={person.conditions.includes(c.id)} onPress={() => toggle(c.id)} />
              ))}
            </View>
          </>
        )}
        {key === 'target' && (
          <>
            <Text style={s.q}>{person.name.trim() ? `${person.name.trim()}, this is your day` : 'This is your day'}</Text>
            <Tile style={s.targetCard}>
              <Text style={s.kcal}>{target.kcal.toLocaleString('en-IN')}</Text>
              <Text style={s.kcalUnit}>kcal a day</Text>
              <View style={s.row}>
                <Stat label="Protein" v={`${target.protein} g`} />
                <Stat label="Carbs" v={`${target.carbs} g`} />
                <Stat label="Fat" v={`${target.fat} g`} />
                <Stat label="Fibre" v={`${target.fiber} g`} />
              </View>
            </Tile>
            <Muted>Next, tell me what you ate in Chat, like "poha, chai" or "dal rice in lunch". I will start planning your menu from it. You can add family members in Settings.</Muted>
          </>
        )}
      </ScrollView>

      <View style={s.foot}>
        {key === 'health' && <Button kind="soft" label="Skip" onPress={() => setStep(step + 1)} />}
        <View style={{ flex: 1 }}>
          <Button label={last ? 'Start' : 'Next'} onPress={() => (last ? setOnboarded(true) : setStep(step + 1))} />
        </View>
      </View>
    </View>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statV} numberOfLines={1}>{v}</Text>
      <Text style={s.statL} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28 },
  stage: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  ring: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: BORDER, borderColor: C.line },
  disc: { width: 160, height: 160, borderRadius: 80, backgroundColor: TILE.yellow, borderWidth: BORDER + 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: SCRIPT, fontSize: 84, lineHeight: 90, color: C.text, letterSpacing: -2 },
  tag: { fontSize: 16, fontWeight: '600', color: C.muted, textAlign: 'center', lineHeight: 23, maxWidth: 300, marginBottom: 14, fontFamily: FONT.regular },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 14 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  seg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.card, borderWidth: 2, borderColor: C.line },
  page: { paddingLeft: 20, paddingRight: 16, paddingTop: 12, gap: 16, paddingBottom: 24 },
  q: { fontFamily: 'script', fontSize: 42, lineHeight: 46, color: C.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  three: { flexDirection: 'row', gap: 10 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingLeft: 20, paddingRight: 16, borderTopWidth: BORDER, borderTopColor: C.line },
  targetCard: { padding: 18, gap: 10 },
  kcal: { fontFamily: 'display', fontSize: 46, fontWeight: '800', color: C.text, letterSpacing: -1.5 },
  kcalUnit: { fontSize: 14, color: C.muted, fontWeight: '600', marginTop: -8 },
  stat: { flexBasis: '22%', flexGrow: 1, minWidth: 0 },
  statV: { fontSize: 17, fontWeight: '800', color: C.text },
  statL: { fontSize: 12, color: C.muted, fontWeight: '600' },
}));
