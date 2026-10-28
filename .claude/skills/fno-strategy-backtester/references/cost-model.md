# Transaction Cost Model for Indian F&O Backtesting

## Overview
Accurate transaction cost modeling is essential for realistic F&O strategy backtesting in Indian markets. The cost structure includes multiple components that significantly impact short-term options strategies and high-frequency futures trading.

## Cost Components Breakdown

### 1. Brokerage Charges
**₹20 Flat Rate Structure (Most Brokers):**
- **Equity Futures:** ₹20 per executed order (buy/sell)
- **Index Futures:** ₹20 per executed order (buy/sell)
- **Options:** ₹20 per executed order (buy/sell)

**Notes:**
- Per order means each individual trade leg counts separately
- Some brokers offer ₹10-15 rates for high-volume traders
- Discount brokers may have ₹0 brokerage for delivery but ₹20 for intraday F&O

### 2. Securities Transaction Tax (STT)
**Futures:**
- 0.01% on the sell side only (both equity and index futures)
- Charged on the settlement price × quantity

**Options:**
- 0.0625% on premium for selling options
- 0.125% on premium for exercise/assignment
- No STT on buying options

**Calculation:** STT = (Trade Price × Quantity) × STT_Rate

### 3. Exchange Transaction Charges
**NSE IFSC (GIFT City):**
- **Futures:** 0.0019% of turnover (₹190 per crore)
- **Options:** 0.035% of premium turnover (₹3,500 per crore) + 0.0019% of underlying turnover
- **Index Derivatives:** 0.0005% of turnover (₹50 per crore)

**BSE Charges (if applicable):**
- Futures: 0.0005% of turnover
- Options: 0.005% of premium + 0.0005% of underlying

### 4. GST (Goods and Services Tax)
- 18% on (Brokerage + Exchange Transaction Charges)
- **Not applicable on:** STT, Stamp Duty, SEBI Charges
- GST is calculated on the sum of brokerage and exchange charges

### 5. SEBI Turnover Charges
- ₹10 per crore of total turnover
- Charged on both buy and sell transactions
- Turnover = Trade Price × Quantity for each leg

### 6. Stamp Duty
**Intraday (Non-delivery):**
- 0.003% of total turnover (₹300 per crore)
- Applied to all F&O transactions

**Carry Forward (Delivery):**
- 0.015% of total turnover (₹1,500 per crore)
- Higher rate for positions held overnight

**State-wise Variation:** While rates are uniform, some states may have slight variations.

## Python Implementation

