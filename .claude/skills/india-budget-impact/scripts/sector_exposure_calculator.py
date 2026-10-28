#!/usr/bin/env python3
"""
Sector Exposure Calculator
Calculates sector-wise exposure to budget policy changes
"""

import pandas as pd
from datetime import datetime
import pytz
from typing import Dict, List, Optional, Any

class SectorExposureCalculator:
    """Calculate sector exposure to budget policy changes"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.sector_sensitivity = self._load_sector_sensitivity()

    def _load_sector_sensitivity(self) -> Dict[str, Dict[str, float]]:
        """Load sector sensitivity to different policy types"""
        return {
            'INFORMATION_TECHNOLOGY': {
                'corporate_tax': 0.35,
                'service_exports': 0.25,
                'digital_incentives': 0.20,
                'customs_duty': 0.15
            },
            'BANKING_FINANCIAL_SERVICES': {
                'corporate_tax': 0.30,
                'regulatory_changes': 0.25,
                'infrastructure_funding': 0.20,
                'digital_banking': 0.15
            },
            'PHARMACEUTICALS': {
                'corporate_tax': 0.25,
                'r_and_d_incentives': 0.25,
                'customs_duty_api': 0.30,
                'healthcare_spending': 0.20
            },
            'AUTOMOBILE': {
                'corporate_tax': 0.20,
                'customs_duty_components': 0.25,
                'ev_incentives': 0.30,
                'infrastructure': 0.15
            },
            'CONSUMER_GOODS_FMCG': {
                'gst_rates': 0.35,
                'rural_spending': 0.25,
                'income_tax_changes': 0.15,
                'agricultural_policies': 0.10
            },
            'CEMENT_CONSTRUCTION': {
                'infrastructure_spending': 0.40,
                'rural_housing': 0.25,
                'customs_duty': 0.15,
                'corporate_tax': 0.10
            },
            'CAPITAL_GOODS': {
                'infrastructure_investment': 0.45,
                'corporate_tax': 0.25,
                'manufacturing_incentives': 0.20,
                'power_sector': 0.10
            },
            'FERTILIZERS_AGRICULTURE': {
                'agricultural_subsidies': 0.35,
                'customs_duty_imports': 0.30,
                'rural_development': 0.25,
                'corporate_tax': 0.10
            }
        }

    def calculate_sector_exposure(self, sector: str,
                                policy_impacts: Dict[str, float]) -> Dict[str, Any]:
        """Calculate exposure score for a sector given policy impacts"""
        if sector not in self.sector_sensitivity:
            return {
                'exposure_score': 0.0,
                'risk_category': 'UNKNOWN',
                'primary_drivers': [],
                'recommendation': 'Monitor for indirect impacts'
            }

        sector_data = self.sector_sensitivity[sector]
        exposure_score = 0.0
        primary_drivers = []

        for policy, impact in policy_impacts.items():
            if policy in sector_data:
                contribution = sector_data[policy] * impact
                exposure_score += contribution
                if contribution > 0.05:  # Significant impact
                    primary_drivers.append(f"{policy} ({contribution:.2f})")

        # Categorize risk
        if exposure_score > 0.30:
            risk_category = 'CRITICAL'
            recommendation = 'Reduce exposure 2-3 weeks before budget'
        elif exposure_score > 0.20:
            risk_category = 'HIGH'
            recommendation = 'Reduce exposure 1-2 weeks before budget'
        elif exposure_score > 0.10:
            risk_category = 'MEDIUM'
            recommendation = 'Monitor closely, prepare contingency plans'
        else:
            risk_category = 'LOW'
            recommendation = 'Normal positioning, look for opportunities'

        return {
            'exposure_score': round(exposure_score, 3),
            'risk_category': risk_category,
            'primary_drivers': primary_drivers,
            'recommendation': recommendation,
            'sector': sector
        }

    def analyze_multiple_sectors(self, sectors: List[str],
                               policy_impacts: Dict[str, float]) -> Dict[str, Any]:
        """Analyze exposure for multiple sectors"""
        results = {}
        summary = {'CRITICAL': [], 'HIGH': [], 'MEDIUM': [], 'LOW': []}

        for sector in sectors:
            exposure = self.calculate_sector_exposure(sector, policy_impacts)
            results[sector] = exposure
            summary[exposure['risk_category']].append(sector)

        # Sort results by exposure score
        sorted_results = dict(sorted(results.items(),
                                   key=lambda x: x[1]['exposure_score'],
                                   reverse=True))

        return {
            'sector_analysis': sorted_results,
            'risk_summary': summary,
            'total_sectors_analyzed': len(sectors),
            'high_risk_count': len(summary['CRITICAL']) + len(summary['HIGH'])
        }

    def get_policy_impact_templates(self) -> Dict[str, Dict[str, float]]:
        """Get predefined policy impact scenarios"""
        return {
            'corporate_tax_cut': {
                'corporate_tax': -0.20,  # 20% reduction
                'service_exports': 0.10   # Positive for IT exports
            },
            'infrastructure_push': {
                'infrastructure_spending': 0.30,
                'infrastructure_investment': 0.25,
                'rural_housing': 0.20
            },
            'gst_rationalization': {
                'gst_rates': -0.15,  # Rate reductions
                'customs_duty': 0.10  # Some increases to compensate
            },
            'agriculture_focus': {
                'agricultural_subsidies': 0.25,
                'rural_spending': 0.20,
                'rural_development': 0.15
            },
            'digital_economy': {
                'digital_incentives': 0.30,
                'digital_banking': 0.20,
                'r_and_d_incentives': 0.15
            }
        }

    def generate_pre_budget_report(self, sectors: List[str],
                                 policy_scenario: str) -> str:
        """Generate a formatted pre-budget exposure report"""
        templates = self.get_policy_impact_templates()
        policy_impacts = templates.get(policy_scenario, {})

        if not policy_impacts:
            return "❌ Invalid policy scenario"

        analysis = self.analyze_multiple_sectors(sectors, policy_impacts)

        report = []
        report.append("📊 Pre-Budget Sector Exposure Analysis")
        report.append(f"Scenario: {policy_scenario.replace('_', ' ').title()}")
        report.append(f"Generated: {datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')}")
        report.append("")

        # Critical and High Risk Sectors
        high_risk = analysis['risk_summary']['CRITICAL'] + analysis['risk_summary']['HIGH']
        if high_risk:
            report.append("🔴 HIGH/CRITICAL RISK SECTORS:")
            for sector in high_risk:
                exposure = analysis['sector_analysis'][sector]
                report.append(f"• {sector.replace('_', ' ')}: {exposure['exposure_score']:.2f} exposure")
                report.append(f"  → {exposure['recommendation']}")
            report.append("")

        # Medium Risk Sectors
        medium_risk = analysis['risk_summary']['MEDIUM']
        if medium_risk:
            report.append("🟡 MEDIUM RISK SECTORS:")
            for sector in medium_risk:
                exposure = analysis['sector_analysis'][sector]
                report.append(f"• {sector.replace('_', ' ')}: {exposure['exposure_score']:.2f} exposure")
                report.append(f"  → {exposure['recommendation']}")
            report.append("")

        # Low Risk Sectors
        low_risk = analysis['risk_summary']['LOW']
        if low_risk:
            report.append("🟢 LOW RISK SECTORS:")
            for sector in low_risk:
                report.append(f"• {sector.replace('_', ' ')}: Safe haven option")
            report.append("")

        # Summary
        report.append("📈 SUMMARY:")
        report.append(f"• Total sectors analyzed: {analysis['total_sectors_analyzed']}")
        report.append(f"• High/critical risk sectors: {analysis['high_risk_count']}")
        report.append("• Recommendation: Reduce exposure to high-risk sectors 1-2 weeks before budget")

        return "\n".join(report)

# Example usage
if __name__ == "__main__":
    calculator = SectorExposureCalculator()

    sectors = [
        'INFORMATION_TECHNOLOGY',
        'BANKING_FINANCIAL_SERVICES',
        'PHARMACEUTICALS',
        'AUTOMOBILE',
        'CONSUMER_GOODS_FMCG'
    ]

    report = calculator.generate_pre_budget_report(sectors, 'corporate_tax_cut')
    print(report)
