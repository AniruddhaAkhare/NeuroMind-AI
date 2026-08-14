import React, { useRef, useState } from 'react';
import { UploadCloud, Image, AlertCircle } from 'lucide-react';

export default function UploadBox({ onFileSelected, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndPassFile = (file) => {
    setError(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxBytes = 10 * 1024 * 1024; // 10MB

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext) || (!validTypes.includes(file.type) && file.type)) {
      setError('Invalid file format. Please upload a .jpg, .jpeg, or .png brain MRI scan.');
      return;
    }

    if (file.size > maxBytes) {
      setError('File size exceeds maximum limit of 10 MB.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-300 dark:border-slate-700'
            : isDragging
            ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 scale-[1.01]'
            : 'border-slate-300 hover:border-cyan-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-cyan-500 dark:hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-4 dark:bg-cyan-950 dark:text-cyan-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Upload Brain MRI Scan
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Drag and drop your scan here, or <span className="text-cyan-600 font-medium underline">browse file</span>
        </p>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">
          <span className="flex items-center gap-1">
            <Image className="w-3.5 h-3.5" /> JPG, JPEG, PNG
          </span>
          <span>•</span>
          <span>Max file size: 10 MB</span>
          <span>•</span>
          <span>300x300 Resized Automatically</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
