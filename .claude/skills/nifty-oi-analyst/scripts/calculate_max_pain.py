#!/usr/bin/env python3
"""
calculate_max_pain.py — Max Pain calculation engine for Nifty/BankNifty options.

Part of: nifty-oi-analyst skill (NotSoSEBI Trading Skills)

Calculates the strike price where option writers collectively lose the least
amount of money. Supports visualization of the pain curve.

Usage:
    python calculate_max_pain.py --symbol NIFTY
    python calculate_max_pain.py --symbol BANKNIFTY --plot
    python calculate_max_pain.py --symbol NIFTY --output json
"""

import argparse
import json
import sys
from typing import Optional

import pandas as pd
import pytz

IST = pytz.timezone("Asia/Kolkata")

# Default lot sizes (as of 2026 — verify against docs/fno-lot-sizes.md)
DEFAULT_LOT_SIZES: dict[str, int] = {
    "NIFTY": 25,
    "BANKNIFTY": 15,
    "FINNIFTY": 25,
    "MIDCPNIFTY": 50,
}


def calculate_max_pain(
    chain_data: pd.DataFrame,
    lot_size: int = 25,
) -> dict:
    """
    Calculate max pain strike from option chain data.

    The max pain strike is where the total value of all options (CE + PE) that
    would expire ITM is minimized — i.e., option writers lose the least.

    Args:
        chain_data: DataFrame with columns: strike, ce_oi, pe_oi
                    OI values should be in number of contracts (not lots)
        lot_size: Contract lot size (Nifty=25, BankNifty=15)

    Returns:
        Dict with:
            - max_pain_strike: The max pain strike price
            - total_pain_at_max_pain: Pain value at max pain (in INR)
            - pain_curve: Dict mapping each strike to its total pain value
            - ce_pain_curve: Dict mapping each strike to CE-only pain
            - pe_pain_curve: Dict mapping each strike to PE-only pain
    """
    if chain_data.empty:
        return {
            "max_pain_strike": 0,
            "total_pain_at_max_pain": 0,
            "pain_curve": {},
            "ce_pain_curve": {},
            "pe_pain_curve": {},
        }

    strikes = sorted(chain_data["strike"].unique())
    ce_oi = dict(zip(chain_data["strike"], chain_data["ce_oi"]))
    pe_oi = dict(zip(chain_data["strike"], chain_data["pe_oi"]))

    pain_curve: dict[float, float] = {}
    ce_pain_curve: dict[float, float] = {}
    pe_pain_curve: dict[float, float] = {}

    for settlement in strikes:
        ce_pain = 0.0
        pe_pain = 0.0

        for strike in strikes:
            # CE pain: if settlement > strike, CE expires ITM → pain for CE buyers
            # (which is profit for CE holders, loss for CE writers)
            # We calculate pain for BUYERS (what they lose) = what expires OTM
            # Actually: max pain = strike where total ITM value is minimum
            # ITM CE value at settlement S for strike K: max(0, S - K) * OI * lot
            # ITM PE value at settlement S for strike K: max(0, K - S) * OI * lot

            ce_itm_value = max(0, settlement - strike) * ce_oi.get(strike, 0) * lot_size
            pe_itm_value = max(0, strike - settlement) * pe_oi.get(strike, 0) * lot_size

            ce_pain += ce_itm_value
            pe_pain += pe_itm_value

        pain_curve[settlement] = ce_pain + pe_pain
        ce_pain_curve[settlement] = ce_pain
        pe_pain_curve[settlement] = pe_pain

    # Max pain = strike with MINIMUM total pain
    max_pain_strike = min(pain_curve, key=pain_curve.get)  # type: ignore[arg-type]

    return {
        "max_pain_strike": max_pain_strike,
        "total_pain_at_max_pain": pain_curve[max_pain_strike],
        "pain_curve": pain_curve,
        "ce_pain_curve": ce_pain_curve,
        "pe_pain_curve": pe_pain_curve,
    }


def calculate_max_pain_from_raw(
    raw_chain: list[dict],
    lot_size: int = 25,
) -> dict:
    """
    Convenience wrapper: calculate max pain from a list of dicts
    (e.g., from fetch_oi_data.py output).

    Args:
        raw_chain: List of dicts with keys: strike, ce_oi, pe_oi
        lot_size: Contract lot size

    Returns:
        Max pain analysis dict
    """
    df = pd.DataFrame(raw_chain)
    required_cols = {"strike", "ce_oi", "pe_oi"}
    if not required_cols.issubset(df.columns):
        missing = required_cols - set(df.columns)
        raise ValueError(f"Missing required columns: {missing}")

    return calculate_max_pain(df, lot_size)


