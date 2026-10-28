# OI Interpretation Guide — Nifty & BankNifty

> **NotSoSEBI Reference** | Last updated: April 2026
> This is the core reference for understanding Open Interest (OI) data on NSE options chains.

---

## What is Open Interest?

Open Interest (OI) is the **total number of outstanding (open) option contracts** that have not been settled. Unlike volume (which counts contracts traded), OI tells you how many contracts are still "alive" in the market.

- **OI increases** when a new buyer AND a new seller enter a position (new contract created)
- **OI decreases** when an existing buyer AND seller close their positions (contract destroyed)
- **OI unchanged** when an existing holder transfers to a new participant

### Why OI Matters for Indian F&O

On NSE, **option writers (sellers) are typically institutional players** — proprietary desks, market makers, and HNIs. They sell options because:
1. They have large capital for margin requirements
2. They benefit from theta decay (time value erosion)
3. They can hedge with futures or the underlying

**Reading OI = reading what institutions are positioning for.**

---

## Key OI Metrics

### 1. Absolute OI (Total Open Interest)

The total number of outstanding contracts at each strike price.

| What to Look For | What it Means |
|---|---|
| Highest CE OI strike | **Resistance level** — writers believe price won't go above this |
| Highest PE OI strike | **Support level** — writers believe price won't go below this |
| OI distributed across many strikes | Uncertain market, no clear directionality |
| OI concentrated at 1-2 strikes | Strong conviction zone, expect pinning near max pain |

**Example**: If Nifty spot is 24,500 and the highest CE OI is at 25,000 strike while highest PE OI is at 24,000 strike → **Expected range: 24,000–25,000**.

### 2. Change in OI (Delta OI)

The change in OI from the previous session (or intraday from the last snapshot).

| CE OI Change | PE OI Change | Interpretation |
|---|---|---|
| ↑ Increase | ↑ Increase | Both sides writing → Range-bound / consolidation |
| ↑ Increase | ↓ Decrease | CE writers adding + PE unwinding → **Bearish** |
| ↓ Decrease | ↑ Increase | CE unwinding + PE writers adding → **Bullish** |
| ↓ Decrease | ↓ Decrease | Both sides unwinding → Breakout expected |

### 3. OI + Price Action (The Four Quadrants)

This is the most important framework:

| Price | OI | Interpretation | Signal |
|---|---|---|---|
| ↑ Up | ↑ Up | **Long Buildup** | Fresh buying — bullish continuation |
| ↑ Up | ↓ Down | **Short Covering** | Bears closing — rally may not sustain |
| ↓ Down | ↑ Up | **Short Buildup** | Fresh selling — bearish continuation |
| ↓ Down | ↓ Down | **Long Unwinding** | Bulls closing — downside may not sustain |

**Critical distinction**: Long buildup (fresh money entering on bullish side) is more sustainable than short covering (bears simply exiting). Similarly, short buildup is more reliable than long unwinding.

---

## PCR (Put-Call Ratio)

### Definition
```
PCR (OI) = Total Put OI / Total Call OI
PCR (Volume) = Total Put Volume / Total Call Volume
```

We primarily use **PCR by OI** as it reflects positioning, not just trading activity.

### Nifty PCR Interpretation Ranges

> **These ranges are specific to Nifty options on NSE.** US market PCR ranges are different.

| PCR (OI) Range | Sentiment | Action Bias |
|---|---|---|
| > 1.5 | Extremely bullish (contrarian worry zone) | Puts heavily written — strong support; but if PCR is too high, be cautious of reversal |
| 1.2 – 1.5 | Bullish | More puts written than calls — support is building |
| 0.8 – 1.2 | Neutral / range-bound | Balanced market — no clear direction |
| 0.5 – 0.8 | Bearish | More calls written — resistance is building |
| < 0.5 | Extremely bearish (contrarian bounce zone) | Calls heavily written — extreme fear; but can signal capitulation bottom |

### PCR Trend Matters More Than Absolute Value

- **Rising PCR** (from 0.8 → 1.2 over a week) = Sentiment improving → Bullish
- **Falling PCR** (from 1.3 → 0.9 over a week) = Sentiment deteriorating → Bearish
- **Sudden PCR spike** in one session = Event-driven positioning (RBI policy, earnings, global event)

### Nifty vs BankNifty PCR

- BankNifty PCR tends to be **more volatile** due to concentrated banking sector exposure
- BankNifty PCR often leads Nifty PCR in trend changes (banking sector leads the index)
- When Nifty PCR and BankNifty PCR diverge, it signals **sector rotation**, not a broad trend

