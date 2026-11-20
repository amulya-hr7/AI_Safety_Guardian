# AI-Powered Misinformation and Violence Detection System
**Enterprise Multi-Modal AI Safety & Threat Intelligence Platform**

An end-to-end multi-modal safety intelligence platform designed to address two of the most critical challenges in digital and physical safety: **misinformation spread** and **physical violence/threats**.

---

## 🌟 Executive Summary

This web-based AI safety platform provides automated, explainable, and responsible triage for:
1. **Module A — Misinformation & Claim Verification (NLP Engine)**: Decomposes natural language text, viral social posts, and news articles into discrete atomic assertions, evaluating veracity against consensus, scoring sensationalism, and providing recommended independent fact-checking sources.
2. **Module B — Violence & Threat Visual Detection (Multimodal Computer Vision)**: Ingests images, video sequences (with 1 FPS temporal slicing), and live device camera feeds to classify kinetic violence (fights, physical assaults, aggressive gestures, weapon indicators) while distinguishing safe sports and peaceful activities.
3. **Alert Management & Incident Triage**: High-risk items automatically trigger triage alerts with analyst sign-off workflows, severity classifications, and audit logs.
4. **Responsible AI Framework**: Aligned with the 6 Core Responsible AI Principles (Fairness, Reliability & Safety, Privacy & Security, Inclusiveness, Transparency, Accountability). Strictly avoids autonomous law enforcement dispatch.

---

## 🏛️ System Architecture

```
                       ┌────────────────────────────────────────────────────────┐
                       │               React 19 Frontend Web App                │
                       │   (Tailwind CSS, Motion Animations, Lucide Icons)      │
                       └──────────────────────────┬─────────────────────────────┘
                                                  │
                                                  │  HTTPS REST API
                                                  ▼
                       ┌────────────────────────────────────────────────────────┐
                       │        Python FastAPI Backend & ML/CV Engine           │
                       │ (FastAPI, SQLite, scikit-learn, OpenCV, NumPy, pandas) │
                       └───────────┬────────────────────────────────┬───────────┘
                                   │                                │
                 Local ML Pipeline │                                │SQLite ORM
                                   ▼                                ▼
                       ┌────────────────────────┐       ┌────────────────────────┐
                       │ scikit-learn TF-IDF &  │       │ SQLite Database        │
                       │ OpenCV Vision Threat   │       │ (Persistent Case Audit │
                       │ Classification Models  │       │ Logs & Alert Triage)   │
                       └────────────────────────┘       └────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### Module A — Misinformation Detection (NLP)
- **Claim Extraction & TF-IDF NLP**: Tokenizes, cleans, and extracts unigram/bigram n-grams using scikit-learn TF-IDF pipelines.
- **Tri-State Verdict**: Categorizes content as *Likely Reliable*, *Suspicious*, or *Likely Misinformation*.
- **Risk Score (0–100) & Confidence %**: Epistemic uncertainty calculation with calibrated probabilities.
- **Sensationalism Index & Linguistic Tone Profiling**: Highlights emotional manipulation, urgency triggers, and clickbait tactics.
- **Fact-Checking Recommendations**: Identifies which claims require human fact-checking and suggests authoritative sources (WHO, Reuters, AP).

### Module B — Violence & Threat Detection (Computer Vision)
- **Tri-Modal Input Support**: Static images (PNG, JPG, WEBP), video files (MP4, WEBM), and live webcam streams.
- **OpenCV Video Frame Sampling**: Efficiently samples up to 30 keyframes per clip without memory exhaustion, computing optical motion gradients and threat indicators.
- **Multi-Class Threat Classification**: Detects *Fighting*, *Physical Assault*, *Aggressive Activity*, and *Weapon Indicators*.
- **Context-Aware Safety**: Differentiates martial arts sports and peaceful crowds from hostile kinetic assaults.
- **Temporal Keyframe Timeline**: Video inspection displays second-by-second timestamps where risk escalation is detected.

### SQLite Audit & History Log
- Persistent local SQLite database with full CRUD operations (`GET /api/history`, `DELETE /api/history/:id`).
- Real-time aggregated statistics via `GET /api/dashboard/stats`.

### Alert Management System
- Automatically registers high-risk threats to the central triage queue.
- Operator triage workflow: *Active*, *Investigating*, *Resolved*, and *False Positive*.
- Full incident audit trail with human resolution notes.

---

## ⚖️ Responsible AI Governance

- **Probabilistic Predictions**: Explicitly framed as AI-assisted assessments, not absolute truth claims or criminal verdicts.
- **Human-in-the-Loop**: The platform never replaces human judgment or authorizes autonomous punitive actions.
- **Zero Autonomous Police Dispatch**: Designed with hard guardrails preventing automatic emergency escalation.
- **Ephemeral Processing**: Visual frames are processed in-memory without persistent facial recognition or biometric profiling.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (`motion/react`), Lucide React
- **Python Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning & NLP**: scikit-learn, pandas, numpy, joblib, TF-IDF Vectorizer
- **Computer Vision**: OpenCV (`opencv-python-headless`), Pillow
- **Database**: SQLite with SQLAlchemy ORM

---

## 📋 Running the Project

### Option 1: Full-Stack Web App (React + Dev Server)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Standalone Python FastAPI Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation and interactive Swagger UI will be available at:
`http://localhost:8000/docs`

### Option 3: Running Test Suite
```bash
pytest tests/ -v
```

*Crafted for frontier AI safety intelligence and responsible detection.*
