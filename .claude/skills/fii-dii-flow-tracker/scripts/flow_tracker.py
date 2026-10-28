#!/usr/bin/env python3
"""
FII DII Flow Tracker
Fetches and analyzes FII/DII cash flow data from NSE
"""

import sys
import os
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Add shared modules to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))

try:
    from indian_market_utils import IndianMarketUtils
    from nse_data_fetcher import NSEDataFetcher
except ImportError:
    # Fallback for missing dependencies
    print("Warning: Shared utilities not available, using mock implementations")

    class IndianMarketUtils:
        @staticmethod
        def get_current_ist_time():
            return datetime.now()

        @staticmethod
        def is_market_open():
            return True

        @staticmethod
        def get_next_market_open():
            return datetime.now() + timedelta(days=1)

    class NSEDataFetcher:
        def __init__(self):
            pass

        def fetch_fii_dii_data(self, start_date, end_date):
            # Mock data for testing
            return self._generate_mock_flow_data(start_date, end_date)

        def _generate_mock_flow_data(self, start_date, end_date):
            """Generate mock FII/DII flow data for testing"""
            dates = pd.date_range(start=start_date, end=end_date, freq='D')
            data = []

            for date in dates:
                if date.weekday() < 5:  # Monday to Friday
                    fii_flow = np.random.normal(1500, 800)  # Mean ₹1,500 Cr, std ₹800 Cr
                    dii_flow = np.random.normal(800, 400)   # Mean ₹800 Cr, std ₹400 Cr

                    data.append({
                        'date': date,
                        'fii_cash_flow': round(fii_flow, 2),
                        'dii_cash_flow': round(dii_flow, 2),
                        'fii_debt_flow': round(np.random.normal(200, 100), 2),
                        'dii_debt_flow': round(np.random.normal(150, 75), 2),
                        'fii_total_flow': round(fii_flow + np.random.normal(200, 100), 2),
                        'dii_total_flow': round(dii_flow + np.random.normal(150, 75), 2)
                    })

            return pd.DataFrame(data)


