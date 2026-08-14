import React, { useEffect, useState } from 'react';
import { FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

export default function ImagePreview({ file, onRemove, disabled = false }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!file) return null;

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {previewUrl ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-700">
            <img src={previewUrl} alt="MRI Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
            <FileText className="w-8 h-8" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <h4 className="font-semibold text-sm truncate text-white">{file.name}</h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">{formatFileSize(file.size)}</p>
          <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] rounded font-mono">
            {file.type || 'image/jpeg'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        Remove Scan
      </button>
    </div>
  );
}
