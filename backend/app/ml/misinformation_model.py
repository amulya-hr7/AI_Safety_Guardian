import os
import joblib
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

from app.config import settings
from app.ml.preprocess import clean_text, extract_linguistic_features

class MisinformationDetector:
    """
    Production-grade NLP Misinformation Classifier.
    Integrates Scikit-Learn TF-IDF Pipeline with calibrated probability scoring
    and linguistic Explainable AI (XAI) feature attribution.
    """

    def __init__(self, model_path: Path = settings.MISINFO_MODEL_PATH):
        self.model_path = model_path
        self.pipeline = None
        self.metadata = {}
        self.is_loaded = False
        self.load_model()

    def load_model(self) -> bool:
        """
        Load the joblib pipeline if available, otherwise set status safely.
        """
        if self.model_path.exists():
            try:
                artifact = joblib.load(self.model_path)
                if isinstance(artifact, dict) and "pipeline" in artifact:
                    self.pipeline = artifact["pipeline"]
                    self.metadata = artifact.get("metadata", {})
                else:
                    self.pipeline = artifact
                self.is_loaded = True
                return True
            except Exception as e:
                print(f"[Warning] Failed loading misinformation model from {self.model_path}: {e}")
                self.is_loaded = False
                return False
        else:
            self.is_loaded = False
            return False

    def predict(self, raw_text: str) -> Dict[str, Any]:
        """
        Analyze an input text string and return:
        - classification: 'Likely Reliable' | 'Potentially Misleading' | 'Insufficient Evidence'
        - risk_score: 0 to 100
        - confidence: 0 to 100
        - explanation: Clear, responsible, non-punitive rationale
        - model_status: 'trained_model' | 'rule_heuristic_fallback' | 'insufficient_text'
        - details: Linguistic cues, salient terms, metrics
        """
        cleaned = clean_text(raw_text)
        features = extract_linguistic_features(raw_text)

        # 1. Check for insufficient text (< 15 characters or < 3 words)
        if len(cleaned) < 15 or features["word_count"] < 3:
            return {
                "classification": "Insufficient Evidence",
                "risk_score": 25.0,
                "confidence": 35.0,
                "risk_level": "Low",
                "explanation": "The submitted text contains too few words for statistical NLP classification. Please provide a full headline, statement, or article paragraph for reliable assessment.",
                "model_status": "insufficient_text",
                "top_keywords": [],
                "details": {
                    "linguistic_features": features,
                    "model_source": "Input Length Validator"
                }
            }

        # 2. If model is trained and loaded, run full ML Pipeline
        if self.is_loaded and self.pipeline is not None:
            try:
                # Predict probabilities: class 0 (Reliable), class 1 (Misleading)
                probas = self.pipeline.predict_proba([cleaned])[0]
                prob_reliable = float(probas[0])
                prob_misleading = float(probas[1])

                # Calibrate risk score (0 to 100) based on misleading probability + linguistic modifiers
                base_risk = prob_misleading * 100.0

                # Fine-tune with linguistic sensational markers
                cue_penalty = min(20.0, len(features["sensational_cue_matches"]) * 7.5)
                cred_bonus = min(15.0, len(features["credible_cue_matches"]) * 6.0)

                final_risk_score = max(0.0, min(100.0, base_risk + cue_penalty - cred_bonus))
                confidence_score = max(50.0, min(99.0, max(prob_reliable, prob_misleading) * 100.0))

                # Determine responsible classification
                if final_risk_score >= 65.0:
                    classification = "Potentially Misleading"
                    risk_level = "High"
                    explanation = (
                        "Statistical NLP and linguistic patterns indicate elevated sensationalism, conspiratorial phrasing, "
                        "or unverified claims. We recommend cross-referencing this claim with accredited fact-checking organizations "
                        "and primary sources."
                    )
                elif final_risk_score >= 40.0:
                    classification = "Potentially Misleading"
                    risk_level = "Medium"
                    explanation = (
                        "The text exhibits moderate rhetorical intensity or ambiguous claims that cannot be conclusively substantiated. "
                        "Exercise critical evaluation before sharing."
                    )
                else:
                    classification = "Likely Reliable"
                    risk_level = "Low"
                    explanation = (
                        "The linguistic and stylistic structure closely aligns with standard factual reporting, peer-reviewed terminology, "
                        "or neutral informative syntax. Note: This assessment evaluates linguistic indicators and does not constitute absolute truth certification."
                    )

                # Extract top contributing TF-IDF terms
                top_keywords = self._extract_salient_terms(cleaned)

                return {
                    "classification": classification,
                    "risk_score": round(final_risk_score, 1),
                    "confidence": round(confidence_score, 1),
                    "risk_level": risk_level,
                    "explanation": explanation,
                    "model_status": "trained_model",
                    "top_keywords": top_keywords,
                    "details": {
                        "model_type": self.metadata.get("model_type", "Scikit-Learn TF-IDF + LogisticRegression"),
                        "prob_reliable": round(prob_reliable, 3),
                        "prob_misleading": round(prob_misleading, 3),
                        "linguistic_features": features,
                        "sensational_matches": features["sensational_cue_matches"],
                        "credible_matches": features["credible_cue_matches"]
                    }
                }
            except Exception as e:
                print(f"[Inference Error]: {e}, falling back to statistical heuristics.")

        # 3. Fallback Heuristics if model not yet trained or loaded
        sensational_count = len(features["sensational_cue_matches"])
        credible_count = len(features["credible_cue_matches"])

        if sensational_count > 0 and credible_count == 0:
            risk = min(90.0, 50.0 + sensational_count * 15.0)
            classification = "Potentially Misleading"
            risk_level = "High" if risk >= 70 else "Medium"
            exp = f"Triggered by sensational rhetorical cues ({', '.join(features['sensational_cue_matches'][:3])}). Note: Train the ML model using `python -m app.ml.train_misinformation` for full TF-IDF vectorization."
        elif credible_count > 0:
            risk = max(10.0, 30.0 - credible_count * 10.0)
            classification = "Likely Reliable"
            risk_level = "Low"
            exp = "Text contains formal citation markers and neutral journalistic syntax. Note: Train the ML model with `python -m app.ml.train_misinformation` for full Scikit-Learn predictions."
        else:
            risk = 35.0
            classification = "Likely Reliable"
            risk_level = "Low"
            exp = "Neutral stylistic tone detected without extreme sensational keywords. Note: To train the full Scikit-Learn classifier, run `python -m app.ml.train_misinformation`."

        return {
            "classification": classification,
            "risk_score": round(risk, 1),
            "confidence": 72.0,
            "risk_level": risk_level,
            "explanation": exp,
            "model_status": "rule_heuristic_fallback",
            "top_keywords": [w for w in features["sensational_cue_matches"] + features["credible_cue_matches"]],
            "details": {
                "linguistic_features": features,
                "training_instruction": "Run `python -m app.ml.train_misinformation` to compile the scikit-learn model artifact."
            }
        }

    def _extract_salient_terms(self, text: str, top_n: int = 5) -> List[str]:
        """Extract highest TF-IDF weight words from the pipeline."""
        if not self.pipeline or 'tfidf' not in self.pipeline.named_steps:
            return []
        try:
            tfidf = self.pipeline.named_steps['tfidf']
            clf = self.pipeline.named_steps['clf']
            feature_names = np.array(tfidf.get_feature_names_out())
            tfidf_vec = tfidf.transform([text]).toarray()[0]

            # Multiply TF-IDF weights by classifier coefficients for class 1
            coefs = clf.coef_[0] if len(clf.coef_.shape) > 1 else clf.coef_
            weighted_scores = tfidf_vec * coefs

            # Non-zero entries
            nonzero_indices = np.where(tfidf_vec > 0)[0]
            if len(nonzero_indices) == 0:
                return []

            # Sort by absolute influence
            sorted_indices = nonzero_indices[np.argsort(np.abs(weighted_scores[nonzero_indices]))[::-1]]
            return [feature_names[i] for i in sorted_indices[:top_n]]
        except Exception:
            return []

# Singleton instance
detector = MisinformationDetector()
