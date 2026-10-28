# Institutional Flow Tracking Methodology

## Overview
Comprehensive methodology for tracking and analyzing FII (Foreign Institutional Investor) and DII (Domestic Institutional Investor) cash flows in Indian equity markets. Includes data sources, calculation methods, and analytical frameworks.

## Data Sources & Collection

### Primary Data Sources
**NSE FII/DII Data:**
- Daily cash flow reports published by NSE
- Available with T+1 delay (trading day +1)
- Includes gross buy/sell values and net flows
- Covers equity, debt, and derivative segments

**SEBI Bulk Deal Data:**
- Large trades (>0.5% of company equity or ₹5 Cr+)
- Reported within 24 hours of execution
- Includes negotiated deals and block trades

**Exchange Filings:**
- Institutional holding disclosures (13F equivalent)
- Quarterly portfolio disclosures
- Insider trading reports

### Data Frequency & Timing
**Daily Flows:**
- Published next day by 9:00 AM IST
- Covers previous trading day's activity
- Includes both cash market and F&O flows

**Weekly Aggregates:**
- Monday to Friday cumulative flows
- Published every Monday morning
- Includes weekend global market impact

**Monthly Reports:**
- Complete monthly flow summaries
- Published on T+5 basis
- Includes sector-wise breakdowns

## Flow Calculation Methodology

### Basic Flow Metrics
**Gross Flows:**
```
FII Gross Buy = Sum of all FII purchases
FII Gross Sell = Sum of all FII sales
DII Gross Buy = Sum of all DII purchases
DII Gross Sell = Sum of all DII sales
```

**Net Flows:**
```
FII Net Flow = FII Gross Buy - FII Gross Sell
DII Net Flow = DII Gross Buy - DII Gross Sell
Institutional Net Flow = FII Net + DII Net
```

**Flow Ratios:**
```
FII/DII Ratio = FII Net Flow / DII Net Flow
Buy/Sell Ratio = Gross Buy / Gross Sell
Institutional Participation = (FII + DII Flows) / Total Market Turnover
```

### Advanced Flow Metrics

#### Momentum Indicators
**Flow Velocity:**
```
Flow Velocity = Current Net Flow / 20-day Average Flow
```
- Above 1.5: Strong momentum
- Below 0.7: Weak momentum
- Between 0.7-1.5: Normal activity

**Flow Acceleration:**
```
Flow Acceleration = (Current Velocity - Previous Velocity) / Previous Velocity
```
- Measures rate of change in flow momentum

#### Concentration Metrics
**Sector Concentration:**
```
Sector Flow % = Sector Flow / Total FII Flow
```
- Identifies sector-specific institutional interest
- Flags concentration risks (>40% in single sector)

**Stock Concentration:**
```
Stock Flow % = Individual Stock Flow / Total Flow
```
- Tracks institutional positioning in specific stocks
- Identifies accumulation/distribution patterns

### Flow Attribution Analysis

#### Market Cap Segmentation
**Large Cap (>₹10,000 Cr):**
- Primary FII focus area
- Lower volatility, stable flows
- Long-term investment horizon

**Mid Cap (₹1,000-10,000 Cr):**
- Mixed FII/DII participation
- Higher volatility flows
- Growth-oriented investments

**Small Cap (<₹1,000 Cr):**
- Primarily DII driven
- Event-driven flows
- Higher speculative component

#### Sector Flow Analysis
**IT Sector:**
- High FII concentration (40-50% of flows)
- USD/INR sensitive
- Earnings-driven flows

**Banking/Financial Services:**
- Balanced FII/DII participation
- Interest rate sensitive
- Economic indicator driven

**Pharma/Healthcare:**
- Global event sensitive
- Regulatory impact significant
- Long-term investment focus

## Flow Impact Assessment

### Market Impact Models

#### Direct Price Impact
**Flow-Induced Price Change:**
```
Expected Price Change = (Net Flow × Impact Factor) / Market Cap
Impact Factor = 0.0001 (for large caps) to 0.001 (for small caps)
```

#### Liquidity Impact
**Flow Liquidity Ratio:**
```
Liquidity Impact = Net Flow / Average Daily Volume
```
- Above 0.3: Significant liquidity impact
- May cause slippage in execution

### Predictive Signals

#### Flow vs Price Divergence
**Bullish Divergence:**
- Price falling but FII flows positive
- Indicates potential bottom formation

**Bearish Divergence:**
- Price rising but FII flows negative
- Indicates potential top formation

#### Flow Sustainability
**Flow Trend Strength:**
```
Trend Strength = (Current Flow - 10-day MA) / 10-day Std Dev
```
- Above 2: Strong sustainable trend
- Below -2: Strong reversal signal

