# Common F&O Backtesting Failures & Post-Mortems

## Overview
Backtesting failures are inevitable, but learning from them is what separates successful traders from those who abandon strategies after first contact with reality. This document analyzes five of the most common and devastating backtesting failures in Indian F&O markets, with detailed post-mortems and solutions.

## 1. Overfitting (Curve-Fitting to Historical Data)

### What Went Wrong
A strategy optimized across 1,000+ parameter combinations shows exceptional performance in backtesting (80% win rate, 3:1 reward:risk ratio), but completely fails in live trading with 30% losses. The "perfect" parameter set was specifically tuned to historical market conditions that are unlikely to repeat.

**Real Example:** A mean-reversion strategy optimized on 2020-2021 data (high volatility, frequent swings) with parameters like RSI(7) oversold at 25, RSI(14) overbought at 78, and ATR(5) stop loss multiplier of 1.3. Worked perfectly in backtest but failed miserably when volatility normalized.

### How to Detect It
- **In-sample vs Out-of-sample performance gap**: Strategy shows 70%+ win rate in optimization period but <50% in OOS testing
- **Parameter sensitivity**: Small changes (±5%) in any parameter cause 20%+ performance degradation
- **Walk-forward failure**: Strategy parameters that worked in 2020 fail in 2021, and 2021 parameters fail in 2022
- **Complexity creep**: Strategy has 8+ parameters that were all "optimized" to perfection

### How to Fix It
- **Simplify relentlessly**: Start with 2-3 parameters maximum. If you need more than 5, your strategy logic is flawed
- **Use walk-forward optimization**: Test parameters on rolling 6-month windows, validate on next 3 months
- **Out-of-sample validation**: Reserve 30-40% of data for OOS testing before live deployment
- **Reality check**: If your backtest Sharpe ratio > 3.0, it's probably curve-fitted
- **Cross-validation**: Test strategy on different asset classes (equity vs commodities) to ensure robustness

## 2. Survivorship Bias (Ignoring Delisted Stocks)

### What Went Wrong
Backtesting on current Nifty 50 components shows 25% annual returns, but live performance is 5% with frequent losses. The backtest universe only included stocks that survived market crashes, bankruptcies, and delistings, ignoring the 20-30% of companies that failed during the test period.

**Real Example:** A momentum strategy backtested on current Nifty 50 from 2010-2024. The strategy bought top 10 performers and shorted bottom 10. In reality, many "bottom 10" stocks were delisted or went bankrupt, while some "top 10" were acquired at premium. The backtest assumed all positions could be held indefinitely.

### How to Detect It
- **Universe drift**: Strategy works on current index components but fails when tested on historical compositions
- **Performance decay**: Returns degrade when including broader universes (Nifty 500 vs Nifty 50)
- **Missing trades**: Backtest shows smooth equity curve; live trading has gaps where stocks disappeared
- **Concentration risk**: Strategy relies heavily on stocks that were later delisted or merged

### How to Fix It
- **Include delisted stocks**: Use historical index compositions and account for delisted securities
- **Test on broader universes**: Validate on Nifty 500 or All F&O stocks, not just current Nifty 50
- **Account for corporate actions**: Handle mergers, acquisitions, delistings, and bankruptcies in backtest
- **Survival bias adjustment**: Weight results by probability of stock survival
- **Dynamic universe**: Test strategy on rolling universe that matches real availability

## 3. Ignoring Slippage (Market Impact Costs)

### What Went Wrong
A scalping strategy shows 15% monthly returns in backtest with 0.1% profit targets, but loses money live due to 0.1-0.3% slippage on each trade. The backtest assumed perfect execution at mid prices, while real orders suffer from bid-ask spreads, market maker intervention, and order book dynamics.

**Real Example:** An options arbitrage strategy that exploited 0.2% mispricings between cash and futures. Backtest showed 85% win rate with 0.15% average profit. Live trading showed 0.25% average slippage, turning profitable trades into losses.

### How to Detect It
- **Micro-profit strategies failing**: Strategies with <0.5% profit targets that work in backtest but fail live
- **Volume dependency**: Performance degrades on lower volume periods or with larger position sizes
- **Execution quality**: Actual fill prices consistently worse than backtest entry/exit prices
- **Market maker patterns**: Strategy works during high liquidity but fails during market maker inventory adjustments

### How to Fix It
- **Add realistic slippage**: Use 0.1-0.3% for liquid stocks, 0.5-1.0% for illiquid options
- **Bid-ask spread modeling**: Buy at ask, sell at bid in backtest
- **Volume-based slippage**: Higher slippage for larger orders as % of average volume
- **Time-of-day adjustments**: Higher slippage during opening/closing auctions
- **Market impact modeling**: Use square-root formula: Slippage = k × (Order Size / Volume)^0.5

## 4. Look-Ahead Bias (Using Future Information)

### What Went Wrong
A strategy using end-of-day close prices for intraday signals shows 70% accuracy, but fails live because the signals require information not available at entry time. The backtest inadvertently used future price action to generate today's signals.

