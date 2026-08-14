import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Trash2, ArrowUpDown, Loader2, Eye, AlertCircle } from 'lucide-react';
import { fetchHistory, deletePrediction } from '../services/api';

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sortBy, setSortBy] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    if (!window.confirm(`Delete prediction record #${id}?`)) return;
    try {
      await deletePrediction(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const classBadges = {
    NonDemented: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    VeryMildDemented: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    MildDemented: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ModerateDemented: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Diagnostic History Audit Log</h1>
        <p className="text-sm text-slate-400">
          Historical records of evaluated MRI scans stored in PostgreSQL database.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Classes</option>
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
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 hover:text-white flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4 text-cyan-400" />
              <span>{sortBy === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading audit history...</p>
        </div>
      ) : records.length > 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">File Name</th>
                  <th className="px-6 py-3.5">Predicted Class</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{rec.id}</td>
                    <td className="px-6 py-4 font-semibold text-white max-w-xs truncate">{rec.image_filename}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${classBadges[rec.predicted_class] || 'bg-slate-800 text-slate-300'}`}>
                        {rec.predicted_class}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-cyan-400">{(rec.confidence * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/result/${rec.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-50 hover:bg-slate-800"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-50 hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          No records match your search criteria.
        </div>
      )}
    </div>
  );
}
