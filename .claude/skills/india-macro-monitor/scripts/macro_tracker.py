"""
India Macro Monitor - Macro Tracker

Tracks key Indian macroeconomic indicators and RBI policy for market insights.
Provides real-time macro health assessment and policy impact analysis.
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import pytz
from dataclasses import dataclass

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils


@dataclass
class MacroData:
    """Macro indicator data"""
    indicator: str
    value: float
    date: datetime
    change: float
    trend: str


class MacroTracker:
    """
    Macro tracker for Indian economic indicators and RBI policy
    """

    def __init__(self):
        """Initialize macro tracker"""
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.ist_tz = pytz.timezone('Asia/Kolkata')

        # RBI MPC meeting schedule
        self.mpc_dates = [
            "2024-02-08", "2024-04-05", "2024-06-07",
            "2024-08-09", "2024-10-04", "2024-12-06"
        ]

    def get_next_rbi_date(self) -> str:
        """
        Get next RBI MPC meeting date

        Returns:
            Next meeting date string
        """
        today = datetime.now(self.ist_tz).date()

        for date_str in self.mpc_dates:
            meeting_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            if meeting_date >= today:
                days_until = (meeting_date - today).days
                return f"{meeting_date.strftime('%B %d, %Y')} ({days_until} days)"

        return "No upcoming meetings scheduled"

    def get_latest_cpi(self) -> Optional[MacroData]:
        """
        Get latest CPI inflation data

        Returns:
            CPI data or None
        """
        try:
            # In real implementation, would scrape NSO website
            # Placeholder data
            cpi_value = 5.1
            prev_value = 4.9
            change = cpi_value - prev_value

            trend = "Rising" if change > 0 else "Falling"

            return MacroData(
                indicator="CPI Inflation",
                value=cpi_value,
                date=datetime.now(self.ist_tz),
                change=change,
                trend=trend
            )
        except Exception as e:
            print(f"Error fetching CPI: {e}")
            return None

    def get_crude_price(self) -> Optional[MacroData]:
        """
        Get current Brent crude oil price

        Returns:
            Crude price data or None
        """
        try:
            # In real implementation, would fetch from API
            # Placeholder data
            crude_price = 82.5
            prev_price = 81.2
            change = crude_price - prev_price

            trend = "Rising" if change > 0 else "Falling"

            return MacroData(
                indicator="Brent Crude",
                value=crude_price,
                date=datetime.now(self.ist_tz),
                change=change,
                trend=trend
            )
        except Exception as e:
            print(f"Error fetching crude price: {e}")
            return None

    def get_inr_usd(self) -> Optional[MacroData]:
        """
        Get current INR/USD exchange rate

        Returns:
            Exchange rate data or None
        """
        try:
            # In real implementation, would fetch from RBI API
            # Placeholder data
            inr_usd = 83.25
            prev_rate = 83.45
            change = inr_usd - prev_rate

            trend = "Weakening" if change > 0 else "Strengthening"

            return MacroData(
                indicator="INR/USD",
                value=inr_usd,
                date=datetime.now(self.ist_tz),
                change=change,
                trend=trend
            )
        except Exception as e:
            print(f"Error fetching INR/USD: {e}")
            return None

    def get_gst_collections(self) -> Optional[MacroData]:
        """
        Get latest GST collections data

        Returns:
            GST data or None
        """
        try:
            # In real implementation, would scrape CBIC website
            # Placeholder data (in crores)
            gst_value = 152000
            prev_value = 148000
            change = gst_value - prev_value

            trend = "Improving" if change > 0 else "Declining"

            return MacroData(
                indicator="GST Collections",
                value=gst_value,
                date=datetime.now(self.ist_tz),
                change=change,
                trend=trend
            )
        except Exception as e:
            print(f"Error fetching GST: {e}")
            return None

    def calculate_macro_score(self) -> float:
        """
        Calculate composite macro health score (0-100)

        Returns:
            Macro health score
        """
        score = 50  # Neutral starting point

        try:
            # CPI impact (20% weight)
            cpi = self.get_latest_cpi()
            if cpi:
                if 4 <= cpi.value <= 6:
                    score += 10  # RBI comfort zone
                elif cpi.value > 6:
                    score -= 15  # Hawkish pressure
                elif cpi.value < 4:
                    score += 5   # Dovish opportunity

            # Crude oil impact (15% weight)
            crude = self.get_crude_price()
            if crude:
                if crude.value < 70:
                    score += 7.5  # Low oil positive
                elif crude.value > 90:
                    score -= 11.25  # High oil negative

            # INR impact (15% weight)
            inr = self.get_inr_usd()
            if inr:
                if inr.value < 82:
                    score += 7.5  # Strong INR positive
                elif inr.value > 85:
                    score -= 11.25  # Weak INR mixed

            # GST impact (10% weight)
            gst = self.get_gst_collections()
            if gst:
                monthly_avg = 145000  # Approximate monthly average
                if gst.value > monthly_avg * 1.05:
                    score += 5  # Strong economy
                elif gst.value < monthly_avg * 0.95:
                    score -= 7.5  # Weak economy

            # RBI stance impact (40% weight) - simplified
            next_meeting = self.get_next_rbi_date()
            if "days" in next_meeting:
                days = int(next_meeting.split("(")[1].split()[0])
                if days < 30:
                    score += 20  # Dovish expectations
                elif days < 60:
                    score += 10  # Moderate expectations

        except Exception as e:
            print(f"Error calculating macro score: {e}")

        return max(0, min(100, score))

    def generate_macro_report(self) -> str:
        """
        Generate comprehensive macro analysis report

        Returns:
            Formatted markdown report
        """
        report = f"""# India Macro Monitor Report
