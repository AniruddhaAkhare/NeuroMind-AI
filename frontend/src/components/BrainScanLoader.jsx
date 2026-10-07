import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * BrainScanLoader
 * High-performance clinical scanning modal powered by accelerated 3D brain scan video.
 * Ensures the scan cycle finishes smoothly without abrupt termination.
 */
export default function BrainScanLoader({ 
  active, 
  isOpen,
  onComplete, 
  stageText = "Evaluating Neural Atrophy & Cortical Saliency...",
  minDuration = 5800 // Ensure at least 1 full smooth video scan cycle (~5.8s)
}) {
  const isVisible = Boolean(active !== undefined ? active : isOpen);
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(5);
  const [currentStage, setCurrentStage] = useState(0);
  const [readyToTransition, setReadyToTransition] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const stages = [
    { label: "Normalizing Axial T1 Brain Matrix (300×300)", pct: 20 },
    { label: "Extracting Deep Convolutional Features (EfficientNet-B3)", pct: 45 },
    { label: "Computing Real PyTorch Grad-CAM Saliency Overlay", pct: 70 },
    { label: "Projecting 3D Stereotactic Coordinates & Gemini Dossier", pct: 90 },
    { label: "Diagnostic Synthesis Complete • Compiling Report", pct: 100 },
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(5);
      setCurrentStage(0);
      setReadyToTransition(false);
      setVideoLoaded(false);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / minDuration) * 95), 95);
      setProgress(pct);

      if (pct < 30) setCurrentStage(0);
      else if (pct < 55) setCurrentStage(1);
      else if (pct < 80) setCurrentStage(2);
      else setCurrentStage(3);

      if (elapsed >= minDuration) {
        clearInterval(interval);
        setProgress(100);
        setCurrentStage(4);
        setReadyToTransition(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, minDuration]);

  // Handle video speed adjustments and ensure reliable autoplay
  useEffect(() => {
    if (isVisible && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playbackRate = 1.25; // Brisk, cinematic speed
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setVideoLoaded(true))
          .catch((err) => {
            console.warn("Video playback deferred by browser policy:", err);
          });
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (readyToTransition && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 450); // subtle finish pause for visual polish
      return () => clearTimeout(timer);
    }
  }, [readyToTransition, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-all duration-300"
      style={{ animation: 'fadeIn 0.25s ease-out' }}
    >
      {/* Centered Luxury Clinical Scanner Card (Dark slate block contrast over light page) */}
      <div className="relative w-full max-w-lg bg-[#0B132B] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-950/60 overflow-hidden text-slate-100">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-blue-400 uppercase">
              Neural Diagnostics Engine
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-slate-300">
            <Cpu className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>EfficientNet-B3 • GPU Active</span>
          </div>
        </div>

        {/* Video Scanner Viewport (With Watermark Concealment & HUD Reticles) */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-black shadow-inner aspect-video min-h-[220px] mb-5 group">
          
          {/* Target Reticles (Medical HUD corners) */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400/80 z-20 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400/80 z-20 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400/80 z-20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400/80 z-20 pointer-events-none" />

          {/* Holographic Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none z-10" />

          {/* Scanning Beam Bar Animation */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent z-20 opacity-75 animate-pulse pointer-events-none" />

          {/* The Accelerated Video (Slight scale & vignette guarantees watermark absence) */}
          <video
            ref={videoRef}
            src="/videos/brain_scan_loading.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-full object-cover transform scale-[1.04] origin-center filter contrast-110 brightness-95"
          />

          {/* Bottom-right Corner Dark Vignette (Guarantees zero watermark visibility) */}
          <div className="absolute bottom-0 right-0 w-28 h-16 bg-gradient-to-tl from-[#0B132B] via-[#0B132B]/70 to-transparent z-10 pointer-events-none" />

          {/* Live Scanner Telemetry Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/60 text-[11px] font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span>Volumetric Pass: T1-AXIAL</span>
          </div>

          <div className="absolute bottom-3 right-3 z-20 text-[11px] font-mono font-bold text-blue-400 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60">
            {progress}%
          </div>
        </div>

        {/* Live Stage Readout & Progress Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              {progress === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-400 animate-bounce" />
              )}
              {stages[currentStage].label}
            </span>
            <span className="font-mono text-xs text-blue-400 font-bold">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-teal-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 text-center font-mono">
            Please wait while the neural network processes cortical layers and generates saliency maps.
          </p>
        </div>

      </div>
    </div>
  );
}
