"""
Black-Scholes Calculator for Indian Options
Calculates option prices and Greeks for NSE Nifty/BankNifty
"""

import math
from typing import Dict, List, Tuple
from scipy.stats import norm  # For cumulative normal distribution

# Indian market constants
RISK_FREE_RATE = 0.065  # 6.5% RBI repo rate
DIVIDEND_YIELD = {
    'NIFTY': 0.012,    # 1.2% dividend yield
    'BANKNIFTY': 0.021  # 2.1% dividend yield
}

def calculate_bs_price(S: float, K: float, T: float, r: float,
                      sigma: float, option_type: str) -> float:
    """
    Calculate Black-Scholes option price

    Args:
        S: Spot price
        K: Strike price
        T: Time to expiry (years)
        r: Risk-free rate
        sigma: Volatility
        option_type: 'call' or 'put'

    Returns:
        Option price
    """
    if T <= 0:
        # At expiry
        if option_type == 'call':
            return max(S - K, 0)
        else:
            return max(K - S, 0)

    d1 = (math.log(S/K) + (r + sigma**2/2)*T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)

    if option_type == 'call':
        price = S * math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.cdf(d1) - \
                K * math.exp(-r*T) * norm.cdf(d2)
    else:  # put
        price = K * math.exp(-r*T) * norm.cdf(-d2) - \
                S * math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.cdf(-d1)

    return round(price, 2)

def calculate_greeks(S: float, K: float, T: float, r: float,
                    sigma: float, option_type: str) -> Dict[str, float]:
    """
    Calculate option Greeks

    Args:
        Same as calculate_bs_price

    Returns:
        Dict with Delta, Gamma, Theta, Vega, Rho
    """
    if T <= 0:
        return {'delta': 0, 'gamma': 0, 'theta': 0, 'vega': 0, 'rho': 0}

    d1 = (math.log(S/K) + (r + sigma**2/2)*T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)

    # Delta
    if option_type == 'call':
        delta = math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.cdf(d1)
    else:
        delta = -math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.cdf(-d1)

    # Gamma (same for calls and puts)
    gamma = math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.pdf(d1) / (S * sigma * math.sqrt(T))

    # Theta
    if option_type == 'call':
        theta = -S * math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.pdf(d1) * sigma / (2 * math.sqrt(T)) \
                - r * K * math.exp(-r*T) * norm.cdf(d2)
    else:
        theta = -S * math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.pdf(d1) * sigma / (2 * math.sqrt(T)) \
                + r * K * math.exp(-r*T) * norm.cdf(-d2)

    # Vega (same for calls and puts)
    vega = S * math.exp(-DIVIDEND_YIELD.get('NIFTY', 0)*T) * norm.pdf(d1) * math.sqrt(T)

    # Rho
    if option_type == 'call':
        rho = K * T * math.exp(-r*T) * norm.cdf(d2)
    else:
        rho = -K * T * math.exp(-r*T) * norm.cdf(-d2)

    return {
        'delta': round(delta, 4),
        'gamma': round(gamma, 6),
        'theta': round(theta, 4),
        'vega': round(vega, 4),
        'rho': round(rho, 4)
    }

def calculate_iv(market_price: float, S: float, K: float, T: float,
                r: float, option_type: str, max_iter: int = 100) -> float:
    """
    Calculate implied volatility using Newton-Raphson

    Args:
        market_price: Observed option price
        Other parameters same as BS

    Returns:
        Implied volatility
    """
    sigma = 0.2  # Initial guess
    tolerance = 0.01

    for _ in range(max_iter):
        price = calculate_bs_price(S, K, T, r, sigma, option_type)
        greeks = calculate_greeks(S, K, T, r, sigma, option_type)

        if abs(price - market_price) < tolerance:
            break

        # Newton-Raphson update
        if greeks['vega'] != 0:
            sigma = sigma - (price - market_price) / greeks['vega']
            sigma = max(0.01, min(sigma, 2.0))  # Bound between 1% and 200%

    return round(sigma, 4)

def calculate_payoff(strategy_legs: List[Dict], spot_range: List[float]) -> List[Tuple[float, float]]:
    """
    Calculate payoff diagram for multi-leg strategy

    Args:
        strategy_legs: List of leg dicts with keys: type, strike, quantity, price
        spot_range: List of spot prices for x-axis

    Returns:
        List of (spot, payoff) tuples
    """
    payoffs = []

    for spot in spot_range:
        total_payoff = 0

        for leg in strategy_legs:
            option_type = leg['type']  # 'call' or 'put'
            strike = leg['strike']
            quantity = leg['quantity']
            premium = leg['price']

            # Intrinsic value
            if option_type == 'call':
                intrinsic = max(spot - strike, 0)
            else:
                intrinsic = max(strike - spot, 0)

            # Payoff = intrinsic - premium paid (or +premium received)
            leg_payoff = (intrinsic - premium) * quantity
            total_payoff += leg_payoff

        payoffs.append((spot, round(total_payoff, 2)))

    return payoffs

# Utility functions
def get_indian_rf_rate() -> float:
    """Get current Indian risk-free rate"""
    return RISK_FREE_RATE

def get_dividend_yield(index: str) -> float:
    """Get dividend yield for index"""
    return DIVIDEND_YIELD.get(index.upper(), 0.015)

def adjust_for_indian_market(price: float, index: str) -> float:
    """Apply Indian market adjustments to BS price"""
    # Adjustments for transaction costs, liquidity, etc.
    adjustment_factor = 1.02  # 2% adjustment for Indian market
    return price * adjustment_factor
