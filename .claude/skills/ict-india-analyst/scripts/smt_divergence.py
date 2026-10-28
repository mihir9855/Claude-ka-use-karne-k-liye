"""
SMT Divergence Scanner for Indian Markets
Analyzes Nifty vs BankNifty divergence (Indian adaptation of ICT SMT)
"""

import pandas as pd
from typing import Dict, List, Optional
import numpy as np

def detect_smt(nifty_df: pd.DataFrame, banknifty_df: pd.DataFrame,
               lookback: int = 5) -> List[Dict]:
    """
    Detect SMT divergence between Nifty and BankNifty

    Args:
        nifty_df: Nifty OHLCV data
        banknifty_df: BankNifty OHLCV data
        lookback: Periods to analyze for divergence

    Returns:
        List of SMT divergence signals
    """
    smt_signals = []

    # Ensure both dataframes have same time index
    common_index = nifty_df.index.intersection(banknifty_df.index)

    if len(common_index) < lookback:
        return smt_signals

    nifty_common = nifty_df.loc[common_index]
    banknifty_common = banknifty_df.loc[common_index]

    # Calculate percentage changes
    nifty_pct = nifty_common['close'].pct_change(lookback)
    banknifty_pct = banknifty_common['close'].pct_change(lookback)

    for i in range(lookback, len(common_index)):
        nifty_change = nifty_pct.iloc[i]
        banknifty_change = banknifty_pct.iloc[i]

        # SMT Bullish: Nifty up, BankNifty down
        if nifty_change > 0.001 and banknifty_change < -0.001:
            smt_type = 'bullish_smt'
            strength = _calculate_smt_strength(nifty_change, banknifty_change)

        # SMT Bearish: Nifty down, BankNifty up
        elif nifty_change < -0.001 and banknifty_change > 0.001:
            smt_type = 'bearish_smt'
            strength = _calculate_smt_strength(nifty_change, banknifty_change)
        else:
            continue

        smt_signal = {
            'type': smt_type,
            'timestamp': common_index[i],
            'nifty_change': round(nifty_change * 100, 2),
            'banknifty_change': round(banknifty_change * 100, 2),
            'divergence': round(abs(nifty_change - banknifty_change) * 100, 2),
            'strength': strength,
            'lookback_periods': lookback
        }

        smt_signals.append(smt_signal)

    return smt_signals

def classify_smt(smt_type: str) -> str:
    """
    Classify SMT signal strength

    Args:
        smt_type: SMT signal type

    Returns:
        Classification description
    """
    if 'bullish' in smt_type:
        return "Bullish SMT: Nifty gaining while BankNifty falling. Suggests institutional buying in broader market, potential Nifty upside."
    elif 'bearish' in smt_type:
        return "Bearish SMT: Nifty falling while BankNifty rising. Suggests institutional selling in broader market, potential Nifty downside."
    else:
        return "Neutral: No significant SMT divergence detected."

def calculate_smt_strength(nifty_df: pd.DataFrame, banknifty_df: pd.DataFrame) -> float:
    """
    Calculate current SMT strength

    Args:
        nifty_df: Recent Nifty data
        banknifty_df: Recent BankNifty data

    Returns:
        SMT strength score (0-1)
    """
    if len(nifty_df) < 5 or len(banknifty_df) < 5:
        return 0.0

    # Use 5-period lookback
    nifty_recent = nifty_df.tail(5)
    banknifty_recent = banknifty_df.tail(5)

    nifty_change = (nifty_recent['close'].iloc[-1] - nifty_recent['close'].iloc[0]) / nifty_recent['close'].iloc[0]
    banknifty_change = (banknifty_recent['close'].iloc[-1] - banknifty_recent['close'].iloc[0]) / banknifty_recent['close'].iloc[0]

    # Strength based on divergence magnitude
    divergence = abs(nifty_change - banknifty_change)

    # Normalize to 0-1 scale
    strength = min(divergence * 10, 1.0)  # 10% divergence = max strength

    return round(strength, 2)

