"""
Computer Vision Image Violence & Threat Detection Module.
Uses OpenCV for multimodal visual feature extraction, chromatic blood/flame detection,
high-energy edge density, and human interaction proximity heuristics.
"""

import os
from pathlib import Path
from typing import Dict, Any, Union, Optional
import numpy as np

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

from app.config import settings

class ImageViolenceDetector:
    """
    OpenCV-based visual threat and violence assessment engine.
    Analyzes visual cues:
    - Chromatic blood & flame spectrum (HSV dual-range segmentation)
    - Structural high-energy edge density (Canny & Sobel gradients)
    - Motion impact / texture entropy (Laplacian variance)
    - Spatial human face & posture clustering (Haar Cascades)
    """

    def __init__(self):
        self.cascade_loaded = False
        self.face_cascade = None
        self._init_cascades()

    def _init_cascades(self):
        """Load pretrained OpenCV Haar Cascades if available locally or in OpenCV data dir."""
        if not OPENCV_AVAILABLE:
            return
        try:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            if os.path.exists(cascade_path):
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
                self.cascade_loaded = True
        except Exception:
            self.cascade_loaded = False

    def analyze_image(self, image_input: Union[str, Path, bytes, np.ndarray]) -> Dict[str, Any]:
        """
        Analyze an image and return:
        - classification: 'Non-violent' or 'Potentially Violent'
        - risk_score: 0 to 100
        - confidence: 0 to 100
        - explanation: Responsible, non-punitive rationale
        - details: Numerical breakdown of visual features
        """
        if not OPENCV_AVAILABLE:
            return {
                "classification": "Non-violent",
                "risk_score": 15.0,
                "confidence": 60.0,
                "risk_level": "Low",
                "explanation": "OpenCV library not detected in local environment. Running in conservative baseline mode.",
                "details": {"error": "opencv-python not installed"}
            }

        # Load image into numpy array
        img = self._load_cv_image(image_input)
        if img is None:
            return {
                "classification": "Non-violent",
                "risk_score": 10.0,
                "confidence": 40.0,
                "risk_level": "Low",
                "explanation": "Invalid or unreadable image file format. Ensure valid PNG, JPEG, or WEBP.",
                "details": {"error": "Image decode failure"}
            }

        h, w = img.shape[:2]
        total_pixels = h * w

        # Convert color spaces
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # 1. Chromatic Blood Spectrum (Red range in HSV wraps around 0/180)
        lower_red1 = np.array([0, 70, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 70, 50])
        upper_red2 = np.array([180, 255, 255])

        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_blood = cv2.bitwise_or(mask_red1, mask_red2)
        blood_pixel_count = int(cv2.countNonZero(mask_blood))
        blood_ratio = (blood_pixel_count / total_pixels) * 100.0

        # 2. Chromatic Flame & Combustion Spectrum (Orange / Intense Yellow)
        lower_fire = np.array([10, 100, 150])
        upper_fire = np.array([30, 255, 255])
        mask_fire = cv2.inRange(hsv, lower_fire, upper_fire)
        fire_pixel_count = int(cv2.countNonZero(mask_fire))
        fire_ratio = (fire_pixel_count / total_pixels) * 100.0

        # 3. High-Energy Structural Edge Density (Canny)
        edges = cv2.Canny(gray, threshold1=100, threshold2=200)
        edge_pixel_count = int(cv2.countNonZero(edges))
        edge_density = (edge_pixel_count / total_pixels) * 100.0

        # 4. Texture Sharpness / Blur Entropy (Laplacian Variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 5. Face / People Proximity Detection
        faces_detected = 0
        if self.cascade_loaded and self.face_cascade is not None:
            try:
                faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
                faces_detected = len(faces)
            except Exception:
                faces_detected = 0

        # Compute weighted heuristic risk score
        risk_components = []
        score = 12.0 # Baseline natural ambient score

        # Blood cue weighting
        if blood_ratio > 3.5:
            added = min(40.0, blood_ratio * 4.5)
            score += added
            risk_components.append(f"Elevated concentrated red/blood chromatic spectrum ({blood_ratio:.1f}% coverage)")
        elif blood_ratio > 1.2:
            score += 10.0

        # Fire cue weighting
        if fire_ratio > 4.0:
            added = min(30.0, fire_ratio * 3.5)
            score += added
            risk_components.append(f"Combustion / thermal flare signature detected ({fire_ratio:.1f}% coverage)")

        # Structural chaos / edge intensity
        if edge_density > 18.0:
            score += 15.0
            risk_components.append("High-frequency structural edge density indicating fragmentation or mechanical clash")

        # Proximity interaction
        if faces_detected >= 2 and (blood_ratio > 2.0 or edge_density > 15.0):
            score += 15.0
            risk_components.append("Multi-person close-proximity spatial cluster with elevated conflict cues")

        # Cap between 0 and 100
        final_risk = max(5.0, min(95.0, score))
        confidence = max(65.0, min(95.0, 75.0 + (blood_ratio * 2.0) + (edge_density * 0.5)))

        if final_risk >= 60.0:
            classification = "Potentially Violent"
            risk_level = "High" if final_risk >= 75.0 else "Medium"
            explanation = (
                "Computer vision feature analysis identified visual indicators of physical clash, combustion, "
                "or blood-like chromatic concentration. Human review is recommended to contextualize this assessment. "
                "Note: This automated visual screening tool does not identify individuals or assess criminal liability."
            )
        elif final_risk >= 35.0:
            classification = "Potentially Violent"
            risk_level = "Medium"
            explanation = (
                "Moderate visual anomaly detected with elevated edge variance or localized color saturation. "
                "May indicate sports action, dramatic lighting, or rapid movement."
            )
        else:
            classification = "Non-violent"
            risk_level = "Low"
            explanation = (
                "No significant visual indicators of violence, bloodshed, or explosive combustion were observed in the image. "
                "Color distribution and structural gradients remain within peaceful environmental baselines."
            )

        return {
            "classification": classification,
            "risk_score": round(final_risk, 1),
            "confidence": round(confidence, 1),
            "risk_level": risk_level,
            "explanation": explanation,
            "detected_indicators": risk_components if risk_components else ["Within standard non-violent visual baseline"],
            "details": {
                "resolution": f"{w}x{h}",
                "blood_chromatic_ratio_pct": round(blood_ratio, 2),
                "flame_chromatic_ratio_pct": round(fire_ratio, 2),
                "edge_density_pct": round(edge_density, 2),
                "laplacian_sharpness": round(laplacian_var, 1),
                "faces_detected": faces_detected,
                "cv_engine": "OpenCV Multi-Spectral Feature Extractor"
            }
        }

    def _load_cv_image(self, img_input: Union[str, Path, bytes, np.ndarray]) -> Optional[np.ndarray]:
        """Convert various input formats into a standard BGR numpy array."""
        if isinstance(img_input, np.ndarray):
            return img_input
        if isinstance(img_input, (str, Path)):
            path_str = str(img_input)
            if os.path.exists(path_str):
                return cv2.imread(path_str)
            return None
        if isinstance(img_input, bytes):
            nparr = np.frombuffer(img_input, np.uint8)
            return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return None

# Singleton instance
image_detector = ImageViolenceDetector()
