# Claude-ka-use-karne-k-liye
## Paisa – Expense & Budget Tracker

Open `index.html` on a phone (or host it anywhere static). Data stays in the browser (`localStorage`); use Accounts → Export for backups.

- 4+ accounts, each with last-4 digits so SMS auto-matches the account; per-account credit/debit.
- **+ → Paste SMS**: parses amount, debit/credit, account, merchant, date and guesses the category. Duplicates are skipped.
- **Khata → People**: pass-through money (e.g. a business UPI from your account that Papa repays). Never counts as income or spending; shows who owes whom.
- **Khata → Other income**: side/freelance income kept separate, with a pool you can spend from.
- Insights: category donut, budget pace, 6-month income vs spend, per-account flow.

Automatic SMS capture needs a native Android wrapper (browsers can't read SMS; iOS doesn't allow it). `parseSms()` is self-contained so it can be reused there.
