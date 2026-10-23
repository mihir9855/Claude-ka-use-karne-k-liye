# tv-analyst — Claude × TradingView OS

Connect → Scan → Analyze → Decide → Monitor. Analysis/workflow system, financial advice nahi. Pehle paper trade.

## Quick start
1. `cd tv-analyst && claude` — CLAUDE.md auto-load hota hai. Usme apne setups, account size fill karo.
2. TradingView chart ka screenshot `charts/` me daalo, bolo: *"Analyze this chart in 4 steps — structure, key levels, setup match, invalidation."*
3. `pine/my-strategy.pine` ko TradingView Pine Editor me paste karo (v6, commission + slippage included).
4. Position size: `python3 tools/position_size.py 10000 100 96.5` (account, entry, stop).
5. (Optional, paid TV plan) Alert → Webhook URL. Local receiver: `WEBHOOK_SECRET=xyz python3 tools/webhook_server.py 8080`, ngrok se expose, URL = `https://<ngrok>/xyz`. Alert message JSON: `{"ticker":"{{ticker}}","price":"{{close}}","setup":"breakout"}` — ya Pine ka `alert()` use karo. n8n/Make bhi chalega.
6. Roz: screenshot → analyze → plan → paper trade → `journal/YYYY-MM-DD.md`. Weekly: journal Claude ko do (prompt #19).
