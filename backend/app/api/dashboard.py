from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db, AnalysisRecord

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=Dict[str, Any])
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Compute real-time statistical metrics from SQLite database records.
    No simulated numbers: all metrics are derived strictly from dynamic database queries.
    """
    total = db.query(AnalysisRecord).count()

    if total == 0:
        return {
            "has_data": False,
            "message": "No analyses performed yet.",
            "total_analyses": 0,
            "misinformation_analyses": 0,
            "violence_analyses": 0,
            "text_analyses": 0,
            "image_analyses": 0,
            "video_analyses": 0,
            "potentially_misleading": 0,
            "potentially_violent": 0,
            "high_risk_analyses": 0,
            "moderate_risk_analyses": 0,
            "low_risk_analyses": 0,
            "high_risk_percentage": 0.0,
            "high_risk": 0,
            "average_confidence": 0.0,
            "risk_distribution": {
                "low": 0,
                "moderate": 0,
                "medium": 0,
                "high": 0,
                "critical": 0
            },
            "recent_activity": []
        }

    # Count by analysis type / module
    text_count = db.query(AnalysisRecord).filter(
        (AnalysisRecord.analysis_type == "text") | (AnalysisRecord.analysis_type == "misinformation")
    ).count()
    
    violence_count = db.query(AnalysisRecord).filter(
        (AnalysisRecord.analysis_type == "image") | 
        (AnalysisRecord.analysis_type == "video") | 
        (AnalysisRecord.analysis_type == "violence")
    ).count()

    image_count = db.query(AnalysisRecord).filter(AnalysisRecord.analysis_type == "image").count()
    video_count = db.query(AnalysisRecord).filter(AnalysisRecord.analysis_type == "video").count()

    # Risk level queries
    low_risk_count = db.query(AnalysisRecord).filter(
        (AnalysisRecord.risk_score < 40.0) | (AnalysisRecord.classification == "Likely Reliable") | (AnalysisRecord.classification == "Normal / Safe")
    ).count()

    moderate_risk_count = db.query(AnalysisRecord).filter(
        (AnalysisRecord.risk_score >= 40.0) & (AnalysisRecord.risk_score < 70.0)
    ).count()

    high_risk_count = db.query(AnalysisRecord).filter(
        (AnalysisRecord.risk_score >= 70.0) & (AnalysisRecord.risk_score < 85.0)
    ).count()

    critical_risk_count = db.query(AnalysisRecord).filter(
        AnalysisRecord.risk_score >= 85.0
    ).count()

    total_high_and_crit = high_risk_count + critical_risk_count
    high_risk_pct = round((total_high_and_crit / total) * 100, 1) if total > 0 else 0.0

    # Calculate average confidence
    records = db.query(AnalysisRecord.confidence).all()
    avg_conf = round(sum(r[0] for r in records) / len(records), 1) if records else 0.0

    recent_records = db.query(AnalysisRecord).order_by(desc(AnalysisRecord.created_at)).limit(8).all()

    return {
        "has_data": True,
        "message": "Database query completed successfully.",
        "total_analyses": total,
        "misinformation_analyses": text_count,
        "violence_analyses": violence_count,
        "text_analyses": text_count,
        "image_analyses": image_count,
        "video_analyses": video_count,
        "high_risk_analyses": total_high_and_crit,
        "moderate_risk_analyses": moderate_risk_count,
        "low_risk_analyses": low_risk_count,
        "high_risk_percentage": high_risk_pct,
        "high_risk": total_high_and_crit,
        "average_confidence": avg_conf,
        "risk_distribution": {
            "low": low_risk_count,
            "moderate": moderate_risk_count,
            "medium": moderate_risk_count,
            "high": high_risk_count,
            "critical": critical_risk_count
        },
        "recent_activity": [r.to_dict() for r in recent_records]
    }
