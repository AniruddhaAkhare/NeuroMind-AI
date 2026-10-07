import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Scan, Eye, Sparkles, CheckCircle2, AlertTriangle, 
  Layers, Sliders, Activity, Filter, Search, ArrowUpRight,
  ShieldCheck, Brain
} from "lucide-react";
import { getPredictionHistory } from "../../services/api";

export default function RadiologistDashboard() {
  const [scans, setScans] = useState([]);
  const [filterStage, setFilterStage] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRadiologyWorklist() {
      try {
        const res = await getPredictionHistory({ per_page: 12 });
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
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
            <Scan className="w-3.5 h-3.5" />
            <span>Radiology PACS & Saliency Verification Workstation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Neuro-Radiology Diagnostic Worklist
          </h1>
          <p className="text-sm text-slate-500">
            EfficientNet-B3 axial MRI classification with Grad-CAM activation mapping and 3D anatomical projection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-sm shadow-teal-600/20"
          >
            <Scan className="w-4 h-4" />
            <span>Process New MRI</span>
          </Link>
        </div>
      </div>

      {/* Verification Queue Filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Cognitive Stage:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "ModerateDemented", "MildDemented", "VeryMildDemented", "NonDemented"].map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStage === stage
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 hover:border-teal-500/40 hover:bg-white transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      SCAN #{scan.id}
                    </span>
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Grad-CAM Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{scan.predicted_class}</h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {scan.image_filename}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200/60">
                      <span className="text-slate-400 block font-medium">Confidence</span>
                      <span className="font-mono font-bold text-slate-900">
                        {(scan.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/60">
                      <span className="text-slate-400 block font-medium">Risk Score</span>
                      <span className="font-mono font-bold text-teal-700">
                        {scan.risk_score ? (scan.risk_score * 100).toFixed(0) : "N/A"}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {scan.created_at ? new Date(scan.created_at).toLocaleDateString() : "Today"}
                  </span>
                  <Link
                    to={`/result/${scan.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Verify Saliency</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No scans in this filter category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
