"""
Gap Scanner for NSE Stocks
Identifies gaps at market open and sets up ORB ranges
"""

import pandas as pd
from datetime import datetime, time
from typing import List, Dict, Optional
import pytz

IST = pytz.timezone('Asia/Kolkata')

# Nifty 50 symbols subset
NIFTY50 = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC']

def calculate_gaps(symbols_list: List[str], prev_close_dict: Dict[str, float]) -> pd.DataFrame:
    """
    Calculate gap % for symbols at market open

    Args:
        symbols_list: List of NSE symbols
        prev_close_dict: Previous day close prices

    Returns:
        DataFrame with gap analysis
    """
    gaps = []

    for symbol in symbols_list:
        try:
            # Get current open price (mock for demo)
            current_open = get_current_open_price(symbol)
            prev_close = prev_close_dict.get(symbol, current_open)

            if prev_close == 0:
                continue

            gap_pct = (current_open - prev_close) / prev_close * 100
            gap_type = classify_gap(gap_pct)

            gaps.append({
                'symbol': symbol,
                'prev_close': prev_close,
                'open': current_open,
                'gap_pct': round(gap_pct, 2),
                'gap_type': gap_type,
                'gap_size': 'large' if abs(gap_pct) > 2 else 'medium' if abs(gap_pct) > 1 else 'small'
            })

        except Exception as e:
            print(f"Error calculating gap for {symbol}: {e}")

    return pd.DataFrame(gaps)

def classify_gap(gap_pct: float) -> str:
    """
    Classify gap type based on percentage

    Args:
        gap_pct: Gap percentage

    Returns:
        Gap classification
    """
    if gap_pct > 2:
        return 'GAP_UP_LARGE'
    elif gap_pct > 0.5:
        return 'GAP_UP'
    elif gap_pct < -2:
        return 'GAP_DOWN_LARGE'
    elif gap_pct < -0.5:
        return 'GAP_DOWN'
    else:
        return 'NO_GAP'

def filter_gaps(gaps_df: pd.DataFrame, min_gap: float = 0.5, max_gap: float = 3.0) -> pd.DataFrame:
    """
    Filter gaps by size criteria

    Args:
        gaps_df: DataFrame from calculate_gaps
        min_gap: Minimum gap % (absolute)
        max_gap: Maximum gap % (absolute)

    Returns:
        Filtered DataFrame
    """
    if gaps_df.empty:
        return gaps_df

    # Filter by gap size
    mask = (abs(gaps_df['gap_pct']) >= min_gap) & (abs(gaps_df['gap_pct']) <= max_gap)
    filtered = gaps_df[mask].copy()

    # Add fill probability based on historical data
    filtered['fill_probability'] = filtered['gap_pct'].apply(_get_fill_probability)

    return filtered

def get_orb_range(symbol: str, timeframe_minutes: int = 15) -> Dict:
    """
    Get Opening Range Breakout levels

    Args:
        symbol: NSE symbol
        timeframe_minutes: ORB duration (15 or 30)

    Returns:
        Dict with ORB high, low, midpoint
    """
    try:
        # Get ORB period data (first 15/30 minutes)
        orb_data = get_orb_period_data(symbol, timeframe_minutes)

        if orb_data.empty:
            return {'orb_high': None, 'orb_low': None, 'orb_mid': None}

        orb_high = orb_data['high'].max()
        orb_low = orb_data['low'].min()
        orb_mid = (orb_high + orb_low) / 2

        return {
            'orb_high': round(orb_high, 2),
            'orb_low': round(orb_low, 2),
            'orb_mid': round(orb_mid, 2),
            'orb_range_pct': round((orb_high - orb_low) / orb_mid * 100, 2)
        }

    except Exception as e:
        print(f"Error getting ORB for {symbol}: {e}")
        return {'orb_high': None, 'orb_low': None, 'orb_mid': None}

def scan_gaps_with_orb(symbols_list: List[str]) -> pd.DataFrame:
    """
    Complete gap scan with ORB setup

    Args:
        symbols_list: List of NSE symbols

    Returns:
        DataFrame with gaps and ORB levels
    """
    # Get previous close prices
    prev_closes = {symbol: get_previous_close(symbol) for symbol in symbols_list}

    # Calculate gaps
    gaps = calculate_gaps(symbols_list, prev_closes)

    # Filter significant gaps
    significant_gaps = filter_gaps(gaps)

    # Add ORB levels
    results = []
    for _, gap in significant_gaps.iterrows():
        orb = get_orb_range(gap['symbol'])
        results.append({
            **gap.to_dict(),
            **orb
        })

    return pd.DataFrame(results)

# Helper functions
def _get_fill_probability(gap_pct: float) -> float:
    """Get historical fill probability for gap size"""
    abs_gap = abs(gap_pct)
    if abs_gap < 1:
        return 0.70
    elif abs_gap < 2:
        return 0.45
    elif abs_gap < 3:
        return 0.30
    else:
        return 0.20

def get_current_open_price(symbol: str) -> float:
    """Get current open price (mock)"""
    # In real implementation: fetch from broker API
    return 2450.0  # Mock value

def get_previous_close(symbol: str) -> float:
    """Get previous close price (mock)"""
    # In real implementation: fetch from historical data
    return 2420.0  # Mock value

def get_orb_period_data(symbol: str, minutes: int) -> pd.DataFrame:
    """Get ORB period OHLC data (mock)"""
    # In real implementation: fetch 1-min data for first N minutes
    return pd.DataFrame({
        'high': [2455, 2460, 2458],
        'low': [2445, 2450, 2448]
    })
