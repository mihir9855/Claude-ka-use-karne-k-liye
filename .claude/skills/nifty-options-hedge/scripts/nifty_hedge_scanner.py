"""
Nifty Options Hedge Scanner - Portfolio Risk Assessment & Scanning

This module scans portfolios and NSE market conditions to identify optimal
hedging opportunities using 3-DTE put spreads. It provides real-time risk
assessment and automated hedge recommendations.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
import json
import pytz

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils
from shared.broker_factory import BrokerFactory
from nifty_hedge_detector import NiftyHedgeDetector, PortfolioMetrics, HedgeOpportunity


@dataclass
class PortfolioPosition:
    """Individual portfolio position"""
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    value: float
    weight: float
    beta: float
    sector: str


@dataclass
class PortfolioRiskProfile:
    """Complete portfolio risk assessment"""
    total_value: float
    positions: List[PortfolioPosition]
    metrics: PortfolioMetrics
    risk_factors: Dict
    hedge_recommendation: str
    timestamp: datetime


@dataclass
class MarketEnvironment:
    """Current market environment assessment"""
    vix: float
    nifty_spot: float
    weekly_change: float
    monthly_change: float
    trend: str
    volatility_regime: str
    days_to_expiry: int
    next_expiry: datetime


class NiftyHedgeScanner:
    """
    Portfolio scanner for Nifty options hedging opportunities

    Scans portfolio risk, assesses market conditions, and provides
    comprehensive hedging recommendations using 3-DTE put spreads.
    """

    def __init__(self):
        """Initialize the hedge scanner"""
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.detector = NiftyHedgeDetector()
        self.broker = BrokerFactory.create_broker()

        # IST timezone
        self.ist_tz = pytz.timezone('Asia/Kolkata')

        # Risk thresholds
        self.risk_thresholds = {
            'heat_level': 0.6,  # 60% heat triggers strong hedging
            'concentration': 0.25,  # 25% single position
            'beta': 1.2,  # Above 1.2x market beta
            'volatility': 0.25  # 25% annualized volatility
        }

    def scan_portfolio_positions(self, positions_data: List[Dict]) -> List[PortfolioPosition]:
        """
        Scan and analyze portfolio positions

        Args:
            positions_data: List of position dictionaries from broker

        Returns:
            List[PortfolioPosition]: Analyzed positions
        """
        positions = []

        for pos_data in positions_data:
            try:
                symbol = pos_data['symbol']
                quantity = pos_data['quantity']
                avg_price = pos_data['avg_price']

                # Get current price
                current_price = self.data_fetcher.get_current_price(symbol)
                if current_price is None:
                    continue

                value = quantity * current_price
                weight = 0  # Will be calculated after total value

                # Get beta and sector (simplified - would need more data)
                beta = self._get_stock_beta(symbol)
                sector = self._get_stock_sector(symbol)

                position = PortfolioPosition(
                    symbol=symbol,
                    quantity=quantity,
                    avg_price=avg_price,
                    current_price=current_price,
                    value=value,
                    weight=weight,
                    beta=beta,
                    sector=sector
                )

                positions.append(position)

            except KeyError as e:
                print(f"Missing data for position: {e}")
                continue

        # Calculate weights
        if positions:
            total_value = sum(p.value for p in positions)
            for pos in positions:
                pos.weight = pos.value / total_value

        return positions

    def assess_portfolio_risk(self, positions: List[PortfolioPosition],
                             total_value: float) -> PortfolioRiskProfile:
        """
        Comprehensive portfolio risk assessment

        Args:
            positions: Analyzed portfolio positions
            total_value: Total portfolio value

        Returns:
            PortfolioRiskProfile: Complete risk assessment
        """
        if not positions:
            return self._create_empty_risk_profile(total_value)

        # Calculate basic metrics
        weights = [p.weight for p in positions]
        betas = [p.beta for p in positions]
        values = [p.value for p in positions]

        # Portfolio beta (weighted average)
        portfolio_beta = sum(w * b for w, b in zip(weights, betas))

        # Concentration risk
        max_weight = max(weights) if weights else 0

        # Sector concentration
        sector_weights = {}
        for pos in positions:
            sector_weights[pos.sector] = sector_weights.get(pos.sector, 0) + pos.weight
        max_sector_weight = max(sector_weights.values()) if sector_weights else 0

        # Calculate returns (simplified - would need historical data)
        monthly_return = self._calculate_portfolio_return(positions, '1M')
        weekly_return = self._calculate_portfolio_return(positions, '1W')

        # Volatility assessment
        portfolio_volatility = self._calculate_portfolio_volatility(positions)

        # Heat level calculation
        heat_level = self._calculate_heat_level(monthly_return, portfolio_volatility)

        # Create metrics object
        metrics = PortfolioMetrics(
            total_value=total_value,
            monthly_return=monthly_return,
            beta=portfolio_beta,
            concentration=max_weight,
            volatility=portfolio_volatility,
            heat_level=heat_level
        )

        # Risk factors assessment
        risk_factors = {
            'concentration_risk': max_weight > self.risk_thresholds['concentration'],
            'beta_risk': portfolio_beta > self.risk_thresholds['beta'],
            'volatility_risk': portfolio_volatility > self.risk_thresholds['volatility'],
            'heat_risk': heat_level > self.risk_thresholds['heat_level'],
            'sector_concentration': max_sector_weight > 0.4,
            'weekly_performance': weekly_return,
            'monthly_performance': monthly_return,
            'max_position_weight': max_weight,
            'max_sector_weight': max_sector_weight
        }

        # Generate hedge recommendation
        hedge_recommendation = self._generate_hedge_recommendation(risk_factors, metrics)

        return PortfolioRiskProfile(
            total_value=total_value,
            positions=positions,
            metrics=metrics,
            risk_factors=risk_factors,
            hedge_recommendation=hedge_recommendation,
            timestamp=datetime.now(self.ist_tz)
        )

    def scan_market_environment(self) -> MarketEnvironment:
        """
        Scan current market environment

        Returns:
            MarketEnvironment: Current market assessment
        """
        # Get Nifty data
        nifty_data = self.data_fetcher.get_nifty_data()
        if nifty_data is None:
            return self._create_default_market_environment()

        spot_price = nifty_data.get('spot_price', 0)
        vix = nifty_data.get('vix', 20)

        # Calculate returns
        weekly_change = nifty_data.get('weekly_return', 0)
        monthly_change = nifty_data.get('monthly_return', 0)

        # Determine trend
        if weekly_change > 0.02:
            trend = "Strong Uptrend"
        elif weekly_change > 0:
            trend = "Moderate Uptrend"
        elif weekly_change > -0.02:
            trend = "Sideways"
        elif weekly_change > -0.05:
            trend = "Moderate Downtrend"
        else:
            trend = "Strong Downtrend"

        # Volatility regime
        if vix > 30:
            vol_regime = "High Volatility"
        elif vix > 20:
            vol_regime = "Moderate Volatility"
        else:
            vol_regime = "Low Volatility"

        # Expiry information
        next_expiry = self.market_utils.get_next_expiry()
        days_to_expiry = (next_expiry - datetime.now(self.ist_tz).date()).days

        return MarketEnvironment(
            vix=vix,
            nifty_spot=spot_price,
            weekly_change=weekly_change,
            monthly_change=monthly_change,
            trend=trend,
            volatility_regime=vol_regime,
            days_to_expiry=days_to_expiry,
            next_expiry=next_expiry
        )

    def scan_hedge_opportunities(self, risk_profile: PortfolioRiskProfile,
                                market_env: MarketEnvironment) -> List[HedgeOpportunity]:
        """
        Scan for optimal hedging opportunities

        Args:
            risk_profile: Portfolio risk assessment
            market_env: Current market environment

        Returns:
            List[HedgeOpportunity]: Ranked hedge opportunities
        """
        opportunities = []

        # Convert portfolio metrics for detector
        portfolio_data = {
            'total_value': risk_profile.total_value,
            'monthly_return': risk_profile.metrics.monthly_return,
            'beta': risk_profile.metrics.beta,
            'concentration': risk_profile.metrics.concentration,
            'volatility': risk_profile.metrics.volatility,
            'heat_level': risk_profile.metrics.heat_level
        }

        # Get hedge opportunity
        opportunity = self.detector.detect_hedge_opportunity(portfolio_data)

        if opportunity:
            opportunities.append(opportunity)

        return opportunities

    def generate_hedge_report(self, risk_profile: PortfolioRiskProfile,
                             market_env: MarketEnvironment,
                             opportunities: List[HedgeOpportunity]) -> Dict:
        """
        Generate comprehensive hedge report

        Args:
            risk_profile: Portfolio risk profile
            market_env: Market environment
            opportunities: Available hedge opportunities

        Returns:
            Dict: Complete hedge report
        """
        report = {
            'timestamp': datetime.now(self.ist_tz).isoformat(),
            'portfolio_summary': {
                'total_value': risk_profile.total_value,
                'position_count': len(risk_profile.positions),
                'beta': risk_profile.metrics.beta,
                'volatility': risk_profile.metrics.volatility,
                'heat_level': risk_profile.metrics.heat_level
            },
            'risk_assessment': {
                'overall_risk': self._calculate_overall_risk_score(risk_profile.risk_factors),
                'risk_factors': risk_profile.risk_factors,
                'recommendation': risk_profile.hedge_recommendation
            },
            'market_environment': {
                'vix': market_env.vix,
                'nifty_spot': market_env.nifty_spot,
                'trend': market_env.trend,
                'volatility_regime': market_env.volatility_regime,
                'days_to_expiry': market_env.days_to_expiry
            },
            'hedge_opportunities': []
        }

        # Add opportunities
        for opp in opportunities:
            opp_dict = opp.to_dict()
            opp_dict['recommendation'] = self.detector.get_hedge_recommendation(opp)
            report['hedge_opportunities'].append(opp_dict)

        # Sort opportunities by score
        report['hedge_opportunities'].sort(key=lambda x: x['score'], reverse=True)

        return report

    def execute_hedge_order(self, opportunity: HedgeOpportunity,
                           risk_profile: PortfolioRiskProfile) -> bool:
        """
        Execute hedge order through broker

        Args:
            opportunity: Hedge opportunity to execute
            risk_profile: Current portfolio risk profile

        Returns:
            bool: Success status
        """
        try:
            # Calculate position size
            hedge_value = opportunity.position_size_pct * risk_profile.total_value

            # Calculate number of spreads
            spread_cost = opportunity.spread_details['net_premium']
            num_spreads = int(hedge_value / (spread_cost * 50))  # 50 multiplier for Nifty

            if num_spreads < 1:
                print("Hedge position too small to execute")
                return False

            # Prepare order details
            order_details = {
                'symbol': 'NIFTY',
                'action': 'SELL',  # Sell spread
                'quantity': num_spreads,
                'price': spread_cost,
                'spread_details': opportunity.spread_details
            }

            # Execute through broker
            success = self.broker.place_hedge_order(order_details)

            if success:
                print(f"Successfully executed hedge: {num_spreads} spreads at ₹{spread_cost:.2f} each")
                return True
            else:
                print("Failed to execute hedge order")
                return False

        except Exception as e:
            print(f"Error executing hedge order: {e}")
            return False

    def _get_stock_beta(self, symbol: str) -> float:
        """Get stock beta (simplified implementation)"""
        # In real implementation, would calculate from historical data
        # For now, return market beta
        return 1.0

    def _get_stock_sector(self, symbol: str) -> str:
        """Get stock sector (simplified implementation)"""
        # In real implementation, would look up from database
        return "Unknown"

    def _calculate_portfolio_return(self, positions: List[PortfolioPosition],
                                   period: str) -> float:
        """Calculate portfolio return for given period (simplified)"""
        # In real implementation, would use historical price data
        return 0.0

    def _calculate_portfolio_volatility(self, positions: List[PortfolioPosition]) -> float:
        """Calculate portfolio volatility (simplified)"""
        # In real implementation, would use historical returns
        return 0.2

    def _calculate_heat_level(self, monthly_return: float, volatility: float) -> float:
        """Calculate portfolio heat level"""
        # Heat based on recent losses and volatility
        loss_heat = max(0, -monthly_return)  # Positive for losses
        vol_heat = volatility

        heat_level = (loss_heat * 0.7) + (vol_heat * 0.3)
        return min(1.0, heat_level)

    def _generate_hedge_recommendation(self, risk_factors: Dict,
                                      metrics: PortfolioMetrics) -> str:
        """Generate hedge recommendation based on risk factors"""
        high_risks = sum(1 for v in risk_factors.values() if isinstance(v, bool) and v)

        if high_risks >= 3 or metrics.heat_level > 0.7:
            return "URGENT: Implement maximum hedging - portfolio at high risk"
        elif high_risks >= 2 or metrics.heat_level > 0.5:
            return "HIGH PRIORITY: Strong hedging recommended"
        elif high_risks >= 1 or metrics.heat_level > 0.3:
            return "MODERATE: Consider hedging key risks"
        else:
            return "OPTIONAL: Monitor portfolio, light hedging if desired"

    def _calculate_overall_risk_score(self, risk_factors: Dict) -> float:
        """Calculate overall risk score (0-100)"""
        risk_score = 0

        # Boolean risk factors
        bool_risks = [k for k, v in risk_factors.items() if isinstance(v, bool) and v]
        risk_score += len(bool_risks) * 15

        # Heat level contribution
        heat_level = risk_factors.get('heat_level', 0)
        risk_score += heat_level * 30

        # Concentration risk
        concentration = risk_factors.get('max_position_weight', 0)
        risk_score += min(20, concentration * 80)

        return min(100, risk_score)

    def _create_empty_risk_profile(self, total_value: float) -> PortfolioRiskProfile:
        """Create empty risk profile for no positions"""
        metrics = PortfolioMetrics(total_value, 0, 1.0, 0, 0.2, 0)
        return PortfolioRiskProfile(
            total_value=total_value,
            positions=[],
            metrics=metrics,
            risk_factors={},
            hedge_recommendation="No positions to assess",
            timestamp=datetime.now(self.ist_tz)
        )

    def _create_default_market_environment(self) -> MarketEnvironment:
        """Create default market environment when data unavailable"""
        next_expiry = self.market_utils.get_next_expiry()
        days_to_expiry = (next_expiry - datetime.now(self.ist_tz).date()).days

        return MarketEnvironment(
            vix=20,
            nifty_spot=22000,
            weekly_change=0,
            monthly_change=0,
            trend="Unknown",
            volatility_regime="Moderate Volatility",
            days_to_expiry=days_to_expiry,
            next_expiry=next_expiry
        )


def main():
    """Main function for command-line usage"""
    scanner = NiftyHedgeScanner()

    # Example: Scan a sample portfolio
    sample_positions = [
        {
            'symbol': 'RELIANCE',
            'quantity': 100,
            'avg_price': 2500
        },
        {
            'symbol': 'TCS',
            'quantity': 50,
            'avg_price': 3200
        },
        {
            'symbol': 'HDFC',
            'quantity': 75,
            'avg_price': 1600
        }
    ]

    # Scan positions
    positions = scanner.scan_portfolio_positions(sample_positions)
    total_value = sum(p.value for p in positions)

    # Assess risk
    risk_profile = scanner.assess_portfolio_risk(positions, total_value)

    # Scan market
    market_env = scanner.scan_market_environment()

    # Find opportunities
    opportunities = scanner.scan_hedge_opportunities(risk_profile, market_env)

    # Generate report
    report = scanner.generate_hedge_report(risk_profile, market_env, opportunities)

    # Print summary
    print("=== Portfolio Risk Assessment ===")
    print(f"Total Value: ₹{total_value:,.0f}")
    print(f"Positions: {len(positions)}")
    print(f"Portfolio Beta: {risk_profile.metrics.beta:.2f}")
    print(f"Heat Level: {risk_profile.metrics.heat_level:.1%}")
    print(f"Risk Score: {report['risk_assessment']['overall_risk']:.1f}/100")
    print(f"Recommendation: {risk_profile.hedge_recommendation}")

    print("\n=== Market Environment ===")
    print(f"Nifty: {market_env.nifty_spot:.0f}")
    print(f"VIX: {market_env.vix:.1f}")
    print(f"Trend: {market_env.trend}")
    print(f"Days to Expiry: {market_env.days_to_expiry}")

    print("\n=== Hedge Opportunities ===")
    if opportunities:
        opp = opportunities[0]  # Best opportunity
        print(f"Score: {opp.score:.1f}/100 ({opp.grade.value})")
        print(f"Position Size: {opp.position_size_pct:.1%}")
        print(f"Spread: {opp.spread_details['short_strike']:.0f} PE / {opp.spread_details['long_strike']:.0f} PE")
        print(f"Premium: ₹{opp.spread_details['net_premium']:.2f}")
        print(f"Max Risk: ₹{opp.spread_details['max_risk']:.2f}")
        print(f"Recommendation: {scanner.detector.get_hedge_recommendation(opp)}")
    else:
        print("No suitable hedge opportunities found")

    # Save detailed report
    with open('hedge_report.json', 'w') as f:
        json.dump(report, f, indent=2, default=str)

    print("\nDetailed report saved to hedge_report.json")


if __name__ == "__main__":
    main()
