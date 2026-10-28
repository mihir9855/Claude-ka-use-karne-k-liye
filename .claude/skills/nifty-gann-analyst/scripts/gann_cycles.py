#!/usr/bin/env python3
"""
Gann Time Cycle Analyzer for Indian Markets
Identifies natural market cycles and turning points using Gann methodology
"""

import math
from typing import List, Dict, Tuple, Optional, Any
from datetime import datetime, timedelta
import calendar

class GannTimeCycle:
    """Gann time cycle analyzer for Indian markets"""

    def __init__(self, start_date: datetime):
        """
        Initialize with start date for cycle calculations

        Args:
            start_date: Starting point for cycle analysis
        """
        self.start_date = start_date

    def calculate_cycle_end(self, cycle_length: int) -> datetime:
        """
        Calculate end date of a cycle

        Args:
            cycle_length: Cycle length in days

        Returns:
            End date of the cycle
        """
        return self.start_date + timedelta(days=cycle_length)

    def get_primary_cycles(self) -> Dict[str, int]:
        """
        Get primary Gann time cycles in days

        Returns:
            Dictionary of cycle names and lengths
        """
        return {
            "7_day": 7,
            "14_day": 14,
            "21_day": 21,
            "28_day": 28,
            "35_day": 35,
            "49_day": 49,
            "63_day": 63,
            "90_day": 90,
            "120_day": 120,
            "180_day": 180,
            "270_day": 270,
            "360_day": 360
        }

    def get_fibonacci_cycles(self, base_cycle: int) -> List[int]:
        """
        Calculate Fibonacci-based cycle lengths

        Args:
            base_cycle: Base cycle length

        Returns:
            List of Fibonacci cycle lengths
        """
        fib_ratios = [0.618, 1.0, 1.618, 2.618]
        cycles = []

        for ratio in fib_ratios:
            cycle = round(base_cycle * ratio)
            cycles.append(cycle)

        return cycles

    def get_geometric_cycles(self, base_cycle: int) -> List[int]:
        """
        Calculate geometric progression cycles

        Args:
            base_cycle: Base cycle length

        Returns:
            List of geometric cycle lengths
        """
        multipliers = [1.5, 2.0, 2.5, 3.0]
        cycles = []

        for multiplier in multipliers:
            cycle = round(base_cycle * multiplier)
            cycles.append(cycle)

        return cycles

    def find_cycle_confluence(self, target_date: datetime) -> Dict[str, Any]:
        """
        Find cycle confluence points around target date

        Args:
            target_date: Date to analyze for cycle confluence

        Returns:
            Dictionary of confluence analysis
        """
        cycles = self.get_primary_cycles()
        confluence_points = []

        for cycle_name, cycle_length in cycles.items():
            # Calculate how many cycles fit from start to target
            days_diff = (target_date - self.start_date).days
            cycle_count = days_diff // cycle_length

            # Calculate cycle end dates
            for i in range(max(1, cycle_count - 2), cycle_count + 3):
                cycle_end = self.start_date + timedelta(days=i * cycle_length)
                days_to_target = abs((cycle_end - target_date).days)

                if days_to_target <= 3:  # Within 3 days
                    confluence_points.append({
                        "cycle_name": cycle_name,
                        "cycle_length": cycle_length,
                        "cycle_number": i,
                        "cycle_end_date": cycle_end,
                        "days_from_target": days_to_target,
                        "strength": self._calculate_cycle_strength(cycle_length)
                    })

        # Sort by proximity to target date
        confluence_points.sort(key=lambda x: x["days_from_target"])

        return {
            "target_date": target_date,
            "confluence_points": confluence_points[:5],  # Top 5 closest
            "total_confluence": len(confluence_points),
            "strongest_cycle": max(confluence_points, key=lambda x: x["strength"]) if confluence_points else None
        }

    def _calculate_cycle_strength(self, cycle_length: int) -> float:
        """
        Calculate relative strength of a cycle

        Args:
            cycle_length: Cycle length in days

        Returns:
            Strength score (0-1)
        """
        # Shorter cycles have higher frequency but less impact
        # Longer cycles have lower frequency but higher impact
        if cycle_length <= 7:
            return 0.6
        elif cycle_length <= 28:
            return 0.8
        elif cycle_length <= 90:
            return 0.9
        else:
            return 1.0

    def get_indian_market_cycles(self) -> Dict[str, Any]:
        """
        Get cycles specific to Indian markets

        Returns:
            Dictionary of Indian market cycles
        """
        return {
            "expiry_cycle": {
                "length": 7,
                "description": "Weekly expiry cycle (Thu-Thu)",
                "strength": 0.8
            },
            "budget_cycle": {
                "length": 90,
                "description": "Quarterly budget cycle",
                "strength": 0.9
            },
            "results_cycle": {
                "length": 90,
                "description": "Quarterly results cycle",
                "strength": 0.9
            },
            "monsoon_cycle": {
                "length": 120,
                "description": "Monsoon season impact",
                "strength": 0.7
            },
            "rbi_cycle": {
                "length": 28,
                "description": "RBI policy cycle",
                "strength": 0.8
            }
        }

    def analyze_current_cycle_position(self, current_date: datetime) -> Dict[str, Any]:
        """
        Analyze current position within various cycles

        Args:
            current_date: Current date for analysis

        Returns:
            Cycle position analysis
        """
        cycles = self.get_primary_cycles()
        positions = {}

        for cycle_name, cycle_length in cycles.items():
            days_from_start = (current_date - self.start_date).days
            position_in_cycle = days_from_start % cycle_length
            completion_percentage = (position_in_cycle / cycle_length) * 100

            # Determine cycle phase
            if completion_percentage < 25:
                phase = "early"
                risk_level = "low"
            elif completion_percentage < 75:
                phase = "middle"
                risk_level = "medium"
            else:
                phase = "late"
                risk_level = "high"

            positions[cycle_name] = {
                "cycle_length": cycle_length,
                "position_days": position_in_cycle,
                "completion_percentage": round(completion_percentage, 1),
                "phase": phase,
                "risk_level": risk_level,
                "days_to_end": cycle_length - position_in_cycle
            }

        return {
            "current_date": current_date,
            "cycle_positions": positions,
            "high_risk_cycles": [k for k, v in positions.items() if v["risk_level"] == "high"],
            "turning_point_cycles": [k for k, v in positions.items() if v["completion_percentage"] > 90]
        }

