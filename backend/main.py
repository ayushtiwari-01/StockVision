from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import predict, backtest, history, results
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Stock Prediction API", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "http://localhost:8080",
        "https://ayush-stockvision.vercel.app"  # <-- ADDED YOUR LIVE FRONTEND URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/api", tags=["prediction"])
app.include_router(backtest.router, prefix="/api", tags=["backtest"])
app.include_router(history.router, prefix="/api", tags=["history"])
app.include_router(results.router, prefix="/api", tags=["results"])

@app.get("/")
def root():
    return {"message": "Stock Prediction API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Backend is operational"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)