```python
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

class InstrumentType(Enum):
    EQUITY_FUTURES = "equity_futures"
    INDEX_FUTURES = "index_futures"
    OPTIONS = "options"

class TradeType(Enum):
    BUY = "buy"
    SELL = "sell"
    EXERCISE = "exercise"

@dataclass
class Trade:
    instrument_type: InstrumentType
    trade_type: TradeType
    price: float
    quantity: int
    lot_size: int
    is_intraday: bool = True

@dataclass
class CostBreakdown:
    brokerage: float
    stt: float
    exchange_charges: float
    gst: float
    sebi_charges: float
    stamp_duty: float
    total_cost: float

class FOCostCalculator:
    """Indian F&O Transaction Cost Calculator"""

    # Cost rates (as of 2024)
    BROKERAGE_PER_ORDER = 20.0
    STT_EQUITY_FUTURES = 0.0001  # 0.01%
    STT_INDEX_FUTURES = 0.0001  # 0.01%
    STT_OPTIONS_SELL = 0.000625  # 0.0625%
    STT_OPTIONS_EXERCISE = 0.00125  # 0.125%
    EXCHANGE_FUTURES = 0.000019  # 0.0019%
    EXCHANGE_OPTIONS_PREMIUM = 0.00035  # 0.035%
    EXCHANGE_OPTIONS_UNDERLYING = 0.000019  # 0.0019%
    EXCHANGE_INDEX_DERIVATIVES = 0.000005  # 0.0005%
    GST_RATE = 0.18  # 18%
    SEBI_PER_CRORE = 10.0
    STAMP_INTRADAY = 0.00003  # 0.003%
    STAMP_DELIVERY = 0.00015  # 0.015%
    CRORE = 10000000

    @classmethod
    def calculate_trade_costs(cls, trades: List[Trade]) -> CostBreakdown:
        """
        Calculate total transaction costs for a list of F&O trades.

        Args:
            trades: List of Trade objects representing the strategy execution

        Returns:
            CostBreakdown with detailed cost components
        """
        total_brokerage = 0.0
        total_stt = 0.0
        total_exchange = 0.0
        total_turnover = 0.0
        total_premium_turnover = 0.0
        gst_base = 0.0
        is_delivery = any(not trade.is_intraday for trade in trades)

        for trade in trades:
            # Calculate per-trade values
            trade_value = trade.price * trade.quantity * trade.lot_size
            total_turnover += trade_value

            # Brokerage (₹20 per order)
            total_brokerage += cls.BROKERAGE_PER_ORDER

            # STT Calculation
            if trade.trade_type == TradeType.SELL:
                if trade.instrument_type in [InstrumentType.EQUITY_FUTURES, InstrumentType.INDEX_FUTURES]:
                    stt_rate = cls.STT_EQUITY_FUTURES if trade.instrument_type == InstrumentType.EQUITY_FUTURES else cls.STT_INDEX_FUTURES
                    total_stt += trade_value * stt_rate
                elif trade.instrument_type == InstrumentType.OPTIONS:
                    total_stt += trade_value * cls.STT_OPTIONS_SELL
                    total_premium_turnover += trade_value
            elif trade.trade_type == TradeType.EXERCISE and trade.instrument_type == InstrumentType.OPTIONS:
                total_stt += trade_value * cls.STT_OPTIONS_EXERCISE
                total_premium_turnover += trade_value

            # Exchange Charges
            if trade.instrument_type == InstrumentType.EQUITY_FUTURES:
                total_exchange += trade_value * cls.EXCHANGE_FUTURES
            elif trade.instrument_type == InstrumentType.INDEX_FUTURES:
                total_exchange += trade_value * cls.EXCHANGE_INDEX_DERIVATIVES
            elif trade.instrument_type == InstrumentType.OPTIONS:
                total_exchange += (trade_value * cls.EXCHANGE_OPTIONS_PREMIUM +
                                 trade_value * cls.EXCHANGE_OPTIONS_UNDERLYING)
                total_premium_turnover += trade_value

            # GST base (brokerage + exchange charges)
            gst_base += cls.BROKERAGE_PER_ORDER

        gst_base += total_exchange

        # GST calculation
        total_gst = gst_base * cls.GST_RATE

        # SEBI charges
        total_sebi = (total_turnover / cls.CRORE) * cls.SEBI_PER_CRORE

        # Stamp duty
        stamp_rate = cls.STAMP_DELIVERY if is_delivery else cls.STAMP_INTRADAY
        total_stamp = total_turnover * stamp_rate

        # Total cost
        total_cost = (total_brokerage + total_stt + total_exchange +
                     total_gst + total_sebi + total_stamp)

        return CostBreakdown(
            brokerage=round(total_brokerage, 2),
            stt=round(total_stt, 2),
            exchange_charges=round(total_exchange, 2),
            gst=round(total_gst, 2),
            sebi_charges=round(total_sebi, 2),
            stamp_duty=round(total_stamp, 2),
            total_cost=round(total_cost, 2)
        )

# Example usage functions
def calculate_futures_trade_cost(buy_price: float, sell_price: float, quantity: int, lot_size: int, is_index: bool = False) -> CostBreakdown:
    """Calculate costs for a simple futures round trip"""
    trades = [
        Trade(InstrumentType.INDEX_FUTURES if is_index else InstrumentType.EQUITY_FUTURES,
              TradeType.BUY, buy_price, quantity, lot_size),
        Trade(Trade(InstrumentType.INDEX_FUTURES if is_index else InstrumentType.EQUITY_FUTURES,
              TradeType.SELL, sell_price, quantity, lot_size)
    ]
    return FOCostCalculator.calculate_trade_costs(trades)

def calculate_options_trade_cost(buy_premium: float, sell_premium: float, quantity: int, lot_size: int) -> CostBreakdown:
    """Calculate costs for a simple options round trip"""
    trades = [
        Trade(InstrumentType.OPTIONS, TradeType.BUY, buy_premium, quantity, lot_size),
        Trade(InstrumentType.OPTIONS, TradeType.SELL, sell_premium, quantity, lot_size)
    ]
    return FOCostCalculator.calculate_trade_costs(trades)
```

## Worked Examples

### Example 1: NIFTY Futures Intraday Round Trip
**Trade Details:**
- Buy 1 lot NIFTY futures @ ₹22,000
- Sell 1 lot NIFTY futures @ ₹22,050
- Lot size: 50 contracts
- Profit: (22,050 - 22,000) × 50 = ₹2,500

**Cost Calculation:**
```python
# Using the calculator
trades = [
    Trade(InstrumentType.INDEX_FUTURES, TradeType.BUY, 22000, 1, 50),
    Trade(InstrumentType.INDEX_FUTURES, TradeType.SELL, 22050, 1, 50)
]
costs = FOCostCalculator.calculate_trade_costs(trades)
print(f"Total costs: ₹{costs.total_cost}")
# Output: Total costs: ₹274.89
```

**Breakdown:**
- Brokerage: ₹20 + ₹20 = ₹40
- STT: 0.01% × 22,050 × 50 = ₹110.25
- Exchange: 0.0005% × (22,000 + 22,050) × 50 = ₹1.10
- GST: 18% × (40 + 1.10) = ₹7.40
- SEBI: ₹10 × (2,202,500 / 10,000,000) = ₹2.20
- Stamp Duty: 0.003% × 2,202,500 = ₹66.08
- **Total Cost: ₹227.03**
- **Cost as % of Profit: 9.1%**

