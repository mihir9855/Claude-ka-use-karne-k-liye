#!/usr/bin/env python3
"""
Pair Selection Engine
Identifies statistically significant stock pairs for NSE pair trading
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple
from statsmodels.tsa.stattools import coint, adfuller
from scipy.stats import pearsonr
import warnings
warnings.filterwarnings('ignore')

class PairSelectionEngine:
    """Engine for selecting statistically significant stock pairs"""

    def __init__(self, min_correlation: float = 0.7, min_lookback: int = 252):
        self.min_correlation = min_correlation
        self.min_lookback = min_lookback
        self.ist_tz = pytz.timezone('Asia/Kolkata')

    def calculate_correlation_matrix(self, stock_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Calculate correlation matrix for all stock pairs"""
        if not stock_data:
            return pd.DataFrame()

        # Get common date range
        all_dates = set()
        for data in stock_data.values():
            if 'Close' in data.columns:
                all_dates.update(data.index)

        common_dates = sorted(list(all_dates))[-self.min_lookback:]
        if len(common_dates) < self.min_lookback:
            return pd.DataFrame()

        # Create returns dataframe
        returns_data = {}
        for symbol, data in stock_data.items():
            if 'Close' in data.columns and len(data) >= self.min_lookback:
                prices = data.loc[data.index.isin(common_dates), 'Close']
                if len(prices) >= self.min_lookback:
                    returns = prices.pct_change().dropna()
                    returns_data[symbol] = returns

        if len(returns_data) < 2:
            return pd.DataFrame()

        returns_df = pd.DataFrame(returns_data)
        correlation_matrix = returns_df.corr()

        return correlation_matrix

    def test_cointegration(self, price_series_1: pd.Series,
                          price_series_2: pd.Series) -> Dict[str, Any]:
        """Test for cointegration between two price series"""
        # Align the series
        common_index = price_series_1.index.intersection(price_series_2.index)
        if len(common_index) < self.min_lookback:
            return {'cointegrated': False, 'reason': 'INSUFFICIENT_DATA'}

        series1 = price_series_1.loc[common_index]
        series2 = price_series_2.loc[common_index]

        try:
            # Engle-Granger cointegration test
            coint_result = coint(series1, series2)
            coint_t_stat = coint_result[0]
            coint_p_value = coint_result[1]
            critical_values = coint_result[2]

            # Cointegrated if t-statistic is more negative than 10% critical value
            cointegrated = coint_t_stat < critical_values[1]  # 10% significance

            # Calculate hedge ratio (beta)
            beta = np.cov(series1, series2)[0, 1] / np.var(series2)

            return {
                'cointegrated': cointegrated,
                't_statistic': round(coint_t_stat, 4),
                'p_value': round(coint_p_value, 4),
                'critical_values': [round(cv, 4) for cv in critical_values],
                'hedge_ratio': round(beta, 4),
                'significance_level': '10%' if cointegrated else 'Not significant'
            }

        except Exception as e:
            return {'cointegrated': False, 'reason': f'CALCULATION_ERROR: {str(e)}'}

    def calculate_pair_metrics(self, stock_data: Dict[str, pd.DataFrame],
                              pair: Tuple[str, str]) -> Dict[str, Any]:
        """Calculate comprehensive metrics for a stock pair"""
        symbol1, symbol2 = pair

        if symbol1 not in stock_data or symbol2 not in stock_data:
            return {'error': 'STOCK_DATA_MISSING'}

        data1 = stock_data[symbol1]
        data2 = stock_data[symbol2]

        if 'Close' not in data1.columns or 'Close' not in data2.columns:
            return {'error': 'PRICE_DATA_MISSING'}

        # Get common trading days
        common_index = data1.index.intersection(data2.index)
        if len(common_index) < self.min_lookback:
            return {'error': 'INSUFFICIENT_COMMON_DATA'}

        prices1 = data1.loc[common_index, 'Close']
        prices2 = data2.loc[common_index, 'Close']

        # Correlation
        returns1 = prices1.pct_change().dropna()
        returns2 = prices2.pct_change().dropna()
        common_return_index = returns1.index.intersection(returns2.index)

        if len(common_return_index) < self.min_lookback - 1:
            return {'error': 'INSUFFICIENT_RETURN_DATA'}

        returns1 = returns1.loc[common_return_index]
        returns2 = returns2.loc[common_return_index]

        correlation, corr_p_value = pearsonr(returns1, returns2)

        # Cointegration
        coint_result = self.test_cointegration(prices1, prices2)

        # Spread calculation
        beta = coint_result.get('hedge_ratio', 1.0)
        spread = prices1 - beta * prices2

        # Spread statistics
        spread_mean = spread.mean()
        spread_std = spread.std()
        current_spread = spread.iloc[-1]
        z_score = (current_spread - spread_mean) / spread_std

        # Half-life of mean reversion (Ornstein-Uhlenbeck process)
        spread_lag = spread.shift(1).dropna()
        spread_diff = spread.diff().dropna()
        common_index = spread_lag.index.intersection(spread_diff.index)

        if len(common_index) > 10:
            try:
                # Simple OLS regression for half-life
                y = spread_diff.loc[common_index]
                x = -spread_lag.loc[common_index]
                beta_half_life = np.cov(x, y)[0, 1] / np.var(x)
                half_life = -np.log(2) / beta_half_life if beta_half_life < 0 else float('inf')
            except:
                half_life = float('inf')
        else:
            half_life = float('inf')

        return {
            'pair': f'{symbol1}_{symbol2}',
            'correlation': round(correlation, 4),
            'correlation_p_value': round(corr_p_value, 4),
            'cointegration': coint_result,
            'spread_stats': {
                'mean': round(spread_mean, 4),
                'std': round(spread_std, 4),
                'current': round(current_spread, 4),
                'z_score': round(z_score, 4)
            },
            'half_life': round(half_life, 2) if half_life != float('inf') else 'Infinite',
            'data_points': len(common_index),
            'beta': round(beta, 4)
        }

    def find_candidate_pairs(self, stock_data: Dict[str, pd.DataFrame],
                           correlation_matrix: pd.DataFrame,
                           sector_mapping: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Find candidate pairs based on correlation and cointegration"""
        candidate_pairs = []

        # Get highly correlated pairs
        high_corr_pairs = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i + 1, len(correlation_matrix.columns)):
                symbol1 = correlation_matrix.columns[i]
                symbol2 = correlation_matrix.columns[j]
                corr = correlation_matrix.iloc[i, j]

                if abs(corr) >= self.min_correlation:
                    # Check sector similarity if mapping provided
                    same_sector = True
                    if sector_mapping:
                        sector1 = sector_mapping.get(symbol1, '')
                        sector2 = sector_mapping.get(symbol2, '')
                        same_sector = sector1 == sector2 and sector1 != ''

                    high_corr_pairs.append({
                        'pair': (symbol1, symbol2),
                        'correlation': abs(corr),
                        'same_sector': same_sector
                    })

        # Sort by correlation strength
        high_corr_pairs.sort(key=lambda x: x['correlation'], reverse=True)

        # Test top pairs for cointegration
        tested_pairs = 0
        max_pairs_to_test = 50  # Limit to avoid excessive computation

        for pair_info in high_corr_pairs[:max_pairs_to_test]:
            pair = pair_info['pair']
            metrics = self.calculate_pair_metrics(stock_data, pair)

            if 'error' not in metrics and metrics['cointegration'].get('cointegrated', False):
                candidate = {
                    'pair_symbols': pair,
                    'correlation': metrics['correlation'],
                    'cointegrated': True,
                    'hedge_ratio': metrics['beta'],
                    'half_life': metrics['half_life'],
                    'current_z_score': metrics['spread_stats']['z_score'],
                    'same_sector': pair_info['same_sector'],
                    'data_quality': 'GOOD' if metrics['data_points'] >= 252 else 'FAIR'
                }
                candidate_pairs.append(candidate)
                tested_pairs += 1

                if tested_pairs >= 20:  # Limit final candidates
                    break

        return candidate_pairs

    def generate_pair_selection_report(self, candidate_pairs: List[Dict[str, Any]]) -> str:
        """Generate a formatted pair selection report"""
        if not candidate_pairs:
            return "📊 Pair Selection Report\nNo suitable pairs found with current criteria"

        report = []
        report.append("🔗 NSE Pair Selection Report")
        report.append(f"Generated: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append(f"Candidate Pairs Found: {len(candidate_pairs)}")
        report.append("")

        report.append("🏆 Top Cointegrated Pairs:")
        report.append("Pair                    Correlation  Beta   Half-Life  Z-Score  Sector")
        report.append("---------------------------------------------------------------------")

        for pair in candidate_pairs[:10]:  # Top 10
            pair_name = f"{pair['pair_symbols'][0]}_{pair['pair_symbols'][1]}"[:20].ljust(20)
            corr = f"{pair['correlation']:.3f}".rjust(11)
            beta = f"{pair['hedge_ratio']:.3f}".rjust(6)
            half_life = str(pair['half_life'])[:8].rjust(9)
            z_score = f"{pair['current_z_score']:.2f}".rjust(8)
            sector = "Same" if pair['same_sector'] else "Diff"

            report.append(f"{pair_name} {corr} {beta} {half_life} {z_score} {sector}")

        report.append("")
        report.append("📈 Selection Criteria:")
        report.append(f"• Minimum Correlation: {self.min_correlation}")
        report.append(f"• Minimum Lookback: {self.min_lookback} days")
        report.append("• Cointegration Test: Engle-Granger (10% significance)")
        report.append("• Sector Preference: Same sector pairs prioritized")

        report.append("")
        report.append("💡 Trading Guidelines:")
        report.append("• Focus on pairs with Half-Life < 20 days")
        report.append("• Enter when |Z-Score| > 2.0")
        report.append("• Exit when Z-Score returns to 0")
        report.append("• Monitor correlation stability weekly")

        return "\n".join(report)

# Example usage
if __name__ == "__main__":
    engine = PairSelectionEngine()

    print("Pair Selection Engine initialized")
    print("Use calculate_correlation_matrix() to analyze stock relationships")
    print("Use find_candidate_pairs() to identify tradeable pairs")
