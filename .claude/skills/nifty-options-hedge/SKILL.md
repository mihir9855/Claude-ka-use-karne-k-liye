# Nifty Options Hedge - 3-DTE Put Spread Strategy

## Overview

The Nifty Options Hedge strategy implements a systematic approach to hedging equity positions using 3-day-to-expiry (3-DTE) put spreads. This strategy provides cost-effective downside protection while maintaining upside potential, optimized for the Indian derivatives market.

## Strategy Details

### Core Concept
- **3-DTE Options**: Use short-dated options for rapid time decay
- **Put Spreads**: Bull put spreads for defined-risk hedging
- **Dynamic Hedging**: Adjust hedges based on market conditions and position risk

### Key Components

#### 1. Hedge Triggers
- **Portfolio Heat**: Activate when portfolio exceeds risk threshold
- **Market Volatility**: Higher VIX levels trigger more aggressive hedging
- **Position Size**: Hedge larger positions more aggressively
- **Time to Expiry**: Reduce exposure as quarterly expiries approach

#### 2. Option Selection
- **Strike Selection**: Put strikes 5-10% below current Nifty level
- **Spread Width**: 200-300 points for optimal risk-reward
- **Expiration**: Next weekly expiry (3-DTE)
- **Liquidity**: Focus on high open interest strikes

#### 3. Position Sizing
- **Hedge Ratio**: 20-50% of portfolio value hedged
- **Spread Size**: Based on available capital and risk tolerance
- **Premium Management**: Target 0.3-0.5x risk as premium received

#### 4. Exit Strategy
- **Profit Taking**: Close spreads for 50-70% profit
- **Time Decay**: Let spreads expire worthless
- **Stop Loss**: Close if spread loses 100% of premium received
- **Rolling**: Adjust strikes if market moves adversely

## NSE Derivatives Market Adaptation

### Indian Market Considerations
- **Trading Hours**: 9:15 AM - 3:30 PM IST (options trading)
- **Contract Size**: Nifty options = ₹50 per point
- **Margin Requirements**: SPAN margin calculations
- **Settlement**: T+1 cash settlement, T+1 option settlement

### Data Requirements
- **Real-time Data**: Live Nifty index and options prices
- **Historical Data**: 1+ years of options data for analysis
- **Greeks**: Delta, gamma, theta, vega calculations
- **Open Interest**: Strike-wise OI for liquidity assessment

## Implementation

### Scripts Overview
- `nifty_hedge_detector.py`: Core hedging logic and spread construction
- `nifty_hedge_scanner.py`: Portfolio risk assessment and hedge recommendations
- `nifty_hedge_backtester.py`: Historical backtesting of hedging strategies

### Key Features
- **Real-time Monitoring**: Continuous portfolio risk assessment
- **Automated Execution**: API integration for order placement
- **Risk Analytics**: Greeks-based risk management
- **Performance Tracking**: Hedge effectiveness and P&L analysis

## Performance Expectations

### Target Metrics
- **Hedge Effectiveness**: 70-90% downside protection
- **Cost Efficiency**: 1-3% annual cost as percentage of portfolio
- **Win Rate**: 65-75% of spreads expire profitably
- **Risk-Adjusted Returns**: Improved Sharpe ratio vs. unhedged

### Market Conditions
- **Best Performance**: Moderate volatility with defined downtrends
- **Poor Performance**: Extreme volatility or strong uptrends
- **Risk**: Gap risk and volatility spikes can affect spread performance

## Risk Management

### Position Limits
- **Portfolio Exposure**: Maximum 50% hedged at any time
- **Spread Risk**: Maximum 2% portfolio loss per spread
- **Concentration**: No more than 20% in single expiry
- **Liquidity**: Only trade strikes with adequate OI

### Greeks Management
- **Delta**: Target -0.1 to -0.3 per spread
- **Gamma**: Monitor for position convexity
- **Theta**: Positive theta for time decay benefit
- **Vega**: Limited vega exposure in high volatility

## Integration with NotSoSEBI Framework

### Shared Components
- **NSEDataFetcher**: Options data and Greeks calculation
- **IndianMarketUtils**: Holiday and expiry date handling
- **BrokerFactory**: Options order execution and position management

### Data Flow
1. **Risk Assessment**: Evaluate portfolio exposure and market conditions
2. **Hedge Construction**: Build optimal put spread based on parameters
3. **Order Execution**: Place spread orders with proper risk checks
4. **Position Monitoring**: Track spread performance and Greeks
5. **Exit Management**: Close or adjust positions based on rules

## Configuration

### Default Parameters
```python
# Hedge Triggers
PORTFOLIO_HEAT_THRESHOLD = 0.15  # 15% portfolio decline
VIX_SPIKE_THRESHOLD = 25  # VIX above 25
POSITION_SIZE_THRESHOLD = 0.05  # 5% of portfolio

# Spread Construction
SPREAD_WIDTH_POINTS = 250  # Nifty points
STRIKE_DISTANCE_PCT = 0.08  # 8% below spot
MIN_DTE = 3  # Days to expiry
MAX_DTE = 5

# Risk Management
MAX_HEDGE_PCT = 0.4  # 40% of portfolio
PREMIUM_TO_RISK_RATIO = 0.4  # 0.4x premium vs risk
STOP_LOSS_PCT = 1.0  # 100% premium loss
```

### Customization
- **Risk Tolerance**: Adjust heat thresholds and hedge ratios
- **Market Conditions**: Modify spread widths and strike distances
- **Time Horizon**: Change DTE preferences
- **Cost Control**: Adjust premium-to-risk ratios

## Usage Examples

### Command Line Hedging
```bash
# Assess portfolio risk
python skills/nifty-options-hedge/scripts/nifty_hedge_scanner.py --portfolio portfolio.json

# Execute hedge
python skills/nifty-options-hedge/scripts/nifty_hedge_detector.py --action hedge --amount 50000

# Backtest strategy
python skills/nifty-options-hedge/scripts/nifty_hedge_backtester.py --start-date 2023-01-01
```

### Integration with Trading System
```python
from skills.nifty_options_hedge.scripts.nifty_hedge_detector import NiftyHedgeDetector

detector = NiftyHedgeDetector()
hedge_recommendation = detector.assess_hedge_need(portfolio_positions, market_data)

if hedge_recommendation['should_hedge']:
    spread = detector.construct_put_spread(hedge_recommendation['amount'])
    execute_options_spread(spread)
```

## References

### Key Concepts
- **Put Spread**: Bull put spread for defined-risk hedging
- **Time Decay**: Theta benefits of short-dated options
- **Delta Hedging**: Managing directional risk exposure
- **Volatility Management**: Adjusting for changing market conditions

### Further Reading
- Options Greeks and risk management
- Volatility-based hedging strategies
- NSE derivatives market mechanics
- Portfolio risk management techniques

## Disclaimer

This hedging strategy is for risk management purposes. Options trading involves substantial risk and is not suitable for all investors. Past performance does not guarantee future results. Always test thoroughly and use proper position sizing and risk management. Consult with financial advisors before implementing hedging strategies.
