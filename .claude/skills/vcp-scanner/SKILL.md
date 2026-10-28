# VCP Scanner

## Overview
Volatility Contraction Pattern (VCP) scanner based on Mark Minervini's methodology, adapted for NSE markets. Identifies stocks forming progressively tighter price contractions with declining volume, indicating accumulation before breakout. Combines technical VCP detection with fundamental growth validation for high-probability setups.

## Core Capabilities

### VCP Detection
- **Pattern Recognition**: Identifies 2-5 price contractions with progressively shallower pullbacks
- **Volume Analysis**: Confirms declining volume through base with dry-up in final contraction
- **Trend Validation**: Applies Minervini Trend Template (price vs moving averages, 52-week position)
- **Fundamental Filter**: Validates consistent EPS and revenue growth (QoQ EPS, YoY sales)
- **Quality Scoring**: 0-100 point system grading VCP strength and breakout potential

### Breakout Management
- **Pivot Identification**: Calculates breakout level as high of final tight contraction
- **Volume Confirmation**: Requires >150% of 50-day average volume on breakout
- **Entry Timing**: Triggers on clean breakout above pivot with volume surge
- **Risk Management**: Stop loss below low of final contraction (5-8% risk)
- **Position Sizing**: Scales based on VCP quality score (A+ = full size, B = 50% size)

## Technical Specifications

### VCP Criteria
- **Contraction Count**: Minimum 2, optimal 3-5 contractions over 3-12 weeks
- **Pullback Depth**: First pullback 10-35%, each subsequent 40-60% shallower
- **Volume Profile**: Declining through base, final contraction <50% of 50-day average
- **Tightness**: Final contraction <7% range for highest quality
- **Duration**: 3-12 weeks total base formation

### Minervini Trend Template
- **Price vs 150 DMA**: Must be above 150-day moving average
- **Price vs 200 DMA**: Must be above 200-day moving average
- **200 DMA Slope**: Must be rising for 1+ month
- **52-Week Position**: Within 25% of 52-week high, 30%+ above 52-week low
- **Relative Strength**: RS rating >70 vs Nifty 500

### Fundamental Filters
- **EPS Growth**: Positive QoQ growth for last 2+ quarters
- **Revenue Growth**: Positive YoY sales/revenue growth
- **Margin Stability**: Stable or expanding profit margins
- **Sector Strength**: Avoid sectors showing relative weakness

## Key Features

### NSE Market Adaptations
- **Universe**: Nifty 500 + F&O stocks for liquidity
- **Sector RS**: Combines individual stock RS with sector strength
- **Earnings Avoidance**: Filters out stocks within 2 weeks of results
- **Liquidity Filter**: Minimum average volume and market cap thresholds
- **Holiday Calendar**: Accounts for NSE holidays in pattern timing

### Scoring System (0-100 points)
- **Trend Template (20 pts)**: All 5 Minervini criteria met
- **Contraction Quality (20 pts)**: 4+ contractions, >50% depth reduction
- **Volume Profile (20 pts)**: Declining base volume, final dry-up
- **Fundamental Score (20 pts)**: EPS + revenue growth validation
- **Tightness (20 pts)**: Final contraction range <7%

### Grade-Based Position Sizing
- **A+ (80-100)**: Full position size, maximum conviction
- **A (65-80)**: 75% position size, high conviction
- **B (50-65)**: 50% position size, moderate conviction
- **C (Below 50)**: Skip, insufficient quality

## Integration Features

### Data Sources
- **Price Data**: NSE historical data with volume
- **Fundamental Data**: Screener.in or Moneycontrol API integration
- **Sector Data**: Nifty sectoral indices for relative strength
- **Holiday Calendar**: NSE trading holidays integration

### Alert System
- **Daily Watchlist**: Automated generation of VCP candidates
- **Breakout Alerts**: Real-time notifications on pivot breakouts
- **Score Updates**: Daily rescoring of active VCP formations
- **Invalidation Alerts**: Pattern failure notifications

### Backtesting Framework
- **Historical Testing**: 5+ years of NSE data validation
- **Performance Metrics**: Win rate, profit factor, maximum drawdown
- **Score Correlation**: Performance analysis by VCP quality score
- **Market Regime**: Bull/bear market performance attribution

## Practical Application

### Daily Workflow
1. **Morning Scan**: Run VCP detector on universe (6:00-7:00 AM IST)
2. **Fundamental Check**: Validate EPS/revenue growth for high-score candidates
3. **Watchlist Generation**: Create prioritized list by score and breakout readiness
4. **Intraday Monitoring**: Track for pivot breakouts with volume confirmation
5. **Position Management**: Enter on confirmed breakouts, manage with trailing stops

