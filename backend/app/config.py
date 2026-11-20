import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Resolve base project directory relative to this config file
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "AI-Powered Misinformation & Violence Detection System"
    APP_ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Database Path (SQLite)
    DATABASE_PATH: Path = BASE_DIR / "detection_system.db"
    DATABASE_URL: str = f"sqlite:///{DATABASE_PATH.as_posix()}"

    # Directory Paths
    MODEL_DIR: Path = BASE_DIR / "models"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"

    # ML Model Artifact Path
    MISINFO_MODEL_PATH: Path = BASE_DIR / "models" / "misinformation_model.joblib"

    # Upload and Processing Limits
    MAX_UPLOAD_SIZE_MB: int = 25
    MAX_VIDEO_DURATION_SEC: int = 60
    MAX_VIDEO_FRAMES_SAMPLE: int = 30
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]
    ALLOWED_VIDEO_EXTENSIONS: List[str] = [".mp4", ".avi", ".mov", ".webm", ".mkv"]

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    class Config:
        env_file = BASE_DIR / ".env"
        extra = "allow"

# Global settings instance
settings = Settings()

# Ensure required runtime directories exist
settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
