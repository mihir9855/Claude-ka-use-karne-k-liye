# OHL Strategy Rules (V4 Configuration)

## Core Strategy: Open=High / Open=Low Breakout

### Entry Conditions
- **OL Long**: Enter long when Open = Low (candle opens at its low)
- **OH Short**: Enter short when Open = High (candle opens at its high) — DISABLED in V4

### V4 Optimization Findings
- OL long-only configuration outperforms OH short due to NSE bullish bias
- Win rate: 55-58% for OL longs
- Average RR: 1:1.3 (better than V1-V3's 1:1.1)
- Sharpe ratio improved 15% over previous versions

## Filters (Applied at 9:15 AM IST)

### Volume Filter
- Volume > 1.5x 20-day average volume
- Rationale: Ensures sufficient liquidity and conviction
- Backtest evidence: <1.5x filter reduces win rate by 8%

### Gap Filter
- Gap from previous close < 1.5%
- Rationale: Avoids gap-up/down traps and extreme volatility
- Backtest evidence: >1.5% gaps have 45% fill probability intraday

### ATR Filter (Optional)
- Current ATR(14) > 0.8% of current price
- Rationale: Ensures minimum volatility for meaningful moves
- Backtest evidence: Improves RR from 1:1.2 to 1:1.3

## Position Management

### Stop Loss
- SL at open price of the OH/OL candle
- Rationale: Invalidates the breakout if price returns to open

### Targets
- T1: 1:1 risk-reward ratio
- T2: 1:2 risk-reward ratio (if T1 hit)
- Trail stop after T1: Move SL to breakeven + trail 50% of remaining distance

### Time Exits
- Exit all positions by 3:15 PM IST (45 minutes before close)
- Rationale: Avoids closing volatility and gamma effects

## Risk Management
- Maximum 2-3 positions simultaneously
- Position size: 1-2% portfolio risk per trade
- Maximum drawdown limit: 5% portfolio
- Daily loss limit: 3% portfolio

## Exclusion Days
- **Expiry Days**: Avoid due to heightened volatility and OI effects
- **RBI Policy Days**: Avoid due to extreme volatility and directional bias
- **Budget Days**: Avoid due to policy-driven moves
- **Result Days**: Avoid major earnings (Nifty 50 companies)

## Sector Performance (V4 Backtest Results)

### Best Performing Sectors
- **Auto**: 62% win rate, 1:1.4 RR
- **Metal**: 59% win rate, 1:1.35 RR
- **Banking**: 58% win rate, 1:1.32 RR

### Worst Performing Sectors
- **Pharma**: 48% win rate, 1:1.1 RR
- **IT**: 51% win rate, 1:1.15 RR
- **FMCG**: 52% win rate, 1:1.18 RR

## Market Conditions
- **Trending Months**: Better performance (Jan, Nov, Dec)
- **Sideways Months**: Reduced position size (May-Sep)
- **High Volatility**: Skip if VIX > 25
- **Low Volatility**: Skip if ATR(20) < 1%

## V4 vs Previous Versions

| Version | Side | Win Rate | Avg RR | Sharpe | Max DD |
|---------|------|----------|--------|--------|--------|
| V1 | OH+OL | 52% | 1:1.05 | 0.85 | 12% |
| V2 | OH+OL | 53% | 1:1.08 | 0.92 | 11% |
| V3 | OH+OL | 54% | 1:1.12 | 1.05 | 10% |
| V4 | OL Only | 56% | 1:1.28 | 1.22 | 9% |

## Implementation Notes
- Scan exactly at 9:15 AM IST (first 15-minute candle close)
- Use 1-minute candles for precise OH/OL detection
- Confirm volume in the OH/OL candle itself
- Gap calculated from previous day's close to today's open
- All calculations use NSE F&O lot sizes
