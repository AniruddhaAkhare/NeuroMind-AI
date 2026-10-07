import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Trash2, ArrowUpDown, Loader2, Eye, 
  AlertCircle, FileText, Calendar, Activity, SplitSquareVertical, 
  X, CheckCircle2, ChevronRight, Layers, Sparkles 
} from 'lucide-react';
import { fetchHistory, deletePrediction, getFileUrl } from '../services/api';

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sortBy, setSortBy] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Longitudinal Comparison State
  const [selectedScans, setSelectedScans] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareShowGradcam, setCompareShowGradcam] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchHistory({
        page,
        per_page: 10,
        search,
        class_filter: classFilter,
        sort_by: sortBy,
      });
      if (res.success) {
        setRecords(res.records);
        setTotalPages(res.pages || 1);
      } else {
        setError(res.error || 'Failed to load history');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error communicating with backend service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, classFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete diagnostic evaluation record #${id}?`)) return;
    try {
      await deletePrediction(id);
      setSelectedScans((prev) => prev.filter((s) => s.id !== id));
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const toggleSelectScan = (scan) => {
    if (selectedScans.some((s) => s.id === scan.id)) {
      setSelectedScans((prev) => prev.filter((s) => s.id !== scan.id));
    } else {
      if (selectedScans.length >= 2) {
        // Replace oldest selection or warn
        setSelectedScans([selectedScans[1], scan]);
      } else {
        setSelectedScans((prev) => [...prev, scan]);
      }
    }
  };

  const classBadges = {
    NonDemented: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    VeryMildDemented: 'bg-blue-50 text-blue-800 border-blue-200',
    MildDemented: 'bg-amber-50 text-amber-800 border-amber-200',
    ModerateDemented: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  // Sorted chronologically for baseline vs follow-up comparison
  const sortedPair = useMemo(() => {
    if (selectedScans.length !== 2) return null;
    const [s1, s2] = selectedScans;
    const d1 = new Date(s1.created_at || 0).getTime();
    const d2 = new Date(s2.created_at || 0).getTime();
    return d1 <= d2 ? { baseline: s1, followUp: s2 } : { baseline: s2, followUp: s1 };
  }, [selectedScans]);

  const intervalDays = useMemo(() => {
    if (!sortedPair) return null;
    const d1 = new Date(sortedPair.baseline.created_at || 0).getTime();
    const d2 = new Date(sortedPair.followUp.created_at || 0).getTime();
    return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  }, [sortedPair]);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <FileText className="w-4 h-4 text-blue-600" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Diagnostic Audit Log
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Immutable longitudinal archive of evaluated MRI brain scans, Grad-CAM saliency heatmaps, and side-by-side progression analysis
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm shadow-blue-600/20 self-start sm:self-auto"
        >
          <span>Analyze New Scan</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by file name or evaluation ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            >
              <option value="All">All Diagnostic Stages</option>
              <option value="NonDemented">NonDemented</option>
              <option value="VeryMildDemented">VeryMildDemented</option>
              <option value="MildDemented">MildDemented</option>
              <option value="ModerateDemented">ModerateDemented</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={() => {
                setSortBy(sortBy === 'desc' ? 'asc' : 'desc');
                setPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>{sortBy === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Retrieving diagnostic history records...</p>
        </div>
      ) : records.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-4 text-center">Compare</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Scan File Name</th>
                  <th className="px-6 py-4">Predicted Stage</th>
                  <th className="px-6 py-4">Model Confidence</th>
                  <th className="px-6 py-4">Evaluation Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const isChecked = selectedScans.some((s) => s.id === rec.id);
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectScan(rec)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                          title="Select for longitudinal comparison"
                        />
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-400">#{rec.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{rec.image_filename}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${classBadges[rec.predicted_class] || 'bg-slate-100 text-slate-600'}`}>
                          {rec.predicted_class}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{(rec.confidence * 100).toFixed(1)}%</td>
                      <td className="px-6 py-4 text-slate-500">
                        {rec.created_at ? new Date(rec.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/result/${rec.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Dossier</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="inline-flex items-center p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border border-slate-200"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-100 text-slate-700 font-semibold"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-50 hover:bg-slate-100 text-slate-700 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          No diagnostic records match your search criteria.
        </div>
      )}

      {/* Floating Bottom Action Drawer for Longitudinal Comparison */}
      {selectedScans.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">
              {selectedScans.length === 1
                ? `1 Scan Selected (#${selectedScans[0].id}). Select 1 more to compare.`
                : `2 Scans Selected: #${selectedScans[0].id} & #${selectedScans[1].id}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedScans.length === 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Compare Longitudinal Progression</span>
              </button>
            )}

            <button
              onClick={() => setSelectedScans([])}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Longitudinal Side-by-Side Comparison Modal */}
      {showCompareModal && sortedPair && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    <SplitSquareVertical className="w-4 h-4 text-blue-600" />
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    Longitudinal Side-by-Side Scan Comparison
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Comparative neuroimaging analysis tracking temporal atrophy progression and ventricular volume shifts
                </p>
              </div>

              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trajectory Interval Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                    Temporal Interval
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {intervalDays} Days Elapsed ({(intervalDays / 30.4).toFixed(1)} Months)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Trajectory:</span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {sortedPair.baseline.predicted_class} ➔ {sortedPair.followUp.predicted_class}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    sortedPair.baseline.predicted_class === sortedPair.followUp.predicted_class
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {sortedPair.baseline.predicted_class === sortedPair.followUp.predicted_class
                    ? 'Stable (Non-Progressive)'
                    : 'Stage Transition Detected'}
                </span>
              </div>

              {/* View Overlay Toggle */}
              <button
                onClick={() => setCompareShowGradcam(!compareShowGradcam)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  compareShowGradcam
                    ? 'bg-teal-600 text-white border-teal-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{compareShowGradcam ? 'Showing Grad-CAM' : 'Show Grad-CAM Heatmap'}</span>
              </button>
            </div>

            {/* Side-by-Side Dual Viewport Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Baseline Viewport */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      BASELINE SCAN
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Scan #{sortedPair.baseline.id}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${classBadges[sortedPair.baseline.predicted_class]}`}>
                    {sortedPair.baseline.predicted_class}
                  </span>
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center relative">
                  <img
                    src={getFileUrl(
                      compareShowGradcam && sortedPair.baseline.gradcam_path
                        ? sortedPair.baseline.gradcam_path
                        : sortedPair.baseline.image_path
                    )}
                    alt="Baseline Scan"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
                    Confidence: {(sortedPair.baseline.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between font-medium">
                  <span>File: {sortedPair.baseline.image_filename}</span>
                  <span>{new Date(sortedPair.baseline.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Follow-up Viewport */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      FOLLOW-UP SCAN
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Scan #{sortedPair.followUp.id}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${classBadges[sortedPair.followUp.predicted_class]}`}>
                    {sortedPair.followUp.predicted_class}
                  </span>
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center relative">
                  <img
                    src={getFileUrl(
                      compareShowGradcam && sortedPair.followUp.gradcam_path
                        ? sortedPair.followUp.gradcam_path
                        : sortedPair.followUp.image_path
                    )}
                    alt="Follow-up Scan"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
                    Confidence: {(sortedPair.followUp.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between font-medium">
                  <span>File: {sortedPair.followUp.image_filename}</span>
                  <span>{new Date(sortedPair.followUp.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Link
                to={`/result/${sortedPair.followUp.id}`}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm shadow-blue-600/20"
              >
                Inspect Follow-up Dossier (#{sortedPair.followUp.id})
              </Link>
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
