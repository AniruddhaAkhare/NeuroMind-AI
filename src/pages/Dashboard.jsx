import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, CheckCircle2, FileText, ArrowUpRight, Loader2, Brain } from 'lucide-react';
import { fetchStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchStats();
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
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading system metrics and database analytics...</p>
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Analytics Dashboard</h1>
        <p className="text-sm text-slate-400">
          Real-time metrics for MRI scan predictions and EfficientNet-B3 performance.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total MRI Scans</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalScans}</div>
          <p className="text-xs text-slate-400">Logged in audit database</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Avg Confidence</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {stats?.average_confidence ? `${(stats.average_confidence * 100).toFixed(1)}%` : '0%'}
          </div>
          <p className="text-xs text-slate-400">Cross-validation mean score</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Model Validation Acc</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">79.69%</div>
          <p className="text-xs text-slate-400">Macro F1: 83.87%</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Test Accuracy</span>
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">75.83%</div>
          <p className="text-xs text-slate-400">Weighted F1: 75.95%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Classification Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Distribution across logged history</span>
          </div>

          <div className="space-y-4">
            {Object.entries(classCounts).map(([cls, count]) => {
              const pct = totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : 0;
              return (
                <div key={cls} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{cls}</span>
                    <span className="text-slate-400">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Diagnostic Logs</h3>
            <Link to="/history" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recent_predictions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_predictions.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/result/${rec.id}`}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-colors block"
                >
                  <div className="truncate pr-4">
                    <p className="text-sm font-semibold text-white truncate">{rec.image_filename}</p>
                    <p className="text-xs text-slate-400">
                      {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-cyan-400 block">{rec.predicted_class}</span>
                    <span className="text-[11px] text-slate-400">{(rec.confidence * 100).toFixed(1)}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-400 rounded-xl bg-slate-950 border border-slate-800">
              No recent MRI logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
