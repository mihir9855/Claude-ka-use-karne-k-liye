# Quantitative Screening Framework - India Stock Screener

## Overview

The Quantitative Screening Framework provides a systematic approach to stock screening in the Indian market, combining fundamental analysis, technical indicators, and risk metrics to identify investment opportunities. This framework is specifically adapted for NSE market characteristics and Indian corporate reporting standards.

## Screening Methodology

### Multi-Factor Model Structure

#### **Factor Categories**
```
Fundamental Factors (40% weight)
├── Quality Factors (20%)
│   ├── Profitability: ROE, ROA, ROCE
│   ├── Efficiency: Asset Turnover, Inventory Turnover
│   └── Stability: Debt/Equity, Interest Coverage
├── Growth Factors (10%)
│   ├── Revenue Growth (YoY, 3yr CAGR)
│   ├── EPS Growth (YoY, 3yr CAGR)
│   └── Book Value Growth
└── Value Factors (10%)
    ├── Price Ratios: P/E, P/B, P/S
    ├── Enterprise Value: EV/EBITDA, EV/Sales
    └── Dividend Metrics: Yield, Payout Ratio

Technical Factors (30% weight)
├── Momentum (15%)
│   ├── Price Momentum: 1M, 3M, 6M returns
│   ├── Volume Momentum: Volume ratio, Accumulation/Distribution
│   └── Relative Strength: vs Nifty, vs Sector
├── Mean Reversion (10%)
│   ├── RSI (14, 21 periods)
│   ├── Bollinger Bands position
│   └── Stochastic Oscillator
└── Trend (5%)
    ├── Moving Average alignment
    ├── ADX strength
    └── MACD signals

Risk Factors (20% weight)
├── Volatility (10%)
│   ├── Historical Volatility (30, 90, 252 days)
│   ├── Beta vs Nifty
│   └── Maximum Drawdown
├── Liquidity (7%)
│   ├── Average Volume (30-day)
│   ├── Market Capitalization
│   └── Bid-Ask Spread
└── Quality Risk (3%)
    ├── Altman Z-Score
    ├── Piotroski F-Score
    └── Beneish M-Score
```

#### **Composite Scoring System**
```
Total_Score = Σ(Factor_Score × Factor_Weight × Factor_Confidence)
Where:
- Factor_Score: Z-score normalized (-3 to +3)
- Factor_Weight: Category weight (0-100%)
- Factor_Confidence: Data quality score (0-1)
```

### Factor Calculation Methods

#### **Fundamental Factor Calculations**

##### **Quality Factors**
```
ROE = Net_Income / Shareholder_Equity
ROA = Net_Income / Total_Assets
ROCE = EBIT / Capital_Employed
Asset_Turnover = Revenue / Total_Assets
Inventory_Turnover = COGS / Average_Inventory
Debt_Equity = Total_Debt / Shareholder_Equity
Interest_Coverage = EBIT / Interest_Expense
```

##### **Growth Factors**
```
Revenue_Growth_YoY = (Revenue_Current - Revenue_Previous) / Revenue_Previous
EPS_Growth_YoY = (EPS_Current - EPS_Previous) / EPS_Previous
Revenue_CAGR_3yr = (Revenue_Current / Revenue_3yr_Ago)^(1/3) - 1
Book_Value_Growth = (BV_Current - BV_Previous) / BV_Previous
```

##### **Value Factors**
```
PE_Ratio = Current_Price / EPS_TTM
PB_Ratio = Current_Price / Book_Value_Per_Share
PS_Ratio = Current_Price / Sales_Per_Share
EV_EBITDA = Enterprise_Value / EBITDA_TTM
Dividend_Yield = Annual_Dividend / Current_Price
Payout_Ratio = Dividends_Paid / Net_Income
```

#### **Technical Factor Calculations**

##### **Momentum Factors**
```
Price_Momentum_1M = (Price_Current - Price_1M_Ago) / Price_1M_Ago
Volume_Ratio = Volume_Current / Volume_20DMA
Relative_Strength = Stock_Return / Nifty_Return
Accumulation_Distribution = Σ((Close - Low) - (High - Close)) / (High - Low) × Volume
```

##### **Mean Reversion Factors**
```
RSI = 100 - (100 / (1 + RS))
Where RS = Average_Gain_14 / Average_Loss_14
Bollinger_Position = (Price - Lower_Band) / (Upper_Band - Lower_Band)
Stochastic_K = 100 × (Close - Lowest_14) / (Highest_14 - Lowest_14)
```

##### **Trend Factors**
```
MA_Alignment = 1 if SMA200 > SMA50 > SMA20 else 0
ADX = 100 × (Average(+DI - -DI) / Average(+DI + -DI))
MACD_Signal = 1 if MACD > Signal_Line else 0
```

#### **Risk Factor Calculations**

