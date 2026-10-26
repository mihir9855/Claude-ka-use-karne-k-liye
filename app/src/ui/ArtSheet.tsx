// Developer contact sheet of every illustration. Open the web build with ?artsheet
import { ScrollView, View } from 'react-native';
import { Text } from './Text';
import type { DishArtKey } from '../core/artFor';
import { AisleArt, BadgeArt, CUISINE_TONE, DishArt, MealArt, NavArt, type AisleArtKey, type BadgeArtKey, type MealArtKey } from './Art';

const DISHES: DishArtKey[] = ['riceBowl', 'rotiStack', 'dalBowl', 'paneerBowl', 'veggiePan', 'fruitBowl', 'glass', 'dosa', 'idli', 'soup', 'snackTri', 'salad', 'ladoo'];
const MEALS: MealArtKey[] = ['breakfast', 'midmorning', 'lunch', 'evening', 'dinner', 'bedtime'];
const AISLES: AisleArtKey[] = ['veg', 'fruit', 'dairy', 'pulse', 'staple', 'dry', 'oil', 'other'];
const BADGES: BadgeArtKey[] = ['family', 'cuisine', 'rules', 'menu', 'customize', 'saved', 'pantry', 'settings'];
const TONES = Object.values(CUISINE_TONE);

function Cell({ label, bg, children }: { label: string; bg: string; children: React.ReactNode }) {
  return (
    <View style={{ width: 104, alignItems: 'center', gap: 4 }}>
      <View style={{ width: 96, height: 96, borderRadius: 24, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
      <Text style={{ fontSize: 11, color: '#17143C' }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export function ArtSheet() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F3FB' }} contentContainerStyle={{ padding: 12, gap: 14 }}>
      <Text style={{ fontWeight: '800', fontSize: 16 }}>Dishes</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DISHES.map((k, i) => (
          <Cell key={k} label={k} bg="#FFFFFF">
            <DishArt kind={k} tone={TONES[i % TONES.length]} size={84} />
          </Cell>
        ))}
      </View>
      <Text style={{ fontWeight: '800', fontSize: 16 }}>Meals</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {MEALS.map((k) => (
          <Cell key={k} label={k} bg="#FFF1CE">
            <MealArt slot={k} size={84} />
          </Cell>
        ))}
      </View>
      <Text style={{ fontWeight: '800', fontSize: 16 }}>Aisles</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {AISLES.map((k) => (
          <Cell key={k} label={k} bg="#E5E0FF">
            <AisleArt aisle={k} size={72} />
          </Cell>
        ))}
      </View>
      <Text style={{ fontWeight: '800', fontSize: 16 }}>Menu badges</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BADGES.map((k) => (
          <Cell key={k} label={k} bg="#ECEAF8">
            <BadgeArt name={k} size={72} />
          </Cell>
        ))}
      </View>
      <Text style={{ fontWeight: '800', fontSize: 16 }}>Navigation</Text>
      <View style={{ flexDirection: 'row', gap: 8, backgroundColor: '#17143C', padding: 14, borderRadius: 24 }}>
        {(['plan', 'shop', 'stats'] as const).map((k) => (
          <View key={k} style={{ flexDirection: 'row', gap: 10 }}>
            <NavArt name={k} on size={44} />
            <NavArt name={k} on={false} size={44} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
