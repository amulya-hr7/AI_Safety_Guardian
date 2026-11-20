import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone

from app.database import Base, AnalysisRecord

TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

def test_database_crud(db_session):
    # 1. Insert record
    record = AnalysisRecord(
        analysis_type="text",
        classification="Potentially Misleading",
        risk_score=78.5,
        confidence=88.0,
        explanation="Sensational claims detected.",
        raw_input_snippet="Miracle cure exposed"
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)

    assert record.id.startswith("rec-")
    assert record.created_at is not None

    # 2. Retrieve record
    fetched = db_session.query(AnalysisRecord).filter(AnalysisRecord.id == record.id).first()
    assert fetched is not None
    assert fetched.risk_score == 78.5
    assert fetched.to_dict()["risk_level"] == "High"

    # 3. Filter by type
    text_records = db_session.query(AnalysisRecord).filter(AnalysisRecord.analysis_type == "text").all()
    assert len(text_records) == 1

    # 4. Delete record
    db_session.delete(fetched)
    db_session.commit()

    deleted_check = db_session.query(AnalysisRecord).filter(AnalysisRecord.id == record.id).first()
    assert deleted_check is None
