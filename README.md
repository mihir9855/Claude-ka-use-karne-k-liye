# Dalal Street Arena — NSE & BSE trading game

A virtual Indian stock market game. Start with ₹10,00,000 of artificial money, trade 20 stocks (Reliance, TCS, HDFC Bank, Infosys…) on both **NSE** and **BSE** (NIFTY 50 and SENSEX indices) as prices tick every second. Prices differ slightly between the two exchanges, so you can buy on the cheaper one and sell on the dearer one.

## Play
Open `index.html` in any browser (no install, no server).

- Prices update live every second (simulated random walk with a market-wide mood, NIFTY-X index shown on top).
- Market hours follow IST (Mon–Fri, 9:15–15:30). "Practice mode" keeps it open 24x7.
- 0.03% brokerage per order. Portfolio is saved in your browser; "Reset game" starts over.

Note: prices are simulated for gameplay, not real exchange data.

## Live prices (backend)
```
node server.js        # needs Node 18+, no npm install
# open http://localhost:3000
```
The backend fetches real NSE (`.NS`) and BSE (`.BO`) prices from Yahoo Finance every 15s and serves them at `/api/quotes`. The page shows "● LIVE NSE data" when it works and falls back to the simulation (per stock) if the backend or a symbol is unavailable. Opening `index.html` directly (no server) uses the simulation only.

## Saare NSE + BSE stocks
`server.js` downloads the official listings (NSE `EQUITY_L.csv`, BSE `ListofScripData`), merges them by ISIN and refreshes every 6 hours, so newly listed companies appear automatically. In the app open **"Saare listed stocks"** to browse A–Z or search any name/symbol, then tap a stock to open it with live prices. If the exchange files can't be downloaded the server falls back to Yahoo search.