def get_pain_distribution(
    pain_result: dict,
    spot_price: float,
    num_strikes: int = 10,
) -> pd.DataFrame:
    """
    Get a summary table of pain distribution around spot.

    Args:
        pain_result: Output from calculate_max_pain()
        spot_price: Current spot/underlying price
        num_strikes: Number of strikes on each side of spot

    Returns:
        DataFrame with columns: strike, total_pain, ce_pain, pe_pain,
        is_max_pain, distance_from_spot
    """
    pain_curve = pain_result["pain_curve"]
    ce_pain_curve = pain_result["ce_pain_curve"]
    pe_pain_curve = pain_result["pe_pain_curve"]
    max_pain_strike = pain_result["max_pain_strike"]

    all_strikes = sorted(pain_curve.keys())
    if not all_strikes:
        return pd.DataFrame()

    # Find closest strike to spot
    closest_idx = min(
        range(len(all_strikes)),
        key=lambda i: abs(all_strikes[i] - spot_price),
    )

    start = max(0, closest_idx - num_strikes)
    end = min(len(all_strikes), closest_idx + num_strikes + 1)
    relevant_strikes = all_strikes[start:end]

    rows = []
    for strike in relevant_strikes:
        rows.append(
            {
                "strike": strike,
                "total_pain": pain_curve[strike],
                "ce_pain": ce_pain_curve[strike],
                "pe_pain": pe_pain_curve[strike],
                "is_max_pain": strike == max_pain_strike,
                "distance_from_spot": round(strike - spot_price, 2),
                "total_pain_cr": round(pain_curve[strike] / 1e7, 2),  # In crores
            }
        )

    return pd.DataFrame(rows)


def plot_pain_curve(
    pain_result: dict,
    spot_price: float,
    symbol: str = "NIFTY",
    num_strikes: int = 15,
    save_path: Optional[str] = None,
) -> None:
    """
    Plot the max pain curve with matplotlib.

    Args:
        pain_result: Output from calculate_max_pain()
        spot_price: Current spot price for annotation
        symbol: Index symbol for title
        num_strikes: Number of strikes around spot to display
        save_path: If provided, save plot to this path instead of showing
    """
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not installed. Install with: pip install matplotlib")
        return

    pain_curve = pain_result["pain_curve"]
    ce_pain_curve = pain_result["ce_pain_curve"]
    pe_pain_curve = pain_result["pe_pain_curve"]
    max_pain_strike = pain_result["max_pain_strike"]

    all_strikes = sorted(pain_curve.keys())
    if not all_strikes:
        print("No data to plot")
        return

    # Filter to strikes around spot
    closest_idx = min(
        range(len(all_strikes)),
        key=lambda i: abs(all_strikes[i] - spot_price),
    )
    start = max(0, closest_idx - num_strikes)
    end = min(len(all_strikes), closest_idx + num_strikes + 1)
    strikes = all_strikes[start:end]

    total_pain = [pain_curve[s] / 1e7 for s in strikes]  # Convert to Cr
    ce_pain = [ce_pain_curve[s] / 1e7 for s in strikes]
    pe_pain = [pe_pain_curve[s] / 1e7 for s in strikes]

    fig, ax = plt.subplots(figsize=(14, 7))

    # Stacked area-style bar chart
    ax.bar(
        [str(int(s)) for s in strikes],
        ce_pain,
        label="CE Pain",
        color="#ef5350",
        alpha=0.7,
    )
    ax.bar(
        [str(int(s)) for s in strikes],
        pe_pain,
        bottom=ce_pain,
        label="PE Pain",
        color="#26a69a",
        alpha=0.7,
    )

    # Highlight max pain
    if max_pain_strike in strikes:
        mp_idx = strikes.index(max_pain_strike)
        ax.bar(
            [str(int(max_pain_strike))],
            [total_pain[mp_idx]],
            color="#ffd600",
            alpha=0.9,
            label=f"Max Pain: {int(max_pain_strike)}",
            edgecolor="black",
            linewidth=2,
        )

    # Mark spot price
    ax.axvline(
        x=str(int(min(strikes, key=lambda s: abs(s - spot_price)))),
        color="blue",
        linestyle="--",
        linewidth=1.5,
        label=f"Spot: {spot_price:,.0f}",
    )

    ax.set_xlabel("Strike Price", fontsize=12)
    ax.set_ylabel("Pain (₹ Crores)", fontsize=12)
    ax.set_title(
        f"NotSoSEBI — {symbol} Max Pain Analysis\n"
        f"Max Pain: {int(max_pain_strike)} | Spot: {spot_price:,.0f}",
        fontsize=14,
        fontweight="bold",
    )
    ax.legend(fontsize=10)
    ax.tick_params(axis="x", rotation=45)
    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Plot saved to: {save_path}")
    else:
        plt.show()


