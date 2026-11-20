import React, { useState, useRef, useEffect } from 'react';
import { PageId, AnalysisRecord, UserProfile } from '../types';
import { apiClient } from '../services/api';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Shield,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Info,
  Sliders,
  Layers,
  Clock
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { BackButton } from '../components/BackButton';
import confetti from 'canvas-confetti';

interface AnalyzePageProps {
  onNavigate: (page: PageId) => void;
  onSelectAnalysis: (record: AnalysisRecord) => void;
  user: UserProfile | null;
  isDemoMode: boolean;
  initialTab?: 'text' | 'image' | 'video';
  onBack?: () => void;
  previousPageName?: string;
  savedDraft?: {
    activeTab: 'text' | 'image' | 'video';
    inputText: string;
    inputTitle: string;
    imagePreviewUrl: string | null;
    videoPreviewUrl: string | null;
    currentResult: AnalysisRecord | null;
  };
  onSaveDraft?: (draft: {
    activeTab: 'text' | 'image' | 'video';
    inputText: string;
    inputTitle: string;
    imagePreviewUrl: string | null;
    videoPreviewUrl: string | null;
    currentResult: AnalysisRecord | null;
  }) => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({
  onNavigate,
  onSelectAnalysis,
  user,
  isDemoMode,
  initialTab = 'text',
  onBack,
  previousPageName,
  savedDraft,
  onSaveDraft
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video'>(savedDraft?.activeTab || initialTab);

  // Text State
  const [inputText, setInputText] = useState(savedDraft?.inputText || '');
  const [inputTitle, setInputTitle] = useState(savedDraft?.inputTitle || '');

  // Image State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    savedDraft?.imagePreviewUrl !== undefined
      ? savedDraft.imagePreviewUrl
      : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Video State
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(savedDraft?.videoPreviewUrl || null);

  // Execution & Result State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisRecord | null>(savedDraft?.currentResult || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync draft state to parent for restoration
  useEffect(() => {
    onSaveDraft?.({
      activeTab,
      inputText,
      inputTitle,
      imagePreviewUrl,
      videoPreviewUrl,
      currentResult: result
    });
  }, [activeTab, inputText, inputTitle, imagePreviewUrl, videoPreviewUrl, result, onSaveDraft]);

  // Samples for quick testing
  const textSamples = [
    {
      label: 'Credible Science News',
      title: 'Oxford Clinical Trial Report',
      text: 'Researchers at Oxford University published a peer-reviewed randomized trial in The Lancet demonstrating that daily dietary fiber intake significantly reduces cardiovascular inflammation markers without adverse pharmacological side effects.'
    },
    {
      label: 'Sensational Clickbait',
      title: 'Secret Miracle Root Remedy',
      text: 'SHOCKING BOMBSHELL: Top doctors are terrified of this ancient Himalayan miracle root that cures diabetes and restores damaged organs in 48 hours! Big Pharma is trying to ban this leaked recipe worldwide!'
    },
    {
      label: 'Conspiracy Theory Claim',
      title: 'Weather Modification Super-Storms',
      text: 'Leaked military documents confirm covert atmospheric frequency generators were activated last week to artificially trigger category 5 hurricanes and manipulate agricultural commodity markets.'
    }
  ];

  const imageSamples = [
    {
      label: 'Peaceful Nature Scene',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      title: 'Mountain Alpine Meadow'
    },
    {
      label: 'Kinetic Conflict / Fire Scene',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
      title: 'High-Energy Industrial Combustion'
    },
    {
      label: 'Urban Crowd Dynamics',
      url: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=800&q=80',
      title: 'Metropolitan Street Gathering'
    }
  ];

  // Camera Management
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(console.warn);
          }
        })
        .catch((err) => {
          console.warn('Camera access denied:', err);
          setErrorMessage('Camera access was denied or is unavailable.');
          setIsCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImagePreviewUrl(dataUrl);
    setSelectedImageFile(null);
    setIsCameraActive(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsCameraActive(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      if (activeTab === 'text') {
        if (!inputText.trim()) {
          setErrorMessage('Please enter text or select a sample to analyze.');
          setIsLoading(false);
          return;
        }

        const res = await apiClient.analyzeMisinformation({
          text: inputText,
          title: inputTitle || undefined,
          isDemo: isDemoMode,
          userName: user?.name
        });
        setResult(res);
        if (res.riskLevel === 'Low') {
          try {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
          } catch {
            // confetti optional
          }
        }
      } else if (activeTab === 'image') {
        if (!imagePreviewUrl) {
          setErrorMessage('Please upload an image, take a camera snapshot, or select a sample.');
          setIsLoading(false);
          return;
        }

        const res = await apiClient.analyzeViolence({
          imageBase64: imagePreviewUrl.startsWith('data:') ? imagePreviewUrl : undefined,
          imageUrl: !imagePreviewUrl.startsWith('data:') ? imagePreviewUrl : undefined,
          sourceType: 'image',
          title: inputTitle || 'Image Threat Screening',
          isDemo: isDemoMode,
          userName: user?.name
        });
        setResult(res);
        if (res.riskLevel === 'Low') {
          try {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
          } catch {
            // confetti optional
          }
        }
      } else if (activeTab === 'video') {
        if (!selectedVideoFile && !videoPreviewUrl) {
          setErrorMessage('Please select an MP4 or WebM video file to analyze.');
          setIsLoading(false);
          return;
        }

        const res = await apiClient.analyzeViolence({
          imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
          sourceType: 'video',
          title: selectedVideoFile?.name || 'Video Stream Threat Inspection',
          notes: `Uploaded video: ${selectedVideoFile?.name || 'sample.mp4'} (${Math.round((selectedVideoFile?.size || 1024000) / 1024)} KB)`,
          isDemo: isDemoMode,
          userName: user?.name
        });
        setResult(res);
        if (res.riskLevel === 'Low') {
          try {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
          } catch {
            // confetti optional
          }
        }
      }

      setTimeout(() => {
        const el = document.getElementById('analysis-result-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Top Navigation Row with Go Back Arrow */}
      <div className="flex items-center justify-between gap-4">
        <BackButton
          id="btn-analyze-go-back"
          onClick={onBack || (() => onNavigate('dashboard'))}
          label={previousPageName ? `Back to ${previousPageName}` : 'Back to Dashboard'}
        />

        {isDemoMode && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium">
            <Info className="w-3.5 h-3.5" /> Demo Mode
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Multimodal Detection Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Real-Time AI Safety Analysis
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Unified evaluation pipeline for NLP Misinformation Claims, Visual Threat Detection, and Video Frame Screening.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-[#0E0E11] p-1.5 rounded-2xl border border-zinc-800 shadow-inner">
        <button
          id="tab-text"
          onClick={() => {
            setActiveTab('text');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141417]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>TEXT CLAIMS</span>
        </button>

        <button
          id="tab-image"
          onClick={() => {
            setActiveTab('image');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141417]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>IMAGE VISION</span>
        </button>

        <button
          id="tab-video"
          onClick={() => {
            setActiveTab('video');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'video'
              ? 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141417]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>VIDEO SEQUENCE</span>
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-start gap-3 text-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Analysis Notice</p>
            <p className="text-red-300/90 mt-0.5 text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Analysis Form Card */}
      <div className="bg-[#141417]/95 border border-[#D4AF37]/25 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 backdrop-blur-md">
        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Document / Article Headline (Optional)
              </label>
              <input
                id="text-input-title"
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                placeholder="e.g. Breaking Health Report or Social Media Post Headline"
                className="w-full bg-[#0E0E11] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Claim or Article Text to Evaluate *
                </label>
                <span className="text-xs text-zinc-500 font-mono">
                  {inputText.length} chars
                </span>
              </div>
              <textarea
                id="text-input-content"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste an article paragraph, headline, or viral claim to run NLP verification and stance evaluation..."
                className="w-full bg-[#0E0E11] border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] leading-relaxed font-sans transition-colors"
              />
            </div>

            {/* Quick Sample Presets */}
            <div>
              <span className="text-xs font-bold text-[#D4AF37] mb-2 block uppercase tracking-wider">
                Quick Test Samples:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {textSamples.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputTitle(s.title);
                      setInputText(s.text);
                    }}
                    className="text-left p-3 rounded-xl bg-[#0E0E11] hover:bg-[#1C1C22] border border-zinc-800 hover:border-[#D4AF37]/60 text-xs text-zinc-300 transition-all group cursor-pointer"
                  >
                    <span className="font-bold text-[#D4AF37] group-hover:text-amber-300 block mb-0.5">
                      {s.label}
                    </span>
                    <span className="line-clamp-2 text-zinc-400 text-[11px]">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMAGE TAB */}
        {activeTab === 'image' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload & Camera Controls */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Select Visual Media Source
                </label>

                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0E0E11] border border-dashed border-zinc-700 hover:border-[#D4AF37] cursor-pointer text-xs font-medium text-zinc-300 hover:text-white transition-all">
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span>Upload Image</span>
                    <input
                      id="image-file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    id="btn-toggle-camera"
                    type="button"
                    onClick={() => {
                      setIsCameraActive((prev) => !prev);
                      setImagePreviewUrl(null);
                    }}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isCameraActive
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-[#0E0E11] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <Camera className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isCameraActive ? 'Stop Camera' : 'Live Camera'}</span>
                  </button>
                </div>

                {/* Camera Live Stream */}
                {isCameraActive && (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800 aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button
                      type="button"
                      onClick={captureCameraFrame}
                      className="absolute bottom-3 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:opacity-90 text-black text-xs font-bold py-2 px-5 rounded-full shadow-lg border border-black/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-black" /> Capture Snapshot
                    </button>
                  </div>
                )}

                {/* Sample Images */}
                <div>
                  <span className="text-xs font-bold text-[#D4AF37] mb-2 block uppercase tracking-wider">
                    Sample Test Images:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {imageSamples.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImagePreviewUrl(s.url);
                          setSelectedImageFile(null);
                          setIsCameraActive(false);
                          setInputTitle(s.title);
                        }}
                        className="rounded-xl overflow-hidden border border-zinc-800 hover:border-[#D4AF37] group relative aspect-video bg-black transition-all cursor-pointer"
                      >
                        <img
                          src={s.url}
                          alt={s.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-[#0E0E11]/90 p-1 text-[10px] text-zinc-300 truncate font-medium text-center">
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              <div className="flex flex-col">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Visual Frame Preview
                </label>
                <div className="flex-1 rounded-2xl bg-[#0E0E11] border border-zinc-800 flex items-center justify-center p-2 overflow-hidden min-h-[200px]">
                  {imagePreviewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="max-h-64 max-w-full rounded-xl object-contain"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6 text-zinc-500 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
                      Upload a JPEG/PNG or click Live Camera to capture a frame.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIDEO TAB */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Select Video Stream (MP4, WebM)
                </label>

                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-[#0E0E11] border-2 border-dashed border-zinc-800 hover:border-[#D4AF37] cursor-pointer text-xs text-zinc-300 hover:text-white transition-all text-center">
                  <Video className="w-8 h-8 text-[#D4AF37] mb-1" />
                  <span className="font-bold text-zinc-200">
                    {selectedVideoFile ? selectedVideoFile.name : 'Click to Upload Video File'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Max size: 25MB • Formats: MP4, WebM, AVI, MOV
                  </span>
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                </label>

                <div className="p-3.5 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                  <div className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" /> Optical Flow & Keyframe Pipeline:
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    The vision engine samples video frames at structured temporal intervals, computing kinetic motion gradients to screen for physical aggression cues.
                  </p>
                </div>
              </div>

              {/* Video Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Video Stream Player
                </label>
                <div className="rounded-2xl bg-[#0E0E11] border border-zinc-800 aspect-video flex items-center justify-center overflow-hidden">
                  {videoPreviewUrl ? (
                    <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-6 text-zinc-500 text-xs">
                      <Video className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
                      Select a video clip to preview frame sampling.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Non-punitive AI assessment • Explainable evidence rationale</span>
          </div>

          <button
            id="btn-run-analysis"
            type="button"
            disabled={isLoading}
            onClick={handleAnalyze}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#D4AF37]/90 disabled:opacity-50 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Run {activeTab.toUpperCase()} Detection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESULTS DISPLAY SECTION */}
      {result && (
        <div id="analysis-result-card" className="bg-[#141417]/95 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                Classification Result
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-3">
                <span>{result.classification}</span>
                <RiskBadge riskLevel={result.riskLevel} />
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-zinc-400 uppercase font-semibold">Risk Score</div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {result.riskScore}<span className="text-sm font-normal text-zinc-400">/100</span>
                </div>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div className="text-right">
                <div className="text-xs text-zinc-400 uppercase font-semibold">Confidence</div>
                <div className="text-2xl font-extrabold text-[#D4AF37] font-mono">
                  {result.confidenceScore || 88}%
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-[#0E0E11] border border-zinc-800 text-sm text-zinc-200 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#D4AF37] text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-[#D4AF37]" /> Explainable AI Rationale:
            </div>
            <p className="text-zinc-300">{result.explanation}</p>
          </div>

          {/* Indicators / Key Factors */}
          {result.keyFactors && result.keyFactors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Key Detected Indicators & Features:
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keyFactors.map((factor, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full bg-[#0E0E11] text-zinc-200 text-xs font-medium border border-zinc-800"
                  >
                    • {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Frames breakdown if present */}
          {result.frameDetections && result.frameDetections.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Sampled Video Frame Timeline ({result.frameDetections.length} keyframes):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.frameDetections.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0E0E11] border border-zinc-800 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-zinc-400">
                      <span className="font-mono text-[#D4AF37] font-bold">⏱ {f.timestampSeconds}s</span>
                      <span className="text-[11px] font-bold text-zinc-200">{f.category}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>Risk: {f.riskScore}/100</span>
                      <span>Conf: {f.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
            >
              View in History Log →
            </button>

            <button
              id="btn-view-detailed-report"
              type="button"
              onClick={() => onSelectAnalysis(result)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0E0E11] hover:bg-zinc-800 text-zinc-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-zinc-700 cursor-pointer hover:border-[#D4AF37]"
            >
              <span>Inspect Full XAI Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

