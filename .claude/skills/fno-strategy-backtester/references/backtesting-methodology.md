# F&O Strategy Backtesting Methodology

## Overview
This document outlines the rigorous backtesting methodology used for validating F&O strategies in Indian markets. The framework ensures statistical validity, realistic cost modeling, and forward-performance reliability through hypothesis-driven testing and walk-forward validation.

## 1. Hypothesis Definition

### What is Hypothesis-Driven Testing?
Every backtest begins with a clear, testable hypothesis rather than random parameter optimization. A hypothesis defines:
- **What** specific market inefficiency or edge you're testing
- **Why** you believe it should work (theoretical foundation)
- **How** you'll measure success
- **When** the edge should manifest

### Hypothesis Components
**Market Edge Hypothesis:**
```
"We can profit from [specific inefficiency] in [market segment] because [economic rationale],
measured by [metric] over [timeframe], with [risk controls]."
```

**Example Hypotheses:**
- "Weekly options sellers can profit from time decay in NIFTY because implied volatility exceeds realized volatility by 15-20%, measured by Sharpe ratio >1.5 over 2-year periods, with 5% stop-loss on underlying."
- "Momentum-based futures entries in BANKNIFTY outperform during RBI policy uncertainty because institutional positioning creates predictable moves, measured by win rate >60% with profit factor >1.3."

### Hypothesis Validation Criteria
- **Economic Rationale**: Must have logical basis (not curve-fitting)
- **Measurable**: Clear entry/exit rules and success metrics
- **Risk-Defined**: Explicit position sizing and stop-loss rules
- **Time-Bound**: Specific market conditions where it should work

## 2. Data Preparation

### Data Quality Requirements
**Primary Data Sources:**
- NSE historical data via jugaad-data/nsepython
- Intraday data for options (5-minute bars minimum)
- Corporate actions data (splits, dividends, bonuses)
- F&O expiry calendars and lot size changes

### Handling Corporate Actions
**Stock Splits:**
```python
# Adjust historical prices for splits
def adjust_for_splits(price_data, split_ratio, split_date):
    """Adjust prices before split date by split ratio"""
    mask = price_data['date'] < split_date
    price_data.loc[mask, ['open', 'high', 'low', 'close']] /= split_ratio
    return price_data
```

**Dividend Adjustments:**
```python
# Adjust for cash dividends
def adjust_for_dividends(price_data, dividend_amount, ex_date):
    """Adjust prices for dividend impact"""
    mask = price_data['date'] < ex_date
    dividend_yield = dividend_amount / price_data.loc[mask, 'close'].iloc[-1]
    price_data.loc[mask, ['open', 'high', 'low', 'close']] *= (1 - dividend_yield)
    return price_data
```

**Bonus Issues:**
```python
# Adjust for bonus shares (1:1 bonus = split_ratio = 2.0)
def adjust_for_bonus(price_data, bonus_ratio, bonus_date):
    """Bonus shares effectively create a split"""
    return adjust_for_splits(price_data, bonus_ratio, bonus_date)
```

### Survivorship Bias Prevention
**Include Delisted Stocks:**
- Test on stocks that existed throughout the period
- Account for stocks delisted due to poor performance
- Use survivorship-bias-free datasets when available

**Universe Definition:**
- Define investment universe at start of backtest
- Include only stocks that were F&O eligible throughout period
- Account for new listings and delistings

### Data Validation Checks
**Completeness:**
- No missing trading days (except holidays)
- Continuous price series without gaps
- Valid OHLC relationships (High >= max(Open,Close), etc.)

**Accuracy:**
- Cross-reference with multiple data sources
- Validate volume and price relationships
- Check for data anomalies (price spikes, zero volumes)

## 3. Cost Modeling for Indian Markets

### Transaction Cost Components

#### Securities Transaction Tax (STT)
**Options Trading:**
- Selling: 0.0625% of option premium
- Buying: 0.0625% of option premium (effective from April 2023)
- Futures: 0.0125% on futures price

**Example Calculation:**
```python
def calculate_stt(option_price, quantity, is_sell=True):
    """Calculate STT for options trade"""
    stt_rate = 0.000625  # 0.0625%
    stt_amount = option_price * quantity * stt_rate
    return stt_amount
```