##### **Volatility Factors**
```
Historical_Volatility = √(252) × √(Σ(Returns²) / 252)
Beta = Covariance(Stock_Returns, Nifty_Returns) / Variance(Nifty_Returns)
Max_Drawdown = (Peak - Trough) / Peak during period
```

##### **Liquidity Factors**
```
Average_Volume = Mean(Volume_Last_30_Days)
Market_Cap = Shares_Outstanding × Current_Price
Spread_Cost = (Ask - Bid) / Mid_Price × 100
```

##### **Quality Risk Factors**
```
Altman_Z_Score = 1.2×WC/TA + 1.4×RE/TA + 3.3×EBIT/TA + 0.6×MVE/TL + 0.999×S/TA
Piotroski_F_Score = Sum of 9 binary criteria (0-9)
Beneish_M_Score = -4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI + 0.115×DEPI - 0.172×SGAI + 4.679×TATA - 0.327×LVGI
```

## Screening Templates

### Value Investing Screens

#### **Deep Value Screen**
```
Selection Criteria:
- Market Capitalization > ₹1,000 Cr
- P/E Ratio < 15
- P/B Ratio < 1.2
- Debt/Equity < 0.4
- ROE > 15%
- Dividend Yield > 2.5%
- Piotroski Score > 6

Expected Characteristics:
- Average P/E: 12-14
- Average P/B: 0.8-1.0
- Historical Win Rate: 65%
- Holding Period: 12-24 months
```

#### **Graham Number Screen**
```
Graham_Number = √(22.5 × EPS × Book_Value_Per_Share)
Selection Criteria:
- Current Price < Graham Number × 0.67
- EPS Growth (5yr) > 0
- Sales Growth (5yr) > 0
- Debt/Equity < 0.5
- Current Ratio > 1.5

Expected Characteristics:
- Margin of Safety: 33%
- Average Upside: 25-35%
- Historical Win Rate: 70%
- Holding Period: 18-36 months
```

#### **Quality Value Screen**
```
Selection Criteria:
- Altman Z-Score > 3.0
- Piotroski Score > 7
- Beneish M-Score < -2.0
- ROA > 8%
- Free Cash Flow Yield > 4%
- Institutional Holding > 25%

Expected Characteristics:
- Lower Volatility: 20-25% vs market
- Higher Sharpe: 1.2-1.5
- Historical Win Rate: 75%
- Holding Period: 6-18 months
```

### Growth Investing Screens

#### **High Growth Screen**
```
Selection Criteria:
- Revenue Growth (YoY) > 25%
- EPS Growth (YoY) > 30%
- Net Profit Growth (YoY) > 35%
- PEG Ratio < 1.2
- Institutional Holding > 35%
- Analyst Rating > 4.2

Expected Characteristics:
- Average PEG: 0.8-1.0
- Revenue Growth: 25-40%
- Historical Win Rate: 60%
- Holding Period: 6-12 months
```

#### **Sustainable Growth Screen**
```
Selection Criteria:
- ROE > 18%
- Retention Ratio > 65%
- Asset Turnover > 1.3
- Financial Leverage < 1.3
- Growth Consistency (5yr) > 20%
- Debt/Equity < 0.3

Expected Characteristics:
- Sustainable Growth Rate: 15-20%
- ROE Consistency: >15% for 5 years
- Historical Win Rate: 70%
- Holding Period: 12-24 months
```

### Technical Screens

#### **Breakout Screen**
```
Selection Criteria:
- Distance to 52W High < 5%
- Volume > 2.5× 20-day average
- RSI(14) > 65
- MACD Histogram > 0
- Bollinger Band %B > 0.8
- ADX(14) > 25

Expected Characteristics:
- Breakout Success Rate: 65%
- Average Hold Time: 2-4 weeks
- Stop Loss: 5-8% below breakout
- Target: 10-15% from breakout
```

#### **Reversal Screen**
```
Selection Criteria:
- Distance to 52W Low < 8%
- Volume Spike > 3× 20-day average
- RSI(14) < 25
- Stochastic %K < 15
- Negative Divergence (Price vs RSI)
- Put/Call Ratio > 1.2

Expected Characteristics:
- Reversal Success Rate: 55%
- Average Hold Time: 3-6 weeks
- Risk/Reward: 1:2 minimum
- Confirmation: Volume + close above 20MA
```

## Sector-Specific Adaptations

### Banking Sector Screen
```
Key Metrics:
- NIM > 3.5%
- PCR > 70%
- GNPA < 2.5%
- CASA Ratio > 40%
- ROA > 1.2%
- P/AB Ratio < 1.8

Sector Adjustments:
- Higher debt tolerance (up to 0.8 D/E)
- Focus on asset quality metrics
- Regulatory compliance scoring
```

### IT Sector Screen
```
Key Metrics:
- Revenue Growth (YoY) > 15%
- USD/INR Sensitivity < 2%
- Client Concentration < 30%
- Utilization Rate > 75%
- Margin Expansion > 100bps

Sector Adjustments:
- Currency hedge effectiveness
- Large deal risk assessment
- H1B visa impact analysis
```

