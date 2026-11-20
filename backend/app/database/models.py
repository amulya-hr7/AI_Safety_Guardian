import json
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, DateTime
from app.database.database import Base

class AnalysisRecord(Base):
    """
    SQLAlchemy model representing an AI evaluation record (Misinformation text or Violence image/video).
    """
    __tablename__ = "analyses"

    id = Column(String(64), primary_key=True, default=lambda: f"rec-{uuid.uuid4().hex[:12]}")
    analysis_type = Column(String(32), nullable=False, index=True) # "text", "image", "video"
    classification = Column(String(64), nullable=False)           # "Likely Reliable", "Potentially Misleading", "Non-violent", "Potentially Violent", etc.
    risk_score = Column(Float, nullable=False, default=0.0)       # 0.0 - 100.0
    confidence = Column(Float, nullable=False, default=0.0)       # 0.0 - 100.0
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    raw_input_snippet = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True, default="{}")

    def to_dict(self):
        meta = {}
        if self.metadata_json:
            try:
                meta = json.loads(self.metadata_json)
            except Exception:
                meta = {}

        # Derive clean risk level string
        risk_level = "Low"
        if self.risk_score >= 70:
            risk_level = "High"
        elif self.risk_score >= 40:
            risk_level = "Medium"

        return {
            "id": self.id,
            "analysis_type": self.analysis_type,
            "classification": self.classification,
            "risk_score": round(self.risk_score, 1),
            "confidence": round(self.confidence, 1),
            "risk_level": risk_level,
            "explanation": self.explanation,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
            "raw_input_snippet": self.raw_input_snippet,
            "details": meta
        }
