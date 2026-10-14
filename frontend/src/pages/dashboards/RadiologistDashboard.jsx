import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Scan, Eye, Sparkles, CheckCircle2, AlertTriangle, 
  Layers, Sliders, Activity, Filter, Search, ArrowUpRight,
  ShieldCheck, Brain, Plus, Microscope
} from "lucide-react";
import { getPredictionHistory } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function RadiologistDashboard() {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [filterStage, setFilterStage] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRadiologyWorklist() {
      try {
        const res = await getPredictionHistory({ per_page: 18 });
        if (res.success && res.records) {
          setScans(res.records);
        }
      } catch (err) {
        console.error("Radiology worklist error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRadiologyWorklist();
  }, []);

  const filtered = scans.filter((s) => {
    if (filterStage === "ALL") return true;
    return s.predicted_class === filterStage;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#0f172a] to-blue-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 text-xs font-semibold border border-purple-500/40 font-mono shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Microscope className="w-3.5 h-3.5 text-purple-400" />
            <span>Radiology PACS & Saliency Verification Workstation</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Welcome, {user?.full_name || "Dr. Elena Rostova"}
          </h1>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            EfficientNet-B3 axial MRI classification with PyTorch Grad-CAM activation mapping, WW/WL contrast sliders, and longitudinal slice comparison.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              Role: Neuroradiologist
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-xs text-purple-300 font-mono">
              PACS Ingestion: Active
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
              Grad-CAM Hook: Online
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Scan className="w-4 h-4" />
            <span>Process New MRI</span>
          </Link>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>All Archive</span>
          </Link>
        </div>
      </div>

      {/* Verification Queue Filters & Worklist */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Filter by Dementia Stage:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "ModerateDemented", "MildDemented", "VeryMildDemented", "NonDemented"].map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStage === stage
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {stage === "ALL" ? "All Scans" : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Worklist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filtered.length > 0 ? (
            filtered.map((scan) => (
              <div
                key={scan.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-purple-500/40 hover:bg-slate-900 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      SCAN #{scan.id}
                    </span>
                    <span className="text-xs font-semibold text-purple-300 bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-mono">
                      Grad-CAM Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base">{scan.predicted_class}</h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                      {scan.image_filename}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block font-medium">Confidence</span>
                      <span className="font-mono font-bold text-white">
                        {(scan.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block font-medium">Risk Score</span>
                      <span className="font-mono font-bold text-purple-400">
                        {scan.risk_score ? (scan.risk_score * 100).toFixed(0) : "N/A"}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {scan.created_at ? new Date(scan.created_at).toLocaleDateString() : "Recent"}
                  </span>
                  <Link
                    to={`/result/${scan.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs transition-colors border border-purple-500/30"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Verify Saliency</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No scans matching category "{filterStage}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
