import pytest
import os
import io
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# In-memory SQLite for testing isolation
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "app_name" in data

def test_analyze_text_reliable():
    payload = {
        "text": "Researchers at Oxford University published a peer-reviewed clinical study analyzing cardiovascular health.",
        "title": "Medical Research Paper"
    }
    response = client.post("/api/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "text"
    assert "classification" in data
    assert "risk_score" in data
    assert "confidence" in data
    assert data["risk_score"] < 50.0

def test_analyze_text_misleading():
    payload = {
        "text": "SHOCKING: Secret government conspiracy exposed! Miracle cure hidden from citizens by Big Pharma!",
        "title": "Sensational Claim"
    }
    response = client.post("/api/analyze/text", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_type"] == "text"
    assert data["classification"] == "Potentially Misleading"
    assert data["risk_score"] >= 50.0

def test_analyze_text_empty_error():
    payload = {"text": "  "}
    response = client.post("/api/analyze/text", json=payload)
    assert response.status_code in [400, 422]

def test_invalid_image_upload_rejection():
    # Send a text file with wrong extension
    file_data = io.BytesIO(b"this is not an image")
    files = {"file": ("malicious.exe", file_data, "application/octet-stream")}
    response = client.post("/api/analyze/image", files=files)
    assert response.status_code == 400
    assert "Invalid image format" in response.json()["detail"]

def test_history_and_dashboard_flow():
    # Insert a record via API
    payload = {
        "text": "National Weather Service issues severe thunderstorm warning for northern region.",
        "title": "Weather Alert"
    }
    post_res = client.post("/api/analyze/text", json=payload)
    assert post_res.status_code == 200
    record_id = post_res.json()["id"]

    # Retrieve history
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200
    records = hist_res.json()
    assert len(records) >= 1
    assert records[0]["id"] == record_id

    # Retrieve single record
    single_res = client.get(f"/api/history/{record_id}")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == record_id

    # Check dashboard stats
    stats_res = client.get("/api/dashboard/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_analyses"] >= 1
    assert stats["text_analyses"] >= 1

    # Delete record
    del_res = client.delete(f"/api/history/{record_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify 404 after deletion
    del_check = client.get(f"/api/history/{record_id}")
    assert del_check.status_code == 404
