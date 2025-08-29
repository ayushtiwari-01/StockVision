import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import requests  # <-- ADD THIS IMPORT
import os
import logging
import warnings
from typing import Optional, Dict, Any, List

# --- Setup Logging and Warnings ---
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow info messages
logging.getLogger('tensorflow').setLevel(logging.ERROR)
warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StockPredictor:
    def __init__(self):
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        
    def fetch_stock_data(self, ticker: str, period: str = '1y', interval: str = '1d') -> pd.DataFrame:
        """Fetch stock data from Yahoo Finance"""
        try:
            logger.info(f"Fetching data for {ticker} with period {period}")

            # FIX: Create a session with a browser header to avoid being blocked
            session = requests.Session()
            session.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            
            # Pass the session to yfinance
            stock = yf.Ticker(ticker, session=session)
            data = stock.history(period=period, interval=interval)
            
            if data.empty:
                logger.error(f"No data found for {ticker}")
                return pd.DataFrame()
                
            data = data[['Close']].dropna()
            
            if len(data) < 100:
                logger.error(f"Insufficient data for {ticker} (only {len(data)} records)")
                return pd.DataFrame()
                
            data['Return'] = data['Close'].pct_change()
            data = data.dropna()
            logger.info(f"Successfully fetched {len(data)} records for {ticker}")
            return data
            
        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {e}")
            return pd.DataFrame()

    def prepare_data(self, data: pd.DataFrame, time_step: int = 60) -> tuple:
        """Prepare data for LSTM training"""
        try:
            scaled_data = self.scaler.fit_transform(data[['Close']])
            X, y = [], []
            returns = data['Return'].values
            
            for i in range(time_step, len(scaled_data) - 1):
                X.append(scaled_data[i - time_step:i, 0])
                y.append(returns[i + 1])
                
            X, y = np.array(X), np.array(y)
            X = np.reshape(X, (X.shape[0], X.shape[1], 1))
            return X, y
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            return np.array([]), np.array([])

    def train_lstm_model(self, X_train: np.ndarray, y_train: np.ndarray, epochs: int = 30):
        """Train LSTM model"""
        try:
            model = Sequential()
            model.add(LSTM(64, return_sequences=True, input_shape=(X_train.shape[1], 1)))
            model.add(LSTM(64))
            model.add(Dense(1))
            model.compile(optimizer='adam', loss='mean_squared_error')
            
            logger.info(f"Training LSTM model with {len(X_train)} samples")
            model.fit(X_train, y_train, epochs=epochs, batch_size=32, verbose=0)
            return model
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return None

    def generate_signals(self, returns: List[float], threshold: float = 0.002) -> List[str]:
        """Generate trading signals based on predicted returns"""
        signals = []
        for r in returns:
            if r > threshold:
                signals.append("Buy")
            elif r < -threshold:
                signals.append("Sell")
            else:
                signals.append("Hold")
        return signals

    def predict(self, ticker: str, period: str = '1y', forecast_days: int = 5, difficulty: str = 'basic') -> Optional[Dict[str, Any]]:
        """Main prediction function"""
        try:
            # Adjust parameters based on difficulty
            epochs = {'basic': 20, 'intermediate': 30, 'advanced': 50}.get(difficulty, 30)
            threshold = {'basic': 0.005, 'intermediate': 0.002, 'advanced': 0.001}.get(difficulty, 0.002)
            
            # Fetch data
            data = self.fetch_stock_data(ticker, period)
            if data.empty:
                logger.error(f"No data available for {ticker}")
                return None
                
            # Prepare and train
            X, y = self.prepare_data(data)
            if len(X) == 0:
                logger.error("No training data available after preparation")
                return None
                
            train_size = int(len(X) * 0.8)
            if train_size < 10:
                logger.error("Insufficient training data")
                return None
                
            X_train, X_test = X[:train_size], X[train_size:]
            y_train = y[:train_size]
            
            self.model = self.train_lstm_model(X_train, y_train, epochs=epochs)
            if self.model is None:
                return None
            
            # Generate predictions
            current_input = X_train[-1:] if len(X_test) == 0 else X_test[-1:]
            forecast_returns = []
            last_price = data['Close'].values[-1]
            
            for i in range(forecast_days):
                predicted_return = self.model.predict(current_input, verbose=0)[0, 0]
                forecast_returns.append(float(predicted_return))
                next_price = last_price * (1 + predicted_return)
                last_price = next_price
                
                scaled_next_price = self.scaler.transform([[next_price]])[0, 0]
                current_input = np.append(current_input[:, 1:, :], [[[scaled_next_price]]], axis=1)
            
            # Generate signals and results
            signals = self.generate_signals(forecast_returns, threshold=threshold)
            
            forecast_dates = pd.date_range(
                start=data.index[-1] + pd.Timedelta(days=1), 
                periods=forecast_days, 
                freq='B'
            )
            
            predictions = [
                {
                    "date": date.strftime('%Y-%m-%d'),
                    "predicted_return": round(ret, 6),
                    "signal": sig,
                    "confidence": min(0.9, max(0.5, 0.75 - abs(ret) * 50))
                }
                for date, ret, sig in zip(forecast_dates, forecast_returns, signals)
            ]
            
            current_price = float(data['Close'].iloc[-1])
            total_return = sum(forecast_returns) * 100
            
            # Calculate overall confidence
            volatility = np.std(forecast_returns)
            confidence = max(0.5, min(0.9, 0.8 - volatility * 10))
            
            result = {
                "ticker": ticker.upper(),
                "current_price": round(current_price, 2),
                "predictions": predictions,
                "signals": signals,
                "total_return": round(total_return, 4),
                "confidence": round(confidence, 3),
                "history": [
                    {
                        "date": idx.strftime('%Y-%m-%d'),
                        "close": float(row.Close)
                    }
                    for idx, row in data.iterrows()
                ]
            }
            
            logger.info(f"Prediction completed for {ticker}")
            return result
            
        except Exception as e:
            logger.error(f"Error in prediction: {e}")
            return None

class BacktestEngine:
    def __init__(self):
        self.predictor = StockPredictor()
    
    def run_backtest(self, ticker: str, period: str = '1y', initial_capital: float = 10000) -> Optional[Dict[str, Any]]:
        """Run backtest simulation"""
        try:
            # This is a simplified backtest - you can expand this
            data = self.predictor.fetch_stock_data(ticker, period)
            if data.empty:
                return None
            
            # Simple buy-and-hold strategy for now
            start_price = data['Close'].iloc[0]
            end_price = data['Close'].iloc[-1]
            shares = initial_capital / start_price
            final_value = shares * end_price
            total_return = (final_value - initial_capital) / initial_capital * 100
            
            # Calculate some basic metrics
            returns = data['Return'].dropna()
            sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252) if returns.std() > 0 else 0
            
            cumulative_returns = (1 + returns).cumprod()
            running_max = cumulative_returns.expanding().max()
            drawdown = (cumulative_returns - running_max) / running_max
            max_drawdown = drawdown.min() * 100
            
            return {
                "ticker": ticker.upper(),
                "strategy": "buy_and_hold",
                "total_return": round(total_return, 2),
                "sharpe_ratio": round(sharpe_ratio, 3),
                "max_drawdown": round(abs(max_drawdown), 2),
                "win_rate": 50.0,  # Placeholder
                "trades_count": 1,
                "final_portfolio_value": round(final_value, 2)
            }
            
        except Exception as e:
            logger.error(f"Error in backtest: {e}")
            return None