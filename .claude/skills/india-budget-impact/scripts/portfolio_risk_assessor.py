#!/usr/bin/env python3
"""
Portfolio Risk Assessor
Assesses portfolio risk exposure to budget policy changes
"""

import pandas as pd
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any, Tuple

class PortfolioRiskAssessor:
    """Assess portfolio risk exposure to budget policy changes"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.risk_factors = self._initialize_risk_factors()

    def _initialize_risk_factors(self) -> Dict[str, Dict[str, float]]:
        """Initialize risk factors for different asset classes"""
        return {
            'EQUITY_LARGE_CAP': {
                'market_volatility': 0.8,
                'policy_sensitivity': 0.6,
                'liquidity_risk': 0.2,
                'currency_risk': 0.3
            },
            'EQUITY_MID_CAP': {
                'market_volatility': 1.0,
                'policy_sensitivity': 0.8,
                'liquidity_risk': 0.4,
                'currency_risk': 0.3
            },
            'EQUITY_SMALL_CAP': {
                'market_volatility': 1.2,
                'policy_sensitivity': 1.0,
                'liquidity_risk': 0.6,
                'currency_risk': 0.4
            },
            'BANKING_STOCKS': {
                'market_volatility': 0.9,
                'policy_sensitivity': 0.9,
                'liquidity_risk': 0.3,
                'regulatory_risk': 0.8
            },
            'IT_STOCKS': {
                'market_volatility': 0.7,
                'policy_sensitivity': 0.5,
                'liquidity_risk': 0.2,
                'currency_risk': 0.6
            },
            'PSU_STOCKS': {
                'market_volatility': 1.1,
                'policy_sensitivity': 1.0,
                'liquidity_risk': 0.5,
                'policy_risk': 0.9
            },
            'INFRASTRUCTURE': {
                'market_volatility': 1.0,
                'policy_sensitivity': 0.9,
                'liquidity_risk': 0.7,
                'execution_risk': 0.8
            }
        }

    def assess_portfolio_risk(self, portfolio: Dict[str, float],
                            budget_timeline: str = 'pre_budget') -> Dict[str, Any]:
        """
        Assess portfolio risk given budget timeline

        Args:
            portfolio: Dict of asset_class -> weight (0-1)
            budget_timeline: 'pre_budget', 'budget_day', 'post_budget'
        """
        if not self._validate_portfolio(portfolio):
            return {'error': 'Invalid portfolio weights'}

        risk_multiplier = self._get_timeline_multiplier(budget_timeline)
        total_risk_score = 0.0
        risk_breakdown = {}
        recommendations = []

        for asset_class, weight in portfolio.items():
            if asset_class not in self.risk_factors:
                continue

            asset_risk = self.risk_factors[asset_class]
            base_risk = sum(asset_risk.values()) / len(asset_risk)
            adjusted_risk = base_risk * risk_multiplier * weight

            total_risk_score += adjusted_risk
            risk_breakdown[asset_class] = {
                'weight': weight,
                'base_risk': round(base_risk, 3),
                'adjusted_risk': round(adjusted_risk, 3),
                'contribution': round(adjusted_risk, 3)
            }

        # Generate risk category and recommendations
        risk_category, risk_recommendations = self._categorize_risk(total_risk_score)

        return {
            'total_risk_score': round(total_risk_score, 3),
            'risk_category': risk_category,
            'timeline': budget_timeline,
            'risk_breakdown': risk_breakdown,
            'recommendations': risk_recommendations,
            'assessment_date': datetime.now(self.ist_tz).strftime('%Y-%m-%d %H:%M IST')
        }

    def _validate_portfolio(self, portfolio: Dict[str, float]) -> bool:
        """Validate portfolio weights"""
        total_weight = sum(portfolio.values())
        return abs(total_weight - 1.0) < 0.01  # Allow small rounding errors

    def _get_timeline_multiplier(self, timeline: str) -> float:
        """Get risk multiplier based on budget timeline"""
        multipliers = {
            'pre_budget': 1.5,    # 2-3 weeks before: High uncertainty
            'budget_day': 2.0,    # Budget day: Maximum volatility
            'post_budget': 0.7    # Post-budget: Clarity emerges
        }
        return multipliers.get(timeline, 1.0)

    def _categorize_risk(self, risk_score: float) -> Tuple[str, List[str]]:
        """Categorize risk level and provide recommendations"""
        if risk_score > 1.5:
            category = 'CRITICAL'
            recommendations = [
                'Reduce portfolio exposure by 30-50%',
                'Shift to defensive sectors (IT, FMCG)',
                'Consider hedging with options',
                'Monitor news closely 24/7'
            ]
        elif risk_score > 1.0:
            category = 'HIGH'
            recommendations = [
                'Reduce portfolio exposure by 20-30%',
                'Avoid leveraged positions',
                'Book profits in volatile stocks',
                'Have stop-loss orders ready'
            ]
        elif risk_score > 0.7:
            category = 'MEDIUM'
            recommendations = [
                'Reduce exposure by 10-20%',
                'Focus on large-cap defensive stocks',
                'Avoid small/mid-cap exposure',
                'Monitor sector-specific news'
            ]
        else:
            category = 'LOW'
            recommendations = [
                'Normal portfolio positioning',
                'Look for buying opportunities',
                'Focus on fundamentally strong stocks',
                'Maintain regular investment discipline'
            ]

        return category, recommendations

    def generate_risk_report(self, portfolio: Dict[str, float],
                           timeline: str = 'pre_budget') -> str:
        """Generate a formatted risk assessment report"""
        assessment = self.assess_portfolio_risk(portfolio, timeline)

        if 'error' in assessment:
            return f"❌ Error: {assessment['error']}"

        report = []
        report.append("⚠️ Portfolio Risk Assessment - Budget Impact")
        report.append(f"Timeline: {timeline.replace('_', ' ').title()}")
        report.append(f"Assessment Date: {assessment['assessment_date']}")
        report.append("")

        report.append(f"🎯 Risk Score: {assessment['total_risk_score']:.2f}")
        report.append(f"📊 Risk Category: {assessment['risk_category']}")
        report.append("")

        report.append("📈 Risk Breakdown by Asset Class:")
        for asset_class, details in assessment['risk_breakdown'].items():
            report.append(f"• {asset_class.replace('_', ' ')} ({details['weight']:.1%}):")
            report.append(f"  Risk contribution: {details['contribution']:.3f}")
        report.append("")

        report.append("💡 Recommendations:")
        for rec in assessment['recommendations']:
            report.append(f"• {rec}")
        report.append("")

        report.append("📅 Budget Timeline Guide:")
        report.append("• Pre-budget (2-3 weeks): High uncertainty, reduce exposure")
        report.append("• Budget day: Maximum volatility, minimal positions")
        report.append("• Post-budget: Clarity emerges, position accordingly")

        return "\n".join(report)

    def compare_scenarios(self, portfolio: Dict[str, float]) -> Dict[str, Any]:
        """Compare risk across different budget timelines"""
        scenarios = ['pre_budget', 'budget_day', 'post_budget']
        results = {}

        for scenario in scenarios:
            assessment = self.assess_portfolio_risk(portfolio, scenario)
            results[scenario] = {
                'risk_score': assessment['total_risk_score'],
                'category': assessment['risk_category']
            }

        # Find best and worst scenarios
        sorted_scenarios = sorted(results.items(), key=lambda x: x[1]['risk_score'])

        return {
            'scenario_comparison': results,
            'lowest_risk': sorted_scenarios[0][0],
            'highest_risk': sorted_scenarios[-1][0],
            'risk_range': round(sorted_scenarios[-1][1]['risk_score'] - sorted_scenarios[0][1]['risk_score'], 3)
        }

# Example usage
if __name__ == "__main__":
    assessor = PortfolioRiskAssessor()

    # Sample portfolio
    portfolio = {
        'EQUITY_LARGE_CAP': 0.4,
        'BANKING_STOCKS': 0.2,
        'IT_STOCKS': 0.2,
        'INFRASTRUCTURE': 0.1,
        'EQUITY_MID_CAP': 0.1
    }

    report = assessor.generate_risk_report(portfolio, 'pre_budget')
    print(report)

    print("\n" + "="*50 + "\n")

    comparison = assessor.compare_scenarios(portfolio)
    print("📊 Scenario Comparison:")
    for scenario, data in comparison['scenario_comparison'].items():
        print(f"• {scenario.replace('_', ' ').title()}: {data['risk_score']:.2f} ({data['category']})")
    print(f"• Lowest risk: {comparison['lowest_risk'].replace('_', ' ').title()}")
    print(f"• Highest risk: {comparison['highest_risk'].replace('_', ' ').title()}")
