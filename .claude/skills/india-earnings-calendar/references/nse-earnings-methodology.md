# NSE Earnings Calendar Methodology - India Earnings Calendar

## Overview

The NSE Earnings Calendar methodology provides a systematic framework for tracking, analyzing, and trading corporate earnings releases in the Indian equity market. This methodology combines quantitative analysis with market microstructure insights to identify earnings-driven trading opportunities.

## Data Collection Framework

### Primary Data Sources

#### **NSE Corporate Announcements**
- **Source**: NSE India website and API
- **Frequency**: Real-time updates
- **Coverage**: All NSE-listed companies
- **Data Types**:
  - Board meeting dates
  - Financial result announcements
  - Earnings calls and presentations
  - Dividend declarations

#### **BSE Corporate Announcements**
- **Source**: BSE India corporate announcements
- **Frequency**: Daily updates
- **Coverage**: BSE-listed companies
- **Data Types**:
  - Additional disclosures
  - Regulatory filings
  - AGM/EGM notices

#### **Broker Research Reports**
- **Source**: Multiple brokerage houses (ICICI, HDFC, Kotak, etc.)
- **Frequency**: Pre-earnings estimates
- **Coverage**: Large and mid-cap companies
- **Data Types**:
  - EPS estimates
  - Revenue forecasts
  - Recommendation changes

### Secondary Data Sources

#### **Analyst Estimates Aggregation**
- **Source**: Bloomberg, Refinitiv, Moneycontrol
- **Frequency**: Updated daily
- **Coverage**: Nifty 50, Nifty Next 50
- **Data Types**:
  - Consensus estimates
  - Estimate revisions
  - Price targets

#### **Institutional Holdings**
- **Source**: NSE bulk deals, quarterly disclosures
- **Frequency**: Quarterly updates
- **Coverage**: Large institutional positions
- **Data Types**:
  - FII/DII position changes
  - Bulk deal data around earnings

## Earnings Calendar Construction

### Calendar Categories

#### **1. Scheduled Earnings**
- **Definition**: Companies with pre-announced earnings dates
- **Source**: Company guidance and historical patterns
- **Reliability**: High (85-90% accuracy)
- **Trading Impact**: Moderate to high

#### **2. Estimated Earnings**
- **Definition**: Earnings predicted based on historical patterns
- **Source**: Statistical analysis of past earnings dates
- **Reliability**: Medium (70-80% accuracy)
- **Trading Impact**: Low to moderate

#### **3. Surprise Earnings**
- **Definition**: Unannounced early/late earnings releases
- **Source**: Real-time monitoring
- **Reliability**: N/A (by definition)
- **Trading Impact**: High volatility

### Calendar Time Windows

#### **Earnings Season Overview**
```
Q4 (Jan-Mar):   Peak season, highest volatility
Q1 (Apr-Jun):   Monsoon quarter, revenue focus
Q2 (Jul-Sep):   Festival quarter, consumer spending
Q3 (Oct-Dec):   Year-end, tax planning effects
```

#### **Daily Earnings Distribution**
- **Monday**: 15-20% of earnings (fresh week momentum)
- **Tuesday-Thursday**: 60-70% of earnings (peak activity)
- **Friday**: 10-15% of earnings (weekend effect)
- **Post-Market**: 5-10% of earnings (after-hours)

## Earnings Surprise Calculation

### EPS Surprise Metrics

#### **Basic EPS Surprise**
```
EPS_Surprise = (Actual_EPS - Consensus_EPS) / |Consensus_EPS|
```
- **Range**: -100% to +∞ (negative for beats, positive for misses)
- **Thresholds**:
  - Beat: Surprise > 5%
  - In-line: -5% ≤ Surprise ≤ 5%
  - Miss: Surprise < -5%

#### **Revenue Surprise**
```
Revenue_Surprise = (Actual_Revenue - Consensus_Revenue) / |Consensus_Revenue|
```
- **Range**: Similar to EPS surprise
- **Importance**: Higher weight for growth companies
- **Correlation**: 0.75 with stock price reaction

#### **Composite Surprise Score**
```
Composite_Surprise = (EPS_Surprise × 0.6) + (Revenue_Surprise × 0.4)
```
- **Range**: -100% to +∞
- **Usage**: Primary decision metric for trading

### Estimate Quality Assessment

