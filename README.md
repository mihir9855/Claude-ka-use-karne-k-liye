# Bharat Stock Exchange Game

A virtual Indian stock market game. Start with ₹10,00,000 of artificial money, buy and sell 20 NSE-style stocks (Reliance, TCS, HDFC Bank, Infosys…) as prices tick every second.

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
The backend fetches real NSE prices (Yahoo Finance, `.NS` symbols) every 10s and serves them at `/api/quotes`. The page shows "● LIVE NSE data" when it works and falls back to the simulation (per stock) if the backend or a symbol is unavailable. Opening `index.html` directly (no server) uses the simulation only.
