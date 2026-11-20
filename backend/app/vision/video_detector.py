"""
Computer Vision Video Violence Detection Module.
Efficiently processes video files with temporal frame sampling, optical motion difference,
and per-frame visual threat aggregation without loading full video into RAM.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

from app.config import settings
from app.vision.image_detector import image_detector

class VideoViolenceDetector:
    """
    OpenCV-based temporal video violence detection engine.
    Samples frames evenly across the video timeline to deliver rapid, low-memory analysis.
    """

    def analyze_video(self, video_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Analyze a video file and return:
        - classification: 'Non-violent' or 'Potentially Violent'
        - risk_score: 0 to 100
        - confidence: 0 to 100
        - explanation: Clear, responsible rationale
        - analyzed_frames: Total number of frames sampled
        - suspicious_timestamps: List of timestamps (e.g. ['00:04.2', '00:11.8'])
        - details: Frame-by-frame breakdown
        """
        video_path_str = str(video_path)

        if not OPENCV_AVAILABLE:
            return {
                "classification": "Non-violent",
                "risk_score": 15.0,
                "confidence": 60.0,
                "risk_level": "Low",
                "explanation": "OpenCV is not available in local environment. Running in conservative baseline mode.",
                "analyzed_frames": 0,
                "suspicious_timestamps": [],
                "details": {"error": "opencv-python not installed"}
            }

        if not os.path.exists(video_path_str):
            return {
                "classification": "Non-violent",
                "risk_score": 0.0,
                "confidence": 0.0,
                "risk_level": "Low",
                "explanation": "Video file was not found on server disk.",
                "analyzed_frames": 0,
                "suspicious_timestamps": [],
                "details": {"error": "File not found"}
            }

        cap = cv2.VideoCapture(video_path_str)
        if not cap.isOpened():
            return {
                "classification": "Non-violent",
                "risk_score": 10.0,
                "confidence": 40.0,
                "risk_level": "Low",
                "explanation": "Could not open or decode video stream. Ensure file is a valid MP4 or WebM codec.",
                "analyzed_frames": 0,
                "suspicious_timestamps": [],
                "details": {"error": "Video codec unsupported"}
            }

        # Extract video metadata
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 0
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 0
        duration_sec = total_frames / fps if fps > 0 else 0

        # Sample frames efficiently (e.g., maximum 30 frames evenly spaced)
        max_samples = min(settings.MAX_VIDEO_FRAMES_SAMPLE, max(5, total_frames))
        sample_indices = np.linspace(0, max(0, total_frames - 1), num=max_samples, dtype=int)

        frame_results = []
        suspicious_timestamps = []
        prev_gray = None
        motion_scores = []

        try:
            for idx in sample_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if not ret or frame is None:
                    continue

                timestamp_sec = idx / fps if fps > 0 else 0
                time_str = f"{int(timestamp_sec // 60):02d}:{timestamp_sec % 60:04.1f}"

                # 1. Optical Motion Difference
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                motion_energy = 0.0
                if prev_gray is not None:
                    diff = cv2.absdiff(prev_gray, gray)
                    motion_energy = float(np.mean(diff))
                prev_gray = gray
                motion_scores.append(motion_energy)

                # 2. Per-frame visual feature analysis
                frame_eval = image_detector.analyze_image(frame)
                frame_risk = frame_eval["risk_score"]

                # Add motion velocity modifier
                if motion_energy > 35.0:
                    frame_risk = min(100.0, frame_risk + 10.0)

                frame_entry = {
                    "frame_index": int(idx),
                    "timestamp": time_str,
                    "risk_score": round(frame_risk, 1),
                    "classification": frame_eval["classification"],
                    "motion_energy": round(motion_energy, 1),
                    "blood_pct": frame_eval["details"].get("blood_chromatic_ratio_pct", 0),
                    "edge_density": frame_eval["details"].get("edge_density_pct", 0)
                }
                frame_results.append(frame_entry)

                # Flag suspicious timestamps
                if frame_risk >= 60.0:
                    suspicious_timestamps.append(time_str)

        finally:
            cap.release()

        # Aggregate video-level metrics
        if not frame_results:
            return {
                "classification": "Non-violent",
                "risk_score": 10.0,
                "confidence": 50.0,
                "risk_level": "Low",
                "explanation": "No readable video frames could be extracted.",
                "analyzed_frames": 0,
                "suspicious_timestamps": [],
                "details": {}
            }

        risks = [f["risk_score"] for f in frame_results]
        max_risk = max(risks)
        mean_risk = float(np.mean(risks))

        # 70% weight on peak risk + 30% on average timeline risk
        aggregated_risk = (0.70 * max_risk) + (0.30 * mean_risk)
        final_risk = max(5.0, min(95.0, aggregated_risk))

        confidence = max(65.0, min(96.0, 70.0 + len(frame_results)))

        if final_risk >= 60.0:
            classification = "Potentially Violent"
            risk_level = "High" if final_risk >= 75.0 else "Medium"
            explanation = (
                f"Multi-frame temporal computer vision analysis detected elevated threat/violence indicators across "
                f"{len(suspicious_timestamps)} sampled video segments (notably around {', '.join(suspicious_timestamps[:3])}). "
                f"Human editorial review is advised."
            )
        elif final_risk >= 35.0:
            classification = "Potentially Violent"
            risk_level = "Medium"
            explanation = (
                "Moderate kinetic motion, rapid camera shifts, or localized contrast spikes detected. "
                "May indicate athletic activity, fast editing, or action scenes."
            )
        else:
            classification = "Non-violent"
            risk_level = "Low"
            explanation = (
                "Video frame inspection across the timeline revealed standard non-violent environmental scenery "
                "with stable luminance and peaceful motion dynamics."
            )

        return {
            "classification": classification,
            "risk_score": round(final_risk, 1),
            "confidence": round(confidence, 1),
            "risk_level": risk_level,
            "explanation": explanation,
            "analyzed_frames": len(frame_results),
            "suspicious_timestamps": suspicious_timestamps,
            "details": {
                "duration_sec": round(duration_sec, 2),
                "fps": round(fps, 1),
                "resolution": f"{width}x{height}",
                "total_video_frames": total_frames,
                "sampled_frames_count": len(frame_results),
                "frame_timeline": frame_results[:15] # Return first 15 for payload efficiency
            }
        }

# Singleton instance
video_detector = VideoViolenceDetector()
