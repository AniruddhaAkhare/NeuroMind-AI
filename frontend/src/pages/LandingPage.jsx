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
      prediction: 'Dementia',
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
      color: 'text-cyan-400',
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
      color: 'text-rose-400',
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
      color: 'text-amber-400',
      badge: 'Caregiver Schedule',
      summary: 'Structured circadian daylight exposure, cognitive reminiscence therapy, and hydration tracking.',
      details: [
        'Morning: 30 minutes 10,000-lux daylight therapy to stabilize circadian melatonin rhythm.',
        'Afternoon: Structured reminiscence stimulation (photo albums, tactile puzzles, familiar audio).',
        'Evening: Calming sensory dimming from 18:00 to mitigate sundowning agitation.'
      ]
    },
    {
      id: '04',
      title: 'Holistic Support',
      icon: Sparkles,
      color: 'text-emerald-400',
      badge: 'Ayurvedic & Lifestyle',
      summary: 'Evidence-informed Ayurvedic neuro-tonics including Medhya Rasayanas (Brahmi & Ashwagandha) and Shirodhara oil therapy.',
      details: [
        'Brahmi (Bacopa monnieri): 300mg standardized extract twice daily for acetylcholine preservation.',
        'Ashwagandha (Withania somnifera): 500mg root extract evening for neuroprotective GABA support.',
        'Shirodhara Therapy: Warm Brahmi-infused sesame oil drip once weekly to soothe autonomic arousal.'
      ]
    },
    {
      id: '05',
      title: 'Medical & Neurological',
      icon: Activity,
      color: 'text-blue-400',
      badge: 'Pharmacotherapy Rx',
      summary: 'Cholinesterase inhibitor titration (Donepezil 5mg) and NMDA receptor antagonist (Memantine) roadmaps.',
      details: [
        'Donepezil Hydrochloride: Initiate 5mg orally at bedtime for 4 weeks; monitor resting pulse and ECG QTc.',
        'Memantine HCl: Optional add-on titration (5mg weekly up to 20mg daily) upon reaching moderate severity.',
        'Baseline Lab Work: Comprehensive Metabolic Panel, serum B12, TSH, and baseline 12-lead ECG.'
      ]
    },
    {
      id: '06',
      title: 'Specialist & Hospital',
      icon: Building2,
      color: 'text-indigo-400',
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
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 font-sans antialiased relative overflow-hidden">
      
      {/* ============================================================
          AMBIENT BACKGROUND VIDEO: CONTINUOUS NEURONS PULSING (WATERMARK-CONCEALED)
      ============================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Continuous Smooth Background Video (65% Visible Neural Synapse Activity) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.05] opacity-65 filter brightness-105 contrast-115"
          src="/videos/neurons_pulsing_bg.mp4"
        />

        {/* Soft Vignette & Atmospheric Tint (Maintains high neural visibility while keeping foreground text crisp) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/50 via-[#030712]/40 to-[#030712]/70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#030712]/30 to-[#030712]/80 pointer-events-none" />

        {/* Subtle radial glows */}
        <div className="absolute -top-40 right-0 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[65%] right-10 w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[800px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />

        {/* Ambient Curved Orbital SVG Rings */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-25" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse 
            cx="75%" cy="22%" rx="540" ry="260" 
            fill="none" 
            stroke="url(#heroOrbitGrad)" 
            strokeWidth="1.2" 
            transform="rotate(-15 950 250)" 
          />
          <ellipse 
            cx="75%" cy="22%" rx="720" ry="360" 
            fill="none" 
            stroke="rgba(6, 182, 212, 0.2)" 
            strokeWidth="0.8" 
            transform="rotate(-22 950 250)" 
            strokeDasharray="4 8"
          />
          <ellipse 
            cx="25%" cy="58%" rx="580" ry="280" 
            fill="none" 
            stroke="url(#heroOrbitGrad2)" 
            strokeWidth="1" 
            transform="rotate(18 350 600)" 
          />
          <ellipse 
            cx="50%" cy="92%" rx="700" ry="240" 
            fill="none" 
            stroke="rgba(20, 184, 166, 0.25)" 
            strokeWidth="1" 
            transform="rotate(-6 500 950)" 
            strokeDasharray="6 6"
          />
          <defs>
            <linearGradient id="heroOrbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0284C7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroOrbitGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ============================================================
          TOP NAVIGATION BAR (NEUROVIA LUXURY DARK BRAND)
      ============================================================ */}
      <header className="sticky top-0 z-50 bg-[#030712]/75 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/30 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse-glow" />
            </div>
            <span className="text-lg font-black tracking-widest text-white font-mono">
              NEUROVIA
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <Link to="/" className="text-cyan-400 font-bold transition-colors">
              Home
            </Link>
            <a href="#process" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#explainability" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#dossier" className="hover:text-white transition-colors">
              Resources
            </a>
            <a href="#workstation" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors px-2 py-1"
            >
              Login
            </Link>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:scale-105"
            >
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT AREA
      ============================================================ */}
      <main className="relative z-10 space-y-28 md:space-y-36 pb-24">
        
        {/* ============================================================
            HERO SECTION (#1 / MEDICAL IMAGING • BETTER TOMORROWS)
        ============================================================ */}
        <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                <span className="text-cyan-400">#1</span>
                <span>/</span>
                <span>MEDICAL IMAGING</span>
                <span>•</span>
                <span>BETTER TOMORROWS</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
                From MRI Scans<br />
                to Meaningful<br />
                <span className="italic font-serif font-normal text-gradient-cyan drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                  Insights
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                NEUROVIA is an AI-powered platform that analyzes brain MRI scans, visualizes what matters, and delivers clinically relevant insights for better decisions.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/30 hover:scale-105"
                >
                  <span>Start Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold text-xs border border-white/10 transition-all shadow-sm hover:border-cyan-500/40"
                >
                  <span>Explore Platform</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </Link>
              </div>

              {/* Bottom Powered By Badge Bar */}
              <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
                  <span className="uppercase tracking-wider font-bold text-slate-300">POWERED BY:</span>
                  <span className="text-slate-400">EfficientNet-B3 • Grad-CAM • 3D Visualization • Gemini</span>
                </div>
                <div className="flex items-center gap-1.5 uppercase tracking-wider font-bold text-slate-500 hover:text-cyan-400 transition-colors">
                  <span>SCROLL</span>
                  <span>↓</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero 3D Holographic Brain Illustration Matching Reference Screenshot */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto aspect-square max-w-md rounded-3xl bg-[#060D1A]/90 border border-cyan-500/20 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] p-3 overflow-hidden flex items-center justify-center group">
                
                {/* Background Ambient Radial Glow */}
                <div className="absolute inset-0 bg-radial from-cyan-500/20 via-transparent to-transparent pointer-events-none" />

                {/* Real High-Resolution 3D Glowing Brain Asset */}
                <img 
                  src={heroBrainImg} 
                  alt="3D Holographic Brain Reconstruction" 
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 animate-pulse-glow"
                />

                {/* Floating Callout Card Matching Reference Image Exactly */}
                <div className="absolute top-6 right-6 z-20 bg-[#0A1020]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 shadow-2xl space-y-1.5 w-44 text-white animate-float">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                    <span>Temporal Lobe</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">High Activation</div>
                  <div className="flex items-center justify-between font-mono text-xs font-black text-white pt-0.5">
                    <span className="text-cyan-400">87.4%</span>
                    <span className="text-[10px] text-rose-400 font-bold">Atrophy Focus</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                      style={{ width: '87.4%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 01 / THE PROCESS (5-STAGE BENTO PIPELINE)
        ============================================================ */}
        <section id="process" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Header */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                01 / THE PROCESS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                From Scan<br />
                to <span className="italic font-serif font-normal text-gradient-cyan">Insight</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Our 5-stage AI pipeline combines deep learning, explainability and clinical intelligence to deliver actionable insights.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2 group"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right 5-Stage Bento Grid Stepped Diagram */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                {/* Step 1 */}
                <div className="bento-glass rounded-2xl p-4 text-center space-y-3 relative group hover:border-cyan-500/50 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-500">01</div>
                    <div className="text-xs font-extrabold text-white tracking-tight">MRI SCAN</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Ingestion & Preprocessing</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bento-glass rounded-2xl p-4 text-center space-y-3 relative group hover:border-cyan-500/50 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-500">02</div>
                    <div className="text-xs font-extrabold text-white tracking-tight">EfficientNet-B3</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Feature Extraction</div>
                  </div>
                </div>

                {/* Step 3 (With real mini glowing Grad-CAM heatmap preview inside!) */}
                <div className="bento-glass rounded-2xl p-4 text-center space-y-3 relative group hover:border-rose-500/50 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl overflow-hidden relative border border-rose-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <img 
                      src={gradcamHeatmapImg} 
                      alt="Mini Grad-CAM" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-rose-500/15" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-rose-400">03</div>
                    <div className="text-xs font-extrabold text-white tracking-tight">Grad-CAM</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Saliency & Explainability</div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bento-glass rounded-2xl p-4 text-center space-y-3 relative group hover:border-cyan-500/50 hover:scale-[1.03] transition-all duration-300">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-slate-500">04</div>
                    <div className="text-xs font-extrabold text-white tracking-tight">3D Projection</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Anatomical Localization</div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bento-glass rounded-2xl p-4 text-center space-y-3 relative group hover:border-cyan-500/50 hover:scale-[1.03] transition-all duration-300 col-span-2 sm:col-span-1">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-all">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold text-cyan-400">05</div>
                    <div className="text-xs font-extrabold text-white tracking-tight">Clinical Synthesis</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Gemini Intelligence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 02 / EXPLAINABILITY (REAL SPLIT-WIPE WORKSTATION)
        ============================================================ */}
        <section id="explainability" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                02 / EXPLAINABILITY
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                See why the model<br />
                <span className="italic font-serif font-normal text-gradient-cyan">
                  predicted it.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Grad-CAM highlights the exact regions that influenced the AI’s decision — giving clinicians transparency and trust.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2 group"
              >
                <span>Explore Grad-CAM</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Bento Grid Workstation Comparison Card */}
            <div className="lg:col-span-8">
              <div className="bento-glass rounded-3xl p-6 shadow-2xl grid md:grid-cols-12 gap-6 items-center border border-white/10">
                
                {/* Interactive Split Wipe Box with Real MRI and Real Heatmap */}
                <div className="md:col-span-8 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
                    <span className="text-slate-400 font-mono">Original MRI</span>
                    <span className="text-cyan-400 font-mono font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Grad-CAM Heatmap
                    </span>
                  </div>

                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner select-none cursor-ew-resize group">
                    {/* Background: Real Grad-CAM Heatmap Image */}
                    <img
                      src={gradcamHeatmapImg}
                      alt="Grad-CAM Saliency Heatmap"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Foreground: Real Grayscale Axial MRI Scan Clipped by Slider */}
                    <div 
                      className="absolute inset-0 overflow-hidden bg-black border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
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
                      <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] flex items-center justify-center text-cyan-300 text-[10px] font-black">
                        ↔
                      </div>
                    </div>

                    {/* Slice Badge overlay */}
                    <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 border border-white/10 pointer-events-none">
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
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Right Bento Info Panel Matching Screenshot */}
                <div className="md:col-span-4 space-y-5 bg-[#070D1E]/90 p-5 rounded-2xl border border-white/10">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Model Prediction
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-white">{currentCase.prediction}</span>
                      <span className="font-mono text-base font-black text-cyan-400">{currentCase.prob}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500" 
                        style={{ width: currentCase.barWidth }} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Primary Activation
                    </span>
                    <div className="text-xs font-bold text-slate-200">
                      {currentCase.primary}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.08]">
                    <span className="text-slate-400 font-medium">Confidence</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {currentCase.confidence}
                    </span>
                  </div>

                  {/* Pager (< 1 / 3 >) */}
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-white/[0.08]">
                    <button 
                      onClick={() => setCarouselIndex((prev) => (prev > 1 ? prev - 1 : 3))}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Previous slice case"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-[11px] font-bold text-slate-300">
                      {carouselIndex} / 3
                    </span>
                    <button 
                      onClick={() => setCarouselIndex((prev) => (prev < 3 ? prev + 1 : 1))}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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
            SECTION 03 / 3D VISUALIZATION (EXPLORE THE BRAIN IN 3D)
        ============================================================ */}
        <section id="3d-viz" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left 3D Brain Illustration + Legend Matching Reference Screenshot */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl bg-[#060D1A]/90 border border-cyan-500/20 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] p-4 flex flex-col justify-between overflow-hidden group">
                
                {/* Real High-Resolution 3D Brain Visual Asset */}
                <img 
                  src={brain3dPerspectiveImg} 
                  alt="3D Interactive Brain Model" 
                  className="absolute inset-0 w-full h-full object-cover rounded-3xl group-hover:scale-105 transition-transform duration-700 animate-pulse-glow"
                />

                {/* Floating Callout Pin Matching Reference Image */}
                <div className="bg-[#0A1020]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl w-44 space-y-1 z-10 self-start text-white animate-float">
                  <div className="text-[11px] font-bold text-slate-200">Temporal Lobe</div>
                  <div className="text-[10px] text-slate-400 font-medium">Atrophy Signal</div>
                  <div className="flex items-center justify-between font-mono text-xs font-black text-white">
                    <span className="text-cyan-400">76.4%</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                      style={{ width: '76.4%' }} 
                    />
                  </div>
                </div>

                {/* Bottom Legend Pills Matching Reference Image */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-200 bg-[#0A1020]/90 backdrop-blur-xl p-2.5 rounded-xl border border-white/10 z-10 mt-auto">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    Cortex
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Neural Pathways
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Grad-CAM
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Findings
                  </span>
                </div>
              </div>
            </div>

            {/* Right Narrative & Angle Buttons */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                03 / 3D VISUALIZATION
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Explore the brain<br />
                <span className="italic font-serif font-normal text-gradient-cyan">
                  in 3D.
                </span>
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                Go beyond 2D scans. Our 3D brain visualization helps you understand the anatomy, spot key regions and see the bigger picture.
              </p>

              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors group"
              >
                <span>Explore 3D View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Angle Preset Selection Tiles Matching the Screenshot */}
              <div className="grid grid-cols-4 gap-3 pt-4 max-w-md">
                <button
                  onClick={() => setActiveTab3D('Axial')}
                  className={`p-3 rounded-2xl border text-center space-y-2 transition-all ${
                    activeTab3D === 'Axial'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <Scan className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-[11px] font-bold">Axial</div>
                </button>

                <button
                  onClick={() => setActiveTab3D('Coronal')}
                  className={`p-3 rounded-2xl border text-center space-y-2 transition-all ${
                    activeTab3D === 'Coronal'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <Compass className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-[11px] font-bold">Coronal</div>
                </button>

                <button
                  onClick={() => setActiveTab3D('Sagittal')}
                  className={`p-3 rounded-2xl border text-center space-y-2 transition-all ${
                    activeTab3D === 'Sagittal'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <Layers className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-[11px] font-bold">Sagittal</div>
                </button>

                <button
                  onClick={() => setActiveTab3D('3D')}
                  className={`p-3 rounded-2xl border text-center space-y-2 transition-all ${
                    activeTab3D === '3D'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] font-black'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${
                    activeTab3D === '3D' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/[0.05] text-cyan-400'
                  }`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-bold">3D</div>
                </button>
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
              <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                04 / CLINICAL INTELLIGENCE
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Comprehensive<br />
                <span className="text-gradient-cyan">6-Pillar</span> Clinical Dossier
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Get structured, detailed and actionable reports powered by Gemini — covering diagnosis, safety, care, medical guidance and more.
              </p>

              <button
                onClick={() => setShowSampleModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2 group cursor-pointer"
              >
                <span>View Sample Report</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Center Layered Report Card Matching the Screenshot */}
            <div className="lg:col-span-5 relative">
              {/* Backing layered cards for physical depth */}
              <div className="absolute inset-0 bg-cyan-950/30 rounded-3xl -rotate-2 scale-95 border border-cyan-500/20 pointer-events-none" />
              <div className="absolute inset-0 bg-blue-950/40 rounded-3xl rotate-1 scale-98 border border-white/5 pointer-events-none" />

              {/* Front Card */}
              <div className="relative bento-glass rounded-3xl p-6 shadow-2xl space-y-4 max-w-md mx-auto border border-white/15 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Neurological Analysis Report</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Patient Assessment</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                    IN-HOUSE / GEMINI
                  </span>
                </div>

                {/* The 6 Pillars List Matching the Screenshot */}
                <div className="space-y-2 text-xs">
                  {pillarsData.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSelectedPillar(p)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200 hover:bg-cyan-950/40 hover:border-cyan-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] font-bold text-slate-500 group-hover:text-cyan-400">{p.id}</span>
                          <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                          <span className="font-semibold text-slate-200 group-hover:text-white">{p.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Better Information / Better Decisions / Better Care */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                  Better
                </div>
                <div className="text-xl sm:text-2xl font-serif text-slate-400">
                  Information.
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                  Better
                </div>
                <div className="text-xl sm:text-2xl font-serif text-slate-400">
                  Decisions.
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-serif font-black text-cyan-400 leading-tight">
                  Better
                </div>
                <div className="text-xl sm:text-2xl font-serif text-gradient-cyan font-bold">
                  Care.
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
              <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                05 / THE WORKSTATION
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                A complete neurological<br />
                imaging workstation.
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Designed for doctors, radiologists, hospitals and researchers — with everything you need in one place.
              </p>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-2 group"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Workstation UI Window Mockup with Real Scan Assets */}
            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-white/15 bg-[#060D1A]/95 shadow-2xl overflow-hidden text-xs">
                {/* Window Bar */}
                <div className="bg-[#0A1224] border-b border-white/10 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono font-bold text-[11px] text-slate-300">NEUROVIA CLINICAL SUITE</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dr. Smith</span>
                  </div>
                </div>

                {/* Workstation Interior */}
                <div className="grid grid-cols-12 min-h-[340px]">
                  {/* Left Mini Sidebar */}
                  <div className="col-span-3 border-r border-white/10 p-3 bg-[#080F1E]/80 space-y-2">
                    <div className="font-mono font-bold text-[10px] text-slate-500 px-2 uppercase">Menu</div>
                    <div className="space-y-1">
                      {['Overview', 'Analysis', 'Patients', 'Reports', 'AI Assistant', 'Settings'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setWorkstationTab(item)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                            workstationTab === item
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Workstation Viewport */}
                  <div className="col-span-9 p-4 space-y-4 bg-[#050A14]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div>
                        <div className="font-bold text-white text-xs">Patient Analysis</div>
                        <div className="text-[10px] text-slate-400 font-mono">Patient ID: 15482 • Age: 67 • MRI: T1-Axial</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                        Mild Dementia
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-12 gap-4 items-center">
                      {/* Real Scan & Grad-CAM Heatmap Image */}
                      <div className="sm:col-span-7 aspect-square rounded-xl bg-black flex items-center justify-center relative overflow-hidden border border-white/15 shadow-inner">
                        <img 
                          src={gradcamHeatmapImg} 
                          alt="Grad-CAM Real Time Analysis" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-white/10">
                          Grad-CAM: Axial Layer #14
                        </div>
                      </div>

                      {/* Right Findings Widget */}
                      <div className="sm:col-span-5 space-y-3">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">AI Analysis</div>
                          <div className="text-xs font-bold text-white">Dementia Probability</div>
                          <div className="text-sm font-mono font-black text-cyan-400">87.4%</div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" style={{ width: '87.4%' }} />
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Key Findings:</div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Temporal Lobe</span>
                            <span className="font-bold text-rose-400">High</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Hippocampus</span>
                            <span className="font-bold text-amber-400">Moderate</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Ventricular Region</span>
                            <span className="font-bold text-slate-400">Low</span>
                          </div>
                        </div>

                        <Link
                          to="/analyze"
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-[11px] block text-center transition-all shadow-md shadow-cyan-500/20"
                        >
                          View Full Report
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
            SECTION 06 / BUILT FOR (REAL HOSPITAL CAMPUS ARCHITECTURE)
        ============================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/15 min-h-[440px] flex flex-col justify-end p-8 sm:p-12 text-white group">
            
            {/* Real High-Resolution Hospital Architecture Landscape Background Asset */}
            <img 
              src={hospitalCampusImg} 
              alt="Medical Research Institute Campus" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />

            {/* Cinematic Gradient Vignette for perfect text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-[#030712]/30" />

            <div className="relative z-10 space-y-8 max-w-4xl">
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  06 / BUILT FOR
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Trusted by healthcare<br />
                  professionals worldwide.
                </h2>
              </div>

              {/* 4 Audience Bento Columns Matching the Screenshot */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/15">
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#060D1A]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 hover:bg-[#060D1A]/95 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Doctors</div>
                  <div className="text-xs text-slate-400 leading-relaxed">Better decisions</div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#060D1A]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 hover:bg-[#060D1A]/95 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Radiologists</div>
                  <div className="text-xs text-slate-400 leading-relaxed">Greater accuracy</div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#060D1A]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 hover:bg-[#060D1A]/95 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Hospitals</div>
                  <div className="text-xs text-slate-400 leading-relaxed">Improved workflows</div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#060D1A]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 hover:bg-[#060D1A]/95 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-sm text-white pt-1">Researchers</div>
                  <div className="text-xs text-slate-400 leading-relaxed">Accelerate discovery</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 07 / PRE-FOOTER CALL TO ACTION (MATCHING SCREENSHOT)
        ============================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6 pt-6 relative">
          
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to experience the future of brain imaging?
          </h2>

          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Join the next generation of AI-assisted neurological care.
          </p>

          <div className="pt-2">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/30 hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* ============================================================
          INTERACTIVE MODAL: 6-PILLAR DETAIL DRAWER
      ============================================================ */}
      {selectedPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bento-glass max-w-lg w-full rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyan-400">{selectedPillar.id}</span>
                <selectedPillar.icon className={`w-5 h-5 ${selectedPillar.color}`} />
                <h3 className="font-extrabold text-white text-base">{selectedPillar.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPillar(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="inline-block px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold">
              {selectedPillar.badge}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {selectedPillar.summary}
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Clinical Directives:
              </div>
              {selectedPillar.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedPillar(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bento-glass max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-white/20 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Neurological Executive Analysis</h3>
                  <p className="text-[11px] font-mono text-slate-400">Standard Clinical Dossier • Case #NEURO-9482</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSampleModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Model Classification</span>
                <div className="text-xl font-black text-white">Mild Dementia (87.4%)</div>
                <p className="text-[11px] text-slate-400">EfficientNet-B3 convolutional saliency mapped to temporal lobe atrophy.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Integrative Protocol</span>
                <div className="text-xl font-black text-white">Dual Allopathic + AYUSH</div>
                <p className="text-[11px] text-slate-400">Donepezil 5mg daily coupled with standardized Medhya Rasayana Brahmi.</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Executive Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Patient displays focal volumetric loss in the right temporal lobe on 1.5T T1-weighted axial imaging. Grad-CAM visual heat mapping isolates the activation peak in slice #14. Gemini multimodal clinical intelligence generated a full 6-pillar care protocol emphasizing fall mitigation, circadian daylight stabilization, and 6-month follow-up volumetric MRI.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowSampleModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Dismiss
              </button>
              <Link
                to="/analyze"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Analyze Your Own Scan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          FOOTER (NEUROVIA BRAND MATCHING REFERENCE SCREENSHOT)
      ============================================================ */}
      <footer className="border-t border-white/[0.08] bg-[#030712] py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono font-bold tracking-widest text-white">NEUROVIA</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-400">
            <a href="#privacy" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
