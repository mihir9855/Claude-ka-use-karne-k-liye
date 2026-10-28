# Max Pain Theory — Calculation & Application for NSE

> **NotSoSEBI Reference** | Last updated: April 2026
> How max pain works, how to calculate it, and how reliable it is for Nifty/BankNifty.

---

## What is Max Pain?

**Max Pain** (also called the **Maximum Pain Point** or **Option Pain**) is the strike price at which **option writers (sellers) collectively lose the least amount of money** — or equivalently, the strike price at which **option buyers lose the most**.

It is based on the theory that option writers (who are generally better capitalized and more sophisticated) will try to move the market toward the max pain level by expiry. This is sometimes called the **pinning effect**.

### The Core Premise

> "Markets tend to gravitate toward the price level where the maximum number of options expire worthless."

When a contract expires worthless, the writer keeps the entire premium. Max pain is the equilibrium where the most contracts (by value) expire worthless.

---

## Max Pain Calculation

### Algorithm

For each strike price in the options chain:

1. **Assume the index settles at that strike at expiry**
2. **Calculate the total loss for all CE (Call) holders** at that settlement price
3. **Calculate the total loss for all PE (Put) holders** at that settlement price
4. **Sum the CE pain + PE pain** = Total Pain at that strike
5. **The strike with the MINIMUM total pain is Max Pain**

### Mathematical Formula

```
For a given settlement_price S:

CE Pain at strike K = max(0, S - K) × CE_OI_at_K × lot_size
PE Pain at strike K = max(0, K - S) × PE_OI_at_K × lot_size

Total Pain at S = Σ (CE Pain at each strike) + Σ (PE Pain at each strike)

Max Pain = S where Total Pain is MINIMUM
```

### Step-by-Step Example

Suppose Nifty options chain has these OI values (simplified):

| Strike | CE OI (contracts) | PE OI (contracts) |
|--------|-------------------|-------------------|
| 24,000 | 50,000 | 5,000 |
| 24,200 | 40,000 | 10,000 |
| 24,400 | 30,000 | 20,000 |
| 24,500 | 25,000 | 25,000 |
| 24,600 | 20,000 | 30,000 |
| 24,800 | 10,000 | 40,000 |
| 25,000 | 5,000 | 50,000 |

**If settlement = 24,500** (lot size = 25):

CE Pain:
- 24,000 CE: max(0, 24500-24000) × 50,000 × 25 = 500 × 50,000 × 25 = ₹625 Cr
- 24,200 CE: max(0, 24500-24200) × 40,000 × 25 = 300 × 40,000 × 25 = ₹300 Cr
- 24,400 CE: max(0, 24500-24400) × 30,000 × 25 = 100 × 30,000 × 25 = ₹75 Cr
- 24,500 CE and above: 0 (OTM, expire worthless)

PE Pain:
- 25,000 PE: max(0, 25000-24500) × 50,000 × 25 = 500 × 50,000 × 25 = ₹625 Cr
- 24,800 PE: max(0, 24800-24500) × 40,000 × 25 = 300 × 40,000 × 25 = ₹300 Cr
- 24,600 PE: max(0, 24600-24500) × 30,000 × 25 = 100 × 30,000 × 25 = ₹75 Cr
- 24,500 PE and below: 0 (OTM, expire worthless)

Total Pain at 24,500 = ₹625 + ₹300 + ₹75 + ₹625 + ₹300 + ₹75 = ₹2,000 Cr

Repeat for every strike — the one with the **lowest** total pain is max pain.

---

## Max Pain Dynamics

### How Max Pain Shifts

Max pain is not static — it changes as OI changes:

| Scenario | Max Pain Effect |
|---|---|
| Heavy CE writing at 25,000 | Max pain may shift down (more contracts need to expire worthless above) |
| Heavy PE writing at 24,000 | Max pain may shift up (more contracts need to expire worthless below) |
| OI addition balanced at ATM | Max pain stays near current spot |
| Large OI unwinding one side | Max pain shifts toward the surviving OI side |

### Max Pain Migration Through the Week

| Day | Max Pain Behavior |
|---|---|
| Monday | Often far from spot — OI is still building |
| Tuesday | Begins stabilizing — key OI levels form |
| Wednesday | Usually close to final max pain — big OI additions settle |
| Thursday (Expiry) | Max pain is "set" by morning; market gravitates toward it in last 2 hours |

---

