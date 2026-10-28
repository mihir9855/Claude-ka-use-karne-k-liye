# India Stock Screener - NSE Trading Skill

## Overview

The India Stock Screener skill provides comprehensive quantitative stock screening and analysis capabilities for NSE-listed companies. This skill combines fundamental analysis, technical indicators, and market data to identify investment opportunities across different market capitalizations and sectors.

## Core Capabilities

### Multi-Factor Screening
- **Fundamental Filters**: EPS growth, ROE, debt-equity ratio, P/E, P/B
- **Technical Filters**: Moving averages, RSI, MACD, volume patterns
- **Valuation Metrics**: Graham number, dividend yield, EV/EBITDA
- **Quality Metrics**: Piotroski score, Altman Z-score, Beneish M-score

### Sector-Specific Analysis
- **Sector Rotation**: Identify leading and lagging sectors
- **Peer Comparison**: Relative valuation within sectors
- **Sector Momentum**: RSI and trend analysis by sector
- **Industry Trends**: Sub-sector performance analysis

### Risk-Adjusted Screening
- **Volatility Filters**: Beta, standard deviation, Sharpe ratio
- **Liquidity Filters**: Average volume, market depth
- **Risk Metrics**: Value at Risk (VaR), maximum drawdown
- **Portfolio Optimization**: Efficient frontier analysis

## Key Features

### 1. Custom Screen Builder
- Drag-and-drop filter creation
- Boolean logic combinations (AND/OR/NOT)
- Save and reuse custom screens
- Real-time screen updates

### 2. Multi-Asset Screening
- Large-cap (Nifty 50) screening
- Mid-cap (Nifty Midcap 100) analysis
- Small-cap (Nifty Smallcap 100) opportunities
- Thematic screening (EV, renewable energy, etc.)

### 3. Real-Time Alerts
- Price alerts based on technical levels
- Fundamental alerts (earnings, dividends)
- Volume spike notifications
- News-based screening updates

### 4. Portfolio Integration
- Screen for portfolio rebalancing
- Gap analysis vs benchmark
- Overlap detection with existing holdings
- Tax-loss harvesting opportunities

## Screening Methodologies

### Value Investing Screens

#### **Deep Value Screen**
```
Market Cap > ₹500 Cr
P/E Ratio < 15
P/B Ratio < 1.5
Debt/Equity < 0.5
ROE > 12%
Dividend Yield > 2%
```

#### **Graham Defensive Screen**
```
EPS Growth (5yr) > 0
Sales Growth (5yr) > 0
ROE > 10%
Debt/Equity < 0.5
Current Ratio > 1.5
```

#### **Quality Value Screen**
```
Piotroski Score > 7
Altman Z-Score > 3
Beneish M-Score < -1.78
ROA > 8%
Free Cash Flow Yield > 3%
```

### Growth Investing Screens

#### **High Growth Screen**
```
Revenue Growth (YoY) > 20%
EPS Growth (YoY) > 25%
Net Profit Growth (YoY) > 30%
PEG Ratio < 1.5
Institutional Holding > 30%
```

#### **Sustainable Growth Screen**
```
ROE > 15%
Retention Ratio > 60%
Asset Turnover > 1.2
Financial Leverage < 1.5
Growth Consistency (5yr) > 15%
```

#### **Momentum Growth Screen**
```
1M Return > 10%
3M Return > 15%
6M Return > 20%
Relative Strength > 1.2
Analyst Rating > 4.0
```

### Technical Screens

#### **Breakout Screen**
```
52W High within 5%
Volume > 2x Average (20-day)
RSI (14) > 60
MACD Histogram > 0
Bollinger Band Squeeze < 1%
```

#### **Reversal Screen**
```
52W Low within 10%
Volume Spike > 3x Average
RSI (14) < 30
Stochastic %K < 20
Negative Divergence (Price vs RSI)
```

#### **Trend Following Screen**
```
200 SMA > 50 SMA > 20 SMA
ADX (14) > 25
MACD > Signal Line
Parabolic SAR below price
Trend Strength > 70%
```

## Sector Rotation Analysis

### Sector Momentum Scoring

#### **Relative Strength Index (Sector RSI)**
```
Sector_Return = Σ(Stock_Returns × Weight) / Σ(Weights)
Sector_RSI = 100 - (100 / (1 + RS))
Where RS = Average_Gain / Average_Loss (14-period)
```

#### **Sector Rotation Score**
```
Momentum_Score = (1M_Return × 0.4) + (3M_Return × 0.3) + (6M_Return × 0.3)
Rotation_Rank = Percentile_Rank(Momentum_Score)
```

#### **Sector Leadership Matrix**
```
X-Axis: Momentum Score
Y-Axis: Relative Strength vs Nifty
Quadrants:
  Q1: Strong Leadership (High momentum, outperforming)
  Q2: Weakening (High momentum, underperforming)
  Q3: Improving (Low momentum, outperforming)
  Q4: Lagging (Low momentum, underperforming)
```

### Sector Valuation Analysis

#### **Sector P/E Relative**
```
Sector_PE_Relative = Sector_PE / Market_PE
Overvalued: > 1.2
Fair Valued: 0.8 - 1.2
Undervalued: < 0.8
```