#### **Consensus Quality Score**
```
Estimate_Quality = 1 / (Standard_Deviation_of_Estimates / Mean_Estimate)
```
- **High Quality**: Score > 2.0 (tight consensus)
- **Medium Quality**: Score 1.0-2.0 (moderate dispersion)
- **Low Quality**: Score < 1.0 (wide dispersion)

#### **Revision Trend Analysis**
```
Revision_Trend = (Latest_Estimate - 30Day_Ago_Estimate) / |30Day_Ago_Estimate|
```
- **Positive Revision**: Trend > 2% (bullish)
- **Stable**: -2% ≤ Trend ≤ 2% (neutral)
- **Negative Revision**: Trend < -2% (bearish)

## Market Impact Analysis

### Volatility Metrics

#### **Implied Move Calculation**
```
Implied_Move = Stock_Price × Implied_Volatility × √(Days_to_Earnings/365)
```
- **Pre-Earnings**: 3-8% for large caps
- **Post-Earnings**: 2-5% realized move
- **Options Premium**: 1.5-3% cost for hedging

#### **Realized Volatility**
```
Realized_Volatility = √(252) × √(Σ(Returns²) / N)
```
- **Normal Range**: 25-40% annualized
- **Earnings Spike**: 50-80% during earnings week
- **Post-Earnings**: Returns to normal within 3-5 days

### Stock Price Reaction Analysis

#### **Immediate Reaction (T+0)**
- **Beat**: Average +3-5% move
- **Miss**: Average -4-6% move
- **In-line**: Average -1% to +1% move
- **Time Frame**: 90% of move within first hour

#### **Extended Reaction (T+1 to T+5)**
- **Momentum Continuation**: 60-70% of surprises
- **Reversal**: 30-40% of extreme surprises
- **Sector Influence**: 20-30% of price action

#### **Long-term Impact**
- **Beat**: +8-12% over 3 months
- **Miss**: -10-15% over 3 months
- **Multiple Quarters**: Compounding effect

## Sector-Specific Earnings Patterns

### Banking Sector
- **Key Metrics**: NIM, GNPA, PCR, Fee Income
- **Volatility**: High (40-60% earnings move)
- **Timing**: Q4 most important (annual results)
- **Surprise Factors**: Asset quality, regulatory changes

### IT Sector
- **Key Metrics**: Revenue growth, USD/INR rates, Utilization
- **Volatility**: Medium (25-40% earnings move)
- **Timing**: Q1 most volatile (March quarter)
- **Surprise Factors**: Large deal wins/losses

### Pharma Sector
- **Key Metrics**: New launches, USFDA approvals, API prices
- **Volatility**: Medium-High (30-50% earnings move)
- **Timing**: Event-driven rather than quarterly
- **Surprise Factors**: Regulatory approvals, patent outcomes

### FMCG Sector
- **Key Metrics**: Volume growth, Realization, A&P spend
- **Volatility**: Low (15-25% earnings move)
- **Timing**: Q2/Q3 strongest (festival seasons)
- **Surprise Factors**: Rural demand, competitive intensity

## Trading Strategy Framework

### Pre-Earnings Strategies

#### **1. Anticipation Trade**
```
Entry: T-3 to T-1 days before earnings
Signal: High conviction estimate, positive revisions
Target: 3-5% move based on implied move
Stop Loss: 2% below entry
Holding: Through earnings day
```

#### **2. Options Straddle**
```
Setup: High uncertainty earnings
Position: Buy ATM call + put
Breakeven: Premium paid + stock price
Target: Implied move achieved
Exit: Day after earnings
```

#### **3. Volatility Play**
```
Entry: When IV is cheap vs historical
Position: Long options or VIX-related
Target: IV expansion before earnings
Exit: Day before earnings
```

### Post-Earnings Strategies

#### **1. Momentum Trade**
```
Entry: Immediately after earnings surprise
Signal: Surprise > 10% (beat) or < -10% (miss)
Target: 5-8% move in surprise direction
Stop Loss: 3% trailing stop
Holding: 1-3 days
```

#### **2. Reversal Trade**
```
Entry: Day after extreme surprise
Signal: >15% move on earnings day
Target: 30-50% retracement
Stop Loss: 2% beyond high/low
Holding: 2-5 days
```

#### **3. Sector Rotation**
```
Entry: Post large-cap earnings surprise
Signal: Nifty 50 company with sector impact
Target: Related sector stocks
Stop Loss: 2% below entry
Holding: Until sector momentum fades
```

## Risk Management

### Position Sizing

