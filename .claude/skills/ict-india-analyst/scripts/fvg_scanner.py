"""
FVG Scanner for NSE Markets
Identifies Fair Value Gaps and Order Blocks on Indian indices
"""

import pandas as pd
from typing import List, Dict, Optional
import numpy as np

def find_fvg(df: pd.DataFrame) -> List[Dict]:
    """
    Find Fair Value Gaps in OHLCV data

    Args:
        df: OHLCV DataFrame with datetime index

    Returns:
        List of FVG dictionaries
    """
    fvgs = []

    # Need at least 3 candles for FVG
    if len(df) < 3:
        return fvgs

    for i in range(len(df) - 2):
        candle1 = df.iloc[i]
        candle2 = df.iloc[i + 1]
        candle3 = df.iloc[i + 2]

        # Bullish FVG: Gap between candle1 high and candle3 low
        if candle1['high'] < candle3['low']:
            fvg = {
                'type': 'bullish_fvg',
                'top': candle1['high'],
                'bottom': candle3['low'],
                'mid': (candle1['high'] + candle3['low']) / 2,
                'start_time': df.index[i],
                'end_time': df.index[i + 2],
                'strength': _calculate_fvg_strength(df, i, i + 2)
            }
            fvgs.append(fvg)

        # Bearish FVG: Gap between candle1 low and candle3 high
        elif candle1['low'] > candle3['high']:
            fvg = {
                'type': 'bearish_fvg',
                'top': candle1['low'],
                'bottom': candle3['high'],
                'mid': (candle1['low'] + candle3['high']) / 2,
                'start_time': df.index[i],
                'end_time': df.index[i + 2],
                'strength': _calculate_fvg_strength(df, i, i + 2)
            }
            fvgs.append(fvg)

    return fvgs

def find_ifvg(df: pd.DataFrame) -> List[Dict]:
    """
    Find Inverse Fair Value Gaps (mitigated FVGs)

    Args:
        df: OHLCV DataFrame

    Returns:
        List of IFVG dictionaries
    """
    ifvgs = []

    # Find original FVGs
    fvgs = find_fvg(df)

    for fvg in fvgs:
        # Check if FVG has been mitigated (price touched the gap)
        mask = (df.index >= fvg['start_time']) & (df.index <= df.index[-1])
        subsequent_data = df[mask]

        mitigated = False
        for _, row in subsequent_data.iterrows():
            if fvg['type'] == 'bullish_fvg':
                if row['low'] <= fvg['top'] and row['high'] >= fvg['bottom']:
                    mitigated = True
                    break
            else:  # bearish_fvg
                if row['high'] >= fvg['bottom'] and row['low'] <= fvg['top']:
                    mitigated = True
                    break

        if mitigated:
            ifvg = fvg.copy()
            ifvg['type'] = 'ifvg_' + fvg['type'].split('_')[0]
            ifvgs.append(ifvg)

    return ifvgs

def check_fvg_mitigation(fvgs_list: List[Dict], current_price: float) -> List[Dict]:
    """
    Check which FVGs are being mitigated at current price

    Args:
        fvgs_list: List of FVG dictionaries
        current_price: Current market price

    Returns:
        List of FVGs being mitigated
    """
    mitigating = []

    for fvg in fvgs_list:
        if fvg['type'].startswith('bullish'):
            if fvg['bottom'] <= current_price <= fvg['top']:
                mitigating.append(fvg)
        elif fvg['type'].startswith('bearish'):
            if fvg['bottom'] <= current_price <= fvg['top']:
                mitigating.append(fvg)

    return mitigating

def find_order_blocks(df: pd.DataFrame, lookback: int = 20) -> List[Dict]:
    """
    Find order blocks in price action

    Args:
        df: OHLCV DataFrame
        lookback: Candles to look back for order blocks

    Returns:
        List of order block dictionaries
    """
    order_blocks = []

    for i in range(lookback, len(df)):
        current = df.iloc[i]

        # Check for rejection candle (long wick, small body)
        body_size = abs(current['close'] - current['open'])
        total_range = current['high'] - current['low']

        if total_range == 0:
            continue

        body_ratio = body_size / total_range

        # Small body, large wick = rejection
        if body_ratio < 0.3:
            # Determine direction
            if current['close'] > current['open']:  # Bullish rejection
                if (current['high'] - current['close']) > (current['open'] - current['low']):
                    # Upper wick longer - bearish rejection above
                    ob = {
                        'type': 'bearish_ob',
                        'level': current['high'],
                        'direction': 'resistance',
                        'strength': _calculate_ob_strength(df, i, lookback),
                        'time': df.index[i]
                    }
                    order_blocks.append(ob)
            else:  # Bearish rejection
                if (current['open'] - current['low']) > (current['high'] - current['close']):
                    # Lower wick longer - bullish rejection below
                    ob = {
                        'type': 'bullish_ob',
                        'level': current['low'],
                        'direction': 'support',
                        'strength': _calculate_ob_strength(df, i, lookback),
                        'time': df.index[i]
                    }
                    order_blocks.append(ob)

    return order_blocks

def _calculate_fvg_strength(df: pd.DataFrame, start_idx: int, end_idx: int) -> float:
    """Calculate FVG strength based on volume and size"""
    volume_avg = df.iloc[start_idx:end_idx+1]['volume'].mean()
    size = abs(df.iloc[start_idx]['high'] - df.iloc[end_idx]['low'])

    # Strength = normalized volume * size
    strength = (volume_avg / df['volume'].mean()) * (size / df['close'].mean())

    return round(strength, 2)

def _calculate_ob_strength(df: pd.DataFrame, idx: int, lookback: int) -> float:
    """Calculate order block strength"""
    recent_volume = df.iloc[idx-lookback:idx]['volume'].mean()
    avg_volume = df['volume'].mean()

    # Strength based on volume and position in range
    volume_factor = recent_volume / avg_volume if avg_volume > 0 else 1

    return round(volume_factor, 2)

def scan_ict_setups(df: pd.DataFrame) -> Dict:
    """
    Complete ICT scan for current market conditions

    Args:
        df: Recent OHLCV data

    Returns:
        Dict with all ICT elements
    """
    current_price = df.iloc[-1]['close']

    return {
        'fvgs': find_fvg(df),
        'ifvgs': find_ifvg(df),
        'order_blocks': find_order_blocks(df),
        'mitigating_fvgs': check_fvg_mitigation(find_fvg(df) + find_ifvg(df), current_price),
        'current_price': current_price,
        'timestamp': df.index[-1]
    }

# Utility functions
def is_in_killzone(current_time) -> str:
    """
    Check if current time is in ICT killzone

    Args:
        current_time: datetime object

    Returns:
        Killzone name or 'outside'
    """
    hour = current_time.hour
    minute = current_time.minute

    if 9 <= hour < 11 or (hour == 10 and minute <= 30):
        return 'opening_killzone'
    elif 13 <= hour < 15 or (hour == 14 and minute <= 30):
        return 'pm_killzone'
    elif 11 <= hour < 13:
        return 'midday_avoid'
    else:
        return 'outside_killzone'

def get_pdh_pdl(df: pd.DataFrame) -> Dict:
    """
    Get Previous Day High/Low for liquidity levels

    Args:
        df: Daily OHLCV data

    Returns:
        Dict with PDH/PDL levels
    """
    if len(df) < 2:
        return {'pdh': None, 'pdl': None}

    prev_day = df.iloc[-2]
    return {
        'pdh': prev_day['high'],
        'pdl': prev_day['low']
    }
