# ML utility functions
import numpy as np
import pandas as pd
from typing import List, Tuple

def calculate_rsi(prices: pd.Series, window: int = 14) -> pd.Series:
    """Calculate RSI indicator"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_moving_average(prices: pd.Series, window: int) -> pd.Series:
    """Calculate moving average"""
    return prices.rolling(window=window).mean()

def normalize_data(data: np.ndarray) -> Tuple[np.ndarray, float, float]:
    """Normalize data to 0-1 range"""
    min_val = np.min(data)
    max_val = np.max(data)
    normalized = (data - min_val) / (max_val - min_val)
    return normalized, min_val, max_val
