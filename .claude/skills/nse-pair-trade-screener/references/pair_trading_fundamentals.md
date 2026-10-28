# Pair Trading Fundamentals

## What is Pair Trading?
Pair trading is a market-neutral strategy that involves buying one stock and selling another correlated stock when their price relationship diverges from historical norms. The strategy profits from the convergence of the price spread back to its mean.

## Core Principles

### 1. Correlation vs Cointegration
- **Correlation**: Measures linear relationship between two stocks
- **Cointegration**: Statistical property where stocks move together long-term
- **Key Difference**: Cointegrated pairs have mean-reverting spreads

### 2. The Spread
```
Spread = Price_A - (Beta × Price_B)
```
Where Beta is the hedge ratio from regression analysis.

### 3. Normalization Methods
- **Simple Spread**: Price_A - Price_B
- **Beta-Neutral Spread**: Price_A - (Beta × Price_B)
- **Z-Score**: (Spread - Mean) / Standard Deviation

### 4. Entry Signals
- **Z-Score > 2**: Short the expensive stock, long the cheap stock
- **Z-Score < -2**: Long the expensive stock, short the cheap stock
- **Entry Threshold**: Typically 1.5 to 2.5 standard deviations

### 5. Exit Signals
- **Profit Target**: Z-Score returns to 0 (mean reversion)
- **Stop Loss**: Z-Score exceeds 3-4 standard deviations
- **Time Exit**: Maximum holding period (20-30 days)

## Statistical Tests

### Cointegration Test (Engle-Granger)
1. Regress one stock on another: Y = α + βX + ε
2. Test if residuals (ε) are stationary using ADF test
3. If stationary, pair is cointegrated

### Correlation Analysis
- Rolling correlation (63-day window)
- Minimum correlation threshold: 0.6-0.7
- Monitor correlation stability over time

## Risk Management
- **Position Sizing**: Equal dollar value in both legs
- **Beta Hedging**: Adjust position sizes for market neutrality
- **Stop Losses**: Maximum loss limits per pair
- **Diversification**: Multiple uncorrelated pairs

## Performance Factors
- **Half-Life**: Speed of mean reversion (shorter = better)
- **Sharpe Ratio**: Risk-adjusted returns
- **Win Rate**: Percentage of profitable trades
- **Maximum Drawdown**: Peak-to-trough decline

## Common Pair Types
1. **Sector Pairs**: Stocks in same industry
2. **Substitute Pairs**: Companies offering similar products
3. **Competitor Pairs**: Direct business competitors
4. **Index Pairs**: Stocks with similar market beta

## Advantages
- Market neutral (directional risk reduced)
- Lower volatility than single stock positions
- Statistical edge through mean reversion
- Works in various market conditions

## Challenges
- Requires statistical expertise
- Transaction costs can erode profits
- Pairs can decouple (correlation breakdown)
- Liquidity issues in one leg

## Implementation Steps
1. Select universe of stocks
2. Calculate correlation matrix
3. Test for cointegration
4. Calculate spread and z-scores
5. Generate trading signals
6. Execute and monitor positions

## Tools and Libraries
- Python: pandas, numpy, statsmodels, scipy
- R: quantmod, tseries, urca
- Excel: Statistical functions and VBA
- Specialized software: QuantConnect, Quantopian

## Key Success Factors
- Rigorous statistical testing
- Consistent execution discipline
- Proper risk management
- Regular strategy review and adaptation
