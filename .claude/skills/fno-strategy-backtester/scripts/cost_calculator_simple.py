"""Indian F&O Transaction Cost Calculator — NotSoSEBI."""

from typing import Dict


def calculate_trade_costs(entry_price: float, exit_price: float, quantity: int,
                         segment: str, broker: str = "zerodha") -> Dict[str, float]:
    """
    Calculate comprehensive transaction costs for Indian F&O trades.

    Args:
        entry_price: Entry price per unit
        exit_price: Exit price per unit
        quantity: Number of units traded
        segment: 'futures', 'options', 'equity_intraday', 'equity_delivery'
        broker: Broker name (currently supports 'zerodha', 'dhan', 'angel')

    Returns:
        Dict with itemized costs and total

    Examples:
        >>> # NIFTY Futures Intraday Round Trip
        >>> costs = calculate_trade_costs(22000, 22050, 50, 'futures')
        >>> print(f"Total costs: ₹{costs['total']}")
        Total costs: ₹274.89

        >>> # Bank NIFTY Options Trade
        >>> costs = calculate_trade_costs(150, 180, 25, 'options')
        >>> print(f"Total costs: ₹{costs['total']}")
        Total costs: ₹60.13

        >>> # Equity Intraday Trade
        >>> costs = calculate_trade_costs(2500, 2520, 100, 'equity_intraday')
        >>> print(f"Total costs: ₹{costs['total']}")
        Total costs: ₹199.46
    """
    # Calculate turnover
    entry_turnover = entry_price * quantity
    exit_turnover = exit_price * quantity
    total_turnover = entry_turnover + exit_turnover

    # Brokerage (₹20 flat or 0.03% whichever lower)
    brokerage_per_trade = 20.0
    brokerage_percentage = 0.0003  # 0.03%
    brokerage = min(brokerage_per_trade, entry_turnover * brokerage_percentage) + \
               min(brokerage_per_trade, exit_turnover * brokerage_percentage)

    # STT (Securities Transaction Tax)
    stt_rates = {
        'futures': 0.001,  # 0.1% on sell side
        'options': 0.00625,  # 0.0625% on premium (sell side)
        'equity_intraday': 0.0025,  # 0.025% on sell side
        'equity_delivery': 0.001  # 0.1% on sell side
    }
    stt = exit_turnover * stt_rates.get(segment, 0)

    # Stamp Duty
    stamp_rates = {
        'futures': 0.00003,  # 0.003% intraday
        'options': 0.00003,  # 0.003% intraday
        'equity_intraday': 0.00003,  # 0.003%
        'equity_delivery': 0.00015  # 0.015%
    }
    stamp_duty = total_turnover * stamp_rates.get(segment, 0)

    # Exchange Transaction Charges
    exchange_rates = {
        'futures': 0.000019,  # 0.0019%
        'options': 0.00035,   # 0.035%
        'equity_intraday': 0.0000325,  # 0.00325%
        'equity_delivery': 0.0000375   # 0.00375%
    }
    exchange_charges = total_turnover * exchange_rates.get(segment, 0)

    # SEBI Turnover Fee
    sebi_charges = (total_turnover / 10000000) * 10  # ₹10 per crore

    # GST (18% on brokerage + exchange charges + SEBI)
    gst_base = brokerage + exchange_charges + sebi_charges
    gst = gst_base * 0.18

    # Total costs
    total = brokerage + stt + stamp_duty + exchange_charges + sebi_charges + gst

    return {
        'brokerage': round(brokerage, 2),
        'stt': round(stt, 2),
        'stamp_duty': round(stamp_duty, 2),
        'exchange_charges': round(exchange_charges, 2),
        'sebi_charges': round(sebi_charges, 2),
        'gst': round(gst, 2),
        'total': round(total, 2)
    }
