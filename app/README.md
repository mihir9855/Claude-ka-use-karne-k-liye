# Hamari Thali (Our Thali)

A free, offline-first Android app (Expo / React Native) that plans daily Indian vegetarian meals for two people from the
groceries at home, their health goals and their health limits. English, Hinglish and Gujarati.

## What works now

- **Planner**: a plan for the next 7 days, each day with its meals. Tap a meal to see the portion for each
  person, what to cook with, mark it eaten, or ask for another.
- **Nutrition**: today against each person's target (calories, protein, carbs, fat, fibre), split by meal, with a
  note on what is furthest off.
- **Grocery list**: one list for the week's plan plus anything added by hand, grouped like a supermarket
  (vegetables, fruit, dairy, dal, atta and rice...). Tick to move an item to the home stock. Copy, PDF and share.
- **Menu (side drawer)**: family and health limits (1-6 people), cuisines, planning rules (rice or roti,
  no fried, no sweets, quick weekday dishes), My Menu (take dishes in or out), Customize ingredients,
  Saved recipes with an AI Finder, home stock (add by name, barcode or photo), settings.
- **280 vegetarian dishes** (North, West, South, East, North-East, continental, Indo-Chinese), named in
  English, Hinglish and Gujarati. Quantities are approximate.
- Runs on the phone with no paid service. Optional: a free Gemini key for photo detection, nutrition lookup by
  name, and the AI Finder (every AI dish is checked in code: real ingredients, believable numbers, and
  none of the foods the family must avoid).

## Run it

```bash
cd app
npm install
npx expo start        # scan the QR code with Expo Go on Android
npm test              # planner and nutrition tests
npm run typecheck
```

Nutrition values are approximate (IFCT / USDA based) and the app is general guidance, not medical advice.
