import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, FileText, Download, Eye, Calendar, 
  Search, Lock, HardDrive, CheckCircle2, Loader2,
  FolderLock, RefreshCw, AlertCircle
} from 'lucide-react';
import { fetchHistory, downloadReportUrl } from '../services/api';

export default function MedicalVault() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadVaultRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchHistory({ per_page: 50 });
      if (res.success) {
        setRecords(res.records || []);
      } else {
        setError(res.error || 'Failed to retrieve vault records');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error connecting to medical archive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaultRecords();
  }, []);

  const filteredRecords = records.filter(
    (r) =>
      r.image_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.predicted_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
              <FolderLock className="w-4 h-4 text-teal-600" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Encrypted Medical Vault & Archive
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Secure HIPAA-compliant repository for longitudinal axial MRI scans, 3D neural reconstructions, and ReportLab PDF dossiers
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadVaultRecords}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
            title="Refresh Vault"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <span>Deposit New Scan</span>
          </Link>
        </div>
      </div>

      {/* Security Status Bar */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">End-to-End Encrypted</div>
            <div className="text-[11px] text-slate-500">AES-256 Storage Standard</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Total Archived Records</div>
            <div className="text-[11px] text-slate-500 font-mono font-bold text-teal-700">{records.length} Scans Deposited</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Audit Compliance</div>
            <div className="text-[11px] text-slate-500">Immutable Relational Logs</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search vault by scan filename, evaluation ID, or diagnostic stage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">Decrypting and loading medical vault records...</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:border-teal-300 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  VAULT-REC #{item.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  item.predicted_class === 'NonDemented'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {item.predicted_class}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {item.image_filename}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Confidence:</span>
                  <span className="font-mono font-bold text-teal-600">
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Archived Date:</span>
                  <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link
                  to={`/result/${item.id}`}
                  className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>
                <a
                  href={downloadReportUrl(item.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold flex items-center justify-center transition-colors"
                  title="Download PDF Dossier"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          No records in medical vault matching query.
        </div>
      )}
    </div>
  );
}
