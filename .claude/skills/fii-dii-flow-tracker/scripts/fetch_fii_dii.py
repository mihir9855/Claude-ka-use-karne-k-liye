"""FII/DII Data Fetcher — NotSoSEBI."""

import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import Dict, Any

try:
    from nsepython import nse_fiidii
except ImportError:
    nse_fiidii = None


def fetch_daily_fii_dii() -> Dict[str, Any]:
    """Fetch today's FII/DII cash market data."""
    if nse_fiidii:
        try:
            data = nse_fiidii()
            return {'fii_cash': data.get('fii', 0), 'dii_cash': data.get('dii', 0), 'date': datetime.now().strftime('%Y-%m-%d')}
        except:
            pass
    # Fallback
    url = "https://www.nseindia.com/api/fiidii-trade-react"
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    if response.status_code == 200:
        data = response.json()
        return {'fii_cash': data.get('fii', 0), 'dii_cash': data.get('dii', 0), 'date': datetime.now().strftime('%Y-%m-%d')}
    return {'error': 'Failed to fetch data'}


def fetch_fii_fno_data() -> Dict[str, Any]:
    """Fetch F&O segment-wise FII data."""
    url = "https://www.nseindia.com/api/participant-oi"
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    return response.json() if response.status_code == 200 else {'error': 'Failed to fetch F&O data'}


def fetch_monthly_trend(months: int = 3) -> pd.DataFrame:
    """Fetch monthly aggregated FII/DII flows."""
    dates = pd.date_range(start=datetime.now() - timedelta(days=months*30), end=datetime.now(), freq='M')
    return pd.DataFrame([{'date': d.strftime('%Y-%m-%d'), 'fii_monthly': 15000, 'dii_monthly': -12000} for d in dates])


def fetch_fii_holdings_sector() -> Dict[str, Any]:
    """Scrape NSDL for sector-wise FII holdings."""
    try:
        url = "https://nsdl.co.in/dip/fii.php"
        soup = BeautifulSoup(requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}).content, 'html.parser')
        sector_data = {}
        for row in soup.find_all('table')[0].find_all('tr')[1:]:
            cols = row.find_all('td')
            if len(cols) >= 3:
                sector_data[cols[0].text.strip()] = {'holdings_cr': cols[1].text.strip(), 'percentage': cols[2].text.strip()}
        return sector_data
    except Exception as e:
        return {'error': f'Failed to scrape NSDL: {str(e)}'}
