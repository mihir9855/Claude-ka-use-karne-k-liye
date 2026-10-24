# Hamari Thali (Our Thali)

A free, offline-first Android app (Expo / React Native) that plans daily Indian vegetarian meals for two people from the
groceries at home, their health goals and their health limits. English, Hinglish and Gujarati.

## What works now

1. **Profile**: two people, each with goal (fat loss / muscle gain / stay healthy), activity and health limits
   (diabetes, BP, thyroid, PCOS, cholesterol, lactose, gluten, kidney, peanut/soy/nut allergy, no onion-garlic).
   Daily calorie and protein targets are computed on the phone (Mifflin-St Jeor).
2. **Meals per day**: auto, or 3 / 4 / 5 / 6. Calories and protein are split across the meals.
3. **Pantry**: tap what you have; double-tap marks "use first". "Plan only from my pantry" keeps suggestions cookable.
4. **Plan A / Plan B** for every meal, with per-person portions. Tap to pick one. A "missing for today" list is shown.
5. **Our dishes**: add dishes you cook (ingredients or your own numbers), and log "we ate this".
   The planner learns from the log: favourite dishes come up more, recently eaten ones are held back, dishes often
   eaten together are paired, and 👎 dishes are never suggested.

No AI service and no paid API are used; everything runs on the phone. Data is stored locally.

## Not built yet

- Sync between your two phones and the "A vs B, then decide together" vote (needs a free Supabase project).
- Photo, voice and barcode pantry input (optional, free Gemini tier).
- Cooking steps and a cooking sheet for the cook.
- Dish names are in all three languages for built-in dishes. Dishes you add use the one name you type.

## Run it

```bash
cd app
npm install
npx expo start        # scan the QR code with Expo Go on Android
npm test              # planner and nutrition tests
npm run typecheck
```

Nutrition values are approximate (IFCT / USDA based) and the app is general guidance, not medical advice.
