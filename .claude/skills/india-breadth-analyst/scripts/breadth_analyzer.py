#!/usr/bin/env python3
"""
India Breadth Analyst - NSE Market Breadth Analysis
Core breadth indicators for NSE market analysis
"""

import pandas as pd
from datetime import datetime
import pytz
from typing import Dict, List, Optional, Any

class BreadthAnalyzer:
    """NSE Market Breadth Analysis Engine"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')

    def calculate_indicators(self, data: Dict[str, Dict[str, float]]) -> Dict[str, float]:
        """Calculate core breadth indicators"""
        advances = sum(1 for stock in data.values() if stock['close'] > stock['open'])
        declines = sum(1 for stock in data.values() if stock['close'] < stock['open'])
        total_stocks = len(data)

        return {
            'ad_ratio': advances / max(declines, 1),
            'breadth_thrust': (advances / max(total_stocks, 1)) * 100,
            'mcclellan': 0.0
        }

    def generate_signals(self, indicators: Dict[str, float]) -> Dict[str, str]:
        """Generate trading signals"""
        ad_ratio = indicators.get('ad_ratio', 1.0)
        thrust = indicators.get('breadth_thrust', 50.0)
        mcc = indicators.get('mcclellan', 0.0)

        return {
            'ad_ratio': 'BULLISH' if ad_ratio > 2.0 else 'BEARISH' if ad_ratio < 0.5 else 'NEUTRAL',
            'breadth_thrust': 'BULLISH' if thrust > 61.5 else 'BEARISH' if thrust < 38.5 else 'NEUTRAL',
            'mcclellan': 'OVERBOUGHT' if mcc > 100 else 'OVERSOLD' if mcc < -100 else 'NEUTRAL'
        }

    def calculate_health_score(self, indicators: Dict[str, float]) -> float:
        """Calculate breadth health score (0-100)"""
        score = 50.0
        ad_ratio = indicators.get('ad_ratio', 1.0)
        score += 20 if ad_ratio > 2.0 else -20 if ad_ratio < 0.5 else 0
        thrust = indicators.get('breadth_thrust', 50.0)
        score += 20 if thrust > 61.5 else -20 if thrust < 38.5 else 0
        mcc = indicators.get('mcclellan', 0.0)
        score += 10 if mcc > 0 else -10
        return max(0, min(100, score))

    def analyze_market_breadth(self, stock_data: Dict[str, Dict[str, float]],
                             index_data: List[float],
                             historical_ratios: Optional[List[float]] = None) -> Dict[str, Any]:
        """Complete breadth analysis for NSE market"""
        try:
            indicators = self.calculate_indicators(stock_data)

            # Update McClellan if historical data available
            if historical_ratios and len(historical_ratios) >= 39:
                ema19 = pd.Series(historical_ratios).ewm(span=19, adjust=False).mean().iloc[-1]
                ema39 = pd.Series(historical_ratios).ewm(span=39, adjust=False).mean().iloc[-1]
                indicators['mcclellan'] = ema19 - ema39

            return {
                'indicators': indicators,
                'signals': self.generate_signals(indicators),
                'breadth_health_score': self.calculate_health_score(indicators),
                'timestamp': datetime.now(self.ist_tz).isoformat(),
                'status': 'success'
            }
        except Exception as e:
            return {'error': str(e), 'status': 'failed', 'timestamp': datetime.now(self.ist_tz).isoformat()}

# Example usage: analyzer = BreadthAnalyzer(); result = analyzer.analyze_market_breadth(stock_data, index_data)
