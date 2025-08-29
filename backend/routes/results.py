from fastapi import APIRouter, HTTPException
from models.data_models import SaveResultRequest, SaveResultResponse
from database.supabase_client import SupabaseClient
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/save-result", response_model=SaveResultResponse)
async def save_result(request: SaveResultRequest):
    """Save prediction results for SavedResults.tsx page"""
    try:
        logger.info(f"Saving result for user {request.user_id}")
        
        supabase_client = SupabaseClient()
        result_id = str(uuid.uuid4())
        
        # Prepare data for database
        data = {
            "id": result_id,
            "user_id": request.user_id,
            "ticker": request.ticker.upper(),
            "prediction_type": request.prediction_type,
            "prediction_data": request.prediction_data,
            "performance_metrics": request.performance_metrics,
            "created_at": datetime.utcnow().isoformat()
        }
        
        success = await supabase_client.save_prediction_result(data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save result")
        
        return SaveResultResponse(
            result_id=result_id,
            success=True,
            message="Result saved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving result: {e}")
        raise HTTPException(status_code=500, detail="Failed to save result")

@router.delete("/result/{result_id}")
async def delete_result(result_id: str, user_id: str):
    """Delete a saved result"""
    try:
        supabase_client = SupabaseClient()
        success = await supabase_client.delete_result(result_id, user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Result not found or access denied")
        
        return {"success": True, "message": "Result deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting result: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete result")
