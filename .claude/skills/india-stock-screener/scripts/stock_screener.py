#!/usr/bin/env python3
"""
Stock Screener - India Stock Screener
Comprehensive quantitative stock screening for NSE-listed companies
"""

import datetime
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Callable
import json
from dataclasses import dataclass
from enum import Enum
import pytz

# Constants
NSE_STOCKS_URL = "https://www.nseindia.com/api/equity-stockIndices"
IST_TIMEZONE = pytz.timezone('Asia/Kolkata')

class ScreenType(Enum):
    VALUE = "value"
    GROWTH = "growth"
    QUALITY = "quality"
    MOMENTUM = "momentum"
    TECHNICAL = "technical"
    SECTOR_ROTATION = "sector_rotation"

@dataclass
class StockMetrics:
    """Container for stock fundamental and technical metrics"""
    symbol: str
    company_name: str
    sector: str
    market_cap: float

    # Fundamental metrics
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    debt_equity: Optional[float] = None
    eps_growth: Optional[float] = None
    revenue_growth: Optional[float] = None
    dividend_yield: Optional[float] = None

    # Quality scores
    altman_z_score: Optional[float] = None
    piotroski_score: Optional[int] = None
    beneish_m_score: Optional[float] = None

    # Technical metrics
    rsi_14: Optional[float] = None
    macd_signal: Optional[str] = None
    bollinger_position: Optional[float] = None
    momentum_1m: Optional[float] = None
    momentum_3m: Optional[float] = None
    volume_ratio: Optional[float] = None

    # Risk metrics
    beta: Optional[float] = None
    volatility_30d: Optional[float] = None
    max_drawdown: Optional[float] = None
    average_volume: Optional[float] = None

