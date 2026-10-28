"""
OHL Breakout Scanner for NSE F&O Stocks
Scans Nifty 50 stocks for Open=High/Open=Low conditions at 9:15 AM IST
"""

import pandas as pd
from datetime import datetime, time
import pytz
from typing import List, Dict, Optional

IST = pytz.timezone('Asia/Kolkata')

# Nifty 50 F&O stocks (subset for demo)
NIFTY50_FNO = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR',
    'INFY', 'ITC', 'KOTAKBANK', 'LT', 'AXISBANK'
]

def scan_ohl(symbols_list: List[str]) -> pd.DataFrame:
    """
    Scan symbols for OH/OL conditions at 9:15 AM IST

    Args:
        symbols_list: List of NSE symbols to scan

    Returns:
        DataFrame with OH/OL matches
    """
    matches = []

    for symbol in symbols_list:
        try:
            # Mock OH/OL detection for demo
            # In real implementation, this would check actual 9:15 candle
            import random
            if random.random() < 0.1:  # 10% chance of OH/OL for demo
                if random.random() < 0.7:  # 70% OL, 30% OH
                    condition = 'OL'
                    side = 'LONG'
                else:
                    condition = 'OH'
                    side = 'SHORT'

                # Mock current price
                current_price = 2450.0 + random.uniform(-50, 50)

                matches.append({
                    'symbol': symbol,
                    'condition': condition,
                    'side': side,
                    'open': current_price,
                    'high': current_price if condition == 'OH' else current_price + 5,
                    'low': current_price if condition == 'OL' else current_price - 5,
                    'close': current_price,
                    'volume': 1000000,
                    'timestamp': datetime.now(IST)
                })

        except Exception as e:
            print(f"Error scanning {symbol}: {e}")
            continue

    return pd.DataFrame(matches)

def apply_filters(matches_df: pd.DataFrame,
                 volume_threshold: float = 1.5,
                 max_gap_pct: float = 1.5) -> pd.DataFrame:
    """
    Apply volume, gap, and ATR filters to OH/OL matches

    Args:
        matches_df: DataFrame from scan_ohl()
        volume_threshold: Volume multiplier vs 20D avg
        max_gap_pct: Max gap % from prev close

    Returns:
        Filtered DataFrame
    """
    filtered = []

    for idx, row in matches_df.iterrows():
        symbol = str(row['symbol'])
        volume = float(row['volume'])
        open_price = float(row['open'])

        # Volume filter
        avg_volume_20d = get_20day_avg_volume(symbol)
        if volume < volume_threshold * avg_volume_20d:
            continue

        # Gap filter
        prev_close = get_previous_close(symbol)
        gap_pct = abs(open_price - prev_close) / prev_close * 100
        if gap_pct > max_gap_pct:
            continue

        # ATR filter (optional)
        atr = get_atr(symbol)
        if atr < 0.008 * open_price:  # 0.8% minimum ATR
            continue

        filtered.append(row)

    return pd.DataFrame(filtered)

def calculate_levels(entry_price: float, side: str, atr: float) -> Dict:
    """
    Calculate SL and target levels for OH/OL trade

    Args:
        entry_price: Entry price
        side: 'LONG' or 'SHORT'
        atr: Current ATR value

    Returns:
        Dict with SL, T1, T2 levels
    """
    # SL at open price (for both LONG/SHORT)
    sl = entry_price

    # Risk = distance to SL (ATR-based)
    risk = max(atr * 0.5, entry_price * 0.005)  # Min 0.5% or 0.5*ATR

    if side == 'LONG':
        t1 = entry_price + risk  # 1:1 RR
        t2 = entry_price + 2 * risk  # 1:2 RR
    else:  # SHORT
        t1 = entry_price - risk
        t2 = entry_price - 2 * risk

    return {
        'entry': entry_price,
        'stop_loss': sl,
        'target_1': round(t1, 2),
        'target_2': round(t2, 2),
        'risk_per_share': round(risk, 2)
    }

def run_scan() -> pd.DataFrame:
    """
    Main function to run OH/OL scan

    Returns:
        DataFrame with filtered signals and levels
    """
    # Scan for OH/OL
    matches = scan_ohl(NIFTY50_FNO)

    # Apply filters
    filtered = apply_filters(matches)

    # Calculate levels for each signal
    signals = []
    for idx, row in filtered.iterrows():
        side = str(row['side'])
        if side == 'LONG':  # V4: OL long-only
            symbol = str(row['symbol'])
            entry_price = float(row['open'])
            atr = get_atr(symbol)
            levels = calculate_levels(entry_price, side, atr)

            signals.append({
                'symbol': symbol,
                'condition': str(row['condition']),
                'side': side,
                **levels,
                'lot_size': get_lot_size(symbol),
                'volume_check': 'PASS',
                'gap_check': 'PASS',
                'atr_check': 'PASS'
            })

    return pd.DataFrame(signals)

# Helper functions (implement with actual broker API)
def get_current_day_ohlc(symbol: str) -> Optional[pd.DataFrame]:
    """Get current day 1-minute OHLCV data"""
    # Implementation would use broker API
    pass

def get_20day_avg_volume(symbol: str) -> float:
    """Get 20-day average volume"""
    # Implementation would use historical data
    return 1000000  # Mock value

def get_previous_close(symbol: str) -> float:
    """Get previous day's close"""
    # Implementation would use historical data
    return 2450.0  # Mock value

def get_atr(symbol: str) -> float:
    """Get current ATR(14)"""
    # Implementation would calculate from data
    return 25.0  # Mock value

def get_lot_size(symbol: str) -> int:
    """Get F&O lot size"""
    # Implementation would fetch from NSE data
    return 250  # Mock value
