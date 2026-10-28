"""F&O Backtesting Engine for Indian Markets — NotSoSEBI."""

import pandas as pd
import numpy as np
from typing import Dict, Any
from shared.indian_market_utils import calculate_total_charges


class BacktestEngine:
    """Professional backtesting engine for Indian F&O strategies."""

    def __init__(self, initial_capital: float = 1000000.0):
        self.initial_capital = initial_capital
        self.trades_df = None
        self.equity_curve = None

    def run(self, signals_df: pd.DataFrame) -> pd.DataFrame:
        """Run backtest on signals DataFrame with columns: date, symbol, entry_price, exit_price, side, quantity, segment"""
        trades = []
        for _, signal in signals_df.iterrows():
            gross_pnl = (signal.exit_price - signal.entry_price) * signal.quantity * signal.side
            entry_costs = calculate_total_charges(signal.entry_price * signal.quantity, signal.segment)
            exit_costs = calculate_total_charges(signal.exit_price * signal.quantity, signal.segment)
            total_costs = entry_costs['total'] + exit_costs['total']
            net_pnl = gross_pnl - total_costs
            trades.append({'date': signal.date, 'symbol': signal.symbol, 'gross_pnl': gross_pnl,
                         'costs': total_costs, 'net_pnl': net_pnl})

        self.trades_df = pd.DataFrame(trades)
        self.trades_df['date'] = pd.to_datetime(self.trades_df['date'])
        self.trades_df = self.trades_df.sort_values('date')
        self.trades_df['cumulative_pnl'] = self.trades_df['net_pnl'].cumsum()
        self.equity_curve = self.initial_capital + self.trades_df['cumulative_pnl']
        return self.trades_df

    def compute_metrics(self) -> Dict[str, Any]:
        """Compute comprehensive backtest performance metrics."""
        if self.trades_df is None or len(self.trades_df) == 0: return {}
        pnl_series = self.trades_df['net_pnl']
        winners = pnl_series[pnl_series > 0]
        losers = pnl_series[pnl_series < 0]
        total_pnl = pnl_series.sum()
        num_trades = len(pnl_series)
        win_rate = len(winners) / num_trades if num_trades > 0 else 0
        equity = self.equity_curve
        if equity is None or len(equity) == 0:
            max_drawdown = 0
        else:
            peak = equity.expanding().max()
            drawdown = (equity - peak) / peak
            max_drawdown = drawdown.min()
        daily_returns = pnl_series.groupby(self.trades_df['date'].dt.date).sum() / self.initial_capital
        sharpe_ratio = daily_returns.mean() / daily_returns.std() * np.sqrt(252) if len(daily_returns) > 1 else 0
        gross_profit = winners.sum() if len(winners) > 0 else 0
        gross_loss = abs(losers.sum()) if len(losers) > 0 else 0
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
        avg_winner = winners.mean() if len(winners) > 0 else 0
        avg_loser = losers.mean() if len(losers) > 0 else 0
        annualized_return = daily_returns.mean() * 252 if len(daily_returns) > 0 else 0
        calmar_ratio = annualized_return / abs(max_drawdown) if max_drawdown != 0 else float('inf')
        return {'total_pnl': round(total_pnl, 2), 'num_trades': num_trades, 'win_rate': round(win_rate, 3),
                'max_drawdown': round(max_drawdown, 4), 'sharpe_ratio': round(sharpe_ratio, 2),
                'profit_factor': round(profit_factor, 2), 'avg_winner': round(avg_winner, 2),
                'avg_loser': round(avg_loser, 2), 'calmar_ratio': round(calmar_ratio, 2)}
