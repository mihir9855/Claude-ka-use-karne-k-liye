# Technical Indicators Guide for NSE Markets

## Overview
Comprehensive guide to technical indicators adapted for Indian equity and derivatives markets. Includes calculation methods, interpretation, and NSE-specific considerations.

## Trend Indicators

### Moving Averages
**Simple Moving Average (SMA)**
```
Formula: SMA = (P1 + P2 + ... + Pn) / n
Where: P = Price, n = Period
```

**Common Periods:** 5, 10, 20, 50, 100, 200 days
**NSE Context:** 50 and 200-day SMAs are critical for long-term trend
**Signal:** Price above SMA = Bullish, below = Bearish

**Exponential Moving Average (EMA)**
```
Formula: EMA(today) = (Price(today) * Multiplier) + EMA(yesterday) * (1 - Multiplier)
Multiplier = 2 / (n + 1)
```

**Advantages over SMA:** More responsive to recent price changes
**NSE Usage:** EMA(21) for short-term, EMA(50) for medium-term trends

### MACD (Moving Average Convergence Divergence)
```
MACD Line = EMA(12) - EMA(26)
Signal Line = EMA(9) of MACD Line
Histogram = MACD Line - Signal Line
```

**Signals:**
- MACD crosses above Signal = Bullish
- MACD crosses below Signal = Bearish
- Histogram changes from negative to positive = Momentum shift

**NSE Context:** Excellent for momentum in NIFTY and individual stocks
**Parameters:** Standard 12-26-9 works well for daily charts

## Momentum Indicators

### RSI (Relative Strength Index)
```
RSI = 100 - (100 / (1 + RS))
RS = Average Gain / Average Loss (typically 14 periods)
```

**Interpretation:**
- Above 70: Overbought (potential sell signal)
- Below 30: Oversold (potential buy signal)
- 50: Neutral
- Divergences: Price makes new high, RSI doesn't = Bearish divergence

**NSE Context:**
- Works better in trending markets than sideways
- False signals common in high-volatility periods
- Use with trend confirmation

### Stochastic Oscillator
```
%K = 100 * (Close - Lowest Low) / (Highest High - Lowest Low)
%D = 3-period SMA of %K
```

**Signals:**
- %K crosses above %D = Buy signal
- %K crosses below %D = Sell signal
- Overbought (>80), Oversold (<20)

**NSE Context:** Effective in range-bound markets
**Slow Stochastic:** %K(14,3), %D(3) - smoother signals

## Volatility Indicators

### Bollinger Bands
```
Middle Band = SMA(20)
Upper Band = Middle Band + (2 × Standard Deviation)
Lower Band = Middle Band - (2 × Standard Deviation)
```

**Signals:**
- Price touches Upper Band = Potential resistance
- Price touches Lower Band = Potential support
- Squeeze = Low volatility, potential breakout
- Band expansion = High volatility

**NSE Context:**
- Bands expand during earnings season
- Useful for identifying volatility contractions before big moves
- %B = (Price - Lower Band) / (Upper Band - Lower Band)

### ATR (Average True Range)
```
True Range = Max[(High - Low), (High - Previous Close), (Previous Close - Low)]
ATR = EMA of True Range (typically 14 periods)
```

**Uses:**
- Volatility measurement
- Position sizing (risk per trade)
- Stop loss placement (2×ATR stops)

**NSE Context:** Higher ATR during budget sessions and election periods

## Volume Indicators

### Volume Weighted Average Price (VWAP)
```
VWAP = Σ(Price × Volume) / Σ(Volume)
Calculated from session start
```

**Interpretation:**
- Price above VWAP = Bullish
- Price below VWAP = Bearish
- Used intraday for institutional activity

**NSE Context:** Important for index stocks with high institutional ownership

### On Balance Volume (OBV)
```
If Close > Previous Close: OBV = OBV(previous) + Volume
If Close < Previous Close: OBV = OBV(previous) - Volume
If Close = Previous Close: OBV = OBV(previous)
```

**Signals:** OBV trend divergence from price indicates potential reversal

### Volume Rate of Change
```
ROC = (Current Volume - Volume n periods ago) / Volume n periods ago × 100
```

