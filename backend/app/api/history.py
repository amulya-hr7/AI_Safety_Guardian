from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db, AnalysisRecord

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[dict])
def get_history(
    analysis_type: Optional[str] = Query(None, description="Filter by type: text, image, video"),
    q: Optional[str] = Query(None, description="Search keyword in explanation or snippet"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieve historical analysis records from SQLite with optional filtering and keyword search.
    """
    query = db.query(AnalysisRecord)

    if analysis_type and analysis_type.lower() != "all":
        query = query.filter(AnalysisRecord.analysis_type == analysis_type.lower())

    if q and q.strip():
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            (AnalysisRecord.raw_input_snippet.ilike(search_pattern)) |
            (AnalysisRecord.explanation.ilike(search_pattern)) |
            (AnalysisRecord.classification.ilike(search_pattern))
        )

    records = query.order_by(desc(AnalysisRecord.created_at)).limit(limit).all()
    return [r.to_dict() for r in records]

@router.get("/{record_id}", response_model=dict)
def get_history_detail(record_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a single detailed analysis record by primary key ID.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis record '{record_id}' not found.")
    return record.to_dict()

@router.delete("/{record_id}")
def delete_history_record(record_id: str, db: Session = Depends(get_db)):
    """
    Delete an analysis record from SQLite.
    """
    record = db.query(AnalysisRecord).filter(AnalysisRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis record '{record_id}' not found.")

    db.delete(record)
    db.commit()
    return {"success": True, "message": f"Record '{record_id}' successfully removed."}