def generate_smt_report(nifty_df: pd.DataFrame, banknifty_df: pd.DataFrame) -> Dict:
    """
    Generate comprehensive SMT analysis report

    Args:
        nifty_df: Nifty data
        banknifty_df: BankNifty data

    Returns:
        SMT analysis report
    """
    current_smt = detect_smt(nifty_df, banknifty_df, lookback=5)
    strength = calculate_smt_strength(nifty_df, banknifty_df)

    if current_smt:
        latest_smt = current_smt[-1]
        smt_status = classify_smt(latest_smt['type'])
        direction_bias = 'bullish' if 'bullish' in latest_smt['type'] else 'bearish'
    else:
        smt_status = "No significant SMT divergence currently"
        direction_bias = 'neutral'

    return {
        'smt_status': smt_status,
        'direction_bias': direction_bias,
        'strength': strength,
        'latest_signal': current_smt[-1] if current_smt else None,
        'analysis_period': '5-period lookback',
        'interpretation': _interpret_smt_strength(strength, direction_bias)
    }

def _calculate_smt_strength(nifty_change: float, banknifty_change: float) -> float:
    """Calculate SMT signal strength"""
    divergence = abs(nifty_change - banknifty_change)

    # Weight the divergence
    if divergence > 0.005:  # >0.5% divergence
        strength = min(divergence * 50, 1.0)  # Scale to 0-1
    else:
        strength = 0.0

    return round(strength, 2)

def _interpret_smt_strength(strength: float, bias: str) -> str:
    """Interpret SMT strength for trading"""
    if strength > 0.7:
        level = "Strong"
        action = "High conviction trades in bias direction"
    elif strength > 0.4:
        level = "Moderate"
        action = "Moderate position sizing, watch for confirmation"
    elif strength > 0.2:
        level = "Weak"
        action = "Small positions only, monitor closely"
    else:
        level = "None"
        action = "No SMT bias, use other analysis"
        bias = "neutral"

    return f"{level} SMT signal ({bias} bias). {action}."

# Utility functions
def get_smt_history(nifty_df: pd.DataFrame, banknifty_df: pd.DataFrame,
                   days: int = 30) -> pd.DataFrame:
    """
    Get historical SMT signals

    Args:
        nifty_df: Historical Nifty data
        banknifty_df: Historical BankNifty data
        days: Number of days to analyze

    Returns:
        DataFrame with SMT history
    """
    # Filter to last N days
    end_date = nifty_df.index[-1]
    start_date = end_date - pd.Timedelta(days=days)

    nifty_filtered = nifty_df[nifty_df.index >= start_date]
    banknifty_filtered = banknifty_df[banknifty_df.index >= start_date]

    smt_history = detect_smt(nifty_filtered, banknifty_df, lookback=5)

    return pd.DataFrame(smt_history)

def smt_success_rate(smt_signals: List[Dict], nifty_df: pd.DataFrame) -> float:
    """
    Calculate SMT signal success rate

    Args:
        smt_signals: List of SMT signals
        nifty_df: Nifty data for verification

    Returns:
        Success rate (0-1)
    """
    if not smt_signals:
        return 0.0

    successful_signals = 0

    for signal in smt_signals:
        signal_time = signal['timestamp']

        # Check price movement 1 hour after signal
        future_data = nifty_df[nifty_df.index > signal_time].head(60)  # ~1 hour

        if future_data.empty:
            continue

        start_price = nifty_df.loc[signal_time]['close']
        end_price = future_data['close'].iloc[-1]

        price_change = (end_price - start_price) / start_price

        # Check if signal direction was correct
        if signal['type'] == 'bullish_smt' and price_change > 0.001:
            successful_signals += 1
        elif signal['type'] == 'bearish_smt' and price_change < -0.001:
            successful_signals += 1

    return successful_signals / len(smt_signals) if smt_signals else 0.0
