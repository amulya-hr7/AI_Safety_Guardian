import pytest
import os
from pathlib import Path
from app.ml.preprocess import clean_text, tokenize_text, extract_linguistic_features
from app.ml.train_misinformation import train_and_save_model
from app.ml.misinformation_model import MisinformationDetector

def test_clean_text():
    raw = "  Check this out: https://example.com/fake-news! #ALERT <p>Doctors hate this!</p>  "
    cleaned = clean_text(raw)
    assert "https://" not in cleaned
    assert "<p>" not in cleaned
    assert "#" not in cleaned
    assert "doctors hate this" in cleaned.lower()

def test_tokenize_text():
    raw = "The peer-reviewed study demonstrates significant cardiovascular improvement."
    tokens = tokenize_text(raw, remove_stopwords=True)
    assert "peer-reviewed" in tokens
    assert "the" not in tokens # Stopword removed
    assert len(tokens) >= 4

def test_extract_linguistic_features():
    raw = "SHOCKING BOMBSHELL: Big Pharma secret exposed!!!"
    feats = extract_linguistic_features(raw)
    assert feats["exclamation_count"] == 3
    assert feats["uppercase_ratio"] > 30.0
    assert len(feats["sensational_cue_matches"]) >= 1

def test_ml_train_and_predict_flow(tmp_path):
    # Train model to temporary path
    temp_model_file = tmp_path / "test_model.joblib"
    metrics = train_and_save_model(model_save_path=temp_model_file)

    assert "accuracy" in metrics["metrics"]
    assert metrics["metrics"]["accuracy"] >= 0.70
    assert temp_model_file.exists()

    # Instantiate detector with temp model
    detector = MisinformationDetector(model_path=temp_model_file)
    assert detector.is_loaded is True

    # Test reliable prediction
    reliable_res = detector.predict("NASA space telescope captures new galaxy clusters in deep universe survey.")
    assert reliable_res["classification"] == "Likely Reliable"
    assert reliable_res["risk_score"] < 50.0

    # Test sensational prediction
    misleading_res = detector.predict("BOMBSHELL: Miracle vegetable cures cancer in 24 hours, doctors begging to hide it!")
    assert misleading_res["classification"] == "Potentially Misleading"
    assert misleading_res["risk_score"] >= 50.0

    # Test short input
    short_res = detector.predict("hi")
    assert short_res["classification"] == "Insufficient Evidence"
