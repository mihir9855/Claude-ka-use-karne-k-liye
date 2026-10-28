"""
IV Analyzer for Indian Options
Calculates IV percentile, skew, and detects events
"""

import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta

def calculate_iv_percentile(iv_series: pd.Series, current_iv: float, window: int = 252) -> float:
    """
    Calculate IV percentile over historical window

    Args:
        iv_series: Historical IV series
        current_iv: Current IV value
        window: Lookback window in days

    Returns:
        IV percentile (0-100)
    """
    if len(iv_series) < window:
        window = len(iv_series)

    # Get recent historical IV
    recent_iv = iv_series.tail(window)

    # Calculate percentile
    percentile = (current_iv > recent_iv).sum() / len(recent_iv) * 100

    return round(percentile, 2)

def calculate_iv_skew(chain_df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate IV skew across strike prices

    Args:
        chain_df: Option chain DataFrame with IV by strike

    Returns:
        Dict with skew metrics
    """
    if chain_df.empty:
        return {'call_skew': 0, 'put_skew': 0, 'skew_ratio': 0}

    # Separate calls and puts
    calls = chain_df[chain_df['type'] == 'CE']
    puts = chain_df[chain_df['type'] == 'PE']

    # Calculate average IV by distance from spot
    spot = chain_df['spot'].iloc[0] if 'spot' in chain_df.columns else 0

    # ATM IV (strikes within 2% of spot)
    atm_range = spot * 0.02
    atm_calls = calls[abs(calls['strike'] - spot) <= atm_range]
    atm_puts = puts[abs(puts['strike'] - spot) <= atm_range]

    atm_iv = (atm_calls['iv'].mean() + atm_puts['iv'].mean()) / 2 if not atm_calls.empty and not atm_puts.empty else 0

    # OTM IV (calls above spot, puts below spot)
    otm_calls = calls[calls['strike'] > spot]['iv'].mean()
    otm_puts = puts[puts['strike'] < spot]['iv'].mean()

    # Calculate skew
    call_skew = otm_calls - atm_iv if otm_calls and atm_iv else 0
    put_skew = otm_puts - atm_iv if otm_puts and atm_iv else 0

    skew_ratio = call_skew / put_skew if put_skew != 0 else 0

    return {
        'atm_iv': round(atm_iv, 2),
        'call_skew': round(call_skew, 2),
        'put_skew': round(put_skew, 2),
        'skew_ratio': round(skew_ratio, 2),
        'bias': 'bullish' if call_skew > put_skew else 'bearish'
    }

def detect_iv_events(iv_series: pd.Series, threshold: float = 1.5) -> List[Dict]:
    """
    Detect significant IV events (spikes/crushes)

    Args:
        iv_series: IV time series
        threshold: Standard deviation threshold

    Returns:
        List of event dictionaries
    """
    events = []

    if len(iv_series) < 20:
        return events

    # Calculate rolling mean and std
    rolling_mean = iv_series.rolling(20).mean()
    rolling_std = iv_series.rolling(20).std()

    # Detect spikes (IV > mean + threshold * std)
    spike_mask = iv_series > (rolling_mean + threshold * rolling_std)
    spike_dates = iv_series[spike_mask].index

    # Detect crushes (IV < mean - threshold * std)
    crush_mask = iv_series < (rolling_mean - threshold * rolling_std)
    crush_dates = iv_series[crush_mask].index

    # Create event records
    for date in spike_dates:
        events.append({
            'date': date,
            'type': 'spike',
            'iv': iv_series.loc[date],
            'change_pct': (iv_series.loc[date] - rolling_mean.loc[date]) / rolling_mean.loc[date] * 100
        })

    for date in crush_dates:
        events.append({
            'date': date,
            'type': 'crush',
            'iv': iv_series.loc[date],
            'change_pct': (rolling_mean.loc[date] - iv_series.loc[date]) / rolling_mean.loc[date] * 100
        })

    return events

def suggest_strategy(iv_percentile: float, direction_bias: str, days_to_expiry: int) -> Dict:
    """
    Suggest option strategy based on IV and market conditions

    Args:
        iv_percentile: Current IV percentile (0-100)
        direction_bias: 'bullish', 'bearish', 'neutral'
        days_to_expiry: Days until expiry

    Returns:
        Strategy recommendation dict
    """
    # High IV environment (>70th percentile)
    if iv_percentile > 70:
        if direction_bias == 'neutral':
            strategy = 'straddle' if days_to_expiry > 7 else 'strangle'
            reasoning = 'High IV favors premium buying strategies'
        elif direction_bias == 'bullish':
            strategy = 'bull call spread'
            reasoning = 'Buy volatility with directional bias'
        else:  # bearish
            strategy = 'bull put spread'
            reasoning = 'Buy volatility with directional bias'

    # Low IV environment (<30th percentile)
    elif iv_percentile < 30:
        if direction_bias == 'neutral':
            strategy = 'iron condor'
            reasoning = 'Low IV favors premium selling'
        elif direction_bias == 'bullish':
            strategy = 'bull call spread'
            reasoning = 'Defined risk directional play'
        else:  # bearish
            strategy = 'bear put spread'
            reasoning = 'Defined risk directional play'

    # Normal IV (30-70 percentile)
    else:
        if direction_bias == 'neutral':
            strategy = 'butterfly' if days_to_expiry < 7 else 'condor'
            reasoning = 'Balanced volatility environment'
        elif direction_bias == 'bullish':
            strategy = 'call ratio spread'
            reasoning = 'Moderate directional exposure'
        else:  # bearish
            strategy = 'put ratio spread'
            reasoning = 'Moderate directional exposure'

    return {
        'strategy': strategy,
        'reasoning': reasoning,
        'iv_percentile': iv_percentile,
        'direction_bias': direction_bias,
        'days_to_expiry': days_to_expiry,
        'risk_level': 'high' if iv_percentile > 70 else 'low' if iv_percentile < 30 else 'medium'
    }

# Utility functions
def get_iv_history(index: str, days: int = 252) -> pd.Series:
    """
    Get historical IV data for index

    Args:
        index: 'NIFTY' or 'BANKNIFTY'
        days: Lookback period

    Returns:
        IV time series
    """
    # Mock historical IV data
    # In real implementation, fetch from database/API
    dates = pd.date_range(end=datetime.now(), periods=days, freq='D')
    # Mock IV between 15-35%
    iv_values = [0.18 + 0.05 * (i % 10 - 5) / 5 for i in range(days)]

    return pd.Series(iv_values, index=dates)

def calculate_term_structure(chain_df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate IV term structure

    Args:
        chain_df: Option chain with multiple expiries

    Returns:
        Term structure metrics
    """
    # Group by expiry and calculate average IV
    term_iv = chain_df.groupby('expiry')['iv'].mean()

    if len(term_iv) < 2:
        return {'slope': 0, 'curvature': 0}

    # Calculate slope (front month vs back month)
    front_month = term_iv.iloc[0]
    back_month = term_iv.iloc[-1]

    slope = (back_month - front_month) / len(term_iv)

    return {
        'front_month_iv': round(front_month, 2),
        'back_month_iv': round(back_month, 2),
        'slope': round(slope, 4),
        'shape': 'upward' if slope > 0 else 'downward'
    }
