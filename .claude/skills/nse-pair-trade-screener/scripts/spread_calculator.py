#!/usr/bin/env python3
"""
Spread Calculator and Signal Generator
Calculates pair spreads and generates trading signals for NSE pairs
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple

class SpreadCalculator:
    """Calculate and analyze pair spreads for trading signals"""

    def __init__(self, entry_threshold: float = 2.0, exit_threshold: float = 0.5):
        self.entry_threshold = entry_threshold
        self.exit_threshold = exit_threshold
        self.ist_tz = pytz.timezone('Asia/Kolkata')

    def calculate_spread(self, prices1: pd.Series, prices2: pd.Series,
                        hedge_ratio: float = None) -> pd.Series:
        """Calculate the spread between two price series"""
        # Align the series
        common_index = prices1.index.intersection(prices2.index)
        prices1_aligned = prices1.loc[common_index]
        prices2_aligned = prices2.loc[common_index]

        # Calculate hedge ratio if not provided
        if hedge_ratio is None:
            covariance = np.cov(prices1_aligned, prices2_aligned)[0, 1]
            variance = np.var(prices2_aligned)
            hedge_ratio = covariance / variance if variance != 0 else 1.0

        # Calculate spread: Price1 - beta * Price2
        spread = prices1_aligned - hedge_ratio * prices2_aligned

        return spread, hedge_ratio

    def normalize_spread(self, spread: pd.Series) -> Tuple[pd.Series, float, float]:
        """Normalize spread to z-score"""
        spread_mean = spread.mean()
        spread_std = spread.std()

        if spread_std == 0:
            return pd.Series([0] * len(spread), index=spread.index), spread_mean, spread_std

        z_score = (spread - spread_mean) / spread_std
        return z_score, spread_mean, spread_std

    def calculate_spread_statistics(self, spread: pd.Series) -> Dict[str, Any]:
        """Calculate comprehensive spread statistics"""
        if spread.empty:
            return {'error': 'EMPTY_SPREAD'}

        z_score, spread_mean, spread_std = self.normalize_spread(spread)

        # Current values
        current_spread = spread.iloc[-1]
        current_z = z_score.iloc[-1]

        # Historical extremes
        max_spread = spread.max()
        min_spread = spread.min()
        max_z = z_score.max()
        min_z = z_score.min()

        # Rolling statistics (63-day window)
        rolling_mean = spread.rolling(window=63).mean()
        rolling_std = spread.rolling(window=63).std()
        rolling_z = (spread - rolling_mean) / rolling_std

        # Bollinger Bands (2 SD)
        upper_band = rolling_mean + 2 * rolling_std
        lower_band = rolling_mean - 2 * rolling_std

        # Current position relative to bands
        current_upper_dist = (current_spread - upper_band.iloc[-1]) / spread_std
        current_lower_dist = (lower_band.iloc[-1] - current_spread) / spread_std

        return {
            'current_spread': round(current_spread, 4),
            'current_z_score': round(current_z, 4),
            'spread_mean': round(spread_mean, 4),
            'spread_std': round(spread_std, 4),
            'max_spread': round(max_spread, 4),
            'min_spread': round(min_spread, 4),
            'max_z': round(max_z, 4),
            'min_z': round(min_z, 4),
            'upper_band_distance': round(current_upper_dist, 2),
            'lower_band_distance': round(current_lower_dist, 2),
            'data_points': len(spread)
        }

    def generate_trading_signals(self, spread_stats: Dict[str, Any],
                               current_position: Optional[str] = None) -> Dict[str, Any]:
        """Generate trading signals based on spread analysis"""
        if 'error' in spread_stats:
            return {'signal': 'ERROR', 'reason': spread_stats['error']}

        z_score = spread_stats['current_z_score']

        # Determine signal
        if abs(z_score) >= self.entry_threshold:
            if z_score > 0:
                signal = 'SHORT_SPREAD'  # Short stock1, Long stock2
                direction = 'UPPER_BOLlinger'
            else:
                signal = 'LONG_SPREAD'   # Long stock1, Short stock2
                direction = 'LOWER_BOLlinger'
        elif abs(z_score) <= self.exit_threshold:
            if current_position:
                signal = 'EXIT_POSITION'
                direction = 'MEAN_REVERSION'
            else:
                signal = 'NO_SIGNAL'
                direction = 'NEUTRAL'
        else:
            signal = 'NO_SIGNAL'
            direction = 'MONITOR'

        # Calculate position sizes (equal dollar value)
        position_size = self.calculate_position_size(spread_stats)

        # Risk management
        stop_loss_z = 4.0  # Exit if z-score exceeds 4
        take_profit_z = 0.0  # Exit at mean

        return {
            'signal': signal,
            'direction': direction,
            'z_score': z_score,
            'entry_threshold': self.entry_threshold,
            'exit_threshold': self.exit_threshold,
            'position_size': position_size,
            'stop_loss_z': stop_loss_z,
            'take_profit_z': take_profit_z,
            'confidence': self.calculate_signal_confidence(z_score),
            'expected_move': self.estimate_reversion_time(z_score)
        }

    def calculate_position_size(self, spread_stats: Dict[str, Any],
                              capital: float = 100000,
                              risk_percent: float = 2.0) -> Dict[str, float]:
        """Calculate position sizes for pair trade"""
        spread_std = spread_stats.get('spread_std', 1.0)
        z_score = abs(spread_stats.get('current_z_score', 0))

        if spread_std == 0 or z_score == 0:
            return {'stock1_qty': 0, 'stock2_qty': 0, 'total_exposure': 0}

        # Risk amount per leg
        risk_amount = capital * (risk_percent / 100) / 2  # Split between two legs

        # Position size based on spread volatility
        # More volatile spreads get smaller positions
        volatility_adjustment = min(1.0, 1.0 / (spread_std / 100))  # Normalize by ₹100

        # Confidence adjustment (higher z-score = larger position)
        confidence_multiplier = min(2.0, z_score / self.entry_threshold)

        adjusted_risk = risk_amount * volatility_adjustment * confidence_multiplier

        # Assume average stock price of ₹1000 for sizing
        avg_price = 1000
        quantity = int(adjusted_risk / avg_price)

        return {
            'stock1_qty': quantity,
            'stock2_qty': quantity,
            'total_exposure': quantity * avg_price * 2,
            'risk_amount': risk_amount * 2,
            'volatility_adjustment': round(volatility_adjustment, 2),
            'confidence_multiplier': round(confidence_multiplier, 2)
        }

    def calculate_signal_confidence(self, z_score: float) -> str:
        """Calculate confidence level of the signal"""
        abs_z = abs(z_score)

        if abs_z >= 3.0:
            return 'VERY_HIGH'
        elif abs_z >= 2.5:
            return 'HIGH'
        elif abs_z >= 2.0:
            return 'MEDIUM'
        elif abs_z >= 1.5:
            return 'LOW'
        else:
            return 'NONE'

    def estimate_reversion_time(self, z_score: float) -> str:
        """Estimate expected time for mean reversion"""
        abs_z = abs(z_score)

        if abs_z >= 3.0:
            return '1-2 weeks'
        elif abs_z >= 2.5:
            return '2-4 weeks'
        elif abs_z >= 2.0:
            return '1-2 months'
        elif abs_z >= 1.5:
            return '2-3 months'
        else:
            return 'Unknown'

    def monitor_pair_performance(self, spread_history: pd.Series,
                               entry_date: datetime,
                               entry_z: float) -> Dict[str, Any]:
        """Monitor performance of open pair position"""
        if spread_history.empty:
            return {'error': 'NO_DATA'}

        # Calculate current z-score
        _, spread_mean, spread_std = self.normalize_spread(spread_history)
        current_spread = spread_history.iloc[-1]
        current_z = (current_spread - spread_mean) / spread_std

        # Performance metrics
        z_change = current_z - entry_z
        days_held = (datetime.now(self.ist_tz) - entry_date).days

        # P&L estimation (simplified)
        # Assume ₹1000 average position size per leg
        position_value = 1000
        spread_change = current_spread - spread_history.loc[entry_date:].iloc[0]
        estimated_pnl = spread_change * position_value / spread_std

        # Risk metrics
        max_adverse_z = max(abs(current_z), abs(entry_z))
        risk_adjusted_return = estimated_pnl / max_adverse_z if max_adverse_z > 0 else 0

        return {
            'current_z': round(current_z, 4),
            'z_change': round(z_change, 4),
            'days_held': days_held,
            'estimated_pnl': round(estimated_pnl, 2),
            'risk_adjusted_return': round(risk_adjusted_return, 4),
            'max_adverse_excursion': round(max_adverse_z, 4),
            'status': 'OPEN'
        }

    def generate_signal_report(self, pair_name: str, spread_stats: Dict[str, Any],
                             signal_info: Dict[str, Any]) -> str:
        """Generate a formatted signal report"""
        report = []
        report.append(f"📊 Pair Trading Signal Report - {pair_name}")
        report.append(f"Generated: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append("")

        # Spread Statistics
        report.append("📈 Spread Statistics:")
        report.append(f"• Current Spread: ₹{spread_stats['current_spread']:.2f}")
        report.append(f"• Z-Score: {spread_stats['current_z_score']:.2f}")
        report.append(f"• Mean: ₹{spread_stats['spread_mean']:.2f}")
        report.append(f"• Std Dev: ₹{spread_stats['spread_std']:.2f}")
        report.append("")

        # Signal Information
        signal = signal_info['signal']
        if signal != 'NO_SIGNAL':
            report.append(f"🚨 SIGNAL: {signal}")
            report.append(f"Direction: {signal_info['direction']}")
            report.append(f"Confidence: {signal_info['confidence']}")
            report.append(f"Expected Reversion: {signal_info['expected_move']}")
            report.append("")

            # Position Sizing
            pos = signal_info['position_size']
            report.append("💰 Position Sizing:")
            report.append(f"• Stock 1 Quantity: {pos['stock1_qty']}")
            report.append(f"• Stock 2 Quantity: {pos['stock2_qty']}")
            report.append(f"• Total Exposure: ₹{pos['total_exposure']:,}")
            report.append(f"• Risk Amount: ₹{pos['risk_amount']:,}")
            report.append("")

            # Risk Management
            report.append("⚠️ Risk Management:")
            report.append(f"• Stop Loss Z-Score: {signal_info['stop_loss_z']}")
            report.append(f"• Take Profit Z-Score: {signal_info['take_profit_z']}")
            report.append(f"• Exit Threshold: ±{self.exit_threshold}")
        else:
            report.append("✅ NO SIGNAL - Spread within normal range")

        return "\n".join(report)

# Example usage
if __name__ == "__main__":
    calculator = SpreadCalculator()

    print("Spread Calculator initialized")
    print("Use calculate_spread() to compute pair spreads")
    print("Use generate_trading_signals() for entry/exit signals")
