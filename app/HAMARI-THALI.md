# Hamari Thali

A free Android app that plans daily and weekly Indian vegetarian meals for 1 to 6 family members. It works from the groceries you have at home, each person's calorie and protein targets, and their health limits.

English only for now.

## Install

- Download the APK: https://github.com/mihir9855/Claude-ka-use-karne-k-liye/releases/download/thali-6/hamari-thali.apk
- Open it on your Android phone and allow "unknown source" if asked. It installs over an older build and keeps your data.
- Build 6 is the latest. A new APK is only built when you ask for one.

## First run

1. Welcome
2. Family size (1 to 6)
3. Each person's profile: name, sex, age, weight, height (cm or ft/in), activity level, goal. A live daily target (kcal and protein) shows as you fill it in.
4. Each person's health limits and allergies
5. Cuisines you like (heart up to 2 favourites)
6. What is at home (stock)
7. Make my plan

## Screens

- **Planner**: week view with breakfast, mid-morning, lunch, evening, dinner and bedtime. Tap a meal for the dishes, portions per person, "Mark eaten" and "Another option".
- **Grocery**: what to buy, grouped by supermarket aisle. Copy, PDF and Share. Tick items to remove them.
- **Nutrition**: calories and macros against each person's target, with a one-line insight.
- **Menu (side drawer)**: Family & health, Cuisine preferences, Meal planning rules, My menu, Customize ingredients, Saved recipes, Home stock, Settings.

## Features

- 280 own-written vegetarian dishes with cuisine tags, plus an AI Finder for new ideas.
- Planner scores dishes by protein, calories, fibre, what you already have, food-group variety, likes and dislikes. It will not repeat what was eaten today.
- Health limits are enforced (diabetes, BP, thyroid, PCOS, cholesterol, kidney, lactose, gluten, peanut, soy, nuts, no onion or garlic).
- Per-person portions in quarter steps.
- Pantry add by name (nutrition looked up online), barcode scan, and photo or bill scan.
- Undo after deleting a person.

## Free to use

No paid AI. Gemini free tier is used only for photo scan, name-to-nutrition and AI Finder. Get a free key at aistudio.google.com and paste it in Settings. Never share the key in chat or commit it to the repo.

## Design rules

- Graphics instead of line icons.
- Every tile's text is on one line. Long names end with "…" and never leave the tile.
- Checked at 360, 390 and 430 px wide.

## For developers

- Expo SDK 58, React Native 0.88, React 19, TypeScript, Zustand with AsyncStorage.
- Code is in `app/`. Core logic is plain TypeScript in `app/src/core`. Run tests with `npm test`.
- Web preview: `npx expo export --platform web`.
- APK: GitHub Actions workflow `build-thali-apk.yml`, started by hand (`workflow_dispatch`). A push does not build.
