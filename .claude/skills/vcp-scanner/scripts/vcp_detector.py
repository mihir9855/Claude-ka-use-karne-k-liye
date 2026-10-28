#!/usr/bin/env python3
"""
VCP Detector for NSE Markets
Core detection engine for Volatility Contraction Patterns
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
import requests
from dataclasses import dataclass
from enum import Enum

class VCPQuality(Enum):
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B = "B"
    C = "C"

@dataclass
class Contraction:
    """Represents a single price contraction"""
    start_date: datetime
    end_date: datetime
    high: float
    low: float
    depth_pct: float
    duration_days: int
    avg_volume: float

@dataclass
class VCPResult:
    """Complete VCP analysis result"""
    symbol: str
    score: int
    grade: VCPQuality
    contractions: List[Contraction]
    pivot_level: float
    stop_loss: float
    trend_score: int
    volume_score: int
    fundamental_score: int
    tightness_score: int
    breakout_readiness: bool

class VCPDetector:
    """Volatility Contraction Pattern detector"""

    def __init__(self):
        self.min_contractions = 2
        self.max_contractions = 5
        self.min_base_weeks = 3
        self.max_base_weeks = 12

    def find_swing_points(self, df: pd.DataFrame, lookback: int = 5) -> Tuple[List[int], List[int]]:
        """
        Find swing highs and lows from OHLCV data

        Args:
            df: DataFrame with OHLCV data
            lookback: Periods to look back for swing identification

        Returns:
            Tuple of (swing_high_indices, swing_low_indices)
        """
        highs = df['high'].values
        lows = df['low'].values

        swing_highs = []
        swing_lows = []

        for i in range(lookback, len(highs) - lookback):
            # Check for swing high
            if highs[i] == max(highs[i-lookback:i+lookback+1]):
                swing_highs.append(i)

            # Check for swing low
            if lows[i] == min(lows[i-lookback:i+lookback+1]):
                swing_lows.append(i)

        return swing_highs, swing_lows

    def detect_contractions(self, swing_highs: List[int], swing_lows: List[int],
                          df: pd.DataFrame) -> List[Contraction]:
        """
        Group swing points into contraction sequences

        Args:
            swing_highs: Indices of swing highs
            swing_lows: Indices of swing lows
            df: OHLCV DataFrame

        Returns:
            List of detected contractions
        """
        contractions = []

        # Sort swing points chronologically
        all_points = []
        for idx in swing_highs:
            all_points.append(('high', idx, df.iloc[idx]['high']))
        for idx in swing_lows:
            all_points.append(('low', idx, df.iloc[idx]['low']))

        all_points.sort(key=lambda x: x[1])

        # Group into high-low pairs (contractions)
        i = 0
        while i < len(all_points) - 1:
            if all_points[i][0] == 'high' and all_points[i+1][0] == 'low':
                high_idx = all_points[i][1]
                low_idx = all_points[i+1][1]
                high_price = all_points[i][2]
                low_price = all_points[i+1][2]

                # Calculate contraction metrics
                depth_pct = ((high_price - low_price) / high_price) * 100
                start_dt = pd.to_datetime(df.index[high_idx])
                end_dt = pd.to_datetime(df.index[low_idx])
                duration_days = (end_dt - start_dt).days
                avg_volume = df.iloc[high_idx:low_idx+1]['volume'].mean()

                contraction = Contraction(
                    start_date=start_dt.to_pydatetime(),
                    end_date=end_dt.to_pydatetime(),
                    high=high_price,
                    low=low_price,
                    depth_pct=depth_pct,
                    duration_days=duration_days,
                    avg_volume=avg_volume
                )

                contractions.append(contraction)
                i += 2
            else:
                i += 1

        return contractions

    def validate_vcp(self, contractions: List[Contraction]) -> bool:
        """
        Validate if contractions form a valid VCP pattern

        Args:
            contractions: List of contractions to validate

        Returns:
            True if valid VCP pattern
        """
        if len(contractions) < self.min_contractions:
            return False

        # Check for progressively shallower pullbacks
        for i in range(1, len(contractions)):
            if contractions[i].depth_pct >= contractions[i-1].depth_pct:
                return False  # Not getting shallower

        # Check total base duration
        total_duration = (contractions[-1].end_date - contractions[0].start_date).days
        if not (self.min_base_weeks * 7 <= total_duration <= self.max_base_weeks * 7):
            return False

        return True

    def calculate_volume_profile(self, df: pd.DataFrame, contraction_periods: List[Tuple[datetime, datetime]]) -> Dict[str, float]:
        """
        Calculate volume profile for contractions

        Args:
            df: OHLCV DataFrame
            contraction_periods: List of (start, end) date tuples

        Returns:
            Volume profile metrics
        """
        volume_50d_avg = df['volume'].rolling(50).mean().iloc[-1]

        contraction_volumes = []
        for start_date, end_date in contraction_periods:
            period_data = df[(df.index >= start_date) & (df.index <= end_date)]
            if not period_data.empty:
                contraction_volumes.append(period_data['volume'].mean())

        if not contraction_volumes:
            return {'declining': False, 'final_dry_up': False, 'avg_volume_ratio': 1.0}

        # Check if volume is declining
        declining = contraction_volumes[-1] < contraction_volumes[0] if len(contraction_volumes) > 1 else False

        # Check final contraction dry-up
        final_volume_ratio = contraction_volumes[-1] / volume_50d_avg
        final_dry_up = final_volume_ratio < 0.5

        return {
            'declining': declining,
            'final_dry_up': final_dry_up,
            'avg_volume_ratio': np.mean(contraction_volumes) / volume_50d_avg
        }

    def check_trend_template(self, df: pd.DataFrame) -> int:
        """
        Check Minervini Trend Template criteria

        Args:
            df: OHLCV DataFrame

        Returns:
            Trend score (0-20)
        """
        score = 0
        current_price = df['close'].iloc[-1]

        # Price above 150 DMA
        ma_150 = df['close'].rolling(150).mean().iloc[-1]
        if current_price > ma_150:
            score += 4

        # Price above 200 DMA
        ma_200 = df['close'].rolling(200).mean().iloc[-1]
        if current_price > ma_200:
            score += 4

        # 200 DMA rising for 1+ month
        ma_200_slope = (ma_200 - df['close'].rolling(200).mean().iloc[-22]) / 22  # ~1 month
        if ma_200_slope > 0:
            score += 4

        # 52-week position
        year_high = df['high'].rolling(252).max().iloc[-1]
        year_low = df['low'].rolling(252).min().iloc[-1]

        if current_price >= year_high * 0.75:  # Within 25% of high
            score += 4

        if current_price >= year_low * 1.3:  # 30% above low
            score += 2

        # Relative strength (simplified - would need market data)
        # For now, assume 2 points if trend criteria met
        if score >= 14:
            score += 2

        return min(score, 20)

    def check_fundamentals(self, symbol: str) -> int:
        """
        Check fundamental growth criteria

        Args:
            symbol: Stock symbol

        Returns:
            Fundamental score (0-20)
        """
        score = 0

        try:
            # Placeholder for fundamental data fetch
            # In real implementation, fetch from screener.in or moneycontrol
            eps_growth_quarters = 2  # Mock data
            revenue_growth_yoy = 15.0  # Mock data
            margin_trend = "stable"  # Mock data

            # EPS growth
            if eps_growth_quarters >= 3:
                score += 6
            elif eps_growth_quarters >= 2:
                score += 4
            elif eps_growth_quarters >= 1:
                score += 2

            # Revenue growth
            if revenue_growth_yoy > 15:
                score += 4
            elif revenue_growth_yoy > 5:
                score += 3
            elif revenue_growth_yoy > 0:
                score += 1

            # Margin trend
            if margin_trend == "expanding":
                score += 4
            elif margin_trend == "stable":
                score += 3

            # Business quality (placeholder)
            score += 3  # Assume average quality

        except Exception as e:
            print(f"Error fetching fundamentals for {symbol}: {e}")

        return min(score, 20)

    def identify_pivot(self, df: pd.DataFrame, contractions: List[Contraction]) -> float:
        """
        Identify breakout pivot level

        Args:
            df: OHLCV DataFrame
            contractions: List of contractions

        Returns:
            Pivot breakout level
        """
        if not contractions:
            return 0.0

        # Pivot is the highest point of the final contraction
        final_contraction = contractions[-1]
        return final_contraction.high

    def score_vcp(self, contractions: List[Contraction], volume_profile: Dict[str, float],
                 trend_score: int, fundamental_score: int) -> Tuple[int, VCPQuality, int, int]:
        """
        Calculate overall VCP quality score

        Args:
            contractions: List of contractions
            volume_profile: Volume analysis results
            trend_score: Trend template score
            fundamental_score: Fundamental score

        Returns:
            Tuple of (total_score, grade, volume_score, tightness_score)
        """
        # Contraction quality (0-20)
        contraction_score = 0

        # Number of contractions
        num_contractions = len(contractions)
        if num_contractions >= 4:
            contraction_score += 8
        elif num_contractions == 3:
            contraction_score += 6
        elif num_contractions == 2:
            contraction_score += 4

        # Depth reduction
        if len(contractions) >= 2:
            depth_reduction = (contractions[0].depth_pct - contractions[-1].depth_pct) / contractions[0].depth_pct
            if depth_reduction > 0.6:
                contraction_score += 6
            elif depth_reduction > 0.4:
                contraction_score += 4
            elif depth_reduction > 0.3:
                contraction_score += 2

        # Pattern shape and duration
        total_duration = (contractions[-1].end_date - contractions[0].start_date).days
        if 42 <= total_duration <= 70:  # 6-10 weeks
            contraction_score += 6
        else:
            contraction_score += 4

        # Volume profile (0-20)
        volume_score = 0
        if volume_profile['declining']:
            volume_score += 6
        if volume_profile['final_dry_up']:
            volume_score += 6
        if volume_profile['avg_volume_ratio'] < 0.7:
            volume_score += 4
        volume_score += 4  # Base points for volume analysis

        # Tightness (0-20)
        tightness_score = 0
        if len(contractions) > 0:
            final_range_pct = ((contractions[-1].high - contractions[-1].low) / contractions[-1].high) * 100
            if final_range_pct < 5:
                tightness_score += 10
            elif final_range_pct < 7:
                tightness_score += 8
            elif final_range_pct < 10:
                tightness_score += 6
            elif final_range_pct < 15:
                tightness_score += 4

            # Duration of final contraction
            final_duration = contractions[-1].duration_days
            if 14 <= final_duration <= 21:  # 2-3 weeks
                tightness_score += 4
            else:
                tightness_score += 2

            tightness_score += 6  # Base points for tightness

        # Total score
        total_score = trend_score + contraction_score + volume_score + fundamental_score + tightness_score

        # Determine grade
        if total_score >= 90:
            grade = VCPQuality.A_PLUS
        elif total_score >= 80:
            grade = VCPQuality.A
        elif total_score >= 70:
            grade = VCPQuality.A_MINUS
        elif total_score >= 60:
            grade = VCPQuality.B_PLUS
        elif total_score >= 50:
            grade = VCPQuality.B
        else:
            grade = VCPQuality.C

        return total_score, grade, volume_score, tightness_score

def detect_vcp(symbol: str, df: pd.DataFrame) -> Optional[VCPResult]:
    """
    Main VCP detection function

    Args:
        symbol: Stock symbol
        df: OHLCV DataFrame

    Returns:
        VCPResult if valid VCP found, None otherwise
    """
    detector = VCPDetector()

    try:
        # Find swing points
        swing_highs, swing_lows = detector.find_swing_points(df)

        if len(swing_highs) < 2 or len(swing_lows) < 2:
            return None

        # Detect contractions
        contractions = detector.detect_contractions(swing_highs, swing_lows, df)

        if not detector.validate_vcp(contractions):
            return None

        # Volume analysis
        contraction_periods = [(c.start_date, c.end_date) for c in contractions]
        volume_profile = detector.calculate_volume_profile(df, contraction_periods)

        # Trend analysis
        trend_score = detector.check_trend_template(df)

        # Fundamental analysis
        fundamental_score = detector.check_fundamentals(symbol)

        # Calculate overall score
        total_score, grade, volume_score, tightness_score = detector.score_vcp(contractions, volume_profile, trend_score, fundamental_score)

        # Identify pivot and stop loss
        pivot_level = detector.identify_pivot(df, contractions)
        stop_loss = contractions[-1].low * 0.95  # 5% below final contraction low

        # Breakout readiness
        current_price = df['close'].iloc[-1]
        breakout_readiness = current_price < pivot_level * 0.98  # Within 2% of pivot

        result = VCPResult(
            symbol=symbol,
            score=total_score,
            grade=grade,
            contractions=contractions,
            pivot_level=pivot_level,
            stop_loss=stop_loss,
            trend_score=trend_score,
            volume_score=volume_score,
            fundamental_score=fundamental_score,
            tightness_score=tightness_score,
            breakout_readiness=breakout_readiness
        )

        return result

    except Exception as e:
        print(f"Error detecting VCP for {symbol}: {e}")
        return None
