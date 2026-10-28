# IC Candle Scoring System - Setup Quality Assessment

## Overview

The IC Candle scoring system evaluates the quality of impulse candle retracement setups using multiple factors. This systematic approach helps prioritize high-probability trades and optimize position sizing based on setup strength.

## Scoring Framework

### Total Score Range: 0-100 points

#### Grade Classification
- **A+ (90-100)**: Exceptional setup, maximum position size
- **A (80-89)**: High-quality setup, large position size
- **A- (70-79)**: Good setup, normal position size
- **B+ (60-69)**: Average setup, reduced position size
- **B (50-59)**: Below average, small position size
- **C (0-49)**: Poor setup, avoid or very small size

## Scoring Components

### 1. Impulse Candle Quality (0-25 points)

#### Volume Strength (0-10)
- **10**: Volume > 3x 20-period average
- **8**: Volume 2.5-3x average
- **6**: Volume 2-2.5x average
- **4**: Volume 1.5-2x average
- **2**: Volume 1.2-1.5x average
- **0**: Volume < 1.2x average

#### Range Strength (0-10)
- **10**: True range > 3x 20-period ATR
- **8**: True range 2.5-3x ATR
- **6**: True range 2-2.5x ATR
- **4**: True range 1.5-2x ATR
- **2**: True range 1.2-1.5x ATR
- **0**: True range < 1.2x ATR

#### Close Location (0-5)
- **5**: Close in top/bottom 20% of candle range
- **3**: Close in top/bottom 30% of candle range
- **1**: Close in top/bottom 40% of candle range
- **0**: Close in middle 50% of candle range

### 2. Retracement Quality (0-25 points)

#### Retracement Depth (0-10)
- **10**: Retracement 40-60% of impulse move (optimal)
- **8**: Retracement 30-40% or 60-70%
- **6**: Retracement 20-30% or 70-80%
- **4**: Retracement 10-20% or 80-90%
- **2**: Retracement <10% or >90%
- **0**: No clear retracement

#### Time Duration (0-10)
- **10**: Retracement completes in 3-8 candles
- **8**: Retracement completes in 9-15 candles
- **6**: Retracement completes in 16-25 candles
- **4**: Retracement completes in 26-40 candles
- **2**: Retracement completes in 41-60 candles
- **0**: Retracement takes >60 candles

#### Level Confluence (0-5)
- **5**: Retracement hits Fibonacci + S/R level
- **3**: Retracement hits Fibonacci or S/R level
- **1**: Retracement hits weak S/R level
- **0**: No level confluence

### 3. Momentum Confirmation (0-20 points)

#### RSI Divergence (0-8)
- **8**: Strong RSI divergence (oversold/overbought)
- **6**: Moderate RSI divergence
- **4**: Weak RSI divergence
- **2**: No RSI divergence
- **0**: RSI against trade direction

#### MACD Confirmation (0-8)
- **8**: MACD histogram increasing + signal crossover
- **6**: MACD histogram increasing
- **4**: MACD signal crossover only
- **2**: MACD flat or slightly negative
- **0**: MACD against trade direction

#### Volume Confirmation (0-4)
- **4**: Volume spike (>1.8x average) on entry candle
- **3**: Above average volume (1.4-1.8x average)
- **2**: Average volume (0.8-1.4x average)
- **1**: Below average volume (0.5-0.8x average)
- **0**: Very low volume (<0.5x average)

### 4. Market Context (0-15 points)

#### Trend Alignment (0-6)
- **6**: Setup aligns with strong trend (daily/weekly)
- **4**: Setup aligns with moderate trend
- **2**: Setup aligns with weak trend
- **0**: Setup against prevailing trend

#### Volatility Regime (0-6)
- **6**: Optimal volatility (ATR 1.5-2.5x long-term average)
- **4**: High volatility (ATR 2.5-3.5x average)
- **3**: Low volatility (ATR 0.5-1.5x average)
- **1**: Very high volatility (ATR >3.5x average)
- **0**: Extremely low volatility (ATR <0.5x average)