class StockScreener:
    """Advanced stock screener with multiple screening methodologies"""

    def __init__(self):
        self.stocks_data = []
        self.screen_templates = self._initialize_screen_templates()
        self.ist_tz = IST_TIMEZONE

    def load_stock_data(self, data_source: str = "demo") -> List[StockMetrics]:
        """
        Load stock data from various sources

        Args:
            data_source: Source of data ('demo', 'nse', 'csv')

        Returns:
            List of stock metrics
        """
        if data_source == "demo":
            return self._generate_demo_data()
        elif data_source == "nse":
            return self._fetch_nse_data()
        elif data_source == "csv":
            return self._load_csv_data()
        else:
            raise ValueError(f"Unsupported data source: {data_source}")

    def apply_screen(self, stocks: List[StockMetrics],
                    screen_type: ScreenType,
                    custom_filters: Optional[Dict] = None) -> List[Tuple[StockMetrics, float]]:
        """
        Apply screening criteria to stock universe

        Args:
            stocks: List of stock metrics
            screen_type: Type of screen to apply
            custom_filters: Additional custom filters

        Returns:
            List of (stock, score) tuples, sorted by score descending
        """
        template = self.screen_templates[screen_type]
        screened_stocks = []

        for stock in stocks:
            # Apply filters
            if self._passes_filters(stock, template['filters'], custom_filters):
                # Calculate composite score
                score = self._calculate_composite_score(stock, template['weights'])
                screened_stocks.append((stock, score))

        # Sort by score descending
        screened_stocks.sort(key=lambda x: x[1], reverse=True)
        return screened_stocks

    def create_custom_screen(self, name: str,
                           filters: Dict,
                           weights: Dict,
                           description: str = "") -> str:
        """
        Create a custom screening template

        Args:
            name: Name of the custom screen
            filters: Filter criteria dictionary
            weights: Scoring weights dictionary
            description: Optional description

        Returns:
            Screen ID for reference
        """
        screen_id = f"custom_{name.lower().replace(' ', '_')}"
        self.screen_templates[screen_id] = {
            'name': name,
            'description': description,
            'filters': filters,
            'weights': weights
        }
        return screen_id

    def sector_rotation_analysis(self, stocks: List[StockMetrics]) -> Dict:
        """
        Perform sector rotation analysis

        Args:
            stocks: List of stock metrics

        Returns:
            Sector analysis results
        """
        # Group stocks by sector
        sector_groups = {}
        for stock in stocks:
            if stock.sector not in sector_groups:
                sector_groups[stock.sector] = []
            sector_groups[stock.sector].append(stock)

        sector_analysis = {}

        for sector, sector_stocks in sector_groups.items():
            # Calculate sector metrics
            sector_metrics = self._calculate_sector_metrics(sector_stocks)
            sector_analysis[sector] = sector_metrics

        # Rank sectors
        ranked_sectors = sorted(sector_analysis.items(),
                              key=lambda x: x[1]['momentum_score'],
                              reverse=True)

        return {
            'sector_metrics': sector_analysis,
            'ranked_sectors': ranked_sectors,
            'rotation_signals': self._generate_rotation_signals(ranked_sectors)
        }

    def get_screen_results_dataframe(self, screened_stocks: List[Tuple[StockMetrics, float]],
                                   top_n: int = 50) -> pd.DataFrame:
        """
        Convert screening results to DataFrame

        Args:
            screened_stocks: List of (stock, score) tuples
            top_n: Number of top results to return

        Returns:
            DataFrame with screening results
        """
        results = []
        for stock, score in screened_stocks[:top_n]:
            result = {
                'Symbol': stock.symbol,
                'Company': stock.company_name,
                'Sector': stock.sector,
                'Market_Cap_Cr': round(stock.market_cap, 0),
                'PE_Ratio': stock.pe_ratio,
                'PB_Ratio': stock.pb_ratio,
                'ROE': stock.roe,
                'Debt_Equity': stock.debt_equity,
                'EPS_Growth': stock.eps_growth,
                'Revenue_Growth': stock.revenue_growth,
                'Dividend_Yield': stock.dividend_yield,
                'RSI_14': stock.rsi_14,
                'Momentum_1M': stock.momentum_1m,
                'Momentum_3M': stock.momentum_3m,
                'Beta': stock.beta,
                'Volatility_30D': stock.volatility_30d,
                'Composite_Score': round(score, 2)
            }
            results.append(result)

        return pd.DataFrame(results)

    def _initialize_screen_templates(self) -> Dict:
        """Initialize built-in screening templates"""
        return {
            ScreenType.VALUE: {
                'name': 'Deep Value Screen',
                'description': 'Identifies undervalued stocks with strong fundamentals',
                'filters': {
                    'market_cap': {'min': 1000},  # ₹1000 Cr minimum
                    'pe_ratio': {'max': 15},
                    'pb_ratio': {'max': 1.2},
                    'debt_equity': {'max': 0.4},
                    'roe': {'min': 15},
                    'dividend_yield': {'min': 2.5}
                },
                'weights': {
                    'pe_ratio': -0.2,  # Lower PE is better (negative weight)
                    'pb_ratio': -0.2,
                    'roe': 0.3,
                    'debt_equity': -0.1,
                    'dividend_yield': 0.2,
                    'piotroski_score': 0.2
                }
            },

            ScreenType.GROWTH: {
                'name': 'High Growth Screen',
                'description': 'Focuses on high-growth companies with strong momentum',
                'filters': {
                    'revenue_growth': {'min': 25},
                    'eps_growth': {'min': 30},
                    'market_cap': {'min': 5000},
                    'pe_ratio': {'max': 25}
                },
                'weights': {
                    'revenue_growth': 0.3,
                    'eps_growth': 0.3,
                    'momentum_1m': 0.2,
                    'momentum_3m': 0.2
                }
            },

            ScreenType.QUALITY: {
                'name': 'Quality Screen',
                'description': 'Identifies high-quality companies with strong balance sheets',
                'filters': {
                    'altman_z_score': {'min': 3.0},
                    'piotroski_score': {'min': 7},
                    'beneish_m_score': {'max': -2.0},
                    'roa': {'min': 8},
                    'debt_equity': {'max': 0.5}
                },
                'weights': {
                    'altman_z_score': 0.25,
                    'piotroski_score': 0.25,
                    'beneish_m_score': -0.2,  # Lower is better
                    'roa': 0.15,
                    'roe': 0.15
                }
            },

            ScreenType.MOMENTUM: {
                'name': 'Momentum Screen',
                'description': 'Captures stocks with strong recent performance',
                'filters': {
                    'momentum_1m': {'min': 10},
                    'momentum_3m': {'min': 15},
                    'rsi_14': {'max': 70},  # Not overbought
                    'volume_ratio': {'min': 1.2}
                },
                'weights': {
                    'momentum_1m': 0.3,
                    'momentum_3m': 0.3,
                    'rsi_14': 0.2,
                    'volume_ratio': 0.2
                }
            },

            ScreenType.TECHNICAL: {
                'name': 'Technical Breakout Screen',
                'description': 'Identifies stocks with technical breakout patterns',
                'filters': {
                    'rsi_14': {'min': 60},
                    'bollinger_position': {'min': 0.8},
                    'volume_ratio': {'min': 2.0},
                    'macd_signal': {'value': 'bullish'}
                },
                'weights': {
                    'rsi_14': 0.25,
                    'bollinger_position': 0.25,
                    'volume_ratio': 0.25,
                    'momentum_1m': 0.25
                }
            }
        }

    def _passes_filters(self, stock: StockMetrics,
                       filters: Dict,
                       custom_filters: Optional[Dict] = None) -> bool:
        """
        Check if stock passes all filter criteria

        Args:
            stock: Stock metrics
            filters: Filter criteria
            custom_filters: Additional filters

        Returns:
            True if stock passes all filters
        """
        all_filters = {**filters}
        if custom_filters:
            all_filters.update(custom_filters)

        for field, criteria in all_filters.items():
            value = getattr(stock, field, None)
            if value is None:
                continue  # Skip if data not available

            if 'min' in criteria and value < criteria['min']:
                return False
            if 'max' in criteria and value > criteria['max']:
                return False
            if 'value' in criteria and value != criteria['value']:
                return False

        return True

    def _calculate_composite_score(self, stock: StockMetrics, weights: Dict) -> float:
        """
        Calculate composite score based on weighted factors

        Args:
            stock: Stock metrics
            weights: Weight dictionary

        Returns:
            Composite score (0-100 scale)
        """
        score = 0
        total_weight = 0

        for field, weight in weights.items():
            value = getattr(stock, field, None)
            if value is not None:
                # Normalize value to 0-1 scale (simplified)
                normalized_value = self._normalize_value(field, value)
                score += normalized_value * abs(weight)
                total_weight += abs(weight)

        if total_weight == 0:
            return 0

        # Scale to 0-100
        return (score / total_weight) * 100

    def _normalize_value(self, field: str, value: float) -> float:
        """
        Normalize field value to 0-1 scale

        Args:
            field: Field name
            value: Raw value

        Returns:
            Normalized value (0-1)
        """
        # Field-specific normalization
        if field in ['pe_ratio', 'pb_ratio', 'debt_equity']:
            # Lower is better, inverse normalization
            return max(0, 1 - (value / 30))  # Assume 30x as neutral
        elif field in ['roe', 'roa', 'dividend_yield', 'eps_growth', 'revenue_growth']:
            # Higher is better
            return min(1, value / 50)  # Assume 50% as excellent
        elif field in ['rsi_14']:
            # 50 is neutral, 70 is overbought
            return min(1, value / 70)
        elif field in ['momentum_1m', 'momentum_3m']:
            # Normalize percentage returns
            return min(1, max(0, (value + 50) / 100))  # -50% to +50%
        elif field in ['altman_z_score']:
            return min(1, value / 5)  # 5+ is excellent
        elif field in ['piotroski_score']:
            return value / 9  # 0-9 scale
        elif field in ['beneish_m_score']:
            # Lower is better (more negative)
            return max(0, 1 + (value / 5))  # -5 to 0 range
        else:
            return 0.5  # Neutral for unknown fields

    def _calculate_sector_metrics(self, sector_stocks: List[StockMetrics]) -> Dict:
        """
        Calculate sector-level metrics

        Args:
            sector_stocks: List of stocks in sector

        Returns:
            Sector metrics dictionary
        """
        if not sector_stocks:
            return {}

        # Calculate weighted averages
        total_mcap = sum(stock.market_cap for stock in sector_stocks)

        metrics = {
            'stock_count': len(sector_stocks),
            'total_market_cap': total_mcap,
            'avg_pe': np.mean([s.pe_ratio for s in sector_stocks if s.pe_ratio]),
            'avg_pb': np.mean([s.pb_ratio for s in sector_stocks if s.pb_ratio]),
            'avg_roe': np.mean([s.roe for s in sector_stocks if s.roe]),
            'avg_debt_equity': np.mean([s.debt_equity for s in sector_stocks if s.debt_equity]),
            'avg_momentum_1m': np.mean([s.momentum_1m for s in sector_stocks if s.momentum_1m]),
            'avg_momentum_3m': np.mean([s.momentum_3m for s in sector_stocks if s.momentum_3m])
        }

        # Calculate momentum score
        momentum_1m = metrics['avg_momentum_1m'] or 0
        momentum_3m = metrics['avg_momentum_3m'] or 0
        metrics['momentum_score'] = (momentum_1m * 0.3) + (momentum_3m * 0.7)

        # Calculate quality score
        avg_roe = metrics['avg_roe'] or 0
        avg_debt_equity = metrics['avg_debt_equity'] or 1
        metrics['quality_score'] = (avg_roe / 20) - (avg_debt_equity / 2)

        return metrics

    def _generate_rotation_signals(self, ranked_sectors: List) -> Dict:
        """
        Generate sector rotation signals

        Args:
            ranked_sectors: List of (sector, metrics) tuples

        Returns:
            Rotation signals
        """
        if len(ranked_sectors) < 3:
            return {'signals': 'Insufficient data'}

        top_sector = ranked_sectors[0][0]
        bottom_sector = ranked_sectors[-1][0]

        signals = {
            'strong_buy': [s[0] for s in ranked_sectors[:2]],
            'buy': [s[0] for s in ranked_sectors[2:4]],
            'hold': [s[0] for s in ranked_sectors[4:-2]],
            'sell': [s[0] for s in ranked_sectors[-2:]],
            'strong_sell': []
        }

        return signals

    def _generate_demo_data(self) -> List[StockMetrics]:
        """Generate demo stock data for testing"""
        sectors = ['IT', 'Banking', 'FMCG', 'Pharma', 'Auto', 'Energy']
        companies = [
            ('RELIANCE', 'Reliance Industries', 'Energy', 1800000),
            ('TCS', 'Tata Consultancy Services', 'IT', 1200000),
            ('HDFCBANK', 'HDFC Bank', 'Banking', 850000),
            ('ICICIBANK', 'ICICI Bank', 'Banking', 650000),
            ('INFY', 'Infosys', 'IT', 600000),
            ('HINDUNILVR', 'Hindustan Unilever', 'FMCG', 550000),
            ('ITC', 'ITC Ltd', 'FMCG', 500000),
            ('KOTAKBANK', 'Kotak Mahindra Bank', 'Banking', 450000),
            ('LT', 'Larsen & Toubro', 'Construction', 400000),
            ('AXISBANK', 'Axis Bank', 'Banking', 350000),
            ('MARUTI', 'Maruti Suzuki', 'Auto', 300000),
            ('BAJFINANCE', 'Bajaj Finance', 'Finance', 400000),
            ('SUNPHARMA', 'Sun Pharmaceutical', 'Pharma', 250000),
            ('DRREDDY', 'Dr. Reddy\'s Laboratories', 'Pharma', 200000),
            ('POWERGRID', 'Power Grid Corporation', 'Utilities', 150000)
        ]

        stocks = []
        np.random.seed(42)  # For reproducible results

        for symbol, name, sector, mcap in companies:
            # Generate realistic metrics
            pe = np.random.uniform(10, 40) if np.random.random() > 0.1 else None
            pb = np.random.uniform(0.5, 5) if np.random.random() > 0.1 else None
            roe = np.random.uniform(5, 25) if np.random.random() > 0.1 else None
            debt_eq = np.random.uniform(0.1, 1.5) if np.random.random() > 0.1 else None
            eps_growth = np.random.uniform(-20, 50) if np.random.random() > 0.1 else None
            rev_growth = np.random.uniform(-10, 60) if np.random.random() > 0.1 else None
            div_yield = np.random.uniform(0.5, 5) if np.random.random() > 0.1 else None

            # Quality scores
            altman_z = np.random.uniform(1, 6) if np.random.random() > 0.2 else None
            piotroski = np.random.randint(0, 10) if np.random.random() > 0.2 else None
            beneish_m = np.random.uniform(-5, 1) if np.random.random() > 0.2 else None

            # Technical metrics
            rsi = np.random.uniform(20, 80) if np.random.random() > 0.1 else None
            momentum_1m = np.random.uniform(-30, 40) if np.random.random() > 0.1 else None
            momentum_3m = np.random.uniform(-25, 45) if np.random.random() > 0.1 else None
            volume_ratio = np.random.uniform(0.5, 3) if np.random.random() > 0.1 else None

            # Risk metrics
            beta = np.random.uniform(0.5, 1.8) if np.random.random() > 0.1 else None
            volatility = np.random.uniform(15, 45) if np.random.random() > 0.1 else None
            max_dd = np.random.uniform(5, 30) if np.random.random() > 0.1 else None
            avg_volume = np.random.uniform(50000, 5000000) if np.random.random() > 0.1 else None

            stock = StockMetrics(
                symbol=symbol,
                company_name=name,
                sector=sector,
                market_cap=mcap,
                pe_ratio=round(pe, 1) if pe else None,
                pb_ratio=round(pb, 1) if pb else None,
                roe=round(roe, 1) if roe else None,
                debt_equity=round(debt_eq, 2) if debt_eq else None,
                eps_growth=round(eps_growth, 1) if eps_growth else None,
                revenue_growth=round(rev_growth, 1) if rev_growth else None,
                dividend_yield=round(div_yield, 1) if div_yield else None,
                altman_z_score=round(altman_z, 1) if altman_z else None,
                piotroski_score=piotroski,
                beneish_m_score=round(beneish_m, 2) if beneish_m else None,
                rsi_14=round(rsi, 1) if rsi else None,
                momentum_1m=round(momentum_1m, 1) if momentum_1m else None,
                momentum_3m=round(momentum_3m, 1) if momentum_3m else None,
                volume_ratio=round(volume_ratio, 1) if volume_ratio else None,
                beta=round(beta, 2) if beta else None,
                volatility_30d=round(volatility, 1) if volatility else None,
                max_drawdown=round(max_dd, 1) if max_dd else None,
                average_volume=round(avg_volume, 0) if avg_volume else None
            )
            stocks.append(stock)

        return stocks

    def _fetch_nse_data(self) -> List[StockMetrics]:
        """Fetch real data from NSE (placeholder)"""
        # In real implementation, would fetch from NSE APIs
        print("NSE data fetching not implemented - using demo data")
        return self._generate_demo_data()

    def _load_csv_data(self) -> List[StockMetrics]:
        """Load data from CSV file (placeholder)"""
        print("CSV loading not implemented - using demo data")
        return self._generate_demo_data()


