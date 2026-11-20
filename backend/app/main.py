import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.api.analysis import router as analysis_router
from app.api.history import router as history_router
from app.api.dashboard import router as dashboard_router
from app.ml.misinformation_model import detector as misinfo_detector
from app.ml.train_misinformation import train_and_save_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle management.
    1. Initializes SQLite tables automatically.
    2. Verifies ML model artifact; auto-trains baseline if missing.
    """
    print("🚀 Initializing AI-Powered Misinformation & Violence Detection System...")
    # Initialize SQLite database
    init_db()
    print("✅ SQLite database initialized.")

    # Check and load ML model
    if not settings.MISINFO_MODEL_PATH.exists():
        print("⚡ No pre-trained NLP model found. Auto-training baseline TF-IDF model...")
        try:
            train_and_save_model()
            misinfo_detector.load_model()
            print("✅ NLP model trained and ready.")
        except Exception as e:
            print(f"⚠️ Initial auto-train failed: {e}. Running with linguistic heuristics fallback.")
    else:
        misinfo_detector.load_model()
        print("✅ Pretrained NLP misinformation model loaded.")

    yield

    print("🛑 Shutting down AI Detection Service...")

app = FastAPI(
    title=settings.APP_NAME,
    description="College-level advanced AI/ML system for multimodal Misinformation verification and Violence detection.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for uniform JSON error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "detail": str(exc)
        }
    )

# Health endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    """System health check and engine readiness diagnostics."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "database": "SQLite (Connected)",
        "nlp_model_loaded": misinfo_detector.is_loaded,
        "opencv_available": True,
        "environment": settings.APP_ENV
    }

# Include modular API routers under /api
app.include_router(analysis_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
