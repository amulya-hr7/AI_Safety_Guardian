import os
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException
from app.config import settings

def get_safe_filename(original_filename: str) -> str:
    """Generate a clean, randomized UUID filename preserving the original valid extension."""
    ext = Path(original_filename).suffix.lower()
    return f"upload_{uuid.uuid4().hex[:12]}{ext}"

def validate_image_file(file: UploadFile, max_size_mb: int = settings.MAX_UPLOAD_SIZE_MB) -> None:
    """
    Validate image file extension, MIME type, and size.
    Raises HTTPException(400) on invalid payload.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename in upload.")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image format '{ext}'. Allowed: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )

    # Check content type if provided
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{file.content_type}'. Must be an image MIME type."
        )

def validate_video_file(file: UploadFile, max_size_mb: int = settings.MAX_UPLOAD_SIZE_MB) -> None:
    """
    Validate video file extension, MIME type, and size.
    Raises HTTPException(400) on invalid payload.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename in upload.")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid video format '{ext}'. Allowed: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}"
        )

    # Check content type if provided
    if file.content_type and not (file.content_type.startswith("video/") or file.content_type == "application/octet-stream"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{file.content_type}'. Must be a valid video MIME type."
        )
