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
- 0.03% brokerage per order. The portfolio is saved in your browser; **⚙ Settings → Reset game** starts over.
- Opening `index.html` directly (no server) runs a simulation with a built-in list of 97 stocks.

## Order types, alerts and F&O
- **Limit orders** (buy/sell at your price) and **stop-loss orders** are checked every second and fill at the live price once triggered. They can be placed while the market is closed and fire when it opens.
- **Price alerts** show a popup, play a beep and (if allowed) send a browser notification.
- **Futures & Options** (simulated): NIFTY 50, SENSEX and any stock. Option prices use Black-Scholes on the live spot, futures use cost-of-carry; 15% margin, cash-settled at expiry. Positions are shown under *Futures & Options positions*.
- Pending orders, alerts and positions are stored in your browser and are only processed while the app is open.

Yahoo Finance is a free, unofficial source and may be delayed or rate-limited. This is a game, not trading advice.

## Deploy / Android app
`render.yaml` deploys the server to Render. `.github/workflows/build-apk.yml` builds an Android APK (a wrapper around the deployed site) and publishes it to the `apk-latest` release. See `SETUP.md` for the other tools installed in this repo.
