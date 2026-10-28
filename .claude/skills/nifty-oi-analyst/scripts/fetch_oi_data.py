#!/usr/bin/env python3
"""
fetch_oi_data.py — Fetch live Nifty/BankNifty options chain OI data from NSE.

Part of: nifty-oi-analyst skill (NotSoSEBI Trading Skills)
Uses: nsepython for live NSE data, with fallback to direct NSE website scraping.

Usage:
    python fetch_oi_data.py --symbol NIFTY
    python fetch_oi_data.py --symbol BANKNIFTY --expiry 2026-04-09
    python fetch_oi_data.py --symbol NIFTY --output json
"""

import argparse
import json
import sys
from datetime import datetime, date
from typing import Optional

import pandas as pd
import pytz
import requests

IST = pytz.timezone("Asia/Kolkata")

# NSE headers required to avoid 403 — NSE blocks requests without proper headers
NSE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.nseindia.com/option-chain",
    "X-Requested-With": "XMLHttpRequest",
}

NSE_BASE_URL = "https://www.nseindia.com"
NSE_OPTION_CHAIN_URL = f"{NSE_BASE_URL}/api/option-chain-indices"
NSE_STOCK_OPTION_CHAIN_URL = f"{NSE_BASE_URL}/api/option-chain-equities"

# Default lot sizes (as of 2026 — verify against docs/fno-lot-sizes.md)
DEFAULT_LOT_SIZES: dict[str, int] = {
    "NIFTY": 25,
    "BANKNIFTY": 15,
    "FINNIFTY": 25,
    "MIDCPNIFTY": 50,
}


def get_nse_session() -> requests.Session:
    """
    Create a requests session with NSE cookies.
    NSE requires visiting the main page first to get session cookies.
    """
    session = requests.Session()
    session.headers.update(NSE_HEADERS)
    # Hit the main page first to get cookies
    try:
        session.get(NSE_BASE_URL, timeout=10)
    except requests.RequestException:
        pass  # Cookie fetch may fail — proceed anyway
    return session


