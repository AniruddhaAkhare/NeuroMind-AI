import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, ArrowRight, ArrowUpRight, ChevronRight, ChevronLeft, 
  Eye, Cpu, Sparkles, Activity, Check, User, Building2, 
  Microscope, Scan, Compass, Layers, ShieldAlert, Calendar, 
  X, FileText, CheckCircle2, Stethoscope, Pill, ShieldCheck
} from 'lucide-react';

import heroBrainImg from '../assets/hero_brain.jpg';
import brain3dPerspectiveImg from '../assets/brain_3d_perspective.jpg';
import axialMriImg from '../assets/axial_mri.jpg';
import gradcamHeatmapImg from '../assets/gradcam_heatmap.jpg';
import hospitalCampusImg from '../assets/hospital_campus.jpg';

export default function LandingPage() {
  const [activeTab3D, setActiveTab3D] = useState('3D');
  const [sliderPos, setSliderPos] = useState(52);
  const [carouselIndex, setCarouselIndex] = useState(1);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [workstationTab, setWorkstationTab] = useState('Analysis');

  // Case profiles for the 1/3 Grad-CAM carousel
  const carouselCases = [
    {
      id: 1,
      title: 'Temporal Lobe Saliency',
      prediction: 'Mild Dementia',
      prob: '87.4%',
      barWidth: '87.4%',
      primary: 'Temporal Region',
      confidence: 'High',
      slice: 'Axial Layer #14',
      description: 'Marked focal hypometabolism and cortical thinning in the right lateral temporal gyri.'
    },
    {
      id: 2,
      title: 'Hippocampal Volume Atrophy',
      prediction: 'Moderate Cognitive Decline',
      prob: '79.2%',
      barWidth: '79.2%',
      primary: 'Hippocampal Formation',
      confidence: 'High',
      slice: 'Coronal Slice #28',
      description: 'Bilateral hippocampal volume reduction with enlargement of the temporal horn.'
    },
    {
      id: 3,
      title: 'Ventricular Dilation Profile',
      prediction: 'Early Stage Atrophy',
      prob: '68.5%',
      barWidth: '68.5%',
      primary: 'Periventricular Zone',
      confidence: 'Moderate',
      slice: 'Axial Layer #21',
      description: 'Mild ex-vacuo ventriculomegaly consistent with neurodegenerative progression.'
    }
  ];

  const currentCase = carouselCases[carouselIndex - 1];

  // 6 Pillars detailed content
  const pillarsData = [
    {
      id: '01',
      title: 'Diagnostic Impression',
      icon: Brain,
      color: 'text-blue-600',
      badge: 'EfficientNet-B3 Saliency',
      summary: 'Deep neural ensemble classification with 87.4% probability for neurodegenerative dementia, localized to temporal gyri.',
      details: [
        'EfficientNet-B3 convolutional feature extraction identifies right temporal lobe cortical atrophy.',
        'Grad-CAM saliency score exceeds 92nd percentile in the superior temporal sulcus.',
        'Ventricular volume index within expected bounds for stage-2 neurodegeneration.'
      ]
    },
    {
      id: '02',
      title: 'Safety & Red Flags',
      icon: ShieldAlert,
      color: 'text-rose-600',
      badge: 'Immediate Precautions',
      summary: 'High fall-risk warning, spatial disorientation protocols, and emergency caregiver contact triggers.',
      details: [
        'Cognitive fluctuation vigilance: Monitor twilight wandering and temporal-spatial disorientation.',
        'Medication compliance protocol: Install blister packs or automated smart dispenser.',
        'Emergency escalation triggers: Sudden acute confusion, expressive aphasia, or gait freezing.'
      ]
    },
    {
      id: '03',
      title: 'Daily Care Plan',
      icon: Calendar,
      color: 'text-amber-600',
      badge: 'Caregiver Schedule',
      summary: 'Structured circadian daylight exposure, cognitive reminiscence therapy, and hydration tracking.',
      details: [
        'Morning: 30 minutes 10,000-lux daylight therapy to stabilize circadian melatonin rhythm.',
        'Afternoon: Structured reminiscence stimulation (photo albums, tactile puzzles, familiar audio).',
        'Night: Consistent 9:00 PM wind-down with warm lighting and motion-activated bathroom illumination.'
      ]
    },
    {
      id: '04',
      title: 'Ayurvedic Regimen',
      icon: Pill,
      color: 'text-emerald-600',
      badge: 'AYUSH Integrative Care',
      summary: 'Evidence-based Medhya Rasayana botanicals, Brahmi oil scalp therapy, and anti-inflammatory nutrition.',
      details: [
        'Medhya Rasayana: Standardized Bacopa monnieri (Brahmi) 300-450mg for synaptic plasticity.',
        'Shiroabhyanga: Warm Brahmi or Ksheerabala taila scalp massage to attenuate autonomic stress.',
        'Dietary Guidelines: Sattvic foods rich in ghee, soaked walnuts, almonds, and warm turmeric golden milk.'
      ]
    },
    {
      id: '05',
      title: 'Medical Guidance',
      icon: Stethoscope,
      color: 'text-purple-600',
      badge: 'Pharmacotherapy Protocol',
      summary: 'Standard allopathic cholinesterase inhibitor regimens, cardiac monitoring schedule, and drug interaction alerts.',
      details: [
        'First-Line Pharmacotherapy: Donepezil 5mg once daily at bedtime, titrating to 10mg after 4-6 weeks.',
        'Glutamate Modulation: Memantine 5mg daily escalating to 10mg BID for moderate stage neuroprotection.',
        'Baseline ECG Surveillance: Check PR interval prior to initiation to exclude baseline bradycardia.'
      ]
    },
    {
      id: '06',
      title: 'Specialist & Hospital',
      icon: Building2,
      color: 'text-indigo-600',
      badge: 'Clinical Referral',
      summary: 'Comprehensive Neuro-Psychological Battery (MMSE/MoCA), repeat 3T MRI at 6 months, and speech pathology referral.',
      details: [
        'Formal Neuropsychological Battery: Schedule 3-hour standardized MoCA, CDR, and WAIS testing.',
        'Longitudinal 3T MRI: Follow-up volumetric structural scan scheduled at 6 months.',
        'Social Services & Legal Planning: Early durable power of attorney and healthcare proxy establishment.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-500/20 selection:text-blue-900 font-sans antialiased relative overflow-hidden">
      
      {/* ============================================================
          AMBIENT BACKGROUND (LIGHT MODE GRID + SUBTLE NEURAL MESH)
      ============================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-25">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.05] filter contrast-125"
          src="/videos/neurons_pulsing_bg.mp4"
        />
      </div>
      <div className="fixed inset-0 bg-gradient-to-b from-white/95 via-slate-50/90 to-slate-100/95 pointer-events-none z-0" />

      {/* ============================================================
          TOP NAVIGATION BAR (CLEAN LIGHT GLASS NAVBAR)
      ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-lg font-black tracking-widest text-slate-900 font-mono">
              NEUROMIND AI
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <Link to="/" className="text-blue-600 font-bold transition-colors">
              Home
            </Link>
            <a href="#process" className="hover:text-slate-900 transition-colors">
              Pipeline
            </a>
            <a href="#explainability" className="hover:text-slate-900 transition-colors">
              Grad-CAM
            </a>
            <a href="#3d-viz" className="hover:text-slate-900 transition-colors">
              3D Brain
            </a>
            <a href="#dossier" className="hover:text-slate-900 transition-colors">
              6-Pillar Dossier
            </a>
            <a href="#workstation" className="hover:text-slate-900 transition-colors">
              Workstation
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Analyze MRI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT AREA
      ============================================================ */}
      <main className="relative z-10 space-y-24 md:space-y-32 pb-24">
        
        {/* ============================================================
            HERO SECTION (LIGHT BASE WITH CONTRAST DARK 3D BRAIN TILE)
        ============================================================ */}
        <section className="relative pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-mono font-bold tracking-wider text-blue-700 uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>CLINICAL AI NEUROIMAGING • EFFICIENTNET-B3</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] font-display">
                From Axial MRI<br />
                to Meaningful<br />
                <span className="italic font-serif font-normal text-blue-600">
                  Clinical Insights
                </span>
              </h1>

              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                NeuroMind AI evaluates axial brain MRI scans across 4 dementia stages, calculates transparent PyTorch Grad-CAM heatmaps, reconstructs 3D connectome holograms, and compiles comprehensive 6-pillar medical dossiers.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Scan Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/doctor/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition-all shadow-xs hover:border-slate-400"
                >
                  <span>Doctor Workstation</span>
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </Link>
              </div>

              {/* Bottom Powered By Badge Bar */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="uppercase tracking-wider font-bold text-slate-700">POWERED BY:</span>
                  <span>EfficientNet-B3 • Grad-CAM • 3D WebGL • Gemini 2.5</span>
                </div>
                <div className="text-slate-400 font-semibold">
                  OASIS-Validated Dataset
                </div>
              </div>
            </div>

            {/* Right Column: Hero 3D Holographic Brain (CONTRAST DARK BLOCK) */}
            <div className="lg:col-span-5 relative">
              <div className="bento-card-dark relative mx-auto aspect-square max-w-md rounded-3xl p-4 overflow-hidden flex items-center justify-center group shadow-2xl">
                
                {/* Real High-Resolution 3D Glowing Brain Asset */}
                <img 
                  src={heroBrainImg} 
                  alt="3D Holographic Brain Reconstruction" 
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Callout Card inside Dark Block */}
                <div className="absolute top-6 right-6 z-20 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl space-y-1.5 w-44 text-white animate-float">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                    <span>Temporal Lobe</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Saliency Peak Focus</div>
                  <div className="flex items-center justify-between font-mono text-xs font-black text-white pt-0.5">
                    <span className="text-cyan-400">87.4%</span>
                    <span className="text-[10px] text-rose-400 font-bold">Atrophy Hotspot</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" 
                      style={{ width: '87.4%' }} 
                    />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-mono text-slate-300 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>3D Stereotactic Connectome</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            SECTION 01 / THE PROCESS (5-STAGE BENTO PIPELINE)
        ============================================================ */}
        <section id="process" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                01 / THE PIPELINE
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                From Scan Matrix<br />
                to <span className="italic font-serif font-normal text-blue-600">Actionable Dossier</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our 5-stage clinical AI pipeline combines deep convolutional feature extraction, PyTorch explainability, and multi-pillar medical intelligence.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors pt-2 group"
              >
                <span>Upload Scan & Test Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right 5-Stage Bento Grid Stepped Diagram */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                
                {/* Step 1 */}
                <div className="bento-card rounded-2xl p-4 text-center space-y-3 relative group hover:border-blue-500 hover:scale-[1.02] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-400">01</div>
                    <div className="text-xs font-extrabold text-slate-900 tracking-tight">MRI Ingestion</div>
                    <div className="text-[10px] text-slate-500 leading-tight">300×300 Normalization</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bento-card rounded-2xl p-4 text-center space-y-3 relative group hover:border-blue-500 hover:scale-[1.02] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-400">02</div>
                    <div className="text-xs font-extrabold text-slate-900 tracking-tight">EfficientNet-B3</div>
                    <div className="text-[10px] text-slate-500 leading-tight">PyTorch Classification</div>
                  </div>
                </div>

                {/* Step 3 (With real mini Grad-CAM heatmap preview) */}
                <div className="bento-card rounded-2xl p-4 text-center space-y-3 relative group hover:border-rose-500 hover:scale-[1.02] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl overflow-hidden relative border border-rose-300 flex items-center justify-center shadow-xs">
                    <img 
                      src={gradcamHeatmapImg} 
                      alt="Mini Grad-CAM" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-rose-600">03</div>
                    <div className="text-xs font-extrabold text-slate-900 tracking-tight">Grad-CAM Map</div>
                    <div className="text-[10px] text-slate-500 leading-tight">Pixel Saliency Overlay</div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bento-card rounded-2xl p-4 text-center space-y-3 relative group hover:border-blue-500 hover:scale-[1.02] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-400">04</div>
                    <div className="text-xs font-extrabold text-slate-900 tracking-tight">3D Connectome</div>
                    <div className="text-[10px] text-slate-500 leading-tight">Stereotactic Defect Nexus</div>
                  </div>
                </div>

                {/* Step 5 (CONTRAST DARK TILE) */}
                <div className="bento-card-dark rounded-2xl p-4 text-center space-y-3 relative group hover:scale-[1.02] transition-all duration-300 col-span-2 sm:col-span-1 shadow-md">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-blue-400">05</div>
                    <div className="text-xs font-extrabold text-white tracking-tight">6-Pillar Dossier</div>
                    <div className="text-[10px] text-slate-300 leading-tight">Gemini Synthesis</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            SECTION 02 / EXPLAINABILITY (SPLIT-WIPE WORKSTATION)
        ============================================================ */}
        <section id="explainability" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                02 / EXPLAINABILITY
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                See Why the Model<br />
                <span className="italic font-serif font-normal text-blue-600">
                  Predicted It.
                </span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                PyTorch Grad-CAM extracts final convolutional gradients and generates genuine thermal saliency heatmaps — giving neurologists absolute visual transparency.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors pt-2 group"
              >
                <span>Upload Scan & Compare</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Workstation Comparison Card */}
            <div className="lg:col-span-8">
              <div className="bento-card rounded-3xl p-6 shadow-md grid md:grid-cols-12 gap-6 items-center">
                
                {/* Interactive Split Wipe Box with Real MRI and Real Heatmap */}
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                    <span className="font-mono text-slate-500">Original T1-Axial MRI</span>
                    <span className="text-rose-600 font-mono font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      Grad-CAM Saliency Overlay
                    </span>
                  </div>

                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-slate-300 shadow-inner select-none cursor-ew-resize group">
                    {/* Background: Real Grad-CAM Heatmap Image */}
                    <img
                      src={gradcamHeatmapImg}
                      alt="Grad-CAM Saliency Heatmap"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Foreground: Real Grayscale Axial MRI Scan Clipped by Slider */}
                    <div 
                      className="absolute inset-0 overflow-hidden bg-black border-r-2 border-blue-500 shadow-md"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={axialMriImg}
                        alt="Original Anatomical MRI Scan"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Divider Handle with interactive glow */}
                    <div
                      className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none"
                      style={{ left: `calc(${sliderPos}% - 14px)` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-blue-400 shadow-md flex items-center justify-center text-white text-[10px] font-black">
                        ↔
                      </div>
                    </div>

                    {/* Slice Badge overlay */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-200 border border-slate-700 pointer-events-none">
                      {currentCase.slice}
                    </div>
                  </div>

                  {/* Scrubber slider */}
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Right Bento Info Panel (CONTRAST DARK TILE) */}
                <div className="md:col-span-4 space-y-5 bento-card-dark p-5 rounded-2xl shadow-md">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Model Classification
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-white">{currentCase.prediction}</span>
                      <span className="font-mono text-sm font-black text-cyan-400">{currentCase.prob}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500" 
                        style={{ width: currentCase.barWidth }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Primary Activation
                    </span>
                    <div className="text-xs font-bold text-slate-200">
                      {currentCase.primary}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-400 font-medium">Confidence Tier</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {currentCase.confidence}
                    </span>
                  </div>

                  {/* Pager (< 1 / 3 >) */}
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800">
                    <button 
                      onClick={() => setCarouselIndex((prev) => (prev > 1 ? prev - 1 : 3))}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Previous slice case"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px] font-bold text-slate-300">
                      {carouselIndex} / 3
                    </span>
                    <button 
                      onClick={() => setCarouselIndex((prev) => (prev < 3 ? prev + 1 : 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Next slice case"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            SECTION 03 / 3D VISUALIZATION
        ============================================================ */}
        <section id="3d-viz" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left 3D Brain Illustration (CONTRAST DARK TILE) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bento-card-dark relative aspect-square max-w-md mx-auto rounded-3xl p-4 flex flex-col justify-between overflow-hidden group shadow-2xl">
                
                {/* Real High-Resolution 3D Brain Visual Asset */}
                <img 
                  src={brain3dPerspectiveImg} 
                  alt="3D Interactive Brain Model" 
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Callout Pin */}
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl w-44 space-y-1 z-10 self-start text-white animate-float">
                  <div className="text-[11px] font-bold text-slate-200">Temporal Lobe</div>
                  <div className="text-[10px] text-slate-400 font-medium">Volumetric Deficit</div>
                  <div className="flex items-center justify-between font-mono text-xs font-black text-white">
                    <span className="text-cyan-400">76.4%</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" 
                      style={{ width: '76.4%' }} 
                    />
                  </div>
                </div>

                {/* Bottom Legend Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-200 bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-xl border border-slate-700/80 z-10 mt-auto font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Cerebral Cortex
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Neural Tracts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Grad-CAM Nexus
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Atrophy Zone
                  </span>
                </div>
              </div>
            </div>

            {/* Right Narrative & Angle Buttons */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-[11px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                03 / 3D VISUALIZATION
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                Explore the Brain<br />
                <span className="italic font-serif font-normal text-blue-600">
                  in Interactive 3D.
                </span>
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                Go beyond flat 2D slice interpretation. Our 3D WebGL neural connectome projects the exact coordinates of the Grad-CAM saliency maximum directly onto dual cerebral hemispheres, sulci folds, and deep anatomical brain structures.
              </p>

              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <span>Launch 3D Explorer</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Angle Preset Selection Tiles */}
              <div className="grid grid-cols-4 gap-3 pt-4 max-w-md">
                {[
                  { id: 'Axial', label: 'Axial', icon: Scan },
                  { id: 'Coronal', label: 'Coronal', icon: Compass },
                  { id: 'Sagittal', label: 'Sagittal', icon: Layers },
                  { id: '3D', label: '3D Mesh', icon: Brain },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab3D === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab3D(tab.id)}
                      className={`p-3 rounded-2xl border text-center space-y-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-slate-800 text-blue-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] font-bold font-mono">{tab.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            SECTION 04 / CLINICAL INTELLIGENCE (6-PILLAR DOSSIER)
        ============================================================ */}
        <section id="dossier" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                04 / CLINICAL INTELLIGENCE
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                Comprehensive<br />
                <span className="text-blue-600">6-Pillar</span> Clinical Dossier
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Structured multimodal reports powered by Gemini — covering stage assessment, red flags, caregiver schedules, Ayurvedic Rasayana regimens, prescriptions, and specialist follow-up.
              </p>

              <button
                onClick={() => setShowSampleModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors pt-2 group cursor-pointer"
              >
                <span>View Sample Dossier</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Center Layered Report Card */}
            <div className="lg:col-span-5 relative">
              <div className="bento-card rounded-3xl p-6 shadow-md space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Neurological Evaluation Dossier</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Patient Diagnostic Assessment</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    GEMINI CLINICAL
                  </span>
                </div>

                {/* The 6 Pillars List */}
                <div className="space-y-2 text-xs">
                  {pillarsData.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPillar(p)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold text-slate-400 group-hover:text-blue-600">{p.id}</span>
                          <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                          <span className="font-semibold text-slate-800 group-hover:text-blue-900">{p.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Three Pillars */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-tight">
                  Better
                </div>
                <div className="text-xl sm:text-2xl font-serif text-slate-500">
                  Information.
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-tight">
                  Better
                </div>
                <div className="text-xl sm:text-2xl font-serif text-slate-500">
                  Decisions.
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-serif font-black text-blue-600 leading-tight">
                  Better
                </div>
                <div className="text-xl sm:text-2xl font-serif text-blue-600 font-bold">
                  Patient Care.
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            SECTION 05 / THE WORKSTATION (REAL SCAN WORKSTATION MOCKUP)
        ============================================================ */}
        <section id="workstation" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-widest text-blue-600 uppercase">
                05 / THE WORKSTATION
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display">
                A Unified Neurological<br />
                Diagnostic Suite.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Tailored workstations for neurologists, radiologists, patients and healthcare administrators — with real-time inference, longitudinal tracking, and PDF clinical export.
              </p>

              <Link
                to="/doctor/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors pt-2 group"
              >
                <span>Launch Physician Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Workstation UI Window Mockup */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-slate-300 bg-white shadow-xl overflow-hidden text-xs">
                {/* Window Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-mono font-bold text-[11px] text-slate-700">NEUROMIND CLINICAL SUITE</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium font-mono">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dr. Marcus Vance, MD</span>
                  </div>
                </div>

                {/* Workstation Interior */}
                <div className="grid grid-cols-12 min-h-[340px]">
                  {/* Left Mini Sidebar */}
                  <div className="col-span-3 border-r border-slate-200 p-3 bg-slate-50 space-y-2">
                    <div className="font-mono font-bold text-[10px] text-slate-400 px-2 uppercase">Menu</div>
                    <div className="space-y-1">
                      {['Overview', 'Analysis', 'Patients', 'Reports', 'AI Assistant', 'Settings'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setWorkstationTab(item)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            workstationTab === item
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Workstation Viewport */}
                  <div className="col-span-9 p-4 space-y-4 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Patient Axial Scan Evaluation</div>
                        <div className="text-[10px] text-slate-500 font-mono">Patient ID: #15482 • Age: 67 • T1-Axial</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
                        MildDemented (87.4%)
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-12 gap-4 items-center">
                      {/* Real Scan & Grad-CAM Heatmap Image */}
                      <div className="sm:col-span-7 aspect-square rounded-xl bg-black flex items-center justify-center relative overflow-hidden border border-slate-300 shadow-inner">
                        <img 
                          src={gradcamHeatmapImg} 
                          alt="Grad-CAM Real Time Analysis" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-slate-700">
                          Grad-CAM: Axial Layer #14
                        </div>
                      </div>

                      {/* Right Findings Widget */}
                      <div className="sm:col-span-5 space-y-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">AI Analysis</div>
                          <div className="text-xs font-bold text-slate-900">Dementia Probability</div>
                          <div className="text-sm font-mono font-black text-blue-600">87.4%</div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: '87.4%' }} />
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="text-[10px] font-bold uppercase text-slate-400 font-mono">Key Findings:</div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span>Temporal Lobe</span>
                            <span className="font-bold text-rose-600">High</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span>Hippocampus</span>
                            <span className="font-bold text-amber-600">Moderate</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700">
                            <span>Ventricular Margin</span>
                            <span className="font-bold text-slate-500">Low</span>
                          </div>
                        </div>

                        <Link
                          to="/analyze"
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] block text-center transition-all shadow-xs"
                        >
                          Run New Scan
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================
            SECTION 06 / BUILT FOR (HOSPITAL CAMPUS ARCHITECTURE)
        ============================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-300 min-h-[440px] flex flex-col justify-end p-8 sm:p-12 text-white group">
            
            {/* Real High-Resolution Hospital Architecture Landscape Background Asset */}
            <img 
              src={hospitalCampusImg} 
              alt="Medical Research Institute Campus" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />

            {/* Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

            <div className="relative z-10 space-y-8 max-w-4xl">
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  06 / CLINICAL AUDIENCE
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
                  Engineered for Doctors, Radiologists,<br />
                  Hospitals & Caregivers.
                </h2>
              </div>

              {/* 4 Audience Bento Columns (CONTRAST DARK TILES) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 hover:border-blue-400 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Neurologists</div>
                  <div className="text-xs text-slate-300 leading-relaxed">Early staging & pharmacotherapy</div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 hover:border-blue-400 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Radiologists</div>
                  <div className="text-xs text-slate-300 leading-relaxed">Grad-CAM saliency verification</div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 hover:border-blue-400 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Hospitals</div>
                  <div className="text-xs text-slate-300 leading-relaxed">PACS-ready diagnostic audits</div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 hover:border-blue-400 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Researchers</div>
                  <div className="text-xs text-slate-300 leading-relaxed">Longitudinal volumetric tracking</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 07 / PRE-FOOTER CALL TO ACTION
        ============================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6 pt-6 relative">
          
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 mx-auto flex items-center justify-center text-blue-600 shadow-sm">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Ready to experience the future of neurological imaging?
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Join the clinical generation of AI-assisted neurological diagnostics and integrative patient care.
          </p>

          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Analyze Your Brain MRI Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ============================================================
          INTERACTIVE MODAL: 6-PILLAR DETAIL DRAWER
      ============================================================ */}
      {selectedPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bento-card max-w-lg w-full rounded-3xl p-6 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-blue-600">{selectedPillar.id}</span>
                <selectedPillar.icon className={`w-5 h-5 ${selectedPillar.color}`} />
                <h3 className="font-extrabold text-slate-900 text-base">{selectedPillar.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPillar(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="inline-block px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-bold">
              {selectedPillar.badge}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {selectedPillar.summary}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Clinical Directives:
              </div>
              {selectedPillar.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedPillar(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Directive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          INTERACTIVE MODAL: VIEW SAMPLE REPORT
      ============================================================ */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bento-card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-300 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Neurological Executive Analysis</h3>
                  <p className="text-[11px] font-mono text-slate-500">Standard Clinical Dossier • Case #NEURO-9482</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSampleModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono text-blue-600 uppercase font-bold">Model Classification</span>
                <div className="text-xl font-black text-slate-900">Mild Dementia (87.4%)</div>
                <p className="text-[11px] text-slate-500">EfficientNet-B3 convolutional saliency mapped to temporal lobe atrophy.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono text-emerald-600 uppercase font-bold">Integrative Protocol</span>
                <div className="text-xl font-black text-slate-900">Dual Allopathic + AYUSH</div>
                <p className="text-[11px] text-slate-500">Donepezil 5mg daily coupled with standardized Medhya Rasayana Brahmi.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Executive Summary</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patient displays focal volumetric loss in the right temporal lobe on 1.5T T1-weighted axial imaging. Grad-CAM visual heat mapping isolates the activation peak in slice #14. Gemini multimodal clinical intelligence generated a full 6-pillar care protocol emphasizing fall mitigation, circadian daylight stabilization, and 6-month follow-up volumetric MRI.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowSampleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <Link
                to="/analyze"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Analyze Your Own Scan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          FOOTER (CLEAN SLATE BRAND)
      ============================================================ */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="font-mono font-bold tracking-widest text-slate-900">NEUROMIND AI</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-500">
            <a href="#privacy" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