**NSE Context:** Spikes during result days and F&O expiry

## Support & Resistance Indicators

### Pivot Points
**Standard Pivot:**
```
Pivot = (High + Low + Close) / 3
R1 = (2 × Pivot) - Low
S1 = (2 × Pivot) - High
R2 = Pivot + (High - Low)
S2 = Pivot - (High - Low)
```

**NSE Usage:** Daily pivots widely followed by traders
**Timeframes:** Daily, weekly, monthly pivots

### Fibonacci Retracements
**Key Levels:** 23.6%, 38.2%, 50%, 61.8%, 78.6%
**Usage:** Identify potential reversal zones in trending moves
**NSE Context:** 50% and 61.8% are most watched levels

## NSE Market Specific Considerations

### Index Characteristics
**NIFTY 50:** More stable, institutional influence
- Indicators work better on daily/weekly charts
- False signals less frequent than individual stocks

**BANKNIFTY:** Higher volatility, sector-specific news
- RSI divergences very reliable
- Volume analysis crucial

**NIFTY IT:** Technology sector, earnings driven
- MACD works well for momentum
- Bollinger Bands useful for volatility

### Derivatives Impact
**F&O Stocks:** Higher volatility affects indicators
- ATR typically higher
- RSI more prone to overbought/oversold readings

**Expiry Effects:**
- OI buildup affects volume indicators
- Last trading day shows unusual patterns

### Market Hours & Liquidity
**Opening Range:** First 15-30 minutes most volatile
- Indicators may give false signals
- Wait for range establishment

**Lunch Hour:** Reduced liquidity (13:00-14:00)
- Volume indicators less reliable
- Price action may be choppy

### Seasonal Patterns
**Budget Session:** Increased volatility (Feb-March)
- Bollinger Bands expand significantly
- ATR spikes

**Earnings Season:** April and October
- Volume ROC shows spikes
- RSI may stay overbought/oversold longer

**Festive Season:** December-January
- Lower volumes, higher volatility
- Indicators less reliable

## Indicator Combinations

### Trend Following Setup
```
Primary: EMA(50) > EMA(200)
Confirmation: MACD histogram positive
Entry: RSI > 50 and price > EMA(21)
Stop: Below EMA(50)
```

### Mean Reversion Setup
```
Primary: Price between Bollinger Bands
Confirmation: RSI < 30 (oversold) or > 70 (overbought)
Entry: Stochastic %K crosses %D in oversold/overbought zone
Stop: Outside Bollinger Bands
```

### Breakout Setup
```
Primary: Bollinger Squeeze (bands contracting)
Confirmation: Volume increasing
Entry: Break above/below squeeze with volume
Stop: Middle Bollinger Band
```

## Common Mistakes

### Over-reliance on Single Indicator
- Always use multiple confirmations
- No indicator works 100% of time

### Wrong Timeframe
- Daily indicators on 5-min charts give too many signals
- Intraday indicators on monthly charts give delayed signals

### Ignoring Market Context
- Same indicator behaves differently in bull vs bear markets
- Sector rotation affects relative strength

### Parameter Optimization
- Don't curve-fit parameters to historical data
- Use standard parameters that work across markets

## Recommended Settings for NSE

| Indicator | Primary Timeframe | Parameters | Usage |
|-----------|------------------|-------------|-------|
| RSI | Daily/Weekly | 14 | Momentum |
| MACD | Daily | 12,26,9 | Trend |
| Bollinger Bands | Daily | 20,2 | Volatility |
| Stochastic | Hourly/Daily | 14,3,3 | Timing |
| ATR | Daily | 14 | Risk management |
| VWAP | Intraday | - | Institutional levels |

## Performance Expectations

### Realistic Win Rates
- Single indicator: 55-65%
- Multiple confirmations: 65-75%
- With trend filter: 70-80%

### Risk Management
- Stop loss: 1-2×ATR
- Position size: 1-2% of capital per trade
- Maximum drawdown limit: 5-10% of capital

### Continuous Learning
- Track indicator performance
- Adjust based on market conditions
- Combine with fundamental analysis for better results