def format_max_pain_report(
    pain_result: dict,
    spot_price: float,
    symbol: str = "NIFTY",
    expiry: str = "",
) -> str:
    """
    Format max pain analysis into NotSoSEBI text report.
    """
    mp = pain_result["max_pain_strike"]
    mp_pain = pain_result["total_pain_at_max_pain"]
    diff = spot_price - mp
    diff_pct = (diff / mp) * 100 if mp > 0 else 0

    if abs(diff) < 50:
        proximity = "🎯 Spot is AT max pain — expect pinning / range-bound"
    elif diff > 0:
        proximity = f"📈 Spot is {abs(diff):,.0f} pts ABOVE max pain — gravitational pull downward"
    else:
        proximity = f"📉 Spot is {abs(diff):,.0f} pts BELOW max pain — gravitational pull upward"

    # Pain at nearby strikes
    pain_curve = pain_result["pain_curve"]
    sorted_strikes = sorted(pain_curve.keys(), key=lambda s: abs(s - mp))[:5]

    lines = [
        f"🎯 NotSoSEBI Max Pain Report — {symbol}",
        "━" * 50,
        f"Expiry: {expiry}" if expiry else "",
        f"",
        f"Max Pain Strike: {int(mp):,}",
        f"Spot Price:      {spot_price:,.2f}",
        f"Difference:      {diff:+,.0f} pts ({diff_pct:+.2f}%)",
        f"",
        proximity,
        f"",
        f"Pain at Max Pain: ₹{mp_pain / 1e7:,.2f} Cr",
        f"",
        "📊 Pain at Nearby Strikes:",
    ]

    for strike in sorted(sorted_strikes):
        pain_val = pain_curve[strike]
        marker = " ◄ MAX PAIN" if strike == mp else ""
        lines.append(f"  {int(strike):>8,} → ₹{pain_val / 1e7:>10,.2f} Cr{marker}")

    lines.append("")
    lines.append("💡 Interpretation:")

    if abs(diff) < 100:
        lines.append(
            "  Market is near max pain — high probability of range-bound action."
        )
        lines.append(
            "  Option sellers are comfortable. Good environment for straddle/strangle selling."
        )
    elif diff > 200:
        lines.append(
            "  Spot is significantly above max pain. If no strong trend, "
            "expect gradual drift toward max pain by expiry."
        )
        lines.append(
            "  However, if OI is shifting upward, max pain may follow the spot (bullish regime)."
        )
    elif diff < -200:
        lines.append(
            "  Spot is significantly below max pain. If no strong trend, "
            "expect bounce toward max pain by expiry."
        )
        lines.append(
            "  Watch for PE unwinding as a confirmation of the bounce."
        )
    else:
        lines.append(
            "  Spot is moderately away from max pain. Watch for convergence "
            "starting Wednesday/Thursday of expiry week."
        )

    lines.append("")
    lines.append("— NotSoSEBI (@NotSoSEBI | oi.notsosebi.in)")

    return "\n".join(line for line in lines if line is not None)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Calculate max pain for Nifty/BankNifty options (NotSoSEBI)"
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
        help="Expiry date string (e.g., '09-Apr-2026')",
    )
    parser.add_argument(
        "--plot",
        action="store_true",
        help="Show max pain curve plot",
    )
    parser.add_argument(
        "--save-plot",
        type=str,
        default=None,
        help="Save plot to file path (e.g., max_pain.png)",
    )
    parser.add_argument(
        "--output",
        type=str,
        choices=["report", "json"],
        default="report",
        help="Output format (default: report)",
    )

    args = parser.parse_args()

    # Import fetch_oi_data from same directory
    try:
        from fetch_oi_data import fetch_and_analyze
    except ImportError:
        # Try relative import if running from different directory
        import os
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from fetch_oi_data import fetch_and_analyze

    lot_size = DEFAULT_LOT_SIZES.get(args.symbol, 25)

    print(f"Fetching {args.symbol} option chain data from NSE...\n")

    try:
        analysis = fetch_and_analyze(
            symbol=args.symbol,
            expiry=args.expiry,
        )

        if "error" in analysis:
            print(f"❌ Error: {analysis['error']}")
            sys.exit(1)

        # Build DataFrame from chain data
        chain_df = pd.DataFrame(analysis["chain_data"])

        if chain_df.empty:
            print("❌ No chain data available")
            sys.exit(1)

        # Calculate max pain
        pain_result = calculate_max_pain(chain_df, lot_size)
        spot_price = analysis["spot_price"]
        selected_expiry = analysis.get("selected_expiry", args.expiry or "")

        if args.output == "json":
            output = {
                "symbol": args.symbol,
                "spot_price": spot_price,
                "expiry": selected_expiry,
                "max_pain_strike": pain_result["max_pain_strike"],
                "total_pain_at_max_pain": pain_result["total_pain_at_max_pain"],
                "diff_from_spot": spot_price - pain_result["max_pain_strike"],
            }
            print(json.dumps(output, indent=2))
        else:
            report = format_max_pain_report(
                pain_result, spot_price, args.symbol, selected_expiry
            )
            print(report)

        if args.plot or args.save_plot:
            plot_pain_curve(
                pain_result,
                spot_price,
                args.symbol,
                save_path=args.save_plot,
            )

    except (ConnectionError, ValueError) as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
