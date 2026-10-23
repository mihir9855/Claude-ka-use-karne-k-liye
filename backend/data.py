"""Market data. Live mode uses yfinance (NSE .NS, BSE .BO). DEMO=1 gives synthetic data for offline testing."""
import os
import random
import time
import zlib

import pandas as pd

DEMO = os.getenv("DEMO") == "1"
_cache: dict = {}


def cached(key, ttl, fn):
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < ttl:
        return hit[1]
    val = fn()
    _cache[key] = (time.time(), val)
    return val


def valid_symbol(sym: str) -> bool:
    s = sym.upper()
    return (s.endswith(".NS") or s.endswith(".BO")) and 3 <= len(s) <= 24 and all(
        ch.isalnum() or ch in "&-." for ch in s)


# ---------- demo provider ----------
def _demo_rng(sym):
    return random.Random(zlib.crc32(sym.encode()))


def _demo_history(sym) -> pd.DataFrame:
    rng = _demo_rng(sym)
    p = rng.uniform(150, 3500)
    drift, vol = rng.uniform(-.0008, .0014), rng.uniform(.01, .022)
    days = pd.bdate_range(end=pd.Timestamp.today().normalize(), periods=250)
    rows = []
    for day in days:
        o = p
        c = o * (1 + drift + rng.gauss(0, vol))
        rows.append({"t": day.strftime("%Y-%m-%d"), "o": o, "h": max(o, c) * (1 + rng.random() * vol),
                     "l": min(o, c) * (1 - rng.random() * vol), "c": c, "v": rng.uniform(.6, 1.8) * 1e6})
        p = c
    return pd.DataFrame(rows)


def _demo_fund(sym):
    rng = _demo_rng(sym + "f")
    s0, g = rng.uniform(20, 300), rng.uniform(-.01, .05)
    sales = [round(s0 * (1 + g) ** i, 1) for i in range(6)]
    m = rng.uniform(.05, .22)
    profit = [round(x * m * rng.uniform(.9, 1.1), 2) for x in sales]
    return {"sales": sales, "profit": profit, "roe": rng.uniform(6, 35), "de": rng.uniform(0, 2),
            "pe": rng.uniform(9, 45), "name": sym.split(".")[0]}


# ---------- live provider ----------
def _yf_history(sym) -> pd.DataFrame:
    import yfinance as yf
    df = yf.Ticker(sym).history(period="1y", interval="1d", auto_adjust=False)
    if df.empty:
        raise LookupError(sym)
    df = df.reset_index()
    return pd.DataFrame({"t": df["Date"].dt.strftime("%Y-%m-%d"), "o": df["Open"], "h": df["High"],
                         "l": df["Low"], "c": df["Close"], "v": df["Volume"]})


def _yf_fund(sym):
    import yfinance as yf
    t = yf.Ticker(sym)
    info = t.info or {}
    sales, profit, labels = [], [], []
    try:
        q = t.quarterly_income_stmt
        if q is not None and not q.empty:
            q = q.T.sort_index()
            for d, row in q.iterrows():
                rev, ni = row.get("Total Revenue"), row.get("Net Income")
                if pd.notna(rev) and pd.notna(ni):
                    sales.append(round(float(rev) / 1e7, 1))
                    profit.append(round(float(ni) / 1e7, 2))
                    labels.append(d.strftime("%b %y"))
    except Exception:
        pass
    roe = info.get("returnOnEquity")
    de = info.get("debtToEquity")
    return {"sales": sales, "profit": profit, "labels": labels,
            "roe": None if roe is None else roe * 100, "de": None if de is None else de / 100,
            "pe": info.get("trailingPE"), "name": info.get("shortName") or sym}


# ---------- public ----------
def history(sym: str) -> pd.DataFrame:
    return cached(("h", sym), 300, lambda: _demo_history(sym) if DEMO else _yf_history(sym))


def fundamentals(sym: str) -> dict:
    def load():
        f = _demo_fund(sym) if DEMO else _yf_fund(sym)
        if "labels" not in f:
            base = pd.Timestamp.today().to_period("Q")
            f["labels"] = [(base - (len(f["sales"]) - i)).strftime("Q%q %Y") for i in range(len(f["sales"]))]
        return f
    return cached(("f", sym), 6 * 3600, load)


def quote(sym: str) -> dict:
    def load():
        h = history(sym)
        if DEMO:
            rng = random.Random(int(time.time() // 5) + zlib.crc32(sym.encode()))
            last = float(h["c"].iloc[-1]) * (1 + rng.gauss(0, .002))
            return {"price": last, "prev": float(h["c"].iloc[-2])}
        import yfinance as yf
        fi = yf.Ticker(sym).fast_info
        return {"price": float(fi["last_price"]), "prev": float(fi["previous_close"])}
    return cached(("q", sym), 10, load)


def search(q: str):
    from symbols import local_search
    out = local_search(q)
    if len(out) < 5 and not DEMO:
        try:
            import yfinance as yf
            for r in yf.Search(q, max_results=10).quotes:
                sym = r.get("symbol", "")
                if valid_symbol(sym) and all(o["symbol"] != sym for o in out):
                    out.append({"symbol": sym, "name": r.get("shortname") or r.get("longname") or sym,
                                "exchange": "NSE" if sym.endswith(".NS") else "BSE"})
        except Exception:
            pass
    if DEMO and not out and q.strip():
        s = q.strip().upper().replace(" ", "")
        out = [{"symbol": s + ".NS", "name": s + " (demo)", "exchange": "NSE"},
               {"symbol": s + ".BO", "name": s + " (demo)", "exchange": "BSE"}]
    return out[:10]