## Reliability Assessment

### When Max Pain Works Well (~60-70% accuracy)

1. **Weekly expiry with high OI concentration**: When OI is concentrated at 2-3 strikes, pinning is more likely
2. **Low-volatility environments**: Calm markets allow writers to hold positions — price drifts toward max pain
3. **No major events**: Event-free weeks see highest max pain accuracy
4. **Last 2 hours of expiry**: Even when max pain fails early, it often works in the final hours

### When Max Pain Fails (~30-40% of the time)

1. **Trending markets**: Strong trends (FII-driven rallies, panic selloffs) override max pain
2. **Event days**: RBI policy, US Fed, geopolitical events cause breakouts beyond max pain
3. **Gap openings**: A gap-up/gap-down that invalidates the OI structure
4. **Low OI expiry**: When OI is spread thinly, there's less pinning force
5. **Budget day / Election results**: Extreme moves that no OI level can contain

### Nifty-specific Reliability Data

| Scenario | Max Pain Accuracy (approx.) |
|---|---|
| Weekly expiry, normal week | 60-70% |
| Monthly expiry, normal month | 50-60% |
| Weekly expiry, event week | 35-45% |
| Monthly expiry + RBI policy | 30-40% |
| Budget day / Election result | 10-20% |

---

## Practical Usage for Trading

### Strategy 1: Expiry Day Mean Reversion

If Nifty opens away from max pain on expiry day:
1. Wait until 12:00 PM IST
2. If Nifty is still within 200 points of max pain → sell a straddle at ATM (or sell the side that's ITM)
3. Target: Move toward max pain by 2:30 PM
4. Stop: If Nifty moves 150+ points further from max pain after 12:00

### Strategy 2: Max Pain as a Filter

Don't trade max pain alone — use it as a **filter**:
- If your directional bias aligns with max pain → Higher confidence trade
- If your bias is opposite to max pain → Reduce position size or skip
- If max pain and spot are very close → Expect range-bound; consider iron condor

### Strategy 3: Max Pain + PCR Combo

| Max Pain vs Spot | PCR | Signal |
|---|---|---|
| Max pain above spot | PCR > 1.0 | Bullish — both signals agree (gravitate up) |
| Max pain below spot | PCR < 0.8 | Bearish — both signals agree (gravitate down) |
| Max pain above spot | PCR < 0.7 | Conflicting — be cautious, reduce size |
| Max pain at spot | PCR 0.8–1.2 | Range-bound — sell options (straddle/strangle) |

---

## Implementation Notes

### For `scripts/calculate_max_pain.py`

```python
# Pseudocode for max pain calculation
def calculate_max_pain(chain_data: pd.DataFrame, lot_size: int) -> dict:
    """
    chain_data columns: strike, ce_oi, pe_oi
    Returns: {
        'max_pain_strike': int,
        'total_pain_at_max_pain': float,
        'pain_curve': dict  # {strike: total_pain} for all strikes
    }
    """
    strikes = chain_data['strike'].unique()
    pain_at_strike = {}
    
    for settlement in strikes:
        ce_pain = sum(max(0, settlement - row.strike) * row.ce_oi * lot_size 
                      for row in chain_data.itertuples())
        pe_pain = sum(max(0, row.strike - settlement) * row.pe_oi * lot_size 
                      for row in chain_data.itertuples())
        pain_at_strike[settlement] = ce_pain + pe_pain
    
    max_pain = min(pain_at_strike, key=pain_at_strike.get)
    return {
        'max_pain_strike': max_pain,
        'total_pain_at_max_pain': pain_at_strike[max_pain],
        'pain_curve': pain_at_strike
    }
```

### Edge Cases to Handle

1. **Zero OI strikes**: Skip in calculation (don't divide by zero scenarios)
2. **Missing strikes**: NSE sometimes has gaps — interpolate or skip
3. **After-hours data**: Use last snapshot, note the timestamp
4. **Multiple max pain strikes**: If two strikes have identical pain, pick the one closer to spot

---

## Further Reading

- The original "Max Pain" theory is attributed to research showing options tend to expire at the strike where the most contracts are OTM
- For NSE-specific research, refer to OI data from oi.notsosebi.in for historical max pain accuracy tracking
- Combine max pain with IV percentile and OI concentration metrics for best results

---

*Reference maintained by NotSoSEBI (@NotSoSEBI | oi.notsosebi.in)*
