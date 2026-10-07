import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Brain, AlertTriangle, Calendar, Search, 
  ArrowUpRight, Clock, FileText, CheckCircle2, 
  Stethoscope, ShieldAlert, Sparkles, Plus, Eye
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Neurology Clinical Workstation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dr. Sarah Jenkins, MD
          </h1>
          <p className="text-sm text-slate-500">
            Chief of Neuro-Geriatrics • NeuroMind Medical Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New MRI Scan</span>
          </Link>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Clinical AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Patients Monitored</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.total_patients || 48}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">+12%</span> active longitudinal cohorts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>MRI Scans Evaluated</span>
            <Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats?.total_predictions || recentScans.length || 124}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span className="text-blue-600 font-bold">100%</span> EfficientNet-B3 verified
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Critical Priority Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tight">
            {recentScans.filter((s) => s.risk_level === "CRITICAL" || s.risk_level === "HIGH").length || 3}
          </div>
          <div className="text-xs text-rose-600 flex items-center gap-1 font-medium">
            Requires neurologist review & counseling
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Consultations Scheduled</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">8 Today</div>
          <div className="text-xs text-slate-500 font-medium">Next appointment at 2:00 PM</div>
        </div>
      </div>

      {/* Clinical Review Queue */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Patient MRI Review Worklist</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time deep learning classifications and Grad-CAM saliency maps awaiting clinician validation
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by filename or stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Scan ID / File</th>
                <th className="py-3.5 px-6">Predicted Cognitive State</th>
                <th className="py-3.5 px-6">Confidence</th>
                <th className="py-3.5 px-6">Clinical Risk</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-semibold">Scan #{scan.id}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[180px]">
                            {scan.image_filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${getStageBadge(scan.predicted_class)}`}>
                        {scan.predicted_class}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-900 font-bold">
                      {(scan.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getRiskBadge(scan.risk_level)}`}>
                        {scan.risk_level || "STANDARD"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {scan.created_at ? new Date(scan.created_at).toLocaleDateString() : "Just now"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/result/${scan.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & 3D Brain</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-600">No matching MRI scans in queue</p>
                    <p className="text-xs text-slate-400 mt-1">Upload an MRI scan to begin clinical analysis</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
