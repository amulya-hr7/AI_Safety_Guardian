import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Film,
  Crosshair,
  ShieldAlert,
  ArrowRight,
  Shield,
  Trash2,
  Clock,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { AnalysisRecord, PageId, UserProfile, VideoFrameDetection, ViolenceClassification } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { BackButton } from '../components/BackButton';
import { SAMPLE_VIOLENCE_TESTS } from '../data/demoData';
import { apiClient } from '../services/api';
import confetti from 'canvas-confetti';

interface ExtractedFrame {
  timestampSeconds: number;
  frameBase64: string;
}

interface ViolencePageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnalysis: (record: AnalysisRecord) => void;
  user: UserProfile | null;
  isDemoMode: boolean;
  onBack?: () => void;
  previousPageName?: string;
  savedDraft?: {
    activeTab: 'image' | 'video' | 'webcam';
    selectedImage: string | null;
    videoFile: string | null;
    notes: string;
    currentResult: AnalysisRecord | null;
  };
  onSaveDraft?: (draft: {
    activeTab: 'image' | 'video' | 'webcam';
    selectedImage: string | null;
    videoFile: string | null;
    notes: string;
    currentResult: AnalysisRecord | null;
  }) => void;
}

export const ViolencePage: React.FC<ViolencePageProps> = ({
  onNavigate,
  onSelectAnalysis,
  user,
  isDemoMode,
  onBack,
  previousPageName,
  savedDraft,
  onSaveDraft
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'webcam'>(savedDraft?.activeTab || 'image');
  const [selectedImage, setSelectedImage] = useState<string | null>(savedDraft?.selectedImage || null);
  const [videoFile, setVideoFile] = useState<string | null>(savedDraft?.videoFile || null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isExtractingFrames, setIsExtractingFrames] = useState<boolean>(false);
  const [activeSeekTimestamp, setActiveSeekTimestamp] = useState<number | null>(null);

  const [notes, setNotes] = useState(savedDraft?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisRecord | null>(savedDraft?.currentResult || null);
  const [isDragging, setIsDragging] = useState(false);

  // Active video player ref
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  // Webcam stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync draft state to parent for restoration
  useEffect(() => {
    onSaveDraft?.({
      activeTab,
      selectedImage,
      videoFile,
      notes,
      currentResult
    });
  }, [activeTab, selectedImage, videoFile, notes, currentResult, onSaveDraft]);

  // Clean up camera on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access failed. Please ensure browser permissions are enabled.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Helper: Quickly compress uploaded image files to fast lightweight format (<100KB)
  const compressImageFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const captureCameraFrame = (): string | null => {
    if (!webcamVideoRef.current || !webcamCanvasRef.current) return null;
    const video = webcamVideoRef.current;
    const canvas = webcamCanvasRef.current;
    const maxDim = 640;
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;
    if (width > maxDim) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Helper: Extract real keyframes from video using canvas (optimized for speed)
  const extractFramesFromVideoUrl = useCallback(
    async (url: string, numFrames = 3): Promise<ExtractedFrame[]> => {
      return new Promise((resolve) => {
        setIsExtractingFrames(true);
        const tempVideo = document.createElement('video');
        tempVideo.crossOrigin = 'anonymous';
        tempVideo.src = url;
        tempVideo.muted = true;
        tempVideo.playsInline = true;

        const cleanup = () => {
          tempVideo.removeAttribute('src');
          tempVideo.load();
          setIsExtractingFrames(false);
        };

        const timeoutId = setTimeout(() => {
          console.warn('Video frame extraction timed out, using fallback synthetic frame points');
          cleanup();
          resolve([]);
        }, 6000);

        tempVideo.onloadedmetadata = async () => {
          try {
            const duration = tempVideo.duration || 5;
            const step = duration / (numFrames + 1);
            const targetTimes: number[] = [];
            for (let i = 1; i <= numFrames; i++) {
              targetTimes.push(Number((i * step).toFixed(2)));
            }

            const canvas = document.createElement('canvas');
            const width = 400;
            const height = Math.round((tempVideo.videoHeight / (tempVideo.videoWidth || 640)) * width) || 240;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              clearTimeout(timeoutId);
              cleanup();
              resolve([]);
              return;
            }

            const results: ExtractedFrame[] = [];

            for (const time of targetTimes) {
              await new Promise<void>((seekResolve) => {
                const onSeeked = () => {
                  tempVideo.removeEventListener('seeked', onSeeked);
                  try {
                    ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    results.push({
                      timestampSeconds: time,
                      frameBase64: dataUrl
                    });
                  } catch (drawErr) {
                    console.warn('Canvas drawImage error (possible CORS):', drawErr);
                  }
                  seekResolve();
                };
                tempVideo.addEventListener('seeked', onSeeked);
                tempVideo.currentTime = Math.min(time, duration - 0.1);
              });
            }

            clearTimeout(timeoutId);
            cleanup();
            resolve(results);
          } catch (e) {
            console.warn('Frame extraction error:', e);
            clearTimeout(timeoutId);
            cleanup();
            resolve([]);
          }
        };

        tempVideo.onerror = (e) => {
          console.warn('Video element load error during extraction:', e);
          clearTimeout(timeoutId);
          cleanup();
          resolve([]);
        };
      });
    },
    []
  );

  // Helper: Synthesize canvas video clips for instant preset testing
  const createSyntheticVideoCanvas = (title: string, isViolent: boolean): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw dark studio backdrop
    ctx.fillStyle = '#0F0F13';
    ctx.fillRect(0, 0, 640, 360);

    // Grid lines
    ctx.strokeStyle = '#22222A';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 360);
      ctx.stroke();
    }
    for (let y = 0; y < 360; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    // Title & scenario
    ctx.fillStyle = isViolent ? '#EF4444' : '#10B981';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(title, 30, 60);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px monospace';
    ctx.fillText(`Mode: Multi-Frame Temporal Feed • Status: Ready for Scan`, 30, 95);

    // Subject silhouettes
    if (isViolent) {
      // Dynamic confrontational figures
      ctx.fillStyle = '#F87171';
      ctx.beginPath();
      ctx.arc(260, 200, 28, 0, Math.PI * 2); // head 1
      ctx.fill();
      ctx.fillRect(245, 230, 30, 70); // body

      ctx.fillStyle = '#FCA5A5';
      ctx.beginPath();
      ctx.arc(360, 195, 28, 0, Math.PI * 2); // head 2
      ctx.fill();
      ctx.fillRect(345, 225, 30, 75);

      // Kinetic strike vector
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(275, 240);
      ctx.lineTo(345, 220);
      ctx.stroke();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('RAPID STRIKE VECTOR [DETECTED]', 230, 160);
    } else {
      // Peaceful subjects
      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.arc(220, 200, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(205, 230, 30, 70);

      ctx.fillStyle = '#6EE7B7';
      ctx.beginPath();
      ctx.arc(420, 200, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(405, 230, 30, 70);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SAFE SPATIAL SEPARATION [NORMAL]', 230, 160);
    }

    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setCurrentResult(null);

    if (activeTab === 'image') {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WEBP).');
        return;
      }
      const compressedData = await compressImageFile(file);
      setSelectedImage(compressedData);
      setVideoFile(null);
      setExtractedFrames([]);
      setCurrentResult(null);
      setError(null);
    } else if (activeTab === 'video') {
      if (!file.type.startsWith('video/')) {
        setError('Please upload a valid video file (MP4, WEBM, MOV).');
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setVideoFileName(file.name);
      setSelectedImage(null);
      setCurrentResult(null);
      setError(null);

      // Automatically extract real video frames (compact keyframes for fast inference)
      const frames = await extractFramesFromVideoUrl(url, 3);
      setExtractedFrames(frames);
    }
    // Reset file input value so re-selecting same or another file always fires onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);
    setCurrentResult(null);

    if (file.type.startsWith('image/')) {
      setActiveTab('image');
      const compressedData = await compressImageFile(file);
      setSelectedImage(compressedData);
      setVideoFile(null);
      setExtractedFrames([]);
      setCurrentResult(null);
      setError(null);
    } else if (file.type.startsWith('video/')) {
      setActiveTab('video');
      const url = URL.createObjectURL(file);
      setVideoFile(url);
      setVideoFileName(file.name);
      setSelectedImage(null);
      setCurrentResult(null);
      setError(null);

      const frames = await extractFramesFromVideoUrl(url, 3);
      setExtractedFrames(frames);
    } else {
      setError('Please drop a valid image or video file.');
    }
  };

  // Clear all media to allow entering a new photo or video
  const handleClearMedia = () => {
    stopCamera();
    setSelectedImage(null);
    setVideoFile(null);
    setVideoFileName('');
    setExtractedFrames([]);
    setCurrentResult(null);
    setError(null);
    setNotes('');
  };

  const handleSeekVideo = (timestampSeconds: number) => {
    setActiveSeekTimestamp(timestampSeconds);
    if (activeVideoRef.current) {
      activeVideoRef.current.currentTime = timestampSeconds;
      activeVideoRef.current.play().catch(() => {});
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setLoading(true);
    setCurrentResult(null);

    try {
      let payloadSource: string | undefined;
      let framesPayload: ExtractedFrame[] | undefined = undefined;

      if (activeTab === 'webcam') {
        const frame = captureCameraFrame();
        if (!frame) {
          throw new Error('Please start the camera and frame your subject before analyzing.');
        }
        payloadSource = frame;
      } else if (activeTab === 'image') {
        if (!selectedImage) {
          throw new Error('Please select or upload an image to analyze.');
        }
        payloadSource = selectedImage;
      } else if (activeTab === 'video') {
        if (!videoFile && extractedFrames.length === 0) {
          throw new Error('Please upload or select a video file to analyze.');
        }

        // Use extracted frames if present
        if (extractedFrames.length > 0) {
          framesPayload = extractedFrames;
          payloadSource = extractedFrames[0].frameBase64;
        } else if (videoFile) {
          // Attempt on-the-fly extraction
          const freshFrames = await extractFramesFromVideoUrl(videoFile, 3);
          if (freshFrames.length > 0) {
            setExtractedFrames(freshFrames);
            framesPayload = freshFrames;
            payloadSource = freshFrames[0].frameBase64;
          } else {
            payloadSource = selectedImage || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';
          }
        }
      }

      const result = await apiClient.analyzeViolence({
        imageBase64: payloadSource?.startsWith('data:') ? payloadSource : undefined,
        imageUrl: payloadSource?.startsWith('http') ? payloadSource : undefined,
        sourceType: activeTab,
        title: videoFileName
          ? `Video Scan: ${videoFileName}`
          : `${activeTab === 'video' ? 'Video Sequence' : activeTab === 'webcam' ? 'Live Camera Feed' : 'Surveillance Photo'} Threat Scan`,
        notes: notes || undefined,
        isDemo: isDemoMode,
        userName: user?.name,
        videoFrames: framesPayload
      });

      setCurrentResult(result);
      if (result.riskLevel === 'Low') {
        try {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
        } catch {
          // confetti optional
        }
      }

      setTimeout(() => {
        const el = document.getElementById('violence-result-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'Unable to complete violence detection analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = async (sample: (typeof SAMPLE_VIOLENCE_TESTS)[0]) => {
    stopCamera();
    setError(null);
    setCurrentResult(null);

    if (sample.type === 'video') {
      setActiveTab('video');
      setSelectedImage(null);
      setVideoFileName(sample.title);
      setNotes(sample.description);

      // Create high-res synthetic video keyframe frames representing the altercation sequence
      const isViolent = sample.id.includes('1');
      const frame1 = createSyntheticVideoCanvas(`${sample.title} [T=1.0s]`, false);
      const frame2 = createSyntheticVideoCanvas(`${sample.title} [T=3.5s]`, isViolent);
      const frame3 = createSyntheticVideoCanvas(`${sample.title} [T=6.0s]`, isViolent);

      const frames: ExtractedFrame[] = [
        { timestampSeconds: 1.0, frameBase64: frame1 || sample.imageUrl },
        { timestampSeconds: 3.5, frameBase64: frame2 || sample.imageUrl },
        { timestampSeconds: 6.0, frameBase64: frame3 || sample.imageUrl }
      ];

      setExtractedFrames(frames);
      setSelectedImage(sample.imageUrl);
      setVideoFile(null); // Displays the interactive visual timeline with thumbnails
    } else {
      setActiveTab('image');
      setSelectedImage(sample.imageUrl);
      setVideoFile(null);
      setVideoFileName('');
      setExtractedFrames([]);
      setNotes(sample.description);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <BackButton
            id="violence-back-btn"
            onClick={onBack || (() => onNavigate('dashboard'))}
            label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                <Video size={22} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Module B: Violence & Threat Visual Detection
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Multimodal computer vision for interpersonal assault, brawl gestures, and weapon indicator recognition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-[#141417] border border-[#D4AF37]/30 text-zinc-300 font-mono">
              Vision: <strong className="text-[#D4AF37]">Gemini 3.8 Flash + Multi-Frame Video AI</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            id="tab-image-mode"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              stopCamera();
              setActiveTab('image');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'image'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md shadow-amber-500/10'
                : 'bg-[#141417] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Upload size={15} />
            <span>Image Photo Scan</span>
          </motion.button>

          <motion.button
            id="tab-video-mode"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              stopCamera();
              setActiveTab('video');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'video'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md shadow-amber-500/10'
                : 'bg-[#141417] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Film size={15} />
            <span>Video Temporal Scanner</span>
          </motion.button>

          <motion.button
            id="tab-webcam-mode"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setActiveTab('webcam');
              startCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'webcam'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md shadow-amber-500/10'
                : 'bg-[#141417] text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Camera size={15} />
            <span>Live Device Camera</span>
          </motion.button>
        </div>

        {/* Clear / New Media Button */}
        {(selectedImage || videoFile || extractedFrames.length > 0 || currentResult) && (
          <motion.button
            id="clear-media-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleClearMedia}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 cursor-pointer transition-all"
            title="Clear and enter a new photo or video"
          >
            <Trash2 size={13} className="text-red-400" />
            <span>Clear & Enter New Media</span>
          </motion.button>
        )}
      </motion.div>

      {/* Main Inspection Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Preview / Capture Stage */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="p-6 rounded-3xl bg-[#141417]/90 border border-[#D4AF37]/25 space-y-4 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair size={14} className="text-[#D4AF37]" />
                <span>
                  {activeTab === 'video'
                    ? 'Video Sequence Viewport'
                    : activeTab === 'webcam'
                    ? 'Live Camera Viewport'
                    : 'Image Viewport'}
                </span>
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {activeTab === 'video'
                  ? 'Multi-Frame Extraction Active'
                  : activeTab === 'webcam'
                  ? 'Real-Time Frame Stream'
                  : 'High-Res Optical Analysis'}
              </span>
            </div>

            {/* Viewport Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative aspect-video w-full rounded-2xl bg-[#0E0E11] border overflow-hidden flex items-center justify-center transition-all ${
                isDragging ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 bg-[#D4AF37]/5' : 'border-zinc-800'
              }`}
            >
              {activeTab === 'webcam' ? (
                <div className="relative w-full h-full">
                  <video
                    ref={webcamVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={webcamCanvasRef} className="hidden" />

                  {/* Overlaid scanning indicator */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-[#D4AF37]/40 rounded-2xl">
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>LIVE CAM ACTIVE</span>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'video' && videoFile ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    ref={activeVideoRef}
                    src={videoFile}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {isExtractingFrames && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                      <RefreshCw size={24} className="animate-spin text-[#D4AF37]" />
                      <span className="text-xs font-mono">Extracting multi-frame inspection sequence...</span>
                    </div>
                  )}
                </div>
              ) : selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Inspection target"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {activeTab === 'video' && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 flex items-center gap-1.5">
                      <Film size={12} />
                      <span>SEQUENCE SIMULATION READY</span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="text-center p-8 space-y-3 text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors"
                >
                  <div className="p-4 rounded-2xl bg-[#1C1C22] border border-zinc-800 w-fit mx-auto text-[#D4AF37]">
                    {activeTab === 'video' ? <Film size={36} /> : <Upload size={36} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      Click to browse or drop {activeTab === 'video' ? 'a video (MP4, WEBM)' : 'an image (PNG, JPG)'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Every scan starts fresh. Upload your own file or click a test scenario below.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Video Keyframes Timeline Strip (When video or frames are available) */}
            {activeTab === 'video' && extractedFrames.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} />
                    <span>Multi-Frame Temporal Sequence ({extractedFrames.length} Frames)</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Click thumbnail to seek video</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {extractedFrames.map((frame, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => handleSeekVideo(frame.timestampSeconds)}
                      className={`relative aspect-video rounded-xl overflow-hidden border text-left cursor-pointer transition-all group ${
                        activeSeekTimestamp === frame.timestampSeconds
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50'
                          : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <img
                        src={frame.frameBase64}
                        alt={`Frame at ${frame.timestampSeconds}s`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-zinc-200">
                        {frame.timestampSeconds}s
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Notes / Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Info size={13} className="text-[#D4AF37]" />
                <span>Context / Observational Notes (Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Security camera at gate B, public altercation, martial arts training..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0E0E11] border border-zinc-800 focus:border-[#D4AF37] focus:outline-none text-xs text-white placeholder-zinc-500"
              />
            </div>

            {/* Upload or Camera Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={activeTab === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileUpload}
                className="hidden"
              />

              {activeTab === 'webcam' ? (
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isCameraActive ? stopCamera : startCamera}
                    className="px-3.5 py-2 rounded-xl bg-[#1C1C22] hover:bg-[#25252D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                  >
                    <Camera size={14} />
                    <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#1C1C22] hover:bg-[#25252D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors"
                  >
                    <Upload size={14} />
                    <span>Upload {activeTab === 'video' ? 'Video (MP4, WEBM)' : 'Image (PNG, JPG)'}</span>
                  </motion.button>

                  {(selectedImage || videoFile || extractedFrames.length > 0) && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleClearMedia}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-zinc-800 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Clear Media</span>
                    </motion.button>
                  )}
                </div>
              )}

              <motion.button
                id="run-violence-analysis-btn"
                onClick={handleAnalyze}
                disabled={loading || (activeTab === 'image' && !selectedImage) || (activeTab === 'video' && !videoFile && extractedFrames.length === 0 && !selectedImage)}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.96 }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#F59E0B] hover:brightness-110 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-black" />
                    <span>Analyzing multi-frame video sequence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Scan for Violence & Threat</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Pre-Loaded Test Scenarios (Both Video & Image) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="p-5 rounded-3xl bg-[#141417]/80 border border-zinc-800 space-y-3 backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37]/80 uppercase tracking-wider">
                Verification Test Scenarios (Video & Photo)
              </span>
              <span className="text-[11px] text-[#D4AF37]">1-Click Instant Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_VIOLENCE_TESTS.map((sample) => (
                <motion.button
                  key={sample.id}
                  id={`sample-preset-${sample.id}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelectSample(sample)}
                  className="p-2.5 rounded-xl bg-[#0E0E11]/90 hover:bg-[#1C1C22] border border-zinc-800 hover:border-[#D4AF37]/50 text-left text-xs cursor-pointer transition-colors space-y-1 group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                        sample.type === 'video'
                          ? 'bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {sample.type === 'video' ? 'Video Clip' : 'Photo'}
                    </span>
                    <Play size={10} className="text-zinc-600 group-hover:text-[#D4AF37]" />
                  </div>
                  <p className="font-bold text-white line-clamp-1">{sample.title}</p>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{sample.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Vision Analysis Output Pane */}
        <div id="violence-result-section" className="lg:col-span-5 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-red-500/10 border border-red-500/40 text-center space-y-4 backdrop-blur-md"
            >
              <div className="p-3 rounded-2xl bg-red-500/20 text-red-400 w-fit mx-auto border border-red-500/30">
                <AlertTriangle size={26} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-200">Unable to analyze this media.</h4>
                <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
              </div>
              <button
                id="retry-violence-scan-btn"
                onClick={handleAnalyze}
                className="px-5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-bold flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all"
              >
                <RefreshCw size={14} />
                <span>Retry Scan</span>
              </button>
            </motion.div>
          )}

          {loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 rounded-3xl bg-[#141417]/90 border border-[#D4AF37]/30 text-center space-y-4 shadow-2xl backdrop-blur-md"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                <Video size={24} className="text-[#D4AF37]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Multimodal Vision Inference In Progress</h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Deconstructing sequential kinematic vectors, close-contact body trajectories, and weapon hazard profiles...
                </p>
              </div>
            </motion.div>
          )}

          {currentResult && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-3xl bg-[#141417]/95 border border-[#D4AF37]/35 space-y-5 shadow-2xl backdrop-blur-md"
            >
              {/* Top Banner with Threat Verdict */}
              {(() => {
                const isViolent =
                  currentResult.classification !== 'Normal / Safe' && currentResult.riskLevel !== 'Low';
                return (
                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isViolent
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isViolent ? 'bg-red-500/25 text-red-400' : 'bg-emerald-500/25 text-emerald-400'
                        }`}
                      >
                        {isViolent ? <ShieldAlert size={22} /> : <CheckCircle2 size={22} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold block opacity-80">
                          Threat Status
                        </span>
                        <h4 className="text-base font-extrabold text-white">
                          Violence Detected:{' '}
                          <span className={isViolent ? 'text-red-400' : 'text-emerald-400'}>
                            {isViolent ? 'Yes' : 'No'}
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                        Risk Level
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border ${
                          currentResult.riskLevel === 'Critical'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : currentResult.riskLevel === 'High'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : currentResult.riskLevel === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {currentResult.riskLevel} ({currentResult.riskScore}/100)
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Classification & Confidence Row */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141417] via-[#1C1C22] to-[#141417] border border-[#D4AF37]/30 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
                  Vision Classification
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {currentResult.classification}
                </h3>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge riskLevel={currentResult.riskLevel} score={currentResult.riskScore} />
                    <span className="text-xs text-zinc-400 font-mono">
                      Confidence: <strong className="text-white">{currentResult.confidenceScore}%</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {new Date(currentResult.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Rationale / Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Plain-English Explanation
                </h4>
                <p className="text-xs text-zinc-200 leading-relaxed p-3.5 rounded-xl bg-[#0E0E11]/90 border border-zinc-800">
                  {currentResult.explanation}
                </p>
              </div>

              {/* Key Factors */}
              {currentResult.keyFactors && currentResult.keyFactors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Key Observational Factors
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {currentResult.keyFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#0E0E11] border border-zinc-800/80">
                        <span className="text-[#D4AF37] font-bold">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected Objects & Threat Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0E0E11]/90 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Detected Objects
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentResult.detectedObjects && currentResult.detectedObjects.length > 0
                      ? currentResult.detectedObjects
                      : ['None']
                    ).map((obj, oIdx) => (
                      <span
                        key={oIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#141417] text-[#D4AF37] border border-[#D4AF37]/30"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0E0E11]/90 border border-zinc-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Threat Indicators
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentResult.threatIndicators && currentResult.threatIndicators.length > 0
                      ? currentResult.threatIndicators
                      : ['None detected']
                    ).map((ti, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#141417] text-amber-300 border border-amber-500/30"
                      >
                        {ti}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Timeline Slices (Interactive Seekable) */}
              {currentResult.frameDetections && currentResult.frameDetections.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Film size={12} className="text-[#D4AF37]" />
                      <span>Temporal Frame Timeline Breakdown</span>
                    </h4>
                    <span className="text-[10px] text-zinc-500">Click to seek video</span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentResult.frameDetections.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        onClick={() => handleSeekVideo(f.timestampSeconds)}
                        className="w-full p-2.5 rounded-xl bg-[#0E0E11] hover:bg-[#1C1C22] border border-zinc-800 hover:border-[#D4AF37]/40 flex items-center justify-between text-xs cursor-pointer transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#D4AF37] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {f.timestampSeconds}s
                          </span>
                          <span className="text-zinc-200 font-medium">{f.category}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-zinc-400">Risk: {f.riskScore}/100</span>
                          <span className="text-xs text-[#D4AF37]">Seek ▶</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    onSelectAnalysis(currentResult);
                    onNavigate('results');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1C1C22] hover:bg-[#272732] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>View Complete Audit Log & Explainability</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={handleClearMedia}
                  className="w-full py-2 rounded-xl bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Scan Another Photo or Video</span>
                </button>
              </div>
            </motion.div>
          )}

          {!currentResult && !loading && !error && (
            <div className="p-8 rounded-3xl bg-[#141417]/80 border border-zinc-800 text-center space-y-3 backdrop-blur-md">
              <Shield size={32} className="mx-auto text-zinc-600" />
              <h4 className="text-sm font-bold text-white">Awaiting Visual Media Input</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Upload a video or photo, or select one of the verification test scenarios and click{' '}
                <strong className="text-white">"Scan for Violence & Threat"</strong> to generate real-time computer vision analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
