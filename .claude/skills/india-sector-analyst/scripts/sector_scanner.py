"""
India Sector Analyst - NSE Sector Scanner

Scans all NSE sectoral indices for performance ranking, rotation detection,
and cycle analysis. Provides comprehensive sector health assessment.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import pytz

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils


@dataclass
class SectorData:
    """Sector performance data"""
    symbol: str
    name: str
    current_price: float
    weekly_return: float
    monthly_return: float
    quarterly_return: float
    rs_score: float
    rs_percentile: float
    volume_ratio: float


class SectorScanner:
    """
    NSE Sector Scanner for performance analysis and rotation detection
    """

    def __init__(self):
        """Initialize sector scanner"""
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.ist_tz = pytz.timezone('Asia/Kolkata')

        # NSE Sectoral indices mapping
        self.sectors = {
            'NSEBANK': 'Bank',
            'NSEIT': 'IT',
            'NSEPHARMA': 'Pharma',
            'NSEAUTO': 'Auto',
            'NSEMETAL': 'Metal',
            'NSEREALTY': 'Realty',
            'NSEENERGY': 'Energy',
            'NSEFMCG': 'FMCG',
            'NSEPSE': 'PSE',
            'NSEMEDIA': 'Media',
            'NSEINFRA': 'Infra',
            'NSEFINANCE': 'Financial Services'
        }

    def fetch_sectoral_data(self) -> Dict[str, SectorData]:
        """
        Fetch current data for all NSE sectoral indices

        Returns:
            Dict of sector data
        """
        sector_data = {}

        for symbol, name in self.sectors.items():
            try:
                # Get current price and historical data
                current_price = self.data_fetcher.get_current_price(symbol)
                if current_price is None:
                    continue

                # Get historical returns (simplified - would use actual data)
                weekly_return = self._calculate_return(symbol, 5)
                monthly_return = self._calculate_return(symbol, 21)
                quarterly_return = self._calculate_return(symbol, 63)

                sector_data[symbol] = SectorData(
                    symbol=symbol,
                    name=name,
                    current_price=current_price,
                    weekly_return=weekly_return,
                    monthly_return=monthly_return,
                    quarterly_return=quarterly_return,
                    rs_score=0,  # Will be calculated
                    rs_percentile=0,  # Will be calculated
                    volume_ratio=1.0  # Placeholder
                )

            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
                continue

        return sector_data

    def rank_sectors(self, sector_data: Dict[str, SectorData],
                    period: str = "1M") -> List[SectorData]:
        """
        Rank sectors by performance for given period

        Args:
            sector_data: Sector performance data
            period: "1W", "1M", or "3M"

        Returns:
            Ranked list of sectors
        """
        sectors_list = list(sector_data.values())

        # Choose return period
        if period == "1W":
            key_func = lambda x: x.weekly_return
        elif period == "3M":
            key_func = lambda x: x.quarterly_return
        else:  # 1M default
            key_func = lambda x: x.monthly_return

        # Sort by performance (descending)
        ranked_sectors = sorted(sectors_list, key=key_func, reverse=True)

        return ranked_sectors

    def calculate_sector_rs(self, sector_data: Dict[str, SectorData],
                           nifty_data: pd.DataFrame) -> Dict[str, SectorData]:
        """
        Calculate relative strength vs Nifty

        Args:
            sector_data: Sector performance data
            nifty_data: Nifty historical data

        Returns:
            Updated sector data with RS scores
        """
        # Get Nifty returns (simplified)
        nifty_weekly = 0.02  # Placeholder
        nifty_monthly = 0.05
        nifty_quarterly = 0.12

        for symbol, data in sector_data.items():
            # Calculate RS as difference from Nifty
            rs_weekly = data.weekly_return - nifty_weekly
            rs_monthly = data.monthly_return - nifty_monthly
            rs_quarterly = data.quarterly_return - nifty_quarterly

            # Composite RS score (40% 3M, 30% 1M, 30% 1W)
            rs_score = (rs_quarterly * 0.4 + rs_monthly * 0.3 + rs_weekly * 0.3) * 100

            data.rs_score = rs_score

        # Calculate percentiles
        rs_scores = [data.rs_score for data in sector_data.values()]
        for data in sector_data.values():
            data.rs_percentile = self._calculate_percentile(data.rs_score, rs_scores)

        return sector_data

    def detect_rotation(self, current_ranking: List[SectorData],
                       prev_ranking: List[SectorData]) -> Dict[str, str]:
        """
        Detect sector rotation by comparing rankings

        Args:
            current_ranking: Current sector ranking
            prev_ranking: Previous period ranking

        Returns:
            Dict of rotation signals
        """
        rotation_signals = {}

        # Create position mapping
        current_positions = {data.symbol: i for i, data in enumerate(current_ranking)}
        prev_positions = {data.symbol: i for i, data in enumerate(prev_ranking)}

        for symbol in current_positions:
            if symbol in prev_positions:
                current_pos = current_positions[symbol]
                prev_pos = prev_positions[symbol]
                change = prev_pos - current_pos

                if change >= 3:
                    rotation_signals[symbol] = "Strong Improvement"
                elif change >= 1:
                    rotation_signals[symbol] = "Improving"
                elif change <= -3:
                    rotation_signals[symbol] = "Strong Decline"
                elif change <= -1:
                    rotation_signals[symbol] = "Declining"
                else:
                    rotation_signals[symbol] = "Stable"

        return rotation_signals

    def identify_cycle_phase(self, sector_rankings: List[SectorData]) -> str:
        """
        Identify market cycle phase from sector rankings

        Args:
            sector_rankings: Current sector performance ranking

        Returns:
            Cycle phase assessment
        """
        top_sectors = [data.name for data in sector_rankings[:3]]

        # Early cycle: Banks, Auto, Realty lead
        if any(sector in ['Bank', 'Auto', 'Realty'] for sector in top_sectors):
            return "Early Bull Market"

        # Mid cycle: IT, Metals, Capital Goods
        elif any(sector in ['IT', 'Metal'] for sector in top_sectors):
            return "Mid Bull Market"

        # Late cycle: FMCG, Pharma defensive
        elif any(sector in ['FMCG', 'Pharma'] for sector in top_sectors):
            return "Late Bull Market"

        else:
            return "Neutral/Transition Phase"

    def generate_sector_report(self) -> str:
        """
        Generate comprehensive sector analysis report

        Returns:
            Formatted markdown report
        """
        # Fetch data
        sector_data = self.fetch_sectoral_data()

        if not sector_data:
            return "Unable to fetch sector data"

        # Get Nifty data for RS calculation
        nifty_data = self.data_fetcher.get_nifty_historical_data(
            datetime.now() - timedelta(days=100), datetime.now()
        )

        # Calculate RS scores
        sector_data = self.calculate_sector_rs(sector_data, nifty_data or pd.DataFrame())

        # Rank sectors
        monthly_ranking = self.rank_sectors(sector_data, "1M")

        # Detect rotation (simplified - would compare to previous period)
        rotation_signals = {symbol: "Monitoring" for symbol in sector_data.keys()}

        # Identify cycle phase
        cycle_phase = self.identify_cycle_phase(monthly_ranking)

        # Generate report
        report = f"""# NSE Sector Analysis Report
