import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, CheckCircle2, FileText, ArrowUpRight, Loader2, Brain, Sparkles, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load system metrics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs font-medium text-slate-500">Loading system metrics and database analytics...</p>
      </div>
    );
  }

  const classCounts = stats?.class_counts || {
    NonDemented: 0,
    VeryMildDemented: 0,
    MildDemented: 0,
    ModerateDemented: 0,
  };

  const totalScans = stats?.total_predictions || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Clinical Analytics & Performance
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time telemetry for MRI scan evaluations, model inference accuracy, and diagnostic distribution
          </p>
        </div>

        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-sm shadow-teal-600/20 self-start sm:self-auto"
        >
          <span>Evaluate New Scan</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Total MRI Scans</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalScans}</div>
          <p className="text-[11px] text-slate-400">Logged in audit database</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Avg Confidence</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.average_confidence ? `${(stats.average_confidence * 100).toFixed(1)}%` : '0%'}
          </div>
          <p className="text-[11px] text-slate-400">Cross-validation mean score</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Model Validation Acc</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">79.69%</div>
          <p className="text-[11px] text-slate-400">Macro F1: 83.87%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <span>Test Accuracy</span>
            <Brain className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">75.83%</div>
          <p className="text-[11px] text-slate-400">Weighted F1: 75.95%</p>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Classification Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">All historical cohorts</span>
          </div>

          <div className="space-y-4">
            {Object.entries(classCounts).map(([cls, count]) => {
              const pct = totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : 0;
              return (
                <div key={cls} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cls}</span>
                    <span className="text-slate-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Diagnostic Scans</h3>
            <Link to="/history" className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recent_predictions?.length > 0 ? (
            <div className="space-y-2.5">
              {stats.recent_predictions.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/result/${rec.id}`}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 hover:border-teal-200 flex items-center justify-between transition-colors block"
                >
                  <div className="truncate pr-4">
                    <p className="text-xs font-bold text-slate-900 truncate">{rec.image_filename}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {rec.created_at ? new Date(rec.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 block">{rec.predicted_class}</span>
                    <span className="text-[11px] font-mono text-teal-600 font-bold">{(rec.confidence * 100).toFixed(1)}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 rounded-xl bg-slate-50 border border-slate-200/80">
              No recent MRI logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
