# OI Patterns — Historical Behavior Before Key Events

> **NotSoSEBI Reference** | Last updated: April 2026
> How OI behaves before expiry, budget, RBI policy, elections, and global shocks on NSE.

---

## Overview

Open Interest doesn't just reflect current positioning — it follows **predictable patterns** around recurring events. Understanding these patterns gives you an edge in timing entries/exits and choosing strategies.

---

## 1. Weekly Expiry Cycle (Thursday)

### Monday
- OI is relatively low (previous weekly contracts expired)
- New positions start building — watch for **directional OI buildup** to set the week's tone
- Max pain is unreliable (OI too thin)
- PCR may swing wildly on low base

### Tuesday
- Major OI additions happen — this is when institutional positions are established
- Highest CE OI and PE OI strikes begin to define the week's range
- Max pain starts becoming meaningful
- **Key signal**: If PCR shifts sharply from Monday → Institutional bias is setting in

### Wednesday
- OI structure is largely set for the week
- Adjustments happen but rarely change the OI structure dramatically
- Max pain is most reliable on Wednesday close for predicting Thursday's pin
- **Watch for**: Late-day OI changes after 2:30 PM — last-minute positioning before expiry
- Straddle premium gives the best expected range estimate for expiry day

### Thursday (Expiry Day)
- **Pre-open to 9:30 AM**: Gap adjustments — OI can shift rapidly
- **9:30 AM – 12:00 PM**: Straddle sellers dominate — range-bound action typical
- **12:00 PM – 1:30 PM**: Directional move often starts — triggered by gamma squeeze if spot is near a high-OI strike
- **1:30 PM – 3:00 PM**: Gamma trap zone — rapid moves as delta hedging kicks in
- **3:00 PM – 3:30 PM**: Pinning effect — Nifty often moves toward max pain in the last 30 minutes

### Key Metrics for Weekly Expiry
| Metric | What to Track |
|---|---|
| ATM straddle premium | Decays fastest on Wednesday → Thursday; gives expected range |
| Gamma exposure | Peaks on expiry day — small moves cause big delta changes |
| OI concentration ratio | (Top 3 CE OI + Top 3 PE OI) / Total OI — higher = stronger pinning |
| Max pain distance from spot | < 100 points = likely pin; > 200 points = max pain may fail |

---

## 2. Monthly Expiry Cycle (Last Thursday)

### T-10 to T-5 (Two Weeks Before)
- Monthly OI starts building alongside weekly
- **Rollover watch**: Track OI migration from current month to next month
- Early rollovers at lower cost = institutional confidence in the trend
- Late rollovers = uncertainty, possible trend reversal

### T-5 to T-2 (Expiry Week, Before Wednesday)
- **Rollover percentage** becomes the key metric:
  - Nifty futures: Typical rollover = 75-85%
  - BankNifty futures: Typical rollover = 70-80%
  - If rollover > 85% → Strong trend expected to continue
  - If rollover < 70% → Trend exhaustion possible
- Monthly max pain stabilizes
- Large options positions start unwinding if they're ITM

### T-1 (Wednesday Before Monthly Expiry)
- Massive OI adjustments — writers defend their positions aggressively
- Straddle premium drops sharply
- **Highest probability of max pain working** is on monthly expiry

### T-0 (Monthly Expiry Day)
- Similar to weekly but with **much higher volumes**
- Pinning effect is weaker (more OI = more competing forces)
- Post-2:30 PM can see wild swings due to large position squaring
- **Physical delivery**: F&O stocks may see forced position closures

### Rollover Analysis Interpretation

| Rollover % | Cost of Carry | Interpretation |
|---|---|---|
| > 85% | Positive (premium) | Extremely bullish — institutions carrying longs into next month |
| 75-85% | Positive | Normal bullish — trend continuation likely |
| 75-85% | Negative (discount) | Cautious — long positions rolled but at lower conviction |
| 65-75% | Negative | Weak rollover — possible trend change |
| < 65% | Negative | Very weak — major unwinding, expect reversal or high volatility |

---

## 3. RBI Monetary Policy Days

RBI policy announcements happen 6 times a year (bi-monthly). These are **high-impact OI events**.

### Pattern: T-3 to T-1 (Days Before RBI Policy)

1. **Straddle premium rises**: IV expands as market prices in uncertainty
2. **OI builds on both sides**: Writers and buyers position for the outcome
3. **PCR often drops**: Traders buy puts for protection → PCR falls toward 0.8
4. **Max pain becomes less relevant**: Event risk overrides pinning

### Pattern: Policy Day (T-0)

| RBI Decision | Nifty OI Response |
|---|---|
| Rate cut (dovish) | PE OI drops sharply (put unwinding), CE writing increases at higher strikes → Bullish |
| Rate hold (as expected) | Both sides unwind → IV crush → straddle sellers profit |
| Rate hike (hawkish) | CE OI drops (call unwinding), PE writing at lower strikes → Bearish |
| Unexpected outcome | Massive OI restructuring — both sides blow up, new OI builds at new levels |

### Post-RBI Pattern (T+1 to T+3)

- **IV crush**: IV drops 2-5% on the day after policy — straddle/strangle sellers profit
- **New OI structure forms**: By T+2, the market establishes new support/resistance from OI
- **PCR normalizes**: Returns to 0.9-1.1 range within 2-3 sessions

### Trading Strategy Around RBI
- **Before**: Buy straddle 3-5 days before if IV is low (< 25th percentile)
- **Day of**: Close the straddle before/right after announcement (buy the rumor, sell the news)
- **After**: Sell strangles/iron condors as IV crushes — high probability of profit

---

## 4. Union Budget Day

Budget Day (February 1st) is the **most volatile OI event of the year**.

### Pre-Budget Patterns (T-10 to T-1)

