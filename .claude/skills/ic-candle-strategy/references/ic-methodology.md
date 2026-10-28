# IC Candle Methodology - Impulse Candle Retracement Strategy

## Overview

The Impulse Candle (IC) strategy identifies high-probability trading opportunities that occur after strong directional price moves. This methodology focuses on the natural retracement behavior that follows impulse candles, providing optimal entry points for continuation trades.

## Core Principles

### 1. Impulse Candle Definition

An impulse candle is characterized by:
- **Strong Volume**: At least 2x the 20-period average volume
- **Extended Range**: True range at least 2x the 20-period ATR
- **Directional Bias**: Closes near the high (bullish) or low (bearish) of the candle
- **Level Breakout**: Breaks recent swing high/low or key support/resistance

### 2. Retracement Dynamics

Following an impulse candle, price typically:
- **Retraces**: Pulls back 20-80% of the impulse move
- **Consolidates**: Forms a base or continuation pattern
- **Resumes**: Continues in the direction of the original impulse

### 3. Entry Timing

Optimal entries occur when:
- **Retracement Completes**: Price reaches key Fibonacci/support levels
- **Momentum Reverses**: Indicators show renewed buying/selling pressure
- **Volume Confirms**: Increased volume on the retracement completion

## Detection Algorithm

### Step 1: Impulse Candle Identification

```python
def is_impulse_candle(candle, context):
    """
    Identify if a candle qualifies as an impulse candle

    Args:
        candle: OHLCV data for the candle
        context: Market context (averages, levels)

    Returns:
        bool: True if impulse candle
    """

    # Volume check
    volume_ratio = candle['volume'] / context['avg_volume_20']
    if volume_ratio < 2.0:
        return False

    # Range check
    true_range = max(candle['high'] - candle['low'],
                    abs(candle['high'] - context['prev_close']),
                    abs(candle['low'] - context['prev_close']))
    range_ratio = true_range / context['avg_atr_20']
    if range_ratio < 2.0:
        return False

    # Close location check
    if candle['close'] > candle['open']:  # Bullish
        close_location = (candle['close'] - candle['low']) / (candle['high'] - candle['low'])
        if close_location < 0.7:
            return False
    else:  # Bearish
        close_location = (candle['high'] - candle['close']) / (candle['high'] - candle['low'])
        if close_location < 0.7:
            return False

    # Breakout check
    if candle['close'] > candle['open']:
        if candle['high'] <= context['recent_swing_high']:
            return False
    else:
        if candle['low'] >= context['recent_swing_low']:
            return False

    return True
```

### Step 2: Retracement Level Calculation

```python
def calculate_retracement_levels(impulse_candle, direction):
    """
    Calculate key retracement levels after impulse

    Args:
        impulse_candle: The impulse candle data
        direction: 'bullish' or 'bearish'

    Returns:
        dict: Retracement levels
    """

    if direction == 'bullish':
        impulse_high = impulse_candle['high']
        impulse_low = impulse_candle['low']
        move_size = impulse_high - impulse_low

        levels = {
            'entry_zone': impulse_high - (move_size * 0.382),
            'optimal_entry': impulse_high - (move_size * 0.5),
            'stop_level': impulse_low,
            'target_1': impulse_high + (move_size * 0.618),
            'target_2': impulse_high + move_size
        }
    else:  # bearish
        impulse_high = impulse_candle['high']
        impulse_low = impulse_candle['low']
        move_size = impulse_high - impulse_low

        levels = {
            'entry_zone': impulse_low + (move_size * 0.382),
            'optimal_entry': impulse_low + (move_size * 0.5),
            'stop_level': impulse_high,
            'target_1': impulse_low - (move_size * 0.618),
            'target_2': impulse_low - move_size
        }

    return levels
```

### Step 3: Entry Confirmation

```python
def confirm_entry_signal(candle, levels, indicators, direction):
    """
    Confirm entry signal with multiple factors

    Args:
        candle: Current candle data
        levels: Retracement levels
        indicators: Technical indicators
        direction: Trade direction

    Returns:
        dict: Confirmation score and details
    """

    score = 0
    reasons = []

    # Price in entry zone
    if direction == 'bullish':
        if levels['entry_zone'] * 0.995 <= candle['close'] <= levels['optimal_entry'] * 1.005:
            score += 30
            reasons.append("Price in bullish entry zone")
    else:
        if levels['optimal_entry'] * 0.995 <= candle['close'] <= levels['entry_zone'] * 1.005:
            score += 30
            reasons.append("Price in bearish entry zone")

    # Momentum confirmation
    if direction == 'bullish':
        if indicators['rsi'] < 35:
            score += 20
            reasons.append("RSI oversold")
        if indicators['macd']['histogram'] > indicators['macd']['prev_histogram']:
            score += 15
            reasons.append("MACD momentum building")
    else:
        if indicators['rsi'] > 65:
            score += 20
            reasons.append("RSI overbought")
        if indicators['macd']['histogram'] < indicators['macd']['prev_histogram']:
            score += 15
            reasons.append("MACD momentum building")

    # Volume confirmation
    volume_ratio = candle['volume'] / indicators['avg_volume_20']
    if volume_ratio > 1.5:
        score += 20
        reasons.append("Volume spike on entry")
    elif volume_ratio > 1.2:
        score += 10
        reasons.append("Above average volume")

    # Candle pattern
    if direction == 'bullish':
        if candle['close'] > candle['open'] and (candle['close'] - candle['open']) > (candle['high'] - candle['low']) * 0.6:
            score += 15
            reasons.append("Strong bullish candle")
    else:
        if candle['close'] < candle['open'] and (candle['open'] - candle['close']) > (candle['high'] - candle['low']) * 0.6:
            score += 15
            reasons.append("Strong bearish candle")

    return {
        'score': score,
        'confidence': score / 100,
        'reasons': reasons
    }
```

