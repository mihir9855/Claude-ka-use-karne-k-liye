"""Flow Correlation Analyzer — NotSoSEBI."""

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple


def calculate_flow_nifty_correlation(fii_df: pd.DataFrame, nifty_df: pd.DataFrame, window: int = 20) -> pd.Series:
    """Calculate rolling correlation between FII flows and Nifty returns."""
    merged = pd.merge(fii_df, nifty_df, on='date', how='inner')
    merged['nifty_returns'] = merged['nifty'].pct_change()
    return merged['fii_flow'].rolling(window=window).corr(merged['nifty_returns'])


def detect_divergence(fii_df: pd.DataFrame, nifty_df: pd.DataFrame) -> pd.DataFrame:
    """Detect days where FII sells but Nifty rises or vice versa."""
    merged = pd.merge(fii_df, nifty_df, on='date', how='inner')
    merged['nifty_change'] = merged['nifty'].pct_change()
    merged['fii_direction'] = np.where(merged['fii_flow'] > 0, 'buy', 'sell')
    merged['nifty_direction'] = np.where(merged['nifty_change'] > 0, 'up', 'down')

    divergences = merged[
        ((merged['fii_direction'] == 'sell') & (merged['nifty_direction'] == 'up')) |
        ((merged['fii_direction'] == 'buy') & (merged['nifty_direction'] == 'down'))
    ]

    return divergences[['date', 'fii_flow', 'nifty_change', 'fii_direction', 'nifty_direction']].copy()


def generate_flow_report(fii_df: pd.DataFrame, dii_df: pd.DataFrame, nifty_df: pd.DataFrame) -> str:
    """Generate markdown summary with key flow insights."""
    # Calculate key metrics
    total_fii = fii_df['fii_flow'].sum()
    total_dii = dii_df['dii_flow'].sum()
    net_flow = total_fii + total_dii

    # Correlation
    corr = calculate_flow_nifty_correlation(fii_df, nifty_df).iloc[-1]

    # Divergences
    divergences = detect_divergence(fii_df, nifty_df)

    report = f"""# FII/DII Flow Correlation Report

## Summary Metrics
- **FII Net Flow:** ₹{total_fii:,.0f} Cr
- **DII Net Flow:** ₹{total_dii:,.0f} Cr
- **Net Institutional:** ₹{net_flow:,.0f} Cr
- **FII-Nifty Correlation:** {corr:.2f}

## Key Insights
- **Dominant Force:** {'FII' if abs(total_fii) > abs(total_dii) else 'DII'}
- **Market Direction:** {'Bullish' if net_flow > 0 else 'Bearish'}
- **Correlation Strength:** {'Strong' if abs(corr) > 0.7 else 'Moderate' if abs(corr) > 0.4 else 'Weak'}

## Recent Divergences
Found {len(divergences)} divergence signals in the last period.
"""
    return report
