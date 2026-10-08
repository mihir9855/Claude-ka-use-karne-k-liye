# Claude-ka-use-karne-k-liye
## Arthaly – Expense & Budget Tracker

Open `index.html` on a phone (or host it anywhere static). Data stays in the browser (`localStorage`); use Accounts → Export for backups.

- 4+ accounts, each with last-4 digits so SMS auto-matches the account; per-account credit/debit.
- **+ → Paste SMS**: parses amount, debit/credit, account, merchant, date and guesses the category. Duplicates are skipped.
- **Ledger → People**: pass-through money (e.g. a business UPI from your account that Papa repays). Never counts as income or spending; shows who owes whom.
- **Ledger → Other income**: side/freelance income kept separate, with a pool you can spend from.
- Insights: category donut, budget pace, 6-month income vs spend, per-account flow.

Automatic SMS capture needs a native Android wrapper (browsers can't read SMS; iOS doesn't allow it). `parseSms()` is self-contained so it can be reused there.

### Android app (automatic SMS)

`app/` wraps the web app with Capacitor and adds a native SMS receiver (`app/android/.../SmsReceiver.java`). Bank SMS (amount + debit/credit words only) are queued while the app is closed and added to the tracker when it opens or is open.

Build: the **Build Android APK** workflow (Actions tab → run → artifact `paisa-debug-apk`), or locally `cd app && npm ci && npm run sync && cd android && ./gradlew assembleDebug`.
Install: copy `app-debug.apk` to the phone, allow install from unknown sources. On Android 13+ you may also need App info → ⋮ → *Allow restricted settings* before SMS permission can be granted. Then open Accounts → *Enable SMS capture*.
