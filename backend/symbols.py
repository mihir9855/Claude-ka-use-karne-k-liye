"""Bundled NSE symbols for instant search. yfinance search covers the rest (incl. BSE)."""
NSE = {
    "RELIANCE": "Reliance Industries", "TCS": "Tata Consultancy Services", "HDFCBANK": "HDFC Bank",
    "INFY": "Infosys", "ICICIBANK": "ICICI Bank", "HINDUNILVR": "Hindustan Unilever", "ITC": "ITC",
    "SBIN": "State Bank of India", "BHARTIARTL": "Bharti Airtel", "KOTAKBANK": "Kotak Mahindra Bank",
    "LT": "Larsen & Toubro", "AXISBANK": "Axis Bank", "ASIANPAINT": "Asian Paints",
    "MARUTI": "Maruti Suzuki", "SUNPHARMA": "Sun Pharma", "TITAN": "Titan Company",
    "BAJFINANCE": "Bajaj Finance", "WIPRO": "Wipro", "HCLTECH": "HCL Technologies",
    "ULTRACEMCO": "UltraTech Cement", "NESTLEIND": "Nestle India", "TATAMOTORS": "Tata Motors",
    "TATASTEEL": "Tata Steel", "POWERGRID": "Power Grid", "NTPC": "NTPC", "ONGC": "ONGC",
    "M&M": "Mahindra & Mahindra", "ADANIENT": "Adani Enterprises", "ADANIPORTS": "Adani Ports",
    "COALINDIA": "Coal India", "JSWSTEEL": "JSW Steel", "TECHM": "Tech Mahindra",
    "INDUSINDBK": "IndusInd Bank", "BAJAJFINSV": "Bajaj Finserv", "DRREDDY": "Dr Reddy's",
    "CIPLA": "Cipla", "EICHERMOT": "Eicher Motors", "HEROMOTOCO": "Hero MotoCorp",
    "BRITANNIA": "Britannia", "GRASIM": "Grasim", "HINDALCO": "Hindalco", "ZOMATO": "Zomato",
    "DMART": "Avenue Supermarts", "PIDILITIND": "Pidilite", "IRCTC": "IRCTC", "HAL": "Hindustan Aeronautics",
    "BEL": "Bharat Electronics", "VEDL": "Vedanta", "PNB": "Punjab National Bank", "BANKBARODA": "Bank of Baroda",
    "IDEA": "Vodafone Idea", "YESBANK": "Yes Bank", "TRENT": "Trent", "LTIM": "LTIMindtree",
}
DEFAULTS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ITC", "TATAMOTORS", "SBIN", "ASIANPAINT"]


def local_search(q: str, limit: int = 8):
    q = q.strip().upper()
    out = []
    for sym, name in NSE.items():
        if q in sym or q in name.upper():
            out.append({"symbol": sym + ".NS", "name": name, "exchange": "NSE"})
    out.sort(key=lambda r: (not r["symbol"].startswith(q), r["symbol"]))
    return out[:limit]
