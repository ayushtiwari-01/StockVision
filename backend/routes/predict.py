from fastapi import APIRouter, HTTPException
from models.data_models import PredictionRequest, PredictionResponse
from models.ml_models import StockPredictor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_stock(request: PredictionRequest):
    """Predict stock prices using LSTM model"""
    try:
        logger.info(f"Processing prediction request for {request.ticker}")
        
        # Validate input
        if not request.ticker or len(request.ticker) > 10:
            raise HTTPException(status_code=400, detail="Invalid ticker symbol")
        
        if request.forecast_days < 1 or request.forecast_days > 30:
            raise HTTPException(status_code=400, detail="Forecast days must be between 1 and 30")
        
        predictor = StockPredictor()
        result = predictor.predict(
            ticker=request.ticker.upper(),
            period=request.period,
            forecast_days=request.forecast_days,
            difficulty=request.difficulty
        )
        
        if result is None:
            raise HTTPException(
                status_code=400, 
                detail=f"Could not fetch or process data for {request.ticker}. Please check if the ticker symbol is valid."
            )
        
        return PredictionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in predict_stock: {e}")
        raise HTTPException(status_code=500, detail="Internal server error occurred during prediction")

@router.get("/test")
async def test_prediction():
    """Test endpoint for quick validation"""
    try:
        predictor = StockPredictor()
        result = predictor.predict("AAPL", period="6mo", forecast_days=3)
        
        if result:
            return {"status": "success", "message": "Prediction service is working", "sample": result}
        else:
            return {"status": "error", "message": "Prediction service failed"}
            
    except Exception as e:
        return {"status": "error", "message": f"Test failed: {str(e)}"}
