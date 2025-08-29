from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PredictionRequest(BaseModel):
    ticker: str
    period: str = "1y"
    forecast_days: int = 5
    difficulty: str = "basic"

class PredictionData(BaseModel):
    date: str
    predicted_return: float
    signal: str
    confidence: Optional[float] = None

class HistoricalPrice(BaseModel):
    date: str
    close: float

class PredictionResponse(BaseModel):
    ticker: str
    current_price: float
    predictions: List[PredictionData]
    signals: List[str]
    total_return: float
    confidence: float
    history: List[HistoricalPrice]
    success: bool = True
    message: str = "Prediction completed successfully"

class BacktestRequest(BaseModel):
    ticker: str
    strategy: str = "lstm_signals"
    period: str = "1y"
    initial_capital: float = 10000
    difficulty: str = "basic"

class BacktestResponse(BaseModel):
    ticker: str
    strategy: str
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    trades_count: int
    final_portfolio_value: float
    success: bool = True

class SaveResultRequest(BaseModel):
    user_id: str
    ticker: str
    prediction_type: str = "lstm"
    prediction_data: Dict[str, Any]
    performance_metrics: Optional[Dict[str, Any]] = None

class SaveResultResponse(BaseModel):
    result_id: str
    success: bool
    message: str

class HistoryRequest(BaseModel):
    user_id: str
    limit: int = 10
    offset: int = 0

class HistoryResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_count: int
    success: bool