def main():
    """Example usage"""
    screener = StockScreener()

    # Load demo data
    stocks = screener.load_stock_data('demo')
    print(f"Loaded {len(stocks)} stocks")

    # Apply value screen
    value_stocks = screener.apply_screen(stocks, ScreenType.VALUE)
    print(f"\nValue Screen Results (Top 10):")
    value_df = screener.get_screen_results_dataframe(value_stocks, top_n=10)
    print(value_df.to_string(index=False))

    # Apply growth screen
    growth_stocks = screener.apply_screen(stocks, ScreenType.GROWTH)
    print(f"\nGrowth Screen Results (Top 10):")
    growth_df = screener.get_screen_results_dataframe(growth_stocks, top_n=10)
    print(growth_df.to_string(index=False))

    # Sector rotation analysis
    sector_analysis = screener.sector_rotation_analysis(stocks)
    print(f"\nSector Rotation Analysis:")
    print("Top Sectors by Momentum:")
    for sector, metrics in sector_analysis['ranked_sectors'][:5]:
        momentum = metrics['momentum_score']
        print(f"  {sector}: {momentum:.1f}")

    # Create custom screen
    custom_filters = {
        'market_cap': {'min': 10000},
        'roe': {'min': 15},
        'debt_equity': {'max': 0.5},
        'momentum_3m': {'min': 5}
    }

    custom_weights = {
        'roe': 0.4,
        'debt_equity': -0.2,
        'momentum_3m': 0.3,
        'pe_ratio': -0.1
    }

    custom_screen_id = screener.create_custom_screen(
        "Quality Momentum",
        custom_filters,
        custom_weights,
        "Combines quality fundamentals with momentum"
    )

    # Apply custom screen
    custom_stocks = screener.apply_screen(stocks, ScreenType(custom_screen_id))
    print(f"\nCustom Screen Results (Top 5):")
    custom_df = screener.get_screen_results_dataframe(custom_stocks, top_n=5)
    print(custom_df.to_string(index=False))


if __name__ == '__main__':
    main()