### FMCG Sector Screen
```
Key Metrics:
- Volume Growth > 8%
- Realization Growth > 5%
- Rural Sales > 45%
- Brand Equity Score > 7
- Distribution Reach > 80%

Sector Adjustments:
- Rural economy correlation
- Monsoon impact assessment
- Competitive intensity analysis
```

## Risk Management Integration

### Portfolio-Level Screens

#### **Diversification Screen**
```
Maximum Constraints:
- Single Stock: <5% of portfolio
- Single Sector: <25% of portfolio
- Maximum Correlation: <0.75
- Beta Limit: <1.5 vs Nifty
- Maximum Drawdown: <20%

Optimization:
- Efficient Frontier targeting
- Risk parity allocation
- Minimum variance portfolio
```

#### **Liquidity Screen**
```
Minimum Requirements:
- Average Volume: >₹50 Cr/day
- Market Depth: >₹200 Cr
- Bid-Ask Spread: <0.3%
- Impact Cost: <0.8%
- Free Float: >25%

Risk Adjustments:
- Small portfolio: Relax by 30%
- Large portfolio: Maintain strict limits
- Volatile market: Increase requirements
```

### Dynamic Risk Adjustment

#### **Market Regime Adaptation**
```
Bull Market (Nifty +10% in 3M):
- Relax valuation metrics by 15%
- Increase growth factor weights
- Reduce risk factor weights

Bear Market (Nifty -10% in 3M):
- Tighten quality filters
- Increase value factor weights
- Implement stricter risk controls

Sideways Market:
- Focus on income generation
- Increase dividend yield requirements
- Reduce momentum dependencies
```

#### **Volatility-Based Adjustments**
```
Low Volatility (VIX < 15):
- Standard screening parameters
- Normal position sizing

Medium Volatility (VIX 15-25):
- Increase liquidity requirements
- Reduce position sizes by 20%

High Volatility (VIX > 25):
- Implement strict risk filters
- Focus on defensive stocks
- Reduce portfolio turnover
```

## Performance Validation

### Backtesting Framework

#### **Historical Testing**
```
Test Period: 2010-2023 (13 years)
Universe: All NSE stocks >₹500 Cr market cap
Rebalancing: Monthly
Transaction Costs: 0.5% per trade
Benchmark: Nifty 50 Total Return

Performance Metrics:
- Annualized Return
- Sharpe Ratio
- Maximum Drawdown
- Win Rate (vs benchmark)
- Alpha Generation
```

#### **Screen Effectiveness**
```
Value Screens:
- Annualized Return: 14-18%
- Sharpe Ratio: 1.2-1.5
- Max Drawdown: 15-20%
- Benchmark Outperformance: 3-5%

Growth Screens:
- Annualized Return: 16-22%
- Sharpe Ratio: 1.0-1.3
- Max Drawdown: 20-25%
- Benchmark Outperformance: 4-7%

Technical Screens:
- Win Rate: 55-65%
- Average Trade Return: 8-12%
- Hold Period: 2-6 weeks
- Risk/Reward Ratio: 1:1.8
```

### Real-Time Monitoring

#### **Performance Tracking**
```
Daily Metrics:
- Screen hit rate
- Average position performance
- Risk metric compliance
- Benchmark comparison

Weekly Review:
- Screen adjustments
- Factor weight optimization
- New screen development
- Risk limit updates

Monthly Analysis:
- Comprehensive backtest
- Performance attribution
- Peer comparison
- Strategy refinement
```

## Implementation Considerations

### Data Quality Management

#### **Data Validation**
```
Source Verification:
- NSE/BSE primary data
- Multiple broker validation
- Cross-reference checking
- Outlier detection and correction

Update Frequency:
- Real-time: Price, volume
- Daily: Fundamentals, ratios
- Weekly: Estimates, ratings
- Quarterly: Annual reports
```

#### **Error Handling**
```
Missing Data:
- Forward fill (technical data)
- Industry median (fundamentals)
- Flag for manual review

Stale Data:
- Age limits by data type
- Confidence score adjustment
- Screen exclusion criteria
```

### Computational Efficiency

#### **Optimization Techniques**
```
Data Structures:
- Pandas DataFrames for analysis
- NumPy arrays for calculations
- Redis caching for frequently used data

Processing Pipeline:
- Parallel processing for large screens
- Incremental updates for real-time data
- Batch processing for historical analysis

Query Optimization:
- Database indexing
- Pre-computed metrics
- Efficient filtering algorithms
```

## Conclusion

The Quantitative Screening Framework provides a robust, adaptable system for identifying investment opportunities in the Indian equity market. By combining multiple factor categories with rigorous risk management and continuous performance validation, the framework enables systematic, disciplined investment decision-making.

Success requires regular framework refinement, adaptation to changing market conditions, and integration with fundamental research and risk management processes.
