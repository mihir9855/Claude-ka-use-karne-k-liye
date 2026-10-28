# Nifty Options Hedge Scoring - Setup Quality Assessment

## Overview

The Nifty Options Hedge scoring system evaluates the quality of hedging opportunities using 3-DTE put spreads. This systematic approach helps determine optimal hedge timing, sizing, and structure based on multiple market and portfolio factors.

## Scoring Framework

### Total Score Range: 0-100 points

#### Grade Classification
- **A+ (90-100)**: Exceptional hedge opportunity, maximum size
- **A (80-89)**: High-quality hedge setup, large size
- **A- (70-79)**: Good hedge opportunity, normal size
- **B+ (60-69)**: Average setup, reduced size
- **B (50-59)**: Below average, small size
- **C (0-49)**: Poor setup, avoid or very small size

## Scoring Components

### 1. Portfolio Risk Factors (0-30 points)

#### Heat Level (0-12)
- **12**: Portfolio down 20%+ in past month (maximum heat)
- **10**: Portfolio down 15-20% in past month
- **8**: Portfolio down 10-15% in past month
- **6**: Portfolio down 5-10% in past month
- **4**: Portfolio down 2-5% in past month
- **2**: Portfolio down 0-2% in past month
- **0**: Portfolio up in past month

#### Volatility Exposure (0-10)
- **10**: Portfolio beta >1.5 (high volatility exposure)
- **8**: Portfolio beta 1.2-1.5
- **6**: Portfolio beta 1.0-1.2
- **4**: Portfolio beta 0.8-1.0
- **2**: Portfolio beta 0.5-0.8
- **0**: Portfolio beta <0.5 (low volatility)

#### Position Concentration (0-8)
- **8**: Single position >30% of portfolio
- **6**: Single position 20-30% of portfolio
- **4**: Single position 10-20% of portfolio
- **2**: Single position 5-10% of portfolio
- **0**: Well-diversified portfolio (<5% concentration)

### 2. Market Conditions (0-25 points)

#### VIX Level (0-10)
- **10**: VIX >35 (extreme fear, optimal hedging)
- **8**: VIX 30-35
- **6**: VIX 25-30
- **4**: VIX 20-25
- **2**: VIX 15-20
- **0**: VIX <15 (complacency, poor hedging environment)

#### Market Trend (0-8)
- **8**: Strong downtrend (-5%+ in past week)
- **6**: Moderate downtrend (-2% to -5%)
- **4**: Sideways (-2% to +2%)
- **2**: Moderate uptrend (+2% to +5%)
- **0**: Strong uptrend (+5%+ , poor hedge timing)

#### Time to Expiry (0-7)
- **7**: 3 DTE (optimal decay period)
- **5**: 4 DTE
- **3**: 2 DTE (too short, high gamma risk)
- **1**: 5+ DTE (slow decay, higher cost)
- **0**: 1 DTE or less (too close to expiry)

### 3. Options Structure (0-25 points)

#### Strike Selection (0-10)
- **10**: Strikes 6-8% OTM (optimal risk-reward)
- **8**: Strikes 4-6% or 8-10% OTM
- **6**: Strikes 2-4% or 10-12% OTM
- **4**: Strikes 0-2% OTM (too expensive)
- **2**: Strikes >12% OTM (low probability)
- **0**: ATM strikes (maximum cost)

#### Spread Width (0-8)
- **8**: 250-300 point spread (optimal width)
- **6**: 200-250 or 300-400 point spread
- **4**: 150-200 or 400-500 point spread
- **2**: 100-150 point spread (too narrow)
- **0**: >500 point spread (too wide, low premium)

#### Liquidity Assessment (0-7)
- **7**: Both strikes have OI >10,000 contracts
- **5**: Both strikes have OI >5,000 contracts
- **3**: One strike has OI >10,000, other >5,000
- **1**: Both strikes have OI >1,000 contracts
- **0**: Either strike has OI <1,000 (illiquid)

### 4. Risk-Reward Metrics (0-20 points)

#### Premium-to-Risk Ratio (0-10)
- **10**: Premium >0.5x max risk (excellent ratio)
- **8**: Premium 0.4-0.5x max risk
- **6**: Premium 0.3-0.4x max risk
- **4**: Premium 0.2-0.3x max risk
- **2**: Premium 0.1-0.2x max risk
- **0**: Premium <0.1x max risk (poor ratio)

