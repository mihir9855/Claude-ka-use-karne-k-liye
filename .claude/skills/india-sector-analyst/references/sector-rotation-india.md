# Sector Rotation in Indian Markets - Methodology & Patterns

## Overview

Sector rotation refers to the cyclical movement of capital between different industry groups as the economic cycle progresses. Understanding these patterns helps traders anticipate which sectors will lead or lag the broader market.

## Economic Cycle Framework

### Four Stages of Market Cycle

#### **Early Bull Market (Recovery Phase)**
**Leading Sectors**: Banks, Auto, Realty, NBFCs
**Why**: Rate cut expectations drive financials, rural recovery boosts auto demand, real estate benefits from lower borrowing costs
**RS Characteristics**: Banks typically show RS > 80th percentile
**Duration**: 3-6 months after market bottom

#### **Mid Bull Market (Expansion Phase)**
**Leading Sectors**: IT, Metals, Capital Goods, Chemicals
**Why**: Economic growth drives corporate earnings, global demand boosts metals, infrastructure spending supports capital goods
**RS Characteristics**: IT and metals show strongest momentum
**Duration**: 6-12 months of bull run

#### **Late Bull Market (Euphoria Phase)**
**Leading Sectors**: FMCG, Pharma, Consumption
**Why**: Defensive rotation as market peaks, consumers shift to staples, pharma acts as safe haven
**RS Characteristics**: FMCG shows relative outperformance
**Duration**: Final 2-4 months before peak

#### **Bear Market (Recession Phase)**
**Leading Sectors**: Pharma, IT (as USD hedges), PSU stocks
**Why**: Pharma defensive in downturns, IT benefits from INR depreciation, PSUs seen as safe government backing
**RS Characteristics**: Pharma often shows RS > 60th percentile
**Duration**: Throughout bear market phase

## Detection Methodology

### Relative Strength Ranking
```
RS Score = (Sector Return - Nifty Return) × 100
RS Percentile = Rank position in universe of 13 sectors
```

**Interpretation**:
- **80th+ percentile**: Strong leadership, accumulation phase
- **60th-80th percentile**: Moderate strength, hold positions
- **40th-60th percentile**: Neutral, no action
- **20th-40th percentile**: Weakening, reduce exposure
- **<20th percentile**: Lagging, avoid/hedge

### Rotation Signal Generation

#### **Early Detection Indicators**
1. **RS Momentum**: Sector RS improving for 2+ weeks
2. **Volume Confirmation**: Sector ETF volume increasing
3. **FII Flows**: Positive FII flows into sector stocks
4. **Economic Data**: Leading indicators supporting sector

#### **Confirmation Signals**
1. **Breakout**: Sector index breaks above 20-day high
2. **Breadth**: >60% stocks in sector above 200 DMA
3. **RS Divergence**: Sector outperforms Nifty for 3+ days
4. **Macro Alignment**: Economic data supports sector thesis

## RBI Policy Impact on Sectors

### Rate Cut Environment (Dovish RBI)
**Beneficiaries**:
- **Banks (+3-5%)**: NIM expansion, lower funding costs
- **NBFCs (+2-4%)**: Cheaper borrowing, higher spreads
- **Auto (+2-3%)**: Lower EMI, higher vehicle financing
- **Realty (+2-3%)**: Reduced home loan rates
- **Capital Goods (+1-2%)**: Infrastructure project viability

**Detractors**:
- **PSU Banks (-1-2%)**: Compressed margins
- **Defensive Sectors**: Minimal impact

### Rate Hike Environment (Hawkish RBI)
**Beneficiaries**:
- **IT (+1-2%)**: INR depreciation benefits exporters
- **Pharma (+1-2%)**: USD hedging properties
- **FMCG (+0.5-1%)**: Pricing power in inflation

**Detractors**:
- **Banks (-2-4%)**: NIM compression, higher funding costs
- **Auto (-2-3%)**: Higher financing costs
- **Realty (-3-5%)**: Increased borrowing costs
- **NBFCs (-3-5%)**: Spread compression

## Commodity Impact Analysis

### Crude Oil Sensitivity Matrix

| Sector | Oil ↑ Impact | Oil ↓ Impact | Transmission Lag |
|--------|-------------|--------------|------------------|
| Energy | +++ | --- | Immediate |
| Metals | ++ | -- | 1-2 weeks |
| Chemicals | ++ | -- | 1-2 weeks |
| Auto | - | + | 2-4 weeks |
| FMCG | - | + | 1-2 months |
| IT/Pharma | Neutral | Neutral | N/A |

