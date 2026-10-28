"""
VCP Strategy Backtester
Backtests VCP breakout strategies on historical NSE data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any
import pytz
from dataclasses import dataclass
from enum import Enum

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils
from .vcp_detector import VCPResult, VCPQuality, detect_vcp


class TradeType(Enum):
    LONG = "LONG"
    SHORT = "SHORT"


@dataclass
class Trade:
    """Represents a single trade"""
    symbol: str
    entry_date: datetime
    exit_date: Optional[datetime]
    entry_price: float
    exit_price: Optional[float]
    trade_type: TradeType
    quantity: int
    vcp_score: int
    vcp_grade: VCPQuality
    stop_loss: float
    target_price: Optional[float]
    pnl: Optional[float] = None
    pnl_pct: Optional[float] = None
    holding_days: Optional[int] = None
    exit_reason: Optional[str] = None


@dataclass
class BacktestResult:
    """Complete backtest results"""
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    avg_win_pct: float
    avg_loss_pct: float
    profit_factor: float
    max_drawdown: float
    total_return_pct: float
    sharpe_ratio: float
    trades: List[Trade]
    equity_curve: List[Tuple[datetime, float]]


class VCPBacktester:
    """
    VCP Strategy Backtester
    Tests VCP breakout strategies on historical data
    """

    def __init__(self):
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()

    def backtest_strategy(self, symbols: List[str], start_date: datetime, end_date: datetime,
                         min_vcp_score: int = 70, position_size_pct: float = 0.1,
                         stop_loss_pct: float = 0.05, target_pct: float = 0.15,
                         max_holding_days: int = 30) -> BacktestResult:
        """
        Backtest VCP breakout strategy

        Args:
            symbols: List of symbols to test
            start_date: Backtest start date
            end_date: Backtest end date
            min_vcp_score: Minimum VCP score to enter trades
            position_size_pct: Position size as % of portfolio
            stop_loss_pct: Stop loss percentage
            target_pct: Profit target percentage
            max_holding_days: Maximum holding period

        Returns:
            BacktestResult with complete analysis
        """
        all_trades = []
        portfolio_value = 100000.0  # Starting capital
        equity_curve = [(start_date, portfolio_value)]

        for symbol in symbols:
            try:
                print(f"Backtesting {symbol}...")

                # Get historical data
                df = self.data_fetcher.fetch_ohlcv(symbol, start_date, end_date)
                if df is None or len(df) < 200:
                    continue

                # Find VCP setups and simulate trades
                trades = self._backtest_symbol(df, symbol, min_vcp_score, position_size_pct,
                                             stop_loss_pct, target_pct, max_holding_days)

                all_trades.extend(trades)

                # Update equity curve (simplified - no position sizing)
                for trade in trades:
                    if trade.pnl:
                        portfolio_value += trade.pnl
                        if trade.exit_date:
                            equity_curve.append((trade.exit_date, portfolio_value))

            except Exception as e:
                print(f"Error backtesting {symbol}: {e}")
                continue

        # Calculate performance metrics
        return self._calculate_metrics(all_trades, equity_curve)

    def _backtest_symbol(self, df: pd.DataFrame, symbol: str, min_score: int,
                        position_size_pct: float, stop_loss_pct: float, target_pct: float,
                        max_holding_days: int) -> List[Trade]:
        """
        Backtest VCP strategy for a single symbol

        Args:
            df: Historical OHLCV data
            symbol: Stock symbol
            min_score: Minimum VCP score
            position_size_pct: Position size percentage
            stop_loss_pct: Stop loss percentage
            target_pct: Target percentage
            max_holding_days: Maximum holding days

        Returns:
            List of trades for this symbol
        """
        trades = []
        lookback_window = 252  # 1 year lookback for VCP detection

        # Slide through the data
        for i in range(lookback_window, len(df) - max_holding_days, 5):  # Every 5 days
            try:
                # Get lookback data for VCP detection
                lookback_data = df.iloc[i-lookback_window:i+1].copy()

                # Detect VCP
                vcp_result = detect_vcp(symbol, lookback_data)

                if not vcp_result or vcp_result.score < min_score:
                    continue

                # Check if we're near the pivot (breakout setup)
                current_price = df.iloc[i]['close']  # type: ignore
                pivot_level = vcp_result.pivot_level

                # Only enter if price is within 2% of pivot
                price_diff_pct = abs(current_price - pivot_level) / pivot_level
                if price_diff_pct > 0.02:  # type: ignore
                    continue

                # Enter long position
                entry_date = df.index[i].to_pydatetime()  # type: ignore
                entry_price = df.iloc[i]['open']  # type: ignore

                if i + 1 >= len(df):
                    continue

                # Calculate position size
                portfolio_value = 100000.0  # Simplified
                position_value = portfolio_value * position_size_pct
                quantity = int(position_value / entry_price)  # type: ignore

                if quantity == 0:
                    continue

                # Set stop loss and target
                stop_loss = entry_price * (1 - stop_loss_pct)  # type: ignore
                target_price = entry_price * (1 + target_pct)  # type: ignore

                # Simulate trade
                trade = Trade(
                    symbol=symbol,
                    entry_date=entry_date,
                    exit_date=None,
                    entry_price=entry_price,  # type: ignore
                    exit_price=None,
                    trade_type=TradeType.LONG,
                    quantity=quantity,
                    vcp_score=vcp_result.score,
                    vcp_grade=vcp_result.grade,
                    stop_loss=stop_loss,  # type: ignore
                    target_price=target_price  # type: ignore
                )

                # Simulate holding period
                exit_reason = None
                exit_price = None
                exit_date = None

                for j in range(i + 1, min(i + max_holding_days + 1, len(df))):
                    daily_high = df.iloc[j]['high']  # type: ignore
                    daily_low = df.iloc[j]['low']  # type: ignore
                    daily_close = df.iloc[j]['close']  # type: ignore

                    # Check stop loss
                    if daily_low <= stop_loss:  # type: ignore
                        exit_price = stop_loss
                        exit_reason = "Stop Loss"
                        exit_date = df.index[j].to_pydatetime()  # type: ignore
                        break

                    # Check target
                    if daily_high >= target_price:  # type: ignore
                        exit_price = target_price
                        exit_reason = "Target Hit"
                        exit_date = df.index[j].to_pydatetime()  # type: ignore
                        break

                # If still holding at end of period, exit at close
                if exit_price is None:
                    exit_price = df.iloc[min(i + max_holding_days, len(df) - 1)]['close']  # type: ignore
                    exit_reason = "Time Exit"
                    exit_date = df.index[min(i + max_holding_days, len(df) - 1)].to_pydatetime()  # type: ignore

                # Calculate P&L
                trade.exit_price = exit_price  # type: ignore
                trade.exit_date = exit_date
                trade.pnl = (exit_price - entry_price) * quantity  # type: ignore
                trade.pnl_pct = (exit_price - entry_price) / entry_price * 100  # type: ignore
                trade.holding_days = (exit_date - entry_date).days if exit_date else max_holding_days
                trade.exit_reason = exit_reason

                trades.append(trade)

            except Exception as e:
                continue

        return trades

    def _calculate_metrics(self, trades: List[Trade],
                          equity_curve: List[Tuple[datetime, float]]) -> BacktestResult:
        """
        Calculate backtest performance metrics

        Args:
            trades: List of all trades
            equity_curve: Portfolio value over time

        Returns:
            BacktestResult with metrics
        """
        if not trades:
            return BacktestResult(0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, [], [])

        # Basic trade statistics
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t.pnl and t.pnl > 0])
        losing_trades = len([t for t in trades if t.pnl and t.pnl < 0])

        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        # P&L statistics
        winning_pnl = [t.pnl for t in trades if t.pnl and t.pnl > 0]
        losing_pnl = [t.pnl for t in trades if t.pnl and t.pnl < 0]

        avg_win_pct = np.mean([t.pnl_pct for t in trades if t.pnl and t.pnl > 0]) if winning_pnl else 0
        avg_loss_pct = np.mean([t.pnl_pct for t in trades if t.pnl and t.pnl < 0]) if losing_pnl else 0

        # Profit factor
        total_profit = sum(winning_pnl) if winning_pnl else 0
        total_loss = abs(sum(losing_pnl)) if losing_pnl else 0
        profit_factor = total_profit / total_loss if total_loss > 0 else float('inf')

        # Drawdown calculation
        max_drawdown = self._calculate_max_drawdown(equity_curve)

        # Total return
        if equity_curve:
            initial_value = equity_curve[0][1]
            final_value = equity_curve[-1][1]
            total_return_pct = (final_value - initial_value) / initial_value * 100
        else:
            total_return_pct = 0

        # Sharpe ratio (simplified, assuming 5% risk-free rate)
        if trades:
            returns = [t.pnl_pct for t in trades if t.pnl_pct]
            if returns:
                avg_return = np.mean(returns)
                std_return = np.std(returns)
                sharpe_ratio = (avg_return - 5) / std_return if std_return > 0 else 0
            else:
                sharpe_ratio = 0
        else:
            sharpe_ratio = 0

        return BacktestResult(
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=win_rate,
            avg_win_pct=avg_win_pct,
            avg_loss_pct=avg_loss_pct,
            profit_factor=profit_factor,
            max_drawdown=max_drawdown,
            total_return_pct=total_return_pct,
            sharpe_ratio=sharpe_ratio,
            trades=trades,
            equity_curve=equity_curve
        )

    def _calculate_max_drawdown(self, equity_curve: List[Tuple[datetime, float]]) -> float:
        """
        Calculate maximum drawdown from equity curve

        Args:
            equity_curve: List of (date, value) tuples

        Returns:
            Maximum drawdown percentage
        """
        if not equity_curve:
            return 0.0

        values = [v for _, v in equity_curve]
        peak = values[0]
        max_drawdown = 0.0

        for value in values:
            if value > peak:
                peak = value
            drawdown = (peak - value) / peak * 100
            max_drawdown = max(max_drawdown, drawdown)

        return max_drawdown

    def generate_backtest_report(self, result: BacktestResult) -> Dict[str, Any]:
        """
        Generate detailed backtest report

        Args:
            result: BacktestResult object

        Returns:
            Dictionary with formatted report data
        """
        report = {
            'summary': {
                'total_trades': result.total_trades,
                'win_rate': ".1f",
                'total_return': ".1f",
                'max_drawdown': ".1f",
                'profit_factor': ".2f",
                'sharpe_ratio': ".2f",
                'avg_win': ".1f",
                'avg_loss': ".1f"
            },
            'trade_analysis': {
                'best_trade': max(result.trades, key=lambda x: x.pnl or 0) if result.trades else None,
                'worst_trade': min(result.trades, key=lambda x: x.pnl or 0) if result.trades else None,
                'avg_holding_days': np.mean([t.holding_days for t in result.trades if t.holding_days]) if result.trades else 0,
                'grade_distribution': self._analyze_grade_performance(result.trades)
            },
            'equity_curve': result.equity_curve,
            'monthly_returns': self._calculate_monthly_returns(result.equity_curve)
        }

        return report

    def _analyze_grade_performance(self, trades: List[Trade]) -> Dict[str, Dict[str, float]]:
        """
        Analyze performance by VCP grade

        Args:
            trades: List of trades

        Returns:
            Dictionary with grade-wise performance
        """
        grade_stats = {}

        for grade in VCPQuality:
            grade_trades = [t for t in trades if t.vcp_grade == grade]
            if grade_trades:
                winning = len([t for t in grade_trades if t.pnl and t.pnl > 0])
                win_rate = winning / len(grade_trades)
                avg_pnl = np.mean([t.pnl for t in grade_trades if t.pnl])

                grade_stats[grade.value] = {
                    'trades': len(grade_trades),
                    'win_rate': win_rate,
                    'avg_pnl': avg_pnl
                }

        return grade_stats

    def _calculate_monthly_returns(self, equity_curve: List[Tuple[datetime, float]]) -> Dict[str, float]:
        """
        Calculate monthly returns from equity curve

        Args:
            equity_curve: List of (date, value) tuples

        Returns:
            Dictionary with monthly returns
        """
        if not equity_curve:
            return {}

        df = pd.DataFrame(equity_curve, columns=['date', 'value'])
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

        monthly = df.resample('M').last()
        monthly_returns = monthly.pct_change() * 100

        return monthly_returns['value'].to_dict()


def main():
    """Main function for command-line backtesting"""
    backtester = VCPBacktester()

    # Test parameters
    symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']
    start_date = datetime(2020, 1, 1, tzinfo=pytz.timezone('Asia/Kolkata'))
    end_date = datetime(2023, 12, 31, tzinfo=pytz.timezone('Asia/Kolkata'))

    print("Starting VCP Strategy Backtest...")
    print("=" * 50)
    print(f"Symbols: {', '.join(symbols)}")
    print(f"Period: {start_date.date()} to {end_date.date()}")
    print("=" * 50)

    # Run backtest
    result = backtester.backtest_strategy(
        symbols=symbols,
        start_date=start_date,
        end_date=end_date,
        min_vcp_score=70,
        position_size_pct=0.1,
        stop_loss_pct=0.05,
        target_pct=0.15,
        max_holding_days=30
    )

    # Generate report
    report = backtester.generate_backtest_report(result)

    # Print summary
    print("\nBACKTEST RESULTS")
    print("=" * 50)
    summary = report['summary']
    for key, value in summary.items():
        print("<20")

    # Grade analysis
    print(f"\nPerformance by VCP Grade:")
    print("-" * 40)
    for grade, stats in report['trade_analysis']['grade_distribution'].items():
        print("<8")

    # Save detailed results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"vcp_backtest_{timestamp}.json"

    import json
    with open(filename, 'w') as f:
        # Convert trades to serializable format
        serializable_result = {
            'summary': report['summary'],
            'trade_analysis': {
                'best_trade': {
                    'symbol': report['trade_analysis']['best_trade'].symbol,
                    'pnl': report['trade_analysis']['best_trade'].pnl,
                    'pnl_pct': report['trade_analysis']['best_trade'].pnl_pct
                } if report['trade_analysis']['best_trade'] else None,
                'worst_trade': {
                    'symbol': report['trade_analysis']['worst_trade'].symbol,
                    'pnl': report['trade_analysis']['worst_trade'].pnl,
                    'pnl_pct': report['trade_analysis']['worst_trade'].pnl_pct
                } if report['trade_analysis']['worst_trade'] else None,
                'avg_holding_days': report['trade_analysis']['avg_holding_days'],
                'grade_distribution': report['trade_analysis']['grade_distribution']
            }
        }
        json.dump(serializable_result, f, indent=2, default=str)

    print(f"\nDetailed results saved to {filename}")


if __name__ == "__main__":
    main()
