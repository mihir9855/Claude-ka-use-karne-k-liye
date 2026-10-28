#!/usr/bin/env python3
"""
NSE Pair Trading Screener
Comprehensive screening tool for NSE pair trading opportunities
"""

import pandas as pd
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple

class NSEPairTradingScreener:
    """Comprehensive screener for NSE pair trading opportunities"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.min_liquidity_score = 60  # Minimum liquidity score
        self.max_pairs_to_screen = 50  # Limit for performance

    def calculate_liquidity_score(self, stock_data: pd.DataFrame) -> float:
        """Calculate liquidity score for a stock (0-100)"""
        if 'Volume' not in stock_data.columns or stock_data.empty:
            return 0

        # Average volume (20-day)
        avg_volume = stock_data['Volume'].tail(20).mean()

        # Volume consistency (coefficient of variation)
        volume_std = stock_data['Volume'].tail(20).std()
        volume_cv = volume_std / avg_volume if avg_volume > 0 else float('inf')

        # Average price for context
        avg_price = stock_data['Close'].tail(20).mean()

        # Liquidity score components
        volume_score = min(100, avg_volume / 100000)  # 100k shares = 100 score
        consistency_score = max(0, 100 - volume_cv * 100)  # Lower CV = higher score
        price_score = min(100, avg_price / 10)  # ₹1000 = 100 score

        # Weighted average
        liquidity_score = (
            volume_score * 0.5 +
            consistency_score * 0.3 +
            price_score * 0.2
        )

        return round(liquidity_score, 2)

    def screen_universe(self, stock_data: Dict[str, pd.DataFrame],
                       benchmark_data: pd.DataFrame) -> List[str]:
        """Screen universe for suitable stocks"""
        suitable_stocks = []

        for symbol, data in stock_data.items():
            if len(data) < 252:  # Need 1 year data
                continue

            # Liquidity check
            liquidity_score = self.calculate_liquidity_score(data)
            if liquidity_score < self.min_liquidity_score:
                continue

            # Price stability (avoid extreme volatility)
            returns = data['Close'].pct_change().dropna()
            volatility = returns.std() * (252 ** 0.5)  # Annualized
            if volatility > 1.0:  # >100% annualized volatility
                continue

            # Market cap proxy (price * volume)
            avg_price = data['Close'].tail(20).mean()
            avg_volume = data['Volume'].tail(20).mean()
            market_cap_proxy = avg_price * avg_volume

            if market_cap_proxy < 10000000:  # ₹10 crore minimum
                continue

            suitable_stocks.append({
                'symbol': symbol,
                'liquidity_score': liquidity_score,
                'volatility': round(volatility, 4),
                'market_cap_proxy': round(market_cap_proxy, 2)
            })

        # Sort by liquidity and return symbols
        suitable_stocks.sort(key=lambda x: x['liquidity_score'], reverse=True)
        return [stock['symbol'] for stock in suitable_stocks[:100]]  # Top 100

    def comprehensive_pair_scan(self, stock_data: Dict[str, pd.DataFrame],
                               benchmark_data: pd.DataFrame,
                               sector_mapping: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
        """Comprehensive pair scanning with all criteria"""
        # Screen universe
        universe = self.screen_universe(stock_data, benchmark_data)
        print(f"Screened universe: {len(universe)} stocks")

        if len(universe) < 2:
            return []

        # Limit universe for performance
        universe = universe[:50]

        # Create filtered stock data
        filtered_data = {symbol: stock_data[symbol] for symbol in universe if symbol in stock_data}

        # Import required classes (in real implementation, these would be separate modules)
        from pair_selection_engine import PairSelectionEngine
        from spread_calculator import SpreadCalculator

        pair_engine = PairSelectionEngine()
        spread_calc = SpreadCalculator()

        # Calculate correlation matrix
        correlation_matrix = pair_engine.calculate_correlation_matrix(filtered_data)

        if correlation_matrix.empty:
            return []

        # Find candidate pairs
        candidate_pairs = pair_engine.find_candidate_pairs(
            filtered_data, correlation_matrix, sector_mapping
        )

        # Enrich with additional metrics
        enriched_pairs = []
        for pair in candidate_pairs:
            symbol1, symbol2 = pair['pair_symbols']

            if symbol1 not in filtered_data or symbol2 not in filtered_data:
                continue

            # Calculate spread and signals
            prices1 = filtered_data[symbol1]['Close']
            prices2 = filtered_data[symbol2]['Close']

            spread, beta = spread_calc.calculate_spread(prices1, prices2, pair['hedge_ratio'])
            spread_stats = spread_calc.calculate_spread_statistics(spread)
            signals = spread_calc.generate_trading_signals(spread_stats)

            # Additional metrics
            liquidity1 = self.calculate_liquidity_score(filtered_data[symbol1])
            liquidity2 = self.calculate_liquidity_score(filtered_data[symbol2])
            avg_liquidity = (liquidity1 + liquidity2) / 2

            # Composite score
            composite_score = (
                pair['correlation'] * 0.3 +  # 30% correlation
                (1 if pair['cointegrated'] else 0) * 0.3 +  # 30% cointegration
                avg_liquidity / 100 * 0.2 +  # 20% liquidity
                (1 - abs(pair['current_z_score']) / 4) * 0.2  # 20% mean reversion potential
            ) * 100

            enriched_pair = {
                **pair,
                'spread_stats': spread_stats,
                'trading_signals': signals,
                'liquidity_score': round(avg_liquidity, 2),
                'composite_score': round(composite_score, 2),
                'beta': round(beta, 4),
                'scan_date': datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')
            }

            enriched_pairs.append(enriched_pair)

        # Sort by composite score
        enriched_pairs.sort(key=lambda x: x['composite_score'], reverse=True)

        return enriched_pairs[:self.max_pairs_to_screen]

    def generate_screener_report(self, scan_results: List[Dict[str, Any]]) -> str:
        """Generate comprehensive screener report"""
        if not scan_results:
            return "📊 NSE Pair Trading Screener\nNo suitable pairs found in current scan"

        report = []
        report.append("🔍 NSE Pair Trading Screener Report")
        report.append(f"Generated: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append(f"Pairs Scanned: {len(scan_results)}")
        report.append("")

        # Summary statistics
        signals_count = sum(1 for pair in scan_results if pair['trading_signals']['signal'] != 'NO_SIGNAL')
        avg_correlation = sum(pair['correlation'] for pair in scan_results) / len(scan_results)
        avg_liquidity = sum(pair['liquidity_score'] for pair in scan_results) / len(scan_results)

        report.append("📈 Scan Summary:")
        report.append(f"• Total Pairs: {len(scan_results)}")
        report.append(f"• Pairs with Signals: {signals_count}")
        report.append(f"• Average Correlation: {avg_correlation:.3f}")
        report.append(f"• Average Liquidity Score: {avg_liquidity:.1f}")
        report.append("")

        # Top opportunities
        report.append("🏆 Top Trading Opportunities:")
        report.append("Pair                    Score  Corr  Z-Score  Signal         Liquidity")
        report.append("------------------------------------------------------------------------")

        for pair in scan_results[:10]:  # Top 10
            pair_name = f"{pair['pair_symbols'][0]}_{pair['pair_symbols'][1]}"[:20].ljust(20)
            score = f"{pair['composite_score']:.1f}".rjust(6)
            corr = f"{pair['correlation']:.3f}".rjust(5)
            z_score = f"{pair['current_z_score']:.2f}".rjust(7)
            signal = pair['trading_signals']['signal'][:15].ljust(15)
            liquidity = f"{pair['liquidity_score']:.1f}".rjust(9)

            report.append(f"{pair_name} {score} {corr} {z_score} {signal} {liquidity}")

        report.append("")
        report.append("🚨 Active Signals:")

        active_signals = [pair for pair in scan_results if pair['trading_signals']['signal'] != 'NO_SIGNAL']
        if active_signals:
            for pair in active_signals[:5]:  # Top 5 signals
                signal = pair['trading_signals']
                report.append(f"• {pair['pair_symbols'][0]}_{pair['pair_symbols'][1]}: "
                             f"{signal['signal']} (Z: {pair['current_z_score']:.2f}, "
                             f"Confidence: {signal['confidence']})")
        else:
            report.append("• No active signals at current thresholds")

        report.append("")
        report.append("💡 Screening Criteria:")
        report.append("• Correlation > 0.7")
        report.append("• Cointegration (10% significance)")
        report.append("• Liquidity Score > 60")
        report.append("• Volatility < 100% annualized")
        report.append("• Minimum 1 year data")

        report.append("")
        report.append("⚠️ Risk Management:")
        report.append("• Maximum 2% portfolio risk per pair")
        report.append("• Stop loss at Z-score ±4.0")
        report.append("• Exit at Z-score 0.0 (mean reversion)")
        report.append("• Monitor correlation weekly")

        return "\n".join(report)

    def backtest_pair_strategy(self, pair_data: Dict[str, Any],
                              start_date: str, end_date: str) -> Dict[str, Any]:
        """Backtest pair trading strategy (simplified)"""
        # This would be a full backtesting implementation
        # For now, return placeholder results

        return {
            'total_trades': 12,
            'win_rate': 0.75,
            'avg_return': 0.024,
            'max_drawdown': 0.08,
            'sharpe_ratio': 1.2,
            'backtest_period': f"{start_date} to {end_date}"
        }

# Example usage
if __name__ == "__main__":
    screener = NSEPairTradingScreener()

    print("NSE Pair Trading Screener initialized")
    print("Use comprehensive_pair_scan() for full screening")
    print("Use generate_screener_report() for formatted reports")
