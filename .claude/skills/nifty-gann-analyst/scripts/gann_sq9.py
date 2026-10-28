#!/usr/bin/env python3
"""
Gann Square of 9 Calculator for Nifty Analysis
Calculates geometric price levels using Gann's Square of 9 methodology
"""

import math
from typing import List, Dict, Tuple, Optional, Any
from datetime import datetime, time
import pytz

class GannSquareOf9:
    """Gann Square of 9 calculator for Indian markets"""

    def __init__(self, center_price: float):
        """
        Initialize with center price (usually previous close)

        Args:
            center_price: Center price for calculations
        """
        self.center_price = center_price
        self.sqrt_center = math.sqrt(center_price)

    def calculate_level(self, degrees: float) -> float:
        """
        Calculate price level at given degree increment

        Args:
            degrees: Degree increment (90, 180, 270, 360)

        Returns:
            Price level at the degree
        """
        # Convert degrees to increments (90° = 0.25, 180° = 0.50, etc.)
        increment = degrees / 360.0

        # Calculate new square root
        new_sqrt = self.sqrt_center + increment

        # Square to get price level
        price_level = new_sqrt ** 2

        return round(price_level, 2)

    def get_cardinal_levels(self) -> Dict[str, float]:
        """
        Get cardinal cross levels (90° increments)

        Returns:
            Dictionary of cardinal levels
        """
        levels = {}
        cardinal_degrees = [90, 180, 270, 360]

        for degrees in cardinal_degrees:
            direction = "resistance" if degrees in [90, 180] else "support"
            level_name = f"{degrees}°_{direction}"
            levels[level_name] = self.calculate_level(degrees)

        return levels

    def get_ordinal_levels(self) -> Dict[str, float]:
        """
        Get ordinal cross levels (45° increments)

        Returns:
            Dictionary of ordinal levels
        """
        levels = {}
        ordinal_degrees = [45, 135, 225, 315]

        for degrees in ordinal_degrees:
            direction = "resistance" if degrees in [45, 135] else "support"
            level_name = f"{degrees}°_{direction}"
            levels[level_name] = self.calculate_level(degrees)

        return levels

    def get_nearest_strikes(self, levels: Dict[str, float]) -> Dict[str, int]:
        """
        Convert price levels to nearest Nifty strike prices

        Args:
            levels: Dictionary of price levels

        Returns:
            Dictionary of strike prices
        """
        strikes = {}
        for level_name, price in levels.items():
            # Round to nearest 100 for Nifty strikes
            strike = round(price / 100) * 100
            strikes[level_name] = strike

        return strikes

    def analyze_current_position(self, current_price: float) -> Dict[str, Any]:
        """
        Analyze where current price stands relative to Gann levels

        Args:
            current_price: Current market price

        Returns:
            Analysis dictionary
        """
        cardinal = self.get_cardinal_levels()
        ordinal = self.get_ordinal_levels()

        # Find nearest levels above and below
        all_levels = list(cardinal.values()) + list(ordinal.values())
        all_levels.sort()

        above_levels = [level for level in all_levels if level > current_price]
        below_levels = [level for level in all_levels if level < current_price]

        nearest_resistance = min(above_levels) if above_levels else None
        nearest_support = max(below_levels) if below_levels else None

        return {
            "current_price": current_price,
            "nearest_resistance": nearest_resistance,
            "nearest_support": nearest_support,
            "distance_to_resistance": nearest_resistance - current_price if nearest_resistance else None,
            "distance_to_support": current_price - nearest_support if nearest_support else None,
            "cardinal_levels": cardinal,
            "ordinal_levels": ordinal
        }

def calculate_gann_levels(center_price: float, current_price: Optional[float] = None) -> Dict[str, Any]:
    """
    Calculate Gann Square of 9 levels for given center price

    Args:
        center_price: Center price for calculations
        current_price: Current market price for analysis

    Returns:
        Complete Gann analysis
    """
    calculator = GannSquareOf9(center_price)

    result = {
        "center_price": center_price,
        "sqrt_center": round(calculator.sqrt_center, 2),
        "cardinal_levels": calculator.get_cardinal_levels(),
        "ordinal_levels": calculator.get_ordinal_levels(),
        "strike_prices": calculator.get_nearest_strikes({
            **calculator.get_cardinal_levels(),
            **calculator.get_ordinal_levels()
        })
    }

    if current_price:
        result["position_analysis"] = calculator.analyze_current_position(current_price)

    return result

def get_option_strikes(gann_analysis: Dict[str, Any]) -> Dict[str, List[int]]:
    """
    Get recommended option strikes based on Gann levels

    Args:
        gann_analysis: Gann analysis dictionary

    Returns:
        Dictionary of call and put strikes
    """
    strikes = gann_analysis["strike_prices"]

    # Get resistance strikes for calls
    call_strikes = []
    for key, strike in strikes.items():
        if "resistance" in key:
            call_strikes.append(strike)
    call_strikes = sorted(list(set(call_strikes)))[:3]  # Top 3 unique levels

    # Get support strikes for puts
    put_strikes = []
    for key, strike in strikes.items():
        if "support" in key:
            put_strikes.append(strike)
    put_strikes = sorted(list(set(put_strikes)), reverse=True)[:3]  # Bottom 3 unique levels

    return {
        "call_strikes": call_strikes,
        "put_strikes": put_strikes
    }

# Example usage and testing
if __name__ == "__main__":
    # Example: Nifty at 22500
    center_price = 22500
    current_price = 22450

    print("=== Gann Square of 9 Analysis ===")
    print(f"Center Price: {center_price}")
    print(f"Current Price: {current_price}")
    print()

    analysis = calculate_gann_levels(center_price, current_price)

    print("Cardinal Levels:")
    for level_name, price in analysis["cardinal_levels"].items():
        strike = analysis["strike_prices"][level_name]
        print(f"  {level_name}: {price:.2f} (Strike: {strike})")

    print("\nOrdinal Levels:")
    for level_name, price in analysis["ordinal_levels"].items():
        strike = analysis["strike_prices"][level_name]
        print(f"  {level_name}: {price:.2f} (Strike: {strike})")

    print("\nPosition Analysis:")
    pos = analysis["position_analysis"]
    print(f"  Nearest Resistance: {pos['nearest_resistance']}")
    print(f"  Nearest Support: {pos['nearest_support']}")
    print(".2f")
    print(".2f")

    print("\nRecommended Option Strikes:")
    strikes = get_option_strikes(analysis)
    print(f"  Call Strikes: {strikes['call_strikes']}")
    print(f"  Put Strikes: {strikes['put_strikes']}")
