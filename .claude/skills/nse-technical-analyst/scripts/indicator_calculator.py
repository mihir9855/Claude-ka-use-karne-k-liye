#!/usr/bin/env python3
"""
Technical Indicator Calculator for NSE Markets
Comprehensive calculation of technical indicators with Indian market adaptations.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class IndicatorType(Enum):
    TREND = "trend"
    MOMENTUM = "momentum"
    VOLATILITY = "volatility"
    VOLUME = "volume"
    SUPPORT_RESISTANCE = "support_resistance"

@dataclass
class IndicatorResult:
    name: str
    type: IndicatorType
    value: Union[float, Dict[str, float]]
    signal: str  # "bullish", "bearish", "neutral"
    strength: int  # 1-5 scale
    description: str

@dataclass
class IndicatorSet:
    trend_indicators: List[IndicatorResult]
    momentum_indicators: List[IndicatorResult]
    volatility_indicators: List[IndicatorResult]
    volume_indicators: List[IndicatorResult]
    support_resistance: List[IndicatorResult]

class TechnicalIndicatorCalculator:
    """
    Advanced technical indicator calculator adapted for NSE markets
    """

    def __init__(self):
        self.nse_adjustments = {
            'rsi_period': 14,
            'macd_fast': 12,
            'macd_slow': 26,
            'macd_signal': 9,
            'bb_period': 20,
            'bb_std': 2.0,
            'atr_period': 14,
            'stoch_k': 14,
            'stoch_d': 3,
            'williams_r': 14,
            'cci_period': 20,
            'mfi_period': 14,
            'roc_period': 10,
            'ultimate_period': 7
        }

    def calculate_complete_indicator_set(self, data: pd.DataFrame) -> IndicatorSet:
        """
        Calculate all major technical indicators for NSE analysis

        Args:
            data: OHLCV DataFrame with columns [open, high, low, close, volume]

        Returns:
            Complete set of calculated indicators
        """
        logger.info("Calculating complete technical indicator set")

        # Trend Indicators
        trend_indicators = self._calculate_trend_indicators(data)

        # Momentum Indicators
        momentum_indicators = self._calculate_momentum_indicators(data)

        # Volatility Indicators
        volatility_indicators = self._calculate_volatility_indicators(data)

        # Volume Indicators
        volume_indicators = self._calculate_volume_indicators(data)

        # Support & Resistance
        support_resistance = self._calculate_support_resistance(data)

        return IndicatorSet(
            trend_indicators=trend_indicators,
            momentum_indicators=momentum_indicators,
            volatility_indicators=volatility_indicators,
            volume_indicators=volume_indicators,
            support_resistance=support_resistance
        )

    def _calculate_trend_indicators(self, data: pd.DataFrame) -> List[IndicatorResult]:
        """Calculate trend-following indicators"""
        indicators = []

        close = data['close']

        # Moving Averages
        sma_20 = close.rolling(20).mean()
        sma_50 = close.rolling(50).mean()
        sma_200 = close.rolling(200).mean()

        ema_12 = close.ewm(span=12).mean()
        ema_26 = close.ewm(span=26).mean()
        ema_50 = close.ewm(span=50).mean()

        # SMA Signals
        current_price = close.iloc[-1]

        # Short-term trend (SMA 20)
        if current_price > sma_20.iloc[-1]:
            sma20_signal = "bullish"
            sma20_strength = 3
        else:
            sma20_signal = "bearish"
            sma20_strength = 3

        indicators.append(IndicatorResult(
            name="SMA 20",
            type=IndicatorType.TREND,
            value=float(sma_20.iloc[-1]),
            signal=sma20_signal,
            strength=sma20_strength,
            description=f"20-period SMA at {sma_20.iloc[-1]:.2f}"
        ))

        # Medium-term trend (SMA 50)
        if current_price > sma_50.iloc[-1]:
            sma50_signal = "bullish"
            sma50_strength = 4
        else:
            sma50_signal = "bearish"
            sma50_strength = 4

        indicators.append(IndicatorResult(
            name="SMA 50",
            type=IndicatorType.TREND,
            value=float(sma_50.iloc[-1]),
            signal=sma50_signal,
            strength=sma50_strength,
            description=f"50-period SMA at {sma_50.iloc[-1]:.2f}"
        ))

        # Long-term trend (SMA 200)
        if sma_200.iloc[-1] and current_price > sma_200.iloc[-1]:
            sma200_signal = "bullish"
            sma200_strength = 5
        else:
            sma200_signal = "bearish"
            sma200_strength = 5

        indicators.append(IndicatorResult(
            name="SMA 200",
            type=IndicatorType.TREND,
            value=float(sma_200.iloc[-1]) if sma_200.iloc[-1] else 0,
            signal=sma200_signal,
            strength=sma200_strength,
            description=f"200-period SMA at {sma_200.iloc[-1]:.2f}"
        ))

        # MACD
        macd_line = ema_12 - ema_26
        macd_signal = macd_line.ewm(span=9).mean()
        macd_histogram = macd_line - macd_signal

        macd_current = macd_line.iloc[-1]
        signal_current = macd_signal.iloc[-1]
        hist_current = macd_histogram.iloc[-1]

        if macd_current > signal_current and hist_current > 0:
            macd_signal_type = "bullish"
            macd_strength = 4
        elif macd_current < signal_current and hist_current < 0:
            macd_signal_type = "bearish"
            macd_strength = 4
        else:
            macd_signal_type = "neutral"
            macd_strength = 2

        indicators.append(IndicatorResult(
            name="MACD",
            type=IndicatorType.TREND,
            value={
                'macd': float(macd_current),
                'signal': float(signal_current),
                'histogram': float(hist_current)
            },
            signal=macd_signal_type,
            strength=macd_strength,
            description=f"MACD: {macd_current:.3f}, Signal: {signal_current:.3f}, Hist: {hist_current:.3f}"
        ))

        # ADX (Average Directional Index)
        adx_result = self._calculate_adx(data)
        if adx_result:
            indicators.append(adx_result)

        return indicators

    def _calculate_momentum_indicators(self, data: pd.DataFrame) -> List[IndicatorResult]:
        """Calculate momentum oscillators"""
        indicators = []

        close = data['close']
        high = data['high']
        low = data['low']

        # RSI
        rsi = self._calculate_rsi(close, self.nse_adjustments['rsi_period'])
        rsi_value = rsi.iloc[-1] if not rsi.empty else 50

        if rsi_value > 70:
            rsi_signal = "bearish"
            rsi_strength = 4
        elif rsi_value < 30:
            rsi_signal = "bullish"
            rsi_strength = 4
        elif 45 <= rsi_value <= 55:
            rsi_signal = "neutral"
            rsi_strength = 2
        else:
            rsi_signal = "neutral"
            rsi_strength = 3

        indicators.append(IndicatorResult(
            name="RSI",
            type=IndicatorType.MOMENTUM,
            value=float(rsi_value),
            signal=rsi_signal,
            strength=rsi_strength,
            description=f"RSI({self.nse_adjustments['rsi_period']}) at {rsi_value:.1f}"
        ))

        # Stochastic Oscillator
        stoch = self._calculate_stochastic(data, self.nse_adjustments['stoch_k'], self.nse_adjustments['stoch_d'])
        if not stoch.empty:
            k_value = stoch['k'].iloc[-1]
            d_value = stoch['d'].iloc[-1]

            if k_value > 80 and d_value > 80:
                stoch_signal = "bearish"
                stoch_strength = 4
            elif k_value < 20 and d_value < 20:
                stoch_signal = "bullish"
                stoch_strength = 4
            elif k_value > d_value:
                stoch_signal = "bullish"
                stoch_strength = 3
            else:
                stoch_signal = "bearish"
                stoch_strength = 3

            indicators.append(IndicatorResult(
                name="Stochastic",
                type=IndicatorType.MOMENTUM,
                value={'k': float(k_value), 'd': float(d_value)},
                signal=stoch_signal,
                strength=stoch_strength,
                description=f"Stochastic K: {k_value:.1f}, D: {d_value:.1f}"
            ))

        # Williams %R
        williams_r = self._calculate_williams_r(data, self.nse_adjustments['williams_r'])
        if williams_r is not None:
            if williams_r > -20:
                williams_signal = "bearish"
                williams_strength = 4
            elif williams_r < -80:
                williams_signal = "bullish"
                williams_strength = 4
            else:
                williams_signal = "neutral"
                williams_strength = 3

            indicators.append(IndicatorResult(
                name="Williams %R",
                type=IndicatorType.MOMENTUM,
                value=float(williams_r),
                signal=williams_signal,
                strength=williams_strength,
                description=f"Williams %R: {williams_r:.1f}"
            ))

        # Commodity Channel Index (CCI)
        cci = self._calculate_cci(data, self.nse_adjustments['cci_period'])
        if cci is not None:
            if cci > 100:
                cci_signal = "bullish"
                cci_strength = 4
            elif cci < -100:
                cci_signal = "bearish"
                cci_strength = 4
            else:
                cci_signal = "neutral"
                cci_strength = 2

            indicators.append(IndicatorResult(
                name="CCI",
                type=IndicatorType.MOMENTUM,
                value=float(cci),
                signal=cci_signal,
                strength=cci_strength,
                description=f"CCI({self.nse_adjustments['cci_period']}): {cci:.1f}"
            ))

        return indicators

    def _calculate_volatility_indicators(self, data: pd.DataFrame) -> List[IndicatorResult]:
        """Calculate volatility-based indicators"""
        indicators = []

        close = data['close']
        high = data['high']
        low = data['low']

        # Bollinger Bands
        bb = self._calculate_bollinger_bands(close, self.nse_adjustments['bb_period'], self.nse_adjustments['bb_std'])
        if not bb.empty:
            upper = bb['upper'].iloc[-1]
            middle = bb['middle'].iloc[-1]
            lower = bb['lower'].iloc[-1]
            current_price = close.iloc[-1]

            # %B calculation
            bb_position = (current_price - lower) / (upper - lower) if (upper - lower) != 0 else 0.5

            if bb_position > 0.8:
                bb_signal = "bearish"
                bb_strength = 4
                bb_desc = "Near upper band - potential resistance"
            elif bb_position < 0.2:
                bb_signal = "bullish"
                bb_strength = 4
                bb_desc = "Near lower band - potential support"
            else:
                bb_signal = "neutral"
                bb_strength = 2
                bb_desc = "Within normal range"

            indicators.append(IndicatorResult(
                name="Bollinger Bands",
                type=IndicatorType.VOLATILITY,
                value={
                    'upper': float(upper),
                    'middle': float(middle),
                    'lower': float(lower),
                    'position': float(bb_position)
                },
                signal=bb_signal,
                strength=bb_strength,
                description=bb_desc
            ))

        # Average True Range (ATR)
        atr = self._calculate_atr(data, self.nse_adjustments['atr_period'])
        if atr is not None:
            # ATR as percentage of price
            atr_pct = (atr / close.iloc[-1]) * 100

            if atr_pct > 3:
                atr_signal = "volatile"
                atr_strength = 5
            elif atr_pct > 2:
                atr_signal = "moderate"
                atr_strength = 3
            else:
                atr_signal = "calm"
                atr_strength = 2

            indicators.append(IndicatorResult(
                name="ATR",
                type=IndicatorType.VOLATILITY,
                value=float(atr),
                signal=atr_signal,
                strength=atr_strength,
                description=f"ATR({self.nse_adjustments['atr_period']}): {atr:.2f} ({atr_pct:.1f}% volatility)"
            ))

        return indicators

    def _calculate_volume_indicators(self, data: pd.DataFrame) -> List[IndicatorResult]:
        """Calculate volume-based indicators"""
        indicators = []

        volume = data['volume']
        close = data['close']

        # Volume Moving Average
        vol_sma_20 = volume.rolling(20).mean()
        vol_ratio = volume.iloc[-1] / vol_sma_20.iloc[-1] if vol_sma_20.iloc[-1] > 0 else 1

        if vol_ratio > 1.5:
            vol_signal = "high"
            vol_strength = 4
            vol_desc = "Above average volume"
        elif vol_ratio < 0.7:
            vol_signal = "low"
            vol_strength = 2
            vol_desc = "Below average volume"
        else:
            vol_signal = "normal"
            vol_strength = 3
            vol_desc = "Normal volume"

        indicators.append(IndicatorResult(
            name="Volume SMA",
            type=IndicatorType.VOLUME,
            value=float(vol_sma_20.iloc[-1]),
            signal=vol_signal,
            strength=vol_strength,
            description=vol_desc
        ))

        # VWAP (Volume Weighted Average Price)
        vwap = self._calculate_vwap(data)
        if vwap is not None:
            current_price = close.iloc[-1]

            if current_price > vwap:
                vwap_signal = "bullish"
                vwap_strength = 3
            else:
                vwap_signal = "bearish"
                vwap_strength = 3

            indicators.append(IndicatorResult(
                name="VWAP",
                type=IndicatorType.VOLUME,
                value=float(vwap),
                signal=vwap_signal,
                strength=vwap_strength,
                description=f"VWAP: {vwap:.2f} (Price {'above' if current_price > vwap else 'below'})"
            ))

        # Money Flow Index (MFI)
        mfi = self._calculate_mfi(data, self.nse_adjustments['mfi_period'])
        if mfi is not None:
            if mfi > 80:
                mfi_signal = "bearish"
                mfi_strength = 4
            elif mfi < 20:
                mfi_signal = "bullish"
                mfi_strength = 4
            else:
                mfi_signal = "neutral"
                mfi_strength = 2

            indicators.append(IndicatorResult(
                name="MFI",
                type=IndicatorType.VOLUME,
                value=float(mfi),
                signal=mfi_signal,
                strength=mfi_strength,
                description=f"MFI({self.nse_adjustments['mfi_period']}): {mfi:.1f}"
            ))

        return indicators

    def _calculate_support_resistance(self, data: pd.DataFrame) -> List[IndicatorResult]:
        """Calculate support and resistance levels"""
        indicators = []

        high = data['high']
        low = data['low']
        close = data['close']

        # Pivot Points
        high_val = high.iloc[-1]
        low_val = low.iloc[-1]
        close_val = close.iloc[-1]

        pivot = (high_val + low_val + close_val) / 3
        r1 = (2 * pivot) - low_val
        s1 = (2 * pivot) - high_val
        r2 = pivot + (high_val - low_val)
        s2 = pivot - (high_val - low_val)

        indicators.append(IndicatorResult(
            name="Pivot Points",
            type=IndicatorType.SUPPORT_RESISTANCE,
            value={
                'pivot': float(pivot),
                'r1': float(r1),
                's1': float(s1),
                'r2': float(r2),
                's2': float(s2)
            },
            signal="neutral",
            strength=3,
            description=f"Pivot: {pivot:.2f}, R1: {r1:.2f}, S1: {s1:.2f}"
        ))

        # Key levels from recent data
        recent_highs = high.tail(20)
        recent_lows = low.tail(20)

        resistance_levels = self._find_key_levels(recent_highs, is_resistance=True)
        support_levels = self._find_key_levels(recent_lows, is_resistance=False)

        indicators.append(IndicatorResult(
            name="Key Resistance",
            type=IndicatorType.SUPPORT_RESISTANCE,
            value=resistance_levels[:3],
            signal="bearish",
            strength=4,
            description=f"Resistance levels: {resistance_levels[:3]}"
        ))

        indicators.append(IndicatorResult(
            name="Key Support",
            type=IndicatorType.SUPPORT_RESISTANCE,
            value=support_levels[:3],
            signal="bullish",
            strength=4,
            description=f"Support levels: {support_levels[:3]}"
        ))

        return indicators

    # Helper calculation methods
    def _calculate_rsi(self, prices: pd.Series, period: int) -> pd.Series:
        """Calculate RSI"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def _calculate_stochastic(self, data: pd.DataFrame, k_period: int, d_period: int) -> pd.DataFrame:
        """Calculate Stochastic Oscillator"""
        high = data['high'].rolling(k_period).max()
        low = data['low'].rolling(k_period).min()
        close = data['close']

        k = 100 * ((close - low) / (high - low))
        d = k.rolling(d_period).mean()

        return pd.DataFrame({'k': k, 'd': d})

    def _calculate_williams_r(self, data: pd.DataFrame, period: int) -> Optional[float]:
        """Calculate Williams %R"""
        if len(data) < period:
            return None

        high = data['high'].rolling(period).max()
        low = data['low'].rolling(period).min()
        close = data['close']

        williams_r = -100 * ((high - close) / (high - low))
        return williams_r.iloc[-1] if not williams_r.empty else None

    def _calculate_cci(self, data: pd.DataFrame, period: int) -> Optional[float]:
        """Calculate Commodity Channel Index"""
        if len(data) < period:
            return None

        typical_price = (data['high'] + data['low'] + data['close']) / 3
        sma = typical_price.rolling(period).mean()
        mad = (typical_price - sma).abs().rolling(period).mean()

        cci = (typical_price - sma) / (0.015 * mad)
        return cci.iloc[-1] if not cci.empty else None

    def _calculate_bollinger_bands(self, prices: pd.Series, period: int, std_dev: float) -> pd.DataFrame:
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

    def _calculate_atr(self, data: pd.DataFrame, period: int) -> Optional[float]:
        """Calculate Average True Range"""
        if len(data) < period:
            return None

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

    def _calculate_vwap(self, data: pd.DataFrame) -> Optional[float]:
        """Calculate Volume Weighted Average Price"""
        if 'volume' not in data.columns:
            return None

        typical_price = (data['high'] + data['low'] + data['close']) / 3
        vwap = (typical_price * data['volume']).cumsum() / data['volume'].cumsum()
        return vwap.iloc[-1] if not vwap.empty else None

    def _calculate_mfi(self, data: pd.DataFrame, period: int) -> Optional[float]:
        """Calculate Money Flow Index"""
        if len(data) < period:
            return None

        typical_price = (data['high'] + data['low'] + data['close']) / 3
        money_flow = typical_price * data['volume']

        # Positive and negative money flow
        positive_flow = money_flow.where(typical_price > typical_price.shift(1), 0)
        negative_flow = money_flow.where(typical_price < typical_price.shift(1), 0)

        positive_mf = positive_flow.rolling(period).sum()
        negative_mf = negative_flow.rolling(period).sum()

        mfi = 100 - (100 / (1 + (positive_mf / negative_mf)))
        return mfi.iloc[-1] if not mfi.empty else None

    def _calculate_adx(self, data: pd.DataFrame, period: int = 14) -> Optional[IndicatorResult]:
        """Calculate Average Directional Index"""
        if len(data) < period:
            return None

        high = data['high']
        low = data['low']
        close = data['close']

        # True Range
        tr = pd.concat([
            high - low,
            (high - close.shift(1)).abs(),
            (low - close.shift(1)).abs()
        ], axis=1).max(axis=1)

        # Directional Movement
        dm_plus = high - high.shift(1)
        dm_minus = low.shift(1) - low

        dm_plus = dm_plus.where((dm_plus > dm_minus) & (dm_plus > 0), 0)
        dm_minus = dm_minus.where((dm_minus > dm_plus) & (dm_minus > 0), 0)

        # Smoothed averages
        atr = tr.rolling(period).mean()
        di_plus = 100 * (dm_plus.rolling(period).mean() / atr)
        di_minus = 100 * (dm_minus.rolling(period).mean() / atr)

        dx = 100 * abs(di_plus - di_minus) / (di_plus + di_minus)
        adx = dx.rolling(period).mean()

        adx_value = adx.iloc[-1] if not adx.empty else 0
        di_plus_value = di_plus.iloc[-1] if not di_plus.empty else 0
        di_minus_value = di_minus.iloc[-1] if not di_minus.empty else 0

        if adx_value > 25:
            trend_strength = "strong"
            adx_signal = "trending"
            adx_desc_strength = 5
        elif adx_value > 20:
            trend_strength = "moderate"
            adx_signal = "trending"
            adx_desc_strength = 4
        else:
            trend_strength = "weak"
            adx_signal = "ranging"
            adx_desc_strength = 2

        return IndicatorResult(
            name="ADX",
            type=IndicatorType.TREND,
            value={
                'adx': float(adx_value),
                'di_plus': float(di_plus_value),
                'di_minus': float(di_minus_value)
            },
            signal=adx_signal,
            strength=adx_desc_strength,
            description=f"ADX({period}): {adx_value:.1f} - {trend_strength} trend"
        )

    def _find_key_levels(self, prices: pd.Series, is_resistance: bool = True, threshold: float = 0.005) -> List[float]:
        """Find key support/resistance levels"""
        levels = []
        price_array = prices.values

        for i in range(len(price_array)):
            level = price_array[i]
            touches = sum(1 for p in price_array[max(0, i-10):min(len(price_array), i+11)]
                         if abs(p - level) / level <= threshold)

            if touches >= 3:  # Touched at least 3 times
                if not any(abs(existing - level) / level <= threshold for existing in levels):
                    levels.append(level)

        return sorted(levels, reverse=is_resistance)

