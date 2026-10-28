# Nifty Options Hedge Methodology - 3-DTE Put Spread Strategy

## Overview

The Nifty Options Hedge methodology provides a systematic framework for protecting equity portfolios using short-dated put spreads. This approach leverages the unique characteristics of the Indian derivatives market to provide cost-effective downside protection with defined risk parameters.

## Core Principles

### 1. Risk-First Approach
- **Portfolio Protection**: Primary goal is capital preservation
- **Defined Risk**: All hedges have maximum loss potential
- **Cost Efficiency**: Minimize hedging costs through optimal structure
- **Dynamic Adjustment**: Adapt to changing market conditions

### 2. Options Market Mechanics
- **Nifty Options**: European-style, cash-settled
- **Contract Specification**: 50 INR per point, weekly/monthly expiries
- **Margin Requirements**: SPAN-based margin calculations
- **Liquidity**: Highest in near-the-money strikes

### 3. Time Decay Advantage
- **3-DTE Focus**: Maximum theta decay in final days
- **Premium Erosion**: Rapid loss of extrinsic value
- **Probability Advantage**: Time works in favor of spread sellers
- **Risk Management**: Quick adjustment capability

## Hedge Construction Algorithm

### Step 1: Risk Assessment

```python
def assess_portfolio_risk(portfolio_positions, market_data):
    """
    Evaluate portfolio risk metrics to determine hedging needs

    Args:
        portfolio_positions: Current portfolio holdings
        market_data: Current market conditions

    Returns:
        dict: Risk assessment results
    """

    # Calculate portfolio metrics
    portfolio_value = sum(pos['value'] for pos in portfolio_positions)
    portfolio_beta = calculate_portfolio_beta(portfolio_positions, market_data)

    # Risk metrics
    daily_volatility = market_data['nifty_volatility_20d']
    vix_level = market_data['india_vix']

    # Heat calculation
    recent_decline = calculate_recent_decline(portfolio_value, market_data)
    portfolio_heat = recent_decline / portfolio_value

    # Hedge triggers
    should_hedge = (
        portfolio_heat > 0.15 or  # 15% decline
        vix_level > 25 or         # High volatility
        portfolio_beta > 1.2      # High beta exposure
    )

    hedge_amount = calculate_hedge_amount(portfolio_value, portfolio_heat, vix_level)

    return {
        'should_hedge': should_hedge,
        'hedge_amount': hedge_amount,
        'portfolio_heat': portfolio_heat,
        'volatility': daily_volatility,
        'vix': vix_level,
        'beta': portfolio_beta
    }
```

### Step 2: Spread Construction

```python
def construct_put_spread(hedge_amount, market_data, risk_params):
    """
    Build optimal 3-DTE put spread for hedging

    Args:
        hedge_amount: Amount to hedge in rupees
        market_data: Current market data and options chain
        risk_params: Risk management parameters

    Returns:
        dict: Spread construction details
    """

    spot_price = market_data['nifty_spot']
    options_chain = market_data['options_chain']

    # Select expiration (next weekly expiry, 3-5 DTE)
    expiry_date = select_optimal_expiry(market_data, min_dte=3, max_dte=5)

    # Strike selection
    put_strikes = [strike for strike in options_chain.keys()
                   if strike < spot_price and options_chain[strike]['type'] == 'PE']

    # Find optimal strikes
    optimal_strikes = find_optimal_strikes(
        put_strikes, spot_price, options_chain,
        target_distance_pct=0.08,  # 8% below spot
        spread_width=250  # 250 points wide
    )

    if not optimal_strikes:
        return None

    short_strike = optimal_strikes['short']
    long_strike = optimal_strikes['long']

    # Calculate pricing
    short_premium = options_chain[short_strike]['bid']
    long_premium = options_chain[long_strike]['ask']
    net_premium = short_premium - long_premium

    # Calculate position size
    max_loss = (long_strike - short_strike) * 50  # Max loss per spread
    position_size = min(
        int(hedge_amount * risk_params['max_hedge_pct'] / max_loss),
        calculate_max_position_size(net_premium, max_loss, risk_params)
    )

    # Greeks calculation
    greeks = calculate_spread_greeks(short_strike, long_strike, options_chain)

    return {
        'action': 'SELL',
        'short_strike': short_strike,
        'long_strike': long_strike,
        'expiry': expiry_date,
        'quantity': position_size,
        'net_premium': net_premium,
        'max_loss': max_loss,
        'greeks': greeks,
        'premium_to_risk_ratio': net_premium / max_loss
    }
```

