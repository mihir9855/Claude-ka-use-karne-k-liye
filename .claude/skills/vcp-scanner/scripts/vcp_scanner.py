"""
VCP Scanner for NSE Stocks
Scans NSE F&O stocks for Volatility Contraction Patterns using Minervini methodology
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
from .vcp_detector import VCPDetector, VCPResult, VCPQuality, detect_vcp


@dataclass
class ScanResult:
    """Result of VCP scan for a single stock"""
    symbol: str
    vcp_result: Optional[VCPResult]
    scan_time: datetime
    data_quality: str  # 'good', 'insufficient', 'error'


class VCPScanner:
    """
    NSE VCP Scanner
    Scans F&O stocks for valid Volatility Contraction Patterns
    """

    def __init__(self):
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.detector = VCPDetector()

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
        Scan a single stock for VCP patterns

        Args:
            symbol: Stock symbol
            days: Lookback period in trading days

        Returns:
            ScanResult with VCP analysis
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

            # Detect VCP
            vcp_result = detect_vcp(symbol, df)

            return ScanResult(symbol, vcp_result, end_date, 'good')

        except Exception as e:
            print(f"Error scanning {symbol}: {e}")
            return ScanResult(symbol, None, datetime.now(pytz.timezone('Asia/Kolkata')), 'error')

    def scan_universe(self, max_workers: int = 4, days: int = 252) -> List[ScanResult]:
        """
        Scan all F&O stocks for VCP patterns

        Args:
            max_workers: Number of parallel threads
            days: Lookback period in trading days

        Returns:
            List of ScanResult objects
        """
        results = []

        print(f"Scanning {len(self.fo_stocks)} NSE F&O stocks for VCP patterns...")

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

                    if result.vcp_result:
                        grade = result.vcp_result.grade.value
                        score = result.vcp_result.score
                        print(f"✓ {symbol}: VCP found (Grade {grade}, Score {score})")
                    else:
                        print(f"✗ {symbol}: No VCP found")

                except Exception as e:
                    print(f"Error processing {symbol}: {e}")
                    error_result = ScanResult(
                        symbol, None,
                        datetime.now(pytz.timezone('Asia/Kolkata')), 'error'
                    )
                    results.append(error_result)

        return results

    def get_top_vcps(self, scan_results: List[ScanResult], min_score: int = 70,
                    max_results: int = 20) -> List[VCPResult]:
        """
        Get top VCP results sorted by score

        Args:
            scan_results: Results from scan_universe
            min_score: Minimum VCP score to include
            max_results: Maximum number of results to return

        Returns:
            List of top VCPResult objects
        """
        valid_vcps = [
            result.vcp_result for result in scan_results
            if result.vcp_result and result.vcp_result.score >= min_score
        ]

        # Sort by score descending
        valid_vcps.sort(key=lambda x: x.score, reverse=True)

        return valid_vcps[:max_results]

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
        vcps_found = len([r for r in scan_results if r.vcp_result])

        # Grade distribution
        grade_counts = {}
        for result in scan_results:
            if result.vcp_result:
                grade = result.vcp_result.grade.value
                grade_counts[grade] = grade_counts.get(grade, 0) + 1

        # Top VCPs by grade
        top_vcps = self.get_top_vcps(scan_results, min_score=80, max_results=10)

        report = {
            'scan_timestamp': datetime.now(pytz.timezone('Asia/Kolkata')),
            'total_stocks_scanned': total_scanned,
            'successful_scans': successful_scans,
            'vcps_found': vcps_found,
            'success_rate': successful_scans / total_scanned if total_scanned > 0 else 0,
            'vcp_hit_rate': vcps_found / successful_scans if successful_scans > 0 else 0,
            'grade_distribution': grade_counts,
            'top_vcps': [
                {
                    'symbol': vcp.symbol,
                    'score': vcp.score,
                    'grade': vcp.grade.value,
                    'pivot_level': round(vcp.pivot_level, 2),
                    'stop_loss': round(vcp.stop_loss, 2),
                    'breakout_readiness': vcp.breakout_readiness
                }
                for vcp in top_vcps
            ]
        }

        return report

    def _validate_data_quality(self, df: pd.DataFrame) -> bool:
        """
        Validate data quality for VCP analysis

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
    scanner = VCPScanner()

    print("Starting NSE VCP Scan...")
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
    print(f"VCPs Found: {report['vcps_found']}")
    print(".1f")
    print(".1f")

    print(f"\nGrade Distribution:")
    for grade, count in report['grade_distribution'].items():
        print(f"  {grade}: {count}")

    if report['top_vcps']:
        print(f"\nTop 10 VCPs:")
        print("-" * 80)
        print("<12")
        print("-" * 80)
        for vcp in report['top_vcps']:
            ready = "✓" if vcp['breakout_readiness'] else "✗"
            print("<12")

    # Save detailed results
    timestamp = report['scan_timestamp'].strftime('%Y%m%d_%H%M%S')
    filename = f"vcp_scan_{timestamp}.json"

    import json
    with open(filename, 'w') as f:
        # Convert datetime to string for JSON serialization
        report_copy = report.copy()
        report_copy['scan_timestamp'] = report_copy['scan_timestamp'].isoformat()
        json.dump(report_copy, f, indent=2)

    print(f"\nDetailed results saved to {filename}")


if __name__ == "__main__":
    main()
