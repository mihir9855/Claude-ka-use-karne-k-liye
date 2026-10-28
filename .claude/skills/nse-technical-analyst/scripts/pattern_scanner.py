#!/usr/bin/env python3
"""
Chart Pattern Scanner for NSE Technical Analysis
Advanced pattern recognition for Indian equity markets with NSE-specific adaptations.
"""

import pandas as pd
import numpy as np
from typing import List, Optional, Tuple, Dict, Any
from dataclasses import dataclass
from enum import Enum
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class PatternType(Enum):
    REVERSAL = "reversal"
    CONTINUATION = "continuation"
    BILATERAL = "bilateral"

class PatternReliability(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class PatternMatch:
    pattern_name: str
    pattern_type: PatternType
    reliability: PatternReliability
    confidence_score: float  # 0-1
    start_index: int
    end_index: int
    price_target: Optional[float] = None
    stop_loss: Optional[float] = None
    volume_confirmation: bool = False
    description: str = ""
    pattern_data: Dict[str, Any] = None

@dataclass
class PatternScanResult:
    patterns_found: List[PatternMatch]
    scan_timestamp: datetime
    data_points_analyzed: int
    timeframe: str

class NSEPatternScanner:
    """
    Advanced chart pattern scanner adapted for NSE market behavior
    """

    def __init__(self):
        self.min_pattern_length = 10  # Minimum candles for pattern recognition
        self.max_pattern_length = 100  # Maximum candles to look back
        self.volume_threshold = 1.2  # Volume must be 20% above average for confirmation

        # NSE-specific pattern parameters
        self.nse_parameters = {
            'double_top_tolerance': 0.02,  # 2% tolerance for peak matching
            'triangle_slope_threshold': 0.001,  # Minimum slope for triangle recognition
            'wedge_convergence_threshold': 0.005,  # Convergence rate for wedges
            'flag_channel_tolerance': 0.03,  # Channel tolerance for flags
            'head_shoulders_ratio': 1.5,  # Head must be 1.5x shoulder height
            'fibonacci_retracement_levels': [0.236, 0.382, 0.5, 0.618, 0.786]
        }

    def scan_all_patterns(self, data: pd.DataFrame, symbol: str = "UNKNOWN") -> PatternScanResult:
        """
        Comprehensive pattern scan across all supported patterns

        Args:
            data: OHLCV DataFrame
            symbol: Symbol name for context

        Returns:
            Complete pattern scan results
        """
        logger.info(f"Scanning patterns for {symbol} with {len(data)} data points")

        if len(data) < self.min_pattern_length:
            logger.warning(f"Insufficient data points: {len(data)} < {self.min_pattern_length}")
            return PatternScanResult([], datetime.now(), len(data), "insufficient_data")

        patterns_found = []

        # Reversal Patterns
        patterns_found.extend(self._scan_reversal_patterns(data))

        # Continuation Patterns
        patterns_found.extend(self._scan_continuation_patterns(data))

        # Bilateral Patterns
        patterns_found.extend(self._scan_bilateral_patterns(data))

        # Sort by confidence and recency
        patterns_found.sort(key=lambda x: (x.confidence_score, x.end_index), reverse=True)

        # Limit to top 5 most reliable patterns
        patterns_found = patterns_found[:5]

        return PatternScanResult(
            patterns_found=patterns_found,
            scan_timestamp=datetime.now(),
            data_points_analyzed=len(data),
            timeframe=self._infer_timeframe(data)
        )

    def _scan_reversal_patterns(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for reversal patterns"""
        patterns = []

        # Double Top/Bottom
        double_patterns = self._scan_double_patterns(data)
        patterns.extend(double_patterns)

        # Head and Shoulders
        hns_patterns = self._scan_head_shoulders(data)
        patterns.extend(hns_patterns)

        # Triple Top/Bottom
        triple_patterns = self._scan_triple_patterns(data)
        patterns.extend(triple_patterns)

        # Inverse Head and Shoulders
        inverse_hns = self._scan_inverse_head_shoulders(data)
        patterns.extend(inverse_hns)

        return patterns

    def _scan_continuation_patterns(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for continuation patterns"""
        patterns = []

        # Flags and Pennants
        flag_patterns = self._scan_flags_pennants(data)
        patterns.extend(flag_patterns)

        # Triangles
        triangle_patterns = self._scan_triangles(data)
        patterns.extend(triangle_patterns)

        # Wedges
        wedge_patterns = self._scan_wedges(data)
        patterns.extend(wedge_patterns)

        # Rectangles
        rectangle_patterns = self._scan_rectangles(data)
        patterns.extend(rectangle_patterns)

        return patterns

    def _scan_bilateral_patterns(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for bilateral patterns (can be either reversal or continuation)"""
        patterns = []

        # Symmetrical Triangles
        sym_triangles = self._scan_symmetrical_triangles(data)
        patterns.extend(sym_triangles)

        # Ascending/Descending Triangles
        asc_desc_triangles = self._scan_ascending_descending_triangles(data)
        patterns.extend(asc_desc_triangles)

        # Cup and Handle
        cup_handle = self._scan_cup_handle(data)
        patterns.extend(cup_handle)

        return patterns

    def _scan_double_patterns(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for double top and double bottom patterns"""
        patterns = []

        highs = data['high'].values
        lows = data['low'].values
        closes = data['close'].values

        # Look for double tops
        peaks = self._find_peaks(highs, order=3)

        for i in range(len(peaks) - 1):
            peak1_idx, peak1_val = peaks[i]
            peak2_idx, peak2_val = peaks[i + 1]

            # Check if peaks are at similar levels
            if abs(peak1_val - peak2_val) / peak1_val <= self.nse_parameters['double_top_tolerance']:
                # Check for valley between peaks
                valley_idx = peak1_idx + 1
                valley_val = min(lows[valley_idx:peak2_idx])

                # Valley should be significantly lower
                if valley_val < peak1_val * 0.92:  # At least 8% decline
                    # Calculate pattern metrics
                    pattern_height = peak1_val - valley_val
                    target = peak1_val + pattern_height
                    stop_loss = peak1_val * 1.02

                    # Volume confirmation
                    volume_confirmed = self._check_volume_confirmation(data, peak1_idx, peak2_idx)

                    pattern = PatternMatch(
                        pattern_name="Double Top",
                        pattern_type=PatternType.REVERSAL,
                        reliability=PatternReliability.HIGH if volume_confirmed else PatternReliability.MEDIUM,
                        confidence_score=0.85 if volume_confirmed else 0.75,
                        start_index=peak1_idx,
                        end_index=peak2_idx,
                        price_target=target,
                        stop_loss=stop_loss,
                        volume_confirmation=volume_confirmed,
                        description=f"Double top at {peak1_val:.2f} with valley at {valley_val:.2f}",
                        pattern_data={
                            'peak1': peak1_val,
                            'peak2': peak2_val,
                            'valley': valley_val,
                            'neckline': valley_val
                        }
                    )
                    patterns.append(pattern)

        # Look for double bottoms (similar logic)
        troughs = self._find_troughs(lows, order=3)

        for i in range(len(troughs) - 1):
            trough1_idx, trough1_val = troughs[i]
            trough2_idx, trough2_val = troughs[i + 1]

            if abs(trough1_val - trough2_val) / trough1_val <= self.nse_parameters['double_top_tolerance']:
                peak_idx = trough1_idx + 1
                peak_val = max(highs[peak_idx:trough2_idx])

                if peak_val > trough1_val * 1.08:  # At least 8% rise
                    pattern_height = peak_val - trough1_val
                    target = trough1_val - pattern_height
                    stop_loss = trough1_val * 0.98

                    volume_confirmed = self._check_volume_confirmation(data, trough1_idx, trough2_idx)

                    pattern = PatternMatch(
                        pattern_name="Double Bottom",
                        pattern_type=PatternType.REVERSAL,
                        reliability=PatternReliability.HIGH if volume_confirmed else PatternReliability.MEDIUM,
                        confidence_score=0.85 if volume_confirmed else 0.75,
                        start_index=trough1_idx,
                        end_index=trough2_idx,
                        price_target=target,
                        stop_loss=stop_loss,
                        volume_confirmation=volume_confirmed,
                        description=f"Double bottom at {trough1_val:.2f} with peak at {peak_val:.2f}",
                        pattern_data={
                            'trough1': trough1_val,
                            'trough2': trough2_val,
                            'peak': peak_val,
                            'neckline': peak_val
                        }
                    )
                    patterns.append(pattern)

        return patterns

    def _scan_head_shoulders(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for head and shoulders patterns"""
        patterns = []

        highs = data['high'].values
        lows = data['low'].values

        # Find peaks
        peaks = self._find_peaks(highs, order=5)

        if len(peaks) >= 3:
            for i in range(len(peaks) - 2):
                left_shoulder_idx, left_shoulder = peaks[i]
                head_idx, head = peaks[i + 1]
                right_shoulder_idx, right_shoulder = peaks[i + 2]

                # Check head and shoulders relationship
                shoulder_avg = (left_shoulder + right_shoulder) / 2

                # Head should be higher than shoulders
                if head > shoulder_avg * self.nse_parameters['head_shoulders_ratio']:
                    # Shoulders should be at similar levels
                    if abs(left_shoulder - right_shoulder) / left_shoulder <= 0.05:
                        # Find neckline (troughs between peaks)
                        neckline1 = min(lows[left_shoulder_idx:head_idx])
                        neckline2 = min(lows[head_idx:right_shoulder_idx])

                        neckline = (neckline1 + neckline2) / 2

                        # Calculate target
                        pattern_height = head - neckline
                        target = neckline - pattern_height

                        volume_confirmed = self._check_volume_confirmation(
                            data, left_shoulder_idx, right_shoulder_idx
                        )

                        pattern = PatternMatch(
                            pattern_name="Head and Shoulders",
                            pattern_type=PatternType.REVERSAL,
                            reliability=PatternReliability.HIGH if volume_confirmed else PatternReliability.MEDIUM,
                            confidence_score=0.9 if volume_confirmed else 0.8,
                            start_index=left_shoulder_idx,
                            end_index=right_shoulder_idx,
                            price_target=target,
                            stop_loss=head * 1.02,
                            volume_confirmation=volume_confirmed,
                            description=f"H&S with head at {head:.2f}, shoulders at {shoulder_avg:.2f}",
                            pattern_data={
                                'left_shoulder': left_shoulder,
                                'head': head,
                                'right_shoulder': right_shoulder,
                                'neckline': neckline
                            }
                        )
                        patterns.append(pattern)

        return patterns

    def _scan_flags_pennants(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for flag and pennant patterns"""
        patterns = []

        closes = data['close'].values
        highs = data['high'].values
        lows = data['low'].values

        # Look for strong moves followed by consolidation
        for i in range(20, len(closes) - 10):
            # Check for flagpole (strong move)
            flagpole_start = i - 20
            flagpole_end = i

            flagpole_move = abs(closes[flagpole_end] - closes[flagpole_start])
            flagpole_length = flagpole_end - flagpole_start

            if flagpole_move / closes[flagpole_start] > 0.05:  # At least 5% move
                # Check for consolidation channel
                consolidation_start = i
                consolidation_end = min(i + 15, len(closes) - 1)

                # Fit channel to consolidation period
                channel_highs = highs[consolidation_start:consolidation_end]
                channel_lows = lows[consolidation_start:consolidation_end]

                # Check if channel is contracting (pennant) or parallel (flag)
                high_slope = np.polyfit(range(len(channel_highs)), channel_highs, 1)[0]
                low_slope = np.polyfit(range(len(channel_lows)), channel_lows, 1)[0]

                is_pennant = abs(high_slope) < 0.001 and abs(low_slope) < 0.001
                is_flag = abs(high_slope - low_slope) < self.nse_parameters['flag_channel_tolerance']

                if is_pennant or is_flag:
                    pattern_name = "Pennant" if is_pennant else "Flag"
                    direction = "Bull" if closes[flagpole_end] > closes[flagpole_start] else "Bear"

                    # Calculate breakout target
                    channel_height = np.mean(channel_highs) - np.mean(channel_lows)
                    target = (closes[consolidation_end] +
                            (flagpole_move * (1 if direction == "Bull" else -1)))

                    volume_confirmed = self._check_volume_confirmation(
                        data, consolidation_start, consolidation_end
                    )

                    pattern = PatternMatch(
                        pattern_name=f"{direction} {pattern_name}",
                        pattern_type=PatternType.CONTINUATION,
                        reliability=PatternReliability.MEDIUM,
                        confidence_score=0.7 if volume_confirmed else 0.6,
                        start_index=flagpole_start,
                        end_index=consolidation_end,
                        price_target=target,
                        stop_loss=closes[consolidation_start] * (0.97 if direction == "Bull" else 1.03),
                        volume_confirmation=volume_confirmed,
                        description=f"{direction} {pattern_name} after {flagpole_move:.1f} point flagpole",
                        pattern_data={
                            'flagpole_move': flagpole_move,
                            'channel_height': channel_height,
                            'is_pennant': is_pennant
                        }
                    )
                    patterns.append(pattern)

        return patterns

    def _scan_triangles(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for triangle patterns"""
        patterns = []

        highs = data['high'].values
        lows = data['low'].values

        # Look for converging trendlines
        for length in [20, 30, 50]:
            if length >= len(data):
                continue

            for start_idx in range(len(data) - length):
                end_idx = start_idx + length

                # Get highs and lows for the period
                period_highs = highs[start_idx:end_idx]
                period_lows = lows[start_idx:end_idx]

                # Fit trendlines
                try:
                    high_trend = np.polyfit(range(length), period_highs, 1)
                    low_trend = np.polyfit(range(length), period_lows, 1)

                    # Check for convergence
                    high_slope = high_trend[0]
                    low_slope = low_trend[0]

                    # Triangle conditions
                    converging = ((high_slope < 0 and low_slope > 0) or  # Ascending
                                (high_slope > 0 and low_slope < 0) or    # Descending
                                (abs(high_slope) < 0.001 and abs(low_slope) < 0.001))  # Symmetrical

                    if converging:
                        # Calculate apex and target
                        apex_price = (high_trend[1] + low_trend[1]) / 2
                        height = period_highs.max() - period_lows.min()

                        # Determine triangle type
                        if high_slope < 0 and low_slope > 0:
                            pattern_name = "Ascending Triangle"
                            target = period_highs.max() + height * 0.5
                        elif high_slope > 0 and low_slope < 0:
                            pattern_name = "Descending Triangle"
                            target = period_lows.min() - height * 0.5
                        else:
                            pattern_name = "Symmetrical Triangle"
                            # Target depends on breakout direction
                            target = None

                        volume_confirmed = self._check_volume_confirmation(data, start_idx, end_idx)

                        pattern = PatternMatch(
                            pattern_name=pattern_name,
                            pattern_type=PatternType.CONTINUATION,
                            reliability=PatternReliability.MEDIUM,
                            confidence_score=0.65 if volume_confirmed else 0.55,
                            start_index=start_idx,
                            end_index=end_idx,
                            price_target=target,
                            stop_loss=apex_price,
                            volume_confirmation=volume_confirmed,
                            description=f"{pattern_name} with height {height:.2f}",
                            pattern_data={
                                'apex_price': apex_price,
                                'height': height,
                                'high_slope': high_slope,
                                'low_slope': low_slope
                            }
                        )
                        patterns.append(pattern)

                except np.linalg.LinAlgError:
                    continue  # Skip if trendline fitting fails

        return patterns

    def _scan_cup_handle(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for cup and handle patterns"""
        patterns = []

        closes = data['close'].values

        # Cup formation requires longer timeframe
        min_cup_length = 30
        max_cup_length = 80

        for cup_length in range(min_cup_length, min(max_cup_length, len(closes) - 20)):
            for start_idx in range(len(closes) - cup_length - 20):
                cup_end_idx = start_idx + cup_length

                cup_data = closes[start_idx:cup_end_idx]

                # Check for U-shaped cup
                if self._is_cup_shape(cup_data):
                    # Check for handle formation
                    handle_start = cup_end_idx
                    handle_end = min(cup_end_idx + 15, len(closes))

                    handle_data = closes[handle_start:handle_end]

                    if self._is_handle_shape(handle_data, cup_data):
                        # Calculate pattern metrics
                        cup_low = np.min(cup_data)
                        cup_high = np.max(cup_data)
                        cup_depth = (cup_high - cup_low) / cup_high

                        # Cup should not be too deep (>50%) or too shallow (<10%)
                        if 0.1 <= cup_depth <= 0.5:
                            target = cup_high + (cup_high - cup_low)
                            stop_loss = cup_low * 0.95

                            volume_confirmed = self._check_volume_confirmation(
                                data, start_idx, handle_end
                            )

                            pattern = PatternMatch(
                                pattern_name="Cup and Handle",
                                pattern_type=PatternType.BILATERAL,
                                reliability=PatternReliability.HIGH if volume_confirmed else PatternReliability.MEDIUM,
                                confidence_score=0.8 if volume_confirmed else 0.7,
                                start_index=start_idx,
                                end_index=handle_end,
                                price_target=target,
                                stop_loss=stop_loss,
                                volume_confirmation=volume_confirmed,
                                description=f"Cup depth: {cup_depth:.1%}, handle length: {len(handle_data)}",
                                pattern_data={
                                    'cup_depth': cup_depth,
                                    'cup_high': cup_high,
                                    'cup_low': cup_low,
                                    'handle_length': len(handle_data)
                                }
                            )
                            patterns.append(pattern)

        return patterns

    # Helper methods
    def _find_peaks(self, data: np.ndarray, order: int = 3) -> List[Tuple[int, float]]:
        """Find peaks in data"""
        peaks = []
        for i in range(order, len(data) - order):
            if all(data[i] >= data[i-j] for j in range(1, order+1)) and \
               all(data[i] >= data[i+j] for j in range(1, order+1)):
                peaks.append((i, data[i]))
        return peaks

    def _find_troughs(self, data: np.ndarray, order: int = 3) -> List[Tuple[int, float]]:
        """Find troughs in data"""
        troughs = []
        for i in range(order, len(data) - order):
            if all(data[i] <= data[i-j] for j in range(1, order+1)) and \
               all(data[i] <= data[i+j] for j in range(1, order+1)):
                troughs.append((i, data[i]))
        return troughs

    def _check_volume_confirmation(self, data: pd.DataFrame, start_idx: int, end_idx: int) -> bool:
        """Check if volume confirms the pattern"""
        if 'volume' not in data.columns:
            return False

        pattern_volume = data['volume'].iloc[start_idx:end_idx]
        avg_volume = data['volume'].rolling(20).mean().iloc[end_idx] if end_idx < len(data) else 0

        if avg_volume > 0:
            return pattern_volume.mean() > avg_volume * self.volume_threshold

        return False

    def _is_cup_shape(self, data: np.ndarray) -> bool:
        """Check if data forms a cup shape"""
        if len(data) < 20:
            return False

        # Split into left and right sides
        mid = len(data) // 2
        left_side = data[:mid]
        right_side = data[mid:]

        # Both sides should be relatively smooth and U-shaped
        left_min_idx = np.argmin(left_side)
        right_min_idx = np.argmin(right_side)

        # Minimums should be in the middle of each side
        left_min_pos = left_min_idx / len(left_side)
        right_min_pos = right_min_idx / len(right_side)

        return 0.3 <= left_min_pos <= 0.7 and 0.3 <= right_min_pos <= 0.7

    def _is_handle_shape(self, handle_data: np.ndarray, cup_data: np.ndarray) -> bool:
        """Check if handle formation is valid"""
        if len(handle_data) < 5:
            return False

        cup_high = np.max(cup_data)
        handle_high = np.max(handle_data)
        handle_low = np.min(handle_data)

        # Handle should be smaller consolidation
        handle_range = (handle_high - handle_low) / handle_low
        return handle_range < 0.1 and handle_high < cup_high * 1.05

    def _scan_triple_patterns(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for triple top/bottom patterns (simplified)"""
        # Similar to double patterns but with 3 peaks/troughs
        return []  # Implementation simplified

    def _scan_inverse_head_shoulders(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for inverse head and shoulders (simplified)"""
        return []  # Implementation simplified

    def _scan_wedges(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for wedge patterns (simplified)"""
        return []  # Implementation simplified

    def _scan_rectangles(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for rectangle patterns (simplified)"""
        return []  # Implementation simplified

    def _scan_symmetrical_triangles(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for symmetrical triangles (simplified)"""
        return []  # Implementation simplified

    def _scan_ascending_descending_triangles(self, data: pd.DataFrame) -> List[PatternMatch]:
        """Scan for ascending/descending triangles (simplified)"""
        return []  # Implementation simplified

    def _infer_timeframe(self, data: pd.DataFrame) -> str:
        """Infer timeframe from data"""
        if hasattr(data.index, 'freq'):
            freq = data.index.freq
            if freq:
                return str(freq)
        return "unknown"

def format_pattern_report(scan_result: PatternScanResult) -> str:
    """Format pattern scan results as readable report"""
    if not scan_result.patterns_found:
        return "📊 Pattern Scan Results\nNo significant patterns detected in the analyzed timeframe."

    report = f"""📊 Pattern Scan Results
Analyzed {scan_result.data_points_analyzed} data points ({scan_result.timeframe})

**Patterns Found:** {len(scan_result.patterns_found)}

"""

    for i, pattern in enumerate(scan_result.patterns_found, 1):
        reliability_icon = {
            PatternReliability.HIGH: "🟢",
            PatternReliability.MEDIUM: "🟡",
            PatternReliability.LOW: "🔴"
        }[pattern.reliability]

        volume_icon = "📈" if pattern.volume_confirmation else "📉"

        report += f"""**{i}. {pattern.pattern_name}** {reliability_icon} {volume_icon}
• Confidence: {pattern.confidence_score:.1%}
• Type: {pattern.pattern_type.value.title()}
• Target: ₹{pattern.price_target:.2f} | Stop: ₹{pattern.stop_loss:.2f}
• {pattern.description}

"""

    return report

if __name__ == "__main__":
    # Example usage
    scanner = NSEPatternScanner()

    # Create sample data
    dates = pd.date_range('2024-01-01', periods=100, freq='D')
    np.random.seed(42)

    # Generate price data with some patterns
    base_price = 1000
    prices = [base_price]

    # Create a double top pattern
    for i in range(99):
        if 20 <= i <= 30:  # First peak
            change = np.random.normal(0.005, 0.02)
        elif 40 <= i <= 50:  # Second peak at similar level
            change = np.random.normal(0.005, 0.02)
        elif 35 <= i <= 45:  # Valley between peaks
            change = np.random.normal(-0.005, 0.02)
        else:
            change = np.random.normal(0, 0.015)

        new_price = prices[-1] * (1 + change)
        prices.append(max(new_price, 100))

    sample_data = pd.DataFrame({
        'open': prices,
        'high': [p * (1 + abs(np.random.normal(0, 0.01))) for p in prices],
        'low': [p * (1 - abs(np.random.normal(0, 0.01))) for p in prices],
        'close': prices[1:] + [prices[-1]],
        'volume': np.random.randint(100000, 1000000, 100)
    }, index=dates)

    # Scan for patterns
    result = scanner.scan_all_patterns(sample_data, "SAMPLE_STOCK")

    # Print results
    print(format_pattern_report(result))
