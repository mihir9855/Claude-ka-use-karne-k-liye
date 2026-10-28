"""Core utilities for Indian market trading skills — NotSoSEBI."""

from datetime import datetime, time, timedelta
import pytz

IST = pytz.timezone("Asia/Kolkata")
MARKET_OPEN = time(9, 15)
MARKET_CLOSE = time(15, 30)

LOT_SIZES: dict[str, int] = {
    "NIFTY": 75, "BANKNIFTY": 15, "FINNIFTY": 25, "MIDCPNIFTY": 50,
    "RELIANCE": 250, "TCS": 175, "HDFCBANK": 550, "INFY": 300,
    "ICICIBANK": 700, "SBIN": 750, "BHARTIARTL": 950, "ITC": 1600,
    "KOTAKBANK": 400, "LT": 150, "AXISBANK": 600, "HINDUNILVR": 300,
    "BAJFINANCE": 125, "MARUTI": 100, "SUNPHARMA": 700, "TATAMOTORS": 575,
    "TITAN": 225, "ULTRACEMCO": 100, "ASIANPAINT": 200, "WIPRO": 1500,
    "HCLTECH": 350, "POWERGRID": 2700, "NTPC": 2800, "TATASTEEL": 5500,
    "ONGC": 3850, "JSWSTEEL": 675, "ADANIENT": 250, "TECHM": 600,
    "HINDALCO": 1400, "INDUSINDBK": 500, "COALINDIA": 2100,
    "BAJAJFINSV": 500, "DRREDDY": 125, "CIPLA": 650, "GRASIM": 350,
    "BPCL": 1800, "DIVISLAB": 150, "EICHERMOT": 175, "BRITANNIA": 200,
    "NESTLEIND": 50, "APOLLOHOSP": 125, "HEROMOTOCO": 150, "TATACONSUM": 900,
    "M&M": 350, "BAJAJ-AUTO": 250, "SBILIFE": 750, "HDFCLIFE": 1100,
}


def is_market_open() -> bool:
    """Check if NSE is currently in trading hours (Mon-Fri, 9:15-15:30 IST)."""
    now = datetime.now(IST)
    return (
        now.weekday() < 5
        and MARKET_OPEN <= now.time() <= MARKET_CLOSE
    )


def get_next_expiry(weekly: bool = True) -> datetime:
    """Return the next F&O expiry date (Thursday). Skips today if past 15:30."""
    now = datetime.now(IST)
    days_ahead = (3 - now.weekday()) % 7  # Thursday = weekday 3
    if days_ahead == 0 and now.time() > MARKET_CLOSE:
        days_ahead = 7
    if not weekly and days_ahead < 7:
        # Monthly = last Thursday of month; jump forward week-by-week
        candidate = now.date() + timedelta(days=days_ahead)
        while True:
            nxt = candidate + timedelta(days=7)
            if nxt.month != candidate.month:
                break
            candidate = nxt
        return datetime.combine(candidate, MARKET_CLOSE, tzinfo=IST)
    return datetime.combine(
        now.date() + timedelta(days=days_ahead), MARKET_CLOSE, tzinfo=IST
    )


def get_lot_size(symbol: str) -> int:
    """Get F&O lot size for a symbol. Returns 0 if not in F&O list."""
    return LOT_SIZES.get(symbol.upper(), 0)


def calculate_total_charges(turnover: float, segment: str = "futures") -> dict:
    """
    Calculate all transaction costs on NSE turnover (one side).

    Segments: 'futures', 'options', 'equity_intraday', 'equity_delivery'
    Returns dict with each charge component and total (all in INR).
    """
    stt_rates = {
        "futures": 0.0125 / 100,      # 0.0125% on sell side
        "options": 0.0625 / 100,       # 0.0625% on premium (sell)
        "equity_intraday": 0.025 / 100,
        "equity_delivery": 0.1 / 100,
    }
    stt = turnover * stt_rates.get(segment, 0)
    stamp = turnover * 0.003 / 100         # 0.003% (buy side)
    sebi = turnover * 0.0001 / 100         # ₹10 per crore
    exch = turnover * 0.00345 / 100        # NSE transaction charge ~0.00345%
    brokerage = min(turnover * 0.03 / 100, 20.0)  # Flat ₹20 or 0.03%
    gst = (brokerage + sebi + exch) * 0.18  # 18% GST on brokerage+SEBI+exch

    total = stt + stamp + sebi + exch + brokerage + gst
    return {
        "stt": round(stt, 2), "stamp_duty": round(stamp, 2),
        "sebi_charges": round(sebi, 2), "exchange_txn": round(exch, 2),
        "brokerage": round(brokerage, 2), "gst": round(gst, 2),
        "total": round(total, 2),
    }