def get_next_cycle_turning_points(start_date: datetime, days_ahead: int = 30) -> List[Dict[str, Any]]:
    """
    Get upcoming cycle turning points

    Args:
        start_date: Start date for analysis
        days_ahead: Number of days to look ahead

    Returns:
        List of turning points
    """
    analyzer = GannTimeCycle(start_date)
    end_date = start_date + timedelta(days=days_ahead)

    turning_points = []

    # Check each day for cycle confluence
    current_date = start_date
    while current_date <= end_date:
        confluence = analyzer.find_cycle_confluence(current_date)

        if confluence["total_confluence"] >= 2:  # At least 2 cycles ending
            turning_points.append({
                "date": current_date,
                "confluence_count": confluence["total_confluence"],
                "cycles": [cp["cycle_name"] for cp in confluence["confluence_points"]],
                "strength": sum(cp["strength"] for cp in confluence["confluence_points"]) / len(confluence["confluence_points"])
            })

        current_date += timedelta(days=1)

    # Sort by strength and date
    turning_points.sort(key=lambda x: (-x["strength"], x["date"]))

    return turning_points[:10]  # Top 10 turning points

# Example usage and testing
if __name__ == "__main__":
    # Example: Starting from a major pivot date
    start_date = datetime(2024, 1, 1)  # Example start date
    current_date = datetime(2024, 2, 15)  # Example current date

    print("=== Gann Time Cycle Analysis ===")
    print(f"Start Date: {start_date.strftime('%Y-%m-%d')}")
    print(f"Current Date: {current_date.strftime('%Y-%m-%d')}")
    print()

    analyzer = GannTimeCycle(start_date)

    # Current cycle positions
    positions = analyzer.analyze_current_cycle_position(current_date)
    print("Current Cycle Positions:")
    for cycle_name, data in positions["cycle_positions"].items():
        print(f"  {cycle_name}: {data['completion_percentage']}% complete ({data['phase']} phase)")

    print(f"\nHigh Risk Cycles: {positions['high_risk_cycles']}")
    print(f"Turning Point Cycles: {positions['turning_point_cycles']}")
    print()

    # Upcoming turning points
    turning_points = get_next_cycle_turning_points(current_date, 30)
    print("Upcoming Turning Points:")
    for tp in turning_points[:5]:
        print(f"  {tp['date'].strftime('%Y-%m-%d')}: {tp['confluence_count']} cycles (strength: {tp['strength']:.2f})")
        print(f"    Cycles: {', '.join(tp['cycles'])}")

    print("\nIndian Market Cycles:")
    indian_cycles = analyzer.get_indian_market_cycles()
    for cycle_name, data in indian_cycles.items():
        end_date = analyzer.calculate_cycle_end(data["length"])
        print(f"  {cycle_name}: {data['length']} days - {data['description']}")
        print(f"    Next: {end_date.strftime('%Y-%m-%d')} (strength: {data['strength']})")
