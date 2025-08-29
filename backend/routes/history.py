from fastapi import APIRouter, HTTPException, Query
from models.data_models import HistoryResponse
from database.supabase_client import SupabaseClient
import logging
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/history/{user_id}", response_model=HistoryResponse)
async def get_user_history(
    user_id: str,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    ticker: Optional[str] = Query(None),
    prediction_type: Optional[str] = Query(None)
):
    """Get user's prediction history for SavedResults.tsx page"""
    try:
        logger.info(f"Fetching history for user {user_id}")
        
        supabase_client = SupabaseClient()
        results, total_count = await supabase_client.get_user_history(
            user_id=user_id,
            limit=limit,
            offset=offset,
            ticker_filter=ticker,
            prediction_type_filter=prediction_type
        )
        
        return HistoryResponse(
            results=results,
            total_count=total_count,
            success=True
        )
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")

@router.get("/dashboard-stats/{user_id}")
async def get_dashboard_stats(user_id: str):
    """Get summary statistics for Dashboard.tsx page"""
    try:
        supabase_client = SupabaseClient()
        stats = await supabase_client.get_dashboard_stats(user_id)
        
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")
