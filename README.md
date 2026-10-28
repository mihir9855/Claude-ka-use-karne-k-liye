# Dalal Street Arena — NSE & BSE trading game

A virtual Indian stock market game. Start with ₹10,00,000 of artificial money and trade any stock listed on **NSE** and **BSE**, with the two exchanges shown side by side (NIFTY 50 and SENSEX on top). The same company can trade at slightly different prices on each exchange, so you can buy on the cheaper one and sell on the dearer one.

## Run it
```
node server.js        # Node 18+, no npm install needed
# open http://localhost:3000
```
- **Live prices:** the backend fetches real NSE (`.NS`) and BSE (`.BO`) prices, plus the real NIFTY 50 / SENSEX, from Yahoo Finance and serves them at `/api/quotes`.
- **Every listed stock:** it downloads the official listings (NSE `EQUITY_L.csv`, BSE `ListofScripData`), merges them by ISIN and refreshes them every 6 hours, so newly listed companies appear automatically. Browse A–Z or search by name/symbol; every stock on screen shows its live NSE and BSE price.
- **Market hours:** Mon–Fri 9:15 AM–3:30 PM IST (exchange holidays are not handled). Outside these hours prices show the last close and trading is closed; **⚙ Settings → Practice mode** lets you keep playing.
- **Trading capital** can be changed in ⚙ Settings without a reset (cash is topped up or reduced; holdings, history and P&L stay). Charges are detailed like a real discount broker's (brokerage, STT, exchange charges, GST, SEBI, stamp duty, DP) with a Delivery / Intraday choice for shares; see ⚙ Settings → Rate card. The portfolio is saved in your browser; **⚙ Settings → Reset game** starts over.
- Opening `index.html` directly (no server) runs a simulation with a built-in list of 97 stocks.

## Order types, alerts and F&O
- **Limit orders** (buy/sell at your price) and **stop-loss orders** are checked every second and fill at the live price once triggered. They can be placed while the market is closed and fire when it opens.
- **Bracket orders**: when you buy you can set your own entry price (limit) together with a stop-loss and a target; for shares the two exits are linked (one cancels the other), for futures & options they are attached to the position once it is entered.
- **Trade on the chart**: the stock chart is a live candlestick chart (TradingView's open-source Lightweight Charts; 1m/5m/15m/1h/1D). Buy/Sell, Market/Limit, quantity, stop-loss and target are on the chart itself: tap *+ Stop-loss* / *+ Target* / *+ Entry* and tap the chart, or drag the dashed lines; dragging the line of a waiting order modifies that order. ⤢ opens a full-screen trading chart. Falls back to the simple chart if the library cannot load.
- **Home chart**: a live candlestick chart of NIFTY 50 on the Home tab (switch to BANK NIFTY, SENSEX and other indices, 1m–1D; Candles or Line from the corner buttons). Tapping the NIFTY / SENSEX tiles switches the chart.
- **Price alerts** show a popup, play a beep and (if allowed) send a browser notification.
- **Futures & Options** (simulated): any stock plus the indices — NIFTY 50, BANK NIFTY, FIN NIFTY, MIDCAP SELECT, NIFTY NEXT 50, SENSEX, BANKEX and the sector/broad NIFTY indices (an index is listed once Yahoo returns a price for it). Lot sizes and strike steps for indices are approximate. Option prices use Black-Scholes on the live spot, futures use cost-of-carry; 15% margin, cash-settled at expiry. Open positions can be given a **stop-loss and target** (tap a position). It has its own **Futures & Options tab** (⚡ F&O on phone, a tab strip under the header on desktop); positions are listed below the option chain.
- **Tradebook & P&L** (Portfolio tab): every order with its time, day-wise filter, closed trades with bought → sold price and net P&L, a **charges breakdown** (tap a trade or order to see what was charged where), a **Void** button on every closed trade (removes a bad trade and takes its P&L back out of cash), plus a PDF report (📄 PDF button; jsPDF loads from a CDN, with a print-to-PDF fallback).
- Pending orders, alerts and positions are stored in your browser. While the app is closed nothing runs, but when you open it the game replays the last 5 sessions of 5-minute prices (`/api/history`) and fills any missed stop-loss, target, limit order, alert or expiry at the time and price it actually happened.

Yahoo Finance is a free, unofficial source and may be delayed or rate-limited. This is a game, not trading advice.

## Deploy / Android app
`render.yaml` deploys the server to Render. `.github/workflows/build-apk.yml` builds an Android APK (a wrapper around the deployed site) and publishes it to the `apk-latest` release. See `SETUP.md` for the other tools installed in this repo.
