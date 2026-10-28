# India Sector Analyst - NSE Sector Rotation Analysis

## Overview

The India Sector Analyst provides comprehensive analysis of NSE sectoral indices to identify rotation patterns, relative strength, and market cycle positioning. This skill analyzes all major NSE sectoral indices to help traders understand which sectors are leading or lagging the broader market.

## Core Capabilities

### Sector Performance Ranking
- **Multi-timeframe Analysis**: Rank sectors by 1-week, 1-month, and 3-month performance
- **Relative Strength**: Calculate sector performance vs Nifty 50 benchmark
- **Sector Rotation Detection**: Identify leadership changes between sectors

### Cycle Analysis
- **Market Cycle Positioning**: Classify sectors as early/mid/late cycle
- **Sector Breadth**: Compare internal strength within sectors
- **Breakout/Breakdown Detection**: Identify sector-level trend changes

### Macro Impact Mapping
- **RBI Policy Impact**: How rate decisions affect different sectors
- **Crude Oil Sensitivity**: Energy and import-dependent sector analysis
- **Economic Indicators**: GDP, inflation impact on sector performance

## NSE Sectoral Indices Covered

| Sector Index | Stocks | Key Drivers |
|-------------|---------|-------------|
| Nifty Bank | 12 | HDFC Bank, ICICI Bank, SBI, Kotak Mahindra - Interest rates, credit growth |
| Nifty IT | 10 | TCS, Infosys, Wipro, HCL - USD/INR, global IT spending |
| Nifty Pharma | 20 | Sun Pharma, Dr Reddy's, Cipla - Drug pricing, FDA approvals |
| Nifty Auto | 15 | Maruti, Tata Motors, M&M - Rural demand, interest rates |
| Nifty Metal | 15 | Tata Steel, JSW Steel, Hindalco - Global metal prices, China demand |
| Nifty Realty | 10 | DLF, Godrej Properties - Interest rates, affordability |
| Nifty Energy | 10 | Reliance, NTPC, Coal India - Oil prices, power demand |
| Nifty FMCG | 15 | HUL, ITC, Nestle - Rural consumption, monsoon |
| Nifty PSE | 20 | Coal India, NTPC, Power Grid - Government capex, reforms |
| Nifty Media | 11 | Zee Entertainment, PVR - Advertising, OTT growth |
| Nifty Infra | 30 | Larsen & Toubro, GMR - Infrastructure spending |
| Nifty Financial Services | 20 | HDFC, ICICI, SBI - Interest rates, financial inclusion |

## Analysis Framework

### Relative Strength Calculation
```
RS Score = (Sector Return - Nifty Return) × 100
RS Percentile = Position in sector universe (0-100)
```

### Sector Rotation Signals
- **Early Cycle**: Banks, Auto, Realty lead on rate cut expectations
- **Mid Cycle**: IT, Metals, Capital Goods on earnings growth
- **Late Cycle**: FMCG, Pharma as defensive rotation
- **Bear Market**: Pharma, IT as safe havens

### Macro Impact Matrix

| Sector | RBI Rate Cut | RBI Rate Hike | Crude Oil ↑ | INR Weakens |
|--------|--------------|---------------|-------------|-------------|
| Banks | +++ | --- | - | + |
| IT | + | - | - | +++ |
| Pharma | + | - | - | +++ |
| Auto | +++ | --- | --- | - |
| Metals | + | - | +++ | - |
| Energy | - | + | +++ | - |
| FMCG | ++ | - | - | - |

## Implementation Details

### Data Sources
- **NSE Sectoral Indices**: Real-time values and historical data
- **Constituent Stocks**: Individual stock performance within sectors
- **Macro Indicators**: RBI policy, crude oil, currency data

### Analysis Frequency
- **Intraday**: Real-time sector performance monitoring
- **Daily**: End-of-day ranking and rotation analysis
- **Weekly**: Sector momentum and cycle positioning
- **Monthly**: Long-term sector trends and macro impacts

### Risk Management
- **Diversification**: Avoid over-concentration in single sector
- **Timing**: Enter sectors at rotation beginnings, exit at peaks
- **Macro Alignment**: Trade sectors in direction of macro winds

## Usage Examples

### Sector Rotation Strategy
```
Current Setup: Banks leading (RS > 80th percentile)
Signal: Rotate into Auto/Realty if RBI cuts rates
Entry: When sector breaks above 20-day high with volume
Exit: When RS drops below 50th percentile or sector weakens
```

### Macro-Driven Sector Trades
```
RBI Meeting: Dovish stance expected
Target Sectors: Banks (+3-5%), NBFCs (+2-4%), Auto (+2-3%)
Position Sizing: 20-30% in financials, 10-15% in cyclicals
```

### Sector Breadth Analysis
```
Sector Health Check:
- >70% stocks above 200 DMA: Strong uptrend
- 40-70% stocks above 200 DMA: Moderate trend
- <40% stocks above 200 DMA: Weak/correcting
```

## Integration Points

### With Other Skills
- **FII/DII Flow Tracker**: Correlate sector flows with performance
- **India Macro Monitor**: Align sector trades with macro regime
- **India Breadth Analyst**: Use sector breadth for timing
- **VCP Scanner**: Find individual stocks in strong sectors

### Trading Applications
- **Sector ETFs**: Direct exposure to sector performance
- **Sector Stocks**: Individual stock selection within strong sectors
- **Options Strategies**: Sector index options for leveraged exposure
- **Pairs Trading**: Long strong sector vs short weak sector

## Performance Expectations

### Historical Sector Rotation
- **Success Rate**: 65-75% when entering leading sectors
- **Holding Period**: 2-8 weeks depending on cycle phase
- **Risk-Adjusted Returns**: 15-25% annualized in bull markets

### Risk Metrics
- **Maximum Drawdown**: 15-25% in sector-specific corrections
- **Win Rate**: 60-70% with proper entry/exit timing
- **Sharpe Ratio**: 1.2-1.8 depending on market conditions

## Conclusion

The India Sector Analyst provides crucial insights into market leadership and rotation patterns. By understanding which sectors are gaining or losing relative strength, traders can position themselves advantageously in the direction of market momentum while managing macro risks effectively.

Key success factors include timing entries at rotation beginnings, maintaining diversification across sectors, and aligning trades with broader macro trends.
