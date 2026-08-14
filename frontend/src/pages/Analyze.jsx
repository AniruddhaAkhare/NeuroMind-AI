import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, FileImage, Loader2, AlertCircle } from 'lucide-react';
import { predictMRI } from '../services/api';
import Disclaimer from '../components/Disclaimer';

export default function Analyze() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop an MRI scan image first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await predictMRI(selectedFile);
      if (data.success && data.prediction_id) {
        navigate(`/result/${data.prediction_id}`);
      } else {
        setError(data.error || 'Failed to process MRI scan.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error communicating with backend service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload MRI Brain Scan</h1>
        <p className="text-sm text-slate-400">
          Upload an axial brain MRI scan (JPEG/PNG) to evaluate Alzheimer’s cognitive stage.
        </p>
      </div>

      <Disclaimer />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            previewUrl
              ? 'border-cyan-500/50 bg-slate-900/90'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative max-w-xs mx-auto aspect-square rounded-xl overflow-hidden border border-slate-700 bg-black">
                <img src={previewUrl} alt="MRI Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span className="font-medium truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <label className="inline-block cursor-pointer text-xs font-semibold text-cyan-400 hover:underline">
                Choose a different file
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block space-y-4">
              <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit mx-auto">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Click to upload or drag & drop MRI image
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPEG, JPG, PNG (Max 10MB)
                </p>
              </div>
              <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing EfficientNet-B3 & Grad-CAM...</span>
            </>
          ) : (
            <>
              <span>Run Deep Learning Diagnosis</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