#### Delta Exposure (0-6)
- **6**: Net delta -0.15 to -0.25 (optimal hedge delta)
- **4**: Net delta -0.10 to -0.15 or -0.25 to -0.30
- **2**: Net delta -0.05 to -0.10 or -0.30 to -0.40
- **0**: Net delta > -0.05 or < -0.40 (poor hedging)

#### Theta Generation (0-4)
- **4**: Positive theta >50% of premium received
- **3**: Positive theta 30-50% of premium
- **2**: Positive theta 10-30% of premium
- **1**: Positive theta <10% of premium
- **0**: Negative theta (time works against position)

## Position Sizing Matrix

### Base Position Size by Grade

| Grade | Base Size | Max Size | Risk Multiplier |
|-------|-----------|----------|-----------------|
| A+    | 3.0%      | 5.0%     | 1.5x           |
| A     | 2.5%      | 4.0%     | 1.3x           |
| A-    | 2.0%      | 3.0%     | 1.0x           |
| B+    | 1.5%      | 2.5%     | 0.8x           |
| B     | 1.0%      | 2.0%     | 0.6x           |
| C     | 0.5%      | 1.0%     | 0.3x           |

### Adjustments

#### Portfolio Heat
- **Extreme Heat (>20%)**: Increase size by 50%
- **High Heat (15-20%)**: Increase size by 25%
- **Moderate Heat (10-15%)**: Standard sizing
- **Low Heat (<10%)**: Reduce size by 20%

#### Market Volatility
- **High VIX (>30)**: Increase size by 30%
- **Moderate VIX (25-30)**: Increase size by 15%
- **Low VIX (<20)**: Reduce size by 30%

#### Account Size
- **Large Account (>₹50L)**: Use maximum sizes
- **Medium Account (₹10-50L)**: Use base sizes
- **Small Account (<₹10L)**: Use minimum sizes

## Example Scoring

### High-Quality Hedge Setup (A+)
```
Portfolio Risk: 28/30
- Heat: 20% decline (+12)
- Volatility: Beta 1.4 (+8)
- Concentration: 25% in single stock (+8)

Market Conditions: 23/25
- VIX: 32 (+8)
- Trend: Moderate downtrend (+6)
- DTE: 3 days (+7)

Options Structure: 22/25
- Strikes: 7% OTM (+10)
- Width: 275 points (+8)
- Liquidity: Both strikes >10K OI (+4)

Risk-Reward: 18/20
- Premium/Risk: 0.45x (+8)
- Delta: -0.22 (+6)
- Theta: 40% of premium (+4)

Total Score: 28 + 23 + 22 + 18 = 91 → A+ Grade
```

### Poor Hedge Setup (C)
```
Portfolio Risk: 8/30
- Heat: 2% decline (+4)
- Volatility: Beta 0.7 (+2)
- Concentration: Well diversified (0)

Market Conditions: 6/25
- VIX: 16 (+2)
- Trend: Strong uptrend (0)
- DTE: 6 days (+1)

Options Structure: 12/25
- Strikes: 2% OTM (+4)
- Width: 150 points (+4)
- Liquidity: Low OI on one strike (+1)

Risk-Reward: 4/20
- Premium/Risk: 0.15x (+2)
- Delta: -0.05 (+2)
- Theta: 5% of premium (+0)

Total Score: 8 + 6 + 12 + 4 = 30 → C Grade
```

## Dynamic Adjustments

### Market Regime Adaptation

#### Crisis Mode (VIX >35, Heat >15%)
- **Increase weights**: Portfolio risk factors (+50% weight)
- **Reduce thresholds**: Accept lower liquidity scores
- **Maximum sizing**: Override grade limits for protection

#### Recovery Mode (VIX <20, Heat <5%)
- **Reduce weights**: Market condition factors (-30% weight)
- **Higher standards**: Require better liquidity and structure
- **Minimum sizing**: Reduce all positions by 40%

#### Normal Mode (Standard conditions)
- **Standard weights**: All factors at 100%
- **Normal thresholds**: Standard grade requirements
- **Base sizing**: Use grade-based sizing matrix

### Time-Based Adjustments

#### Pre-Quarterly Expiry
- **Higher scores**: Expiry week effects (+5 points)
- **Increased sizing**: Account for higher volatility
- **Tighter spreads**: Reduce width for better premiums

