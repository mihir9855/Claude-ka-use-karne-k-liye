#!/usr/bin/env python3
"""
Performance Analyzer for Prop Trading Journal
Advanced analytics and reporting for trading performance optimization
"""

import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import pytz
import json
from dataclasses import dataclass
from enum import Enum

class TimeFrame(Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"

class MetricType(Enum):
    RETURNS = "RETURNS"
    RISK = "RISK"
    EFFICIENCY = "EFFICIENCY"
    PSYCHOLOGICAL = "PSYCHOLOGICAL"

@dataclass
class PerformanceMetrics:
    """Performance metrics data structure"""
    total_return: float
    annualized_return: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    calmar_ratio: float
    win_rate: float
    profit_factor: float
    expectancy: float
    total_trades: int
    avg_trade_duration: float

class PerformanceAnalyzer:
    """Advanced performance analysis system"""

    def __init__(self, db_path: str = "trading_journal.db"):
        """
        Initialize performance analyzer

        Args:
            db_path: Path to trading journal database
        """
        self.db_path = db_path
        self.ist_tz = pytz.timezone('Asia/Kolkata')

    def get_trades_dataframe(self, days: int = 90) -> pd.DataFrame:
        """
        Get trades data as pandas DataFrame

        Args:
            days: Number of days to look back

        Returns:
            DataFrame with trade data
        """
        start_date = datetime.now(self.ist_tz) - timedelta(days=days)

        with sqlite3.connect(self.db_path) as conn:
            query = '''
                SELECT * FROM trades
                WHERE entry_time >= ?
                AND exit_time IS NOT NULL
                ORDER BY entry_time ASC
            '''
            df = pd.read_sql_query(query, conn, params=(start_date.isoformat(),))

        # Convert datetime columns
        df['entry_time'] = pd.to_datetime(df['entry_time'])
        df['exit_time'] = pd.to_datetime(df['exit_time'])
        df['created_at'] = pd.to_datetime(df['created_at'])

        return df

    def calculate_performance_metrics(self, df: pd.DataFrame) -> PerformanceMetrics:
        """
        Calculate comprehensive performance metrics

        Args:
            df: DataFrame with trade data

        Returns:
            PerformanceMetrics object
        """
        if df.empty or df['pnl'].isna().all():
            return PerformanceMetrics(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

        # Basic metrics
        total_return = df['pnl'].sum()
        total_trades = len(df)

        # Time-weighted metrics
        days_in_period = (df['exit_time'].max() - df['entry_time'].min()).days
        annualized_return = (total_return / (days_in_period / 365)) if days_in_period > 0 else 0

        # Risk metrics
        returns = df['pnl_percentage'].dropna()
        volatility = returns.std() * np.sqrt(252)  # Annualized volatility

        # Sharpe ratio (assuming 4% risk-free rate)
        risk_free_rate = 0.04
        sharpe_ratio = (annualized_return - risk_free_rate) / volatility if volatility > 0 else 0

        # Sortino ratio (downside deviation)
        downside_returns = returns[returns < 0]
        downside_deviation = downside_returns.std() * np.sqrt(252) if not downside_returns.empty else 0
        sortino_ratio = (annualized_return - risk_free_rate) / downside_deviation if downside_deviation > 0 else 0

        # Maximum drawdown
        cumulative = (1 + returns / 100).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min() * 100

        # Calmar ratio
        calmar_ratio = annualized_return / abs(max_drawdown) if max_drawdown != 0 else 0

        # Trading metrics
        winning_trades = df[df['pnl'] > 0]
        win_rate = len(winning_trades) / total_trades * 100 if total_trades > 0 else 0

        gross_profit = winning_trades['pnl'].sum() if not winning_trades.empty else 0
        gross_loss = abs(df[df['pnl'] < 0]['pnl'].sum()) if not df[df['pnl'] < 0].empty else 0
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')

        # Expectancy
        avg_win = winning_trades['pnl'].mean() if not winning_trades.empty else 0
        avg_loss = abs(df[df['pnl'] < 0]['pnl'].mean()) if not df[df['pnl'] < 0].empty else 0
        win_rate_decimal = win_rate / 100
        expectancy = (win_rate_decimal * avg_win) - ((1 - win_rate_decimal) * avg_loss)

        # Average trade duration
        avg_trade_duration = df['holding_period_minutes'].mean()

        return PerformanceMetrics(
            total_return=total_return,
            annualized_return=annualized_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            max_drawdown=max_drawdown,
            calmar_ratio=calmar_ratio,
            win_rate=win_rate,
            profit_factor=profit_factor,
            expectancy=expectancy,
            total_trades=total_trades,
            avg_trade_duration=avg_trade_duration
        )

    def analyze_strategy_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze performance by strategy

        Args:
            df: DataFrame with trade data

        Returns:
            Dictionary with strategy analysis
        """
        if df.empty:
            return {}

        strategy_analysis = {}

        for strategy in df['strategy'].unique():
            strategy_df = df[df['strategy'] == strategy]
            metrics = self.calculate_performance_metrics(strategy_df)

            strategy_analysis[strategy] = {
                'metrics': metrics,
                'trade_count': len(strategy_df),
                'best_trade': strategy_df['pnl'].max(),
                'worst_trade': strategy_df['pnl'].min(),
                'avg_trade': strategy_df['pnl'].mean(),
                'total_pnl': strategy_df['pnl'].sum()
            }

        return strategy_analysis

    def analyze_psychological_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze performance correlation with psychological factors

        Args:
            df: DataFrame with trade data

        Returns:
            Dictionary with psychological analysis
        """
        if df.empty:
            return {}

        # Get psychological data
        with sqlite3.connect(self.db_path) as conn:
            psych_df = pd.read_sql_query('SELECT * FROM psychological_metrics', conn)

        if psych_df.empty:
            return {'error': 'No psychological data available'}

        psych_df['metric_date'] = pd.to_datetime(psych_df['metric_date'])

        analysis = {}

        # Correlation between confidence and P&L
        if 'confidence_level' in df.columns and not df['pnl'].isna().all():
            confidence_corr = df['confidence_level'].corr(df['pnl'])
            analysis['confidence_pnl_correlation'] = confidence_corr

        # Average performance by emotional state
        emotion_performance = {}
        for emotion in df['entry_emotion'].unique():
            emotion_df = df[df['entry_emotion'] == emotion]
            if not emotion_df.empty:
                emotion_performance[emotion] = {
                    'avg_pnl': emotion_df['pnl'].mean(),
                    'win_rate': (emotion_df['pnl'] > 0).mean() * 100,
                    'trade_count': len(emotion_df)
                }

        analysis['emotion_performance'] = emotion_performance

        # Stress level analysis
        if not psych_df['stress_level'].isna().all():
            stress_pnl_corr = psych_df['stress_level'].corr(psych_df['market_confidence']) if 'market_confidence' in psych_df.columns else 0
            analysis['stress_confidence_correlation'] = stress_pnl_corr

        return analysis

    def generate_performance_report(self, days: int = 30) -> Dict[str, Any]:
        """
        Generate comprehensive performance report

        Args:
            days: Number of days for analysis

        Returns:
            Comprehensive performance report
        """
        df = self.get_trades_dataframe(days)

        if df.empty:
            return {'error': 'No trade data available for the specified period'}

        # Overall metrics
        overall_metrics = self.calculate_performance_metrics(df)

        # Strategy analysis
        strategy_analysis = self.analyze_strategy_performance(df)

        # Psychological analysis
        psychological_analysis = self.analyze_psychological_performance(df)

        # Time-based analysis
        time_analysis = self.analyze_time_based_performance(df)

        # Risk analysis
        risk_analysis = self.analyze_risk_metrics(df)

        report = {
            'period_days': days,
            'report_date': datetime.now(self.ist_tz).isoformat(),
            'overall_metrics': overall_metrics,
            'strategy_analysis': strategy_analysis,
            'psychological_analysis': psychological_analysis,
            'time_analysis': time_analysis,
            'risk_analysis': risk_analysis,
            'recommendations': self.generate_recommendations(overall_metrics, strategy_analysis)
        }

        return report

    def analyze_time_based_performance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze performance across different time periods

        Args:
            df: DataFrame with trade data

        Returns:
            Time-based performance analysis
        """
        if df.empty:
            return {}

        # Daily performance
        df['date'] = df['entry_time'].dt.date
        daily_pnl = df.groupby('date')['pnl'].sum()

        # Hourly performance
        df['hour'] = df['entry_time'].dt.hour
        hourly_performance = df.groupby('hour').agg({
            'pnl': ['count', 'sum', 'mean'],
            'pnl_percentage': 'std'
        }).round(2)

        # Day of week performance
        df['day_of_week'] = df['entry_time'].dt.day_name()
        dow_performance = df.groupby('day_of_week').agg({
            'pnl': ['count', 'sum', 'mean'],
            'pnl_percentage': 'std'
        }).round(2)

        return {
            'daily_pnl': daily_pnl.to_dict(),
            'hourly_performance': hourly_performance.to_dict(),
            'day_of_week_performance': dow_performance.to_dict(),
            'best_day': daily_pnl.idxmax() if not daily_pnl.empty else None,
            'worst_day': daily_pnl.idxmin() if not daily_pnl.empty else None,
            'best_hour': hourly_performance[('pnl', 'mean')].idxmax() if not hourly_performance.empty else None,
            'worst_hour': hourly_performance[('pnl', 'mean')].idxmin() if not hourly_performance.empty else None
        }

    def analyze_risk_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze risk metrics and exposure

        Args:
            df: DataFrame with trade data

        Returns:
            Risk analysis dictionary
        """
        if df.empty:
            return {}

        returns = df['pnl_percentage'].dropna()

        # Value at Risk (95% confidence)
        var_95 = np.percentile(returns, 5)

        # Expected Shortfall (CVaR)
        cvar_95 = returns[returns <= var_95].mean()

        # Risk-adjusted metrics
        risk_analysis = {
            'value_at_risk_95': var_95,
            'conditional_var_95': cvar_95,
            'largest_loss': df['pnl'].min(),
            'avg_loss': df[df['pnl'] < 0]['pnl'].mean(),
            'loss_streak_max': self._calculate_max_streak(df, 'loss'),
            'win_streak_max': self._calculate_max_streak(df, 'win'),
            'recovery_factor': self._calculate_recovery_factor(df)
        }

        return risk_analysis

    def _calculate_max_streak(self, df: pd.DataFrame, streak_type: str) -> int:
        """
        Calculate maximum winning or losing streak

        Args:
            df: DataFrame with trade data
            streak_type: 'win' or 'loss'

        Returns:
            Maximum streak length
        """
        if df.empty:
            return 0

        if streak_type == 'win':
            results = (df['pnl'] > 0).astype(int)
        else:
            results = (df['pnl'] < 0).astype(int)

        max_streak = 0
        current_streak = 0

        for result in results:
            if result == 1:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0

        return max_streak

    def _calculate_recovery_factor(self, df: pd.DataFrame) -> float:
        """
        Calculate recovery factor (net profit / max drawdown)

        Args:
            df: DataFrame with trade data

        Returns:
            Recovery factor
        """
        if df.empty:
            return 0

        returns = df['pnl_percentage'].dropna()
        if returns.empty:
            return 0

        cumulative = (1 + returns / 100).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = abs(drawdown.min())

        net_profit = df['pnl'].sum()

        return net_profit / max_drawdown if max_drawdown > 0 else 0

    def generate_recommendations(self, metrics: PerformanceMetrics,
                               strategy_analysis: Dict[str, Any]) -> List[str]:
        """
        Generate performance improvement recommendations

        Args:
            metrics: Overall performance metrics
            strategy_analysis: Strategy-specific analysis

        Returns:
            List of recommendations
        """
        recommendations = []

        # Win rate recommendations
        if metrics.win_rate < 50:
            recommendations.append("Focus on improving trade selection criteria - current win rate is below 50%")
        elif metrics.win_rate > 70:
            recommendations.append("Excellent win rate - consider scaling up position sizes")

        # Risk management recommendations
        if metrics.max_drawdown > 20:
            recommendations.append("Implement stricter risk management - maximum drawdown exceeds 20%")
        elif metrics.max_drawdown < 10:
            recommendations.append("Good risk control - consider optimizing position sizing")

        # Sharpe ratio recommendations
        if metrics.sharpe_ratio < 1:
            recommendations.append("Improve risk-adjusted returns - Sharpe ratio below 1")
        elif metrics.sharpe_ratio > 2:
            recommendations.append("Excellent risk-adjusted performance - maintain current approach")

        # Strategy diversification
        if len(strategy_analysis) < 3:
            recommendations.append("Diversify trading strategies - currently using fewer than 3 strategies")
        elif len(strategy_analysis) > 5:
            recommendations.append("Consider consolidating strategies - currently using more than 5 strategies")

        # Profit factor recommendations
        if metrics.profit_factor < 1.5:
            recommendations.append("Work on improving profit factor - currently below 1.5")
        elif metrics.profit_factor > 2.5:
            recommendations.append("Strong profit factor - focus on consistency")

        return recommendations

    def export_report_to_json(self, report: Dict[str, Any], filename: str) -> bool:
        """
        Export performance report to JSON file

        Args:
            report: Performance report dictionary
            filename: Output filename

        Returns:
            Success status
        """
        try:
            # Convert dataclass objects to dictionaries
            serializable_report = self._make_serializable(report)
            with open(filename, 'w') as f:
                json.dump(serializable_report, f, indent=2, default=str)
            return True
        except Exception as e:
            print(f"Error exporting report: {e}")
            return False

    def _make_serializable(self, obj: Any) -> Any:
        """
        Make object serializable for JSON export

        Args:
            obj: Object to make serializable

        Returns:
            Serializable version of object
        """
        if isinstance(obj, dict):
            return {key: self._make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif hasattr(obj, '__dict__'):
            return self._make_serializable(obj.__dict__)
        elif isinstance(obj, (datetime, pd.Timestamp)):
            return obj.isoformat()
        else:
            return obj

# Example usage and testing
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = PerformanceAnalyzer()

    # Generate performance report
    report = analyzer.generate_performance_report(days=30)

    if 'error' not in report:
        print("=== Performance Report ===")
        metrics = report['overall_metrics']
        print(f"Total Return: ₹{metrics.total_return:.2f}")
        print(f"Win Rate: {metrics.win_rate:.1f}%")
        print(f"Sharpe Ratio: {metrics.sharpe_ratio:.2f}")
        print(f"Max Drawdown: {metrics.max_drawdown:.1f}%")
        print(f"Profit Factor: {metrics.profit_factor:.2f}")
        print(f"Total Trades: {metrics.total_trades}")

        print("\n=== Recommendations ===")
        for rec in report['recommendations']:
            print(f"• {rec}")

        # Export report
        success = analyzer.export_report_to_json(report, "performance_report.json")
        print(f"\nReport exported: {success}")
    else:
        print(f"Error: {report['error']}")
