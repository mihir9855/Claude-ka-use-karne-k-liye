#!/usr/bin/env python3
"""
Professional Trade Logger for Prop Trading Journal
Comprehensive trade recording system with NSE/BSE integration and psychological tracking
"""

import sqlite3
import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import os
import hashlib
import pytz
from dataclasses import dataclass, asdict
from enum import Enum

class TradeType(Enum):
    LONG = "LONG"
    SHORT = "SHORT"
    OPTIONS_CALL = "OPTIONS_CALL"
    OPTIONS_PUT = "OPTIONS_PUT"
    FUTURES = "FUTURES"

class MarketCondition(Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    SIDEWAYS = "SIDEWAYS"
    VOLATILE = "VOLATILE"
    QUIET = "QUIET"

class EmotionalState(Enum):
    CONFIDENT = "CONFIDENT"
    NERVOUS = "NERVOUS"
    GREEDY = "GREEDY"
    FEARFUL = "FEARFUL"
    NEUTRAL = "NEUTRAL"
    STRESSED = "STRESSED"

@dataclass
class TradeEntry:
    """Trade entry data structure"""
    trade_id: str
    symbol: str
    trade_type: TradeType
    quantity: int
    entry_price: float
    entry_time: datetime
    strategy: str
    market_condition: MarketCondition
    emotional_state: EmotionalState
    confidence_level: int  # 1-10
    risk_amount: float
    stop_loss: Optional[float] = None
    target_price: Optional[float] = None
    notes: Optional[str] = None

@dataclass
class TradeExit:
    """Trade exit data structure"""
    trade_id: str
    exit_price: float
    exit_time: datetime
    quantity: int
    exit_reason: str
    emotional_state: EmotionalState
    lessons_learned: Optional[str] = None
    mistakes_made: Optional[str] = None

class TradeLogger:
    """Professional trade logging system"""

    def __init__(self, db_path: str = "trading_journal.db"):
        """
        Initialize trade logger with database connection

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self._init_database()

    def _init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS trades (
                    trade_id TEXT PRIMARY KEY,
                    symbol TEXT NOT NULL,
                    trade_type TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    entry_price REAL NOT NULL,
                    entry_time TEXT NOT NULL,
                    exit_price REAL,
                    exit_time TEXT,
                    strategy TEXT NOT NULL,
                    market_condition TEXT NOT NULL,
                    entry_emotion TEXT NOT NULL,
                    exit_emotion TEXT,
                    confidence_level INTEGER,
                    risk_amount REAL NOT NULL,
                    stop_loss REAL,
                    target_price REAL,
                    pnl REAL,
                    pnl_percentage REAL,
                    holding_period_minutes INTEGER,
                    exit_reason TEXT,
                    notes TEXT,
                    lessons_learned TEXT,
                    mistakes_made TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS market_events (
                    event_id TEXT PRIMARY KEY,
                    event_time TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    description TEXT,
                    impact_level TEXT,
                    symbols_affected TEXT,
                    created_at TEXT NOT NULL
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS psychological_metrics (
                    metric_id TEXT PRIMARY KEY,
                    trade_id TEXT,
                    metric_date TEXT NOT NULL,
                    stress_level INTEGER,
                    motivation_level INTEGER,
                    market_confidence INTEGER,
                    self_discipline_score INTEGER,
                    notes TEXT,
                    FOREIGN KEY (trade_id) REFERENCES trades (trade_id)
                )
            ''')

    def log_trade_entry(self, trade: TradeEntry) -> bool:
        """
        Log a new trade entry

        Args:
            trade: TradeEntry object with trade details

        Returns:
            Success status
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO trades (
                        trade_id, symbol, trade_type, quantity, entry_price, entry_time,
                        strategy, market_condition, entry_emotion, confidence_level,
                        risk_amount, stop_loss, target_price, notes, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    trade.trade_id,
                    trade.symbol,
                    trade.trade_type.value,
                    trade.quantity,
                    trade.entry_price,
                    trade.entry_time.isoformat(),
                    trade.strategy,
                    trade.market_condition.value,
                    trade.emotional_state.value,
                    trade.confidence_level,
                    trade.risk_amount,
                    trade.stop_loss,
                    trade.target_price,
                    trade.notes,
                    datetime.now(self.ist_tz).isoformat(),
                    datetime.now(self.ist_tz).isoformat()
                ))
            return True
        except Exception as e:
            print(f"Error logging trade entry: {e}")
            return False

    def log_trade_exit(self, exit_data: TradeExit) -> bool:
        """
        Log trade exit and calculate P&L

        Args:
            exit_data: TradeExit object with exit details

        Returns:
            Success status
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Get entry data
                entry_data = conn.execute('''
                    SELECT entry_price, entry_time, quantity, trade_type
                    FROM trades WHERE trade_id = ?
                ''', (exit_data.trade_id,)).fetchone()

                if not entry_data:
                    print(f"Trade entry not found for ID: {exit_data.trade_id}")
                    return False

                entry_price, entry_time_str, quantity, trade_type = entry_data

                # Calculate P&L
                if trade_type in ['LONG', 'OPTIONS_CALL', 'FUTURES']:
                    pnl = (exit_data.exit_price - entry_price) * exit_data.quantity
                else:  # SHORT, OPTIONS_PUT
                    pnl = (entry_price - exit_data.exit_price) * exit_data.quantity

                pnl_percentage = (pnl / (entry_price * quantity)) * 100

                # Calculate holding period
                entry_time = datetime.fromisoformat(entry_time_str)
                holding_period = int((exit_data.exit_time - entry_time).total_seconds() / 60)

                # Update trade record
                conn.execute('''
                    UPDATE trades SET
                        exit_price = ?,
                        exit_time = ?,
                        pnl = ?,
                        pnl_percentage = ?,
                        holding_period_minutes = ?,
                        exit_reason = ?,
                        exit_emotion = ?,
                        lessons_learned = ?,
                        mistakes_made = ?,
                        updated_at = ?
                    WHERE trade_id = ?
                ''', (
                    exit_data.exit_price,
                    exit_data.exit_time.isoformat(),
                    pnl,
                    pnl_percentage,
                    holding_period,
                    exit_data.exit_reason,
                    exit_data.emotional_state.value,
                    exit_data.lessons_learned,
                    exit_data.mistakes_made,
                    datetime.now(self.ist_tz).isoformat(),
                    exit_data.trade_id
                ))

            return True
        except Exception as e:
            print(f"Error logging trade exit: {e}")
            return False

    def log_market_event(self, event_type: str, description: str,
                        impact_level: str = "MEDIUM", symbols_affected: Optional[List[str]] = None) -> bool:
        """
        Log significant market events

        Args:
            event_type: Type of market event
            description: Event description
            impact_level: Impact level (LOW/MEDIUM/HIGH)
            symbols_affected: List of affected symbols

        Returns:
            Success status
        """
        try:
            event_id = f"event_{datetime.now(self.ist_tz).strftime('%Y%m%d_%H%M%S')}"
            symbols_str = json.dumps(symbols_affected) if symbols_affected else None

            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO market_events (
                        event_id, event_time, event_type, description,
                        impact_level, symbols_affected, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    event_id,
                    datetime.now(self.ist_tz).isoformat(),
                    event_type,
                    description,
                    impact_level,
                    symbols_str,
                    datetime.now(self.ist_tz).isoformat()
                ))
            return True
        except Exception as e:
            print(f"Error logging market event: {e}")
            return False

    def log_psychological_metrics(self, trade_id: Optional[str] = None,
                                stress_level: int = 5, motivation_level: int = 5,
                                market_confidence: int = 5, self_discipline_score: int = 5,
                                notes: Optional[str] = None) -> bool:
        """
        Log psychological metrics

        Args:
            trade_id: Associated trade ID (optional)
            stress_level: Stress level (1-10)
            motivation_level: Motivation level (1-10)
            market_confidence: Market confidence (1-10)
            self_discipline_score: Discipline score (1-10)
            notes: Additional notes

        Returns:
            Success status
        """
        try:
            metric_id = f"metric_{datetime.now(self.ist_tz).strftime('%Y%m%d_%H%M%S')}"

            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO psychological_metrics (
                        metric_id, trade_id, metric_date, stress_level,
                        motivation_level, market_confidence, self_discipline_score, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    metric_id,
                    trade_id,
                    datetime.now(self.ist_tz).isoformat(),
                    stress_level,
                    motivation_level,
                    market_confidence,
                    self_discipline_score,
                    notes
                ))
            return True
        except Exception as e:
            print(f"Error logging psychological metrics: {e}")
            return False

    def get_open_trades(self) -> List[Dict[str, Any]]:
        """
        Get all currently open trades

        Returns:
            List of open trade dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT * FROM trades
                WHERE exit_time IS NULL
                ORDER BY entry_time DESC
            ''')

            return [dict(row) for row in cursor.fetchall()]

    def get_trades_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """
        Get trades within date range

        Args:
            start_date: Start date for query
            end_date: End date for query

        Returns:
            List of trade dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT * FROM trades
                WHERE entry_time >= ? AND entry_time <= ?
                ORDER BY entry_time DESC
            ''', (start_date.isoformat(), end_date.isoformat()))

            return [dict(row) for row in cursor.fetchall()]

    def get_trade_statistics(self, days: int = 30) -> Dict[str, Any]:
        """
        Get basic trading statistics

        Args:
            days: Number of days to look back

        Returns:
            Statistics dictionary
        """
        start_date = datetime.now(self.ist_tz) - timedelta(days=days)

        with sqlite3.connect(self.db_path) as conn:
            # Get completed trades
            completed_trades = conn.execute('''
                SELECT pnl, pnl_percentage, holding_period_minutes, exit_reason
                FROM trades
                WHERE exit_time IS NOT NULL AND entry_time >= ?
            ''', (start_date.isoformat(),)).fetchall()

            if not completed_trades:
                return {"error": "No completed trades found in period"}

            # Calculate statistics
            pnls = [trade[0] for trade in completed_trades if trade[0] is not None]
            pnl_percentages = [trade[1] for trade in completed_trades if trade[1] is not None]

            stats = {
                "total_trades": len(completed_trades),
                "winning_trades": len([p for p in pnls if p > 0]),
                "losing_trades": len([p for p in pnls if p < 0]),
                "win_rate": len([p for p in pnls if p > 0]) / len(pnls) * 100 if pnls else 0,
                "total_pnl": sum(pnls),
                "average_pnl": sum(pnls) / len(pnls) if pnls else 0,
                "largest_win": max(pnls) if pnls else 0,
                "largest_loss": min(pnls) if pnls else 0,
                "average_holding_period": sum([t[2] for t in completed_trades if t[2]]) / len([t[2] for t in completed_trades if t[2]]) if completed_trades else 0
            }

            return stats

    def export_trades_to_csv(self, filename: str, days: int = 30) -> bool:
        """
        Export trades to CSV file

        Args:
            filename: Output filename
            days: Number of days to export

        Returns:
            Success status
        """
        try:
            start_date = datetime.now(self.ist_tz) - timedelta(days=days)

            with sqlite3.connect(self.db_path) as conn:
                df = pd.read_sql_query('''
                    SELECT * FROM trades
                    WHERE entry_time >= ?
                    ORDER BY entry_time DESC
                ''', conn, params=(start_date.isoformat(),))

            df.to_csv(filename, index=False)
            return True
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            return False