## Risk Management Framework

### Flow-Based Risk Metrics

#### Concentration Risk
**Portfolio Concentration:**
```
Concentration Risk = MAX(Sector Concentrations) / Average Concentration
```
- Above 2.0: High concentration risk
- Requires diversification alert

#### Volatility Risk
**Flow Volatility:**
```
Flow Volatility = Std Dev of Net Flows (20-day) / Average Flow
```
- Above 1.5: High volatility flows
- Indicates unpredictable market conditions

### Position Sizing Guidelines

#### Flow-Based Position Limits
**Conservative Approach:**
- Max position: 2% of capital when flows are volatile
- Max position: 5% of capital when flows are stable

**Aggressive Approach:**
- Max position: 5% when flows strongly supportive
- Max position: 10% when flows + price action aligned

## Analytical Frameworks

### Flow Cycle Analysis
**Accumulation Phase:**
- FII buying, DII mixed
- Price consolidation
- Volume decreasing

**Mark-up Phase:**
- Both FII/DII buying
- Price trending up
- Volume increasing

**Distribution Phase:**
- FII selling, DII mixed
- Price consolidation
- Volume high

**Mark-down Phase:**
- Both FII/DII selling
- Price trending down
- Volume decreasing

### Seasonal Flow Patterns

#### Monthly Patterns
**January Effect:**
- Post-budget FII inflows
- Tax-loss selling by DIIs

**March/April:**
- Financial year-end positioning
- Higher volatility

**September/October:**
- Quarter-end rebalancing
- Festival season impact

#### Weekly Patterns
**Monday Flows:**
- Weekend news digestion
- Global market reaction

**Friday Flows:**
- Position squaring
- Weekend risk adjustment

**Expiry Week:**
- F&O positioning flows
- Higher derivative-related activity

## Data Quality & Validation

### Data Integrity Checks
**Reasonableness Tests:**
- Flow values within expected ranges
- Cross-verification with market turnover
- Consistency with historical patterns

**Gap Detection:**
- Missing data identification
- Extrapolation methods for delays
- Alternative data source validation

### Statistical Filters
**Outlier Detection:**
```
Outlier Threshold = Mean ± 3 × Std Dev
```
- Flags unusual flow days
- Requires manual verification

**Trend Consistency:**
- Moving average filters
- Eliminates noise from daily fluctuations

## Integration with Other Analysis

### Technical Analysis Integration
**Flow Confirmation:**
- Strong flows + technical breakout = High conviction
- Weak flows + technical breakdown = Caution

**Divergence Analysis:**
- Flow divergence from price trends
- Early warning signals

### Fundamental Analysis Integration
**Earnings Impact:**
- Pre-earnings flow positioning
- Post-earnings flow reactions

**Sector Rotation:**
- Flow-driven sector changes
- Economic cycle indicators

## Reporting Standards

### Flow Report Components
**Executive Summary:**
- Key flow highlights
- Market impact assessment
- Risk alerts

**Detailed Analysis:**
- Daily/weekly/monthly breakdowns
- Sector/stock specific flows
- Comparative analysis

**Predictive Insights:**
- Flow momentum indicators
- Market direction bias
- Risk management recommendations

### Visualization Standards
**Flow Charts:**
- Daily flow bars (buy/sell)
- Cumulative flow lines
- Ratio trend charts

**Impact Heatmaps:**
- Sector flow intensity
- Stock flow concentration
- Risk assessment matrix

## Limitations & Caveats

### Data Limitations
**Timing Delays:**
- T+1 reporting affects real-time analysis
- Weekend gaps in flow data

**Coverage Gaps:**
- Only NSE-listed securities
- Excludes OTC transactions

**Classification Issues:**
- FII/DII classification may change
- Sub-categorization limitations

### Analytical Limitations
**Correlation ≠ Causation:**
- Flows correlate with price but don't cause all moves
- External factors influence both

**Herding Behavior:**
- Institutional herding can amplify moves
- Creates feedback loops

**Currency Impact:**
- FII flows affected by USD/INR movements
- Indirect market impact through currency

## Continuous Improvement

### Model Validation
**Backtesting:**
- Historical flow vs price correlation
- Signal accuracy testing
- Risk-adjusted performance

**Forward Testing:**
- Real-time signal validation
- Performance tracking
- Parameter optimization

### Data Enhancement
**Additional Sources:**
- Global ETF flows
- Prop trading flows
- Retail flow estimates

**Granular Analysis:**
- Intraday flow patterns
- Order book analysis
- Dark pool activity

This methodology provides a robust framework for institutional flow analysis while acknowledging the complexities and limitations of working with real market data.