### Step 3: Position Management

```python
def manage_hedge_position(spread_position, market_data, time_to_expiry):
    """
    Monitor and manage existing hedge positions

    Args:
        spread_position: Current spread details
        market_data: Updated market data
        time_to_expiry: Days remaining to expiry

    Returns:
        dict: Management recommendations
    """

    current_value = calculate_spread_value(spread_position, market_data)
    pnl_pct = (current_value - spread_position['entry_premium']) / spread_position['entry_premium']

    # Exit conditions
    should_close = False
    close_reason = None

    # Profit taking
    if pnl_pct >= 0.5:  # 50% profit
        should_close = True
        close_reason = "Profit Target"

    # Stop loss
    elif pnl_pct <= -1.0:  # 100% loss
        should_close = True
        close_reason = "Stop Loss"

    # Time-based exit
    elif time_to_expiry <= 1:
        if pnl_pct > 0.2:  # Small profit, let it run to expiry
            should_close = False
        else:
            should_close = True
            close_reason = "Time Exit"

    # Adjustment conditions
    should_adjust = False
    adjustment = None

    # Roll up if spot drops significantly
    spot_move_pct = (market_data['nifty_spot'] - spread_position['entry_spot']) / spread_position['entry_spot']

    if spot_move_pct <= -0.05 and time_to_expiry > 2:  # 5% drop, >2 DTE
        should_adjust = True
        adjustment = {
            'action': 'ROLL_UP',
            'new_short_strike': spread_position['short_strike'] * 0.95,
            'reason': 'Spot moved down 5%'
        }

    return {
        'should_close': should_close,
        'close_reason': close_reason,
        'should_adjust': should_adjust,
        'adjustment': adjustment,
        'current_pnl_pct': pnl_pct,
        'current_value': current_value
    }
```

## NSE Market Adaptations

### Indian Derivatives Specifics

#### 1. Weekly Expiries
- **3-DTE Focus**: Use Thursday expiries for maximum decay
- **Liquidity**: Higher OI in weekly vs monthly options
- **Premium Levels**: Generally lower than US markets
- **Volatility**: Higher vol due to local factors

#### 2. Margin Calculations
- **SPAN Margin**: NSE's Standard Portfolio Analysis of Risk
- **Premium Margin**: Additional margin for net premium
- **Exposure Margin**: Based on underlying volatility
- **Extreme Loss Margin**: For high-risk scenarios

### Data Quality Considerations

#### 1. Options Data
- **Bid-Ask Spreads**: Can be wide for far OTM options
- **Open Interest**: Critical for liquidity assessment
- **Implied Volatility**: May differ from realized vol
- **Real-time Updates**: Essential for intraday management

#### 2. Index Data
- **Nifty Calculation**: Based on 50 stocks, real-time updates
- **Corporate Actions**: Handle stock adjustments in index
- **Halt/Resumption**: Circuit breaker effects on options

## Risk Management Framework

### Position Sizing

```python
def calculate_hedge_amount(portfolio_value, portfolio_heat, vix_level):
    """
    Determine optimal hedge amount based on risk factors

    Args:
        portfolio_value: Current portfolio value
        portfolio_heat: Recent portfolio decline percentage
        vix_level: Current VIX level

    Returns:
        float: Amount to hedge in rupees
    """

    # Base hedge percentage
    base_hedge_pct = 0.2  # 20% of portfolio

    # Heat adjustment
    if portfolio_heat > 0.2:  # 20% decline
        heat_multiplier = 1.5
    elif portfolio_heat > 0.15:  # 15% decline
        heat_multiplier = 1.3
    elif portfolio_heat > 0.1:  # 10% decline
        heat_multiplier = 1.1
    else:
        heat_multiplier = 1.0

    # Volatility adjustment
    if vix_level > 30:
        vol_multiplier = 1.4
    elif vix_level > 25:
        vol_multiplier = 1.2
    elif vix_level > 20:
        vol_multiplier = 1.0
    else:
        vol_multiplier = 0.8

    # Calculate final amount
    hedge_pct = base_hedge_pct * heat_multiplier * vol_multiplier
    hedge_amount = portfolio_value * min(hedge_pct, 0.5)  # Max 50%

    return hedge_amount
```