## NSE Market Adaptations

### Indian Market Specifics

#### 1. Circuit Breaker Handling
- **Level 1 (±5%)**: Normal trading, full strategy application
- **Level 2 (±10%)**: Reduced position sizing, wider stops
- **Level 3 (±20%)**: Strategy pause, only closing existing positions

#### 2. F&O Expiry Effects
- **Pre-expiry**: Increased volatility, adjust position sizing
- **Expiry Day**: Avoid new positions, focus on profit-taking
- **Post-expiry**: Normal volatility resume

#### 3. Corporate Action Adjustments
- **Dividend**: Adjust entry levels for dividend amount
- **Bonus/Split**: Recalculate levels based on adjusted prices
- **Rights Issue**: Avoid stocks during rights period

### Data Quality Considerations

#### 1. Volume Accuracy
- **F&O Stocks**: Generally reliable volume data
- **Small Caps**: May have lower volume accuracy
- **Illiquid Stocks**: Avoid or use adjusted thresholds

#### 2. Price Data
- **Tick Size**: 0.05 for most stocks, 0.01 for select stocks
- **Opening Price**: May gap significantly from previous close
- **After Hours**: Ignore pre-open and post-close data

## Risk Management Framework

### Position Sizing

```python
def calculate_position_size(account_balance, risk_pct, stop_loss, entry_price, direction):
    """
    Calculate position size based on risk management

    Args:
        account_balance: Available trading capital
        risk_pct: Risk percentage per trade
        stop_loss: Stop loss price
        entry_price: Entry price
        direction: Trade direction

    Returns:
        int: Number of shares to trade
    """

    # Risk amount
    risk_amount = account_balance * risk_pct

    # Risk per share
    if direction == 'bullish':
        risk_per_share = entry_price - stop_loss
    else:
        risk_per_share = stop_loss - entry_price

    # Position size
    if risk_per_share > 0:
        position_size = risk_amount / risk_per_share
        return int(position_size)
    else:
        return 0
```

### Stop Loss Placement

#### 1. Fixed Percentage
- **Conservative**: 5-7% below entry
- **Moderate**: 8-10% below entry
- **Aggressive**: 10-15% below entry

#### 2. Volatility Adjusted
- **High Volatility**: Wider stops (2x ATR)
- **Low Volatility**: Tighter stops (1x ATR)
- **Trending Market**: Tighter stops
- **Choppy Market**: Wider stops

#### 3. Level-Based
- **Support/Resistance**: Place stop below key support
- **Moving Average**: Use 20/50 MA as dynamic stop
- **Time-Based**: Exit if not profitable within X days

## Performance Optimization

### Parameter Tuning

#### 1. Impulse Detection
- **Volume Threshold**: 1.5x to 3x average (test different levels)
- **Range Threshold**: 1.5x to 3x ATR (optimize for timeframe)
- **Close Location**: 0.6 to 0.8 (balance signal quality vs frequency)

#### 2. Retracement Levels
- **Fibonacci Levels**: 0.382, 0.5, 0.618 (standard levels)
- **Custom Levels**: 0.236, 0.786 (additional testing)
- **Confluence**: Combine with S/R levels

#### 3. Confirmation Factors
- **RSI Levels**: 25-35 (oversold), 65-75 (overbought)
- **Volume Multiplier**: 1.2x to 2x average
- **MACD Settings**: Standard 12,26,9 or optimized

### Market Regime Adaptation

#### 1. Trending Markets
- **Tighten Filters**: Require stronger impulse candles
- **Larger Positions**: Increase position sizing
- **Wider Targets**: Allow for larger moves

#### 2. Sideways Markets
- **Loosen Filters**: Accept weaker setups
- **Smaller Positions**: Reduce risk per trade
- **Tighter Targets**: Quick profit-taking

#### 3. Volatile Markets
- **Wider Stops**: Account for increased volatility
- **Reduced Size**: Lower position sizing
- **Time Limits**: Shorter holding periods

## Common Pitfalls

### 1. Overtrading
- **Solution**: Strict entry criteria, limit daily trades
- **Monitoring**: Track trade frequency and quality

### 2. Revenge Trading
- **Solution**: Fixed risk limits, cooling-off periods
- **Psychology**: Maintain discipline during losing streaks

### 3. False Breakouts
- **Solution**: Multiple confirmation factors
- **Filtering**: Avoid low-quality impulse candles

### 4. Market Timing
- **Solution**: Trade during high-probability sessions
- **Avoidance**: Pre-holiday and low-liquidity periods

## Advanced Concepts

### Multi-Timeframe Analysis
- **Higher TF**: Identify trend direction and key levels
- **Entry TF**: Fine-tune entry timing and confirmation
- **Lower TF**: Monitor trade execution and exits

### Volume Profile Integration
- **Point of Control**: Use as additional confluence
- **Value Area**: Trade within value area for higher probability
- **Volume Clusters**: Identify high-volume rejection levels

### Options Integration
- **Covered Calls**: On bullish IC setups
- **Protective Puts**: On bearish IC setups
- **Credit Spreads**: For defined-risk trades

## Conclusion

The IC Candle strategy provides a systematic approach to trading retracements following strong impulse moves. By combining price action, volume, and momentum analysis, traders can identify high-probability setups with favorable risk-reward ratios.

Success depends on:
- **Consistent Application**: Follow the rules without exception
- **Risk Management**: Never risk more than you can afford to lose
- **Continuous Learning**: Track results and refine approach
- **Market Adaptation**: Adjust for changing market conditions

Remember, no strategy guarantees profits. Always backtest thoroughly and use proper position sizing and risk management.