### Risk Management
- **Portfolio Allocation**: Maximum 20% in single VCP position
- **Stop Discipline**: 5-8% below final contraction low
- **Time Limits**: Exit if no breakout within 3 weeks of pivot identification
- **Sector Diversification**: Maximum 3 positions per sector
- **Capital Preservation**: Skip setups during high market uncertainty

### Performance Expectations
- **Win Rate**: 65-80% on A/A+ grade VCPs in bull markets
- **Profit Factor**: 1.8-2.5 for properly scored setups
- **Holding Period**: 2-8 weeks from breakout to target
- **Maximum Drawdown**: 8-15% during holding period
- **Annual Returns**: 25-40% when following strict criteria

## Market Conditions

### Bull Market Environment
- **VCP Frequency**: 15-30 formations in Nifty 500 monthly
- **Success Rate**: 70-85% breakout success rate
- **Average Move**: 25-40% from breakout to peak
- **Holding Time**: 4-8 weeks for full move development

### Neutral Market Environment
- **VCP Frequency**: 5-10 formations monthly
- **Success Rate**: 50-65% breakout success rate
- **Average Move**: 15-25% from breakout
- **Holding Time**: 2-4 weeks

### Bear Market Environment
- **VCP Frequency**: Rare (0-2 formations monthly)
- **Success Rate**: <40% (avoid trading)
- **Strategy**: Reduce position sizes, focus on defense

## Common Pitfalls

### Pattern Recognition Errors
- **Descending Bases**: Avoid patterns where contractions get deeper
- **Wide Ranges**: Skip bases wider than 15% of breakout price
- **Volume Spikes**: False breakouts with volume but no tight base
- **Near Earnings**: Avoid within 2 weeks of quarterly results

### Fundamental Mistakes
- **Growth Without Profitability**: EPS growth masking declining margins
- **One-Time Gains**: Quarterly EPS boosted by non-recurring items
- **Sector Headwinds**: Strong stock in weak sector
- **Currency Impact**: Forex fluctuations affecting reported revenues

### Execution Errors
- **Early Entry**: Entering before confirmed breakout
- **Poor Volume**: Breakouts without required volume surge
- **Tight Stops**: Exiting on normal volatility in base
- **Overtrading**: Taking too many marginal setups

## Advanced Techniques

### Multi-Timeframe Analysis
- **Weekly Charts**: Primary VCP identification
- **Daily Charts**: Entry timing and volume confirmation
- **Hourly Charts**: Intraday breakout execution
- **Sector Charts**: Relative strength validation

### Volume-Price Analysis
- **Volume Climax**: High volume days within contractions
- **Volume Dry-Up**: Final contraction volume patterns
- **Breakout Volume**: Confirmation requirements
- **Post-Breakout Volume**: Sustained buying pressure

### Risk-Adjusted Position Sizing
- **VCP Score Weighting**: Higher scores get larger positions
- **Volatility Adjustment**: Wider bases get smaller positions
- **Market Condition**: Reduce size in uncertain markets
- **Portfolio Heat**: Lower size when portfolio is concentrated

## Integration with Other Strategies

### Complementary Approaches
- **Gap Strategies**: VCP breakouts often gap up
- **Volume Analysis**: Combines with unusual volume patterns
- **Sector Rotation**: VCP identification across sectors
- **Options Strategies**: Covered calls on VCP holdings

### Portfolio Construction
- **Core Holdings**: A+ VCPs as portfolio core
- **Satellite Positions**: B-grade VCPs for diversification
- **Hedge Positions**: Put options during VCP holding periods
- **Cash Management**: Maintain liquidity for new opportunities

## Future Enhancements

### Machine Learning Integration
- **Pattern Recognition**: AI-powered VCP identification
- **Score Optimization**: ML-based scoring model training
- **Predictive Analytics**: Breakout probability forecasting
- **Fundamental Analysis**: Automated earnings quality assessment

### Real-time Features
- **Live Scanning**: Intraday VCP formation monitoring
- **Alert Integration**: Mobile and desktop notifications
- **Automated Execution**: Direct broker API integration
- **Performance Tracking**: Real-time P&L and risk monitoring

### Advanced Analytics
- **Pattern Clustering**: Similar VCP formations grouping
- **Success Prediction**: Breakout success probability models
- **Holding Period Optimization**: Dynamic exit timing
- **Risk Parity**: Advanced portfolio risk balancing