#### Market Breadth (0-3)
- **3**: Broad market participation (NIFTY advances >60%)
- **2**: Moderate participation (NIFTY advances 50-60%)
- **1**: Weak participation (NIFTY advances 40-50%)
- **0**: Poor participation (NIFTY advances <40%)

### 5. Risk Factors (0-15 points, subtracted from total)

#### Stop Loss Distance (0-6, negative impact)
- **-6**: Stop loss <2% from entry (very tight)
- **-4**: Stop loss 2-4% from entry
- **-2**: Stop loss 4-6% from entry
- **0**: Stop loss >6% from entry (acceptable)

#### Reward-Risk Ratio (0-6, negative impact)
- **-6**: R:R <1.5:1 (poor ratio)
- **-4**: R:R 1.5-2:1
- **-2**: R:R 2-2.5:1
- **0**: R:R >2.5:1 (good ratio)

#### Holding Time Risk (0-3, negative impact)
- **-3**: Expected hold time >10 days
- **-2**: Expected hold time 7-10 days
- **-1**: Expected hold time 4-7 days
- **0**: Expected hold time <4 days

## Position Sizing Matrix

### Base Position Size by Grade

| Grade | Base Size | Max Size | Risk Multiplier |
|-------|-----------|----------|-----------------|
| A+    | 2.0%      | 3.0%     | 1.5x           |
| A     | 1.5%      | 2.5%     | 1.3x           |
| A-    | 1.0%      | 2.0%     | 1.0x           |
| B+    | 0.7%      | 1.5%     | 0.8x           |
| B     | 0.5%      | 1.0%     | 0.6x           |
| C     | 0.2%      | 0.5%     | 0.3x           |

### Adjustments

#### Market Volatility
- **High Volatility**: Reduce size by 20-30%
- **Low Volatility**: Increase size by 10-20%
- **Extreme Volatility**: Reduce size by 50%

#### Account Size
- **Small Account (<₹50K)**: Use minimum sizes
- **Medium Account (₹50K-₹2L)**: Use base sizes
- **Large Account (>₹2L)**: Can use maximum sizes

#### Recent Performance
- **Winning Streak**: Increase size by 10-20%
- **Losing Streak**: Reduce size by 20-50%
- **Break-even**: Use base sizes

## Example Scoring

### High-Quality Setup (A+)
```
Impulse Quality: 25/25
- Volume: 3.2x average (+10)
- Range: 2.8x ATR (+8)
- Close: Top 15% (+5)

Retracement Quality: 22/25
- Depth: 45% retracement (+10)
- Duration: 5 candles (+10)
- Confluence: Fib + S/R (+5)

Momentum: 18/20
- RSI: Oversold divergence (+8)
- MACD: Histogram increasing + crossover (+8)
- Volume: 2.1x average (+4)

Market Context: 13/15
- Trend: Strong alignment (+6)
- Volatility: Optimal (+6)
- Breadth: Good participation (+3)

Risk Factors: -3/15
- Stop: 3% distance (-4)
- R:R: 2.8:1 (0)
- Hold: 3 days (0)

Total Score: 25 + 22 + 18 + 13 - 3 = 75 → A- Grade
```

### Poor Setup (C)
```
Impulse Quality: 8/25
- Volume: 1.1x average (+2)
- Range: 1.3x ATR (+2)
- Close: Middle of range (0)

Retracement Quality: 6/25
- Depth: 15% retracement (+4)
- Duration: 45 candles (+2)
- Confluence: Weak level (0)

Momentum: 4/20
- RSI: No divergence (+2)
- MACD: Against direction (0)
- Volume: Below average (+1)

Market Context: 3/15
- Trend: Weak alignment (+2)
- Volatility: Too low (+3)
- Breadth: Poor participation (0)

Risk Factors: -12/15
- Stop: 1.5% distance (-6)
- R:R: 1.2:1 (-6)
- Hold: 12 days (-3)

Total Score: 8 + 6 + 4 + 3 - 12 = 9 → C Grade
```

## Dynamic Adjustments

### Market Regime Adaptation

#### Bull Market
- **Increase weights**: Trend alignment (+2 points)
- **Reduce penalties**: Stop distance (-1 point)
- **Adjust thresholds**: Volume requirements (-0.2x)

