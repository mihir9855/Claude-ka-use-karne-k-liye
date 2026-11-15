# English Teacher 🗣️

An app to learn spoken English from Gujarati, step by step: **Beginner → Intermediate → Advanced** (24 lessons).

Each lesson has 4 steps:
1. **Learn phrases**: hear each sentence (normal and slow), see the Gujarati meaning and pronunciation, then say it into the mic; the app shows which words were right.
2. **Grammar tip**: a short explanation in Gujarati.
3. **Conversation**: listen to a real-life dialogue, then play your part ("Your turn").
4. **Practice**: 10 questions mixing listening, speaking, word order, fill in the blank and typing what you hear. Pass with 60% to unlock the next lesson.

Progress, XP and the daily streak are saved on the phone.

## Install the APK (easiest)
GitHub builds the APK by itself every time the code changes:
1. On your Android phone, open the repo's **Releases** page and choose **English Teacher (latest)**.
2. Tap **English-Teacher.apk** to download it, then open it and allow "Install unknown apps" if Android asks.
3. On first use of the mic, tap **Allow**.

## Run from Android Studio
Needs Node.js 22 and Android Studio (JDK 21).
```bash
cd english-teacher
npm install
npm run sync          # builds the web app and copies it into android/
npx cap open android  # opens Android Studio, then press ▶ Run with your phone connected by USB
```
After changing code in `src/`, run `npm run sync` again.

To try it in a browser instead (Chrome): `npm run dev`.

## Where things are
- Lessons (English, Gujarati, conversations, tips): `src/data/beginner.ts`, `intermediate.ts`, `advanced.ts`
- Voice (Android TTS and speech recognition): `src/lib/speech.ts`
- Checking spoken and typed answers: `src/lib/match.ts`
- Practice questions: `src/lib/quiz.ts`
- Progress, unlocking, streak: `src/lib/progress.ts`
- Screens: `src/screens/`