**Date:** {datetime.now(self.ist_tz).strftime('%Y-%m-%d')}
**Market Cycle Phase:** {cycle_phase}

## Top Performing Sectors (1M)

| Rank | Sector | 1M Return | RS Score | RS Percentile |
|------|--------|-----------|----------|---------------|
"""

        for i, sector in enumerate(monthly_ranking[:5], 1):
            report += f"|{i}|{sector.name}|{sector.monthly_return:.1%}|{sector.rs_score:.1f}|{sector.rs_percentile:.0f}|\n"

        report += "\n## Sector Rotation Signals\n\n"
        for symbol, signal in list(rotation_signals.items())[:5]:
            sector_name = self.sectors.get(symbol, symbol)
            report += f"- **{sector_name}**: {signal}\n"

        report += f"\n## Key Insights\n"
        report += f"- Leading sector: {monthly_ranking[0].name} ({monthly_ranking[0].monthly_return:.1%})\n"
        report += f"- Lagging sector: {monthly_ranking[-1].name} ({monthly_ranking[-1].monthly_return:.1%})\n"
        report += f"- Market breadth: {len([s for s in monthly_ranking if s.monthly_return > 0])}/{len(monthly_ranking)} sectors positive\n"

        return report

    def _calculate_return(self, symbol: str, days: int) -> float:
        """Calculate return over period (simplified)"""
        # In real implementation, would fetch historical data
        # Placeholder random returns for demonstration
        return np.random.normal(0.02, 0.05)

    def _calculate_percentile(self, value: float, values_list: List[float]) -> float:
        """Calculate percentile rank"""
        if not values_list:
            return 50.0

        sorted_values = sorted(values_list)
        count = len(sorted_values)
        rank = sum(1 for v in sorted_values if v < value)

        return (rank / count) * 100 if count > 0 else 50.0


# Main execution
if __name__ == "__main__":
    scanner = SectorScanner()
    report = scanner.generate_sector_report()
    print(report)
