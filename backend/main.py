import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

import data
import scoring
from symbols import DEFAULTS

app = FastAPI(title="Chart Scanner")
FRONT = Path(__file__).resolve().parent.parent / "frontend"
pool = ThreadPoolExecutor(8)


def check(sym: str) -> str:
    sym = sym.strip().upper()
    if not data.valid_symbol(sym):
        raise HTTPException(400, f"Use an NSE (.NS) or BSE (.BO) symbol, got {sym!r}")
    return sym


def summary(sym: str) -> dict:
    h = data.history(sym)
    f = data.fundamentals(sym)
    t, fu = scoring.tech(h), scoring.fund(f["sales"], f["profit"], f["roe"], f["de"], f["pe"])
    q = data.quote(sym)
    return {"symbol": sym, "name": f["name"], "price": q["price"], "prev": q["prev"],
            "tech": t["score"], "fund": fu["score"], "spark": [round(x, 2) for x in h["c"].tail(40)]}


@app.get("/api/config")
def config():
    return {"demo": data.DEMO, "defaults": [s + ".NS" for s in DEFAULTS]}


@app.get("/api/search")
def search(q: str = Query(min_length=1, max_length=40)):
    return data.search(q)


@app.get("/api/scan")
def scan(symbols: str = Query(max_length=600)):
    syms = [check(s) for s in symbols.split(",") if s.strip()][:25]

    def one(s):
        try:
            return summary(s)
        except Exception:
            return {"symbol": s, "error": "No data for this symbol"}
    return list(pool.map(one, syms))


@app.get("/api/stock")
def stock(symbol: str):
    sym = check(symbol)
    try:
        h, f = data.history(sym), data.fundamentals(sym)
    except Exception:
        raise HTTPException(404, "No data for this symbol")
    t, fu = scoring.tech(h), scoring.fund(f["sales"], f["profit"], f["roe"], f["de"], f["pe"])
    return {"symbol": sym, "name": f["name"], "candles": h.tail(160).fillna(0).to_dict("records"),
            "quarters": {"labels": f["labels"][-6:], "sales": f["sales"][-6:], "profit": f["profit"][-6:]},
            "tech": t, "fund": fu, "demo": data.DEMO}


@app.get("/api/quotes")
def quotes(symbols: str = Query(max_length=600)):
    out = {}
    for s in [check(x) for x in symbols.split(",") if x.strip()][:25]:
        try:
            out[s] = data.quote(s)
        except Exception:
            pass
    return out


@app.get("/")
def index():
    return FileResponse(FRONT / "index.html")


@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)


app.mount("/static", StaticFiles(directory=FRONT), name="static")
