#!/usr/bin/env python3
"""
Momentum Breakout Detector
Identifies momentum breakouts with volume and technical confirmation
"""

import pandas as pd
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple

class MomentumBreakoutDetector:
    """Detect momentum breakouts using technical analysis"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.min_consolidation_period = 20  # Minimum days for consolidation
        self.max_consolidation_period = 60  # Maximum days for consolidation

    def detect_consolidation_pattern(self, data: pd.DataFrame,
                                   lookback_days: int = 50) -> Dict[str, Any]:
        """Detect if stock is in consolidation pattern"""
        if len(data) < lookback_days:
            return {'is_consolidating': False, 'reason': 'INSUFFICIENT_DATA'}

        recent_data = data.tail(lookback_days)
        high = recent_data['High'].max()
        low = recent_data['Low'].min()
        current_price = recent_data['Close'].iloc[-1]

        # Calculate consolidation metrics
        range_percent = (high - low) / low
        current_position = (current_price - low) / (high - low) if high != low else 0.5

        # Volume trend (should be decreasing during consolidation)
        volume_trend = recent_data['Volume'].pct_change().mean()

        # Price volatility (should be low during consolidation)
        returns = recent_data['Close'].pct_change()
        volatility = returns.std()

        # Determine if consolidating
        is_consolidating = (
            range_percent <= 0.15 and  # Price range <= 15%
            current_position >= 0.3 and current_position <= 0.7 and  # Price in middle
            volume_trend <= 0.1 and  # Volume not increasing significantly
            volatility <= 0.02  # Low volatility
        )

        return {
            'is_consolidating': is_consolidating,
            'range_percent': round(range_percent, 3),
            'current_position': round(current_position, 3),
            'volume_trend': round(volume_trend, 3),
            'volatility': round(volatility, 3),
            'resistance_level': high,
            'support_level': low,
            'consolidation_days': len(recent_data)
        }

    def calculate_momentum_indicators(self, data: pd.DataFrame) -> Dict[str, pd.Series]:
        """Calculate momentum indicators for breakout detection"""
        indicators = {}

        # RSI (Relative Strength Index)
        def calculate_rsi(price_data, period=14):
            delta = price_data.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi

        indicators['RSI'] = calculate_rsi(data['Close'])

        # MACD
        ema_12 = data['Close'].ewm(span=12, adjust=False).mean()
        ema_26 = data['Close'].ewm(span=26, adjust=False).mean()
        indicators['MACD'] = ema_12 - ema_26
        indicators['MACD_Signal'] = indicators['MACD'].ewm(span=9, adjust=False).mean()
        indicators['MACD_Histogram'] = indicators['MACD'] - indicators['MACD_Signal']

        # Price Rate of Change
        indicators['ROC_10'] = data['Close'].pct_change(10)
        indicators['ROC_20'] = data['Close'].pct_change(20)

        # Volume Rate of Change
        indicators['Volume_ROC'] = data['Volume'].pct_change(5)

        return indicators

    def detect_breakout(self, data: pd.DataFrame,
                       consolidation_info: Dict[str, Any]) -> Dict[str, Any]:
        """Detect if a breakout has occurred"""
        if not consolidation_info.get('is_consolidating', False):
            return {'breakout_detected': False, 'reason': 'NOT_CONSOLIDATING'}

        current_price = data['Close'].iloc[-1]
        resistance = consolidation_info['resistance_level']
        current_volume = data['Volume'].iloc[-1]
        avg_volume = data['Volume'].tail(20).mean()

        # Volume confirmation (1.5x average volume)
        volume_confirmed = current_volume >= avg_volume * 1.5

        # Price breakout (close above resistance)
        price_breakout = current_price > resistance

        # Momentum confirmation
        momentum_indicators = self.calculate_momentum_indicators(data)
        rsi = momentum_indicators['RSI'].iloc[-1] if not momentum_indicators['RSI'].empty else 50
        macd_hist = momentum_indicators['MACD_Histogram'].iloc[-1] if not momentum_indicators['MACD_Histogram'].empty else 0

        momentum_confirmed = rsi > 60 and macd_hist > 0

        # Overall breakout signal
        breakout_detected = price_breakout and volume_confirmed and momentum_confirmed

        return {
            'breakout_detected': breakout_detected,
            'price_breakout': price_breakout,
            'volume_confirmed': volume_confirmed,
            'momentum_confirmed': momentum_confirmed,
            'breakout_price': current_price,
            'resistance_level': resistance,
            'volume_ratio': round(current_volume / avg_volume, 2),
            'rsi_value': round(rsi, 2),
            'macd_histogram': round(macd_hist, 4),
            'breakout_strength': 'STRONG' if breakout_detected else 'WEAK'
        }

    def calculate_stop_loss_target(self, breakout_info: Dict[str, Any],
                                 risk_reward_ratio: float = 2.0) -> Dict[str, float]:
        """Calculate stop loss and target levels"""
        if not breakout_info.get('breakout_detected', False):
            return {'stop_loss': None, 'target': None}

        entry_price = breakout_info['breakout_price']
        resistance = breakout_info['resistance_level']

        # Stop loss: Below recent swing low or 5% below entry
        stop_loss = min(entry_price * 0.95, resistance * 0.98)

        # Target: Based on risk-reward ratio
        risk = entry_price - stop_loss
        target = entry_price + (risk * risk_reward_ratio)

        return {
            'stop_loss': round(stop_loss, 2),
            'target': round(target, 2),
            'risk_amount': round(risk, 2),
            'reward_amount': round(risk * risk_reward_ratio, 2),
            'risk_reward_ratio': risk_reward_ratio
        }

    def scan_for_breakouts(self, stock_data: Dict[str, pd.DataFrame],
                          min_volume_ratio: float = 1.5) -> List[Dict[str, Any]]:
        """Scan multiple stocks for momentum breakouts"""
        breakout_candidates = []

        for symbol, data in stock_data.items():
            if len(data) < 50:  # Need minimum data
                continue

            # Check for consolidation
            consolidation = self.detect_consolidation_pattern(data)

            if consolidation['is_consolidating']:
                # Check for breakout
                breakout = self.detect_breakout(data, consolidation)

                if breakout['breakout_detected'] and breakout['volume_ratio'] >= min_volume_ratio:
                    # Calculate risk management
                    risk_management = self.calculate_stop_loss_target(breakout)

                    candidate = {
                        'symbol': symbol,
                        'breakout_info': breakout,
                        'consolidation_info': consolidation,
                        'risk_management': risk_management,
                        'scan_date': datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')
                    }

                    breakout_candidates.append(candidate)

        # Sort by breakout strength (volume ratio)
        breakout_candidates.sort(key=lambda x: x['breakout_info']['volume_ratio'], reverse=True)

        return breakout_candidates

    def generate_breakout_report(self, breakout_candidates: List[Dict[str, Any]]) -> str:
        """Generate a formatted breakout analysis report"""
        if not breakout_candidates:
            return "📊 Momentum Breakout Scan\nNo breakouts detected in current scan"

        report = []
        report.append("🚀 Momentum Breakout Detection Report")
        report.append(f"Generated: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append(f"Breakouts Found: {len(breakout_candidates)}")
        report.append("")

        for i, candidate in enumerate(breakout_candidates[:10], 1):  # Top 10
            breakout = candidate['breakout_info']
            risk = candidate['risk_management']

            report.append(f"{i}. {candidate['symbol']}")
            report.append(f"   Breakout Price: ₹{breakout['breakout_price']:.2f}")
            report.append(f"   Volume Ratio: {breakout['volume_ratio']}x")
            report.append(f"   RSI: {breakout['rsi_value']}")
            report.append(f"   Stop Loss: ₹{risk['stop_loss']}")
            report.append(f"   Target: ₹{risk['target']}")
            report.append(f"   Risk-Reward: 1:{risk['risk_reward_ratio']}")
            report.append("")

        if len(breakout_candidates) > 10:
            report.append(f"... and {len(breakout_candidates) - 10} more breakouts detected")
            report.append("")

        report.append("💡 Trading Guidelines:")
        report.append("• Enter on breakout candle close")
        report.append("• Use stop loss as shown")
        report.append("• Target minimum 2:1 reward-risk ratio")
        report.append("• Confirm with broader market trend")
        report.append("• Monitor volume sustainability")

        return "\n".join(report)

# Example usage
if __name__ == "__main__":
    detector = MomentumBreakoutDetector()

    print("Momentum Breakout Detector initialized")
    print("Use detect_consolidation_pattern() to check for consolidation")
    print("Use detect_breakout() to identify breakouts")
    print("Use scan_for_breakouts() for multi-stock scanning")
