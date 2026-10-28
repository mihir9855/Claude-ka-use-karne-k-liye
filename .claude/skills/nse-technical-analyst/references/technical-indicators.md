# Technical Indicators Reference — NotSoSEBI

## RSI (Relative Strength Index)
**Formula:** `RSI = 100 - (100 / (1 + RS))` where `RS = Avg Gain / Avg Loss (14 periods)`
**Interpretation:** Oscillates 0-100; >70 overbought, <30 oversold
**Divergences:** Price makes higher high, RSI lower high = bearish divergence
**Indian Market Notes:** Use 21-period for positional trades; expiry days show extreme readings (80+/20-)

## MACD (Moving Average Convergence Divergence)
**Formula:** `MACD = EMA(12) - EMA(26)`, `Signal = EMA(9) of MACD`, `Histogram = MACD - Signal`
**Interpretation:** Bullish when MACD crosses above signal; histogram shows momentum
**Signal Crossovers:** MACD > Signal = Buy; MACD < Signal = Sell
**Indian Market Notes:** Excellent for NIFTY momentum; histogram zero-cross often precedes reversals

## Supertrend
**Formula:** `Upper Band = (High + Low)/2 + (ATR × 3)`, `Lower Band = (High + Low)/2 - (ATR × 3)`
**Interpretation:** Trend-following; price below upper band = bullish, above lower band = bearish
**Trend Flips:** Band color change signals trend reversal
**Indian Market Notes:** ATR(10) period, multiplier 3.0 conservative for NSE volatility; reliable in trending markets

## VWAP (Volume Weighted Average Price)
**Formula:** `VWAP = Σ(Price × Volume) / ΣVolume` (cumulative from session start)
**Interpretation:** Intraday anchor; price above VWAP = bullish, below = bearish
**Bands:** Often used with standard deviation bands around VWAP
**Indian Market Notes:** Critical for NSE intraday (9:15-15:30 IST); FII orders often respect VWAP levels

## EMA (Exponential Moving Average)
**Formula:** `EMA(today) = (Price × Multiplier) + EMA(yesterday) × (1 - Multiplier)` where `Multiplier = 2/(n+1)`
**Common Periods:** EMA(9) short-term, EMA(21) medium-term, EMA(50/200) long-term
**Usage:** Crossovers signal trend changes; support/resistance levels
**Indian Market Notes:** EMA(21) crucial for weekly charts; 50/200 crossover major signals for NIFTY

## Bollinger Bands
**Formula:** `Middle = SMA(20)`, `Upper = Middle + (2 × Std Dev)`, `Lower = Middle - (2 × Std Dev)`
**Interpretation:** Price touching bands = extreme; squeeze = low volatility, expansion = high volatility
**Squeeze:** Bands contracting often precedes big moves
**Indian Market Notes:** 20-period, 2 SD standard; squeeze in NIFTY often resolves on F&O expiry

## ADX (Average Directional Index)
**Formula:** `ADX = 100 × EMA(|DI+ - DI-| / |DI+ + DI-|)` where DI are directional indicators
**Interpretation:** >25 strong trend, <20 weak/no trend; measures trend strength not direction
**Trend Strength:** 25-40 moderate, >40 strong trend
**Indian Market Notes:** Useful for NSE indices; ADX >30 often means trending phase in individual stocks</content>
<parameter name="filePath">/Users/divishti/Desktop/Terminal/skills/nse-technical-analyst/references/technical-indicators.md
