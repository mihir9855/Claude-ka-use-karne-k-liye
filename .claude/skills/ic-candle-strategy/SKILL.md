# IC Candle Strategy - Impulse Candle Retracement

## Overview

The IC Candle Strategy identifies high-probability retracement opportunities following impulse candle breakouts. This strategy focuses on the price action patterns that occur after strong directional moves, providing optimal entry points for continuation trades.

## Strategy Details

### Core Concept
- **Impulse Candle**: A candle that breaks key levels with strong momentum
- **Retracement**: Price pulls back to a support/resistance level after the impulse
- **Entry**: Enter on retracement completion with momentum confirmation

### Key Components

#### 1. Impulse Detection
- **Volume**: 2x average volume minimum
- **Range**: 2x average true range minimum
- **Close Location**: Closes near high/low of the candle
- **Breakout**: Breaks recent swing high/low

#### 2. Retracement Levels
- **Fibonacci Levels**: 38.2%, 50%, 61.8% retracements
- **Support/Resistance**: Key S/R levels from impulse candle
- **Volume Profile**: High-volume nodes for confluence

#### 3. Entry Confirmation
- **Momentum Divergence**: RSI/MACD divergence on retracement
- **Volume Spike**: Increased volume on retracement completion
- **Candle Pattern**: Bullish/bearish engulfing or strong reversal candles

#### 4. Risk Management
- **Stop Loss**: Below/above impulse candle low/high
- **Target**: Next resistance/support level or 2:1 reward ratio
- **Position Size**: Based on volatility and account risk

## NSE Market Adaptation

### Indian Market Considerations
- **Trading Hours**: 9:15 AM - 3:30 PM IST
- **Circuit Breakers**: ±5%, ±10%, ±20% limits
- **F&O Stocks**: Focus on liquid F&O universe
- **Corporate Actions**: Handle dividends, bonuses, splits

### Data Requirements
- **Timeframes**: 5-minute, 15-minute, 1-hour charts
- **Lookback**: 3-6 months of historical data
- **Real-time**: Live price feeds for entry timing

## Implementation

### Scripts Overview
- `ic_detector.py`: Core impulse candle and retracement detection
- `ic_scanner.py`: NSE stock scanner for IC setups
- `ic_backtester.py`: Strategy backtesting and optimization

### Key Features
- **Real-time Scanning**: Continuous monitoring during market hours
- **Multi-timeframe Analysis**: Confirmation across timeframes
- **Risk-adjusted Position Sizing**: Volatility-based sizing
- **Performance Analytics**: Detailed trade analysis and reporting

## Performance Expectations

### Target Metrics
- **Win Rate**: 65-75% on proper setups
- **Risk-Reward**: 1:2 minimum ratio
- **Max Drawdown**: <15% during testing
- **Monthly Returns**: 5-15% depending on market conditions

### Market Conditions
- **Best Performance**: Trending markets with clear impulse moves
- **Poor Performance**: Choppy, sideways markets
- **Risk**: High volatility periods may increase false signals

## Risk Management

### Position Sizing
- **Account Risk**: 1-2% per trade
- **Portfolio Heat**: Maximum 10% total exposure
- **Volatility Adjustment**: Reduce size in high volatility

### Exit Strategy
- **Profit Taking**: Scale out at target levels
- **Stop Loss**: Strict adherence to predefined levels
- **Time Exit**: Maximum holding period (3-5 days)

## Integration with NotSoSEBI Framework

### Shared Components
- **NSEDataFetcher**: Historical and real-time data
- **IndianMarketUtils**: Holiday and session handling
- **BrokerFactory**: Order execution and position management

### Data Flow
1. **Detection**: Identify impulse candles and retracements
2. **Validation**: Confirm setup with multiple indicators
3. **Entry**: Execute trade with proper risk management
4. **Monitoring**: Track position and manage exits
5. **Analysis**: Post-trade analysis and performance tracking

## Configuration

### Default Parameters
```python
# Impulse Detection
MIN_VOLUME_RATIO = 2.0
MIN_RANGE_RATIO = 2.0
CLOSE_THRESHOLD = 0.7  # Close location within candle

# Retracement Levels
FIB_LEVELS = [0.382, 0.5, 0.618]
MIN_RETRACE_PCT = 0.2
MAX_RETRACE_PCT = 0.8

# Entry Confirmation
RSI_OVERSOLD = 30
RSI_OVERBOUGHT = 70
VOLUME_SPIKE_RATIO = 1.5

# Risk Management
STOP_LOSS_PCT = 0.05
TARGET_RR_RATIO = 2.0
MAX_HOLDING_DAYS = 5
```

### Customization
- **Symbol Universe**: Configurable stock lists
- **Timeframes**: Adjustable for different trading styles
- **Indicators**: Pluggable confirmation indicators
- **Risk Parameters**: Adjustable based on risk tolerance

## Usage Examples

### Command Line Scanning
```bash
# Scan for IC setups
python skills/ic-candle-strategy/scripts/ic_scanner.py --symbols RELIANCE,TCS,HDFCBANK

# Backtest strategy
python skills/ic-candle-strategy/scripts/ic_backtester.py --start-date 2023-01-01 --end-date 2023-12-31
```

### Integration with Trading System
```python
from skills.ic_candle_strategy.scripts.ic_detector import ICDetector

detector = ICDetector()
setups = detector.scan_universe(['RELIANCE', 'TCS', 'INFY'])

for setup in setups:
    if setup.confidence > 0.8:
        # Execute trade
        execute_ic_trade(setup)
```

## References

### Key Concepts
- **Impulse Candle**: Strong momentum candle breaking key levels
- **Retracement**: Price pullback after impulse move
- **Confluence**: Multiple factors aligning for high-probability setup
- **Risk-Reward**: Favorable ratio for trade management

### Further Reading
- Price Action Trading strategies
- Volume Profile analysis
- Fibonacci retracement applications
- Risk management in volatile markets

## Disclaimer

This strategy is for educational and research purposes. Past performance does not guarantee future results. Always test thoroughly and use proper risk management. Consult with financial advisors before trading.
