#!/usr/bin/env python3
"""
FII DII Flow Impact Analyzer
Analyzes the impact of FII/DII flows on Indian market sectors and indices
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

        def fetch_index_data(self, symbol, start_date, end_date):
            # Mock index data
            dates = pd.date_range(start=start_date, end=end_date, freq='D')
            data = []

            for date in dates:
                if date.weekday() < 5:  # Monday to Friday
                    close = 18000 + np.random.normal(0, 200)  # NIFTY around 18,000
                    data.append({
                        'date': date,
                        'open': close + np.random.normal(0, 50),
                        'high': close + abs(np.random.normal(0, 100)),
                        'low': close - abs(np.random.normal(0, 100)),
                        'close': close,
                        'volume': np.random.normal(200000, 50000)
                    })

            return pd.DataFrame(data)


class FII_DII_ImpactAnalyzer:
    """Analyzes the impact of FII/DII flows on market sectors and indices"""

    def __init__(self):
        """Initialize the impact analyzer"""
        self.utils = IndianMarketUtils()
        self.nse_fetcher = NSEDataFetcher()

        # Sector classifications
        self.fii_favored_sectors = ['IT', 'BANKING', 'AUTO', 'FMCG']
        self.dii_favored_sectors = ['PSU', 'PHARMA', 'METALS', 'POWER']
        self.defensive_sectors = ['PHARMA', 'FMCG', 'CONSUMER']

    def analyze_flow_impact(self, flow_data: pd.DataFrame, index_data: pd.DataFrame,
                          lookback_days: int = 30) -> Dict[str, Any]:
        """
        Analyze the impact of flows on market indices

        Args:
            flow_data: FII/DII flow data
            index_data: Index price data (NIFTY/BANKNIFTY)
            lookback_days: Number of days to analyze

        Returns:
            Dictionary with impact analysis
        """
        if flow_data.empty or index_data.empty:
            return {}

        try:
            # Merge flow and index data
            merged_data = self._merge_flow_index_data(flow_data, index_data)

            if merged_data.empty:
                return {}

            # Calculate impact metrics
            impact_metrics = {}

            # Price impact analysis
            impact_metrics.update(self._calculate_price_impact(merged_data))

            # Sector impact estimation
            impact_metrics.update(self._estimate_sector_impacts(merged_data))

            # Flow efficiency analysis
            impact_metrics.update(self._calculate_flow_efficiency(merged_data))

            # Predictive signals
            impact_metrics.update(self._generate_impact_signals(merged_data))

            return impact_metrics

        except Exception as e:
            print(f"Error analyzing flow impact: {e}")
            return {}

    def _merge_flow_index_data(self, flow_data: pd.DataFrame,
                              index_data: pd.DataFrame) -> pd.DataFrame:
        """
        Merge flow and index data on date

        Args:
            flow_data: Flow data with date column
            index_data: Index data with date column

        Returns:
            Merged DataFrame
        """
        try:
            # Ensure date columns are datetime
            flow_data['date'] = pd.to_datetime(flow_data['date'])
            index_data['date'] = pd.to_datetime(index_data['date'])

            # Merge on date
            merged = pd.merge(flow_data, index_data, on='date', how='inner')

            # Calculate returns
            merged['index_return'] = merged['close'].pct_change()
            merged['fii_cumulative'] = merged['fii_cash_flow'].cumsum()
            merged['dii_cumulative'] = merged['dii_cash_flow'].cumsum()

            return merged

        except Exception as e:
            print(f"Error merging data: {e}")
            return pd.DataFrame()

    def _calculate_price_impact(self, merged_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate price impact of flows on index

        Args:
            merged_data: Merged flow and index data

        Returns:
            Price impact metrics
        """
        try:
            metrics = {}

            # Correlation analysis
            fii_corr = merged_data['fii_cash_flow'].corr(merged_data['index_return'])
            dii_corr = merged_data['dii_cash_flow'].corr(merged_data['index_return'])

            metrics['fii_price_correlation'] = round(fii_corr, 3)
            metrics['dii_price_correlation'] = round(dii_corr, 3)

            # Flow impact coefficient (₹ Cr per 1% index move)
            valid_data = merged_data.dropna()
            if len(valid_data) > 5:
                # Simple linear regression: index_return = a + b * flow
                fii_beta = np.polyfit(valid_data['fii_cash_flow'], valid_data['index_return'], 1)[0]
                dii_beta = np.polyfit(valid_data['dii_cash_flow'], valid_data['index_return'], 1)[0]

                metrics['fii_impact_coefficient'] = round(fii_beta * 100, 4)  # Per ₹100 Cr
                metrics['dii_impact_coefficient'] = round(dii_beta * 100, 4)

            # Cumulative impact
            total_fii_flow = merged_data['fii_cash_flow'].sum()
            total_dii_flow = merged_data['dii_cash_flow'].sum()
            total_return = (merged_data['close'].iloc[-1] / merged_data['close'].iloc[0] - 1) * 100

            metrics['cumulative_fii_flow'] = round(total_fii_flow, 2)
            metrics['cumulative_dii_flow'] = round(total_dii_flow, 2)
            metrics['index_total_return'] = round(total_return, 2)

            # Flow efficiency (index return per ₹1000 Cr flow)
            fii_efficiency = total_return / (total_fii_flow / 1000) if total_fii_flow != 0 else 0
            dii_efficiency = total_return / (total_dii_flow / 1000) if total_dii_flow != 0 else 0

            metrics['fii_flow_efficiency'] = round(fii_efficiency, 4)
            metrics['dii_flow_efficiency'] = round(dii_efficiency, 4)

            return metrics

        except Exception as e:
            print(f"Error calculating price impact: {e}")
            return {}

    def _estimate_sector_impacts(self, merged_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Estimate sector-wise impact based on flow patterns

        Args:
            merged_data: Merged flow and index data

        Returns:
            Sector impact estimates
        """
        try:
            sector_impacts = {}

            # Get latest flows
            latest_flows = merged_data.iloc[-1] if len(merged_data) > 0 else merged_data.iloc[0]

            fii_flow = latest_flows['fii_cash_flow']
            dii_flow = latest_flows['dii_cash_flow']

            # FII sector impacts
            fii_sector_impact = self._calculate_fii_sector_impact(fii_flow)  # type: ignore
            sector_impacts['fii_sector_impacts'] = fii_sector_impact

            # DII sector impacts
            dii_sector_impact = self._calculate_dii_sector_impact(dii_flow)  # type: ignore
            sector_impacts['dii_sector_impacts'] = dii_sector_impact

            # Combined sector impacts
            combined_impacts = self._calculate_combined_sector_impact(fii_flow, dii_flow)  # type: ignore
            sector_impacts['combined_sector_impacts'] = combined_impacts

            # Most impacted sectors
            sector_impacts['most_bullish_sectors'] = self._get_most_impacted_sectors(combined_impacts, 'bullish')
            sector_impacts['most_bearish_sectors'] = self._get_most_impacted_sectors(combined_impacts, 'bearish')

            return sector_impacts

        except Exception as e:
            print(f"Error estimating sector impacts: {e}")
            return {}

    def _calculate_fii_sector_impact(self, fii_flow: float) -> Dict[str, str]:
        """
        Calculate FII impact on different sectors

        Args:
            fii_flow: FII cash flow amount

        Returns:
            Sector impact dictionary
        """
        # FII typically impacts these sectors based on flow direction
        base_impacts = {
            'IT': 'high_impact',
            'BANKING': 'high_impact',
            'AUTO': 'medium_impact',
            'FMCG': 'medium_impact',
            'PHARMA': 'low_impact',
            'METALS': 'low_impact',
            'PSU': 'low_impact',
            'POWER': 'low_impact'
        }

        # Adjust based on flow magnitude
        multiplier = 1.0
        if abs(fii_flow) > 2000:
            multiplier = 1.5
        elif abs(fii_flow) > 1000:
            multiplier = 1.2

        adjusted_impacts = {}
        for sector, impact in base_impacts.items():
            if fii_flow > 0:
                adjusted_impacts[sector] = f"{impact}_bullish"
            elif fii_flow < 0:
                adjusted_impacts[sector] = f"{impact}_bearish"
            else:
                adjusted_impacts[sector] = f"{impact}_neutral"

        return adjusted_impacts

    def _calculate_dii_sector_impact(self, dii_flow: float) -> Dict[str, str]:
        """
        Calculate DII impact on different sectors

        Args:
            dii_flow: DII cash flow amount

        Returns:
            Sector impact dictionary
        """
        # DII typically impacts these sectors
        base_impacts = {
            'IT': 'low_impact',
            'BANKING': 'medium_impact',
            'AUTO': 'low_impact',
            'FMCG': 'medium_impact',
            'PHARMA': 'high_impact',
            'METALS': 'high_impact',
            'PSU': 'high_impact',
            'POWER': 'high_impact'
        }

        adjusted_impacts = {}
        for sector, impact in base_impacts.items():
            if dii_flow > 0:
                adjusted_impacts[sector] = f"{impact}_bullish"
            elif dii_flow < 0:
                adjusted_impacts[sector] = f"{impact}_bearish"
            else:
                adjusted_impacts[sector] = f"{impact}_neutral"

        return adjusted_impacts

    def _calculate_combined_sector_impact(self, fii_flow: float, dii_flow: float) -> Dict[str, str]:
        """
        Calculate combined FII+DII impact on sectors

        Args:
            fii_flow: FII cash flow
            dii_flow: DII cash flow

        Returns:
            Combined sector impact dictionary
        """
        fii_impacts = self._calculate_fii_sector_impact(fii_flow)
        dii_impacts = self._calculate_dii_sector_impact(dii_flow)

        combined_impacts = {}

        for sector in fii_impacts.keys():
            fii_impact = fii_impacts[sector]
            dii_impact = dii_impacts[sector]

            # Combine impacts (simplified logic)
            if 'high_impact' in fii_impact or 'high_impact' in dii_impact:
                if 'bullish' in fii_impact or 'bullish' in dii_impact:
                    combined_impacts[sector] = 'strong_bullish'
                elif 'bearish' in fii_impact or 'bearish' in dii_impact:
                    combined_impacts[sector] = 'strong_bearish'
                else:
                    combined_impacts[sector] = 'neutral'
            else:
                combined_impacts[sector] = 'moderate_neutral'

        return combined_impacts

    def _get_most_impacted_sectors(self, combined_impacts: Dict[str, str],
                                 direction: str) -> List[str]:
        """
        Get sectors most impacted in specified direction

        Args:
            combined_impacts: Combined sector impacts
            direction: 'bullish' or 'bearish'

        Returns:
            List of most impacted sectors
        """
        impacted_sectors = []

        for sector, impact in combined_impacts.items():
            if direction in impact and 'strong' in impact:
                impacted_sectors.append(sector)

        return impacted_sectors[:3]  # Top 3 sectors

    def _calculate_flow_efficiency(self, merged_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculate flow efficiency metrics

        Args:
            merged_data: Merged flow and index data

        Returns:
            Flow efficiency metrics
        """
        try:
            efficiency_metrics = {}

            # Rolling efficiency (last 5 days)
            if len(merged_data) >= 5:
                recent_data = merged_data.tail(5)
                recent_fii_flow = recent_data['fii_cash_flow'].sum()
                recent_dii_flow = recent_data['dii_cash_flow'].sum()
                recent_return = (recent_data['close'].iloc[-1] / recent_data['close'].iloc[0] - 1) * 100

                fii_recent_efficiency = recent_return / (recent_fii_flow / 1000) if recent_fii_flow != 0 else 0
                dii_recent_efficiency = recent_return / (recent_dii_flow / 1000) if recent_dii_flow != 0 else 0

                efficiency_metrics['fii_recent_efficiency'] = round(fii_recent_efficiency, 4)
                efficiency_metrics['dii_recent_efficiency'] = round(dii_recent_efficiency, 4)

            # Flow persistence (how long flows maintain direction)
            fii_direction_changes = self._calculate_direction_persistence(merged_data['fii_cash_flow'])
            dii_direction_changes = self._calculate_direction_persistence(merged_data['dii_cash_flow'])

            efficiency_metrics['fii_flow_persistence'] = fii_direction_changes
            efficiency_metrics['dii_flow_persistence'] = dii_direction_changes

            return efficiency_metrics

        except Exception as e:
            print(f"Error calculating flow efficiency: {e}")
            return {}

    def _calculate_direction_persistence(self, flow_series: pd.Series) -> float:
        """
        Calculate how persistent flows are in one direction

        Args:
            flow_series: Flow time series

        Returns:
            Persistence score (0-1, higher = more persistent)
        """
        try:
            if len(flow_series) < 3:
                return 0.5

            # Calculate direction changes
            signs = np.sign(flow_series)
            direction_changes = np.sum(np.abs(np.diff(signs))) / 2  # Each change affects 2 consecutive values

            # Persistence = 1 - (changes / total_possible_changes)
            max_changes = len(flow_series) - 1
            persistence = 1 - (direction_changes / max_changes) if max_changes > 0 else 0.5

            return round(persistence, 3)

        except Exception:
            return 0.5

    def _generate_impact_signals(self, merged_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate predictive signals based on flow impact analysis

        Args:
            merged_data: Merged flow and index data

        Returns:
            Impact-based signals
        """
        try:
            signals = {}

            if len(merged_data) < 5:
                return {'signal': 'insufficient_data'}

            # Get recent trends
            recent_data = merged_data.tail(5)
            fii_recent_avg = recent_data['fii_cash_flow'].mean()
            dii_recent_avg = recent_data['dii_cash_flow'].mean()

            # Impact strength signal
            fii_impact_strength = 'strong' if abs(fii_recent_avg) > 1500 else 'moderate' if abs(fii_recent_avg) > 750 else 'weak'
            dii_impact_strength = 'strong' if abs(dii_recent_avg) > 750 else 'moderate' if abs(dii_recent_avg) > 300 else 'weak'

            signals['fii_impact_strength'] = fii_impact_strength
            signals['dii_impact_strength'] = dii_impact_strength

            # Market direction prediction
            combined_flow = fii_recent_avg + dii_recent_avg

            if combined_flow > 2000:
                signals['market_direction'] = 'strongly_bullish'
            elif combined_flow > 1000:
                signals['market_direction'] = 'moderately_bullish'
            elif combined_flow < -1500:
                signals['market_direction'] = 'strongly_bearish'
            elif combined_flow < -750:
                signals['market_direction'] = 'moderately_bearish'
            else:
                signals['market_direction'] = 'neutral'

            # Confidence level based on flow consistency
            fii_consistency = self._calculate_flow_consistency(merged_data['fii_cash_flow'])
            dii_consistency = self._calculate_flow_consistency(merged_data['dii_cash_flow'])

            avg_consistency = (fii_consistency + dii_consistency) / 2
            signals['signal_confidence'] = 'high' if avg_consistency > 0.7 else 'medium' if avg_consistency > 0.4 else 'low'

            return signals

        except Exception as e:
            print(f"Error generating impact signals: {e}")
            return {}

    def _calculate_flow_consistency(self, flow_series: pd.Series) -> float:
        """
        Calculate consistency of flow direction

        Args:
            flow_series: Flow time series

        Returns:
            Consistency score (0-1)
        """
        try:
            if len(flow_series) < 3:
                return 0.5

            # Calculate what percentage of flows are in the same direction as the majority
            signs = np.sign(flow_series)
            positive_count = np.sum(signs > 0)
            negative_count = np.sum(signs < 0)

            majority_direction = 1 if positive_count >= negative_count else -1
            consistency = max(positive_count, negative_count) / len(flow_series)

            return round(consistency, 3)

        except Exception:
            return 0.5

    def generate_impact_report(self, days: int = 30) -> str:
        """
        Generate a comprehensive flow impact analysis report

        Args:
            days: Number of days to analyze

        Returns:
            Formatted report string
        """
        try:
            # Fetch data (mock implementation)
            end_date = self.utils.get_current_ist_time().date()
            start_date = end_date - timedelta(days=days)

            # Mock flow and index data
            flow_data = self._generate_mock_flow_data(start_date, end_date)
            index_data = self.nse_fetcher.fetch_index_data('NIFTY', start_date, end_date)

            if flow_data.empty or index_data.empty:
                return "Unable to fetch data for impact analysis"

            # Analyze impact
            impact_analysis = self.analyze_flow_impact(flow_data, index_data, days)

            if not impact_analysis:
                return "Unable to perform impact analysis"

            # Generate report
            report = []
            report.append("=" * 70)
            report.append("FII DII FLOW IMPACT ANALYSIS REPORT")
            report.append("=" * 70)
            report.append(f"Analysis Period: Last {days} days")
            report.append(f"Report Generated: {self.utils.get_current_ist_time().strftime('%Y-%m-%d %H:%M:%S IST')}")
            report.append("")

            # Price Impact Analysis
            report.append("PRICE IMPACT ANALYSIS:")
            report.append("-" * 40)
            report.append(f"FII-Price Correlation: {impact_analysis.get('fii_price_correlation', 'N/A')}")
            report.append(f"DII-Price Correlation: {impact_analysis.get('dii_price_correlation', 'N/A')}")
            report.append(f"FII Impact Coefficient: {impact_analysis.get('fii_impact_coefficient', 'N/A')}")
            report.append(f"DII Impact Coefficient: {impact_analysis.get('dii_impact_coefficient', 'N/A')}")
            report.append("")

            # Flow Efficiency
            report.append("FLOW EFFICIENCY:")
            report.append("-" * 40)
            report.append(f"FII Flow Efficiency: {impact_analysis.get('fii_flow_efficiency', 'N/A')}% return per ₹1000 Cr")
            report.append(f"DII Flow Efficiency: {impact_analysis.get('dii_flow_efficiency', 'N/A')}% return per ₹1000 Cr")
            report.append("")

            # Sector Impacts
            sector_impacts = impact_analysis.get('combined_sector_impacts', {})
            if sector_impacts:
                report.append("SECTOR IMPACT ANALYSIS:")
                report.append("-" * 40)
                for sector, impact in sector_impacts.items():
                    report.append(f"{sector}: {impact.upper()}")
                report.append("")

            # Trading Signals
            signals = impact_analysis.get('signal_confidence', {})
            if signals:
                report.append("TRADING SIGNALS:")
                report.append("-" * 40)
                report.append(f"Market Direction: {impact_analysis.get('market_direction', 'N/A').upper()}")
                report.append(f"Signal Confidence: {impact_analysis.get('signal_confidence', 'N/A').upper()}")
                report.append("")

            # Most Impacted Sectors
            bullish_sectors = impact_analysis.get('most_bullish_sectors', [])
            bearish_sectors = impact_analysis.get('most_bearish_sectors', [])

            if bullish_sectors or bearish_sectors:
                report.append("MOST IMPACTED SECTORS:")
                report.append("-" * 40)
                if bullish_sectors:
                    report.append(f"Bullish: {', '.join(bullish_sectors)}")
                if bearish_sectors:
                    report.append(f"Bearish: {', '.join(bearish_sectors)}")
                report.append("")

            report.append("=" * 70)

            return "\n".join(report)

        except Exception as e:
            return f"Error generating impact report: {e}"

    def _generate_mock_flow_data(self, start_date, end_date):
        """Generate mock flow data for testing"""
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        data = []

        for date in dates:
            if date.weekday() < 5:  # Monday to Friday
                fii_flow = np.random.normal(1500, 800)
                dii_flow = np.random.normal(800, 400)

                data.append({
                    'date': date,
                    'fii_cash_flow': round(fii_flow, 2),
                    'dii_cash_flow': round(dii_flow, 2),
                    'fii_debt_flow': round(np.random.normal(200, 100), 2),
                    'dii_debt_flow': round(np.random.normal(150, 75), 2)
                })

        return pd.DataFrame(data)


def main():
    """Main function for command-line usage"""
    analyzer = FII_DII_ImpactAnalyzer()

    # Generate impact report
    report = analyzer.generate_impact_report(30)
    print(report)


if __name__ == "__main__":
    main()