### Greeks-Based Risk Control

#### 1. Delta Management
- **Target Range**: -0.1 to -0.3 per spread
- **Portfolio Impact**: Minimal directional bias
- **Hedge Effectiveness**: Balanced protection vs. cost

#### 2. Gamma Management
- **Positive Gamma**: Profit from volatility expansion
- **Short Gamma**: Manage convexity risk
- **Monitoring**: Daily gamma exposure tracking

#### 3. Theta Management
- **Positive Theta**: Time decay works in your favor
- **Acceleration**: Faster decay near expiry
- **Optimization**: Maximize theta per rupee at risk

## Performance Optimization

### Parameter Tuning

#### 1. Strike Selection
- **Distance from Spot**: 5-10% OTM for cost efficiency
- **Spread Width**: 200-400 points based on volatility
- **Liquidity Filter**: Minimum OI thresholds
- **Bid-Ask Spread**: Maximum acceptable spread

#### 2. Timing Optimization
- **Entry Timing**: Optimal days before expiry
- **Market Hours**: Best times for execution
- **News Events**: Avoid around high-impact news
- **Expiry Effects**: Pre-weekend positioning

#### 3. Exit Optimization
- **Profit Targets**: 50-80% of premium received
- **Stop Losses**: 100-150% of premium paid
- **Time Exits**: Final day management
- **Rolling Rules**: When and how to adjust

### Market Regime Adaptation

#### 1. High Volatility
- **Wider Spreads**: Increase spread width for safety
- **Higher Premiums**: Better risk-reward ratios
- **Smaller Sizes**: Reduce position sizes
- **Tighter Stops**: More aggressive exit rules

#### 2. Low Volatility
- **Narrower Spreads**: Reduce width for better premiums
- **Lower Premiums**: Poorer risk-reward ratios
- **Larger Sizes**: Increase position sizes
- **Wider Stops**: More patient exit rules

#### 3. Trending Markets
- **Directional Bias**: Adjust strikes for trend
- **Rolling Frequency**: More active position management
- **Size Adjustment**: Reduce hedges in strong uptrends

## Common Pitfalls

### 1. Over-Hedging
- **Solution**: Strict percentage limits, regular review
- **Monitoring**: Track hedge drag on performance
- **Optimization**: Balance protection vs. opportunity cost

### 2. Poor Timing
- **Solution**: Systematic triggers, avoid emotional hedging
- **Backtesting**: Test timing rules thoroughly
- **Discipline**: Stick to predefined entry rules

### 3. Options Complexity
- **Solution**: Thorough education, paper trading
- **Simplification**: Start with basic spreads
- **Professional Help**: Consult options specialists

### 4. Liquidity Issues
- **Solution**: Trade only liquid strikes, monitor OI
- **Execution**: Use limit orders, avoid market orders
- **Position Size**: Adjust for available liquidity

## Advanced Concepts

### Portfolio-Level Hedging
- **Beta-Weighted**: Hedge based on portfolio beta
- **Sector Diversification**: Hedge sector-specific risks
- **Dynamic Allocation**: Adjust hedge ratios over time
- **Cost Averaging**: Scale into hedges gradually

### Options Strategies Integration
- **Collars**: Combine with covered calls for cost reduction
- **Butterflies**: For volatility plays around hedges
- **Calendars**: Time spread for directional bias
- **Ratio Spreads**: For asymmetric risk profiles

### Risk Parity Approach
- **Equal Risk Contribution**: Each position contributes equal risk
- **Volatility Targeting**: Maintain constant portfolio volatility
- **Dynamic Rebalancing**: Regular risk adjustment
- **Tail Risk Hedging**: Extreme event protection

## Conclusion

The Nifty Options Hedge methodology provides a robust framework for protecting equity portfolios using 3-DTE put spreads. By combining systematic risk assessment, optimal spread construction, and disciplined position management, investors can achieve effective downside protection with controlled costs.

Success depends on:
- **Risk Discipline**: Never exceed predefined limits
- **Market Awareness**: Understand current market conditions
- **Continuous Learning**: Track results and refine approach
- **Professional Execution**: Use reliable brokerage and technology

Remember, hedging is about risk management, not profit generation. The goal is capital preservation and peace of mind during turbulent markets.
