import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * BrainScanLoader
 * High-performance clinical scanning modal powered by accelerated 3D brain scan video.
 * Ensures the scan cycle finishes smoothly without abrupt termination.
 */
export default function BrainScanLoader({ 
  active, 
  onComplete, 
  stageText = "Evaluating Neural Atrophy & Cortical Saliency...",
  minDuration = 5800 // Ensure at least 1 full smooth video scan cycle (~5.8s)
}) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(5);
  const [currentStage, setCurrentStage] = useState(0);
  const [readyToTransition, setReadyToTransition] = useState(false);

  const stages = [
    { label: "Normalizing Axial T1 Brain Matrix (300×300)", pct: 20 },
    { label: "Extracting Deep Convolutional Features (EfficientNet-B3)", pct: 45 },
    { label: "Computing Real PyTorch Grad-CAM Saliency Overlay", pct: 70 },
    { label: "Projecting 3D Stereotactic Coordinates & Gemini Dossier", pct: 90 },
    { label: "Diagnostic Synthesis Complete • Compiling Report", pct: 100 },
  ];

  useEffect(() => {
    if (!active) {
      setProgress(5);
      setCurrentStage(0);
      setReadyToTransition(false);
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
  }, [active, minDuration]);

  // Handle video speed adjustments
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.35; // brisk, cinematic speed
    }
  }, [active]);

  useEffect(() => {
    if (readyToTransition && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 450); // subtle finish pause for visual polish
      return () => clearTimeout(timer);
    }
  }, [readyToTransition, onComplete]);

  if (!active) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md transition-all duration-300"
      style={{ animation: 'fadeIn 0.25s ease-out' }}
    >
      {/* Centered Luxury Clinical Scanner Card (Compact, not screen-dominating) */}
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Neural Diagnostics Engine
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
            <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>GPU Accelerated</span>
          </div>
        </div>

        {/* Video Scanner Viewport (With Watermark Concealment & HUD Reticles) */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-inner aspect-video mb-5 group">
          
          {/* Target Reticles (Medical HUD corners) */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 z-20 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 z-20 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 z-20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 z-20 pointer-events-none" />

          {/* Holographic Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none z-10" />

          {/* Scanning Beam Bar Animation */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20 opacity-70 animate-pulse pointer-events-none" />

          {/* The Accelerated Video (Slight scale & vignette guarantees watermark absence) */}
          <video
            ref={videoRef}
            src="/videos/brain_scan_loading.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover transform scale-[1.04] origin-center filter contrast-110 brightness-95"
          />

          {/* Bottom-right Corner Dark Vignette (Double insurance for zero watermark visibility) */}
          <div className="absolute bottom-0 right-0 w-24 h-16 bg-gradient-to-tl from-slate-950 via-slate-950/60 to-transparent z-10 pointer-events-none" />

          {/* Live Scanner Telemetry Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Volumetric Pass: T1-AXIAL</span>
          </div>

          <div className="absolute bottom-3 right-3 z-20 text-[11px] font-mono font-bold text-cyan-400 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            {progress}%
          </div>
        </div>

        {/* Live Stage Readout & Progress Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              {progress === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-400 animate-bounce" />
              )}
              {stages[currentStage].label}
            </span>
            <span className="font-mono text-xs text-cyan-400 font-bold">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 transition-all duration-300 ease-out shadow-sm shadow-cyan-400/50"
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
