"""NSE data fetching utilities — free sources, no API key required. NotSoSEBI."""

from datetime import datetime, date
from typing import Optional

import pandas as pd


def fetch_option_chain(symbol: str = "NIFTY") -> pd.DataFrame:
    """Fetch live option chain from NSE via nsepython. Returns strike-wise DataFrame."""
    try:
        from nsepython import nse_optionchain_scrapper
        raw = nse_optionchain_scrapper(symbol)
        records = raw.get("filtered", raw.get("records", {})).get("data", [])
        rows = []
        for r in records:
            ce, pe = r.get("CE", {}), r.get("PE", {})
            rows.append({
                "strike": r.get("strikePrice", 0),
                "expiry": r.get("expiryDate", ""),
                "ce_oi": ce.get("openInterest", 0),
                "ce_chg_oi": ce.get("changeinOpenInterest", 0),
                "ce_volume": ce.get("totalTradedVolume", 0),
                "ce_iv": ce.get("impliedVolatility", 0),
                "ce_ltp": ce.get("lastPrice", 0),
                "pe_oi": pe.get("openInterest", 0),
                "pe_chg_oi": pe.get("changeinOpenInterest", 0),
                "pe_volume": pe.get("totalTradedVolume", 0),
                "pe_iv": pe.get("impliedVolatility", 0),
                "pe_ltp": pe.get("lastPrice", 0),
            })
        return pd.DataFrame(rows).sort_values("strike", ignore_index=True)
    except ImportError:
        raise ImportError("nsepython not installed — pip install nsepython")
    except Exception as e:
        raise ConnectionError(f"NSE option chain fetch failed: {e}") from e


def fetch_fii_dii_data(dt: Optional[str] = None) -> dict:
    """Fetch FII/DII daily cash-market data from NSE. date fmt: 'DD-MMM-YYYY'."""
    try:
        from nsepython import nse_fii_dii_data
        data = nse_fii_dii_data()
        return data if isinstance(data, dict) else {"raw": data}
    except ImportError:
        raise ImportError("nsepython not installed — pip install nsepython")
    except Exception as e:
        raise ConnectionError(f"FII/DII data fetch failed: {e}") from e


def fetch_historical_data(
    symbol: str, from_date: str, to_date: str, is_index: bool = False,
) -> pd.DataFrame:
    """Fetch historical OHLCV via jugaad-data. Dates as 'YYYY-MM-DD'."""
    try:
        if is_index:
            from jugaad_data.nse import index_df
            return index_df(symbol, from_date, to_date)
        from jugaad_data.nse import stock_df
        return stock_df(symbol, from_date, to_date)
    except ImportError:
        raise ImportError("jugaad-data not installed — pip install jugaad-data")
    except Exception as e:
        raise ConnectionError(f"Historical data fetch failed for {symbol}: {e}") from e


def fetch_sectoral_indices() -> pd.DataFrame:
    """Fetch all NSE sectoral index values via nsepython."""
    try:
        from nsepython import nse_get_index_list, nse_index
        indices = nse_get_index_list()
        rows = []
        for name in indices:
            try:
                info = nse_index(name)
                rows.append({"index": name, "last": info.get("last", 0),
                             "change": info.get("change", 0),
                             "pct_change": info.get("percChange", 0)})
            except Exception:
                continue
        return pd.DataFrame(rows)
    except ImportError:
        raise ImportError("nsepython not installed — pip install nsepython")
    except Exception as e:
        raise ConnectionError(f"Sectoral indices fetch failed: {e}") from e


class NSEDataFetcher:
    """Class-based interface for NSE data fetching"""

    def __init__(self):
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes

    def get_market_snapshot(self) -> dict:
        """Get current market snapshot for major indices"""
        try:
            from nsepython import nse_get_index_list, nse_index

            indices = ["NIFTY 50", "NIFTY BANK", "NIFTY IT", "NIFTY AUTO"]
            snapshot = {}

            for index_name in indices:
                try:
                    data = nse_index(index_name)
                    key = index_name.lower().replace("nifty ", "").replace(" ", "")
                    snapshot[key] = {
                        "price": data.get("last", 0),
                        "change": data.get("change", 0),
                        "change_percent": data.get("percChange", 0),
                        "high": data.get("dayHigh", 0),
                        "low": data.get("dayLow", 0),
                        "open": data.get("open", 0),
                        "volume": data.get("volume", 0)
                    }
                except Exception as e:
                    continue

            return snapshot
        except Exception as e:
            raise ConnectionError(f"Market snapshot fetch failed: {e}")

    def get_index_data(self, index_name: str) -> dict:
        """Get detailed data for a specific index"""
        try:
            from nsepython import nse_index

            # Map common names to NSE format
            name_mapping = {
                "nifty": "NIFTY 50",
                "banknifty": "NIFTY BANK",
                "sensex": "NIFTY 50"  # Approximation
            }

            nse_name = name_mapping.get(index_name.lower(), index_name.upper())
            data = nse_index(nse_name)

            return {
                "price": data.get("last", 0),
                "change": data.get("change", 0),
                "change_percent": data.get("percChange", 0),
                "high": data.get("dayHigh", 0),
                "low": data.get("dayLow", 0),
                "open": data.get("open", 0),
                "volume": data.get("volume", 0),
                "constituents": [],  # Would need separate API
                "sector_weights": {}  # Would need separate calculation
            }
        except Exception as e:
            raise ConnectionError(f"Index data fetch failed for {index_name}: {e}")

    def get_stock_quote(self, symbol: str) -> dict:
        """Get stock quote data"""
        try:
            from nsepython import nse_quote

            data = nse_quote(symbol)
            return {
                "price": data.get("lastPrice", 0),
                "change": data.get("change", 0),
                "change_percent": data.get("pChange", 0),
                "volume": data.get("totalTradedVolume", 0),
                "high": data.get("dayHigh", 0),
                "low": data.get("dayLow", 0),
                "open": data.get("open", 0),
                "market_cap": 0,  # Not available in basic quote
                "pe_ratio": data.get("pe", 0),
                "pb_ratio": 0,
                "div_yield": 0,
                "52w_high": data.get("yearHigh", 0),
                "52w_low": data.get("yearLow", 0),
                "sector": "",
                "industry": ""
            }
        except Exception as e:
            raise ConnectionError(f"Stock quote fetch failed for {symbol}: {e}")

    def get_option_chain(self, symbol: str = "NIFTY") -> dict:
        """Get option chain data for heatmap"""
        try:
            df = fetch_option_chain(symbol)

            # Convert to heatmap format
            strikes = df["strike"].tolist()
            calls_oi = df["ce_oi"].tolist()
            puts_oi = df["pe_oi"].tolist()
            calls_change = df["ce_chg_oi"].tolist()
            puts_change = df["pe_chg_oi"].tolist()

            return {
                symbol.lower(): {
                    "strikes": strikes,
                    "calls": calls_oi,
                    "puts": puts_oi,
                    "call_changes": calls_change,
                    "put_changes": puts_change
                },
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise ConnectionError(f"Option chain fetch failed for {symbol}: {e}")

    def get_fii_dii_data(self) -> dict:
        """Get FII/DII flow data"""
        try:
            data = fetch_fii_dii_data()
            return data
        except Exception as e:
            raise ConnectionError(f"FII/DII data fetch failed: {e}")