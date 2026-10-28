#!/usr/bin/env python3
"""
Momentum RS Scanner
Combines relative strength and breakout analysis for momentum trading
"""

import pandas as pd
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple

class MomentumRSScanner:
    """Scan for stocks with strong momentum and RS characteristics"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.min_market_cap = 1000  # Minimum market cap in crores
        self.max_positions = 10  # Maximum positions to recommend

    def calculate_composite_score(self, rs_rank: float, momentum_score: float,
                                breakout_strength: float, volume_score: float) -> float:
        """Calculate composite momentum score (0-100)"""
        # Weighted scoring
        weights = {
            'rs_rank': 0.3,        # 30% weight for relative strength
            'momentum': 0.25,      # 25% weight for momentum
            'breakout': 0.25,      # 25% weight for breakout strength
            'volume': 0.2          # 20% weight for volume confirmation
        }

        composite = (
            rs_rank * weights['rs_rank'] +
            momentum_score * weights['momentum'] +
            breakout_strength * weights['breakout'] +
            volume_score * weights['volume']
        )

        return round(composite, 2)

    def score_momentum_indicators(self, indicators: Dict[str, float]) -> float:
        """Score momentum indicators (0-100)"""
        score = 0

        # RSI scoring (0-20 points)
        rsi = indicators.get('RSI', 50)
        if rsi > 70:
            score += 20
        elif rsi > 60:
            score += 15
        elif rsi > 50:
            score += 10

        # MACD scoring (0-20 points)
        macd_hist = indicators.get('MACD_Histogram', 0)
        if macd_hist > 0:
            score += 20 * min(1, macd_hist * 10)  # Scale based on histogram strength

        # ROC scoring (0-20 points)
        roc_10 = indicators.get('ROC_10', 0)
        roc_20 = indicators.get('ROC_20', 0)
        avg_roc = (roc_10 + roc_20) / 2
        if avg_roc > 0.05:  # 5% ROC
            score += 20
        elif avg_roc > 0.02:
            score += 15
        elif avg_roc > 0:
            score += 10

        # Volume ROC scoring (0-20 points)
        vol_roc = indicators.get('Volume_ROC', 0)
        if vol_roc > 0.5:  # 50% volume increase
            score += 20
        elif vol_roc > 0.2:
            score += 15
        elif vol_roc > 0:
            score += 10

        return min(100, score)  # Cap at 100

    def score_breakout_strength(self, breakout_info: Dict[str, Any]) -> float:
        """Score breakout strength (0-100)"""
        if not breakout_info.get('breakout_detected', False):
            return 0

        score = 0

        # Volume ratio scoring (0-40 points)
        volume_ratio = breakout_info.get('volume_ratio', 1)
        if volume_ratio >= 3:
            score += 40
        elif volume_ratio >= 2:
            score += 30
        elif volume_ratio >= 1.5:
            score += 20
        elif volume_ratio >= 1.2:
            score += 10

        # Price breakout strength (0-30 points)
        breakout_price = breakout_info.get('breakout_price', 0)
        resistance = breakout_info.get('resistance_level', breakout_price)
        breakout_percent = (breakout_price - resistance) / resistance

        if breakout_percent > 0.05:  # 5% breakout
            score += 30
        elif breakout_percent > 0.03:
            score += 20
        elif breakout_percent > 0.01:
            score += 10

        # Momentum confirmation (0-30 points)
        rsi = breakout_info.get('rsi_value', 50)
        macd_hist = breakout_info.get('macd_histogram', 0)

        momentum_score = 0
        if rsi > 70:
            momentum_score += 15
        elif rsi > 60:
            momentum_score += 10

        if macd_hist > 0:
            momentum_score += 15

        score += momentum_score

        return min(100, score)

    def score_volume_confirmation(self, volume_data: pd.Series) -> float:
        """Score volume confirmation (0-100)"""
        if volume_data.empty:
            return 0

        # Recent volume vs average
        recent_volume = volume_data.tail(5).mean()
        avg_volume = volume_data.tail(20).mean()

        if avg_volume == 0:
            return 0

        volume_ratio = recent_volume / avg_volume

        if volume_ratio >= 2:
            return 100
        elif volume_ratio >= 1.5:
            return 80
        elif volume_ratio >= 1.2:
            return 60
        elif volume_ratio >= 1.0:
            return 40
        else:
            return 20

    def scan_momentum_opportunities(self, stock_data: Dict[str, pd.DataFrame],
                                  benchmark_data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Comprehensive momentum and RS scanning"""
        opportunities = []

        # Import required classes (in real implementation, these would be separate modules)
        from rs_calculator import RelativeStrengthCalculator
        from breakout_detector import MomentumBreakoutDetector

        rs_calc = RelativeStrengthCalculator()
        breakout_detector = MomentumBreakoutDetector()

        # Calculate RS for all stocks
        rs_ratios = {}
        for symbol, data in stock_data.items():
            if 'Close' not in data.columns or data.empty:
                continue
            rs_ratio = rs_calc.calculate_rs_ratio(data['Close'], benchmark_data['Close'])
            rs_ratios[symbol] = rs_ratio

        # Get RS ranks
        rs_ranks = rs_calc.calculate_rs_rank(rs_ratios)

        for symbol, data in stock_data.items():
            if len(data) < 50:  # Insufficient data
                continue

            try:
                # Get RS rank (convert to 0-100 scale)
                rs_rank = 0
                if symbol in rs_ranks and not rs_ranks[symbol].empty:
                    rs_rank = rs_ranks[symbol].iloc[-1] * 100

                # Check for consolidation and breakout
                consolidation = breakout_detector.detect_consolidation_pattern(data)
                breakout_info = breakout_detector.detect_breakout(data, consolidation)

                # Calculate momentum indicators
                momentum_indicators = breakout_detector.calculate_momentum_indicators(data)
                latest_indicators = {}
                for key, series in momentum_indicators.items():
                    if not series.empty:
                        latest_indicators[key] = series.iloc[-1]

                # Score components
                momentum_score = self.score_momentum_indicators(latest_indicators)
                breakout_score = self.score_breakout_strength(breakout_info)
                volume_score = self.score_volume_confirmation(data['Volume'])

                # Composite score
                composite_score = self.calculate_composite_score(
                    rs_rank, momentum_score, breakout_score, volume_score
                )

                # Only include if score > 60 (strong momentum)
                if composite_score > 60:
                    opportunity = {
                        'symbol': symbol,
                        'composite_score': composite_score,
                        'rs_rank': round(rs_rank, 2),
                        'momentum_score': momentum_score,
                        'breakout_score': breakout_score,
                        'volume_score': volume_score,
                        'breakout_info': breakout_info,
                        'consolidation_info': consolidation,
                        'latest_indicators': latest_indicators,
                        'scan_date': datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')
                    }

                    opportunities.append(opportunity)

            except Exception as e:
                print(f"Error scanning {symbol}: {str(e)}")
                continue

        # Sort by composite score
        opportunities.sort(key=lambda x: x['composite_score'], reverse=True)

        return opportunities[:self.max_positions]  # Return top opportunities

    def generate_momentum_report(self, opportunities: List[Dict[str, Any]]) -> str:
        """Generate comprehensive momentum scanning report"""
        if not opportunities:
            return "📊 Momentum RS Scan\nNo strong momentum opportunities found"

        report = []
        report.append("🚀 Momentum RS Scanning Report")
        report.append(f"Generated: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append(f"Opportunities Found: {len(opportunities)}")
        report.append("")

        report.append("🏆 Top Momentum Opportunities:")
        report.append("Symbol     Score  RS Rank  Momentum  Breakout  Volume")
        report.append("---------------------------------------------------")

        for opp in opportunities:
            symbol = opp['symbol'][:10].ljust(10)
            score = str(opp['composite_score']).rjust(6)
            rs_rank = str(opp['rs_rank']).rjust(8)
            momentum = str(opp['momentum_score']).rjust(9)
            breakout = str(opp['breakout_score']).rjust(9)
            volume = str(opp['volume_score']).rjust(7)

            report.append(f"{symbol} {score} {rs_rank} {momentum} {breakout} {volume}")

        report.append("")
        report.append("📈 Detailed Analysis:")

        for i, opp in enumerate(opportunities[:5], 1):  # Top 5 details
            breakout = opp['breakout_info']
            report.append(f"\n{i}. {opp['symbol']} (Score: {opp['composite_score']})")

            if breakout.get('breakout_detected'):
                report.append(f"   Breakout: ₹{breakout['breakout_price']:.2f} "
                             f"(Volume: {breakout['volume_ratio']}x)")
                report.append(f"   RSI: {breakout['rsi_value']}, MACD: {breakout['macd_histogram']:.4f}")

        report.append("")
        report.append("💡 Investment Guidelines:")
        report.append("• Focus on stocks with Score > 70")
        report.append("• Look for RS Rank > 70 (top quartile)")
        report.append("• Confirm breakouts with volume > 1.5x average")
        report.append("• Use stop losses and position sizing")
        report.append("• Monitor momentum sustainability")

        return "\n".join(report)

# Example usage
if __name__ == "__main__":
    scanner = MomentumRSScanner()

    print("Momentum RS Scanner initialized")
    print("Use scan_momentum_opportunities() for comprehensive scanning")
    print("Use generate_momentum_report() for formatted reports")