#### Weekend Effects
- **Lower scores**: Weekend gap risk (-3 points)
- **Reduced sizing**: Account for overnight risk
- **Wider spreads**: Increase width for safety

#### Earnings Season
- **Variable scores**: Company-specific adjustments
- **Sector hedging**: Focus on affected sectors
- **Size reduction**: Lower limits during earnings

## Performance Tracking

### Score vs. Effectiveness Correlation

#### Hedge Effectiveness by Grade
- **A+**: 85-95% downside protection
- **A**: 80-85% protection
- **A-**: 75-80% protection
- **B+**: 65-75% protection
- **B**: 55-65% protection
- **C**: <55% protection

#### Cost Efficiency by Grade
- **A+**: 0.8-1.2% annual cost
- **A**: 1.2-1.5% annual cost
- **A-**: 1.5-2.0% annual cost
- **B+**: 2.0-2.5% annual cost
- **B**: 2.5-3.0% annual cost
- **C**: >3.0% annual cost

### Continuous Optimization

#### Monthly Review
- **Grade performance**: Adjust scoring weights
- **Market changes**: Update regime adjustments
- **Cost analysis**: Monitor premium efficiency

#### Backtesting Validation
- **Effectiveness testing**: Measure actual protection provided
- **Cost analysis**: Compare hedge costs vs. protection
- **Parameter tuning**: Optimize based on historical results

## Implementation Notes

### Real-time Scoring
```python
def calculate_hedge_score(portfolio_data, market_data, options_data):
    """
    Calculate hedge opportunity score in real-time

    Args:
        portfolio_data: Current portfolio metrics
        market_data: Current market conditions
        options_data: Available options chain

    Returns:
        dict: Score breakdown and recommendations
    """

    score = 0
    breakdown = {}

    # Portfolio risk assessment
    breakdown['portfolio_risk'] = score_portfolio_risk(portfolio_data)
    score += breakdown['portfolio_risk']

    # Market condition assessment
    breakdown['market_conditions'] = score_market_conditions(market_data)
    score += breakdown['market_conditions']

    # Options structure assessment
    breakdown['options_structure'] = score_options_structure(options_data, market_data)
    score += breakdown['options_structure']

    # Risk-reward assessment
    breakdown['risk_reward'] = score_risk_reward_metrics(options_data)
    score += breakdown['risk_reward']

    # Ensure bounds
    final_score = max(0, min(100, score))

    # Determine grade and sizing
    grade = determine_hedge_grade(final_score)
    position_size = calculate_hedge_size(final_score, grade, portfolio_data)

    return {
        'total_score': final_score,
        'grade': grade,
        'position_size_pct': position_size,
        'breakdown': breakdown,
        'recommendation': get_hedge_recommendation(final_score, grade, market_data)
    }
```

### Automated Position Sizing
```python
def calculate_hedge_size(score, grade, portfolio_data):
    """
    Calculate optimal hedge position size

    Args:
        score: Total hedge score
        grade: Hedge grade
        portfolio_data: Portfolio information

    Returns:
        float: Position size as percentage of portfolio
    """

    # Base size from grade
    base_sizes = {
        'A+': 0.03, 'A': 0.025, 'A-': 0.02,
        'B+': 0.015, 'B': 0.01, 'C': 0.005
    }

    base_size = base_sizes.get(grade, 0.01)

    # Portfolio heat adjustment
    heat_multiplier = 1 + (portfolio_data['heat_level'] * 0.5)

    # Volatility adjustment
    vol_multiplier = 1 + (portfolio_data['volatility'] * 0.3)

    # Account size adjustment
    account_size = portfolio_data['total_value']
    if account_size > 5000000:  # >50L
        size_multiplier = 1.2
    elif account_size > 1000000:  # >10L
        size_multiplier = 1.0
    else:
        size_multiplier = 0.8

    # Calculate final size
    final_size = base_size * heat_multiplier * vol_multiplier * size_multiplier

    # Ensure reasonable bounds
    return max(0.005, min(0.05, final_size))  # 0.5% to 5%
```

## Conclusion

The Nifty Options Hedge scoring system provides a comprehensive framework for evaluating hedging opportunities and determining appropriate position sizing. By considering portfolio risk, market conditions, options structure, and risk-reward metrics, investors can make informed decisions about when and how much to hedge.

Regular monitoring and adjustment of the scoring system ensures it remains effective as market conditions evolve and new data becomes available.
