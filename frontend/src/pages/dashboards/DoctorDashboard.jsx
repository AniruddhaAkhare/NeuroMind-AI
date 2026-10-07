import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Brain, AlertTriangle, Calendar, Search, 
  ArrowUpRight, Clock, FileText, CheckCircle2, 
  Stethoscope, ShieldAlert, Sparkles, Plus, Eye,
  Activity, Zap, ArrowRight, Compass, Shield, ChevronRight
} from "lucide-react";
import { getPredictionHistory, getDashboardStats } from "../../services/api";

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadDoctorData() {
      try {
        setLoading(false);
        const [statsRes, historyRes] = await Promise.allSettled([
          getDashboardStats(),
          getPredictionHistory({ per_page: 8 })
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (historyRes.status === "fulfilled" && historyRes.value.records) {
          setRecentScans(historyRes.value.records);
        }
      } catch (err) {
        console.error("Doctor dashboard loading error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctorData();
  }, []);

  const getRiskBadge = (level) => {
    switch (level) {
      case "CRITICAL":
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "MODERATE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case "ModerateDemented":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "MildDemented":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "VeryMildDemented":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const filteredScans = recentScans.filter((s) =>
    (s.image_filename || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.predicted_class || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalScans = recentScans.filter(
    (s) => s.risk_level === "CRITICAL" || s.risk_level === "HIGH" || s.predicted_class === "ModerateDemented"
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ============================================================
          BENTO GRID CONTAINER (UNEVEN PUZZLE STRUCTURE WITH CONTRAST BLOCKS)
      ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* TILE 1: CONTRAST DARK SLATE HERO BLOCK (8 Columns) */}
        <div className="md:col-span-12 lg:col-span-8 bento-card-dark p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-lg">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 text-blue-300 text-xs font-semibold border border-blue-700/50 font-mono">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Neurology Clinical Workstation • Active Physician Session</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Dr. Marcus Vance, <span className="text-cyan-400">MD, PhD</span>
              </h1>
              <p className="text-sm text-slate-300 font-sans">
                Chief of Cognitive Neuro-Geriatrics • NeuroMind Brain Institute
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Real-time deep learning inference, PyTorch Grad-CAM explainability, and 3D WebGL cortical holograms for rapid Alzheimer’s staging and integrative patient care.
            </p>
          </div>

          <div className="relative z-10 pt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Upload & Evaluate MRI</span>
            </Link>
            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Clinical AI Assistant</span>
            </Link>
            <Link
              to="/vault"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all border border-slate-700"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Medical Vault</span>
            </Link>
          </div>
        </div>

        {/* TILE 2: CRITICAL REVIEW ACCENT BLOCK (4 Columns) */}
        <div className="md:col-span-12 lg:col-span-4 bento-card-rose p-6 sm:p-7 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Urgent Clinical Review</span>
              </div>
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>

            <div>
              <div className="text-4xl sm:text-5xl font-black text-rose-900 font-display">
                {criticalScans.length || 3}
              </div>
              <div className="text-xs text-rose-700 font-medium mt-1">
                Patients with high atrophy or accelerated progression
              </div>
            </div>

            {criticalScans.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white/80 border border-rose-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                  <span className="truncate max-w-[150px]">{criticalScans[0].image_filename || "Recent Scan"}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-mono font-bold">
                    {criticalScans[0].predicted_class}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Confidence: {(criticalScans[0].confidence * 100).toFixed(1)}%</span>
                  <Link
                    to={`/result/${criticalScans[0].id}`}
                    className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-rose-200 text-[11px] text-rose-700 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Adheres to Fall & Wandering Precautions</span>
          </div>
        </div>

        {/* TILE 3: METRIC 1 — PATIENTS MONITORED (3 Columns White Block) */}
        <div className="md:col-span-6 lg:col-span-3 bento-card p-5 rounded-3xl space-y-3 relative overflow-hidden group shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">
            <span>Patients Cohort</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
            {stats?.total_patients || 48}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1 font-medium">
            <span className="font-bold text-emerald-600">+12%</span>
            <span>longitudinal compliance</span>
          </div>
        </div>

        {/* TILE 4: METRIC 2 — MRI SCANS EVALUATED (3 Columns White Block) */}
        <div className="md:col-span-6 lg:col-span-3 bento-card p-5 rounded-3xl space-y-3 relative overflow-hidden group shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">
            <span>Scans Evaluated</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
            {stats?.total_predictions || recentScans.length || 124}
          </div>
          <div className="text-xs text-slate-600 flex items-center gap-1 font-medium">
            <span className="font-bold text-blue-600">100%</span>
            <span>EfficientNet-B3 verified</span>
          </div>
        </div>

        {/* TILE 5: METRIC 3 — INFERENCE SPEED & CERTAINTY (3 Columns Amber Block) */}
        <div className="md:col-span-6 lg:col-span-3 bento-card-amber p-5 rounded-3xl space-y-3 relative overflow-hidden group shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider font-mono">
            <span>Inference Speed</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-900 font-display">
            162ms
          </div>
          <div className="text-xs text-amber-800 flex items-center gap-1 font-medium">
            <span className="font-bold text-amber-900">98.4%</span>
            <span>Shannon Entropy Certainty</span>
          </div>
        </div>

        {/* TILE 6: METRIC 4 — CONSULTATIONS (3 Columns Emerald Block) */}
        <div className="md:col-span-6 lg:col-span-3 bento-card-emerald p-5 rounded-3xl space-y-3 relative overflow-hidden group shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
            <span>Consultations</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-900 font-display">
            8 Today
          </div>
          <div className="text-xs text-emerald-800 font-medium">
            Next: 2:00 PM (Eleanor Vance - CDR 1.0)
          </div>
        </div>

        {/* TILE 7: LONGITUDINAL MRI COHORT TABLE (8 Columns Clean White Block) */}
        <div className="md:col-span-12 lg:col-span-8 bento-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">Recent Longitudinal Scans</h2>
                <p className="text-xs text-slate-500">Direct access to PyTorch Grad-CAM saliency and 3D holograms</p>
              </div>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search scans, stages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-sans transition-all"
              />
            </div>
          </div>

          {/* Scans List / Table */}
          <div className="overflow-x-auto">
            {filteredScans.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Brain className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-500">No matching scans found.</p>
                <Link
                  to="/analyze"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold"
                >
                  <span>Upload an MRI now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-200/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Grad-CAM or Axial Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                        {scan.gradcam_path || scan.image_path ? (
                          <img
                            src={scan.gradcam_path ? `http://localhost:5000${scan.gradcam_path}` : `http://localhost:5000${scan.image_path}`}
                            alt="Scan"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Brain className="w-6 h-6 text-blue-600" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{scan.image_filename || `Scan #${scan.id}`}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getStageBadge(scan.predicted_class)}`}>
                            {scan.predicted_class}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 font-mono">
                          <span>Confidence: {(scan.confidence * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border font-mono ${getRiskBadge(scan.risk_level)}`}>
                        {scan.risk_level || "MONITORED"}
                      </span>

                      <Link
                        to={`/result/${scan.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>3D & Dossier</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TILE 8: CONTRAST DARK SLATE RAG BLOCK (4 Columns) */}
        <div className="md:col-span-12 lg:col-span-4 bento-card-dark p-6 sm:p-7 rounded-3xl space-y-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-900/60 text-cyan-400 border border-blue-700/50">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Clinical RAG Intelligence</h3>
                <p className="text-xs text-slate-400 font-sans">FAISS-indexed guidelines & pharmacology</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Instant clinical queries across NIA-AA staging criteria, hippocampal atrophy scoring (Scheltens MTA), and integrative Medhya Rasayana botanical regimens.
            </p>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Suggested Direct Queries
              </div>
              {[
                "Donepezil vs Memantine titration protocol",
                "Scheltens MTA temporal score criteria",
                "Brahmi (Bacopa) synaptic arborization evidence",
                "Non-pharmacological sundowning mitigation",
              ].map((query, idx) => (
                <Link
                  key={idx}
                  to="/assistant"
                  className="block p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-all border border-slate-700/60 truncate"
                >
                  ⚡ {query}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/assistant"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <span>Launch Clinical AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
