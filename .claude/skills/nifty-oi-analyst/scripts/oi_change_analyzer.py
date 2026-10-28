#!/usr/bin/env python3
"""
oi_change_analyzer.py — OI change pattern detection for Nifty/BankNifty.

Part of: nifty-oi-analyst skill (NotSoSEBI Trading Skills)
"""

import pandas as pd


def classify_buildup(price_change: float, oi_change: float) -> str:
    """
    Classify OI buildup using the price+OI four-quadrant framework.

    Args:
        price_change: Change in underlying price (positive = up)
        oi_change: Change in open interest (positive = increase)

    Returns:
        One of: "long_buildup", "short_buildup",
                "long_unwinding", "short_covering"
    """
    if price_change >= 0 and oi_change >= 0:
        return "long_buildup"
    if price_change < 0 and oi_change >= 0:
        return "short_buildup"
    if price_change < 0 and oi_change < 0:
        return "long_unwinding"
    return "short_covering"


def identify_walls(
    chain_df: pd.DataFrame,
    threshold: int = 1_000_000,
) -> dict[str, list[dict]]:
    """
    Find strikes with heavy OI that act as support/resistance walls.

    Args:
        chain_df: DataFrame with columns: strike, ce_oi, pe_oi
        threshold: Minimum OI to qualify as a wall

    Returns:
        {"resistance": [{strike, ce_oi}], "support": [{strike, pe_oi}]}
    """
    resistance = (
        chain_df.loc[chain_df["ce_oi"] >= threshold, ["strike", "ce_oi"]]
        .sort_values("ce_oi", ascending=False)
        .to_dict("records")
    )
    support = (
        chain_df.loc[chain_df["pe_oi"] >= threshold, ["strike", "pe_oi"]]
        .sort_values("pe_oi", ascending=False)
        .to_dict("records")
    )
    return {"resistance": resistance, "support": support}


def detect_oi_shifts(
    chain_df: pd.DataFrame,
    prev_chain_df: pd.DataFrame,
    top_n: int = 5,
) -> dict:
    """
    Compare two snapshots to detect where OI shifted between sessions.

    Args:
        chain_df: Current session DataFrame (strike, ce_oi, pe_oi)
        prev_chain_df: Previous session DataFrame (strike, ce_oi, pe_oi)
        top_n: Number of top shifts to return per side

    Returns:
        {
            "ce_additions": [{strike, delta}],   # biggest CE OI increases
            "ce_unwinding": [{strike, delta}],   # biggest CE OI decreases
            "pe_additions": [{strike, delta}],   # biggest PE OI increases
            "pe_unwinding": [{strike, delta}],   # biggest PE OI decreases
            "net_ce_chg": int,
            "net_pe_chg": int,
        }
    """
    merged = chain_df[["strike", "ce_oi", "pe_oi"]].merge(
        prev_chain_df[["strike", "ce_oi", "pe_oi"]],
        on="strike",
        suffixes=("", "_prev"),
    )
    merged["ce_delta"] = merged["ce_oi"] - merged["ce_oi_prev"]
    merged["pe_delta"] = merged["pe_oi"] - merged["pe_oi_prev"]

    ce_add = (
        merged.nlargest(top_n, "ce_delta")[["strike", "ce_delta"]]
        .rename(columns={"ce_delta": "delta"})
        .to_dict("records")
    )
    ce_unw = (
        merged.nsmallest(top_n, "ce_delta")[["strike", "ce_delta"]]
        .rename(columns={"ce_delta": "delta"})
        .to_dict("records")
    )
    pe_add = (
        merged.nlargest(top_n, "pe_delta")[["strike", "pe_delta"]]
        .rename(columns={"pe_delta": "delta"})
        .to_dict("records")
    )
    pe_unw = (
        merged.nsmallest(top_n, "pe_delta")[["strike", "pe_delta"]]
        .rename(columns={"pe_delta": "delta"})
        .to_dict("records")
    )

    return {
        "ce_additions": ce_add,
        "ce_unwinding": ce_unw,
        "pe_additions": pe_add,
        "pe_unwinding": pe_unw,
        "net_ce_chg": int(merged["ce_delta"].sum()),
        "net_pe_chg": int(merged["pe_delta"].sum()),
    }


def generate_report(chain_df: pd.DataFrame, spot: float = 0.0) -> str:
    """
    Produce a concise Markdown OI summary from a single chain snapshot.

    Args:
        chain_df: DataFrame with columns: strike, ce_oi, ce_chg_oi, pe_oi, pe_chg_oi
        spot: Current spot price (0 = omit spot-relative commentary)

    Returns:
        Markdown-formatted report string
    """
    total_ce = int(chain_df["ce_oi"].sum())
    total_pe = int(chain_df["pe_oi"].sum())
    pcr = round(total_pe / total_ce, 4) if total_ce else 0.0

    top_ce = chain_df.nlargest(3, "ce_oi")[["strike", "ce_oi"]]
    top_pe = chain_df.nlargest(3, "pe_oi")[["strike", "pe_oi"]]

    has_chg = "ce_chg_oi" in chain_df.columns
    lines = [
        "## OI Snapshot Report",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Total CE OI | {total_ce:,} |",
        f"| Total PE OI | {total_pe:,} |",
        f"| PCR (OI) | {pcr} |",
    ]
    if spot:
        lines.append(f"| Spot | {spot:,.2f} |")
    lines += [
        "",
        "### Resistance (Top CE OI)",
        "| Strike | CE OI |",
        "|--------|-------|",
    ]
    for _, r in top_ce.iterrows():
        lines.append(f"| {int(r['strike']):,} | {int(r['ce_oi']):,} |")

    lines += [
        "",
        "### Support (Top PE OI)",
        "| Strike | PE OI |",
        "|--------|-------|",
    ]
    for _, r in top_pe.iterrows():
        lines.append(f"| {int(r['strike']):,} | {int(r['pe_oi']):,} |")

    if has_chg:
        ce_add = chain_df.nlargest(3, "ce_chg_oi")[["strike", "ce_chg_oi"]]
        pe_add = chain_df.nlargest(3, "pe_chg_oi")[["strike", "pe_chg_oi"]]
        lines += [
            "",
            "### Top CE OI Additions",
            "| Strike | Chg in OI |",
            "|--------|-----------|",
        ]
        for _, r in ce_add.iterrows():
            lines.append(f"| {int(r['strike']):,} | +{int(r['ce_chg_oi']):,} |")
        lines += [
            "",
            "### Top PE OI Additions",
            "| Strike | Chg in OI |",
            "|--------|-----------|",
        ]
        for _, r in pe_add.iterrows():
            lines.append(f"| {int(r['strike']):,} | +{int(r['pe_chg_oi']):,} |")

    lines += ["", "*— NotSoSEBI OI Analyzer*"]
    return "\n".join(lines)
