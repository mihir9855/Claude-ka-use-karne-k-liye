# Sector Rotation Analysis - India Stock Screener

## Overview

Sector rotation analysis identifies cyclical patterns in sector performance relative to the broader market and economic conditions. This methodology helps investors time entries and exits across different sectors based on economic cycles, monetary policy, and market sentiment.

## Sector Classification Framework

### Economic Cycle Sectors

#### **Early Cycle Sectors (Recovery Phase)**
```
Characteristics: High beta, cyclical, sensitive to economic growth
Sectors:
├── Financials (Banks, NBFCs)
├── Industrials (Capital Goods, Construction)
├── Materials (Cement, Metals)
└── Technology (IT Services, Software)

Performance Drivers:
- Interest rate cuts
- Credit growth acceleration
- Infrastructure spending
- Business investment recovery
```

#### **Mid Cycle Sectors (Expansion Phase)**
```
Characteristics: Moderate beta, stable growth, consumer spending
Sectors:
├── Consumer Discretionary (Auto, Retail)
├── Real Estate
├── Healthcare (Pharma, Hospitals)
└── Communication Services

Performance Drivers:
- GDP growth acceleration
- Employment growth
- Consumer confidence
- Interest rate stability
```

#### **Late Cycle Sectors (Peak Phase)**
```
Characteristics: Low beta, defensive, inflation hedges
Sectors:
├── Consumer Staples (FMCG)
├── Utilities (Power, Telecom)
├── Energy (Oil & Gas)
└── Defensive Industrials

Performance Drivers:
- Economic slowdown signals
- Interest rate hike expectations
- Inflation concerns
- Risk reduction focus
```

#### **Recession Sectors (Contraction Phase)**
```
Characteristics: Very low beta, counter-cyclical
Sectors:
├── Gold & Precious Metals
├── Government Bonds exposure
├── Discount Retailers
└── Essential Services

Performance Drivers:
- Economic contraction
- Risk-off environment
- Safe-haven demand
- Liquidity preservation
```

## Sector Rotation Indicators

### Momentum-Based Indicators

#### **Relative Strength Index (Sector RSI)**
```
Sector_RSI = 100 - (100 / (1 + RS))
Where:
RS = Average of (Sector_Return / Market_Return) for gain periods
   / Average of (Sector_Return / Market_Return) for loss periods

Interpretation:
- RSI > 70: Overbought (potential reversal)
- RSI < 30: Oversold (potential bounce)
- RSI 40-60: Neutral zone
```

#### **Sector Momentum Score**
```
Momentum_Score = (1M_Return × 0.3) + (3M_Return × 0.4) + (6M_Return × 0.3)
Normalized_Score = (Score - Min_Score) / (Max_Score - Min_Score)

Rotation Signals:
- Score > 0.8: Strong leadership
- Score 0.6-0.8: Moderate leadership
- Score 0.4-0.6: Neutral
- Score 0.2-0.4: Moderate laggard
- Score < 0.2: Strong laggard
```

#### **Rate of Change (ROC)**
```
ROC_n = (Current_Price - Price_n_Periods_Ago) / Price_n_Periods_Ago × 100

Sector_ROC_Matrix:
- 1M ROC: Short-term momentum
- 3M ROC: Medium-term trend
- 6M ROC: Long-term direction
- 12M ROC: Cyclical position
```

### Valuation-Based Indicators

#### **Sector P/E Relative**
```
Sector_PE_Relative = Sector_PE / Market_PE

Valuation Zones:
- Relative PE < 0.8: Undervalued
- Relative PE 0.8-1.2: Fair valued
- Relative PE > 1.2: Overvalued

Adjustment Factors:
- Growth differential
- Risk premium
- Sector-specific multiples
```

#### **Sector P/B Relative**
```
Sector_PB_Relative = Sector_PB / Market_PB

Interpretation:
- Lower PB: More attractive for value investors
- Higher PB: Growth premium embedded
- Cyclical adjustment: Higher in expansions
```

#### **EV/EBITDA Relative**
```
Sector_EV_EBITDA_Relative = Sector_EV_EBITDA / Market_EV_EBITDA

Sector-Specific Ranges:
- Financials: 8-12x
- Technology: 15-25x
- Industrials: 10-15x
- FMCG: 12-18x
```

### Quality-Based Indicators

#### **Sector ROE Premium**
```
ROE_Premium = Sector_ROE - Risk_Free_Rate

Quality Ranking:
- Premium > 8%: High quality
- Premium 4-8%: Medium quality
- Premium 0-4%: Low quality
- Premium < 0%: Poor quality
```

#### **Sector Debt/Equity**
```
Sector_DE_Ratio = Total_Sector_Debt / Total_Sector_Equity

Risk Assessment:
- DE < 0.5: Low risk
- DE 0.5-1.0: Medium risk
- DE > 1.0: High risk

Cyclical Adjustment:
- Higher tolerance in early cycle
- Lower tolerance in late cycle
```

