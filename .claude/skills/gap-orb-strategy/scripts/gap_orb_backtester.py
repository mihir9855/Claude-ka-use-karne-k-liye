"""
Gap ORB Strategy Backtester
Backtests gap + opening range breakout strategy
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pytz

IST = pytz.timezone('Asia/Kolkata')

def identify_gap_days(df: pd.DataFrame, min_gap_pct: float = 0.5) -> pd.DataFrame:
    """
    Identify days with significant gaps

    Args:
        df: OHLCV DataFrame with datetime index
        min_gap_pct: Minimum gap % threshold

    Returns:
        DataFrame with gap days
    """
    gap_days = []

    # Group by date
    for date in df.index.date:
        day_data = df[df.index.date == date]
        if day_data.empty:
            continue

        # Get open and previous close
        open_price = day_data.iloc[0]['open']
        prev_close = get_previous_close_for_date(date)

        gap_pct = (open_price - prev_close) / prev_close * 100

        if abs(gap_pct) >= min_gap_pct:
            gap_days.append({
                'date': date,
                'gap_pct': round(gap_pct, 2),
                'open': open_price,
                'prev_close': prev_close,
                'gap_type': 'UP' if gap_pct > 0 else 'DOWN'
            })

    return pd.DataFrame(gap_days)

def calculate_orb(df: pd.DataFrame, orb_minutes: int = 15) -> Dict:
    """
    Calculate Opening Range Breakout levels

    Args:
        df: Day's OHLCV data
        orb_minutes: ORB duration in minutes

    Returns:
        Dict with ORB levels
    """
    # Get first N minutes of trading
    orb_end_time = datetime.combine(df.index[0].date(), time(9, 15)) + timedelta(minutes=orb_minutes)
    orb_data = df[df.index <= orb_end_time.replace(tzinfo=IST)]

    if orb_data.empty:
        return {'orb_high': None, 'orb_low': None}

    orb_high = orb_data['high'].max()
    orb_low = orb_data['low'].min()

    return {
        'orb_high': round(orb_high, 2),
        'orb_low': round(orb_low, 2),
        'orb_mid': round((orb_high + orb_low) / 2, 2)
    }

def check_breakout(df: pd.DataFrame, orb_high: float, orb_low: float,
                  volume_threshold: float = 1.2) -> Optional[Dict]:
    """
    Check for ORB breakout with volume confirmation

    Args:
        df: Day's OHLCV data
        orb_high: ORB high level
        orb_low: ORB low level
        volume_threshold: Volume multiplier for confirmation

    Returns:
        Dict with breakout details or None
    """
    # Calculate ORB average volume
    orb_end_time = datetime.combine(df.index[0].date(), time(9, 30))
    orb_data = df[df.index <= orb_end_time.replace(tzinfo=IST)]
    orb_avg_volume = orb_data['volume'].mean()

    # Look for breakout after ORB
    post_orb_data = df[df.index > orb_end_time.replace(tzinfo=IST)]

    for idx, row in post_orb_data.iterrows():
        volume_confirmed = row['volume'] > volume_threshold * orb_avg_volume

        if row['close'] > orb_high and volume_confirmed:
            return {
                'breakout_type': 'BULLISH',
                'breakout_price': row['close'],
                'volume_confirmed': True,
                'timestamp': idx
            }
        elif row['close'] < orb_low and volume_confirmed:
            return {
                'breakout_type': 'BEARISH',
                'breakout_price': row['close'],
                'volume_confirmed': True,
                'timestamp': idx
            }

    return None

def simulate_gap_orb_trades(df: pd.DataFrame, config: Dict) -> List[Dict]:
    """
    Simulate gap ORB trades for a symbol

    Args:
        df: Historical OHLCV data
        config: Trading configuration

    Returns:
        List of trade dictionaries
    """
    trades = []

    # Identify gap days
    gap_days = identify_gap_days(df, config.get('min_gap_pct', 0.5))

    for _, gap_day in gap_days.iterrows():
        # Get day's data
        day_data = df[df.index.date == gap_day['date']]

        # Calculate ORB
        orb = calculate_orb(day_data, config.get('orb_minutes', 15))

        if orb['orb_high'] is None:
            continue

        # Check for breakout
        breakout = check_breakout(day_data, orb['orb_high'], orb['orb_low'],
                                config.get('volume_threshold', 1.2))

        if breakout:
            # Simulate trade
            trade = _simulate_single_trade(gap_day, orb, breakout, config)
            if trade:
                trades.append(trade)

    return trades

def run_backtest(symbol: str, from_date: str, to_date: str, config: Dict) -> Dict:
    """
    Run complete backtest for gap ORB strategy

    Args:
        symbol: NSE symbol
        from_date/to_date: Date range
        config: Backtest configuration

    Returns:
        Dict with results and metrics
    """
    # Load historical data (mock)
    df = load_historical_data(symbol, from_date, to_date)

    # Run simulation
    trades = simulate_gap_orb_trades(df, config)

    # Calculate metrics
    metrics = calculate_backtest_metrics(trades)

    return {
        'symbol': symbol,
        'total_trades': len(trades),
        'trades': trades,
        'metrics': metrics
    }

def _simulate_single_trade(gap_day: pd.Series, orb: Dict, breakout: Dict, config: Dict) -> Optional[Dict]:
    """Simulate a single gap ORB trade"""
    entry_price = breakout['breakout_price']
    side = 'LONG' if breakout['breakout_type'] == 'BULLISH' else 'SHORT'

    # Stop loss
    sl = orb['orb_low'] if side == 'LONG' else orb['orb_high']

    # Target (1:1.5 RR)
    risk = abs(entry_price - sl)
    target = entry_price + (1.5 * risk) if side == 'LONG' else entry_price - (1.5 * risk)

    # Mock exit (simplified)
    exit_price = target if _random_outcome() else sl
    pnl = (exit_price - entry_price) if side == 'LONG' else (entry_price - exit_price)

    return {
        'date': gap_day['date'],
        'symbol': gap_day.get('symbol', 'UNKNOWN'),
        'side': side,
        'entry_price': round(entry_price, 2),
        'exit_price': round(exit_price, 2),
        'stop_loss': round(sl, 2),
        'target': round(target, 2),
        'pnl': round(pnl, 2),
        'outcome': 'WIN' if pnl > 0 else 'LOSS',
        'gap_pct': gap_day['gap_pct']
    }

def calculate_backtest_metrics(trades: List[Dict]) -> Dict:
    """Calculate backtest performance metrics"""
    if not trades:
        return {'error': 'No trades to analyze'}

    df = pd.DataFrame(trades)
    total_pnl = df['pnl'].sum()
    num_trades = len(df)
    winning_trades = len(df[df['pnl'] > 0])
    win_rate = winning_trades / num_trades if num_trades > 0 else 0

    return {
        'total_pnl': round(total_pnl, 2),
        'num_trades': num_trades,
        'win_rate': round(win_rate, 3),
        'avg_pnl': round(df['pnl'].mean(), 2),
        'max_win': round(df['pnl'].max(), 2),
        'max_loss': round(df['pnl'].min(), 2)
    }

def _random_outcome() -> bool:
    """Mock trade outcome (60% win rate)"""
    import random
    return random.random() < 0.6

# Mock data functions
def load_historical_data(symbol: str, from_date: str, to_date: str) -> pd.DataFrame:
    """Load historical OHLCV data"""
    # Mock implementation
    return pd.DataFrame()

def get_previous_close_for_date(date) -> float:
    """Get previous close for specific date"""
    return 2450.0  # Mock
