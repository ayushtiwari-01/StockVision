import os
from supabase import create_client, Client
from typing import List, Dict, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("Supabase URL and key must be provided")
        
        self.supabase: Client = create_client(url, key)
    
    async def save_prediction_result(self, data: Dict[str, Any]) -> bool:
        """Save prediction result to database"""
        try:
            result = self.supabase.table('prediction_results').insert(data).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error saving prediction result: {e}")
            return False
    
    async def get_user_history(
        self, 
        user_id: str, 
        limit: int = 10, 
        offset: int = 0,
        ticker_filter: Optional[str] = None,
        prediction_type_filter: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get user's prediction history"""
        try:
            query = self.supabase.table('prediction_results').select("*").eq('user_id', user_id)
            
            if ticker_filter:
                query = query.eq('ticker', ticker_filter.upper())
            
            if prediction_type_filter:
                query = query.eq('prediction_type', prediction_type_filter)
            
            # Get total count
            count_result = query.execute()
            total_count = len(count_result.data)
            
            # Get paginated results
            results = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            
            return results.data, total_count
            
        except Exception as e:
            logger.error(f"Error fetching user history: {e}")
            return [], 0
    
    async def delete_result(self, result_id: str, user_id: str) -> bool:
        """Delete a prediction result"""
        try:
            result = self.supabase.table('prediction_results').delete().eq('id', result_id).eq('user_id', user_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error deleting result: {e}")
            return False
    
    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for a user"""
        try:
            # Get recent results (last 30 days)
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            
            recent_results = self.supabase.table('prediction_results')\
                .select("*")\
                .eq('user_id', user_id)\
                .gte('created_at', thirty_days_ago)\
                .execute()
            
            total_predictions = len(recent_results.data)
            
            # Calculate some basic stats
            tickers_used = set()
            successful_predictions = 0
            
            for result in recent_results.data:
                if result.get('ticker'):
                    tickers_used.add(result['ticker'])
                
                # Simple success metric based on positive returns
                prediction_data = result.get('prediction_data', {})
                if prediction_data.get('total_return', 0) > 0:
                    successful_predictions += 1
            
            success_rate = (successful_predictions / total_predictions * 100) if total_predictions > 0 else 0
            
            return {
                "total_predictions": total_predictions,
                "unique_tickers": len(tickers_used),
                "success_rate": round(success_rate, 1),
                "recent_activity": total_predictions,
                "favorite_tickers": list(tickers_used)[:5]  # Top 5 most used
            }
            
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {e}")
            return {
                "total_predictions": 0,
                "unique_tickers": 0,
                "success_rate": 0,
                "recent_activity": 0,
                "favorite_tickers": []
            }
