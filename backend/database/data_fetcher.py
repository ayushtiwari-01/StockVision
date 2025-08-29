# Data fetching utilities
# You can move additional data fetching logic here if needed

import yfinance as yf
import pandas as pd
from typing import Optional

def get_stock_info(ticker: str) -> Optional[dict]:
    """Get basic stock information"""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "Unknown"),
            "market_cap": info.get("marketCap", 0),
            "currency": info.get("currency", "USD")
        }
    except:
        return None
