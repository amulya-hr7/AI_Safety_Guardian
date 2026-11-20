import os
import json
import base64
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, AnalysisRecord
from app.ml.misinformation_model import detector as misinfo_detector
from app.vision.image_detector import image_detector
from app.vision.video_detector import video_detector
from app.utils.file_validation import validate_image_file, validate_video_file, get_safe_filename
from app.utils.cleanup import TempFileManager

router = APIRouter(prefix="/analyze", tags=["Analysis"])

# Pydantic Schemas
class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Article text, headline, or claim to evaluate.")
    title: Optional[str] = Field(None, description="Optional title or context tag.")

class AnalysisResponse(BaseModel):
    id: str
    analysis_type: str
    classification: str
    risk_score: float
    confidence: float
    risk_level: str
    explanation: str
    model_status: Optional[str] = None
    created_at: str
    raw_input_snippet: Optional[str] = None
    details: Dict[str, Any] = {}

@router.post("/text", response_model=AnalysisResponse)
async def analyze_text(payload: TextAnalysisRequest, db: Session = Depends(get_db)):
    """
    NLP Misinformation & Credibility Analysis.
    Evaluates text through Scikit-Learn TF-IDF vectorizer and logistic regression classifier.
    Persists result in SQLite database.
    """
    raw_text = payload.text.strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")

    # Execute ML / Heuristic prediction
    result = misinfo_detector.predict(raw_text)

    # Save to SQLite database
    db_record = AnalysisRecord(
        analysis_type="text",
        classification=result["classification"],
        risk_score=result["risk_score"],
        confidence=result["confidence"],
        explanation=result["explanation"],
        raw_input_snippet=raw_text[:280],
        metadata_json=json.dumps({
            "title": payload.title or "Text Claim Analysis",
            "model_status": result.get("model_status"),
            "top_keywords": result.get("top_keywords", []),
            "details": result.get("details", {})
        })
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    out = db_record.to_dict()
    out["model_status"] = result.get("model_status")
    return out

@router.post("/image", response_model=AnalysisResponse)
async def analyze_image(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Computer Vision Image Violence & Threat Detection.
    Evaluates image via OpenCV for chromatic blood/combustion cues, edge density, and human proximity.
    Accepts direct multipart file upload or base64 string (webcam snapshot).
    """
    temp_path: Optional[Path] = None
    image_bytes: Optional[bytes] = None

    if file is not None:
        validate_image_file(file)
        safe_name = get_safe_filename(file.filename or "uploaded_image.jpg")
        temp_path = settings.UPLOAD_DIR / safe_name
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)
        image_bytes = contents
    elif image_base64:
        try:
            # Strip data:image/...;base64, prefix if present
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            image_bytes = base64.b64decode(image_base64)
            safe_name = f"webcam_{get_safe_filename('snapshot.jpg')}"
            temp_path = settings.UPLOAD_DIR / safe_name
            with open(temp_path, "wb") as f:
                f.write(image_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {e}")
    else:
        raise HTTPException(status_code=400, detail="Must provide either an image file upload or image_base64 string.")

    try:
        # Run OpenCV analysis
        result = image_detector.analyze_image(image_bytes or temp_path)

        # Save to SQLite
        db_record = AnalysisRecord(
            analysis_type="image",
            classification=result["classification"],
            risk_score=result["risk_score"],
            confidence=result["confidence"],
            explanation=result["explanation"],
            raw_input_snippet=title or "Visual Threat Screening",
            metadata_json=json.dumps({
                "title": title or "Image Violence Analysis",
                "indicators": result.get("detected_indicators", []),
                "details": result.get("details", {})
            })
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        return db_record.to_dict()

    finally:
        # Clean up temporary upload file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/video", response_model=AnalysisResponse)
async def analyze_video(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Computer Vision Video Violence Detection.
    Samples video frames evenly and analyzes temporal motion and visual cues without loading full video into RAM.
    """
    validate_video_file(file)
    safe_name = get_safe_filename(file.filename or "uploaded_video.mp4")
    temp_path = settings.UPLOAD_DIR / safe_name

    # Write video to disk in chunks
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        # Run OpenCV temporal video analysis
        result = video_detector.analyze_video(temp_path)

        # Save to SQLite
        db_record = AnalysisRecord(
            analysis_type="video",
            classification=result["classification"],
            risk_score=result["risk_score"],
            confidence=result["confidence"],
            explanation=result["explanation"],
            raw_input_snippet=f"Video Analysis ({result.get('analyzed_frames', 0)} sampled frames)",
            metadata_json=json.dumps({
                "title": title or "Video Stream Screening",
                "analyzed_frames": result.get("analyzed_frames", 0),
                "suspicious_timestamps": result.get("suspicious_timestamps", []),
                "details": result.get("details", {})
            })
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        return db_record.to_dict()

    finally:
        # Ensure temporary video file is deleted
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