#### Stamp Duty
**Inter-state:**
- Delivery: 0.015% (₹150 max)
- Intraday: 0.003% (₹3000 max)
- F&O: 0.003% (₹3000 max)

**Union Territories:**
- All segments: 0.0001% (₹10 max)

#### Brokerage Charges
**Full-Service Brokers:**
- Intraday: 0.03% (₹20 min)
- Delivery: 0.3% (₹20 min)
- F&O: ₹20-50 per lot

**Discount Brokers:**
- ₹0 brokerage (costs built into spread)
- Higher impact costs

#### Exchange Transaction Charges
**NSE F&O:**
- Futures: ₹1.90 per crore
- Options: ₹1.90 per crore (premium)
- Plus GST at 18%

#### GST (18%)
Applied on brokerage + transaction charges + SEBI charges

#### SEBI Turnover Charges
- 0.0002% of turnover

### Realistic Slippage Model
**For Liquid F&O Stocks (NIFTY/BANKNIFTY):**
- Slippage: 0.05% of order value
- Impact cost: 0.02% for large orders
- Minimum tick slippage: 1 tick

**For Mid-Cap Stocks:**
- Slippage: 0.10-0.15% of order value
- Higher spread costs

**Implementation:**
```python
def apply_slippage(order_price, quantity, is_buy=True, liquidity='high'):
    """Apply realistic slippage based on liquidity"""
    slippage_rates = {
        'high': 0.0005,    # 0.05% for NIFTY/BANKNIFTY
        'medium': 0.0010,  # 0.10% for liquid stocks
        'low': 0.0015      # 0.15% for illiquid stocks
    }

    slippage_rate = slippage_rates.get(liquidity, 0.0010)
    slippage_amount = order_price * quantity * slippage_rate

    if is_buy:
        execution_price = order_price + slippage_amount
    else:
        execution_price = order_price - slippage_amount

    return execution_price
```

### Total Cost Calculation
**Complete Cost Model:**
```python
def calculate_total_cost(order_value, quantity, is_fno=True, is_sell=False, broker_type='discount'):
    """Calculate total transaction cost for Indian markets"""

    # STT Calculation
    if is_fno:
        if is_sell:
            stt = order_value * 0.000625  # 0.0625% for selling
        else:
            stt = order_value * 0.000625  # 0.0625% for buying (effective Apr 2023)
    else:
        stt = order_value * 0.001  # 0.1% for equity delivery

    # Stamp Duty (₹3000 max for F&O)
    stamp_duty = min(order_value * 0.00003, 3000)

    # Brokerage
    if broker_type == 'discount':
        brokerage = 0  # ₹0 for discount brokers
    else:
        brokerage = min(order_value * 0.0003, 20)  # 0.03% min ₹20

    # Exchange Transaction Charges
    exchange_charges = (order_value / 10000000) * 1.90  # ₹1.90 per crore

    # SEBI Charges
    sebi_charges = order_value * 0.000002  # 0.0002%

    # GST (18% on brokerage + transaction charges + SEBI)
    gst_base = brokerage + exchange_charges + sebi_charges
    gst = gst_base * 0.18

    # Slippage (0.05% for liquid F&O)
    slippage = order_value * 0.0005

    total_cost = stt + stamp_duty + brokerage + exchange_charges + sebi_charges + gst + slippage

    return {
        'total_cost': total_cost,
        'breakdown': {
            'stt': stt,
            'stamp_duty': stamp_duty,
            'brokerage': brokerage,
            'exchange_charges': exchange_charges,
            'sebi_charges': sebi_charges,
            'gst': gst,
            'slippage': slippage
        }
    }
```

## 4. Walk-Forward Testing

### Why Walk-Forward Testing?
Traditional backtesting suffers from **overfitting** - optimizing parameters on the same data used for testing. Walk-forward testing:
- Uses different data for optimization vs. validation
- Prevents curve-fitting
- Tests strategy on unseen future data
- Provides realistic forward performance estimates

### Walk-Forward Process

#### Step 1: Data Segmentation
**70% In-Sample, 30% Out-of-Sample:**
- **In-sample**: Used for strategy development and parameter optimization
- **Out-of-sample**: Used for validation (never seen during optimization)
- **Buffer period**: 1-2 months between in-sample and out-of-sample

