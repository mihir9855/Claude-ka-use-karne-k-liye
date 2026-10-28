"""Broker-agnostic API wrapper — NotSoSEBI. Skills use this instead of direct broker SDKs."""

from abc import ABC, abstractmethod
from typing import Optional

import pandas as pd


class BaseBroker(ABC):
    """Abstract interface every broker adapter must implement."""

    @abstractmethod
    def get_ltp(self, symbol: str) -> float: ...

    @abstractmethod
    def get_ohlcv(self, symbol: str, interval: str, from_date: str, to_date: str) -> pd.DataFrame: ...

    @abstractmethod
    def get_option_chain(self, symbol: str, expiry: str) -> pd.DataFrame: ...

    @abstractmethod
    def place_order(self, symbol: str, qty: int, side: str, order_type: str, price: Optional[float] = None) -> dict: ...


class ZerodhaBroker(BaseBroker):
    """Zerodha Kite Connect adapter. Requires KITE_API_KEY & KITE_API_SECRET env vars."""

    def __init__(self, credentials: dict) -> None:
        self.creds = credentials

    def get_ltp(self, symbol: str) -> float:
        raise NotImplementedError("Zerodha: pip install kiteconnect, then set KITE_API_KEY & KITE_API_SECRET")

    def get_ohlcv(self, symbol: str, interval: str, from_date: str, to_date: str) -> pd.DataFrame:
        raise NotImplementedError("Zerodha: requires active Kite Connect subscription (₹2000/mo)")

    def get_option_chain(self, symbol: str, expiry: str) -> pd.DataFrame:
        raise NotImplementedError("Zerodha: use kite.quote() for option chain data")

    def place_order(self, symbol: str, qty: int, side: str, order_type: str, price: Optional[float] = None) -> dict:
        raise NotImplementedError("Zerodha: order placement requires valid access_token from daily login")


class DhanBroker(BaseBroker):
    """Dhan API adapter. Requires DHAN_CLIENT_ID & DHAN_ACCESS_TOKEN env vars."""

    def __init__(self, credentials: dict) -> None:
        self.creds = credentials

    def get_ltp(self, symbol: str) -> float:
        raise NotImplementedError("Dhan: pip install dhanhq, then set DHAN_CLIENT_ID & DHAN_ACCESS_TOKEN")

    def get_ohlcv(self, symbol: str, interval: str, from_date: str, to_date: str) -> pd.DataFrame:
        raise NotImplementedError("Dhan: use dhan.historical_minute_charts() for OHLCV")

    def get_option_chain(self, symbol: str, expiry: str) -> pd.DataFrame:
        raise NotImplementedError("Dhan: use dhan.option_chain() for chain data")

    def place_order(self, symbol: str, qty: int, side: str, order_type: str, price: Optional[float] = None) -> dict:
        raise NotImplementedError("Dhan: order placement requires valid access_token")


def create_broker(name: str, credentials: dict) -> BaseBroker:
    """Factory function. Usage: broker = create_broker('zerodha', {'api_key': '...', ...})"""
    brokers = {"zerodha": ZerodhaBroker, "dhan": DhanBroker}
    if name not in brokers:
        raise ValueError(f"Unsupported broker: {name}. Available: {list(brokers.keys())}")
    return brokers[name](credentials)