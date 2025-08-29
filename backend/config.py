import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    
    # ML Model settings
    DEFAULT_LSTM_EPOCHS = 30
    DEFAULT_TIME_STEP = 60
    
settings = Settings()
