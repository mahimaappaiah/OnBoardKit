import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CapturedImageData } from '../../types/config';
import { useOnboarding } from '../../context/OnboardingContext';
import { analyzeCanvasImage } from '../../utils/imageVerification';

interface CameraCaptureProps {
  mode: 'id' | 'selfie';
  onCapture: (data: CapturedImageData) => void;
  onClear: () => void;
  capturedImage: CapturedImageData | null;
}

type CameraErrorType = 'denied' | 'unavailable' | null;

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  mode,
  onCapture,
  onClear,
  capturedImage,
}) => {
  const { t } = useOnboarding();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<CameraErrorType>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    mode === 'selfie' ? 'user' : 'environment'
  );

  // Realistic UI states
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Analyzing image clarity...');

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setIsLoading(true);
    setCameraError(null);

    // Guard against environments where mediaDevices is missing (e.g., insecure HTTP or JSDOM)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('unavailable');
      setIsLoading(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play?.().catch(() => {
          // Handled gracefully if autoplay policy requires user interaction
        });
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn('[CameraCapture] Camera access failed:', err?.name, err?.message);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('denied');
      } else {
        setCameraError('unavailable');
      }
      setIsLoading(false);
    }
  }, [facingMode, stopCamera]);

  // Launch camera when not in preview mode
  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [capturedImage, startCamera, stopCamera]);

  // Capture current frame from live video
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Trigger visual camera shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip selfie horizontally if user facing for a natural mirror effect
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
      }
    } catch {
      // Graceful fallback for environments with limited canvas 2D acceleration
    }

    const verificationDetails = analyzeCanvasImage(canvas, mode);

    const dataUrl =
      typeof canvas.toDataURL === 'function'
        ? canvas.toDataURL('image/jpeg', 0.9)
        : 'data:image/jpeg;base64,mockphotodata';

    stopCamera();

    // Show simulated verification scan progress for a realistic feel
    setIsAnalyzing(true);
    setAnalysisStep(
      mode === 'id' ? 'Scanning document & MRZ text...' : 'Analyzing facial geometry & liveness...'
    );

    setTimeout(() => {
      setAnalysisStep('Verifying anti-glare & resolution...');
      setTimeout(() => {
        setIsAnalyzing(false);
        onCapture({
          dataUrl,
          timestamp: Date.now(),
          source: 'camera',
          verificationDetails,
        });
      }, 350);
    }, 400);
  };

  // Mobile file input fallback handler (with capture attribute)
  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;

        // Create an image element to analyze the uploaded file
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current || document.createElement('canvas');
          canvas.width = img.width || 640;
          canvas.height = img.height || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
          const verificationDetails = analyzeCanvasImage(canvas, mode);
          onCapture({
            dataUrl,
            timestamp: Date.now(),
            source: 'file',
            verificationDetails,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Flip camera toggle
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const stepStrings = mode === 'id' ? t.steps.id_capture : t.steps.selfie_capture;

  // 1. Preview state: Photo already captured & verified
  if (capturedImage) {
    const details = capturedImage.verificationDetails;
    const isWarning = details?.status === 'warning';

    return (
      <div className="space-y-4" data-testid="camera-preview-container">
        {/* Photo Container */}
        <div
          className={`relative rounded-custom overflow-hidden border-2 shadow-md bg-black flex items-center justify-center ${
            isWarning ? 'border-amber-400' : 'border-emerald-500'
          } ${mode === 'selfie' ? 'aspect-square max-w-[260px] mx-auto' : 'aspect-[3/2]'}`}
        >
          <img
            src={capturedImage.dataUrl}
            alt={mode === 'id' ? 'Captured ID' : 'Captured Selfie'}
            className={`w-full h-full ${mode === 'selfie' ? 'object-cover' : 'object-contain'}`}
          />

          {/* Verification Badge */}
          <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow">
            <span
              className={`w-2 h-2 rounded-full ${
                isWarning ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="text-[10px] font-bold text-white tracking-wide uppercase">
              {isWarning ? 'Needs Attention' : 'Verified ✓'}
            </span>
          </div>

          <div className="absolute bottom-2 left-2.5 text-[10px] text-white/90 font-medium bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
            {capturedImage.source === 'camera' ? 'Camera 1080p' : 'File Upload'}
          </div>
        </div>

        {/* Realistic Verification Analysis Card */}
        {details && (
          <div className="bg-theme-background border border-theme-border rounded-custom p-3.5 text-left text-xs shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme-border">
              <span className="font-bold text-theme-text flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quality & Biometric Verification</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                {details.score}% Match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5 text-theme-muted">
              <div>
                Lighting: <strong className="text-theme-text">{details.lighting}</strong>
              </div>
              <div>
                Optical Clarity: <strong className="text-theme-text">{details.clarity}</strong>
              </div>
            </div>

            <ul className="space-y-1 text-[11px] text-theme-text">
              {details.checks.map((check, i) => (
                <li key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={onClear}
          className="w-full py-2.5 text-xs font-semibold text-theme-text bg-theme-surface border border-theme-border rounded-custom hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center space-x-1.5 shadow-sm"
        >
          <svg className="w-4 h-4 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{stepStrings.retakeButton}</span>
        </button>
      </div>
    );
  }

  // 2. Camera Error or Permission Denied: Render Fallback
  if (cameraError) {
    const isDenied = cameraError === 'denied';
    return (
      <div
        className="rounded-custom border border-theme-border bg-theme-background p-5 text-center space-y-4"
        data-testid="camera-fallback"
        role="region"
        aria-label={stepStrings.fileFallbackTitle}
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <h3 className="text-sm font-bold text-theme-text">{stepStrings.fileFallbackTitle}</h3>
          <p className="text-xs text-theme-muted mt-1 leading-relaxed">
            {isDenied ? stepStrings.permissionDeniedMessage : stepStrings.cameraUnavailableMessage}
          </p>
        </div>

        {/* Mobile capture file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={mode === 'selfie' ? 'user' : 'environment'}
          onChange={handleFileFallback}
          className="hidden"
          id={`fallback-file-input-${mode}`}
          aria-label={stepStrings.fileUploadButton}
        />

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-semibold rounded-custom transition shadow-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{stepStrings.fileUploadButton}</span>
          </button>

          <button
            type="button"
            onClick={startCamera}
            className="w-full py-2 px-3 text-xs font-medium text-theme-muted hover:text-theme-text transition"
          >
            Retry Camera Access
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Camera Stream View
  return (
    <div className="space-y-3" data-testid="camera-active-container">
      <div
        className={`relative rounded-custom overflow-hidden bg-black border-2 border-theme-border flex items-center justify-center shadow-inner ${
          mode === 'selfie' ? 'aspect-square max-w-[280px] mx-auto' : 'aspect-[3/2]'
        }`}
      >
        {/* Shutter Flash Animation */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-flash pointer-events-none" />
        )}

        {/* Verification Analysis Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block">AI Verification</span>
              <span className="text-[11px] text-slate-300 font-medium">{analysisStep}</span>
            </div>
            <div className="w-44 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-theme-primary rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Loading Camera State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-20 space-y-2">
            <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs font-medium">Starting secure video feed...</span>
          </div>
        )}

        {/* Live Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Top Camera Controls Overlay */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] text-white font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>LIVE 1080p</span>
          </div>

          <button
            type="button"
            onClick={toggleFacingMode}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition backdrop-blur-md border border-white/10"
            title="Switch Front/Rear Camera"
            aria-label="Switch camera"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* Realistic Viewfinder Overlay Guides */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          {mode === 'id' ? (
            /* ID card outline guide with realistic corner brackets & laser scanline */
            <div className="relative w-[86%] h-[76%] rounded-lg border border-white/20 shadow-2xl flex flex-col justify-between p-2">
              {/* Animated Laser Scanline */}
              <div className="animate-scanline" />

              {/* Corner Brackets */}
              <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-sky-400 rounded-tl" />
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-sky-400 rounded-tr" />
              <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-sky-400 rounded-bl" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-sky-400 rounded-br" />

              <div className="text-right">
                <span className="text-[9px] font-mono text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
                  DOC_BOUNDS
                </span>
              </div>
              <div className="flex justify-center">
                <span className="bg-black/60 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow border border-white/10">
                  Align ID card within the frame
                </span>
              </div>
            </div>
          ) : (
            /* Selfie biometric oval cutout guide with pulse ring */
            <div className="relative w-[70%] h-[82%] rounded-full border-2 border-sky-400/80 shadow-2xl flex flex-col justify-end items-center pb-3 animate-pulse-ring">
              {/* Center crosshair dots */}
              <div className="absolute top-1/3 w-1.5 h-1.5 bg-sky-400/50 rounded-full" />

              <span className="bg-black/60 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow border border-white/10">
                Center face in oval
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for capturing frame snapshot */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Realistic Camera Shutter Control */}
      <div className="flex flex-col items-center pt-2">
        <button
          type="button"
          onClick={takePhoto}
          disabled={isLoading || isAnalyzing}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border-4 border-white shadow-lg transition transform active:scale-90 hover:scale-105 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-theme-primary"
          aria-label={stepStrings.captureButton}
        >
          <div className="w-10 h-10 rounded-full bg-white transition group-hover:bg-slate-100 group-active:bg-slate-200 shadow-inner" />
        </button>
        <span className="text-[11px] font-medium text-theme-muted mt-2 text-center">
          Tap button to capture & run verification check
        </span>
      </div>
    </div>
  );
};

export default CameraCapture;