#### **Sector ROE Comparison**
```
Sector_ROE_Premium = Sector_ROE - Risk_Free_Rate
Quality_Rank = Percentile_Rank(Sector_ROE_Premium)
```

## Risk Management Integration

### Portfolio Risk Screens

#### **Diversification Screen**
```
Maximum Sector Weight < 25%
Maximum Stock Weight < 5%
Correlation with Portfolio < 0.7
Beta vs Benchmark < 1.5
```

#### **Liquidity Screen**
```
Average Volume (30-day) > ₹50 Cr
Market Depth > ₹100 Cr
Bid-Ask Spread < 0.5%
Impact Cost < 1%
```

#### **Volatility Screen**
```
Standard Deviation (1yr) < 35%
Maximum Drawdown (1yr) < 25%
VaR (95%, 1-day) < 3%
Sharpe Ratio > 1.0
```

### Dynamic Risk Adjustment

#### **Market Regime Adjustment**
```
Bull Market: Relax valuation criteria by 20%
Bear Market: Tighten quality filters
Sideways: Focus on income and stability
High Volatility: Increase liquidity requirements
```

#### **Portfolio Size Adjustment**
```
Small Portfolio (<₹5L): Focus on large-cap, liquid stocks
Medium Portfolio (₹5L-₹50L): Include mid-cap opportunities
Large Portfolio (>₹50L): Add small-cap, thematic exposure
```

## Implementation Strategy

### Data Pipeline
```
Raw Data → Cleaning → Calculation → Screening → Ranking → Output
    ↓         ↓         ↓         ↓         ↓         ↓
  NSE API   Validation  Metrics   Filters   Scoring   Reports
  BSE API   Enrichment  Ratios    Alerts    Alerts    Alerts
  Refinitiv Formatting  Scores    Updates   Updates   Dashboard
```

### Screening Engine
1. **Data Collection**: Real-time and historical data
2. **Metric Calculation**: 50+ fundamental and technical metrics
3. **Filter Application**: Boolean logic with custom criteria
4. **Ranking System**: Multi-factor scoring and weighting
5. **Output Generation**: Ranked lists with detailed analysis

### Real-Time Updates
- **Frequency**: Every 15 minutes during market hours
- **Latency**: <5 seconds for screen updates
- **Coverage**: All NSE-listed stocks (5000+ companies)
- **Data Quality**: 99.5% accuracy with validation checks

## Performance Analytics

### Screen Effectiveness Metrics

#### **Hit Rate Analysis**
```
Win Rate = (Successful_Picks / Total_Picks) × 100
Success Criteria:
  Value Screens: Outperform Nifty by 5% in 6 months
  Growth Screens: Outperform Nifty by 10% in 3 months
  Technical Screens: 60% profitable trades
```

#### **Risk-Adjusted Returns**
```
Sharpe Ratio = (Portfolio_Return - Risk_Free_Rate) / Portfolio_Volatility
Sortino Ratio = (Portfolio_Return - Risk_Free_Rate) / Downside_Deviation
Information Ratio = (Portfolio_Return - Benchmark_Return) / Tracking_Error
```

#### **Portfolio Impact**
```
Alpha Generation: Excess return vs benchmark
Beta Management: Systematic risk control
Diversification: Correlation reduction
Turnover: Trading cost optimization
```

### Benchmarking

#### **Performance vs Benchmarks**
- **Nifty 50**: Large-cap screen performance
- **Nifty Midcap 100**: Mid-cap screen effectiveness
- **Nifty Smallcap 100**: Small-cap opportunity capture
- **Sector Indices**: Sector rotation success

#### **Peer Comparison**
- **Other Screeners**: Top quartile performance
- **Fund Managers**: Competitive risk-adjusted returns
- **Quantitative Strategies**: Better than 60% of peers
- **Market Timing**: Consistent outperformance

## Integration with Other Skills

### Complementary Skills
- **India Earnings Calendar**: Pre/post-earnings screening
- **NSE Technical Analyst**: Technical confirmation for screens
- **India Macro Monitor**: Macro environment screening
- **India Sector Analyst**: Sector-specific screening

### Workflow Integration
1. **Idea Generation**: Use screener to identify candidates
2. **Fundamental Analysis**: Deep dive with earnings calendar
3. **Technical Analysis**: Confirm with technical analyst
4. **Portfolio Construction**: Risk management integration

## Technology Stack

### Data Processing
- **Python**: Pandas for data manipulation, NumPy for calculations
- **SQL**: PostgreSQL for historical data storage
- **Redis**: Caching for real-time data
- **Apache Spark**: Large-scale data processing

### Analysis Tools
- **Scikit-learn**: Machine learning for pattern recognition
- **TA-Lib**: Technical analysis library
- **Statsmodels**: Statistical modeling
- **Plotly**: Interactive visualizations

### User Interface
- **Web Dashboard**: Real-time screen monitoring
- **Mobile App**: On-the-go screening and alerts
- **API Endpoints**: Integration with trading platforms
- **Excel Integration**: Export capabilities

## Conclusion

The India Stock Screener skill provides traders and investors with powerful quantitative tools to identify investment opportunities in the Indian equity market. By combining multiple screening methodologies with risk management and portfolio integration, users can make more informed investment decisions.

Success requires understanding the strengths and limitations of different screening approaches, regular performance monitoring, and adaptation to changing market conditions.
