"""Lightweight backtesting framework for Indian F&O strategies — NotSoSEBI."""

from __future__ import annotations

import numpy as np
import pandas as pd

from shared.indian_market_utils import calculate_total_charges


class BacktestEngine:
    """
    Run a backtest from a signals DataFrame.

    Required columns: date, entry_price, exit_price, side ('long'|'short'), quantity
    Optional column: segment (default 'futures') — passed to cost calculator
    """

    def __init__(self, signals: pd.DataFrame, segment: str = "futures") -> None:
        required = {"date", "entry_price", "exit_price", "side", "quantity"}
        missing = required - set(signals.columns)
        if missing:
            raise ValueError(f"Missing columns: {missing}")
        self.signals = signals.copy()
        self.segment = segment
        self.results: pd.DataFrame = pd.DataFrame()

    def run(self) -> pd.DataFrame:
        """Execute backtest, compute per-trade P&L net of costs, return results."""
        df = self.signals.copy()
        df["gross_pnl"] = df.apply(
            lambda r: (r.exit_price - r.entry_price) * r.quantity
            if r.side == "long"
            else (r.entry_price - r.exit_price) * r.quantity,
            axis=1,
        )
        seg = df["segment"] if "segment" in df.columns else self.segment
        df["entry_cost"] = df.apply(
            lambda r: calculate_total_charges(r.entry_price * r.quantity, seg if isinstance(seg, str) else r.segment)["total"], axis=1,
        )
        df["exit_cost"] = df.apply(
            lambda r: calculate_total_charges(r.exit_price * r.quantity, seg if isinstance(seg, str) else r.segment)["total"], axis=1,
        )
        df["net_pnl"] = df["gross_pnl"] - df["entry_cost"] - df["exit_cost"]
        df["cumulative_pnl"] = df["net_pnl"].cumsum()
        df["peak"] = df["cumulative_pnl"].cummax()
        df["drawdown"] = df["cumulative_pnl"] - df["peak"]
        self.results = df
        return df

    def metrics(self) -> dict:
        """Compute summary metrics from backtest results."""
        if self.results.empty:
            self.run()
        df = self.results
        wins = df[df["net_pnl"] > 0]
        losses = df[df["net_pnl"] <= 0]
        total_profit = wins["net_pnl"].sum()
        total_loss = abs(losses["net_pnl"].sum())
        n = len(df)
        daily_returns = df["net_pnl"]
        sharpe = (
            (daily_returns.mean() / daily_returns.std()) * np.sqrt(252)
            if daily_returns.std() > 0 else 0.0
        )
        return {
            "total_trades": n,
            "winning_trades": len(wins),
            "losing_trades": len(losses),
            "win_rate": round(len(wins) / n * 100, 2) if n else 0.0,
            "total_pnl": round(float(df["net_pnl"].sum()), 2),
            "avg_pnl": round(float(df["net_pnl"].mean()), 2) if n else 0.0,
            "max_drawdown": round(float(df["drawdown"].min()), 2),
            "profit_factor": round(total_profit / total_loss, 2) if total_loss > 0 else float("inf"),
            "sharpe_ratio": round(float(sharpe), 2),
            "gross_pnl": round(float(df["gross_pnl"].sum()), 2),
            "total_costs": round(float(df["entry_cost"].sum() + df["exit_cost"].sum()), 2),
        }

    def equity_curve(self) -> pd.DataFrame:
        """Return date + cumulative P&L for plotting."""
        if self.results.empty:
            self.run()
        return self.results[["date", "cumulative_pnl"]].copy()