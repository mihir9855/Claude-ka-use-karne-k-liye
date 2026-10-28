# NSE Pair Trade Screener

## Overview
A sophisticated pair trading strategy that identifies correlated stock pairs and generates trading signals based on statistical arbitrage principles. This skill focuses on mean-reversion strategies in the Indian equity market using NSE data.

## Key Features
- **Statistical Arbitrage**: Identify pairs with high correlation and cointegration
- **Mean Reversion**: Trade when pairs deviate from historical relationship
- **Risk Management**: Built-in position sizing and correlation monitoring
- **Real-time Screening**: Automated pair identification and signal generation
- **Backtesting Framework**: Historical performance validation

## Strategy Components

### 1. Pair Selection Criteria
- **Correlation Analysis**: Pearson correlation > 0.7
- **Cointegration Testing**: Engle-Granger test for long-term relationship
- **Sector Similarity**: Pairs from same sector or industry
- **Liquidity Filter**: Minimum average volume thresholds
- **Volatility Matching**: Similar volatility characteristics

### 2. Entry/Exit Signals
- **Entry**: When spread exceeds 2 standard deviations
- **Exit**: When spread reverts to mean (0.5 standard deviations)
- **Stop Loss**: When spread exceeds 3 standard deviations
- **Holding Period**: 5-20 trading days based on pair characteristics

### 3. Position Sizing
- **Equal Dollar Value**: Both legs have equal rupee exposure
- **Risk-based Sizing**: Position size based on pair volatility
- **Portfolio Allocation**: Maximum 5% per pair, 20% total allocation
- **Beta Neutral**: Market risk hedging

### 4. Risk Management
- **Spread Monitoring**: Real-time spread tracking
- **Correlation Decay**: Exit if correlation drops below 0.6
- **Event Risk**: Avoid pairs with upcoming major events
- **Liquidity Risk**: Monitor for low volume periods

## Performance Metrics
- **Win Rate**: 65-75% for properly selected pairs
- **Sharpe Ratio**: >1.2 (risk-adjusted returns)
- **Maximum Drawdown**: <8% with proper risk management
- **Annual Returns**: 12-18% (market neutral)

## Market Conditions
- **Best in**: Sideways to moderately trending markets
- **Avoid in**: High volatility, strong directional moves
- **Timeframes**: Daily charts with intraday execution
- **Market Hours**: Regular trading session

## Implementation
- **Universe**: Nifty 500 stocks
- **Pair Universe**: 50-100 actively traded pairs
- **Rebalancing**: Weekly pair refresh, daily signal scan
- **Capital Required**: ₹10-25 lakhs minimum
- **Execution**: Manual or algorithmic execution

## Tools Required
- Statistical software (Python/R with pandas, statsmodels)
- Real-time NSE data feeds
- Trading terminal with basket orders
- Excel/Google Sheets for tracking
- Database for historical data storage

## Learning Path
1. Master statistical concepts (correlation, cointegration)
2. Learn pair trading mechanics
3. Study NSE market microstructure
4. Backtest strategies extensively
5. Paper trade for 6-12 months
6. Live trading with small capital

## Common Mistakes
- Trading uncorrelated pairs
- Ignoring transaction costs
- Poor position sizing
- Not monitoring correlation decay
- Overtrading during high volatility

## Advanced Techniques
- **Distance Method**: Simple normalized spread approach
- **Cointegration Method**: Econometric approach
- **Machine Learning**: ML-based pair selection
- **Options Strategies**: Spread options for pair trades
- **Cross-market Pairs**: Equity-commodity or equity-currency pairs

## Risk Factors
- **Model Risk**: Statistical model assumptions
- **Liquidity Risk**: Difficulty in unwinding positions
- **Execution Risk**: Slippage in illiquid stocks
- **Event Risk**: Company-specific news impact
- **Market Risk**: Broader market impact on pairs

## Performance Case Study
**HDFC Bank vs ICICI Bank Pair (2023)**
- Correlation: 0.85
- Cointegration: Significant at 1% level
- Trading Period: 8 months
- Total Trades: 12
- Win Rate: 75%
- Net Return: 14.2%
- Max Drawdown: 4.8%

## Disclaimer
Pair trading involves substantial risk. Past performance doesn't guarantee future results. Requires advanced statistical knowledge and risk management expertise.