# Example usage and testing
if __name__ == "__main__":
    # Initialize logger
    logger = TradeLogger()

    # Example trade entry
    trade_entry = TradeEntry(
        trade_id="trade_001",
        symbol="NSE:NIFTY",
        trade_type=TradeType.LONG,
        quantity=50,
        entry_price=22500,
        entry_time=datetime.now(pytz.timezone('Asia/Kolkata')),
        strategy="Gap Up Momentum",
        market_condition=MarketCondition.BULLISH,
        emotional_state=EmotionalState.CONFIDENT,
        confidence_level=8,
        risk_amount=5000,
        stop_loss=22400,
        target_price=22600,
        notes="Strong gap up after positive news"
    )

    # Log trade entry
    success = logger.log_trade_entry(trade_entry)
    print(f"Trade entry logged: {success}")

    # Example trade exit (after some time)
    trade_exit = TradeExit(
        trade_id="trade_001",
        exit_price=22580,
        exit_time=datetime.now(pytz.timezone('Asia/Kolkata')) + timedelta(minutes=45),
        quantity=50,
        exit_reason="Target hit",
        emotional_state=EmotionalState.CONFIDENT,
        lessons_learned="Good entry timing, held through minor pullback",
        mistakes_made="Could have added to position on dip"
    )

    # Log trade exit
    success = logger.log_trade_exit(trade_exit)
    print(f"Trade exit logged: {success}")

    # Get statistics
    stats = logger.get_trade_statistics(days=30)
    print(f"Trading Statistics: {stats}")

    # Export to CSV
    success = logger.export_trades_to_csv("trades_export.csv")
    print(f"Export successful: {success}")