#### Step 2: Rolling Window Optimization
```
Total Period: 5 years (2019-2024)

In-Sample (70%): 2019-01 to 2022-06 (42 months)
Out-of-Sample (30%): 2022-08 to 2024-12 (28 months)
```

#### Step 3: Parameter Optimization
**In-Sample Period:**
- Test multiple parameter combinations
- Find optimal parameters using genetic algorithms or grid search
- Calculate performance metrics

#### Step 4: Out-of-Sample Validation
**Out-of-Sample Period:**
- Apply optimal parameters to unseen data
- Measure actual performance
- Compare to in-sample expectations

### Walk-Forward Implementation
```python
def walk_forward_test(strategy_func, data, in_sample_ratio=0.7, step_size_months=6):
    """Implement walk-forward testing"""

    total_periods = len(data)
    in_sample_size = int(total_periods * in_sample_ratio)

    results = []

    for start_idx in range(0, total_periods - in_sample_size, step_size_months):
        # Define in-sample period
        in_sample_end = start_idx + in_sample_size
        out_sample_end = min(start_idx + in_sample_size + step_size_months, total_periods)

        in_sample_data = data[start_idx:in_sample_end]
        out_sample_data = data[in_sample_end:out_sample_end]

        # Optimize parameters on in-sample data
        optimal_params = optimize_parameters(strategy_func, in_sample_data)

        # Test on out-of-sample data
        out_sample_performance = strategy_func(out_sample_data, optimal_params)

        results.append({
            'in_sample_period': f"{in_sample_data.index[0]} to {in_sample_data.index[-1]}",
            'out_sample_period': f"{out_sample_data.index[0]} to {out_sample_data.index[-1]}",
            'optimal_params': optimal_params,
            'out_sample_return': out_sample_performance['total_return'],
            'out_sample_sharpe': out_sample_performance['sharpe_ratio']
        })

    return results
```

### Walk-Forward Validation Metrics
**Statistical Significance:**
- Out-of-sample performance should be >80% of in-sample performance
- Sharpe ratio degradation <20%
- Win rate consistency across samples

**Robustness Tests:**
- Multiple walk-forward windows
- Different starting points
- Varying window sizes

## 5. Parameter Robustness Testing

### Why Parameter Robustness Matters?
Optimal parameters from backtesting are often **overfitted** to specific market conditions. Robustness testing ensures:
- Strategy works across different parameter values
- Performance doesn't collapse with small parameter changes
- Strategy is adaptable to changing market conditions

### Robustness Testing Methodology

#### ±20% Parameter Variation
**Test Range:** ±20% around optimal parameters
**Example for RSI Strategy:**
- Optimal RSI: 70 (overbought)
- Test Range: 56 to 84 (70 ± 20%)
- Performance acceptable if >80% of optimal within ±10%

#### Monte Carlo Parameter Simulation
```python
def monte_carlo_robustness(strategy_func, data, optimal_params, n_simulations=1000):
    """Test parameter robustness using Monte Carlo simulation"""

    results = []

    for _ in range(n_simulations):
        # Randomly vary parameters within ±20%
        test_params = {}
        for param_name, optimal_value in optimal_params.items():
            variation = np.random.uniform(-0.2, 0.2)  # ±20%
            test_params[param_name] = optimal_value * (1 + variation)

        # Test strategy with varied parameters
        performance = strategy_func(data, test_params)

        results.append({
            'params': test_params,
            'return': performance['total_return'],
            'sharpe': performance['sharpe_ratio'],
            'max_drawdown': performance['max_drawdown']
        })

    # Analyze robustness
    returns = [r['return'] for r in results]
    robustness_score = np.std(returns) / np.mean(returns)  # Lower is better

    return {
        'robustness_score': robustness_score,
        'return_distribution': returns,
        'confidence_interval': (np.percentile(returns, 5), np.percentile(returns, 95))
    }
```

#### Parameter Sensitivity Heat Maps
**Generate heat maps for parameter pairs:**
- RSI vs Stop Loss
- Moving Average Fast vs Slow
- Volatility threshold vs Position Size

### Robustness Criteria
**Acceptable Strategy:**
- Performance degradation <15% within ±10% parameter range
- Sharpe ratio >0.8 across 80% of parameter combinations
- Maximum drawdown <25% in worst-case parameter set

