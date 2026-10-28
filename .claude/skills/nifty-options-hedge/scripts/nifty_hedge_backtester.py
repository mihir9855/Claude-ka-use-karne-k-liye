"""
Nifty Options Hedge Backtester - Historical Strategy Testing

This module provides comprehensive backtesting capabilities for the Nifty Options
Hedge strategy, testing 3-DTE put spread hedging effectiveness across different
market conditions and portfolio scenarios.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Tuple
from enum import Enum
import json
import pytz
from concurrent.futures import ThreadPoolExecutor, as_completed

from shared.nse_data_fetcher import NSEDataFetcher
from shared.indian_market_utils import IndianMarketUtils
from shared.backtest_engine import BacktestEngine
from nifty_hedge_detector import NiftyHedgeDetector, HedgeGrade, HedgeOpportunity


@dataclass
class BacktestTrade:
    """Individual backtest trade record"""
    entry_date: date
    exit_date: date
    entry_price: float
    exit_price: float
    spread_details: Dict
    pnl: float
    pnl_pct: float
    max_drawdown: float
    holding_period: int
    market_condition: str
    portfolio_heat: float
    hedge_score: float
    hedge_grade: str


@dataclass
class BacktestResult:
    """Complete backtest result"""
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_pnl: float
    total_pnl_pct: float
    avg_trade_pnl: float
    avg_trade_pnl_pct: float
    max_drawdown: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    profit_factor: float
    recovery_factor: float
    trades: List[BacktestTrade]
    monthly_returns: Dict[str, float]
    drawdown_periods: List[Dict]


@dataclass
class BacktestConfig:
    """Backtesting configuration"""
    start_date: date
    end_date: date
    initial_capital: float
    max_position_size_pct: float
    min_hedge_score: float
    max_heat_level: float
    rebalance_frequency: str  # 'daily', 'weekly', 'monthly'
    commission_per_trade: float
    slippage_pct: float
    include_transaction_costs: bool


class NiftyHedgeBacktester:
    """
    Backtester for Nifty Options Hedge strategy

    Tests the effectiveness of 3-DTE put spread hedging across historical
    market conditions, providing comprehensive performance metrics.
    """

    def __init__(self):
        """Initialize the backtester"""
        self.data_fetcher = NSEDataFetcher()
        self.market_utils = IndianMarketUtils()
        self.detector = NiftyHedgeDetector()
        self.backtest_engine = None  # Not used in this implementation

        # IST timezone
        self.ist_tz = pytz.timezone('Asia/Kolkata')

        # Default configuration
        self.default_config = BacktestConfig(
            start_date=date(2020, 1, 1),
            end_date=date.today(),
            initial_capital=1000000,  # 10L
            max_position_size_pct=0.05,  # 5%
            min_hedge_score=50,  # Minimum score to trade
            max_heat_level=1.0,  # Maximum heat level
            rebalance_frequency='weekly',
            commission_per_trade=100,  # ₹100 per trade
            slippage_pct=0.001,  # 0.1%
            include_transaction_costs=True
        )

    def run_backtest(self, config: Optional[BacktestConfig] = None) -> BacktestResult:
        """
        Run comprehensive backtest

        Args:
            config: Backtest configuration

        Returns:
            BacktestResult: Complete backtest results
        """
        if config is None:
            config = self.default_config

        print(f"Running backtest from {config.start_date} to {config.end_date}")

        # Get historical data
        historical_data = self._get_historical_data(config.start_date, config.end_date)
        if historical_data.empty:
            return self._create_empty_result()

        # Generate portfolio scenarios
        portfolio_scenarios = self._generate_portfolio_scenarios()

        # Run backtest for each scenario
        all_trades = []
        for scenario in portfolio_scenarios:
            scenario_trades = self._backtest_scenario(historical_data, scenario, config)
            all_trades.extend(scenario_trades)

        # Calculate results
        result = self._calculate_backtest_results(all_trades, config)

        return result

    def run_scenario_analysis(self, base_config: BacktestConfig,
                             parameter_ranges: Dict) -> Dict[str, BacktestResult]:
        """
        Run sensitivity analysis across different parameters

        Args:
            base_config: Base configuration
            parameter_ranges: Parameter ranges to test

        Returns:
            Dict[str, BacktestResult]: Results for each parameter combination
        """
        results = {}

        # Test different minimum scores
        if 'min_hedge_score' in parameter_ranges:
            for score in parameter_ranges['min_hedge_score']:
                config = BacktestConfig(**base_config.__dict__)
                config.min_hedge_score = score
                results[f'score_{score}'] = self.run_backtest(config)

        # Test different position sizes
        if 'max_position_size_pct' in parameter_ranges:
            for size_pct in parameter_ranges['max_position_size_pct']:
                config = BacktestConfig(**base_config.__dict__)
                config.max_position_size_pct = size_pct
                results[f'size_{size_pct:.0%}'] = self.run_backtest(config)

        # Test different heat levels
        if 'max_heat_level' in parameter_ranges:
            for heat in parameter_ranges['max_heat_level']:
                config = BacktestConfig(**base_config.__dict__)
                config.max_heat_level = heat
                results[f'heat_{heat:.1f}'] = self.run_backtest(config)

        return results

    def run_market_regime_analysis(self, config: BacktestConfig) -> Dict[str, BacktestResult]:
        """
        Analyze performance across different market regimes

        Args:
            config: Backtest configuration

        Returns:
            Dict[str, BacktestResult]: Results by market regime
        """
        # Get historical data
        historical_data = self._get_historical_data(config.start_date, config.end_date)

        # Identify market regimes
        regimes = self._identify_market_regimes(historical_data)

        results = {}
        for regime_name, regime_data in regimes.items():
            regime_config = BacktestConfig(**config.__dict__)
            regime_config.start_date = regime_data['start_date']
            regime_config.end_date = regime_data['end_date']

            results[regime_name] = self.run_backtest(regime_config)

        return results

    def _get_historical_data(self, start_date: date, end_date: date) -> pd.DataFrame:
        """
        Get historical Nifty and options data

        Args:
            start_date: Start date
            end_date: End date

        Returns:
            pd.DataFrame: Historical data
        """
        try:
            # Get Nifty historical data
            nifty_data = self.data_fetcher.get_nifty_historical_data(start_date, end_date)

            if nifty_data is None or nifty_data.empty:
                print("No historical Nifty data available")
                return pd.DataFrame()

            # Add derived columns
            nifty_data['returns'] = nifty_data['close'].pct_change()
            nifty_data['volatility_20d'] = nifty_data['returns'].rolling(20).std() * np.sqrt(252)
            nifty_data['weekly_return'] = nifty_data['close'].pct_change(5)
            nifty_data['monthly_return'] = nifty_data['close'].pct_change(21)

            # Add VIX (simplified - would need actual VIX data)
            nifty_data['vix'] = self._estimate_vix(nifty_data)

            return nifty_data

        except Exception as e:
            print(f"Error getting historical data: {e}")
            return pd.DataFrame()

    def _generate_portfolio_scenarios(self) -> List[Dict]:
        """
        Generate different portfolio scenarios for testing

        Returns:
            List[Dict]: Portfolio scenarios
        """
        scenarios = [
            {
                'name': 'Conservative',
                'beta': 0.8,
                'concentration': 0.15,
                'volatility': 0.15
            },
            {
                'name': 'Moderate',
                'beta': 1.0,
                'concentration': 0.20,
                'volatility': 0.20
            },
            {
                'name': 'Aggressive',
                'beta': 1.3,
                'concentration': 0.30,
                'volatility': 0.30
            },
            {
                'name': 'High_Risk',
                'beta': 1.5,
                'concentration': 0.40,
                'volatility': 0.35
            }
        ]

        return scenarios

    def _backtest_scenario(self, historical_data: pd.DataFrame,
                          portfolio_scenario: Dict, config: BacktestConfig) -> List[BacktestTrade]:
        """
        Backtest single portfolio scenario

        Args:
            historical_data: Historical market data
            portfolio_scenario: Portfolio characteristics
            config: Backtest configuration

        Returns:
            List[BacktestTrade]: Trades for this scenario
        """
        trades = []

        # Get rebalance dates
        rebalance_dates = self._get_rebalance_dates(historical_data, config)

        for entry_date in rebalance_dates:
            try:
                # Simulate portfolio state on entry date
                portfolio_state = self._simulate_portfolio_state(
                    entry_date, historical_data, portfolio_scenario
                )

                # Check if we should hedge
                if not self._should_hedge(portfolio_state, config):
                    continue

                # Find hedge opportunity
                opportunity = self._find_historical_hedge_opportunity(
                    entry_date, historical_data, portfolio_state
                )

                if opportunity is None or opportunity.score < config.min_hedge_score:
                    continue

                # Simulate trade execution and exit
                trade = self._simulate_hedge_trade(
                    entry_date, opportunity, historical_data, config
                )

                if trade:
                    trades.append(trade)

            except Exception as e:
                print(f"Error backtesting {entry_date}: {e}")
                continue

        return trades

    def _simulate_portfolio_state(self, current_date: date,
                                 historical_data: pd.DataFrame,
                                 scenario: Dict) -> Dict:
        """
        Simulate portfolio state on given date

        Args:
            current_date: Current date
            historical_data: Historical data
            scenario: Portfolio scenario

        Returns:
            Dict: Portfolio state
        """
        # Get market data for date
        date_data = historical_data[historical_data.index.date == current_date]
        if date_data.empty:
            return {}

        market_data = date_data.iloc[0]

        # Simulate portfolio performance
        monthly_return = self._simulate_portfolio_return(current_date, historical_data, scenario)

        return {
            'date': current_date,
            'total_value': 1000000,  # Fixed for simplicity
            'monthly_return': monthly_return,
            'beta': scenario['beta'],
            'concentration': scenario['concentration'],
            'volatility': scenario['volatility'],
            'heat_level': max(0, min(1, -monthly_return * 3)),  # Heat from losses
            'market_data': market_data
        }

    def _should_hedge(self, portfolio_state: Dict, config: BacktestConfig) -> bool:
        """
        Determine if hedging should be initiated

        Args:
            portfolio_state: Current portfolio state
            config: Backtest configuration

        Returns:
            bool: Whether to hedge
        """
        if not portfolio_state:
            return False

        heat_level = portfolio_state.get('heat_level', 0)
        concentration = portfolio_state.get('concentration', 0)
        beta = portfolio_state.get('beta', 1.0)

        # Hedge if any risk threshold exceeded
        return (
            heat_level > 0.3 or
            concentration > 0.25 or
            beta > 1.2 or
            heat_level > config.max_heat_level
        )

    def _find_historical_hedge_opportunity(self, entry_date: date,
                                          historical_data: pd.DataFrame,
                                          portfolio_state: Dict) -> Optional[HedgeOpportunity]:
        """
        Find hedge opportunity for historical date

        Args:
            entry_date: Entry date
            historical_data: Historical data
            portfolio_state: Portfolio state

        Returns:
            HedgeOpportunity: Historical opportunity
        """
        try:
            # Get market data
            market_data = portfolio_state.get('market_data', {})

            # Simulate options data (simplified)
            spot_price = market_data.get('close', 22000)
            options_data = self._simulate_options_data(spot_price, market_data)

            # Calculate score
            portfolio_data = {
                'total_value': portfolio_state['total_value'],
                'monthly_return': portfolio_state['monthly_return'],
                'beta': portfolio_state['beta'],
                'concentration': portfolio_state['concentration'],
                'volatility': portfolio_state['volatility'],
                'heat_level': portfolio_state['heat_level']
            }

            total_score, breakdown = self.detector.calculate_hedge_score(
                portfolio_data, market_data, options_data
            )

            if total_score < 50:  # Minimum threshold
                return None

            # Create opportunity
            grade = self.detector.determine_hedge_grade(total_score)
            position_size_pct = self.detector.calculate_position_size(
                total_score, grade, portfolio_data
            )

            return HedgeOpportunity(
                symbol='NIFTY',
                score=total_score,
                grade=grade,
                position_size_pct=position_size_pct,
                spread_details=options_data,
                risk_metrics={'score_breakdown': breakdown},
                timestamp=datetime.combine(entry_date, datetime.min.time(), tzinfo=self.ist_tz)
            )

        except Exception as e:
            print(f"Error finding historical opportunity: {e}")
            return None

    def _simulate_hedge_trade(self, entry_date: date, opportunity: HedgeOpportunity,
                             historical_data: pd.DataFrame, config: BacktestConfig) -> Optional[BacktestTrade]:
        """
        Simulate complete hedge trade from entry to exit

        Args:
            entry_date: Entry date
            opportunity: Hedge opportunity
            historical_data: Historical data
            config: Backtest configuration

        Returns:
            BacktestTrade: Simulated trade
        """
        try:
            # Exit after 3 days (3-DTE)
            exit_date = entry_date + timedelta(days=3)

            # Get prices
            entry_data = historical_data[historical_data.index.date == entry_date]
            exit_data = historical_data[historical_data.index.date == exit_date]

            if entry_data.empty or exit_data.empty:
                return None

            entry_price = opportunity.spread_details['net_premium']
            exit_price = self._calculate_exit_price(opportunity, exit_data.iloc[0])

            # Calculate P&L
            pnl = (exit_price - entry_price) * 50  # Nifty multiplier
            pnl_pct = pnl / (entry_price * 50)

            # Apply costs
            if config.include_transaction_costs:
                pnl -= config.commission_per_trade * 2  # Entry and exit
                pnl -= abs(pnl) * config.slippage_pct

            # Calculate max drawdown during trade
            trade_data = historical_data[
                (historical_data.index.date >= entry_date) &
                (historical_data.index.date <= exit_date)
            ]
            max_drawdown = self._calculate_trade_drawdown(trade_data, opportunity)

            # Market condition
            market_condition = self._classify_market_condition(entry_data.iloc[0])

            return BacktestTrade(
                entry_date=entry_date,
                exit_date=exit_date,
                entry_price=entry_price,
                exit_price=exit_price,
                spread_details=opportunity.spread_details,
                pnl=pnl,
                pnl_pct=pnl_pct,
                max_drawdown=max_drawdown,
                holding_period=3,
                market_condition=market_condition,
                portfolio_heat=0.5,  # Would be from portfolio state
                hedge_score=opportunity.score,
                hedge_grade=opportunity.grade.value
            )

        except Exception as e:
            print(f"Error simulating trade: {e}")
            return None

    def _calculate_backtest_results(self, trades: List[BacktestTrade],
                                  config: BacktestConfig) -> BacktestResult:
        """
        Calculate comprehensive backtest results

        Args:
            trades: List of trades
            config: Backtest configuration

        Returns:
            BacktestResult: Complete results
        """
        if not trades:
            return self._create_empty_result()

        # Basic metrics
        total_trades = len(trades)
        winning_trades = len([t for t in trades if t.pnl > 0])
        losing_trades = total_trades - winning_trades
        win_rate = winning_trades / total_trades if total_trades > 0 else 0

        # P&L metrics
        total_pnl = sum(t.pnl for t in trades)
        total_pnl_pct = total_pnl / config.initial_capital
        avg_trade_pnl = total_pnl / total_trades if total_trades > 0 else 0
        avg_trade_pnl_pct = sum(t.pnl_pct for t in trades) / total_trades if total_trades > 0 else 0

        # Risk metrics
        max_drawdown = self._calculate_max_drawdown(trades)
        sharpe_ratio = self._calculate_sharpe_ratio(trades)
        sortino_ratio = self._calculate_sortino_ratio(trades)
        calmar_ratio = total_pnl_pct / max_drawdown if max_drawdown > 0 else 0

        # Profit metrics
        gross_profit = sum(t.pnl for t in trades if t.pnl > 0)
        gross_loss = abs(sum(t.pnl for t in trades if t.pnl < 0))
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')

        recovery_factor = total_pnl / max_drawdown if max_drawdown > 0 else 0

        # Monthly returns
        monthly_returns = self._calculate_monthly_returns(trades)

        # Drawdown periods
        drawdown_periods = self._identify_drawdown_periods(trades)

        return BacktestResult(
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=win_rate,
            total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct,
            avg_trade_pnl=avg_trade_pnl,
            avg_trade_pnl_pct=avg_trade_pnl_pct,
            max_drawdown=max_drawdown,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            calmar_ratio=calmar_ratio,
            profit_factor=profit_factor,
            recovery_factor=recovery_factor,
            trades=trades,
            monthly_returns=monthly_returns,
            drawdown_periods=drawdown_periods
        )

    # Helper methods (simplified implementations)
    def _simulate_portfolio_return(self, current_date: date,
                                  historical_data: pd.DataFrame,
                                  scenario: Dict) -> float:
        """Simulate portfolio monthly return"""
        # Simplified - would use actual portfolio simulation
        return np.random.normal(-0.02, 0.05)  # Mean -2%, std 5%

    def _simulate_options_data(self, spot_price: float, market_data: Dict) -> Dict:
        """Simulate options chain data"""
        # Simplified options data simulation
        target_otm = 0.07
        strike = spot_price * (1 - target_otm)

        return {
            'strike_otm_pct': target_otm,
            'spread_width': 250,
            'oi_long': 5000,
            'oi_short': 8000,
            'net_premium': 25.0,
            'max_risk': 225.0,
            'premium_to_risk': 25.0/225.0,
            'net_delta': -0.20,
            'theta_daily': 8.0,
            'theta_efficiency': 8.0/25.0
        }

    def _calculate_exit_price(self, opportunity: HedgeOpportunity, exit_data: pd.Series) -> float:
        """Calculate spread exit price"""
        # Simplified - actual implementation would model spread P&L
        entry_premium = opportunity.spread_details['net_premium']
        # Assume some time decay and market movement impact
        time_decay = 0.1  # 10% decay
        market_impact = exit_data.get('returns', 0) * 0.5  # 50% correlation
        return entry_premium * (1 - time_decay + market_impact)

    def _get_rebalance_dates(self, historical_data: pd.DataFrame, config: BacktestConfig) -> List[date]:
        """Get rebalance dates based on frequency"""
        dates = historical_data.index.date
        if config.rebalance_frequency == 'weekly':
            # Weekly on Thursdays (typical options expiry prep)
            return [d for d in dates if d.weekday() == 3]  # Thursday
        elif config.rebalance_frequency == 'monthly':
            # Monthly on last Thursday
            return [d for d in dates if d.day > 20 and d.weekday() == 3]
        else:  # daily
            return list(dates)

    def _calculate_max_drawdown(self, trades: List[BacktestTrade]) -> float:
        """Calculate maximum drawdown"""
        if not trades:
            return 0

        cumulative = 0
        peak = 0
        max_dd = 0

        for trade in sorted(trades, key=lambda x: x.entry_date):
            cumulative += trade.pnl
            peak = max(peak, cumulative)
            dd = (peak - cumulative) / peak if peak > 0 else 0
            max_dd = max(max_dd, dd)

        return max_dd

    def _calculate_sharpe_ratio(self, trades: List[BacktestTrade]) -> float:
        """Calculate Sharpe ratio"""
        if not trades:
            return 0

        returns = [t.pnl_pct for t in trades]
        if len(returns) < 2:
            return 0

        avg_return = np.mean(returns)
        std_return = np.std(returns)

        return avg_return / std_return * np.sqrt(252) if std_return > 0 else 0

    def _calculate_sortino_ratio(self, trades: List[BacktestTrade]) -> float:
        """Calculate Sortino ratio"""
        if not trades:
            return 0

        returns = [t.pnl_pct for t in trades]
        negative_returns = [r for r in returns if r < 0]

        if not negative_returns:
            return float('inf')

        avg_return = np.mean(returns)
        downside_std = np.std(negative_returns)

        return avg_return / downside_std * np.sqrt(252) if downside_std > 0 else 0

    def _estimate_vix(self, nifty_data: pd.DataFrame) -> pd.Series:
        """Estimate VIX from Nifty volatility"""
        # Simplified VIX estimation
        vol = nifty_data['volatility_20d'] * 100  # Convert to percentage
        return vol.fillna(20)  # Default 20

    def _identify_market_regimes(self, historical_data: pd.DataFrame) -> Dict[str, Dict]:
        """Identify different market regimes"""
        # Simplified regime identification
        return {
            'bull_market': {'start_date': date(2020, 1, 1), 'end_date': date(2020, 12, 31)},
            'bear_market': {'start_date': date(2021, 1, 1), 'end_date': date(2021, 12, 31)},
            'sideways': {'start_date': date(2022, 1, 1), 'end_date': date(2022, 12, 31)}
        }

    def _calculate_trade_drawdown(self, trade_data: pd.DataFrame, opportunity: HedgeOpportunity) -> float:
        """Calculate drawdown during trade"""
        # Simplified implementation
        return 0.05  # 5% max drawdown

    def _classify_market_condition(self, market_data: pd.Series) -> str:
        """Classify market condition"""
        vix = market_data.get('vix', 20)
        returns = market_data.get('weekly_return', 0)

        if vix > 30:
            return "High Volatility"
        elif returns > 0.02:
            return "Bullish"
        elif returns < -0.02:
            return "Bearish"
        else:
            return "Neutral"

    def _calculate_monthly_returns(self, trades: List[BacktestTrade]) -> Dict[str, float]:
        """Calculate monthly returns"""
        monthly_pnl = {}
        for trade in trades:
            month_key = f"{trade.entry_date.year}-{trade.entry_date.month:02d}"
            monthly_pnl[month_key] = monthly_pnl.get(month_key, 0) + trade.pnl

        return monthly_pnl

    def _identify_drawdown_periods(self, trades: List[BacktestTrade]) -> List[Dict]:
        """Identify drawdown periods"""
        # Simplified implementation
        return []

    def _create_empty_result(self) -> BacktestResult:
        """Create empty result for no trades"""
        return BacktestResult(
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            win_rate=0,
            total_pnl=0,
            total_pnl_pct=0,
            avg_trade_pnl=0,
            avg_trade_pnl_pct=0,
            max_drawdown=0,
            sharpe_ratio=0,
            sortino_ratio=0,
            calmar_ratio=0,
            profit_factor=0,
            recovery_factor=0,
            trades=[],
            monthly_returns={},
            drawdown_periods=[]
        )


def main():
    """Main function for command-line backtesting"""
    backtester = NiftyHedgeBacktester()

    # Run default backtest
    print("Running Nifty Options Hedge Backtest...")
    result = backtester.run_backtest()

    # Print results
    print("\n=== Backtest Results ===")
    print(f"Total Trades: {result.total_trades}")
    print(f"Win Rate: {result.win_rate:.1%}")
    print(f"Total P&L: ₹{result.total_pnl:,.0f} ({result.total_pnl_pct:.1%})")
    print(f"Average Trade: ₹{result.avg_trade_pnl:,.0f} ({result.avg_trade_pnl_pct:.1%})")
    print(f"Max Drawdown: {result.max_drawdown:.1%}")
    print(f"Sharpe Ratio: {result.sharpe_ratio:.2f}")
    print(f"Profit Factor: {result.profit_factor:.2f}")

    # Save detailed results
    result_dict = {
        'summary': {
            'total_trades': result.total_trades,
            'win_rate': result.win_rate,
            'total_pnl': result.total_pnl,
            'total_pnl_pct': result.total_pnl_pct,
            'max_drawdown': result.max_drawdown,
            'sharpe_ratio': result.sharpe_ratio,
            'profit_factor': result.profit_factor
        },
        'trades': [trade.__dict__ for trade in result.trades[:10]],  # First 10 trades
        'monthly_returns': result.monthly_returns
    }

    with open('hedge_backtest_results.json', 'w') as f:
        json.dump(result_dict, f, indent=2, default=str)

    print("\nDetailed results saved to hedge_backtest_results.json")

    # Run scenario analysis
    print("\nRunning scenario analysis...")
    parameter_ranges = {
        'min_hedge_score': [40, 50, 60, 70],
        'max_position_size_pct': [0.03, 0.05, 0.07]
    }

    scenario_results = backtester.run_scenario_analysis(backtester.default_config, parameter_ranges)

    print("\n=== Scenario Analysis ===")
    for scenario_name, scenario_result in scenario_results.items():
        print(f"{scenario_name}: {scenario_result.total_pnl:,.0f} P&L, "
              f"{scenario_result.win_rate:.1%} win rate, "
              f"{scenario_result.sharpe_ratio:.2f} Sharpe")


if __name__ == "__main__":
    main()
