"""
IC Candle Scanner for NSE Stocks
Scans NSE F&O stocks for Impulse Candle Retracement setups
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any
import pytz
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, as_completed

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils
from .ic_detector import ICDetector, ICSetup, ICQuality, detect_ic_setup


@dataclass
class ScanResult:
    """Result of IC scan for a single stock"""
    symbol: str
    ic_setup: Optional[ICSetup]
    scan_time: datetime
    data_quality: str  # 'good', 'insufficient', 'error'


class ICScanner:
    """
    NSE IC Scanner
    Scans F&O stocks for valid Impulse Candle Retracement setups
    """

    def __init__(self):
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.detector = ICDetector()

        # NSE F&O stocks universe (top 100 by market cap + popular stocks)
        self.fo_stocks = [
            'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR', 'INFY', 'ITC', 'KOTAKBANK',
            'LT', 'AXISBANK', 'MARUTI', 'BAJFINANCE', 'BHARTIARTL', 'HCLTECH', 'ASIANPAINT',
            'TITAN', 'SUNPHARMA', 'NESTLEIND', 'ULTRACEMCO', 'WIPRO', 'JSWSTEEL', 'POWERGRID',
            'NTPC', 'GRASIM', 'INDUSINDBK', 'TECHM', 'CIPLA', 'SHREECEM', 'HEROMOTOCO', 'DRREDDY',
            'COALINDIA', 'EICHERMOT', 'BAJAJ-AUTO', 'DIVISLAB', 'ADANIPORTS', 'BRITANNIA', 'ONGC',
            'HINDALCO', 'TATACONSUM', 'APOLLOHOSP', 'UPL', 'TATAMOTORS', 'BPCL', 'SBIN', 'M&M',
            'ADANIENT', 'PIDILITIND', 'BERGEPAINT', 'GODREJCP', 'HAVELLS', 'DABUR', 'MARICO',
            'ACC', 'AMBUJACEM', 'BOSCHLTD', 'COLPAL', 'CONCOR', 'DLF', 'GAIL', 'GLENMARK',
            'HINDPETRO', 'IGL', 'JINDALSTEL', 'LUPIN', 'MCDOWELL-N', 'MOTHERSUMI', 'NAUKRI',
            'NMDC', 'PETRONET', 'PFC', 'PNB', 'RECLTD', 'SAIL', 'SIEMENS', 'TORNTPHARM', 'VEDL',
            'VOLTAS', 'ZYDUSLIFE', 'CADILAHC', 'GODREJPROP', 'IDEA', 'MRF', 'PAGEIND', 'PEL',
            'TATASTEEL', 'ABBOTINDIA', 'ALKEM', 'AUBANK', 'BANDHANBNK', 'BIOCON', 'ESCORTS',
            'EXIDEIND', 'FEDERALBNK', 'GMRINFRA', 'IDFCFIRSTB', 'INDIGO', 'L&TFH', 'NAM-INDIA',
            'RBLBANK', 'SRF', 'SUNTV', 'TVSMOTOR', 'WHIRLPOOL', 'ZEEL'
        ]

    def scan_single_stock(self, symbol: str, days: int = 252) -> ScanResult:
        """
        Scan a single stock for IC setups

        Args:
            symbol: Stock symbol
            days: Lookback period in trading days

        Returns:
            ScanResult with IC analysis
        """
        try:
            # Fetch data
            end_date = datetime.now(pytz.timezone('Asia/Kolkata'))
            start_date = end_date - timedelta(days=int(days * 1.5))  # Buffer for holidays

            df = self.data_fetcher.fetch_ohlcv(symbol, start_date, end_date)

            if df is None or len(df) < 100:
                return ScanResult(symbol, None, end_date, 'insufficient')

            # Quality check
            if not self._validate_data_quality(df):
                return ScanResult(symbol, None, end_date, 'poor_quality')

            # Detect IC setup
            ic_setup = detect_ic_setup(symbol, df)

            return ScanResult(symbol, ic_setup, end_date, 'good')

        except Exception as e:
            print(f"Error scanning {symbol}: {e}")
            return ScanResult(symbol, None, datetime.now(pytz.timezone('Asia/Kolkata')), 'error')

    def scan_universe(self, max_workers: int = 4, days: int = 252) -> List[ScanResult]:
        """
        Scan all F&O stocks for IC setups

        Args:
            max_workers: Number of parallel threads
            days: Lookback period in trading days

        Returns:
            List of ScanResult objects
        """
        results = []

        print(f"Scanning {len(self.fo_stocks)} NSE F&O stocks for IC setups...")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_symbol = {
                executor.submit(self.scan_single_stock, symbol, days): symbol
                for symbol in self.fo_stocks
            }

            # Collect results as they complete
            for future in as_completed(future_to_symbol):
                symbol = future_to_symbol[future]
                try:
                    result = future.result()
                    results.append(result)

                    if result.ic_setup:
                        grade = result.ic_setup.grade.value
                        score = result.ic_setup.score
                        direction = result.ic_setup.impulse_candle.direction
                        print(f"✓ {symbol}: IC {direction} setup found (Grade {grade}, Score {score})")
                    else:
                        print(f"✗ {symbol}: No IC setup found")

                except Exception as e:
                    print(f"Error processing {symbol}: {e}")
                    error_result = ScanResult(
                        symbol, None,
                        datetime.now(pytz.timezone('Asia/Kolkata')), 'error'
                    )
                    results.append(error_result)

        return results

    def get_top_ic_setups(self, scan_results: List[ScanResult], min_score: int = 70,
                          max_results: int = 20) -> List[ICSetup]:
        """
        Get top IC setups sorted by score

        Args:
            scan_results: Results from scan_universe
            min_score: Minimum IC score to include
            max_results: Maximum number of results to return

        Returns:
            List of top ICSetup objects
        """
        valid_setups = [
            result.ic_setup for result in scan_results
            if result.ic_setup and result.ic_setup.score >= min_score
        ]

        # Sort by score descending
        valid_setups.sort(key=lambda x: x.score, reverse=True)

        return valid_setups[:max_results]

    def generate_scan_report(self, scan_results: List[ScanResult]) -> Dict[str, Any]:
        """
        Generate comprehensive scan report

        Args:
            scan_results: Results from scan_universe

        Returns:
            Dictionary with scan statistics and top results
        """
        total_scanned = len(scan_results)
        successful_scans = len([r for r in scan_results if r.data_quality == 'good'])
        ic_setups_found = len([r for r in scan_results if r.ic_setup])

        # Grade distribution
        grade_counts = {}
        direction_counts = {'bullish': 0, 'bearish': 0}

        for result in scan_results:
            if result.ic_setup:
                grade = result.ic_setup.grade.value
                direction = result.ic_setup.impulse_candle.direction

                grade_counts[grade] = grade_counts.get(grade, 0) + 1
                direction_counts[direction] += 1

        # Top IC setups
        top_setups = self.get_top_ic_setups(scan_results, min_score=80, max_results=10)

        report = {
            'scan_timestamp': datetime.now(pytz.timezone('Asia/Kolkata')),
            'total_stocks_scanned': total_scanned,
            'successful_scans': successful_scans,
            'ic_setups_found': ic_setups_found,
            'success_rate': successful_scans / total_scanned if total_scanned > 0 else 0,
            'ic_hit_rate': ic_setups_found / successful_scans if successful_scans > 0 else 0,
            'grade_distribution': grade_counts,
            'direction_distribution': direction_counts,
            'top_ic_setups': [
                {
                    'symbol': setup.symbol,
                    'direction': setup.impulse_candle.direction,
                    'score': setup.score,
                    'grade': setup.grade.value,
                    'entry_zone': f"{setup.entry_zone[0]:.2f}-{setup.entry_zone[1]:.2f}",
                    'stop_loss': round(setup.stop_loss, 2),
                    'target_1': round(setup.targets[0], 2) if setup.targets else None,
                    'risk_reward': round(setup.risk_reward_ratio, 2),
                    'confidence': round(setup.confidence, 2)
                }
                for setup in top_setups
            ]
        }

        return report

    def _validate_data_quality(self, df: pd.DataFrame) -> bool:
        """
        Validate data quality for IC analysis

        Args:
            df: OHLCV DataFrame

        Returns:
            True if data quality is sufficient
        """
        if len(df) < 100:
            return False

        # Check for missing values
        missing_pct = df.isnull().sum().sum() / (len(df) * 5)  # 5 columns
        if missing_pct > 0.05:  # More than 5% missing
            return False

        # Check volume quality
        zero_volume_pct = (df['volume'] == 0).sum() / len(df)
        if zero_volume_pct > 0.1:  # More than 10% zero volume
            return False

        # Check price continuity (no extreme gaps)
        price_changes = df['close'].pct_change().abs()
        extreme_changes = (price_changes > 0.5).sum()  # More than 50% change
        if extreme_changes > len(df) * 0.01:  # More than 1% of days
            return False

        return True


def main():
    """Main function for command-line usage"""
    scanner = ICScanner()

    print("Starting NSE IC Setup Scan...")
    print("=" * 50)

    # Perform scan
    results = scanner.scan_universe(max_workers=6, days=252)

    # Generate report
    report = scanner.generate_scan_report(results)

    print("\n" + "=" * 50)
    print("SCAN REPORT")
    print("=" * 50)
    print(f"Stocks Scanned: {report['total_stocks_scanned']}")
    print(f"Successful Scans: {report['successful_scans']}")
    print(f"IC Setups Found: {report['ic_setups_found']}")
    print(".1f")
    print(".1f")

    print(f"\nDirection Distribution:")
    for direction, count in report['direction_distribution'].items():
        print(f"  {direction.title()}: {count}")

    print(f"\nGrade Distribution:")
    for grade, count in report['grade_distribution'].items():
        print(f"  {grade}: {count}")

    if report['top_ic_setups']:
        print(f"\nTop 10 IC Setups:")
        print("-" * 90)
        print("<10")
        print("-" * 90)
        for setup in report['top_ic_setups']:
            direction = setup['direction'].title()
            print("<10")

    # Save detailed results
    timestamp = report['scan_timestamp'].strftime('%Y%m%d_%H%M%S')
    filename = f"ic_scan_{timestamp}.json"

    import json
    with open(filename, 'w') as f:
        # Convert datetime to string for JSON serialization
        report_copy = report.copy()
        report_copy['scan_timestamp'] = report_copy['scan_timestamp'].isoformat()
        json.dump(report_copy, f, indent=2)

    print(f"\nDetailed results saved to {filename}")


if __name__ == "__main__":
    main()
