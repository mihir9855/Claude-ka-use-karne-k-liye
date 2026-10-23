# Chart Scanner (NSE + BSE)

Stock scanner that scores any NSE/BSE stock on technical and fundamental factors, with live-refreshing charts and quarterly results.

- `backend/` FastAPI server. Data from Yahoo Finance via `yfinance` (NSE `.NS`, BSE `.BO`).
- `frontend/index.html` single-page UI served by the backend. Search, watchlist (saved in each visitor's browser), chart, RSI, quarterly results.
- `docs/` project plan PDF.

## Run locally
```
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --reload
# open http://localhost:8000
```
Offline demo with generated data (no internet needed): `DEMO=1 uvicorn main:app`

## Share with friends (free hosting)
1. Push this repo to GitHub.
2. On https://render.com choose New > Blueprint, pick the repo. It reads `render.yaml` and builds the Dockerfile.
3. Send friends the `https://<name>.onrender.com` link. The free plan sleeps when idle, so the first load takes about 30 seconds.

## Notes
- Prices are delayed up to ~15 minutes; quarterly data on Yahoo is sometimes missing for smaller companies.
- Yahoo may rate-limit a busy shared server. Results are cached (prices 5 min, fundamentals 6 h).
- Screening tool only, not investment advice.
