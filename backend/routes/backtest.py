from fastapi import APIRouter, HTTPException
from models.data_models import BacktestRequest, BacktestResponse
from models.ml_models import BacktestEngine
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest):
    """Run strategy backtesting for Backtesting.tsx page"""
    try:
        logger.info(f"Processing backtest request for {request.ticker}")
        
        if not request.ticker or len(request.ticker) > 10:
            raise HTTPException(status_code=400, detail="Invalid ticker symbol")
        
        if request.initial_capital <= 0:
            raise HTTPException(status_code=400, detail="Initial capital must be positive")
        
        engine = BacktestEngine()
        result = engine.run_backtest(
            ticker=request.ticker.upper(),
            period=request.period,
            initial_capital=request.initial_capital
        )
        
        if result is None:
            raise HTTPException(
                status_code=400,
                detail=f"Could not run backtest for {request.ticker}"
            )
        
        return BacktestResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in backtest: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during backtesting")
