"""
OHL Strategy Backtester
Backtests Open=High/Open=Low breakout strategy on historical data
"""

import pandas as pd
from datetime import datetime, time
import pytz
from typing import Dict, List, Optional

IST = pytz.timezone('Asia/Kolkata')

def identify_ohl_days(df: pd.DataFrame) -> pd.DataFrame:
    """
    Identify days with OH/OL conditions at 9:15 AM IST

    Args:
        df: OHLCV DataFrame with datetime index

    Returns:
        DataFrame with OH/OL signals
    """
    ohl_signals = []

    # Group by date
    for date, day_data in df.groupby(df.index.date):
        if len(day_data) < 15:  # Need at least 15 minutes
            continue

        # Get 9:15 candle (15th minute of trading)
        candle_915 = day_data.iloc[14]

        open_price = candle_915['open']
        high_price = candle_915['high']
        low_price = candle_915['low']

        # OH condition: Open == High
        if abs(open_price - high_price) < 0.01:
            condition = 'OH'
            side = 'SHORT'  # Disabled in V4
        # OL condition: Open == Low
        elif abs(open_price - low_price) < 0.01:
            condition = 'OL'
            side = 'LONG'
        else:
            continue

        ohl_signals.append({
            'date': date,
            'condition': condition,
            'side': side,
            'entry_price': open_price,
            'volume': candle_915['volume']
        })

    return pd.DataFrame(ohl_signals)

def simulate_trades(ohl_days_df: pd.DataFrame, config: Dict) -> pd.DataFrame:
    """
    Simulate trades based on OH/OL signals

    Args:
        ohl_days_df: DataFrame from identify_ohl_days
        config: Trading configuration

    Returns:
        DataFrame with trade results
    """
    trades = []

    for _, signal in ohl_days_df.iterrows():
        if signal['side'] == 'SHORT' and not config.get('allow_short', False):
            continue  # V4: OL long-only

        # Apply filters
        if not _passes_filters(signal, config):
            continue

        # Calculate entry/exit levels
        levels = _calculate_trade_levels(signal['entry_price'], signal['side'])

        # Simulate trade execution
        trade_result = _execute_trade_simulation(signal, levels, config)

        if trade_result:
            trades.append(trade_result)

    return pd.DataFrame(trades)

def run_backtest(symbol: str, from_date: str, to_date: str, config: Dict) -> Dict:
    """
    Run complete backtest for OH/OL strategy

    Args:
        symbol: NSE symbol
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)
        config: Backtest configuration

    Returns:
        Dict with backtest results and metrics
    """
    # Load historical data (mock for demo)
    df = _load_historical_data(symbol, from_date, to_date)

    # Identify OH/OL days
    ohl_signals = identify_ohl_days(df)

    # Simulate trades
    trades_df = simulate_trades(ohl_signals, config)

    # Calculate metrics
    metrics = _calculate_backtest_metrics(trades_df)

    return {
        'symbol': symbol,
        'total_signals': len(ohl_signals),
        'total_trades': len(trades_df),
        'trades_df': trades_df,
        'metrics': metrics
    }

# Helper functions
def _passes_filters(signal: pd.Series, config: Dict) -> bool:
    """Check if signal passes all filters"""
    # Volume filter
    if 'volume_threshold' in config:
        avg_volume = _get_avg_volume(signal['date'], config)
        if signal['volume'] < config['volume_threshold'] * avg_volume:
            return False

    # Gap filter
    if 'max_gap_pct' in config:
        prev_close = _get_previous_close(signal['date'])
        gap_pct = abs(signal['entry_price'] - prev_close) / prev_close * 100
        if gap_pct > config['max_gap_pct']:
            return False

    return True

def _calculate_trade_levels(entry_price: float, side: str) -> Dict:
    """Calculate SL and target levels"""
    # SL at entry (open price)
    sl = entry_price

    # Risk = ATR-based or fixed percentage
    risk = max(entry_price * 0.005, 25.0)  # Min 0.5% or ₹25

    if side == 'LONG':
        t1 = entry_price + risk
        t2 = entry_price + 2 * risk
    else:  # SHORT
        t1 = entry_price - risk
        t2 = entry_price - 2 * risk

    return {
        'entry': entry_price,
        'stop_loss': sl,
        'target_1': round(t1, 2),
        'target_2': round(t2, 2),
        'risk_per_share': round(risk, 2)
    }

def _execute_trade_simulation(signal: pd.Series, levels: Dict, config: Dict) -> Optional[Dict]:
    """Simulate trade execution and outcome"""
    # Mock exit logic - in real implementation would use actual price data
    import random

    # Random outcome based on win rate
    win_rate = config.get('expected_win_rate', 0.56)
    if random.random() < win_rate:
        # Win - hit T1
        exit_price = levels['target_1']
        pnl = (exit_price - levels['entry']) if signal['side'] == 'LONG' else (levels['entry'] - exit_price)
    else:
        # Loss - hit SL
        exit_price = levels['stop_loss']
        pnl = (exit_price - levels['entry']) if signal['side'] == 'LONG' else (levels['entry'] - exit_price)

    return {
        'date': signal['date'],
        'symbol': signal.get('symbol', 'UNKNOWN'),
        'side': signal['side'],
        'entry_price': levels['entry'],
        'exit_price': exit_price,
        'pnl': round(pnl, 2),
        'quantity': config.get('lot_size', 1),
        'outcome': 'WIN' if pnl > 0 else 'LOSS'
    }

def _calculate_backtest_metrics(trades_df: pd.DataFrame) -> Dict:
    """Calculate backtest performance metrics"""
    if trades_df.empty:
        return {'error': 'No trades to analyze'}

    total_pnl = trades_df['pnl'].sum()
    num_trades = len(trades_df)
    winning_trades = len(trades_df[trades_df['pnl'] > 0])
    win_rate = winning_trades / num_trades if num_trades > 0 else 0

    avg_win = trades_df[trades_df['pnl'] > 0]['pnl'].mean() if winning_trades > 0 else 0
    avg_loss = abs(trades_df[trades_df['pnl'] < 0]['pnl'].mean()) if len(trades_df[trades_df['pnl'] < 0]) > 0 else 0

    profit_factor = (winning_trades * avg_win) / ((num_trades - winning_trades) * avg_loss) if avg_loss > 0 else float('inf')

    return {
        'total_pnl': round(total_pnl, 2),
        'num_trades': num_trades,
        'win_rate': round(win_rate, 3),
        'avg_win': round(avg_win, 2),
        'avg_loss': round(avg_loss, 2),
        'profit_factor': round(profit_factor, 2),
        'max_drawdown': _calculate_max_drawdown(trades_df)
    }

def _calculate_max_drawdown(trades_df: pd.DataFrame) -> float:
    """Calculate maximum drawdown from trades"""
    if trades_df.empty:
        return 0.0

    cumulative = trades_df['pnl'].cumsum()
    running_max = cumulative.expanding().max()
    drawdown = running_max - cumulative
    return round(drawdown.max(), 2)

# Mock data functions (replace with real data loading)
def _load_historical_data(symbol: str, from_date: str, to_date: str) -> pd.DataFrame:
    """Load historical 1-minute data"""
    # Mock implementation
    return pd.DataFrame()

def _get_avg_volume(date, config: Dict) -> float:
    """Get average volume for filter"""
    return 1000000  # Mock

def _get_previous_close(date) -> float:
    """Get previous day's close"""
    return 2450.0  # Mock
