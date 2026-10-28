"""
Nifty Options Hedge Detector - Core Hedging Logic

This module provides the core functionality for detecting optimal hedging opportunities
using 3-DTE put spreads on Nifty options. It implements the comprehensive scoring
system and risk assessment algorithms for portfolio protection.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
import pytz

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils
from shared.broker_factory import BrokerFactory


class HedgeGrade(Enum):
    """Hedge opportunity quality grades"""
    A_PLUS = "A+"
    A = "A"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B = "B"
    C = "C"


@dataclass
class PortfolioMetrics:
    """Portfolio risk and exposure metrics"""
    total_value: float
    monthly_return: float
    beta: float
    concentration: float  # Largest position %
    volatility: float
    heat_level: float  # 0-1 scale


@dataclass
class MarketConditions:
    """Current market environment data"""
    vix: float
    weekly_return: float
    trend_strength: float
    days_to_expiry: int


@dataclass
class OptionsStructure:
    """Options spread characteristics"""
    strike_otm_pct: float
    spread_width: float
    liquidity_score: float
    premium_to_risk: float


@dataclass
class RiskRewardMetrics:
    """Risk-reward assessment"""
    net_delta: float
    theta_daily: float
    premium_efficiency: float


@dataclass
class HedgeOpportunity:
    """Complete hedge opportunity assessment"""
    symbol: str
    score: float
    grade: HedgeGrade
    position_size_pct: float
    spread_details: Dict
    risk_metrics: Dict
    timestamp: datetime

    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        return {
            'symbol': self.symbol,
            'score': self.score,
            'grade': self.grade.value,
            'position_size_pct': self.position_size_pct,
            'spread_details': self.spread_details,
            'risk_metrics': self.risk_metrics,
            'timestamp': self.timestamp.isoformat()
        }


class NiftyHedgeDetector:
    """
    Core detector for Nifty options hedging opportunities

    Implements comprehensive scoring system for 3-DTE put spread hedging
    based on portfolio risk, market conditions, and options structure.
    """

    def __init__(self):
        """Initialize the hedge detector"""
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.broker = BrokerFactory.create_broker()

        # Scoring weights
        self.weights = {
            'portfolio_risk': 0.30,
            'market_conditions': 0.25,
            'options_structure': 0.25,
            'risk_reward': 0.20
        }

        # IST timezone
        self.ist_tz = pytz.timezone('Asia/Kolkata')

    def assess_portfolio_risk(self, portfolio_data: Dict) -> float:
        """
        Assess portfolio risk factors (0-30 points)

        Args:
            portfolio_data: Portfolio metrics and positions

        Returns:
            float: Portfolio risk score
        """
        score = 0

        # Heat level (0-12 points)
        monthly_return = portfolio_data.get('monthly_return', 0)
        if monthly_return <= -0.20:
            score += 12
        elif monthly_return <= -0.15:
            score += 10
        elif monthly_return <= -0.10:
            score += 8
        elif monthly_return <= -0.05:
            score += 6
        elif monthly_return <= -0.02:
            score += 4
        elif monthly_return <= 0:
            score += 2
        # Positive returns = 0 points

        # Volatility exposure (0-10 points)
        beta = portfolio_data.get('beta', 1.0)
        if beta > 1.5:
            score += 10
        elif beta > 1.2:
            score += 8
        elif beta > 1.0:
            score += 6
        elif beta > 0.8:
            score += 4
        elif beta > 0.5:
            score += 2
        # Low beta = 0 points

        # Position concentration (0-8 points)
        concentration = portfolio_data.get('concentration', 0)
        if concentration > 0.30:
            score += 8
        elif concentration > 0.20:
            score += 6
        elif concentration > 0.10:
            score += 4
        elif concentration > 0.05:
            score += 2
        # Well diversified = 0 points

        return min(30, max(0, score))

    def assess_market_conditions(self, market_data: Dict) -> float:
        """
        Assess market conditions (0-25 points)

        Args:
            market_data: Current market data

        Returns:
            float: Market conditions score
        """
        score = 0

        # VIX level (0-10 points)
        vix = market_data.get('vix', 20)
        if vix > 35:
            score += 10
        elif vix > 30:
            score += 8
        elif vix > 25:
            score += 6
        elif vix > 20:
            score += 4
        elif vix > 15:
            score += 2
        # Low VIX = 0 points

        # Market trend (0-8 points)
        weekly_return = market_data.get('weekly_return', 0)
        if weekly_return <= -0.05:
            score += 8
        elif weekly_return <= -0.02:
            score += 6
        elif weekly_return >= -0.02 and weekly_return <= 0.02:
            score += 4
        elif weekly_return <= 0.05:
            score += 2
        # Strong uptrend = 0 points

        # Time to expiry (0-7 points)
        dte = market_data.get('days_to_expiry', 3)
        if dte == 3:
            score += 7
        elif dte == 4:
            score += 5
        elif dte == 2:
            score += 3
        elif dte == 5:
            score += 1
        # Other DTE = 0 points

        return min(25, max(0, score))

    def assess_options_structure(self, options_data: Dict, market_data: Dict) -> float:
        """
        Assess options structure quality (0-25 points)

        Args:
            options_data: Options chain data
            market_data: Market data for context

        Returns:
            float: Options structure score
        """
        score = 0

        # Strike selection (0-10 points)
        otm_pct = options_data.get('strike_otm_pct', 0.05)
        if 0.06 <= otm_pct <= 0.08:
            score += 10
        elif 0.04 <= otm_pct <= 0.06 or 0.08 <= otm_pct <= 0.10:
            score += 8
        elif 0.02 <= otm_pct <= 0.04 or 0.10 <= otm_pct <= 0.12:
            score += 6
        elif 0 <= otm_pct <= 0.02:
            score += 4
        elif otm_pct > 0.12:
            score += 2
        # ATM strikes = 0 points

        # Spread width (0-8 points)
        width = options_data.get('spread_width', 250)
        if 250 <= width <= 300:
            score += 8
        elif 200 <= width <= 250 or 300 <= width <= 400:
            score += 6
        elif 150 <= width <= 200 or 400 <= width <= 500:
            score += 4
        elif 100 <= width <= 150:
            score += 2
        # Too wide = 0 points

        # Liquidity assessment (0-7 points)
        oi_long = options_data.get('oi_long', 0)
        oi_short = options_data.get('oi_short', 0)
        if oi_long > 10000 and oi_short > 10000:
            score += 7
        elif oi_long > 5000 and oi_short > 5000:
            score += 5
        elif (oi_long > 10000 and oi_short > 5000) or (oi_long > 5000 and oi_short > 10000):
            score += 3
        elif oi_long > 1000 and oi_short > 1000:
            score += 1
        # Illiquid = 0 points

        return min(25, max(0, score))

    def assess_risk_reward(self, options_data: Dict) -> float:
        """
        Assess risk-reward metrics (0-20 points)

        Args:
            options_data: Options Greeks and pricing

        Returns:
            float: Risk-reward score
        """
        score = 0

        # Premium-to-risk ratio (0-10 points)
        premium_risk_ratio = options_data.get('premium_to_risk', 0.2)
        if premium_risk_ratio > 0.5:
            score += 10
        elif premium_risk_ratio > 0.4:
            score += 8
        elif premium_risk_ratio > 0.3:
            score += 6
        elif premium_risk_ratio > 0.2:
            score += 4
        elif premium_risk_ratio > 0.1:
            score += 2
        # Poor ratio = 0 points

        # Delta exposure (0-6 points)
        net_delta = abs(options_data.get('net_delta', 0))
        if 0.15 <= net_delta <= 0.25:
            score += 6
        elif 0.10 <= net_delta <= 0.15 or 0.25 <= net_delta <= 0.30:
            score += 4
        elif 0.05 <= net_delta <= 0.10 or 0.30 <= net_delta <= 0.40:
            score += 2
        # Poor delta = 0 points

        # Theta generation (0-4 points)
        theta_efficiency = options_data.get('theta_efficiency', 0.2)
        if theta_efficiency > 0.5:
            score += 4
        elif theta_efficiency > 0.3:
            score += 3
        elif theta_efficiency > 0.1:
            score += 2
        elif theta_efficiency > 0:
            score += 1
        # Negative theta = 0 points

        return min(20, max(0, score))

    def calculate_hedge_score(self, portfolio_data: Dict, market_data: Dict,
                             options_data: Dict) -> Tuple[float, Dict]:
        """
        Calculate comprehensive hedge score

        Args:
            portfolio_data: Portfolio metrics
            market_data: Market conditions
            options_data: Options structure data

        Returns:
            tuple: (total_score, breakdown_dict)
        """
        breakdown = {}

        # Calculate component scores
        breakdown['portfolio_risk'] = self.assess_portfolio_risk(portfolio_data)
        breakdown['market_conditions'] = self.assess_market_conditions(market_data)
        breakdown['options_structure'] = self.assess_options_structure(options_data, market_data)
        breakdown['risk_reward'] = self.assess_risk_reward(options_data)

        # Calculate weighted total
        total_score = (
            breakdown['portfolio_risk'] * self.weights['portfolio_risk'] +
            breakdown['market_conditions'] * self.weights['market_conditions'] +
            breakdown['options_structure'] * self.weights['options_structure'] +
            breakdown['risk_reward'] * self.weights['risk_reward']
        )

        # Scale to 0-100
        total_score = min(100, max(0, total_score))

        return total_score, breakdown

    def determine_hedge_grade(self, score: float) -> HedgeGrade:
        """
        Determine hedge grade from score

        Args:
            score: Total hedge score

        Returns:
            HedgeGrade: Quality grade
        """
        if score >= 90:
            return HedgeGrade.A_PLUS
        elif score >= 80:
            return HedgeGrade.A
        elif score >= 70:
            return HedgeGrade.A_MINUS
        elif score >= 60:
            return HedgeGrade.B_PLUS
        elif score >= 50:
            return HedgeGrade.B
        else:
            return HedgeGrade.C

    def calculate_position_size(self, score: float, grade: HedgeGrade,
                               portfolio_data: Dict) -> float:
        """
        Calculate optimal position size

        Args:
            score: Hedge score
            grade: Hedge grade
            portfolio_data: Portfolio information

        Returns:
            float: Position size as percentage of portfolio
        """
        # Base sizes by grade
        base_sizes = {
            HedgeGrade.A_PLUS: 0.03,
            HedgeGrade.A: 0.025,
            HedgeGrade.A_MINUS: 0.02,
            HedgeGrade.B_PLUS: 0.015,
            HedgeGrade.B: 0.01,
            HedgeGrade.C: 0.005
        }

        base_size = base_sizes[grade]

        # Portfolio heat adjustment
        heat_level = portfolio_data.get('heat_level', 0)
        heat_multiplier = 1 + (heat_level * 0.5)

        # Volatility adjustment
        volatility = portfolio_data.get('volatility', 0.2)
        vol_multiplier = 1 + (volatility * 0.3)

        # Account size adjustment
        account_size = portfolio_data.get('total_value', 1000000)
        if account_size > 5000000:  # >50L
            size_multiplier = 1.2
        elif account_size > 1000000:  # >10L
            size_multiplier = 1.0
        else:
            size_multiplier = 0.8

        # Calculate final size
        final_size = base_size * heat_multiplier * vol_multiplier * size_multiplier

        # Ensure reasonable bounds
        return max(0.005, min(0.05, final_size))

    def find_optimal_spread(self, spot_price: float, options_chain: pd.DataFrame,
                           target_otm_pct: float = 0.07) -> Optional[Dict]:
        """
        Find optimal put spread for hedging

        Args:
            spot_price: Current Nifty spot price
            options_chain: Options chain data
            target_otm_pct: Target OTM percentage

        Returns:
            dict: Optimal spread details or None
        """
        try:
            # Target strikes
            target_strike = spot_price * (1 - target_otm_pct)

            # Find nearest strikes
            put_options = options_chain[options_chain['option_type'] == 'PE'].copy()
            put_options['strike_distance'] = abs(put_options['strike'] - target_strike)
            put_options = put_options.sort_values('strike_distance')

            if len(put_options) < 2:
                return None

            # Select two nearest OTM puts
            short_strike = put_options.iloc[0]['strike']
            long_strike = put_options.iloc[1]['strike']

            # Ensure proper spread (short strike > long strike for puts)
            if short_strike < long_strike:
                short_strike, long_strike = long_strike, short_strike

            # Get option details
            short_option = put_options[put_options['strike'] == short_strike].iloc[0]
            long_option = put_options[put_options['strike'] == long_strike].iloc[0]

            # Calculate spread metrics
            spread_width = short_strike - long_strike
            premium_received = short_option['bid'] - long_option['ask']
            max_risk = spread_width - premium_received

            if max_risk <= 0:
                return None

            premium_to_risk = premium_received / max_risk

            return {
                'short_strike': short_strike,
                'long_strike': long_strike,
                'short_premium': short_option['bid'],
                'long_premium': long_option['ask'],
                'net_premium': premium_received,
                'max_risk': max_risk,
                'spread_width': spread_width,
                'premium_to_risk': premium_to_risk,
                'strike_otm_pct': (spot_price - short_strike) / spot_price,
                'oi_long': long_option.get('oi', 0),
                'oi_short': short_option.get('oi', 0),
                'net_delta': short_option.get('delta', 0) - long_option.get('delta', 0),
                'theta_daily': short_option.get('theta', 0) - long_option.get('theta', 0),
                'theta_efficiency': abs(short_option.get('theta', 0) - long_option.get('theta', 0)) / premium_received if premium_received > 0 else 0
            }

        except Exception as e:
            print(f"Error finding optimal spread: {e}")
            return None

    def detect_hedge_opportunity(self, portfolio_data: Dict) -> Optional[HedgeOpportunity]:
        """
        Detect optimal hedging opportunity

        Args:
            portfolio_data: Current portfolio metrics

        Returns:
            HedgeOpportunity: Complete opportunity assessment or None
        """
        try:
            # Get current market data
            market_data = self.data_fetcher.get_nifty_data()
            if market_data is None:
                return None

            # Get options chain
            options_chain = self.data_fetcher.get_nifty_options_chain()
            if options_chain is None or options_chain.empty:
                return None

            # Find optimal spread
            spot_price = market_data['spot_price']
            spread_details = self.find_optimal_spread(spot_price, options_chain)

            if spread_details is None:
                return None

            # Prepare assessment data
            assessment_market = {
                'vix': market_data.get('vix', 20),
                'weekly_return': market_data.get('weekly_return', 0),
                'days_to_expiry': 3  # 3-DTE focus
            }

            # Calculate score
            total_score, breakdown = self.calculate_hedge_score(
                portfolio_data, assessment_market, spread_details
            )

            # Determine grade and size
            grade = self.determine_hedge_grade(total_score)
            position_size_pct = self.calculate_position_size(
                total_score, grade, portfolio_data
            )

            # Risk metrics
            risk_metrics = {
                'max_loss': spread_details['max_risk'],
                'premium_received': spread_details['net_premium'],
                'break_even': spread_details['short_strike'] - spread_details['net_premium'],
                'delta_hedge': spread_details['net_delta'],
                'theta_daily': spread_details['theta_daily'],
                'score_breakdown': breakdown
            }

            return HedgeOpportunity(
                symbol='NIFTY',
                score=total_score,
                grade=grade,
                position_size_pct=position_size_pct,
                spread_details=spread_details,
                risk_metrics=risk_metrics,
                timestamp=datetime.now(self.ist_tz)
            )

        except Exception as e:
            print(f"Error detecting hedge opportunity: {e}")
            return None

    def get_hedge_recommendation(self, opportunity: HedgeOpportunity) -> str:
        """
        Generate hedge recommendation text

        Args:
            opportunity: Hedge opportunity

        Returns:
            str: Recommendation text
        """
        if opportunity.grade in [HedgeGrade.A_PLUS, HedgeGrade.A]:
            return f"Strong hedge opportunity. Consider {opportunity.position_size_pct:.1%} portfolio allocation."
        elif opportunity.grade == HedgeGrade.A_MINUS:
            return f"Good hedge opportunity. Allocate {opportunity.position_size_pct:.1%} of portfolio."
        elif opportunity.grade in [HedgeGrade.B_PLUS, HedgeGrade.B]:
            return f"Moderate hedge opportunity. Consider {opportunity.position_size_pct:.1%} allocation."
        else:
            return f"Poor hedge setup. Consider smaller {opportunity.position_size_pct:.1%} allocation only if needed."


# Utility functions for external use
def calculate_portfolio_metrics(positions: List[Dict], total_value: float) -> PortfolioMetrics:
    """
    Calculate portfolio risk metrics

    Args:
        positions: List of position dictionaries
        total_value: Total portfolio value

    Returns:
        PortfolioMetrics: Calculated metrics
    """
    if not positions:
        return PortfolioMetrics(total_value, 0, 1.0, 0, 0.2, 0)

    # Calculate concentration
    position_values = [p.get('value', 0) for p in positions]
    concentration = max(position_values) / total_value if position_values else 0

    # Calculate beta (simplified - would need historical data)
    beta = 1.0  # Placeholder

    # Calculate volatility (simplified)
    volatility = 0.2  # Placeholder

    # Heat level based on recent performance
    monthly_return = 0  # Would need historical data

    return PortfolioMetrics(
        total_value=total_value,
        monthly_return=monthly_return,
        beta=beta,
        concentration=concentration,
        volatility=volatility,
        heat_level=max(0, min(1, -monthly_return * 5))  # Scale negative returns
    )


if __name__ == "__main__":
    # Example usage
    detector = NiftyHedgeDetector()

    # Sample portfolio data
    portfolio_data = {
        'total_value': 2000000,  # 20L portfolio
        'monthly_return': -0.12,  # 12% loss
        'beta': 1.3,
        'concentration': 0.25,  # 25% in single stock
        'volatility': 0.25,
        'heat_level': 0.6
    }

    opportunity = detector.detect_hedge_opportunity(portfolio_data)

    if opportunity:
        print(f"Hedge Opportunity Detected:")
        print(f"Score: {opportunity.score:.1f}/100")
        print(f"Grade: {opportunity.grade.value}")
        print(f"Position Size: {opportunity.position_size_pct:.1%}")
        print(f"Spread: {opportunity.spread_details['short_strike']} PE / {opportunity.spread_details['long_strike']} PE")
        print(f"Premium: ₹{opportunity.spread_details['net_premium']:.2f}")
        print(f"Max Risk: ₹{opportunity.spread_details['max_risk']:.2f}")
        print(f"Recommendation: {detector.get_hedge_recommendation(opportunity)}")
    else:
        print("No suitable hedge opportunity found.")