1. **OI builds massively** at wide strikes — the market prepares for a big move
2. **Straddle premium surges**: Budget-week IV is typically 30-50% higher than normal
3. **PCR is unreliable**: Hedge-driven put buying distorts PCR readings
4. **Sector-specific OI**: Banking, auto, real estate OI spikes as traders bet on policy
5. **Max pain is useless**: Budget moves are 300-800 points — no pinning possible

### Budget Day Pattern

| Phase | Time (IST) | OI Behavior |
|---|---|---|
| Pre-budget | 9:15 – 11:00 | OI builds on both sides; straddle premium peaks |
| During speech | 11:00 – 1:00 | OI swings violently with each announcement |
| Post-budget initial | 1:00 – 2:00 | First OI structure forms — indicates initial market verdict |
| Post-budget final | 2:00 – 3:30 | OI consolidates — new support/resistance emerge |

### Post-Budget Week

- **IV crush is massive**: Premium sellers make money if they sell straddles post-speech
- **New OI levels define the month**: Budget-day OI structure often holds for 2-3 weeks
- **Sector OI shifts**: Sectors impacted by budget see OI recalibration for months

---

## 5. Election Results / Exit Poll Days

### Pattern Characteristics

- **Extreme IV expansion**: IV can reach 25-35+ (vs normal 12-18 for Nifty)
- **OI at very wide strikes**: CE and PE OI at 1000-2000 points from spot
- **Max pain is irrelevant**: Move can be 1000-2000+ points
- **PCR is distorted**: Protective put buying inflates PE OI regardless of sentiment

### Key Historical Patterns

| Event | Nifty Move | OI Behavior |
|---|---|---|
| 2024 Lok Sabha results | -1000+ points (BJP underperformed) | Massive CE OI unwinding, PE OI spiked, circuit limits hit |
| 2019 Exit poll (BJP majority) | +600 points | PE OI collapsed, CE writing at much higher strikes |
| State election results | ±200-400 points | Moderate OI shift, normalizes in 2-3 sessions |

### Strategy for Elections
- **Don't sell naked options**: Risk/reward is terrible before elections
- **Buy straddle/strangle 7-10 days before**: Capture IV expansion + directional move
- **Alternatively**: Iron condor with very wide wings (500+ points from spot)

---

## 6. Global Shock Events

### US Fed Policy

- Nifty options show OI adjustment from 8:00 PM IST onwards (post US market open)
- Next-day Nifty gap reflects overnight positioning
- OI-based S/R may shift dramatically on gap

### Geopolitical Events (Wars, Sanctions)

- PE OI spikes overnight via GIFT Nifty positioning
- Opening OI structure on event day is often misleading — wait 30 minutes
- IV expansion can be sustained for days (unlike earnings which mean-revert fast)

### US Market Crash

- Nifty PCR drops to < 0.5 on panic days
- OI concentration shifts lower — new PE writing at crash-level strikes
- Max pain shifts down 200-400 points overnight
- Recovery signal: When PE writing resumes at pre-crash strikes

---

## 7. F&O Ban Period

When a stock's OI crosses 95% of MWPL (Market Wide Position Limit):

1. **Ban is imposed**: No new positions allowed — only squaring off existing ones
2. **OI can only decrease**: Price may move sharply as forced squaring happens
3. **Once OI drops below 80% of MWPL**: Ban is lifted, fresh positions allowed
4. **OI surge after ban lift**: New positions rush in — high volatility expected

### Nifty/BankNifty Context
- Index options (Nifty/BankNifty) never enter F&O ban — this is only for stock options
- But if multiple Nifty 50 stocks are in ban → indicates broad market overheating

---

## 8. Quarterly Earnings Season (Oct-Nov, Jan-Feb, Apr-May, Jul-Aug)

### Pattern Before Results

- Stock-specific OI builds at ±5-10% from CMP
- **Straddle premium rises**: IV expansion 2-5 days before results
- **PCR for stock options**: More PE buying as traders hedge positions

### Pattern After Results

| Result | OI Response |
|---|---|
| Beat + positive guidance | CE OI collapses (calls exercised), PE writing at higher strikes |
| Beat + in-line guidance | Moderate OI adjustment, IV crush benefits sellers |
| Miss + weak guidance | PE OI collapses (puts exercised), CE writing at lower strikes |
| In-line results | Maximum IV crush — all premium melts |

### Nifty/BankNifty Impact
- Nifty OI shifts when **heavyweight earnings** report (Reliance, HDFC Bank, TCS, Infosys)
- If 3+ Nifty heavyweights beat → OI structure shifts bullish across all strikes
- If banking results disappoint → BankNifty OI shifts more than Nifty

---

## Quick Reference: Event Calendar OI Playbook

| Event | Advance Warning | OI Signal to Watch | Strategy |
|---|---|---|---|
| Weekly expiry | Monday's OI buildup | Max pain convergence | Sell ATM straddle Wed/Thu |
| Monthly expiry | Rollover % from T-5 | Rollover + cost of carry | Follow rollover direction |
| RBI Policy | T-3 IV expansion | Straddle premium | Buy straddle pre-RBI, sell after |
| Budget | T-10 OI buildup | ATM straddle premium | Buy straddle/strangle early |
| Elections | T-15 IV spike | Extreme wide strikes OI | Buy straddle or wide iron condor |
| Results (stock) | T-5 IV expansion | Stock straddle premium | Sell straddle post-results |
| Global shock | Overnight SGX/GIFT | PCR collapse + PE spike | Wait 30 min, then assess new OI |
| F&O Ban | OI > 95% MWPL | Forced squaring activity | Avoid until ban lifts |

---

*Reference maintained by NotSoSEBI (@NotSoSEBI | oi.notsosebi.in)*