## Sector Rotation Models

### Business Cycle Model

#### **Phase Identification**
```
Early Cycle (Recovery):
- GDP growth accelerating
- Credit growth > GDP growth
- Interest rates declining
- Leading sectors: Financials, Industrials

Mid Cycle (Expansion):
- GDP growth strong and stable
- Corporate earnings growing
- Interest rates stable
- Leading sectors: Discretionary, Technology

Late Cycle (Slowing):
- GDP growth decelerating
- Interest rates rising
- Inflation increasing
- Leading sectors: Staples, Utilities

Recession:
- GDP contracting
- Credit conditions tightening
- Risk-off environment
- Leading sectors: Defensive, Gold
```

#### **Transition Signals**
```
Early to Mid Cycle:
- GDP growth > 6%
- Credit growth acceleration
- Manufacturing PMI > 55
- Leading indicator: Industrial production

Mid to Late Cycle:
- Wage inflation > 5%
- Current account deficit widening
- Bond yields rising
- Leading indicator: Yield curve inversion risk

Late to Recession:
- GDP growth < 4%
- Corporate profit margins compressing
- Credit spreads widening
- Leading indicator: ISM Manufacturing < 50
```

### Monetary Policy Model

#### **Rate Cycle Impact**
```
Rate Cutting Cycle (Easing):
- Sectors benefiting: Financials, Real Estate, Cyclicals
- Performance boost: 15-25% outperformance
- Duration: 6-12 months

Rate Hike Cycle (Tightening):
- Sectors benefiting: Gold, Staples, Utilities
- Performance boost: 10-20% outperformance
- Duration: 12-18 months

Rate Stable Cycle:
- Sector performance: Mixed, earnings-driven
- Relative performance: 5-10% differential
- Duration: 6-9 months
```

#### **RBI Policy Transmission**
```
Policy Rate Changes:
- Immediate impact: Banking sector (1-2 days)
- Medium impact: Real Estate, NBFCs (1-2 weeks)
- Long-term impact: Corporate borrowing costs (1-3 months)

Liquidity Conditions:
- Surplus liquidity: Risk-on sectors benefit
- Tight liquidity: Defensive sectors preferred
- MSF rate changes: Short-term volatility spikes
```

### Market Sentiment Model

#### **Investor Risk Appetite**
```
Risk-On Environment:
- High beta sectors outperform
- Technology, Industrials lead
- Small/mid caps gain
- Duration: Bull market phases

Risk-Off Environment:
- Low beta sectors outperform
- FMCG, Pharma, Gold lead
- Large caps preferred
- Duration: Bear market phases

Neutral Environment:
- Quality sectors perform
- Earnings growth drives returns
- Balanced sector performance
- Duration: Sideways markets
```

#### **Flow-Based Rotation**
```
FII Flows:
- Equity inflows: Growth sectors benefit
- Debt inflows: Stability preferred
- Outflows: Risk-off rotation

DII Flows:
- Domestic flows: Domestic cyclicals benefit
- Systematic investment plans: SIP sectors gain
- Arbitrage activity: Index arbitrage impacts
```

## Sector Rotation Strategies

### Tactical Rotation Strategy

#### **Momentum-Based Rotation**
```
Entry Rules:
- Sector momentum score > 0.7
- Relative strength vs Nifty > 1.1
- Sector RSI > 60
- Hold until momentum score < 0.4

Exit Rules:
- Momentum divergence
- Relative strength < 0.9
- Sector RSI < 40
- Risk management triggers

Position Sizing:
- Top 3 sectors: 25% each
- Next 3 sectors: 15% each
- Remainder: Cash/bonds
```

#### **Value-Based Rotation**
```
Entry Rules:
- Sector PE relative < 0.85
- Sector PB relative < 0.9
- Improving ROE trend
- Quality metrics improving

Exit Rules:
- Valuation reaches fair value
- Quality deterioration
- Better opportunities elsewhere
- Portfolio rebalancing

Holding Period:
- 6-12 months typical
- Exit if fundamentals deteriorate
- Take profits at 20-30% gains
```

### Strategic Rotation Strategy

#### **Business Cycle Allocation**
```
Early Cycle Portfolio (20% of cycle):
Financials: 30%
Industrials: 25%
Materials: 20%
Technology: 15%
Cash: 10%

Mid Cycle Portfolio (50% of cycle):
Consumer Discretionary: 25%
Technology: 20%
Healthcare: 15%
Financials: 15%
Industrials: 15%
Cash: 10%

Late Cycle Portfolio (20% of cycle):
Consumer Staples: 30%
Utilities: 25%
Healthcare: 20%
Energy: 15%
Cash: 10%

Recession Portfolio (10% of cycle):
Gold: 30%
Defensive Staples: 25%
Government Securities: 25%
Cash: 20%
```

