# NSE Pair Trading Considerations

## NSE Market Structure
The National Stock Exchange of India has unique characteristics that affect pair trading strategies. Understanding these factors is crucial for successful implementation.

## Liquidity Considerations

### 1. Trading Volumes
- **Nifty 50**: High liquidity, tight spreads
- **Nifty 500**: Moderate to high liquidity
- **Small Cap**: Low liquidity, wider spreads
- **Avoid**: Stocks with average volume < 100,000 shares/day

### 2. Impact Cost
- NSE impact cost typically 0.1-0.5% for large orders
- Higher for illiquid stocks (1-2%)
- Consider in position sizing calculations

### 3. Market Hours
- Regular session: 9:15 AM - 3:30 PM IST
- Pre-open: 9:00-9:15 AM (order collection)
- Post-close: Order matching till 3:40 PM
- Best execution during 10:00 AM - 2:30 PM

## Transaction Costs

### 1. Brokerage Charges
- Intraday: ₹0.0001 per share or 0.01% (whichever higher)
- Delivery: 0.1-0.5% depending on broker
- Pair trades: Double the costs (entry + exit)

### 2. Other Costs
- **STT**: 0.025% on sell side for intraday
- **GST**: 18% on brokerage
- **SEBI Charges**: ₹0.000001 per ₹100 turnover
- **Stamp Duty**: 0.003% on buy side

### 3. Total Cost Estimate
For ₹1 lakh pair trade (round trip):
- Brokerage: ₹20-50
- STT: ₹12.50
- GST: ₹7-9
- Other charges: ₹1-2
- **Total**: ₹40-75 (0.04-0.075%)

## Sector-Specific Factors

### 1. Banking Sector
- High correlation within sector
- Sensitive to interest rate changes
- Good for pair trading during rate cycles

### 2. IT Sector
- Dollar revenue exposure
- Correlation with USD/INR
- Good pairs: TCS vs Infosys, Wipro vs HCL

### 3. PSU Stocks
- Government policy sensitivity
- Lower correlation with private sector
- Pairs: Coal India vs NTPC, SBI vs PNB

### 4. Auto Sector
- Commodity price sensitivity
- Rural demand correlation
- Pairs: Maruti vs Tata Motors

## Risk Factors Specific to NSE

### 1. Circuit Breakers
- Price bands: ±5%, ±10%, ±20%
- Can prevent mean reversion during extreme moves
- Monitor during high volatility periods

### 2. Corporate Actions
- **Stock Splits**: Adjust pair ratios
- **Bonus Issues**: Recalculate hedge ratios
- **Mergers/Acquisitions**: Can break pair relationships

### 3. Index Rebalancing
- Quarterly Nifty rebalancing
- Can cause temporary dislocations
- Avoid trading around rebalancing dates

### 4. F&O Expiry
- Increased volatility on expiry days
- Gamma effects on underlying stocks
- Higher spreads and lower liquidity

## Data and Technology

### 1. Data Sources
- **NSE Website**: Historical data (free, delayed)
- **Data Vendors**: Bloomberg, Refinitiv, Zerodha Kite
- **Frequency**: 1-minute to daily data
- **Lookback**: Minimum 2 years for statistical testing

### 2. Execution Platforms
- **Discount Brokers**: Zerodha, Upstox, Angel One
- **Full-service Brokers**: ICICI Direct, HDFC Securities
- **Algo Platforms**: QuantConnect, Quantopian (international)
- **Indian Platforms**: Smallcase, Kuvera

### 3. Technology Stack
- **Python**: Primary language for analysis
- **Database**: PostgreSQL/MySQL for data storage
- **Real-time Feeds**: WebSocket connections
- **Order Management**: REST APIs or FIX protocol

## Regulatory Considerations

### 1. Position Limits
- No specific pair trading limits
- General position limits apply
- Report large positions if required

### 2. Pattern Day Trading
- No restrictions like US markets
- Can trade multiple pairs daily
- Monitor for pattern recognition

### 3. Taxation
- **Short-term**: 15% on profits
- **Long-term**: 10% (if held >1 year)
- **Indexation**: Not available for STT paid stocks

## Best Practices for NSE

### 1. Pair Selection
- Focus on liquid large/mid-cap stocks
- Test pairs over multiple market cycles
- Monitor correlation stability quarterly

### 2. Position Management
- Start with small positions (₹50k-1 lakh per pair)
- Scale up based on performance
- Maximum 5-10 pairs in portfolio

### 3. Timing
- Avoid first 30 minutes (high volatility)
- Best execution: 11:00 AM - 2:00 PM
- Monitor during budget/earnings seasons

### 4. Monitoring
- Real-time spread tracking
- Alert systems for signal generation
- Daily P&L and risk reports

## Performance Benchmarks
- **Target Returns**: 15-25% annually
- **Sharpe Ratio**: >1.5
- **Win Rate**: 65-75%
- **Max Drawdown**: <10%

## Common Pitfalls
- Ignoring transaction costs in backtesting
- Trading illiquid stock pairs
- Not adjusting for corporate actions
- Overtrading during volatile periods
- Poor risk management leading to large losses
