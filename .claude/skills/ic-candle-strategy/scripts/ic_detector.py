#!/usr/bin/env python3
"""
IC Candle Detector for NSE Markets
Core detection engine for Impulse Candle Retracement setups
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils


class ICQuality(Enum):
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B = "B"
    C = "C"


@dataclass
class ImpulseCandle:
    """Represents an impulse candle"""
    timestamp: datetime
    direction: str  # 'bullish' or 'bearish'
    high: float
    low: float
    close: float
    volume: float
    volume_ratio: float
    range_ratio: float
    breakout_level: float


@dataclass
class RetracementLevel:
    """Retracement level analysis"""
    level: float
    fib_ratio: float
    confluence_type: str  # 'fibonacci', 'support', 'resistance', 'volume'
    strength: int  # 1-5 scale


@dataclass
class ICSetup:
    """Complete IC setup analysis"""
    symbol: str
    impulse_candle: ImpulseCandle
    retracement_levels: List[RetracementLevel]
    entry_zone: Tuple[float, float]
    stop_loss: float
    targets: List[float]
    score: int
    grade: ICQuality
    confidence: float
    risk_reward_ratio: float
    expected_hold_time: int
    detection_time: datetime


class ICDetector:
    """
    Impulse Candle detector for NSE markets
    Identifies impulse candles and calculates retracement levels
    """

    def __init__(self):
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()

        # Default parameters
        self.min_volume_ratio = 2.0
        self.min_range_ratio = 2.0
        self.close_threshold = 0.7
        self.fib_levels = [0.236, 0.382, 0.5, 0.618, 0.786]
        self.min_retrace_pct = 0.2
        self.max_retrace_pct = 0.8

    def detect_impulse_candle(self, df: pd.DataFrame, lookback: int = 20) -> Optional[ImpulseCandle]:
        """
        Detect the most recent impulse candle in the data

        Args:
            df: OHLCV DataFrame
            lookback: Periods to look back for context

        Returns:
            ImpulseCandle if found, None otherwise
        """
        if len(df) < lookback + 1:
            return None

        # Calculate context metrics
        recent_data = df.tail(lookback + 1)
        avg_volume = recent_data['volume'].mean()
        avg_atr = self._calculate_atr(recent_data)

        # Check the latest candle
        latest = df.iloc[-1]

        # Volume check
        volume_ratio = latest['volume'] / avg_volume
        if volume_ratio < self.min_volume_ratio:  # type: ignore
            return None

        # Range check
        true_range = self._calculate_true_range(latest, df.iloc[-2]['close'] if len(df) > 1 else latest['open'])  # type: ignore
        range_ratio = true_range / avg_atr
        if range_ratio < self.min_range_ratio:  # type: ignore
            return None

        # Determine direction and close location
        if latest['close'] > latest['open']:  # type: ignore
            # Bullish candle
            direction = 'bullish'
            close_location = (latest['close'] - latest['low']) / (latest['high'] - latest['low'])  # type: ignore
            breakout_level = latest['high']  # type: ignore
        else:
            # Bearish candle
            direction = 'bearish'
            close_location = (latest['high'] - latest['close']) / (latest['high'] - latest['low'])  # type: ignore
            breakout_level = latest['low']  # type: ignore

        # Close location check
        if close_location < self.close_threshold:  # type: ignore
            return None

        # Find recent swing level
        swing_level = self._find_recent_swing(df, direction, lookback)
        if direction == 'bullish' and latest['high'] <= swing_level:  # type: ignore
            return None
        elif direction == 'bearish' and latest['low'] >= swing_level:  # type: ignore
            return None

        return ImpulseCandle(
            timestamp=df.index[-1].to_pydatetime(),  # type: ignore
            direction=direction,
            high=latest['high'],  # type: ignore
            low=latest['low'],  # type: ignore
            close=latest['close'],  # type: ignore
            volume=latest['volume'],  # type: ignore
            volume_ratio=volume_ratio,  # type: ignore
            range_ratio=range_ratio,  # type: ignore
            breakout_level=breakout_level  # type: ignore
        )

    def calculate_retracement_levels(self, impulse: ImpulseCandle, df: pd.DataFrame) -> List[RetracementLevel]:
        """
        Calculate key retracement levels after impulse candle

        Args:
            impulse: The impulse candle
            df: OHLCV DataFrame

        Returns:
            List of retracement levels
        """
        levels = []

        if impulse.direction == 'bullish':
            impulse_move = impulse.high - impulse.low

            for fib_ratio in self.fib_levels:
                level = impulse.high - (impulse_move * fib_ratio)
                levels.append(RetracementLevel(
                    level=level,
                    fib_ratio=fib_ratio,
                    confluence_type='fibonacci',
                    strength=self._calculate_level_strength(level, df, 'bullish')
                ))
        else:
            impulse_move = impulse.high - impulse.low

            for fib_ratio in self.fib_levels:
                level = impulse.low + (impulse_move * fib_ratio)
                levels.append(RetracementLevel(
                    level=level,
                    fib_ratio=fib_ratio,
                    confluence_type='fibonacci',
                    strength=self._calculate_level_strength(level, df, 'bearish')
                ))

        # Sort by strength and ratio preference
        levels.sort(key=lambda x: (x.strength, -abs(x.fib_ratio - 0.5)), reverse=True)

        return levels

    def detect_ic_setup(self, symbol: str, df: pd.DataFrame) -> Optional[ICSetup]:
        """
        Detect complete IC setup including retracement

        Args:
            symbol: Stock symbol
            df: OHLCV DataFrame

        Returns:
            ICSetup if valid setup found, None otherwise
        """
        # Find impulse candle
        impulse = self.detect_impulse_candle(df)
        if not impulse:
            return None

        # Calculate retracement levels
        retracement_levels = self.calculate_retracement_levels(impulse, df)

        # Check if price is in retracement zone
        current_price = df.iloc[-1]['close']  # type: ignore
        entry_zone = self._calculate_entry_zone(retracement_levels)

        if not self._is_price_in_retracement(current_price, impulse, entry_zone):
            return None

        # Calculate stop loss and targets
        stop_loss = self._calculate_stop_loss(impulse)
        targets = self._calculate_targets(impulse, retracement_levels)

        # Score the setup
        score, grade = self._score_ic_setup(impulse, retracement_levels, df)

        # Calculate additional metrics
        risk_reward_ratio = self._calculate_risk_reward(current_price, stop_loss, targets[0])  # type: ignore
        expected_hold_time = self._estimate_hold_time(impulse, df)

        return ICSetup(
            symbol=symbol,
            impulse_candle=impulse,
            retracement_levels=retracement_levels,
            entry_zone=entry_zone,
            stop_loss=stop_loss,
            targets=targets,
            score=score,
            grade=grade,
            confidence=score / 100.0,
            risk_reward_ratio=risk_reward_ratio,
            expected_hold_time=expected_hold_time,
            detection_time=datetime.now()
        )

    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """Calculate Average True Range"""
        high = df['high']
        low = df['low']
        close = df['close'].shift(1)

        tr1 = high - low
        tr2 = abs(high - close)
        tr3 = abs(low - close)

        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(period).mean()

        return atr.iloc[-1] if not atr.empty else 0

    def _calculate_true_range(self, candle: pd.Series, prev_close: float) -> float:
        """Calculate True Range for a candle"""
        high = candle['high']
        low = candle['low']

        tr1 = high - low
        tr2 = abs(high - prev_close)
        tr3 = abs(low - prev_close)

        return max(tr1, tr2, tr3)  # type: ignore

    def _find_recent_swing(self, df: pd.DataFrame, direction: str, lookback: int) -> float:
        """Find recent swing high/low"""
        recent_data = df.tail(lookback)

        if direction == 'bullish':
            return recent_data['high'].max()
        else:
            return recent_data['low'].min()

    def _calculate_level_strength(self, level: float, df: pd.DataFrame, direction: str) -> int:
        """
        Calculate strength of a retracement level
        Considers proximity to S/R levels, volume profile, etc.
        """
        strength = 1  # Base strength

        # Check proximity to recent highs/lows
        recent_high = df['high'].tail(20).max()
        recent_low = df['low'].tail(20).min()

        if direction == 'bullish':
            if abs(level - recent_low) / recent_low < 0.02:
                strength += 2  # Near recent low
        else:
            if abs(level - recent_high) / recent_high < 0.02:
                strength += 2  # Near recent high

        # Check if level has been tested recently
        price_range = df['high'].tail(50).max() - df['low'].tail(50).min()
        tolerance = price_range * 0.005  # 0.5% tolerance

        touches = 0
        for i in range(len(df) - 50, len(df)):
            if abs(df.iloc[i]['high'] - level) < tolerance or abs(df.iloc[i]['low'] - level) < tolerance:
                touches += 1

        if touches >= 3:
            strength += 2  # Multiple touches

        return min(strength, 5)

    def _calculate_entry_zone(self, levels: List[RetracementLevel]) -> Tuple[float, float]:
        """Calculate optimal entry zone"""
        if not levels:
            return (0, 0)

        # Use the strongest level as center
        center_level = levels[0].level

        # Zone is ±2% around the level
        zone_size = center_level * 0.02
        return (center_level - zone_size, center_level + zone_size)

    def _is_price_in_retracement(self, current_price: float, impulse: ImpulseCandle,
                                entry_zone: Tuple[float, float]) -> bool:
        """Check if current price is in valid retracement zone"""
        zone_low, zone_high = entry_zone

        if impulse.direction == 'bullish':
            # For bullish setup, we want price below impulse high but above stop
            return zone_low <= current_price <= zone_high and current_price < impulse.breakout_level
        else:
            # For bearish setup, we want price above impulse low but below stop
            return zone_low <= current_price <= zone_high and current_price > impulse.breakout_level

    def _calculate_stop_loss(self, impulse: ImpulseCandle) -> float:
        """Calculate stop loss level"""
        if impulse.direction == 'bullish':
            return impulse.low * 0.98  # 2% below impulse low
        else:
            return impulse.high * 1.02  # 2% above impulse high

    def _calculate_targets(self, impulse: ImpulseCandle, levels: List[RetracementLevel]) -> List[float]:
        """Calculate profit targets"""
        targets = []

        if impulse.direction == 'bullish':
            impulse_move = impulse.high - impulse.low
            targets.append(impulse.high + impulse_move * 0.618)  # 61.8% of impulse move
            targets.append(impulse.high + impulse_move)  # Full impulse move
        else:
            impulse_move = impulse.high - impulse.low
            targets.append(impulse.low - impulse_move * 0.618)  # 61.8% of impulse move
            targets.append(impulse.low - impulse_move)  # Full impulse move

        return targets

    def _score_ic_setup(self, impulse: ImpulseCandle, levels: List[RetracementLevel],
                       df: pd.DataFrame) -> Tuple[int, ICQuality]:
        """Score the IC setup quality"""
        score = 0

        # Impulse quality (0-25)
        score += min(int(impulse.volume_ratio * 5), 10)  # Volume strength
        score += min(int(impulse.range_ratio * 5), 10)  # Range strength
        if impulse.direction == 'bullish':
            close_loc = (impulse.close - impulse.low) / (impulse.high - impulse.low)
        else:
            close_loc = (impulse.high - impulse.close) / (impulse.high - impulse.low)
        score += int(close_loc * 5)  # Close location

        # Retracement quality (0-25)
        if levels:
            strongest_level = levels[0]
            score += strongest_level.strength * 5  # Level strength
            # Optimal fib ratios get higher scores
            optimal_distance = abs(strongest_level.fib_ratio - 0.5)
            score += int((1 - optimal_distance) * 10)

        # Market context (0-15)
        # Simplified - would include trend, volatility, breadth
        score += 10  # Placeholder

        # Risk factors (subtracted)
        risk_penalty = 0
        # Add risk penalties based on stop distance, R:R ratio, etc.
        score -= risk_penalty

        final_score = max(0, min(100, score))

        # Determine grade
        if final_score >= 90:
            grade = ICQuality.A_PLUS
        elif final_score >= 80:
            grade = ICQuality.A
        elif final_score >= 70:
            grade = ICQuality.A_MINUS
        elif final_score >= 60:
            grade = ICQuality.B_PLUS
        elif final_score >= 50:
            grade = ICQuality.B
        else:
            grade = ICQuality.C

        return final_score, grade

    def _calculate_risk_reward(self, entry: float, stop: float, target: float) -> float:
        """Calculate risk-reward ratio"""
        risk = abs(entry - stop)
        reward = abs(target - entry)
        return reward / risk if risk > 0 else 0

    def _estimate_hold_time(self, impulse: ImpulseCandle, df: pd.DataFrame) -> int:
        """Estimate expected holding time for the setup"""
        # Simplified - based on historical patterns
        # Would be calibrated with backtest data
        if impulse.direction == 'bullish':
            return 5  # Average 5 days for bullish setups
        else:
            return 4  # Average 4 days for bearish setups


def detect_ic_setup(symbol: str, df: pd.DataFrame) -> Optional[ICSetup]:
    """
    Main IC setup detection function

    Args:
        symbol: Stock symbol
        df: OHLCV DataFrame

    Returns:
        ICSetup if valid setup found, None otherwise
    """
    detector = ICDetector()
    return detector.detect_ic_setup(symbol, df)
