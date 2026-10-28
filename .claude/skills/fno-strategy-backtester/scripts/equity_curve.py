"""Equity Curve Analysis — NotSoSEBI."""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from typing import Dict, Any

def plot_equity_curve(trades_df: pd.DataFrame) -> None:
    """Generate matplotlib chart of equity curve."""
    equity = (1 + trades_df['pnl_pct']).cumprod()
    plt.figure(figsize=(12, 6))
    plt.plot(equity.index, equity.values)
    plt.title('Equity Curve')
    plt.xlabel('Date')
    plt.ylabel('Portfolio Value')
    plt.grid(True)
    plt.show()

def calculate_drawdown_series(equity_series: pd.Series) -> pd.Series:
    """Calculate drawdown at each point."""
    peak = equity_series.expanding().max()
    return (equity_series - peak) / peak

def find_max_drawdown(equity_series: pd.Series) -> Dict[str, Any]:
    """Find maximum drawdown with start/end dates."""
    drawdown = calculate_drawdown_series(equity_series)
    max_dd = drawdown.min()
    end_idx = drawdown.idxmin()
    peak_before = equity_series[:end_idx].expanding().max()
    start_idx = peak_before.idxmax()
    return {'max_drawdown': max_dd, 'start_date': start_idx, 'end_date': end_idx}

def calculate_monthly_returns(trades_df: pd.DataFrame) -> pd.DataFrame:
    """Calculate month-wise P&L table."""
    monthly = trades_df.groupby(pd.Grouper(freq='M'))['pnl'].sum()
    return monthly.to_frame('monthly_pnl')

def generate_tearsheet(trades_df: pd.DataFrame) -> str:
    """Generate complete markdown performance report."""
    equity = (1 + trades_df['pnl_pct']).cumprod()
    total_return = equity.iloc[-1] - 1
    annualized_return = (1 + total_return) ** (252 / len(equity)) - 1
    volatility = equity.pct_change().std() * np.sqrt(252)
    sharpe = annualized_return / volatility if volatility > 0 else 0
    max_dd_info = find_max_drawdown(equity)
    win_rate = (trades_df['pnl'] > 0).mean()
    report = f"""# Performance Tearsheet

## Summary Metrics
- Total Return: {total_return:.2%}
- Annualized Return: {annualized_return:.2%}
- Volatility: {volatility:.2%}
- Sharpe Ratio: {sharpe:.2f}
- Max Drawdown: {max_dd_info['max_drawdown']:.2%}
- Win Rate: {win_rate:.2%}

## Risk Metrics
- Max DD Start: {max_dd_info['start_date']}
- Max DD End: {max_dd_info['end_date']}
"""
    return report