**Real Example:** An intraday breakout strategy that entered when price broke above previous day's high and volume was 150% of average. Backtest used the day's closing price to confirm the breakout, but in reality, you need to enter at the breakout without knowing if it will hold until close.

### How to Detect It
- **Unrealistic timing**: Signals that require end-of-day confirmation for intraday entries
- **Perfect hindsight**: Strategy knows tomorrow's open when making today's decisions
- **Data leakage**: Using adjusted prices before corporate actions occur
- **Information asymmetry**: Strategy assumes real-time data availability that wasn't available historically

### How to Fix It
- **Strict chronological order**: Process data day-by-day, decision by decision
- **Information delay simulation**: Add realistic delays for data availability (earnings, news)
- **Intraday simulation**: Use tick-by-tick or minute-level data with proper sequencing
- **Paper trading validation**: Test strategy in real-time paper trading before live deployment
- **Data timestamp verification**: Ensure all data used in decisions has correct timestamps

## 5. Insufficient Sample Size (Statistical Insignificance)

### What Went Wrong
A strategy shows 80% win rate on 20 trades, leading to overconfidence and live deployment. Statistically, this result is meaningless - with such small sample size, random chance could produce similar results. The strategy fails live not because it's wrong, but because the backtest results were statistically insignificant.

**Real Example:** An options selling strategy tested on 15 expiry cycles showed 73% win rate with 2.1 profit factor. Trader went live with full capital, but over next 50 trades showed 52% win rate with 0.9 profit factor. The initial results were just lucky variance.

### How to Detect It
- **Small trade count**: <50 total trades in backtest period
- **Overconfidence in ratios**: 90%+ win rates on <30 samples
- **Parameter stability**: Best parameters change dramatically with small data changes
- **Confidence interval ignorance**: Not calculating statistical significance of results

### How to Fix It
- **Minimum sample size**: Require at least 100 trades for any strategy evaluation
- **Statistical testing**: Use t-tests, p-values to validate if results are significant (p < 0.05)
- **Confidence intervals**: Calculate 95% CI for win rate, profit factor, Sharpe ratio
- **Out-of-sample validation**: Never deploy based on in-sample results alone
- **Walk-forward analysis**: Use rolling windows to ensure consistency across time periods
- **Multiple testing correction**: Adjust significance levels when testing many parameter combinations

## Implementation: Building Robust Backtesting

### Statistical Validation Framework
```python
import numpy as np
from scipy import stats

def validate_backtest_results(trades_df, confidence_level=0.95):
    """Validate backtest results for statistical significance"""

    n_trades = len(trades_df)

    # Minimum sample size check
    if n_trades < 100:
        return {"status": "INSUFFICIENT_SAMPLE", "min_required": 100}

    # Calculate metrics
    win_rate = trades_df['pnl'].gt(0).mean()
    profit_factor = trades_df[trades_df['pnl'] > 0]['pnl'].sum() / abs(trades_df[trades_df['pnl'] < 0]['pnl'].sum())

    # Statistical significance tests
    # Win rate significance (binomial test)
    win_rate_p_value = stats.binomtest(int(win_rate * n_trades), n_trades, 0.5).pvalue

    # Sharpe ratio confidence interval
    daily_returns = trades_df.groupby('date')['pnl'].sum()
    sharpe = daily_returns.mean() / daily_returns.std() * np.sqrt(252)
    sharpe_se = np.sqrt((1 + 0.5 * sharpe**2) / len(daily_returns))
    sharpe_ci = stats.norm.interval(confidence_level, sharpe, sharpe_se)

    return {
        "status": "VALID" if win_rate_p_value < (1-confidence_level) else "NOT_SIGNIFICANT",
        "win_rate": win_rate,
        "win_rate_p_value": win_rate_p_value,
        "profit_factor": profit_factor,
        "sharpe_ratio": sharpe,
        "sharpe_ci": sharpe_ci,
        "sample_size": n_trades
    }
```

### Reality Check Protocol
Before deploying any strategy:

1. **Sample Size**: Minimum 100 trades, preferably 500+
2. **Out-of-Sample**: 30% data reserved for OOS validation
3. **Walk-Forward**: Rolling 6-month optimization, 3-month validation
4. **Cost Inclusion**: Full transaction costs + 0.2% slippage
5. **Survivorship**: Test on historical universe including delisted stocks
6. **Live Paper Trading**: 2-4 weeks of paper trading before live capital
7. **Position Sizing**: Start with 1% risk per trade, scale up gradually

### Common Recovery Patterns
- **Failed due to costs**: Reduce frequency, increase profit targets
- **Failed due to slippage**: Add volume filters, reduce position sizes
- **Failed due to overfitting**: Simplify strategy, reduce parameters
- **Failed due to bias**: Implement proper chronological testing
- **Failed due to sample size**: Continue testing, don't deploy prematurely

Remember: A strategy that survives rigorous backtesting scrutiny is far more likely to succeed live than one that shows perfect paper performance. The goal isn't perfection in backtest, but robustness across all market conditions and implementation realities.
