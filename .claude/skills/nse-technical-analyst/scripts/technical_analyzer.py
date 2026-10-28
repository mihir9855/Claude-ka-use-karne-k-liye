#!/usr/bin/env python3
"""
NSE Technical Analysis Engine
Comprehensive technical analysis for Indian stocks and indices with NSE market context.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TimeFrame(Enum):
    MINUTE_5 = "5m"
    MINUTE_15 = "15m"
    MINUTE_30 = "30m"
    HOUR_1 = "1h"
    HOUR_4 = "4h"
    DAILY = "1d"
    WEEKLY = "1w"
    MONTHLY = "1M"

class TrendDirection(Enum):
    BULLISH = "Bullish"
    BEARISH = "Bearish"
    SIDEWAYS = "Sideways"
    UNKNOWN = "Unknown"

class SignalStrength(Enum):
    WEAK = 1
    MODERATE = 2
    STRONG = 3
    VERY_STRONG = 4

@dataclass
class TechnicalIndicators:
    rsi: Optional[float] = None
    macd_line: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_12: Optional[float] = None
    ema_26: Optional[float] = None
    bb_upper: Optional[float] = None
    bb_middle: Optional[float] = None
    bb_lower: Optional[float] = None
    bb_position: Optional[float] = None  # %B
    atr: Optional[float] = None
    stochastic_k: Optional[float] = None
    stochastic_d: Optional[float] = None
    vwap: Optional[float] = None
    volume_sma: Optional[float] = None

@dataclass
class SupportResistance:
    strong_resistance: List[float]
    minor_resistance: List[float]
    pivot_point: Optional[float]
    minor_support: List[float]
    strong_support: List[float]

@dataclass
class ChartPattern:
    pattern_name: str
    direction: TrendDirection
    confidence: float  # 0-1
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    description: str = ""

@dataclass
class TrendAnalysis:
    primary_trend: TrendDirection
    short_term: Tuple[TrendDirection, int]  # direction, strength (1-10)
    medium_term: Tuple[TrendDirection, int]
    long_term: Tuple[TrendDirection, int]

@dataclass
class TechnicalAnalysis:
    symbol: str
    current_price: float
    price_change_pct: float
    indicators: TechnicalIndicators
    support_resistance: SupportResistance
    patterns: List[ChartPattern]
    trend_analysis: TrendAnalysis
    trading_bias: Dict[str, any]
    risk_management: Dict[str, any]
    market_context: Dict[str, any]

class NSETechnicalAnalyzer:
    """
    Main technical analysis engine for NSE markets
    """

    def __init__(self):
        self.indicator_calculator = IndicatorCalculator()
        self.pattern_scanner = PatternScanner()

    def analyze_symbol(self, symbol: str, timeframe: TimeFrame = TimeFrame.DAILY,
                      data: Optional[pd.DataFrame] = None) -> TechnicalAnalysis:
        """
        Perform complete technical analysis for a symbol

        Args:
            symbol: NSE symbol (e.g., 'RELIANCE', 'NIFTY 50')
            timeframe: Analysis timeframe
            data: OHLCV data (if None, will fetch from NSE)

        Returns:
            Complete technical analysis report
        """
        logger.info(f"Analyzing {symbol} on {timeframe.value} timeframe")

        # Fetch data if not provided
        if data is None:
            data = self._fetch_symbol_data(symbol, timeframe)

        if data.empty:
            raise ValueError(f"No data available for {symbol}")

        # Calculate current price and change
        current_price = data['close'].iloc[-1]
        prev_close = data['close'].iloc[-2] if len(data) > 1 else current_price
        price_change_pct = ((current_price - prev_close) / prev_close) * 100

        # Calculate technical indicators
        indicators = self.indicator_calculator.calculate_all_indicators(data)

        # Find support and resistance levels
        support_resistance = self._calculate_support_resistance(data)

        # Scan for chart patterns
        patterns = self.pattern_scanner.scan_patterns(data)

        # Analyze trend across timeframes
        trend_analysis = self._analyze_trend(data, timeframe)

        # Generate trading bias
        trading_bias = self._generate_trading_bias(indicators, patterns, trend_analysis)

        # Risk management recommendations
        risk_management = self._calculate_risk_management(data, current_price, indicators)

        # Market context
        market_context = self._get_market_context(symbol, data)

        return TechnicalAnalysis(
            symbol=symbol,
            current_price=current_price,
            price_change_pct=price_change_pct,
            indicators=indicators,
            support_resistance=support_resistance,
            patterns=patterns,
            trend_analysis=trend_analysis,
            trading_bias=trading_bias,
            risk_management=risk_management,
            market_context=market_context
        )

    def _fetch_symbol_data(self, symbol: str, timeframe: TimeFrame) -> pd.DataFrame:
        """Fetch historical data for symbol (placeholder - integrate with NSE data fetcher)"""
        # This would integrate with shared/nse_data_fetcher.py
        # For now, return sample data structure

        # Sample data generation (replace with actual NSE data fetching)
        dates = pd.date_range(end=datetime.now(), periods=200, freq='D')
        np.random.seed(42)

        # Generate realistic OHLCV data
        base_price = 1000 if 'NIFTY' in symbol else 2000
        prices = [base_price]

        for i in range(199):
            change = np.random.normal(0, 0.02)  # 2% daily volatility
            new_price = prices[-1] * (1 + change)
            prices.append(max(new_price, 100))  # Floor at 100

        data = pd.DataFrame({
            'timestamp': dates,
            'open': prices,
            'high': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
            'low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
            'close': prices[1:] + [prices[-1]],
            'volume': np.random.randint(100000, 1000000, 200)
        })

        return data

    def _calculate_support_resistance(self, data: pd.DataFrame) -> SupportResistance:
        """Calculate support and resistance levels"""
        recent_data = data.tail(50)  # Last 50 periods

        highs = recent_data['high'].values
        lows = recent_data['low'].values
        closes = recent_data['close'].values

        # Pivot Point calculation
        high = highs[-1]
        low = lows[-1]
        close = closes[-1]
        pivot = (high + low + close) / 3

        r1 = (2 * pivot) - low
        r2 = pivot + (high - low)
        s1 = (2 * pivot) - high
        s2 = pivot - (high - low)

        # Find strong levels from recent swings
        strong_resistance = self._find_key_levels(highs, lookback=20, is_resistance=True)
        strong_support = self._find_key_levels(lows, lookback=20, is_resistance=False)

        # Minor levels (shorter lookback)
        minor_resistance = self._find_key_levels(highs, lookback=10, is_resistance=True)
        minor_support = self._find_key_levels(lows, lookback=10, is_resistance=False)

        return SupportResistance(
            strong_resistance=strong_resistance[:3],  # Top 3 levels
            minor_resistance=minor_resistance[:2],
            pivot_point=pivot,
            minor_support=minor_support[:2],
            strong_support=strong_support[:3]
        )

    def _find_key_levels(self, prices: np.ndarray, lookback: int, is_resistance: bool) -> List[float]:
        """Find key support/resistance levels"""
        levels = []
        threshold = 0.005  # 0.5% threshold for level clustering

        for i in range(len(prices) - lookback, len(prices)):
            level = prices[i]
            # Check if this level is tested multiple times
            touches = sum(1 for p in prices[max(0, i-lookback):i+1]
                         if abs(p - level) / level <= threshold)

            if touches >= 2:  # Level touched at least twice
                # Check if not too close to existing levels
                if not any(abs(existing - level) / level <= threshold for existing in levels):
                    levels.append(level)

        return sorted(levels, reverse=is_resistance)

    def _analyze_trend(self, data: pd.DataFrame, timeframe: TimeFrame) -> TrendAnalysis:
        """Analyze trend across multiple timeframes"""
        # Primary trend (long-term)
        sma_200 = data['close'].rolling(200).mean().iloc[-1] if len(data) >= 200 else None
        sma_50 = data['close'].rolling(50).mean().iloc[-1] if len(data) >= 50 else None

        current_price = data['close'].iloc[-1]

        if sma_200 and current_price > sma_200:
            primary_trend = TrendDirection.BULLISH
        elif sma_200 and current_price < sma_200:
            primary_trend = TrendDirection.BEARISH
        else:
            primary_trend = TrendDirection.SIDEWAYS

        # Short-term trend (20-50 periods)
        sma_20 = data['close'].rolling(20).mean().iloc[-1] if len(data) >= 20 else current_price
        short_term_strength = min(10, max(1, int(abs(current_price - sma_20) / sma_20 * 100 * 2)))
        short_term_dir = TrendDirection.BULLISH if current_price > sma_20 else TrendDirection.BEARISH

        # Medium-term trend (50-100 periods)
        sma_50_full = data['close'].rolling(50).mean().iloc[-1] if len(data) >= 50 else current_price
        medium_term_strength = min(10, max(1, int(abs(current_price - sma_50_full) / sma_50_full * 100 * 1.5)))
        medium_term_dir = TrendDirection.BULLISH if current_price > sma_50_full else TrendDirection.BEARISH

        # Long-term trend (100+ periods)
        sma_100 = data['close'].rolling(100).mean().iloc[-1] if len(data) >= 100 else current_price
        long_term_strength = min(10, max(1, int(abs(current_price - sma_100) / sma_100 * 100)))
        long_term_dir = TrendDirection.BULLISH if current_price > sma_100 else TrendDirection.BEARISH

        return TrendAnalysis(
            primary_trend=primary_trend,
            short_term=(short_term_dir, short_term_strength),
            medium_term=(medium_term_dir, medium_term_strength),
            long_term=(long_term_dir, long_term_strength)
        )

    def _generate_trading_bias(self, indicators: TechnicalIndicators,
                             patterns: List[ChartPattern],
                             trend: TrendAnalysis) -> Dict[str, any]:
        """Generate trading bias based on all analysis"""
        bullish_signals = 0
        bearish_signals = 0
        total_signals = 0

        # RSI signals
        if indicators.rsi:
            total_signals += 1
            if indicators.rsi < 30:
                bullish_signals += 1
            elif indicators.rsi > 70:
                bearish_signals += 1

        # MACD signals
        if indicators.macd_histogram:
            total_signals += 1
            if indicators.macd_histogram > 0:
                bullish_signals += 1
            else:
                bearish_signals += 1

        # Bollinger Band position
        if indicators.bb_position:
            total_signals += 1
            if indicators.bb_position < 0.2:
                bullish_signals += 1  # Near lower band
            elif indicators.bb_position > 0.8:
                bearish_signals += 1  # Near upper band

        # Moving average alignment
        if indicators.sma_20 and indicators.sma_50:
            total_signals += 1
            if indicators.sma_20 > indicators.sma_50:
                bullish_signals += 1
            else:
                bearish_signals += 1

        # Pattern signals
        for pattern in patterns:
            if pattern.confidence > 0.6:
                total_signals += 1
                if pattern.direction == TrendDirection.BULLISH:
                    bullish_signals += 1
                elif pattern.direction == TrendDirection.BEARISH:
                    bearish_signals += 1

        # Determine bias
        if bullish_signals > bearish_signals + 1:
            direction = "BUY"
            strength = min(5, bullish_signals)
        elif bearish_signals > bullish_signals + 1:
            direction = "SELL"
            strength = min(5, bearish_signals)
        else:
            direction = "HOLD"
            strength = 0

        # Entry zone calculation (simplified)
        current_price = 1000  # This would come from data
        entry_zone = {
            'low': current_price * 0.98,
            'high': current_price * 1.02
        }

        # Target and stop (simplified)
        if direction == "BUY":
            target = current_price * 1.05
            stop = current_price * 0.97
        elif direction == "SELL":
            target = current_price * 0.95
            stop = current_price * 1.03
        else:
            target = None
            stop = None

        return {
            'direction': direction,
            'strength': strength,
            'entry_zone': entry_zone,
            'target': target,
            'stop_loss': stop,
            'timeframe': 'DAILY',
            'conviction': min(100, (abs(bullish_signals - bearish_signals) / max(total_signals, 1)) * 100)
        }

    def _calculate_risk_management(self, data: pd.DataFrame, current_price: float,
                                 indicators: TechnicalIndicators) -> Dict[str, any]:
        """Calculate risk management parameters"""
        # Position size (1% risk per trade)
        capital = 100000  # Assume ₹1 lakh capital
        risk_per_trade = 0.01  # 1%
        capital_at_risk = capital * risk_per_trade

        # Stop loss distance (based on ATR or support levels)
        atr = indicators.atr if indicators.atr else current_price * 0.02  # 2% default
        stop_distance = max(atr * 1.5, current_price * 0.02)  # At least 2%

        # Position size calculation
        position_size = capital_at_risk / stop_distance
        position_value = position_size * current_price

        # Risk-reward ratio
        target_distance = stop_distance * 2  # 1:2 RR
        reward_amount = position_size * target_distance

        return {
            'position_size_shares': int(position_size),
            'position_value': position_value,
            'risk_per_trade': capital_at_risk,
            'stop_loss_distance': stop_distance,
            'risk_reward_ratio': 2.0,
            'max_portfolio_risk': capital * 0.05,  # 5% max drawdown
            'recommended_leverage': 1.0  # No leverage for NSE
        }

    def _get_market_context(self, symbol: str, data: pd.DataFrame) -> Dict[str, any]:
        """Get market context information"""
        # Volume analysis
        avg_volume = data['volume'].tail(20).mean()
        current_volume = data['volume'].iloc[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1

        # Volatility (ATR based)
        recent_high = data['high'].tail(20).max()
        recent_low = data['low'].tail(20).min()
        volatility = (recent_high - recent_low) / recent_low * 100

        # Sector context (simplified)
        if 'NIFTY' in symbol:
            sector = 'Index'
            relative_strength = 100  # Neutral
        elif any(x in symbol for x in ['HDFC', 'ICICI', 'SBI']):
            sector = 'Banking'
            relative_strength = 95  # Slightly underperforming
        elif any(x in symbol for x in ['TCS', 'INFY', 'WIPRO']):
            sector = 'IT'
            relative_strength = 105  # Outperforming
        else:
            sector = 'General'
            relative_strength = 100

        return {
            'sector': sector,
            'relative_strength_vs_nifty': relative_strength,
            'volume_analysis': 'Above Average' if volume_ratio > 1.2 else 'Below Average',
            'volatility_percent': volatility,
            'liquidity_status': 'High' if avg_volume > 1000000 else 'Medium' if avg_volume > 100000 else 'Low',
            'market_phase': 'Bullish' if volatility < 15 else 'Bearish' if volatility > 25 else 'Sideways'
        }

class IndicatorCalculator:
    """Technical indicator calculations"""

    def calculate_all_indicators(self, data: pd.DataFrame) -> TechnicalIndicators:
        """Calculate all technical indicators"""
        indicators = TechnicalIndicators()

        # RSI
        indicators.rsi = self.calculate_rsi(data['close'], 14)

        # MACD
        macd_data = self.calculate_macd(data['close'])
        indicators.macd_line = macd_data['macd'].iloc[-1] if not macd_data.empty else None
        indicators.macd_signal = macd_data['signal'].iloc[-1] if not macd_data.empty else None
        indicators.macd_histogram = macd_data['histogram'].iloc[-1] if not macd_data.empty else None

        # Moving Averages
        indicators.sma_20 = data['close'].rolling(20).mean().iloc[-1]
        indicators.sma_50 = data['close'].rolling(50).mean().iloc[-1]
        indicators.ema_12 = data['close'].ewm(span=12).mean().iloc[-1]
        indicators.ema_26 = data['close'].ewm(span=26).mean().iloc[-1]

        # Bollinger Bands
        bb_data = self.calculate_bollinger_bands(data['close'])
        if not bb_data.empty:
            indicators.bb_upper = bb_data['upper'].iloc[-1]
            indicators.bb_middle = bb_data['middle'].iloc[-1]
            indicators.bb_lower = bb_data['lower'].iloc[-1]
            indicators.bb_position = (data['close'].iloc[-1] - indicators.bb_lower) / (indicators.bb_upper - indicators.bb_lower)

        # ATR
        indicators.atr = self.calculate_atr(data, 14)

        # Stochastic
        stoch_data = self.calculate_stochastic(data)
        if not stoch_data.empty:
            indicators.stochastic_k = stoch_data['k'].iloc[-1]
            indicators.stochastic_d = stoch_data['d'].iloc[-1]

        # VWAP
        indicators.vwap = self.calculate_vwap(data)

        # Volume SMA
        indicators.volume_sma = data['volume'].rolling(20).mean().iloc[-1]

        return indicators

    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> float:
        """Calculate RSI"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1] if not rsi.empty else None

    def calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
        """Calculate MACD"""
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal).mean()
        histogram = macd - signal_line

        return pd.DataFrame({
            'macd': macd,
            'signal': signal_line,
            'histogram': histogram
        })

    def calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: float = 2) -> pd.DataFrame:
        """Calculate Bollinger Bands"""
        sma = prices.rolling(period).mean()
        std = prices.rolling(period).std()
        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)

        return pd.DataFrame({
            'upper': upper,
            'middle': sma,
            'lower': lower
        })

    def calculate_atr(self, data: pd.DataFrame, period: int = 14) -> float:
        """Calculate Average True Range"""
        high = data['high']
        low = data['low']
        close = data['close'].shift(1)

        tr = pd.concat([
            high - low,
            (high - close).abs(),
            (low - close).abs()
        ], axis=1).max(axis=1)

        atr = tr.rolling(period).mean()
        return atr.iloc[-1] if not atr.empty else None

    def calculate_stochastic(self, data: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> pd.DataFrame:
        """Calculate Stochastic Oscillator"""
        high = data['high'].rolling(k_period).max()
        low = data['low'].rolling(k_period).min()
        close = data['close']

        k = 100 * ((close - low) / (high - low))
        d = k.rolling(d_period).mean()

        return pd.DataFrame({'k': k, 'd': d})

    def calculate_vwap(self, data: pd.DataFrame) -> float:
        """Calculate Volume Weighted Average Price"""
        typical_price = (data['high'] + data['low'] + data['close']) / 3
        vwap = (typical_price * data['volume']).cumsum() / data['volume'].cumsum()
        return vwap.iloc[-1] if not vwap.empty else None

class PatternScanner:
    """Chart pattern recognition"""

    def scan_patterns(self, data: pd.DataFrame) -> List[ChartPattern]:
        """Scan for chart patterns in the data"""
        patterns = []

        # Check for basic patterns (simplified implementations)
        if len(data) >= 20:
            # Double top/bottom check
            double_pattern = self._check_double_pattern(data)
            if double_pattern:
                patterns.append(double_pattern)

            # Head and shoulders check
            hns_pattern = self._check_head_shoulders(data)
            if hns_pattern:
                patterns.append(hns_pattern)

            # Triangle pattern check
            triangle_pattern = self._check_triangle(data)
            if triangle_pattern:
                patterns.append(triangle_pattern)

            # Flag pattern check
            flag_pattern = self._check_flag(data)
            if flag_pattern:
                patterns.append(flag_pattern)

        return patterns

    def _check_double_pattern(self, data: pd.DataFrame) -> Optional[ChartPattern]:
        """Check for double top/bottom patterns"""
        recent_highs = data['high'].tail(20)
        recent_lows = data['low'].tail(20)

        # Simple double top detection
        peaks = []
        for i in range(1, len(recent_highs)-1):
            if (recent_highs.iloc[i] > recent_highs.iloc[i-1] and
                recent_highs.iloc[i] > recent_highs.iloc[i+1]):
                peaks.append((i, recent_highs.iloc[i]))

        if len(peaks) >= 2:
            # Check if peaks are at similar levels
            peak_prices = [p[1] for p in peaks[-2:]]
            avg_peak = sum(peak_prices) / len(peak_prices)
            if max(peak_prices) / min(peak_prices) < 1.02:  # Within 2%
                return ChartPattern(
                    pattern_name="Double Top",
                    direction=TrendDirection.BEARISH,
                    confidence=0.7,
                    target_price=avg_peak - (avg_peak - data['low'].tail(20).min()) * 0.618,
                    stop_loss=avg_peak * 1.02,
                    description="Two peaks at similar level, potential reversal"
                )

        return None

    def _check_head_shoulders(self, data: pd.DataFrame) -> Optional[ChartPattern]:
        """Check for head and shoulders pattern"""
        # Simplified H&S detection - would need more sophisticated logic
        highs = data['high'].tail(30).values

        if len(highs) < 7:
            return None

        # Look for pattern: shoulder - head - shoulder
        # This is a very basic implementation
        peaks = self._find_peaks(highs)

        if len(peaks) >= 3:
            # Check if middle peak is highest
            if peaks[1][1] > peaks[0][1] and peaks[1][1] > peaks[2][1]:
                return ChartPattern(
                    pattern_name="Head and Shoulders",
                    direction=TrendDirection.BEARISH,
                    confidence=0.8,
                    target_price=data['close'].iloc[-1] - (peaks[1][1] - data['low'].tail(30).min()),
                    stop_loss=peaks[1][1] * 1.01,
                    description="Classic reversal pattern with left shoulder, head, and right shoulder"
                )

        return None

    def _check_triangle(self, data: pd.DataFrame) -> Optional[ChartPattern]:
        """Check for triangle patterns"""
        highs = data['high'].tail(20)
        lows = data['low'].tail(20)

        # Check for converging trendlines (simplified)
        high_slope = (highs.iloc[-1] - highs.iloc[0]) / len(highs)
        low_slope = (lows.iloc[-1] - lows.iloc[0]) / len(lows)

        # Triangle if slopes are converging
        if abs(high_slope) < 0.001 and abs(low_slope) < 0.001:
            # Determine direction by breakout
            current_price = data['close'].iloc[-1]
            triangle_high = highs.max()
            triangle_low = lows.min()

            if current_price > (triangle_high + triangle_low) / 2:
                return ChartPattern(
                    pattern_name="Ascending Triangle",
                    direction=TrendDirection.BULLISH,
                    confidence=0.6,
                    target_price=triangle_high + (triangle_high - triangle_low),
                    stop_loss=triangle_low * 0.98,
                    description="Horizontal resistance with rising support"
                )

        return None

    def _check_flag(self, data: pd.DataFrame) -> Optional[ChartPattern]:
        """Check for flag patterns"""
        # Simplified flag detection
        recent_data = data.tail(15)
        prices = recent_data['close']

        # Check for consolidation after strong move
        if len(prices) >= 10:
            first_half = prices.iloc[:7]
            second_half = prices.iloc[7:]

            # Strong initial move
            initial_move = (first_half.iloc[-1] - first_half.iloc[0]) / first_half.iloc[0]

            if abs(initial_move) > 0.03:  # 3% move
                # Consolidation in second half
                consolidation_range = (second_half.max() - second_half.min()) / second_half.min()

                if consolidation_range < 0.05:  # Less than 5% range
                    direction = TrendDirection.BULLISH if initial_move > 0 else TrendDirection.BEARISH
                    return ChartPattern(
                        pattern_name="Bull Flag" if direction == TrendDirection.BULLISH else "Bear Flag",
                        direction=direction,
                        confidence=0.65,
                        target_price=prices.iloc[-1] * (1 + abs(initial_move)),
                        stop_loss=second_half.min() * 0.97 if direction == TrendDirection.BULLISH else second_half.max() * 1.03,
                        description="Consolidation after strong directional move"
                    )

        return None

    def _find_peaks(self, data: np.ndarray, threshold: float = 0.01) -> List[Tuple[int, float]]:
        """Find peaks in data"""
        peaks = []
        for i in range(1, len(data)-1):
            if data[i] > data[i-1] and data[i] > data[i+1]:
                # Check if significant enough
                if data[i] > data[i-1] * (1 + threshold):
                    peaks.append((i, data[i]))
        return peaks

if __name__ == "__main__":
    # Example usage
    analyzer = NSETechnicalAnalyzer()

    # Analyze a symbol
    try:
        analysis = analyzer.analyze_symbol("RELIANCE", TimeFrame.DAILY)

        print(f"📊 Technical Analysis: {analysis.symbol}")
        print(f"Current Price: ₹{analysis.current_price:.2f} ({analysis.price_change_pct:.2f}%)")
        print(f"Primary Trend: {analysis.trend_analysis.primary_trend.value}")
        print(f"RSI: {analysis.indicators.rsi:.1f}" if analysis.indicators.rsi else "RSI: N/A")
        print(f"Trading Bias: {analysis.trading_bias['direction']} (Strength: {analysis.trading_bias['strength']})")

        if analysis.patterns:
            print("Chart Patterns:")
            for pattern in analysis.patterns:
                print(f"- {pattern.pattern_name}: {pattern.direction.value} ({pattern.confidence:.1f})")

    except Exception as e:
        print(f"Analysis failed: {e}")
