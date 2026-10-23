"""Technical and fundamental scoring. Pure functions, no network."""
import pandas as pd

MARKET_PE = 24.0


def clamp(x, lo=0.0, hi=100.0):
    return max(lo, min(hi, x))


def rsi(close: pd.Series, n: int = 14) -> pd.Series:
    d = close.diff()
    gain = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    loss = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + gain / loss.replace(0, 1e-9))


def tech(df: pd.DataFrame) -> dict:
    """df has columns c, h, v (daily candles, oldest first)."""
    if len(df) < 55:
        return {"score": 0, "checks": []}
    c, h, v = df["c"], df["h"], df["v"]
    px = float(c.iloc[-1])
    m20, m50 = float(c.rolling(20).mean().iloc[-1]), float(c.rolling(50).mean().iloc[-1])
    r = float(rsi(c).iloc[-1])
    hi20 = float(h.tail(20).max())
    vol_ratio = float(v.iloc[-1] / max(v.tail(20).mean(), 1))

    rsi_pts = 20 if 50 <= r <= 70 else 10 if r > 70 else 0
    checks = [
        {"n": "Price above MA 50", "ok": px > m50, "pts": 20, "v": f"{(px / m50 - 1) * 100:+.1f}%"},
        {"n": "MA 20 above MA 50", "ok": m20 > m50, "pts": 20, "v": f"{(m20 / m50 - 1) * 100:+.1f}%"},
        {"n": "RSI between 50 and 70", "ok": 50 <= r <= 70, "pts": rsi_pts, "v": f"{r:.0f}"},
        {"n": "Near 20-day high", "ok": px >= hi20 * 0.98, "pts": 20, "v": f"{px / hi20 * 100:.1f}%"},
        {"n": "Volume above average", "ok": vol_ratio > 1, "pts": 20, "v": f"{vol_ratio:.2f}x"},
    ]
    score = sum(k["pts"] for k in checks if k["ok"] or k["n"].startswith("RSI"))
    return {"score": score, "checks": checks}


def growth(series, lag):
    """Latest value vs the value `lag` quarters earlier, or None."""
    if len(series) <= lag or not series[-1 - lag]:
        return None
    return series[-1] / series[-1 - lag] - 1


def fund(sales: list, profit: list, roe, de, pe) -> dict:
    """sales/profit in crore, oldest first. roe as percent, de as ratio, pe as number (any may be None)."""
    gp, gs = growth(profit, 4), growth(sales, 4)
    if gp is None:
        gp = growth(profit, 1)
    if gs is None:
        gs = growth(sales, 1)

    def pc(x):
        return "n/a" if x is None else f"{x * 100:+.1f}%"

    checks = [
        {"n": "Profit growth", "ok": gp is not None and gp > 0.05, "v": pc(gp)},
        {"n": "Sales growth", "ok": gs is not None and gs > 0.03, "v": pc(gs)},
        {"n": "ROE above 15%", "ok": roe is not None and roe > 15, "v": "n/a" if roe is None else f"{roe:.0f}%"},
        {"n": "Debt/equity low", "ok": de is not None and (de < 1 or de > 3), "v": "n/a" if de is None else f"{de:.1f}"},
        {"n": "P/E under market", "ok": pe is not None and 0 < pe < MARKET_PE,
         "v": "n/a" if pe is None else f"{pe:.0f} vs {MARKET_PE:.0f}"},
    ]
    g = clamp(50 + (gp if gp is not None else 0) * 120)
    s = clamp(50 + (gs if gs is not None else 0) * 200)
    r = clamp((roe or 0) * 3)
    lev = 50 if de is None else (60 if de > 3 else clamp(100 - de * 25))
    val = 50 if not pe or pe <= 0 else clamp(100 - (pe / MARKET_PE - 0.6) * 80)
    return {"score": round(g * .3 + s * .2 + r * .2 + lev * .15 + val * .15), "checks": checks,
            "profit_yoy": gp, "sales_yoy": gs}