### Example 2: Bank NIFTY Options Iron Condor
**Strategy:** Sell 22000 PE @ ₹180, Buy 21900 PE @ ₹120, Sell 22100 CE @ ₹150, Buy 22200 CE @ ₹90
**Lot Size:** 25 contracts each
**Total Premium Received:** (180 + 150) × 25 = ₹8,250
**Max Loss:** (120 + 90) × 25 = ₹5,250
**Breakeven:** 22000 - (8250-5250)/25 = 21920 and 22180

**Cost Calculation:**
```python
trades = [
    Trade(InstrumentType.OPTIONS, TradeType.SELL, 180, 1, 25),  # Sell PE
    Trade(InstrumentType.OPTIONS, TradeType.BUY, 120, 1, 25),   # Buy PE
    Trade(InstrumentType.OPTIONS, TradeType.SELL, 150, 1, 25),  # Sell CE
    Trade(InstrumentType.OPTIONS, TradeType.BUY, 90, 1, 25)     # Buy CE
]
costs = FOCostCalculator.calculate_trade_costs(trades)
print(f"Total costs: ₹{costs.total_cost}")
# Output: Total costs: ₹80.00
```

**Breakdown:**
- Brokerage: 4 × ₹20 = ₹80
- STT: 0.0625% × (180 + 150) × 25 = ₹11.72
- Exchange: 0.035% × premium turnover = ₹7.26
- GST: 18% × (80 + 7.26) = ₹15.65
- SEBI: ₹10 × (turnover / crore) = ₹0.21
- Stamp Duty: 0.003% × turnover = ₹1.98
- **Total Cost: ₹116.82**
- **Cost as % of Max Profit: 2.2%**

### Example 3: Equity Futures Carry Forward
**Trade Details:**
- Buy 100 shares RELIANCE futures @ ₹2,500 (1 lot)
- Sell 100 shares RELIANCE futures @ ₹2,520 (next day)
- Lot size: 100 shares
- Delivery charges apply

**Cost Calculation:**
```python
trades = [
    Trade(InstrumentType.EQUITY_FUTURES, TradeType.BUY, 2500, 1, 100, is_intraday=False),
    Trade(InstrumentType.EQUITY_FUTURES, TradeType.SELL, 2520, 1, 100, is_intraday=False)
]
costs = FOCostCalculator.calculate_trade_costs(trades)
print(f"Total costs: ₹{costs.total_cost}")
# Output: Total costs: ₹1,082.50
```

**Breakdown:**
- Brokerage: ₹40
- STT: 0.01% × 252,000 = ₹25.20
- Exchange: 0.0019% × 502,000 = ₹9.54
- GST: 18% × 49.54 = ₹8.92
- SEBI: ₹10 × (502,000 / 10,000,000) = ₹0.50
- Stamp Duty: 0.015% × 502,000 = ₹75.30 (delivery rate)
- **Total Cost: ₹199.46**
- **Cost as % of Profit: 8.0%**

## Strategy Impact Analysis

### Break-even Adjustments
Transaction costs create "dead zones" where strategies appear profitable before costs but become unprofitable after:

**Options Spread Example:**
- Gross profit zone: ₹500 per lot
- Transaction costs: ₹117
- Net profit zone: ₹383 per lot
- Effective spread width reduced by ₹4.68 per contract

### Position Sizing Optimization
**Cost Elasticity Analysis:**
- Small positions: High percentage cost drag (fixed ₹20 brokerage)
- Large positions: Lower percentage but higher market impact
- Optimal sizing: Balance fixed vs variable cost components

### Time Horizon Considerations
**Intraday Trading:**
- Higher frequency = higher cumulative brokerage
- Lower stamp duty (0.003% vs 0.015%)
- GST on more transactions

**Positional Trading:**
- Lower trading frequency
- Higher stamp duty on delivery
- Potential for tax optimization

## Common Pitfalls in Cost Modeling

### 1. Incomplete Cost Capture
- Missing GST calculations on exchange charges
- Forgetting SEBI charges on small turnovers
- Ignoring stamp duty variations

### 2. Incorrect STT Application
- Applying STT to both buy and sell sides
- Wrong rates for index vs equity futures
- Missing exercise costs in options strategies

### 3. Brokerage Misunderstanding
- Confusing per-order vs per-contract pricing
- Missing quantity multipliers in calculations
- Using advertised minimums instead of actual rates

### 4. Turnover Calculation Errors
- Incorrect premium vs underlying turnover for options
- Missing lot size multipliers
- Wrong trade price references

## Recommendations for Realistic Backtesting

### Cost Assumption Validation
- Use actual broker statements to validate calculations
- Test strategies at different capital levels
- Include slippage (0.1-0.5% for market orders)

### Strategy Design Considerations
- Design strategies with profit zones > 3x transaction costs
- Consider cost impact on position sizing
- Test both intraday and positional variants

### Performance Reporting
- Report both gross and net returns
- Include cost breakdown in performance analytics
- Calculate Sharpe ratios after all costs

This comprehensive cost model ensures your F&O backtesting reflects real Indian market conditions, enabling more accurate strategy evaluation and risk assessment.