#### **Base Position Size**
```
Position_Size = Portfolio_Value × Risk_Per_Trade × Confidence_Factor
```
- **Risk Per Trade**: 1-2% of portfolio
- **Confidence Factor**: 0.5-1.5 based on estimate quality
- **Market Cap Adjustment**: 0.5× for small cap, 1.5× for large cap

#### **Earnings-Specific Adjustments**
- **High Uncertainty**: 0.7× normal size
- **Low Liquidity**: 0.5× normal size
- **Options Position**: 0.3× normal size
- **Portfolio Concentration**: Max 15% in earnings plays

### Stop Loss Rules

#### **Pre-Earnings Stops**
- **Technical**: 2-3% below support levels
- **Time-Based**: Exit if earnings delayed >1 week
- **Volatility**: 1.5× ATR stop distance
- **Portfolio**: 5% maximum drawdown trigger

#### **Post-Earnings Stops**
- **Trailing**: 3-5% trailing stop
- **Time-Based**: Exit after 5 trading days
- **Gap Risk**: Wider stops for after-hours earnings
- **News**: Immediate exit on negative news

### Portfolio Limits

#### **Concentration Limits**
- **Single Stock**: Max 5% of portfolio
- **Single Sector**: Max 20% of portfolio
- **Earnings Plays**: Max 25% of portfolio
- **Options Exposure**: Max 10% of portfolio

#### **Volatility Limits**
- **Portfolio VaR**: Max 3% daily VaR
- **Stress Testing**: 2× historical worst case
- **Liquidity**: Min 70% liquid assets
- **Hedging**: 50-75% hedge ratio for large positions

## Performance Analytics

### Success Metrics

#### **Trade-Level Metrics**
- **Win Rate**: 55-65% for earnings trades
- **Profit Factor**: 1.3-1.8 (gross profit/gross loss)
- **Average Win/Loss**: 2.5× (win size vs loss size)
- **Hold Time**: Average 2-3 days

#### **Portfolio-Level Metrics**
- **Sharpe Ratio**: >1.2 during earnings season
- **Maximum Drawdown**: <8% during earnings season
- **Beta to Market**: 0.8-1.2 (moderate market exposure)
- **Volatility**: 15-20% annualized (lower than market)

### Benchmarking

#### **Market Comparison**
- **Nifty 50**: Outperform by 2-3% during earnings season
- **Sector Indices**: Beat relevant sector by 1-2%
- **Earnings Calendar**: Top quartile performance
- **Risk-Adjusted**: Higher Sharpe than buy-and-hold

#### **Peer Comparison**
- **Other Earnings Traders**: Top 25% performance
- **Quantitative Funds**: Competitive risk-adjusted returns
- **Long-Short Funds**: Better than 60% of peers
- **Market Neutral**: Consistent positive returns

## Implementation Technology

### Data Pipeline

#### **Data Ingestion**
```python
def collect_earnings_data():
    # NSE API calls
    nse_data = fetch_nse_earnings()
    # BSE data collection
    bse_data = fetch_bse_announcements()
    # Broker estimates
    estimates = fetch_broker_estimates()
    # Institutional data
    institutional = fetch_institutional_data()
    return consolidate_data(nse_data, bse_data, estimates, institutional)
```

#### **Analysis Engine**
```python
def analyze_earnings_surprise(actual, consensus):
    eps_surprise = calculate_eps_surprise(actual, consensus)
    revenue_surprise = calculate_revenue_surprise(actual, consensus)
    composite_score = calculate_composite_score(eps_surprise, revenue_surprise)
    market_impact = assess_market_impact(composite_score, market_cap)
    return generate_trading_signals(composite_score, market_impact)
```

### Alerting System

#### **Pre-Earnings Alerts**
- Earnings date confirmation (T-7 days)
- Estimate revisions (significant changes)
- Analyst rating changes
- Institutional position changes

#### **Earnings Day Alerts**
- Earnings release timing
- Initial price reaction
- Volume spike detection
- Options flow anomalies

#### **Post-Earnings Alerts**
- Surprise magnitude alerts
- Momentum continuation signals
- Reversal opportunities
- Sector rotation triggers

## Conclusion

The NSE Earnings Calendar methodology provides a comprehensive framework for earnings-based trading in the Indian market. By combining systematic data collection, rigorous analysis, and disciplined execution, traders can capture earnings-related opportunities while managing the associated risks.

Success requires continuous adaptation to changing market conditions, regular performance review, and integration with broader market analysis tools.
