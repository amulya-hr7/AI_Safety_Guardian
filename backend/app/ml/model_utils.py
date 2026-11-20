import os
import joblib
from pathlib import Path
from typing import Dict, Any
from app.config import settings

def get_model_diagnostics() -> Dict[str, Any]:
    """
    Check the health, existence, and metadata of trained ML model files.
    """
    model_path = settings.MISINFO_MODEL_PATH
    exists = model_path.exists()

    info = {
        "model_file": model_path.name,
        "model_path": str(model_path),
        "exists": exists,
        "status": "ready" if exists else "not_trained",
        "size_bytes": model_path.stat().st_size if exists else 0,
        "metadata": None
    }

    if exists:
        try:
            artifact = joblib.load(model_path)
            if isinstance(artifact, dict) and "metadata" in artifact:
                info["metadata"] = artifact["metadata"]
        except Exception as e:
            info["status"] = "corrupted"
            info["error"] = str(e)

    return info