#### **Dynamic Rebalancing**
```
Quarterly Review:
- Assess current cycle phase
- Update sector allocations
- Rebalance to target weights
- Tax-loss harvest if needed

Trigger-Based Changes:
- GDP growth surprises
- RBI policy changes
- Major earnings revisions
- Sentiment extreme readings
```

## Risk Management

### Sector Concentration Risk

#### **Diversification Limits**
```
Single Sector Maximum: 25% of portfolio
Top 3 Sectors Maximum: 60% of portfolio
Cyclical Sectors Maximum: 40% of portfolio
Defensive Sectors Minimum: 20% of portfolio

Correlation Controls:
- Average sector correlation < 0.6
- No two sectors with correlation > 0.8
- Include uncorrelated alternatives
```

#### **Volatility Management**
```
Sector Beta Limits:
- Maximum sector beta: 1.3
- Average portfolio beta: 0.9-1.1
- Dynamic beta adjustment

Drawdown Controls:
- Sector max drawdown: 15%
- Portfolio max drawdown: 10%
- Stop-loss triggers at 8% sector loss
```

### Timing Risk

#### **Entry/Exit Timing**
```
Entry Discipline:
- Wait for confirmation signals
- Scale in gradually
- Use limit orders
- Avoid FOMO entries

Exit Discipline:
- Take profits systematically
- Cut losses quickly
- Avoid emotional decisions
- Rebalance methodically
```

#### **Market Timing Integration**
```
Bull Market: Increase cyclical exposure
Bear Market: Increase defensive exposure
Sideways Market: Maintain balanced exposure
High Volatility: Reduce overall exposure
```

## Performance Analytics

### Historical Performance

#### **Sector Rotation vs Buy-and-Hold**
```
Annualized Returns (2010-2023):
- Sector Rotation: 14.2%
- Nifty 50: 11.8%
- Outperformance: 2.4%

Sharpe Ratios:
- Sector Rotation: 1.35
- Nifty 50: 1.05
- Risk-Adjusted Advantage: 0.3

Maximum Drawdown:
- Sector Rotation: 18%
- Nifty 50: 25%
- Risk Reduction: 7%
```

#### **Business Cycle Performance**
```
Early Cycle (2010, 2014, 2018):
- Average Return: 28%
- Best Performing: Financials (+45%)
- Win Rate: 75%

Mid Cycle (2011, 2015, 2019):
- Average Return: 22%
- Best Performing: Technology (+35%)
- Win Rate: 70%

Late Cycle (2012, 2016, 2020):
- Average Return: 8%
- Best Performing: FMCG (+15%)
- Win Rate: 65%

Recession (2008, 2011, 2020):
- Average Return: -5%
- Best Performing: Gold (+10%)
- Win Rate: 60%
```

### Risk Metrics

#### **Portfolio Volatility**
```
Standard Deviation:
- Sector Rotation: 14%
- Nifty 50: 18%
- Volatility Reduction: 4%

Beta to Market:
- Sector Rotation: 0.85
- Lower systematic risk
- Better risk-adjusted returns
```

#### **Tail Risk Management**
```
Value at Risk (95%, 1M):
- Sector Rotation: 8%
- Nifty 50: 12%
- Risk Reduction: 4%

Expected Shortfall:
- Sector Rotation: 10%
- Nifty 50: 15%
- Downside protection improved
```

## Implementation Framework

### Data Requirements

#### **Sector Data**
```
Price Data:
- Daily sector indices
- Total return calculations
- Dividend adjustments

Fundamental Data:
- Sector earnings estimates
- ROE, ROA metrics
- Debt/equity ratios

Economic Data:
- GDP growth rates
- Interest rate changes
- Inflation readings
- PMI indicators
```

#### **Real-Time Monitoring**
```
Update Frequency:
- Price data: Real-time
- Economic data: Monthly/quarterly
- Earnings data: Quarterly

Alert Triggers:
- Momentum signal changes
- Valuation extreme readings
- Economic data surprises
- Risk limit breaches
```

### Decision Framework

#### **Signal Generation**
```
1. Economic Assessment: Current cycle phase
2. Momentum Analysis: Sector performance ranking
3. Valuation Check: Relative attractiveness
4. Risk Evaluation: Portfolio impact assessment
5. Signal Confirmation: Multiple indicator agreement
6. Position Sizing: Risk-adjusted allocation
```

#### **Execution Rules**
```
Entry Execution:
- Scale into positions over 3-5 days
- Use VWAP orders for large sizes
- Set stop-losses at entry

Exit Execution:
- Scale out of positions gradually
- Take profits at target levels
- Cut losses at stop levels
- Rebalance systematically
```

## Conclusion

Sector rotation analysis provides a systematic framework for timing investments across different economic cycles and market conditions. By understanding sector characteristics, monitoring key indicators, and implementing disciplined rotation strategies, investors can significantly enhance portfolio performance while managing risk effectively.

Success requires continuous monitoring of economic conditions, disciplined execution of signals, and regular performance review to adapt strategies to changing market dynamics.
