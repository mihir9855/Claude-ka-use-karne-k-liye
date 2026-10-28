#!/usr/bin/env python3
"""
Panchang Calculator - Vedic Market Analysis
Calculates traditional Hindu calendar elements for market timing
"""

import datetime
import math
from typing import Dict, Tuple, Optional
import pytz

# Constants for astronomical calculations
SIDEREAL_YEAR = 365.256363  # Days
TROPICAL_YEAR = 365.2425    # Days
SYNODIC_MONTH = 29.530588   # Days
NAKSHATRA_DURATION = 13.3333  # Degrees

class PanchangCalculator:
    """Calculates Panchang elements for market analysis"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')

    def calculate_panchang(self, date: datetime.datetime) -> Dict:
        """
        Calculate complete panchang for given date

        Args:
            date: Date for calculation (IST)

        Returns:
            Dictionary with all panchang elements
        """
        # Ensure IST timezone
        if date.tzinfo is None:
            date = self.ist_tz.localize(date)

        # Calculate lunar data
        lunar_data = self._calculate_lunar_data(date)

        # Calculate panchang elements
        panchang = {
            'date': date.strftime('%Y-%m-%d'),
            'tithi': self._calculate_tithi(lunar_data),
            'nakshatra': self._calculate_nakshatra(lunar_data),
            'yoga': self._calculate_yoga(lunar_data),
            'karana': self._calculate_karana(lunar_data),
            'vara': self._calculate_vara(date),
            'lunar_phase': lunar_data['phase'],
            'paksha': 'Shukla' if lunar_data['phase'] < 180 else 'Krishna',
            'market_bias': self._calculate_market_bias(lunar_data, date)
        }

        return panchang

    def _calculate_lunar_data(self, date: datetime.datetime) -> Dict:
        """
        Calculate lunar position and phase
        Using astronomical approximations for market analysis
        """
        # Reference new moon (approximate)
        reference_new_moon = datetime.datetime(2023, 1, 1, tzinfo=self.ist_tz)

        # Days since reference
        days_since = (date - reference_new_moon).total_seconds() / 86400

        # Lunar phase calculation (simplified)
        lunar_cycle_position = (days_since % SYNODIC_MONTH) / SYNODIC_MONTH * 360

        # Moon's mean longitude (simplified)
        moon_longitude = (lunar_cycle_position + 180) % 360

        return {
            'phase': lunar_cycle_position,  # 0-360 degrees
            'longitude': moon_longitude,
            'age': days_since % SYNODIC_MONTH
        }

    def _calculate_tithi(self, lunar_data: Dict) -> Dict:
        """Calculate lunar day (Tithi)"""
        phase = lunar_data['phase']

        # Tithi number (1-30)
        tithi_number = int(phase / 12) + 1
        if tithi_number > 30:
            tithi_number = 30

        # Tithi name
        tithi_names = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
            'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
            'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ]

        # Special case for Purnima/Amavasya
        if tithi_number == 15:
            tithi_name = 'Purnima' if lunar_data['phase'] < 180 else 'Amavasya'
        else:
            tithi_name = tithi_names[tithi_number - 1]

        # Market bias based on tithi
        market_bias = self._get_tithi_bias(tithi_number, lunar_data['phase'])

        return {
            'number': tithi_number,
            'name': tithi_name,
            'market_bias': market_bias,
            'energy_level': self._get_tithi_energy(tithi_number)
        }

    def _calculate_nakshatra(self, lunar_data: Dict) -> Dict:
        """Calculate lunar constellation (Nakshatra)"""
        moon_long = lunar_data['longitude']

        # Nakshatra number (1-27)
        nakshatra_number = int(moon_long / NAKSHATRA_DURATION) + 1
        if nakshatra_number > 27:
            nakshatra_number = nakshatra_number % 27 or 27

        # Nakshatra names
        nakshatra_names = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
            'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
            'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
            'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
            'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ]

        nakshatra_name = nakshatra_names[nakshatra_number - 1]

        # Market characteristics
        market_bias = self._get_nakshatra_bias(nakshatra_name)

        return {
            'number': nakshatra_number,
            'name': nakshatra_name,
            'market_bias': market_bias,
            'category': self._get_nakshatra_category(nakshatra_name)
        }

    def _calculate_yoga(self, lunar_data: Dict) -> Dict:
        """Calculate planetary combination (Yoga)"""
        # Simplified yoga calculation based on lunar position
        moon_long = lunar_data['longitude']

        # Yoga number (1-27)
        yoga_number = int((moon_long * 2) % 27) + 1

        yoga_names = [
            'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
            'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
            'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
            'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
            'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
        ]

        yoga_name = yoga_names[yoga_number - 1]

        # Market impact
        market_bias = self._get_yoga_bias(yoga_name)

        return {
            'number': yoga_number,
            'name': yoga_name,
            'market_bias': market_bias,
            'auspicious': yoga_name in ['Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra']
        }

    def _calculate_karana(self, lunar_data: Dict) -> Dict:
        """Calculate half lunar day (Karana)"""
        phase = lunar_data['phase']

        # Karana number (1-60, but cycle every 6)
        karana_number = int(phase / 6) % 10 + 1

        karana_names = [
            'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara',
            'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga'
        ]

        karana_name = karana_names[karana_number - 1]

        # Market impact
        market_bias = self._get_karana_bias(karana_name)

        return {
            'number': karana_number,
            'name': karana_name,
            'market_bias': market_bias,
            'auspicious': karana_name in ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
        }

    def _calculate_vara(self, date: datetime.datetime) -> Dict:
        """Calculate weekday (Vara)"""
        weekday_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                        'Thursday', 'Friday', 'Saturday']

        weekday_number = date.weekday()  # 0=Monday, 6=Sunday in Python
        # Adjust for traditional order (Sunday=0)
        traditional_number = (weekday_number + 1) % 7

        vara_name = weekday_names[traditional_number]

        # Market bias based on ruling planet
        market_bias = self._get_vara_bias(vara_name)

        return {
            'number': traditional_number + 1,
            'name': vara_name,
            'market_bias': market_bias,
            'ruling_planet': self._get_vara_planet(vara_name)
        }

    def _calculate_market_bias(self, lunar_data: Dict, date: datetime.datetime) -> Dict:
        """Calculate composite market bias from all panchang elements"""
        # Get individual biases
        tithi_bias = self._calculate_tithi(lunar_data)['market_bias']
        nakshatra_bias = self._calculate_nakshatra(lunar_data)['market_bias']
        yoga_bias = self._calculate_yoga(lunar_data)['market_bias']
        karana_bias = self._calculate_karana(lunar_data)['market_bias']
        vara_bias = self._calculate_vara(date)['market_bias']

        # Weighted composite score
        composite_score = (
            tithi_bias * 0.3 +
            nakshatra_bias * 0.3 +
            yoga_bias * 0.25 +
            karana_bias * 0.1 +
            vara_bias * 0.05
        )

        # Determine overall bias
        if composite_score >= 2:
            overall_bias = 'Extremely Bullish'
            confidence = 0.85
        elif composite_score >= 1:
            overall_bias = 'Bullish'
            confidence = 0.75
        elif composite_score >= -1:
            overall_bias = 'Neutral'
            confidence = 0.55
        elif composite_score >= -2:
            overall_bias = 'Bearish'
            confidence = 0.75
        else:
            overall_bias = 'Extremely Bearish'
            confidence = 0.85

        return {
            'composite_score': round(composite_score, 2),
            'overall_bias': overall_bias,
            'confidence': confidence,
            'components': {
                'tithi': tithi_bias,
                'nakshatra': nakshatra_bias,
                'yoga': yoga_bias,
                'karana': karana_bias,
                'vara': vara_bias
            }
        }

    # Helper methods for bias calculations
    def _get_tithi_bias(self, tithi_num: int, phase: float) -> float:
        """Get market bias for tithi"""
        bias_map = {
            1: 0, 2: 1, 3: 1, 4: 0.5, 5: 1.5, 6: 1, 7: 1.5, 8: 0, 9: 1,
            10: 1.5, 11: 0, 12: 1, 13: 0, 14: -1, 15: 2 if phase < 180 else -2
        }
        return bias_map.get(tithi_num, 0)

    def _get_nakshatra_bias(self, name: str) -> float:
        """Get market bias for nakshatra"""
        bias_map = {
            'Ashwini': 1, 'Bharani': -1, 'Krittika': 0, 'Rohini': 2,
            'Mrigashira': -0.5, 'Ardra': -1, 'Punarvasu': 0.5, 'Pushya': 1,
            'Ashlesha': -2, 'Magha': 0.5, 'Purva Phalguni': 1, 'Uttara Phalguni': 1,
            'Hasta': 1, 'Chitra': 1.5, 'Swati': 0.5, 'Vishakha': 1.5,
            'Anuradha': 1, 'Jyeshtha': 0.5, 'Mula': 0, 'Purva Ashadha': 1.5,
            'Uttara Ashadha': 1, 'Shravana': 1, 'Dhanishta': 1.5,
            'Shatabhisha': 1, 'Purva Bhadrapada': 0, 'Uttara Bhadrapada': 1, 'Revati': 1.5
        }
        return bias_map.get(name, 0)

    def _get_yoga_bias(self, name: str) -> float:
        """Get market bias for yoga"""
        bias_map = {
            'Siddha': 2, 'Sadhya': 1.5, 'Shubha': 1, 'Shukla': 1.5,
            'Brahma': 1.5, 'Indra': 2, 'Vaidhriti': -1.5, 'Vyatipata': -2,
            'Parigha': -1, 'Shakuni': -1.5
        }
        return bias_map.get(name, 0)

    def _get_karana_bias(self, name: str) -> float:
        """Get market bias for karana"""
        auspicious = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
        inauspicious = ['Shakuni', 'Chatushpada', 'Naga']
        if name in auspicious:
            return 0.5
        elif name in inauspicious:
            return -0.5
        return 0

    def _get_vara_bias(self, name: str) -> float:
        """Get market bias for weekday"""
        bias_map = {
            'Sunday': 1, 'Monday': 0.5, 'Tuesday': 0, 'Wednesday': 0.5,
            'Thursday': 1.5, 'Friday': 1, 'Saturday': 0.5
        }
        return bias_map.get(name, 0)

    def _get_tithi_energy(self, tithi_num: int) -> str:
        """Get energy level for tithi"""
        high_energy = [2, 3, 5, 7, 9, 10, 12, 15]
        low_energy = [4, 8, 11, 13, 14]
        if tithi_num in high_energy:
            return 'High'
        elif tithi_num in low_energy:
            return 'Low'
        return 'Medium'

    def _get_nakshatra_category(self, name: str) -> str:
        """Get category for nakshatra"""
        fixed = ['Rohini', 'Uttara Phalguni', 'Uttara Ashadha', 'Uttara Bhadrapada']
        sharp = ['Ashwini', 'Magha', 'Purva Phalguni', 'Purva Ashadha', 'Purva Bhadrapada']
        if name in fixed:
            return 'Fixed'
        elif name in sharp:
            return 'Sharp'
        return 'Mixed'

    def _get_vara_planet(self, name: str) -> str:
        """Get ruling planet for weekday"""
        planet_map = {
            'Sunday': 'Sun', 'Monday': 'Moon', 'Tuesday': 'Mars',
            'Wednesday': 'Mercury', 'Thursday': 'Jupiter', 'Friday': 'Venus',
            'Saturday': 'Saturn'
        }
        return planet_map.get(name, 'Unknown')


def main():
    """Example usage"""
    calculator = PanchangCalculator()

    # Calculate for today
    today = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    panchang = calculator.calculate_panchang(today)

    print(f"Panchang for {panchang['date']}:")
    print(f"Tithi: {panchang['tithi']['name']} (Bias: {panchang['tithi']['market_bias']})")
    print(f"Nakshatra: {panchang['nakshatra']['name']} (Bias: {panchang['nakshatra']['market_bias']})")
    print(f"Yoga: {panchang['yoga']['name']} (Bias: {panchang['yoga']['market_bias']})")
    print(f"Karana: {panchang['karana']['name']} (Bias: {panchang['karana']['market_bias']})")
    print(f"Vara: {panchang['vara']['name']} (Bias: {panchang['vara']['market_bias']})")
    print(f"Overall Market Bias: {panchang['market_bias']['overall_bias']} (Score: {panchang['market_bias']['composite_score']})")


if __name__ == '__main__':
    main()
