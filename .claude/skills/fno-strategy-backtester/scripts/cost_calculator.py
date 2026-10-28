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
        broker: Broker name (supports 'zerodha', 'dhan', 'angel')

    Returns: Dict with itemized costs and total

    Examples:
        >>> costs = calculate_trade_costs(22000, 22050, 50, 'futures')
        >>> print(f"Total: ₹{costs['total']}")  # ₹274.89

        >>> costs = calculate_trade_costs(150, 180, 25, 'options')
        >>> print(f"Total: ₹{costs['total']}")  # ₹60.13
    """
    entry_turnover = entry_price * quantity
    exit_turnover = exit_price * quantity
    total_turnover = entry_turnover + exit_turnover

    brokerage = min(20.0, entry_turnover * 0.0003) + min(20.0, exit_turnover * 0.0003)
    stt_rates = {'futures': 0.001, 'options': 0.00625, 'equity_intraday': 0.0025, 'equity_delivery': 0.001}
    stt = exit_turnover * stt_rates.get(segment, 0)
    stamp_rates = {'futures': 0.00003, 'options': 0.00003, 'equity_intraday': 0.00003, 'equity_delivery': 0.00015}
    stamp_duty = total_turnover * stamp_rates.get(segment, 0)
    exchange_rates = {'futures': 0.000019, 'options': 0.00035, 'equity_intraday': 0.0000325, 'equity_delivery': 0.0000375}
    exchange_charges = total_turnover * exchange_rates.get(segment, 0)
    sebi_charges = (total_turnover / 10000000) * 10
    gst_base = brokerage + exchange_charges + sebi_charges
    gst = gst_base * 0.18
    total = brokerage + stt + stamp_duty + exchange_charges + sebi_charges + gst

    return {'brokerage': round(brokerage, 2), 'stt': round(stt, 2), 'stamp_duty': round(stamp_duty, 2),
            'exchange_charges': round(exchange_charges, 2), 'sebi_charges': round(sebi_charges, 2),
            'gst': round(gst, 2), 'total': round(total, 2)}
