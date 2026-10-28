#!/usr/bin/env python3
"""
Relative Strength Calculator
Calculates relative strength metrics for stocks vs market benchmark
"""

import pandas as pd
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple

class RelativeStrengthCalculator:
    """Calculate relative strength metrics for momentum analysis"""

    def __init__(self, benchmark_symbol: str = 'NIFTY_50'):
        self.benchmark = benchmark_symbol
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.rs_periods = [20, 50, 100, 200]  # Common RS periods

    def calculate_rs_ratio(self, stock_prices: pd.Series,
                          benchmark_prices: pd.Series) -> pd.Series:
        """Calculate RS Ratio: Stock/Benchmark"""
        # Ensure both series are aligned
        common_index = stock_prices.index.intersection(benchmark_prices.index)
        stock_aligned = stock_prices.loc[common_index]
        benchmark_aligned = benchmark_prices.loc[common_index]

        rs_ratio = stock_aligned / benchmark_aligned
        return rs_ratio

    def calculate_rs_momentum(self, rs_ratio: pd.Series,
                            periods: List[int] = None) -> Dict[str, pd.Series]:
        """Calculate RS momentum for different periods"""
        if periods is None:
            periods = self.rs_periods

        momentum_data = {}
        for period in periods:
            momentum = rs_ratio.pct_change(period)
            momentum_data[f'RS_Momentum_{period}D'] = momentum

        return momentum_data

    def calculate_rs_rank(self, rs_ratios: Dict[str, pd.Series],
                         lookback_days: int = 100) -> Dict[str, pd.Series]:
        """Calculate RS rank (percentile) for each stock"""
        ranks = {}

        # Get common date range
        all_dates = set()
        for rs_ratio in rs_ratios.values():
            all_dates.update(rs_ratio.index)
        common_dates = sorted(list(all_dates))[-lookback_days:]

        for symbol, rs_ratio in rs_ratios.items():
            # Rolling rank calculation
            rank_series = pd.Series(index=rs_ratio.index, dtype=float)

            for i in range(len(rs_ratio)):
                if i < lookback_days - 1:
                    continue

                window_data = rs_ratio.iloc[i-lookback_days+1:i+1]
                current_value = rs_ratio.iloc[i]

                # Calculate percentile rank
                rank = (window_data < current_value).sum() / len(window_data)
                rank_series.iloc[i] = rank

            ranks[f'{symbol}_RS_Rank'] = rank_series

        return ranks

    def identify_rs_leaders_laggards(self, rs_ratios: Dict[str, pd.Series],
                                   top_n: int = 10) -> Dict[str, List[str]]:
        """Identify RS leaders and laggards"""
        if not rs_ratios:
            return {'leaders': [], 'laggards': []}

        # Get latest RS values
        latest_rs = {}
        latest_date = None

        for symbol, rs_ratio in rs_ratios.items():
            if rs_ratio.empty:
                continue
            latest_rs[symbol] = rs_ratio.iloc[-1]
            if latest_date is None or rs_ratio.index[-1] > latest_date:
                latest_date = rs_ratio.index[-1]

        if not latest_rs:
            return {'leaders': [], 'laggards': []}

        # Sort by RS ratio
        sorted_stocks = sorted(latest_rs.items(), key=lambda x: x[1], reverse=True)

        leaders = [stock[0] for stock in sorted_stocks[:top_n]]
        laggards = [stock[0] for stock in sorted_stocks[-top_n:]]

        return {
            'leaders': leaders,
            'laggards': laggards,
            'date': latest_date.strftime('%Y-%m-%d') if latest_date else None
        }

    def generate_rs_report(self, stock_data: Dict[str, pd.DataFrame],
                          benchmark_data: pd.DataFrame) -> str:
        """Generate a comprehensive RS analysis report"""
        if not stock_data or benchmark_data.empty:
            return "❌ Insufficient data for RS analysis"

        # Calculate RS ratios for all stocks
        rs_ratios = {}
        for symbol, data in stock_data.items():
            if 'Close' not in data.columns or data.empty:
                continue
            rs_ratio = self.calculate_rs_ratio(data['Close'], benchmark_data['Close'])
            rs_ratios[symbol] = rs_ratio

        if not rs_ratios:
            return "❌ No valid RS ratios calculated"

        # Get leaders and laggards
        leaders_laggards = self.identify_rs_leaders_laggards(rs_ratios)

        # Calculate momentum for top stocks
        top_stocks = leaders_laggards['leaders'][:5]
        momentum_data = {}

        for stock in top_stocks:
            if stock in rs_ratios:
                momentum = self.calculate_rs_momentum(rs_ratios[stock])
                momentum_data[stock] = momentum

        # Generate report
        report = []
        report.append("📊 Relative Strength Analysis Report")
        report.append(f"Date: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append(f"Benchmark: {self.benchmark}")
        report.append("")

        report.append("🏆 RS Leaders (Top 10):")
        for i, stock in enumerate(leaders_laggards['leaders'], 1):
            if stock in rs_ratios and not rs_ratios[stock].empty:
                latest_rs = rs_ratios[stock].iloc[-1]
                report.append(f"{i:2d}. {stock:<15} RS: {latest_rs:.3f}")
        report.append("")

        report.append("📉 RS Laggards (Bottom 10):")
        for i, stock in enumerate(leaders_laggards['laggards'], 1):
            if stock in rs_ratios and not rs_ratios[stock].empty:
                latest_rs = rs_ratios[stock].iloc[-1]
                report.append(f"{i:2d}. {stock:<15} RS: {latest_rs:.3f}")
        report.append("")

        # Momentum analysis for top 5
        report.append("📈 Momentum Analysis (Top 5 Leaders):")
        for stock in top_stocks:
            if stock in momentum_data:
                mom_20d = momentum_data[stock].get('RS_Momentum_20D', pd.Series())
                if not mom_20d.empty:
                    latest_mom = mom_20d.iloc[-1]
                    status = "📈 Rising" if latest_mom > 0 else "📉 Falling"
                    report.append(f"• {stock}: {status} ({latest_mom:.1%})")
        report.append("")

        report.append("💡 Key Insights:")
        report.append("• Focus on stocks with RS > 1.0 and rising momentum")
        report.append("• RS Leaders often continue outperforming")
        report.append("• Use RS for sector rotation strategies")
        report.append("• Combine RS with volume and momentum indicators")

        return "\n".join(report)

    def get_rs_signals(self, stock_symbol: str, rs_ratio: pd.Series,
                      momentum_data: Dict[str, pd.Series]) -> Dict[str, Any]:
        """Generate trading signals based on RS analysis"""
        if rs_ratio.empty:
            return {'signal': 'INSUFFICIENT_DATA'}

        latest_rs = rs_ratio.iloc[-1]
        rs_trend = 'RISING' if rs_ratio.iloc[-1] > rs_ratio.iloc[-5] else 'FALLING'

        # Momentum signals
        mom_signals = {}
        for period_name, mom_series in momentum_data.items():
            if not mom_series.empty:
                latest_mom = mom_series.iloc[-1]
                mom_signals[period_name] = 'BULLISH' if latest_mom > 0 else 'BEARISH'

        # Overall signal
        bullish_signals = sum(1 for sig in mom_signals.values() if sig == 'BULLISH')
        total_signals = len(mom_signals)

        if latest_rs > 1.0 and bullish_signals >= total_signals * 0.6:
            overall_signal = 'STRONG_BUY'
        elif latest_rs > 0.9 and bullish_signals >= total_signals * 0.4:
            overall_signal = 'BUY'
        elif latest_rs < 0.8:
            overall_signal = 'SELL'
        else:
            overall_signal = 'HOLD'

        return {
            'symbol': stock_symbol,
            'rs_ratio': round(latest_rs, 3),
            'rs_trend': rs_trend,
            'momentum_signals': mom_signals,
            'overall_signal': overall_signal,
            'confidence': bullish_signals / total_signals if total_signals > 0 else 0
        }

# Example usage
if __name__ == "__main__":
    calculator = RelativeStrengthCalculator()

    # Sample data (in real usage, this would come from data feeds)
    print("Relative Strength Calculator initialized")
    print("Use calculate_rs_ratio() to compute RS ratios")
    print("Use generate_rs_report() for comprehensive analysis")
