#!/usr/bin/env python3
"""
Sarvatobhadra Chakra (SBC) Engine - Vedic Market Analysis
Calculates planetary positions and SBC grid for market timing
"""

import datetime
import math
from typing import Dict, List, Tuple, Optional
import pytz

# Planetary weights for market influence
PLANET_WEIGHTS = {
    'Sun': 1.0,      # Leadership
    'Moon': 0.9,     # Psychology
    'Mars': 0.8,     # Action
    'Mercury': 0.7,  # Communication
    'Jupiter': 0.9,  # Expansion
    'Venus': 0.6,    # Value
    'Saturn': 0.8,   # Structure
    'Rahu': 0.7,     # Speculation
    'Ketu': 0.6      # Detachment
}

class SBC_Engine:
    """Sarvatobhadra Chakra calculation engine"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.grid_size = 9  # 9x9 grid

    def calculate_sbc(self, date: datetime.datetime) -> Dict:
        """
        Calculate complete SBC grid for given date

        Args:
            date: Date for calculation (IST)

        Returns:
            Dictionary with SBC grid and market analysis
        """
        # Ensure IST timezone
        if date.tzinfo is None:
            date = self.ist_tz.localize(date)

        # Calculate planetary positions
        planets = self._calculate_planetary_positions(date)

        # Build SBC grid
        grid = self._build_sbc_grid(planets)

        # Calculate zone energies
        zone_energies = self._calculate_zone_energies(grid)

        # Generate market signals
        market_signals = self._generate_market_signals(zone_energies, planets)

        return {
            'date': date.strftime('%Y-%m-%d %H:%M:%S IST'),
            'planets': planets,
            'grid': grid,
            'zone_energies': zone_energies,
            'market_signals': market_signals,
            'composite_score': self._calculate_composite_score(zone_energies)
        }

    def _calculate_planetary_positions(self, date: datetime.datetime) -> Dict:
        """
        Calculate positions of all planets
        Using astronomical approximations for market analysis
        """
        # Days since J2000 epoch
        j2000 = datetime.datetime(2000, 1, 1, 12, 0, 0, tzinfo=self.ist_tz)
        days_since_j2000 = (date - j2000).total_seconds() / 86400

        planets = {}

        # Sun position (heliocentric longitude approximation)
        sun_long = (280.460 + 0.9856474 * days_since_j2000) % 360
        planets['Sun'] = {
            'longitude': sun_long,
            'grid_position': self._longitude_to_grid_position(sun_long),
            'retrograde': False,
            'combust': False
        }

        # Moon position (simplified)
        moon_long = (sun_long + 180 + (days_since_j2000 % 29.53) * 12.2) % 360
        planets['Moon'] = {
            'longitude': moon_long,
            'grid_position': self._longitude_to_grid_position(moon_long),
            'retrograde': False,
            'combust': abs(moon_long - sun_long) < 17  # Moon combust
        }

        # Mars position
        mars_long = (355.433 + 0.5240207 * days_since_j2000) % 360
        planets['Mars'] = {
            'longitude': mars_long,
            'grid_position': self._longitude_to_grid_position(mars_long),
            'retrograde': self._is_retrograde('Mars', days_since_j2000),
            'combust': abs(mars_long - sun_long) < 17
        }

        # Mercury position
        mercury_long = (252.251 + 1.6021302 * days_since_j2000) % 360
        planets['Mercury'] = {
            'longitude': mercury_long,
            'grid_position': self._longitude_to_grid_position(mercury_long),
            'retrograde': self._is_retrograde('Mercury', days_since_j2000),
            'combust': abs(mercury_long - sun_long) < 14
        }

        # Jupiter position
        jupiter_long = (34.351 + 0.0831294 * days_since_j2000) % 360
        planets['Jupiter'] = {
            'longitude': jupiter_long,
            'grid_position': self._longitude_to_grid_position(jupiter_long),
            'retrograde': self._is_retrograde('Jupiter', days_since_j2000),
            'combust': abs(jupiter_long - sun_long) < 11
        }

        # Venus position
        venus_long = (181.979 + 1.6021302 * days_since_j2000) % 360
        planets['Venus'] = {
            'longitude': venus_long,
            'grid_position': self._longitude_to_grid_position(venus_long),
            'retrograde': self._is_retrograde('Venus', days_since_j2000),
            'combust': abs(venus_long - sun_long) < 10
        }

        # Saturn position
        saturn_long = (50.078 + 0.0334597 * days_since_j2000) % 360
        planets['Saturn'] = {
            'longitude': saturn_long,
            'grid_position': self._longitude_to_grid_position(saturn_long),
            'retrograde': self._is_retrograde('Saturn', days_since_j2000),
            'combust': abs(saturn_long - sun_long) < 15
        }

        # Lunar Nodes (Rahu/Ketu)
        node_long = (125.045 - 0.0529539 * days_since_j2000) % 360
        planets['Rahu'] = {
            'longitude': node_long,
            'grid_position': self._longitude_to_grid_position(node_long),
            'retrograde': False,
            'combust': False
        }
        planets['Ketu'] = {
            'longitude': (node_long + 180) % 360,
            'grid_position': self._longitude_to_grid_position((node_long + 180) % 360),
            'retrograde': False,
            'combust': False
        }

        return planets

    def _longitude_to_grid_position(self, longitude: float) -> Tuple[int, int]:
        """
        Convert zodiac longitude to SBC grid position
        SBC grid maps 360° to 81 cells (9x9)
        """
        # Normalize longitude to 0-360
        longitude = longitude % 360

        # Convert to grid coordinates (1-9 for both row and column)
        position = longitude / 360 * 81

        # Row and column (1-based)
        row = int(position / 9) + 1
        col = int(position % 9) + 1

        # Ensure within bounds
        row = min(max(row, 1), 9)
        col = min(max(col, 1), 9)

        return (row, col)

    def _is_retrograde(self, planet: str, days_since_j2000: float) -> bool:
        """
        Simplified retrograde detection
        In real implementation, would use actual ephemeris calculations
        """
        # Simplified retrograde periods (approximate)
        retrograde_periods = {
            'Mars': (60, 80),      # ~2 months every 2 years
            'Mercury': (20, 24),   # ~3-4 weeks every 4 months
            'Jupiter': (120, 150), # ~4-5 months every 13 months
            'Venus': (40, 44),     # ~40 days every 19 months
            'Saturn': (140, 160)   # ~4-5 months every 12.5 months
        }

        if planet not in retrograde_periods:
            return False

        start_day, end_day = retrograde_periods[planet]
        cycle_length = {
            'Mars': 687,
            'Mercury': 116,
            'Jupiter': 399,
            'Venus': 584,
            'Saturn': 378
        }[planet]

        position_in_cycle = days_since_j2000 % cycle_length
        return start_day <= position_in_cycle <= end_day

    def _build_sbc_grid(self, planets: Dict) -> List[List[float]]:
        """
        Build 9x9 SBC grid with planetary energies

        Returns:
            9x9 grid of energy values (-2.0 to +3.0)
        """
        grid = [[0.0 for _ in range(9)] for _ in range(9)]

        # Place planets on grid
        for planet_name, planet_data in planets.items():
            row, col = planet_data['grid_position']
            # Convert to 0-based indexing
            row_idx, col_idx = row - 1, col - 1

            # Base energy from planet weight
            base_energy = PLANET_WEIGHTS[planet_name]

            # Adjust for retrograde
            if planet_data['retrograde']:
                base_energy *= 0.7

            # Adjust for combustion
            if planet_data['combust']:
                base_energy *= 0.5

            # Add to grid cell
            grid[row_idx][col_idx] += base_energy

        # Calculate aspect influences
        grid = self._apply_aspect_influences(grid, planets)

        return grid

    def _apply_aspect_influences(self, grid: List[List[float]], planets: Dict) -> List[List[float]]:
        """
        Apply planetary aspect influences to grid cells
        """
        aspects = [
            (0, 'Conjunction', 1.0),    # 0°
            (60, 'Sextile', 0.5),       # 60°
            (90, 'Square', 0.3),        # 90°
            (120, 'Trine', 0.7),        # 120°
            (180, 'Opposition', 0.2)    # 180°
        ]

        planet_list = list(planets.keys())

        for i, planet1 in enumerate(planet_list):
            for planet2 in planet_list[i+1:]:
                long1 = planets[planet1]['longitude']
                long2 = planets[planet2]['longitude']

                # Calculate aspect angle
                angle = min(abs(long1 - long2), 360 - abs(long1 - long2))

                # Find applicable aspect
                for aspect_angle, aspect_name, strength in aspects:
                    if abs(angle - aspect_angle) <= 8:  # 8° orb
                        # Calculate aspect strength based on orb
                        orb = abs(angle - aspect_angle)
                        aspect_strength = strength * (1 - orb/8)

                        # Apply to both planets' grid positions
                        row1, col1 = planets[planet1]['grid_position']
                        row2, col2 = planets[planet2]['grid_position']

                        # Convert to 0-based
                        r1, c1 = row1 - 1, col1 - 1
                        r2, c2 = row2 - 1, col2 - 1

                        # Beneficial aspects increase energy
                        if aspect_name in ['Sextile', 'Trine']:
                            grid[r1][c1] += aspect_strength * 0.3
                            grid[r2][c2] += aspect_strength * 0.3
                        # Challenging aspects create tension
                        elif aspect_name in ['Square', 'Opposition']:
                            grid[r1][c1] -= aspect_strength * 0.2
                            grid[r2][c2] -= aspect_strength * 0.2

        return grid

    def _calculate_zone_energies(self, grid: List[List[float]]) -> Dict:
        """
        Calculate energy levels for different SBC zones
        """
        zones = {
            'leadership': [(3, 3), (3, 4), (3, 5), (4, 3), (4, 4), (4, 5), (5, 3), (5, 4), (5, 5)],  # Center
            'action': [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4), (0, 5), (0, 6), (0, 7), (0, 8),  # Top row
                      (1, 0), (1, 8), (2, 0), (2, 8)],  # Edges
            'stability': [(6, 0), (6, 1), (6, 2), (6, 6), (6, 7), (6, 8),  # Bottom row
                         (7, 0), (7, 8), (8, 0), (8, 1), (8, 2), (8, 6), (8, 7), (8, 8)],
            'risk': [(0, 8), (1, 7), (1, 8), (2, 7), (2, 8),  # Top-right
                    (3, 7), (3, 8), (4, 7), (4, 8)]   # Right edge
        }

        zone_energies = {}
        for zone_name, cells in zones.items():
            energies = [grid[row][col] for row, col in cells]
            zone_energies[zone_name] = {
                'average': sum(energies) / len(energies),
                'maximum': max(energies),
                'cells': len(energies)
            }

        return zone_energies

    def _generate_market_signals(self, zone_energies: Dict, planets: Dict) -> Dict:
        """
        Generate market timing signals from SBC analysis
        """
        leadership = zone_energies['leadership']['average']
        action = zone_energies['action']['average']
        stability = zone_energies['stability']['average']
        risk = zone_energies['risk']['average']

        # Composite score calculation
        composite = (leadership * 0.4 + action * 0.3 + stability * 0.2 + risk * 0.1)

        # Determine market bias
        if composite >= 1.5:
            bias = 'Strongly Bullish'
            confidence = 0.8
            strategy = 'Aggressive long positions'
        elif composite >= 0.5:
            bias = 'Bullish'
            confidence = 0.7
            strategy = 'Long positions with caution'
        elif composite >= -0.5:
            bias = 'Neutral'
            confidence = 0.6
            strategy = 'Sideways, options strategies'
        elif composite >= -1.5:
            bias = 'Bearish'
            confidence = 0.7
            strategy = 'Short positions, defensive'
        else:
            bias = 'Strongly Bearish'
            confidence = 0.8
            strategy = 'Risk off, short positions'

        # Sector recommendations
        sectors = self._get_sector_recommendations(zone_energies)

        return {
            'bias': bias,
            'confidence': confidence,
            'strategy': strategy,
            'composite_score': round(composite, 2),
            'sector_focus': sectors,
            'key_levels': self._identify_key_levels(planets)
        }

    def _calculate_composite_score(self, zone_energies: Dict) -> float:
        """Calculate overall SBC composite score"""
        leadership = zone_energies['leadership']['average']
        action = zone_energies['action']['average']
        stability = zone_energies['stability']['average']
        risk = zone_energies['risk']['average']

        return round(leadership * 0.4 + action * 0.3 + stability * 0.2 + risk * 0.1, 2)

    def _get_sector_recommendations(self, zone_energies: Dict) -> List[str]:
        """Get sector recommendations based on zone energies"""
        sectors = []

        if zone_energies['leadership']['average'] > 1.0:
            sectors.extend(['Large Cap', 'PSU', 'Government-related'])

        if zone_energies['action']['average'] > 0.8:
            sectors.extend(['Technology', 'Energy', 'Defense'])

        if zone_energies['stability']['average'] > 0.7:
            sectors.extend(['Banking', 'Utilities', 'Real Estate'])

        if zone_energies['risk']['average'] < -0.5:
            sectors.extend(['Small Cap', 'Speculative stocks'])

        return list(set(sectors))  # Remove duplicates

    def _identify_key_levels(self, planets: Dict) -> Dict:
        """Identify key market levels from planetary positions"""
        # Simplified key level identification
        sun_pos = planets['Sun']['grid_position']
        moon_pos = planets['Moon']['grid_position']

        return {
            'support_zone': f"Grid {sun_pos[0]},{sun_pos[1]}",
            'resistance_zone': f"Grid {moon_pos[0]},{moon_pos[1]}",
            'pivot_zone': "Center grid (leadership zone)"
        }


def print_sbc_grid(grid: List[List[float]]):
    """Print SBC grid in readable format"""
    print("\nSarvatobhadra Chakra Grid:")
    print("┌───┬───┬───┬───┬───┬───┬───┬───┬───┐")
    for i, row in enumerate(grid):
        row_str = "│"
        for cell in row:
            row_str += "2.1f"
        row_str += "│"
        print(row_str)
        if i < 8:
            print("├───┼───┼───┼───┼───┼───┼───┼───┼───┤")
    print("└───┴───┴───┴───┴───┴───┴───┴───┴───┘")


def main():
    """Example usage"""
    engine = SBC_Engine()

    # Calculate for today
    today = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    sbc_data = engine.calculate_sbc(today)

    print(f"SBC Analysis for {sbc_data['date']}")
    print(f"Composite Score: {sbc_data['composite_score']}")
    print(f"Market Bias: {sbc_data['market_signals']['bias']}")
    print(f"Strategy: {sbc_data['market_signals']['strategy']}")
    print(f"Sector Focus: {', '.join(sbc_data['market_signals']['sector_focus'])}")

    # Print planetary positions
    print("\nPlanetary Positions:")
    for planet, data in sbc_data['planets'].items():
        pos = data['grid_position']
        status = "R" if data['retrograde'] else "D"
        status += " C" if data['combust'] else ""
        print(f"{planet:8}: Grid ({pos[0]},{pos[1]}) {status}")

    # Print zone energies
    print("\nZone Energies:")
    for zone, energy in sbc_data['zone_energies'].items():
        print(f"{zone.capitalize():10}: {energy['average']:.2f}")


if __name__ == '__main__':
    main()