## 6. Minimum Sample Size Requirements

### Statistical Significance Thresholds

#### Trade Count Requirements
**Minimum Trades for Significance:**
- **30+ trades**: Required for basic statistical significance (p < 0.05)
- **50+ trades**: Required for robust conclusions
- **100+ trades**: Required for high-confidence results

#### Time Period Requirements
**Minimum Testing Period:**
- **2+ years**: Required for seasonal effects capture
- **3+ years**: Preferred for business cycle coverage
- **5+ years**: Ideal for comprehensive validation

### Sample Size Calculation
```python
def calculate_minimum_sample_size(confidence_level=0.95, margin_error=0.05, population_proportion=0.5):
    """Calculate minimum sample size for statistical significance"""

    # Using formula: n = (Z² * p * (1-p)) / E²
    # Where Z = Z-score for confidence level, p = estimated proportion, E = margin of error

    z_scores = {0.95: 1.96, 0.99: 2.576}
    z = z_scores.get(confidence_level, 1.96)

    n = (z**2 * population_proportion * (1 - population_proportion)) / (margin_error**2)
    return int(np.ceil(n))
```

### Sample Size Validation
**For Strategy Testing:**
- **Win Rate Testing**: 30+ trades minimum
- **Sharpe Ratio**: 50+ trades for reliable estimate
- **Maximum Drawdown**: 100+ trades for stable estimate

**Example Validation:**
```python
def validate_sample_size(trade_count, strategy_metrics):
    """Validate if sample size is sufficient for strategy metrics"""

    validations = {
        'win_rate': trade_count >= 30,
        'sharpe_ratio': trade_count >= 50,
        'max_drawdown': trade_count >= 100,
        'profit_factor': trade_count >= 30,
        'annualized_return': trade_count >= 50
    }

    insufficient = [metric for metric, sufficient in validations.items() if not sufficient]

    if insufficient:
        return {
            'sufficient': False,
            'insufficient_metrics': insufficient,
            'minimum_required': f"{max([30 if m in ['win_rate', 'profit_factor'] else 50 if m in ['sharpe_ratio', 'annualized_return'] else 100 for m in insufficient])} trades"
        }
    else:
        return {'sufficient': True}
```

## 7. Complete Backtesting Workflow

### Phase 1: Hypothesis & Data Preparation
1. Define clear, testable hypothesis
2. Prepare survivorship-bias-free data
3. Handle corporate actions properly
4. Validate data quality and completeness

### Phase 2: Cost Modeling & Initial Testing
1. Implement complete cost model (STT, brokerage, slippage)
2. Run initial backtest with costs
3. Calculate baseline performance metrics
4. Identify obvious flaws or overfitting

### Phase 3: Walk-Forward Validation
1. Split data into in-sample (70%) and out-of-sample (30%)
2. Optimize parameters on in-sample data
3. Validate on out-of-sample data
4. Assess statistical significance

### Phase 4: Robustness Testing
1. Test ±20% parameter variations
2. Run Monte Carlo simulations
3. Generate sensitivity heat maps
4. Validate across different market conditions

### Phase 5: Final Validation & Reporting
1. Confirm minimum sample size requirements
2. Generate comprehensive performance report
3. Compare against benchmarks
4. Provide live trading recommendations

## 8. Common Pitfalls & Solutions

### Overfitting Prevention
**Symptom:** Excellent in-sample performance, poor out-of-sample
**Solution:** Always use walk-forward testing, limit parameter count

### Look-Ahead Bias
**Symptom:** Using future information in backtest
**Solution:** Ensure all signals are based on historical data only

### Data-Snooping Bias
**Symptom:** Testing hundreds of strategies, picking best performer
**Solution:** Pre-define hypothesis, limit strategy variations

### Transaction Cost Underestimation
**Symptom:** Viable strategy becomes unprofitable with real costs
**Solution:** Include all costs from day one, use conservative slippage

### Sample Size Issues
**Symptom:** Small sample leads to unreliable conclusions
**Solution:** Require minimum 30+ trades, prefer 100+ trades

This methodology ensures that only robust, realistic, and forward-testable strategies pass validation for live trading in Indian F&O markets.