if __name__ == "__main__":
    # Example usage
    calculator = TechnicalIndicatorCalculator()

    # Create sample data
    dates = pd.date_range('2024-01-01', periods=100, freq='D')
    np.random.seed(42)

    base_price = 1000
    prices = [base_price]
    for i in range(99):
        change = np.random.normal(0, 0.02)
        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 100))

    sample_data = pd.DataFrame({
        'open': prices,
        'high': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
        'low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
        'close': prices[1:] + [prices[-1]],
        'volume': np.random.randint(100000, 1000000, 100)
    })

    # Calculate indicators
    indicator_set = calculator.calculate_complete_indicator_set(sample_data)

    print("📊 Technical Indicators Summary")
    print(f"Trend Indicators: {len(indicator_set.trend_indicators)}")
    print(f"Momentum Indicators: {len(indicator_set.momentum_indicators)}")
    print(f"Volatility Indicators: {len(indicator_set.volatility_indicators)}")
    print(f"Volume Indicators: {len(indicator_set.volume_indicators)}")

    # Show some key indicators
    for indicator in indicator_set.trend_indicators[:3]:
        print(f"{indicator.name}: {indicator.signal.upper()} (Strength: {indicator.strength})")

    for indicator in indicator_set.momentum_indicators[:2]:
        print(f"{indicator.name}: {indicator.value if isinstance(indicator.value, float) else 'Complex'} - {indicator.signal.upper()}")