### Base Metal Cycle Impact
- **China Demand**: Steel, aluminum prices drive metal sector
- **Infrastructure**: Domestic construction activity
- **Global Growth**: Export demand for metal products

## Seasonal and Event-Based Rotations

### Monsoon Impact (June-September)
**Beneficiaries**: FMCG, Fertilizers, Agriculture
**Why**: Rural consumption, fertilizer demand, crop prices
**Historical Performance**: FMCG +2-3% during good monsoon

### Budget Season (January-February)
**Pre-Budget**: Broad market rally, infrastructure expectation
**Post-Budget**: Sector-specific rotation based on allocations
**Key Sectors**: Infrastructure, Defense, PSU stocks

### Election Cycle (Pre/Post Elections)
**Pre-Election**: Consumption, rural sectors benefit
**Post-Election**: Infrastructure, reforms drive capex
**Duration**: 3-6 months around election timing

## Implementation Framework

### Sector Rotation Strategy

#### **Entry Criteria**
1. **RS Threshold**: Sector RS > 70th percentile
2. **Trend Confirmation**: Sector above 50-day MA
3. **Volume**: Sector ETF volume > 20-day average
4. **Macro Alignment**: Economic data supports sector

#### **Position Sizing**
- **Strong Signal**: 20-30% portfolio in sector
- **Moderate Signal**: 10-20% portfolio
- **Weak Signal**: 5-10% portfolio or ETFs

#### **Exit Criteria**
1. **RS Breakdown**: RS drops below 50th percentile
2. **Trend Reversal**: Close below 50-day MA
3. **Macro Change**: Economic data contradicts thesis
4. **Time Stop**: Maximum 8-12 weeks holding

### Risk Management

#### **Diversification**
- **Maximum Sector Weight**: 25-30% of portfolio
- **Sector Count**: 3-5 sectors maximum
- **Correlation Check**: Avoid highly correlated sectors

#### **Stop Losses**
- **Individual Stock**: 8-10% below entry
- **Sector Level**: 15-20% drawdown triggers reduction
- **Portfolio Level**: 10-15% drawdown triggers hedging

## Historical Performance Analysis

### Bull Market Rotations (2019-2021)
- **Early Phase**: Banks led (RS 85th percentile)
- **Mid Phase**: IT/Metals strongest (RS 90th+ percentile)
- **Late Phase**: FMCG defensive rotation (RS 75th percentile)

### Bear Market Rotations (2022)
- **Pharma Leadership**: Maintained RS > 60th percentile
- **IT Resilience**: Benefited from INR depreciation
- **PSU Outperformance**: Government backing provided safety

### Recovery Patterns (2023)
- **Banking First**: Rate cut expectations drove 40% gains
- **Auto Follow-through**: Rural recovery boosted demand
- **IT Catch-up**: USD strength supported earnings

## Integration with Other Analysis

### Technical Analysis
- **Support/Resistance**: Sector index key levels
- **Momentum Indicators**: RSI, MACD on sector ETFs
- **Volume Analysis**: Sector ETF trading volume

### Fundamental Analysis
- **Earnings Season**: Sector earnings momentum
- **Valuation Metrics**: Sector P/E vs historical averages
- **Growth Rates**: Sector revenue/EPS growth trends

### Macro Integration
- **GDP Correlation**: Sector sensitivity to economic growth
- **Inflation Impact**: Sector exposure to cost pressures
- **Currency Effect**: Import/export oriented sectors

## Tools and Implementation

### NSE Sectoral Indices
- **Real-time Tracking**: All 13 indices available
- **Historical Data**: 2+ years for backtesting
- **Constituents**: Individual stock level analysis

### ETFs for Trading
- **Sector ETFs**: Available for major sectors
- **Leveraged Products**: For short-term positioning
- **International Exposure**: For global sector comparison

### Options Strategies
- **Sector Index Options**: For directional bets
- **Calendar Spreads**: For volatility plays
- **Sector Pairs**: Long strong vs short weak sector

## Conclusion

Sector rotation analysis provides a powerful framework for understanding market leadership and anticipating capital flows. By combining relative strength analysis with macro economic insights, traders can position themselves advantageously across different market cycles.

Key success factors include early detection of rotations, proper position sizing, and strict risk management discipline.