---

## Reading the Options Chain

### NSE Options Chain Columns

| Column | Meaning |
|---|---|
| OI | Total open interest (in number of contracts × lot size) |
| Change in OI | OI change from previous close |
| Volume | Number of contracts traded today |
| IV | Implied Volatility of that strike |
| LTP | Last Traded Price of the option |
| Bid/Ask | Current bid and ask prices |
| Strike Price | The exercise price of the option |

### Key Observations from Chain

1. **ITM vs OTM OI**: Most meaningful OI is in OTM strikes (CE above spot, PE below spot). ITM OI is mostly hedging or arbitrage.

2. **ATM Straddle Premium**: Sum of ATM CE + ATM PE LTP gives the market's expected move. If ATM straddle is ₹400 and Nifty is at 24,500, market expects ±400 points (24,100–24,900 range).

3. **IV Skew**: If OTM PE IV > OTM CE IV, there's a **fear premium** — market is pricing in downside risk more.

4. **Volume vs OI Ratio**: High volume with small OI change = day trading (no conviction). High volume with large OI change = positional activity (conviction).

---

## Intraday OI Reading

During market hours (9:15 AM – 3:30 PM IST), OI changes in real-time:

### Key Intraday Times

| Time (IST) | OI Significance |
|---|---|
| 9:15 – 9:30 | Initial positioning — often noisy, gaps adjust |
| 9:30 – 10:00 | First meaningful OI additions — institutional positions |
| 11:00 – 12:00 | Mid-morning adjustment — OI often consolidates |
| 1:30 – 2:00 | Post-lunch positioning — often the strongest OI move of the day |
| 2:30 – 3:15 | Final position adjustments before close |
| 3:15 – 3:30 | Last-minute squaring — OI may drop as day traders exit |

### Intraday Tips
- Don't make OI-based decisions before 9:45 AM — let the noise settle
- The strongest signal is when OI addition aligns with price direction post-10 AM
- On expiry days, OI data after 1:30 PM becomes unreliable (gamma effects dominate)

---

## Expiry-specific OI Behavior

### Weekly Expiry (Every Thursday)

- OI builds from Monday, peaks Tuesday/Wednesday
- On expiry day (Thursday), OI rapidly declines as positions settle
- **Gamma trap**: Near expiry, small price moves cause large delta changes → increased volatility
- Max pain tends to be more "magnetic" on weekly expiry (market often pins near max pain in last 2 hours)

### Monthly Expiry (Last Thursday)

- Heavier OI buildup — institutional positions are larger
- Rollover activity starts 3-5 days before expiry
- **Rollover analysis**: Track OI migration from current month to next month expiry
- Higher liquidity → more reliable OI signals

### Expiry Day Rules
1. After 1:30 PM on expiry, OI analysis becomes less useful
2. Focus on **ITM OI** late on expiry day — those contracts will be exercised
3. Straddle premium decay accelerates — track ATM straddle for intraday range

---

## Common Mistakes in OI Analysis

1. **Treating OI as directional by itself**: OI tells you where positions are, not which direction price will move. Combine with price action.

2. **Ignoring the "whose OI" question**: OI could be from a buyer or seller. A spike in CE OI could mean CE buying (bullish) or CE writing (bearish). Use price + OI quadrant analysis to disambiguate.

3. **Over-relying on max pain**: Max pain works ~60-70% of the time on weekly expiry, less on monthly. It's a mean-reversion indicator, not a prediction.

4. **Using stale OI data**: NSE data can be delayed. Always check the timestamp.

5. **Comparing absolute OI across different expiries**: Monthly expiry OI is always higher than weekly. Compare apples to apples.

6. **Not accounting for lot size changes**: Nifty lot size has changed multiple times (75 → 50 → 25). Historical OI comparisons must be adjusted.

---

## Quick Reference: OI Decision Framework

```
Step 1: Check PCR → Bullish / Bearish / Neutral
Step 2: Identify highest CE OI and PE OI → Resistance / Support
Step 3: Check Change in OI → Where is new money flowing?
Step 4: Apply Price + OI quadrant → Buildup type?
Step 5: Check max pain → Where could the market gravitate?
Step 6: Check ATM straddle → What's the expected range?
Step 7: Combine all signals → Generate trading bias
```

---

*Reference maintained by NotSoSEBI (@NotSoSEBI | oi.notsosebi.in)*