class FII_DII_FlowTracker:
    """Tracks and analyzes FII/DII cash flows in Indian markets"""

    def __init__(self):
        """Initialize the flow tracker"""
        self.utils = IndianMarketUtils()
        self.nse_fetcher = NSEDataFetcher()
        self.flow_data = None

    def fetch_flow_data(self, days: int = 30) -> pd.DataFrame:
        """
        Fetch FII/DII flow data for the specified number of days

        Args:
            days: Number of days of historical data to fetch

        Returns:
            DataFrame with flow data
        """
        try:
            end_date = self.utils.get_current_ist_time().date()
            start_date = end_date - timedelta(days=days)

            print(f"Fetching FII/DII flow data from {start_date} to {end_date}")

            self.flow_data = self.nse_fetcher.fetch_fii_dii_data(start_date, end_date)

            if self.flow_data is not None and not self.flow_data.empty:
                print(f"Successfully fetched {len(self.flow_data)} days of flow data")
                return self.flow_data
            else:
                print("No flow data available")
                return pd.DataFrame()

        except Exception as e:
            print(f"Error fetching flow data: {e}")
            return pd.DataFrame()

    def calculate_flow_metrics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate key flow metrics from the data

        Args:
            df: Flow data DataFrame

        Returns:
            Dictionary with calculated metrics
        """
        if df.empty:
            return {}

        try:
            # Basic flow statistics
            metrics = {
                'total_days': len(df),
                'fii_total_flow': df['fii_cash_flow'].sum(),
                'dii_total_flow': df['dii_cash_flow'].sum(),
                'fii_avg_daily': df['fii_cash_flow'].mean(),
                'dii_avg_daily': df['dii_cash_flow'].mean(),
                'fii_positive_days': (df['fii_cash_flow'] > 0).sum(),
                'dii_positive_days': (df['dii_cash_flow'] > 0).sum(),
                'fii_max_flow': df['fii_cash_flow'].max(),
                'dii_max_flow': df['dii_cash_flow'].max(),
                'fii_min_flow': df['fii_cash_flow'].min(),
                'dii_min_flow': df['dii_cash_flow'].min()
            }

            # Flow ratio analysis
            df_copy = df.copy()
            df_copy['flow_ratio'] = df_copy['fii_cash_flow'] / df_copy['dii_cash_flow'].replace(0, 1)
            metrics.update({
                'avg_flow_ratio': df_copy['flow_ratio'].mean(),
                'flow_ratio_volatility': df_copy['flow_ratio'].std(),
                'ratio_above_1_days': (df_copy['flow_ratio'] > 1).sum()
            })

            # Momentum indicators
            df_copy['fii_ma_5'] = df_copy['fii_cash_flow'].rolling(5).mean()
            df_copy['dii_ma_5'] = df_copy['dii_cash_flow'].rolling(5).mean()
            df_copy['fii_momentum'] = df_copy['fii_cash_flow'] - df_copy['fii_ma_5']
            df_copy['dii_momentum'] = df_copy['dii_cash_flow'] - df_copy['dii_ma_5']

            metrics.update({
                'fii_current_momentum': df_copy['fii_momentum'].iloc[-1] if len(df_copy) >= 5 else 0,
                'dii_current_momentum': df_copy['dii_momentum'].iloc[-1] if len(df_copy) >= 5 else 0
            })

            # Round all metrics to 2 decimal places
            for key, value in metrics.items():
                if isinstance(value, (int, float)):
                    metrics[key] = round(value, 2)

            return metrics

        except Exception as e:
            print(f"Error calculating flow metrics: {e}")
            return {}

    def get_flow_signals(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate trading signals based on flow patterns

        Args:
            df: Flow data DataFrame

        Returns:
            Dictionary with signal information
        """
        if df.empty:
            return {}

        try:
            signals = {}

            # Get latest data
            latest = df.iloc[-1]
            prev_day = df.iloc[-2] if len(df) > 1 else latest

            # Flow magnitude signals
            fii_flow = latest['fii_cash_flow']  # type: ignore
            dii_flow = latest['dii_cash_flow']  # type: ignore

            signals['fii_signal'] = self._classify_flow(fii_flow, 'fii')  # type: ignore
            signals['dii_signal'] = self._classify_flow(dii_flow, 'dii')  # type: ignore

            # Combined signals
            flow_ratio = fii_flow / dii_flow if dii_flow != 0 else float('inf')  # type: ignore
            signals['combined_signal'] = self._classify_combined_flow(flow_ratio)  # type: ignore

            # Momentum signals
            if len(df) >= 5:
                fii_ma5 = df['fii_cash_flow'].tail(5).mean()
                dii_ma5 = df['dii_cash_flow'].tail(5).mean()

                signals['fii_momentum'] = 'bullish' if fii_flow > fii_ma5 else 'bearish'  # type: ignore
                signals['dii_momentum'] = 'bullish' if dii_flow > dii_ma5 else 'bearish'  # type: ignore

            # Volume signals (relative to historical average)
            if len(df) >= 10:
                fii_avg = df['fii_cash_flow'].head(-1).mean()  # Exclude latest
                dii_avg = df['dii_cash_flow'].head(-1).mean()

                signals['fii_volume'] = 'high' if abs(fii_flow) > abs(fii_avg) * 1.5 else 'normal'  # type: ignore
                signals['dii_volume'] = 'high' if abs(dii_flow) > abs(dii_avg) * 1.5 else 'normal'  # type: ignore

            return signals

        except Exception as e:
            print(f"Error generating flow signals: {e}")
            return {}

    def _classify_flow(self, flow_amount: float, investor_type: str) -> str:
        """
        Classify flow amount into signal categories

        Args:
            flow_amount: Flow amount in crores
            investor_type: 'fii' or 'dii'

        Returns:
            Signal classification
        """
        thresholds = {
            'fii': {'strong_buy': 2000, 'buy': 1000, 'strong_sell': -1500, 'sell': -750},
            'dii': {'strong_buy': 1000, 'buy': 500, 'strong_sell': -750, 'sell': -300}
        }

        thresh = thresholds.get(investor_type, thresholds['fii'])

        if flow_amount >= thresh['strong_buy']:
            return 'strong_buy'
        elif flow_amount >= thresh['buy']:
            return 'buy'
        elif flow_amount <= thresh['strong_sell']:
            return 'strong_sell'
        elif flow_amount <= thresh['sell']:
            return 'sell'
        else:
            return 'neutral'

    def _classify_combined_flow(self, ratio: float) -> str:
        """
        Classify combined FII/DII flow ratio

        Args:
            ratio: FII flow / DII flow ratio

        Returns:
            Combined signal classification
        """
        if ratio > 2.0:
            return 'fii_dominant_bullish'
        elif ratio > 1.5:
            return 'fii_leading_bullish'
        elif ratio > 1.2:
            return 'mild_bullish'
        elif ratio < 0.5:
            return 'dii_dominant_bearish'
        elif ratio < 0.7:
            return 'dii_leading_bearish'
        elif ratio < 0.8:
            return 'mild_bearish'
        else:
            return 'neutral'

    def get_sector_flow_impact(self) -> Dict[str, Any]:
        """
        Estimate sector-wise flow impact based on historical patterns

        Returns:
            Dictionary with sector impact estimates
        """
        # This would typically analyze historical sector performance vs flows
        # For now, return mock sector impacts based on typical patterns

        sector_impacts = {
            'IT': {'fii_sensitivity': 0.8, 'dii_sensitivity': 0.3, 'expected_impact': 'high'},
            'BANKING': {'fii_sensitivity': 0.6, 'dii_sensitivity': 0.7, 'expected_impact': 'high'},
            'PHARMA': {'fii_sensitivity': 0.4, 'dii_sensitivity': 0.8, 'expected_impact': 'medium'},
            'AUTO': {'fii_sensitivity': 0.7, 'dii_sensitivity': 0.5, 'expected_impact': 'high'},
            'FMCG': {'fii_sensitivity': 0.5, 'dii_sensitivity': 0.6, 'expected_impact': 'medium'},
            'METALS': {'fii_sensitivity': 0.3, 'dii_sensitivity': 0.9, 'expected_impact': 'medium'},
            'PSU': {'fii_sensitivity': 0.2, 'dii_sensitivity': 0.9, 'expected_impact': 'high'}
        }

        return sector_impacts

    def generate_report(self, days: int = 30) -> str:
        """
        Generate a comprehensive flow analysis report

        Args:
            days: Number of days to analyze

        Returns:
            Formatted report string
        """
        try:
            # Fetch data
            flow_data = self.fetch_flow_data(days)
            if flow_data.empty:
                return "Unable to fetch flow data for report generation"

            # Calculate metrics
            metrics = self.calculate_flow_metrics(flow_data)
            signals = self.get_flow_signals(flow_data)

            # Generate report
            report = []
            report.append("=" * 60)
            report.append("FII DII FLOW ANALYSIS REPORT")
            report.append("=" * 60)
            report.append(f"Analysis Period: Last {days} days")
            report.append(f"Report Generated: {self.utils.get_current_ist_time().strftime('%Y-%m-%d %H:%M:%S IST')}")
            report.append("")

            # Flow Summary
            report.append("FLOW SUMMARY:")
            report.append("-" * 30)
            report.append(f"Total FII Flow: ₹{metrics.get('fii_total_flow', 0):,.0f} Cr")
            report.append(f"Total DII Flow: ₹{metrics.get('dii_total_flow', 0):,.0f} Cr")
            report.append(f"Average Daily FII: ₹{metrics.get('fii_avg_daily', 0):,.0f} Cr")
            report.append(f"Average Daily DII: ₹{metrics.get('dii_avg_daily', 0):,.0f} Cr")
            report.append("")

            # Signal Analysis
            report.append("CURRENT SIGNALS:")
            report.append("-" * 30)
            report.append(f"FII Signal: {signals.get('fii_signal', 'N/A').upper()}")
            report.append(f"DII Signal: {signals.get('dii_signal', 'N/A').upper()}")
            report.append(f"Combined Signal: {signals.get('combined_signal', 'N/A').upper()}")
            report.append("")

            # Momentum Analysis
            if 'fii_momentum' in signals:
                report.append("MOMENTUM ANALYSIS:")
                report.append("-" * 30)
                report.append(f"FII Momentum: {signals['fii_momentum'].upper()}")
                report.append(f"DII Momentum: {signals['dii_momentum'].upper()}")
                report.append("")

            # Key Metrics
            report.append("KEY METRICS:")
            report.append("-" * 30)
            report.append(f"Flow Ratio (FII/DII): {metrics.get('avg_flow_ratio', 0):.2f}")
            report.append(f"FII Positive Days: {metrics.get('fii_positive_days', 0)}/{metrics.get('total_days', 0)}")
            report.append(f"DII Positive Days: {metrics.get('dii_positive_days', 0)}/{metrics.get('total_days', 0)}")
            report.append("")

            # Trading Implications
            report.append("TRADING IMPLICATIONS:")
            report.append("-" * 30)

            combined_signal = signals.get('combined_signal', '')
            if 'bullish' in combined_signal:
                report.append("• Bullish bias - Consider long positions in FII favored sectors")
                report.append("• Focus on IT, Banking, and Auto sectors")
            elif 'bearish' in combined_signal:
                report.append("• Bearish bias - Consider defensive positions")
                report.append("• Focus on Pharma and PSU sectors")
            else:
                report.append("• Neutral signals - Wait for clearer direction")
                report.append("• Monitor for momentum shifts")

            report.append("")
            report.append("=" * 60)

            return "\n".join(report)

        except Exception as e:
            return f"Error generating report: {e}"


def main():
    """Main function for command-line usage"""
    tracker = FII_DII_FlowTracker()

    # Generate report for last 30 days
    report = tracker.generate_report(30)
    print(report)

    # Also demonstrate individual components
    print("\n" + "="*60)
    print("INDIVIDUAL COMPONENTS DEMO")
    print("="*60)

    # Fetch data
    data = tracker.fetch_flow_data(10)
    if not data.empty:
        print(f"\nFetched {len(data)} days of data")
        print(data.tail(3))

        # Calculate metrics
        metrics = tracker.calculate_flow_metrics(data)
        print(f"\nKey Metrics: {metrics}")

        # Generate signals
        signals = tracker.get_flow_signals(data)
        print(f"\nCurrent Signals: {signals}")


if __name__ == "__main__":
    main()
