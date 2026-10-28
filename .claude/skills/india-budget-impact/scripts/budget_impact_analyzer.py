#!/usr/bin/env python3
"""
India Budget Impact Analyzer
Analyzes pre and post-budget impacts on Indian market sectors and stocks
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional, Any

class BudgetImpactAnalyzer:
    """Union Budget Impact Analysis Engine"""

    def __init__(self):
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.sector_exposure_map = self._load_sector_exposure_data()

    def _load_sector_exposure_data(self) -> Dict[str, Dict[str, float]]:
        """Load sector exposure data for different policy types"""
        return {
            'IT': {'corporate_tax': 0.35, 'gst': 0.15, 'customs': 0.25},
            'BANKING': {'corporate_tax': 0.30, 'infrastructure': 0.20, 'regulatory': 0.40},
            'PHARMA': {'corporate_tax': 0.25, 'customs': 0.30, 'healthcare': 0.35},
            'AUTO': {'corporate_tax': 0.20, 'customs': 0.25, 'infrastructure': 0.30},
            'FMCG': {'gst': 0.35, 'rural': 0.25, 'tax': 0.15},
            'CEMENT': {'infrastructure': 0.40, 'customs': 0.20, 'rural': 0.25},
            'CAPITAL_GOODS': {'infrastructure': 0.45, 'corporate_tax': 0.25},
            'FERTILIZERS': {'agriculture': 0.35, 'customs': 0.30, 'subsidies': 0.25}
        }

    def calculate_sector_exposure(self, sector: str, policy_changes: Dict[str, float]) -> Dict[str, Any]:
        """Calculate sector exposure to policy changes"""
        if sector not in self.sector_exposure_map:
            return {'exposure_score': 0.0, 'risk_level': 'UNKNOWN'}

        sector_data = self.sector_exposure_map[sector]
        exposure_score = 0.0

        for policy, impact in policy_changes.items():
            if policy in sector_data:
                exposure_score += sector_data[policy] * impact

        # Determine risk level
        if exposure_score > 0.25:
            risk_level = 'HIGH'
        elif exposure_score > 0.15:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'

        return {
            'exposure_score': exposure_score,
            'risk_level': risk_level,
            'affected_policies': [p for p in policy_changes.keys() if p in sector_data]
        }

    def analyze_portfolio_exposure(self, portfolio: Dict[str, float],
                                 policy_changes: Dict[str, float]) -> Dict[str, Any]:
        """Analyze portfolio exposure to budget policy changes"""
        total_exposure = 0.0
        sector_breakdown = {}
        high_risk_stocks = []

        for stock, weight in portfolio.items():
            sector = self._get_stock_sector(stock)
            exposure = self.calculate_sector_exposure(sector, policy_changes)

            sector_breakdown[sector] = sector_breakdown.get(sector, 0) + weight
            total_exposure += weight * exposure['exposure_score']

            if exposure['risk_level'] == 'HIGH':
                high_risk_stocks.append({
                    'stock': stock,
                    'sector': sector,
                    'exposure': exposure['exposure_score'],
                    'weight': weight
                })

        return {
            'total_exposure': total_exposure,
            'portfolio_risk_level': 'HIGH' if total_exposure > 0.20 else 'MEDIUM' if total_exposure > 0.10 else 'LOW',
            'sector_breakdown': sector_breakdown,
            'high_risk_stocks': high_risk_stocks,
            'recommendations': self._generate_recommendations(total_exposure, high_risk_stocks)
        }

    def _get_stock_sector(self, stock: str) -> str:
        """Get sector for a stock (simplified mapping)"""
        sector_map = {
            'RELIANCE': 'ENERGY',
            'TCS': 'IT',
            'HDFC': 'BANKING',
            'INFY': 'IT',
            'ICICIBANK': 'BANKING',
            'HINDUNILVR': 'FMCG',
            'ITC': 'FMCG',
            'KOTAKBANK': 'BANKING',
            'LT': 'CAPITAL_GOODS',
            'MARUTI': 'AUTO'
        }
        return sector_map.get(stock, 'UNKNOWN')

    def _generate_recommendations(self, total_exposure: float,
                                high_risk_stocks: List[Dict]) -> List[str]:
        """Generate trading recommendations based on exposure analysis"""
        recommendations = []

        if total_exposure > 0.25:
            recommendations.append("🔴 HIGH RISK: Reduce portfolio exposure by 40-50% before budget")
            recommendations.append("Consider hedging with Nifty options or moving to cash")
        elif total_exposure > 0.15:
            recommendations.append("🟡 MEDIUM RISK: Reduce exposure by 20-30% in high-risk stocks")
            recommendations.append("Monitor news flow closely and have contingency plans")

        if high_risk_stocks:
            recommendations.append(f"⚠️ High-risk stocks to monitor: {', '.join([s['stock'] for s in high_risk_stocks[:3]])}")

        recommendations.append("💡 Post-budget: Look for opportunities in beneficiary sectors")
        recommendations.append("📊 Track sector performance in first 2 hours post-announcement")

        return recommendations

    def analyze_historical_budget_impact(self, budget_year: int) -> Dict[str, Any]:
        """Analyze historical budget impact patterns"""
        # Simplified historical data
        historical_data = {
            2019: {
                'key_change': 'Corporate tax reduction (25% to 22%)',
                'winner_sectors': ['IT', 'BANKING', 'PHARMA'],
                'loser_sectors': [],
                'market_impact': '+2.5%',
                'volatility_days': 3
            },
            2020: {
                'key_change': 'COVID relief package',
                'winner_sectors': ['PHARMA', 'FMCG', 'IT'],
                'loser_sectors': ['AUTO', 'CEMENT'],
                'market_impact': '+1.8%',
                'volatility_days': 5
            },
            2021: {
                'key_change': 'Infrastructure focus (₹100 lakh crore)',
                'winner_sectors': ['CEMENT', 'CAPITAL_GOODS', 'STEEL'],
                'loser_sectors': [],
                'market_impact': '+3.2%',
                'volatility_days': 4
            }
        }

        return historical_data.get(budget_year, {
            'key_change': 'Unknown',
            'winner_sectors': [],
            'loser_sectors': [],
            'market_impact': 'Unknown',
            'volatility_days': 3
        })

# Example usage
if __name__ == "__main__":
    analyzer = BudgetImpactAnalyzer()

    # Sample policy changes
    policy_changes = {
        'corporate_tax': 0.8,  # 20% reduction
        'infrastructure': 1.2,  # 20% increase in spending
        'gst': 0.9  # 10% reduction
    }

    # Sample portfolio
    portfolio = {
        'TCS': 0.15,
        'INFY': 0.12,
        'HDFC': 0.10,
        'RELIANCE': 0.08,
        'ITC': 0.08
    }

    result = analyzer.analyze_portfolio_exposure(portfolio, policy_changes)
    print(f"Portfolio Risk Level: {result['portfolio_risk_level']}")
    print(f"Total Exposure Score: {result['total_exposure']:.3f}")
    print("\nRecommendations:")
    for rec in result['recommendations']:
        print(f"  {rec}")