def fetch_option_chain_nse(
    symbol: str = "NIFTY",
    session: Optional[requests.Session] = None,
) -> dict:
    """
    Fetch raw option chain JSON from NSE website API.

    Args:
        symbol: Index symbol (NIFTY, BANKNIFTY, FINNIFTY, MIDCPNIFTY)
        session: Optional pre-configured requests session

    Returns:
        Raw JSON response from NSE API

    Raises:
        ConnectionError: If NSE API is unreachable
        ValueError: If response is not valid JSON
    """
    if session is None:
        session = get_nse_session()

    url = NSE_OPTION_CHAIN_URL
    params = {"symbol": symbol}

    try:
        response = session.get(url, params=params, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if response.status_code == 403:
            raise ConnectionError(
                "NSE returned 403 Forbidden. Try again in a few seconds — "
                "NSE rate-limits requests. If persistent, cookies may have expired."
            ) from e
        raise ConnectionError(f"NSE API error: {response.status_code}") from e
    except requests.exceptions.RequestException as e:
        raise ConnectionError(f"Failed to reach NSE: {e}") from e
    except json.JSONDecodeError as e:
        raise ValueError("NSE returned non-JSON response — site may be down") from e


def fetch_option_chain_nsepython(symbol: str = "NIFTY") -> dict:
    """
    Fetch option chain using nsepython library (alternative method).
    Falls back gracefully if nsepython is not installed.
    """
    try:
        from nsepython import nse_optionchain_scrapper
        return nse_optionchain_scrapper(symbol)
    except ImportError:
        raise ImportError(
            "nsepython not installed. Install with: pip install nsepython"
        )
    except Exception as e:
        raise ConnectionError(f"nsepython fetch failed: {e}") from e


def parse_option_chain(raw_data: dict) -> tuple[pd.DataFrame, dict]:
    """
    Parse raw NSE option chain JSON into a clean DataFrame and metadata.

    Args:
        raw_data: Raw JSON from NSE API

    Returns:
        Tuple of (option_chain_df, metadata_dict)
        - option_chain_df columns: strike, ce_oi, ce_chg_oi, ce_volume, ce_iv,
          ce_ltp, ce_bid, ce_ask, pe_oi, pe_chg_oi, pe_volume, pe_iv, pe_ltp,
          pe_bid, pe_ask
        - metadata: spot_price, timestamp, expiry_dates, underlying, etc.
    """
    records_data = raw_data.get("records", {})
    filtered_data = raw_data.get("filtered", {})

    # Extract metadata
    metadata = {
        "timestamp": records_data.get("timestamp", ""),
        "underlying_value": records_data.get("underlyingValue", 0),
        "expiry_dates": records_data.get("expiryDates", []),
        "strikePrices": records_data.get("strikePrices", []),
        "total_ce_oi": filtered_data.get("CE", {}).get("totOI", 0),
        "total_pe_oi": filtered_data.get("PE", {}).get("totOI", 0),
        "total_ce_volume": filtered_data.get("CE", {}).get("totVol", 0),
        "total_pe_volume": filtered_data.get("PE", {}).get("totVol", 0),
    }

    # Parse strike-wise data
    rows = []
    data_records = filtered_data.get("data", records_data.get("data", []))

    for record in data_records:
        strike = record.get("strikePrice", 0)
        ce = record.get("CE", {})
        pe = record.get("PE", {})

        row = {
            "strike": strike,
            "expiry": record.get("expiryDate", ""),
            # Call side
            "ce_oi": ce.get("openInterest", 0),
            "ce_chg_oi": ce.get("changeinOpenInterest", 0),
            "ce_volume": ce.get("totalTradedVolume", 0),
            "ce_iv": ce.get("impliedVolatility", 0),
            "ce_ltp": ce.get("lastPrice", 0),
            "ce_bid": ce.get("bidprice", 0),
            "ce_ask": ce.get("askPrice", 0),
            "ce_net_chg": ce.get("change", 0),
            "ce_total_buy_qty": ce.get("totalBuyQuantity", 0),
            "ce_total_sell_qty": ce.get("totalSellQuantity", 0),
            # Put side
            "pe_oi": pe.get("openInterest", 0),
            "pe_chg_oi": pe.get("changeinOpenInterest", 0),
            "pe_volume": pe.get("totalTradedVolume", 0),
            "pe_iv": pe.get("impliedVolatility", 0),
            "pe_ltp": pe.get("lastPrice", 0),
            "pe_bid": pe.get("bidprice", 0),
            "pe_ask": pe.get("askPrice", 0),
            "pe_net_chg": pe.get("change", 0),
            "pe_total_buy_qty": pe.get("totalBuyQuantity", 0),
            "pe_total_sell_qty": pe.get("totalSellQuantity", 0),
        }
        rows.append(row)

    df = pd.DataFrame(rows)

    if not df.empty:
        df = df.sort_values("strike").reset_index(drop=True)

    return df, metadata


def filter_by_expiry(df: pd.DataFrame, expiry: str) -> pd.DataFrame:
    """
    Filter option chain DataFrame for a specific expiry date.

    Args:
        df: Full option chain DataFrame
        expiry: Expiry date string (as returned by NSE, e.g., '09-Apr-2026')

    Returns:
        Filtered DataFrame for the specified expiry
    """
    if "expiry" in df.columns:
        return df[df["expiry"] == expiry].reset_index(drop=True)
    return df


def get_relevant_strikes(
    df: pd.DataFrame,
    spot_price: float,
    num_strikes: int = 15,
) -> pd.DataFrame:
    """
    Filter to strikes around the spot price (ATM ± num_strikes).

    Args:
        df: Option chain DataFrame
        spot_price: Current spot/underlying price
        num_strikes: Number of strikes on each side of ATM

    Returns:
        Filtered DataFrame with relevant strikes only
    """
    if df.empty:
        return df

    # Find ATM strike (closest to spot)
    df = df.copy()
    df["dist_from_spot"] = abs(df["strike"] - spot_price)
    atm_idx = df["dist_from_spot"].idxmin()
    atm_strike = df.loc[atm_idx, "strike"]

    # Get strikes sorted by distance from ATM
    df_sorted = df.sort_values("strike")
    atm_pos = df_sorted[df_sorted["strike"] == atm_strike].index[0]

    # Calculate range indices
    all_indices = df_sorted.index.tolist()
    atm_list_pos = all_indices.index(atm_pos)
    start = max(0, atm_list_pos - num_strikes)
    end = min(len(all_indices), atm_list_pos + num_strikes + 1)

    relevant_indices = all_indices[start:end]
    result = df_sorted.loc[relevant_indices].drop(columns=["dist_from_spot"])

    return result.reset_index(drop=True)


def compute_pcr(df: pd.DataFrame) -> dict:
    """
    Compute Put-Call Ratio metrics from option chain data.

    Returns:
        Dict with pcr_oi, pcr_volume, pcr_chg_oi
    """
    total_ce_oi = df["ce_oi"].sum()
    total_pe_oi = df["pe_oi"].sum()
    total_ce_vol = df["ce_volume"].sum()
    total_pe_vol = df["pe_volume"].sum()
    total_ce_chg = df["ce_chg_oi"].sum()
    total_pe_chg = df["pe_chg_oi"].sum()

    return {
        "pcr_oi": round(total_pe_oi / total_ce_oi, 4) if total_ce_oi > 0 else 0,
        "pcr_volume": round(total_pe_vol / total_ce_vol, 4) if total_ce_vol > 0 else 0,
        "pcr_chg_oi": round(total_pe_chg / total_ce_chg, 4) if total_ce_chg != 0 else 0,
        "total_ce_oi": int(total_ce_oi),
        "total_pe_oi": int(total_pe_oi),
        "total_ce_volume": int(total_ce_vol),
        "total_pe_volume": int(total_pe_vol),
    }


def get_top_oi_strikes(
    df: pd.DataFrame, top_n: int = 5
) -> dict[str, pd.DataFrame]:
    """
    Get strikes with highest OI for calls and puts.

    Returns:
        Dict with 'top_ce_oi' and 'top_pe_oi' DataFrames
    """
    top_ce = (
        df.nlargest(top_n, "ce_oi")[["strike", "ce_oi", "ce_chg_oi", "ce_iv"]]
        .reset_index(drop=True)
    )
    top_pe = (
        df.nlargest(top_n, "pe_oi")[["strike", "pe_oi", "pe_chg_oi", "pe_iv"]]
        .reset_index(drop=True)
    )

    return {"top_ce_oi": top_ce, "top_pe_oi": top_pe}


def get_top_oi_change_strikes(
    df: pd.DataFrame, top_n: int = 5
) -> dict[str, pd.DataFrame]:
    """
    Get strikes with highest change in OI for calls and puts.

    Returns:
        Dict with 'top_ce_chg', 'top_pe_chg', 'top_ce_unwind', 'top_pe_unwind'
    """
    # Top OI additions
    top_ce_chg = (
        df.nlargest(top_n, "ce_chg_oi")[["strike", "ce_chg_oi", "ce_oi", "ce_iv"]]
        .reset_index(drop=True)
    )
    top_pe_chg = (
        df.nlargest(top_n, "pe_chg_oi")[["strike", "pe_chg_oi", "pe_oi", "pe_iv"]]
        .reset_index(drop=True)
    )

    # Top OI unwinding (most negative change)
    top_ce_unwind = (
        df.nsmallest(top_n, "ce_chg_oi")[["strike", "ce_chg_oi", "ce_oi", "ce_iv"]]
        .reset_index(drop=True)
    )
    top_pe_unwind = (
        df.nsmallest(top_n, "pe_chg_oi")[["strike", "pe_chg_oi", "pe_oi", "pe_iv"]]
        .reset_index(drop=True)
    )

    return {
        "top_ce_chg": top_ce_chg,
        "top_pe_chg": top_pe_chg,
        "top_ce_unwind": top_ce_unwind,
        "top_pe_unwind": top_pe_unwind,
    }


def get_straddle_premium(df: pd.DataFrame, spot_price: float) -> dict:
    """
    Calculate ATM straddle premium and expected range.

    Returns:
        Dict with atm_strike, ce_premium, pe_premium, straddle_premium,
        expected_low, expected_high
    """
    if df.empty:
        return {}

    # Find ATM strike
    df_copy = df.copy()
    df_copy["dist"] = abs(df_copy["strike"] - spot_price)
    atm_idx = df_copy["dist"].idxmin()
    atm_row = df_copy.loc[atm_idx]

    atm_strike = int(atm_row["strike"])
    ce_premium = float(atm_row["ce_ltp"])
    pe_premium = float(atm_row["pe_ltp"])
    straddle = ce_premium + pe_premium

    return {
        "atm_strike": atm_strike,
        "ce_premium": round(ce_premium, 2),
        "pe_premium": round(pe_premium, 2),
        "straddle_premium": round(straddle, 2),
        "expected_low": round(atm_strike - straddle, 2),
        "expected_high": round(atm_strike + straddle, 2),
    }


def fetch_and_analyze(
    symbol: str = "NIFTY",
    expiry: Optional[str] = None,
    num_strikes: int = 15,
    use_nsepython: bool = False,
) -> dict:
    """
    Complete OI fetch and analysis pipeline.

    Args:
        symbol: NIFTY, BANKNIFTY, FINNIFTY, MIDCPNIFTY
        expiry: Specific expiry date string (None = nearest expiry)
        num_strikes: Number of strikes around ATM to analyze
        use_nsepython: Use nsepython library instead of direct NSE API

    Returns:
        Comprehensive analysis dict with all OI metrics
    """
    # Fetch raw data
    if use_nsepython:
        raw_data = fetch_option_chain_nsepython(symbol)
    else:
        raw_data = fetch_option_chain_nse(symbol)

    # Parse
    df, metadata = parse_option_chain(raw_data)

    if df.empty:
        return {"error": "No data returned from NSE", "metadata": metadata}

    spot_price = metadata["underlying_value"]

    # Filter by expiry if specified
    if expiry:
        df = filter_by_expiry(df, expiry)
    elif metadata["expiry_dates"]:
        # Default to nearest expiry
        nearest_expiry = metadata["expiry_dates"][0]
        df = filter_by_expiry(df, nearest_expiry)
        metadata["selected_expiry"] = nearest_expiry

    # Get relevant strikes around ATM
    df_relevant = get_relevant_strikes(df, spot_price, num_strikes)

    # Compute all metrics
    pcr = compute_pcr(df)
    top_oi = get_top_oi_strikes(df)
    top_chg = get_top_oi_change_strikes(df)
    straddle = get_straddle_premium(df, spot_price)

    # Identify support/resistance from OI
    if not df.empty:
        # Resistance = highest CE OI strike (above spot)
        ce_above = df[df["strike"] > spot_price]
        resistance_strikes = (
            ce_above.nlargest(3, "ce_oi")[["strike", "ce_oi"]].to_dict("records")
            if not ce_above.empty
            else []
        )

        # Support = highest PE OI strike (below spot)
        pe_below = df[df["strike"] < spot_price]
        support_strikes = (
            pe_below.nlargest(3, "pe_oi")[["strike", "pe_oi"]].to_dict("records")
            if not pe_below.empty
            else []
        )
    else:
        resistance_strikes = []
        support_strikes = []

    # PCR sentiment interpretation
    pcr_val = pcr["pcr_oi"]
    if pcr_val > 1.5:
        pcr_sentiment = "Extremely Bullish (contrarian caution zone)"
    elif pcr_val > 1.2:
        pcr_sentiment = "Bullish"
    elif pcr_val > 0.8:
        pcr_sentiment = "Neutral"
    elif pcr_val > 0.5:
        pcr_sentiment = "Bearish"
    else:
        pcr_sentiment = "Extremely Bearish (contrarian bounce zone)"

    return {
        "symbol": symbol,
        "spot_price": spot_price,
        "timestamp": metadata["timestamp"],
        "selected_expiry": metadata.get("selected_expiry", expiry),
        "available_expiries": metadata["expiry_dates"],
        "lot_size": DEFAULT_LOT_SIZES.get(symbol, 25),
        "pcr": pcr,
        "pcr_sentiment": pcr_sentiment,
        "straddle": straddle,
        "resistance_levels": resistance_strikes,
        "support_levels": support_strikes,
        "top_oi": {
            "top_ce_oi": top_oi["top_ce_oi"].to_dict("records"),
            "top_pe_oi": top_oi["top_pe_oi"].to_dict("records"),
        },
        "top_oi_change": {
            "top_ce_additions": top_chg["top_ce_chg"].to_dict("records"),
            "top_pe_additions": top_chg["top_pe_chg"].to_dict("records"),
            "top_ce_unwinding": top_chg["top_ce_unwind"].to_dict("records"),
            "top_pe_unwinding": top_chg["top_pe_unwind"].to_dict("records"),
        },
        "chain_data": df_relevant.to_dict("records"),
        "metadata": metadata,
    }


def format_report(analysis: dict) -> str:
    """
    Format analysis results into NotSoSEBI OI report.
    """
    if "error" in analysis:
        return f"❌ Error: {analysis['error']}"

    sym = analysis["symbol"]
    spot = analysis["spot_price"]
    expiry = analysis.get("selected_expiry", "N/A")
    pcr = analysis["pcr"]
    straddle = analysis.get("straddle", {})
    resistance = analysis["resistance_levels"]
    support = analysis["support_levels"]
    pcr_sent = analysis["pcr_sentiment"]
    timestamp = analysis["timestamp"]
    top_chg = analysis["top_oi_change"]

    lines = [
        f"📊 NotSoSEBI OI Analysis — {sym} | Expiry: {expiry}",
        "━" * 55,
        f"📈 Spot: {spot:,.2f}",
        f"📊 PCR (OI): {pcr['pcr_oi']:.4f} | Sentiment: {pcr_sent}",
    ]

    if straddle:
        lines.append(
            f"🔒 ATM Straddle ({straddle['atm_strike']}): ₹{straddle['straddle_premium']:.2f} "
            f"| Range: {straddle['expected_low']:,.0f}–{straddle['expected_high']:,.0f}"
        )

    lines.append("")
    lines.append("📍 KEY LEVELS (from OI)")

    if resistance:
        r_strs = [f"  {r['strike']:,} (CE OI: {r['ce_oi']:,})" for r in resistance]
        lines.append("  Resistance: " + " → ".join(r_strs[:2]))
    if support:
        s_strs = [f"  {s['strike']:,} (PE OI: {s['pe_oi']:,})" for s in support]
        lines.append("  Support:    " + " → ".join(s_strs[:2]))

    lines.append("")
    lines.append("📊 TOP CHANGE IN OI")

    ce_adds = top_chg.get("top_ce_additions", [])[:3]
    pe_adds = top_chg.get("top_pe_additions", [])[:3]

    if ce_adds:
        ce_str = ", ".join(
            f"{r['strike']:,} (+{r['ce_chg_oi']:,})" for r in ce_adds if r["ce_chg_oi"] > 0
        )
        if ce_str:
            lines.append(f"  CE Writers Active: {ce_str}")

    if pe_adds:
        pe_str = ", ".join(
            f"{r['strike']:,} (+{r['pe_chg_oi']:,})" for r in pe_adds if r["pe_chg_oi"] > 0
        )
        if pe_str:
            lines.append(f"  PE Writers Active: {pe_str}")

    lines.append("")
    lines.append("📊 TOTALS")
    lines.append(f"  Total CE OI: {pcr['total_ce_oi']:,} | Total PE OI: {pcr['total_pe_oi']:,}")
    lines.append(
        f"  Total CE Vol: {pcr['total_ce_volume']:,} | Total PE Vol: {pcr['total_pe_volume']:,}"
    )

    lines.append("")
    lines.append(f"⏰ Data as of {timestamp} IST | Source: NSE")
    lines.append("— NotSoSEBI (@NotSoSEBI | oi.notsosebi.in)")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch and analyze NSE options chain OI data (NotSoSEBI)"
    )
    parser.add_argument(
        "--symbol",
        type=str,
        default="NIFTY",
        choices=["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"],
        help="Index symbol (default: NIFTY)",
    )
    parser.add_argument(
        "--expiry",
        type=str,
        default=None,
        help="Expiry date (e.g., '09-Apr-2026'). Default: nearest expiry.",
    )
    parser.add_argument(
        "--strikes",
        type=int,
        default=15,
        help="Number of strikes around ATM to analyze (default: 15)",
    )
    parser.add_argument(
        "--output",
        type=str,
        choices=["report", "json", "csv"],
        default="report",
        help="Output format (default: report)",
    )
    parser.add_argument(
        "--use-nsepython",
        action="store_true",
        help="Use nsepython library instead of direct NSE API",
    )

    args = parser.parse_args()

    try:
        analysis = fetch_and_analyze(
            symbol=args.symbol,
            expiry=args.expiry,
            num_strikes=args.strikes,
            use_nsepython=args.use_nsepython,
        )

        if args.output == "json":
            # Remove chain_data for cleaner JSON output (it's large)
            output = {k: v for k, v in analysis.items() if k != "chain_data"}
            print(json.dumps(output, indent=2, default=str))
        elif args.output == "csv":
            if "chain_data" in analysis and analysis["chain_data"]:
                df = pd.DataFrame(analysis["chain_data"])
                print(df.to_csv(index=False))
            else:
                print("No chain data available")
        else:
            print(format_report(analysis))

    except (ConnectionError, ValueError, ImportError) as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
