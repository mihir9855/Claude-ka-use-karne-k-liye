# Options Greeks Guide for Indian Markets

## Core Greeks and Interpretation

### Delta (Δ) - Direction Sensitivity
- **Range**: -1.0 to +1.0
- **Call Options**: 0 to +1.0 (higher = more bullish exposure)
- **Put Options**: -1.0 to 0 (higher = more bearish exposure)
- **At-the-Money**: ~0.5 for calls, ~-0.5 for puts
- **Indian Context**: Nifty options have higher delta due to volatility

### Gamma (Γ) - Delta Change Rate
- **Range**: 0 to 0.2 (typically)
- **Peak**: At-the-money options
- **Risk**: High gamma = delta changes rapidly with price moves
- **Weekly Options**: Gamma accelerates last 2 days before expiry
- **Indian Market**: Higher gamma due to shorter expiries

### Theta (Θ) - Time Decay
- **Range**: -0.5 to 0 (negative for long options)
- **Acceleration**: Last 2 weeks of monthly expiry, last 2 days of weekly
- **Weekly Pattern**: Wednesday sell-off, Thursday scalp opportunities
- **Indian Timing**: Theta crush strongest 2-3 PM IST

### Vega (V) - Volatility Sensitivity
- **Range**: 0 to 1.0
- **Long Vega**: Profits from IV increase
- **Short Vega**: Profits from IV decrease (theta plays)
- **Events**: Budget, RBI, elections increase IV
- **Indian Events**: Higher IV impact than US markets

### Rho (ρ) - Interest Rate Sensitivity
- **Call Options**: Positive rho (benefits from higher rates)
- **Put Options**: Negative rho (benefits from lower rates)
- **Current Rate**: 6.5% RBI repo rate
- **Impact**: Minimal for short-dated options

## Greeks in Indian Context

### Nifty vs BankNifty Greeks
| Greek | Nifty | BankNifty | Reason |
|-------|-------|-----------|--------|
| Delta | Lower | Higher | BankNifty more directional |
| Gamma | Lower | Higher | Shorter expiry impact |
| Theta | Lower | Higher | Faster time decay |
| Vega | Similar | Similar | Same volatility drivers |

### Weekly vs Monthly Expiry
| Greek | Weekly | Monthly | Reason |
|-------|--------|---------|--------|
| Gamma | 2x higher | Lower | Time compression |
| Theta | 3x higher | Lower | Faster decay |
| Vega | 1.5x higher | Lower | Event sensitivity |

## Strategy Greeks Profiles

### Long Straddle (High Vega, Negative Theta)
- **Delta**: ~0 (direction neutral)
- **Gamma**: High (benefits from big moves)
- **Theta**: Negative (time enemy)
- **Vega**: High (IV increase helps)
- **Best For**: Event uncertainty (RBI, Budget)

### Iron Condor (Negative Vega, Positive Theta)
- **Delta**: Small positive/negative
- **Gamma**: Low (stable delta)
- **Theta**: Positive (time decay helps)
- **Vega**: Negative (IV decrease helps)
- **Best For**: Low volatility periods

### Bull Call Spread (Positive Delta, Negative Theta)
- **Delta**: 0.2-0.4 (moderate bullish)
- **Gamma**: Low to medium
- **Theta**: Negative (but lower than naked)
- **Vega**: Medium
- **Best For**: Moderately bullish outlook

## Risk Management with Greeks

### Delta Hedging
- **Target**: Keep portfolio delta between -0.1 and +0.1
- **Rebalancing**: When delta exceeds ±0.05
- **Indian Context**: Higher rebalancing frequency due to volatility

### Gamma Risk
- **Monitor**: Gamma >0.05 requires attention
- **Weekly Expiry**: Gamma spikes last 2 days
- **Adjustment**: Roll or close high gamma positions

### Theta Harvesting
- **Target**: Positive theta > ₹500/day
- **Weekly Plays**: Wednesday straddle sells
- **Exit Rule**: Close when theta decays 30%

## IV Percentile Interpretation

### Low IV (<25th percentile)
- **Greeks Impact**: Lower premiums, higher theta decay
- **Strategies**: Selling strategies (iron condor, spreads)
- **Risk**: IV expansion can hurt shorts

### High IV (>75th percentile)
- **Greeks Impact**: Higher premiums, lower theta decay
- **Strategies**: Buying strategies (straddles, strangles)
- **Risk**: IV crush can hurt longs

### IV Skew Analysis
- **Call Skew > Put Skew**: Bullish bias in options
- **Put Skew > Call Skew**: Bearish bias in options
- **Steep Skew**: Fear of downside moves

## Practical Examples

### Nifty 24500 Example
```
Call 24600 (ITM): Delta 0.65, Gamma 0.08, Theta -25, Vega 0.45
Put 24400 (ITM):  Delta -0.62, Gamma 0.07, Theta -22, Vega 0.42
ATM Straddle:     Delta 0.03, Gamma 0.12, Theta -45, Vega 0.85
```

### Weekly Theta Play
- **Entry**: Wednesday morning
- **Strategy**: Short straddle/strangle
- **Greeks Target**: Theta > ₹1,000/day, Vega <0.3
- **Exit**: Thursday close or 30% theta decay

### 920 Straddle Analysis
- **Time**: 9:20 AM IST (opening volatility)
- **Focus**: High gamma, theta plays
- **Edge**: Opening range provides better entries
- **Risk**: Higher slippage in first 20 minutes

## Common Pitfalls
1. **Ignoring Gamma**: High gamma positions can reverse quickly
2. **Theta Overconfidence**: Time decay slows near expiry
3. **IV Assumptions**: Indian markets have event-driven IV spikes
4. **Weekend Risk**: Gaps can dramatically change Greeks
5. **Liquidity**: Thin options have wider bid-ask spreads