#### Bear Market
- **Increase weights**: Momentum confirmation (+2 points)
- **Adjust levels**: RSI thresholds (5 points lower)
- **Reduce size**: All grades (-20% base size)

#### Sideways Market
- **Increase weights**: Retracement quality (+3 points)
- **Reduce size**: All grades (-30% base size)
- **Tighter stops**: Require minimum 6% stop distance

### Time-Based Adjustments

#### Market Open (9:15-10:30)
- **Higher scores**: Opening range breakouts (+5 points)
- **Volume weight**: Increased importance (+2 points)

#### Mid-Session (10:30-14:00)
- **Standard scoring**: No adjustments
- **Normal weights**: All factors standard

#### Late Session (14:00-15:30)
- **Lower scores**: End-of-day fade (-3 points)
- **Reduced size**: All positions (-20%)

## Performance Tracking

### Score vs. Performance Correlation

#### Win Rate by Grade
- **A+**: 78-85%
- **A**: 70-78%
- **A-**: 65-70%
- **B+**: 55-65%
- **B**: 45-55%
- **C**: <45%

#### Average R:R by Grade
- **A+**: 3.2:1
- **A**: 2.8:1
- **A-**: 2.4:1
- **B+**: 2.0:1
- **B**: 1.7:1
- **C**: 1.3:1

### Continuous Optimization

#### Monthly Review
- **Grade performance**: Adjust scoring weights
- **Market changes**: Update regime adjustments
- **New factors**: Add relevant confirmation factors

#### Backtesting Validation
- **Score accuracy**: Test score vs. actual performance
- **Threshold optimization**: Adjust grade boundaries
- **Factor importance**: Reweight based on correlation

## Implementation Notes

### Real-time Scoring
```python
def calculate_ic_score(impulse_candle, retracement_data, market_context):
    """
    Calculate IC setup score in real-time

    Args:
        impulse_candle: Impulse candle data
        retracement_data: Retracement analysis
        market_context: Current market conditions

    Returns:
        dict: Score breakdown and grade
    """

    score = 0
    breakdown = {}

    # Impulse quality
    breakdown['impulse'] = score_impulse_quality(impulse_candle)
    score += breakdown['impulse']

    # Retracement quality
    breakdown['retracement'] = score_retracement_quality(retracement_data)
    score += breakdown['retracement']

    # Momentum confirmation
    breakdown['momentum'] = score_momentum_confirmation(retracement_data)
    score += breakdown['momentum']

    # Market context
    breakdown['context'] = score_market_context(market_context)
    score += breakdown['context']

    # Risk factors (subtracted)
    breakdown['risk'] = score_risk_factors(retracement_data)
    score -= breakdown['risk']

    # Ensure bounds
    final_score = max(0, min(100, score))

    # Determine grade
    grade = determine_grade(final_score)

    return {
        'total_score': final_score,
        'grade': grade,
        'breakdown': breakdown,
        'recommendation': get_position_recommendation(grade, market_context)
    }
```

### Automated Position Sizing
```python
def calculate_position_size(score_data, account_balance, market_volatility):
    """
    Calculate position size based on score and conditions

    Args:
        score_data: Scoring results
        account_balance: Available capital
        market_volatility: Current volatility regime

    Returns:
        float: Position size as percentage of account
    """

    base_size = get_base_size_for_grade(score_data['grade'])

    # Apply market adjustments
    if market_volatility == 'high':
        base_size *= 0.8
    elif market_volatility == 'low':
        base_size *= 1.1

    # Score adjustment (A+ gets bonus, C gets penalty)
    score_multiplier = 0.8 + (score_data['total_score'] / 125)  # 0.8 to 1.6
    base_size *= score_multiplier

    # Ensure reasonable bounds
    final_size = max(0.1, min(5.0, base_size))

    return final_size
```

## Conclusion

The IC Candle scoring system provides a comprehensive framework for evaluating setup quality and determining appropriate position sizing. By considering multiple factors across price action, momentum, and market context, traders can make more informed decisions and optimize their risk-adjusted returns.

Regular monitoring and adjustment of the scoring system ensures it remains effective as market conditions evolve.