**Date:** {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}

## RBI Policy Calendar
**Next MPC Meeting:** {self.get_next_rbi_date()}

## Key Indicators

"""

        # CPI Section
        cpi = self.get_latest_cpi()
        if cpi:
            report += f"### CPI Inflation: {cpi.value:.1f}%\n"
            report += f"- **Change:** {cpi.change:+.1f}%\n"
            report += f"- **Trend:** {cpi.trend}\n"
            report += f"- **RBI Target:** 4% ± 2%\n\n"

        # Crude Oil Section
        crude = self.get_crude_price()
        if crude:
            report += f"### Brent Crude: ${crude.value:.1f}/bbl\n"
            report += f"- **Change:** {crude.change:+.1f}/bbl\n"
            report += f"- **Trend:** {crude.trend}\n"
            report += f"- **India Impact:** 85% imported\n\n"

        # INR/USD Section
        inr = self.get_inr_usd()
        if inr:
            report += f"### INR/USD: ₹{inr.value:.2f}\n"
            report += f"- **Change:** {inr.change:+.2f}\n"
            report += f"- **Trend:** INR {inr.trend}\n"
            report += f"- **IT/Pharma Impact:** {'Positive' if inr.trend == 'Weakening' else 'Negative'}\n\n"

        # GST Section
        gst = self.get_gst_collections()
        if gst:
            report += f"### GST Collections: ₹{gst.value:,.0f} crores\n"
            report += f"- **Change:** ₹{gst.change:,.0f} crores\n"
            report += f"- **Trend:** {gst.trend}\n"
            report += f"- **Economic Health:** {'Strong' if gst.trend == 'Improving' else 'Weak'}\n\n"

        # Macro Score
        macro_score = self.calculate_macro_score()
        score_grade = "Bullish" if macro_score > 70 else "Bearish" if macro_score < 30 else "Neutral"

        report += f"## Macro Health Score: {macro_score:.1f}/100 ({score_grade})\n\n"

        # Market Implications
        report += "## Market Implications\n\n"

        if macro_score > 70:
            report += "- **Bullish Environment**: Rate cut expectations, cyclicals favored\n"
            report += "- **Sector Focus**: Banks, Auto, Realty\n"
            report += "- **Risk**: Inflation surprises\n"
        elif macro_score < 30:
            report += "- **Bearish Environment**: Hawkish pressures, defensives preferred\n"
            report += "- **Sector Focus**: FMCG, Pharma, IT\n"
            report += "- **Risk**: Growth slowdown\n"
        else:
            report += "- **Neutral Environment**: Data-dependent, balanced approach\n"
            report += "- **Sector Focus**: Mixed, quality stocks\n"
            report += "- **Risk**: Policy uncertainty\n"

        return report


# Main execution
if __name__ == "__main__":
    tracker = MacroTracker()
    report = tracker.generate_macro_report()
    print(report)
