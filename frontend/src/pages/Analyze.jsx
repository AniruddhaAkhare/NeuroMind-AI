import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, FileImage, Loader2, AlertCircle, Sparkles, CheckCircle2, Brain, Activity } from 'lucide-react';
import { predictMRI } from '../services/api';
import Disclaimer from '../components/Disclaimer';
import BrainScanLoader from '../components/BrainScanLoader';
import { playScanCompleteChime } from '../utils/audioFeedback';

export default function Analyze() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const pendingResultRef = useRef(null);
  const scanCycleDoneRef = useRef(false);

  const checkTransition = () => {
    if (scanCycleDoneRef.current && pendingResultRef.current) {
      const { success, predId, error: errText } = pendingResultRef.current;
      setLoading(false);
      if (success && predId) {
        playScanCompleteChime();
        navigate(`/result/${predId}`);
      } else if (errText) {
        setError(errText);
      }
    }
  };

  const handleScanComplete = () => {
    scanCycleDoneRef.current = true;
    checkTransition();
  };

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
      setError('Please select or drop an axial MRI scan image first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      scanCycleDoneRef.current = false;
      pendingResultRef.current = null;

      // Execute API inference call concurrently with video scan cycle
      predictMRI(selectedFile)
        .then((data) => {
          const predId = data.prediction_id || data.prediction?.id;
          if (data.success && predId) {
            pendingResultRef.current = { success: true, predId };
          } else {
            pendingResultRef.current = { error: data.error || 'Failed to process MRI scan.' };
          }
          checkTransition();
        })
        .catch((err) => {
          pendingResultRef.current = {
            error: err.response?.data?.error || err.message || 'Error communicating with backend service.'
          };
          checkTransition();
        });

    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error initiating scan analysis.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Banner Bento */}
      <div className="bento-card p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Axial Brain MRI Diagnostic Analysis
          </h1>
        </div>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Upload a high-resolution axial brain MRI scan to evaluate cognitive status across 4 dementia stages via EfficientNet-B3, generate genuine Grad-CAM interpretability heatmaps, 3D stereotactic neural reconstructions, and comprehensive 6-pillar clinical dossiers.
        </p>
      </div>

      <Disclaimer />

      {/* Upload Form Bento */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bento-card ${
            previewUrl
              ? 'border-cyan-400/60 bg-cyan-950/20 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
              : 'border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.02]'
          }`}
        >
          {previewUrl ? (
            <div className="space-y-5">
              <div className="relative max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-black flex items-center justify-center">
                <img src={previewUrl} alt="MRI Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-200 font-semibold font-mono">
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span className="truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <label className="cursor-pointer text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                  <span>Replace Scan</span>
                  <input type="file" accept="image/*,.dcm,.nii,.nii.gz" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Remove Scan
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-white font-display">
                  Drop your axial brain scan here, or{' '}
                  <label className="text-cyan-400 hover:text-cyan-300 cursor-pointer underline decoration-cyan-400/40 underline-offset-4">
                    <span>browse files</span>
                    <input type="file" accept="image/*,.dcm,.nii,.nii.gz" onChange={handleFileChange} className="hidden" />
                  </label>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Supported formats: Standard Axial JPEG/PNG, DICOM (.dcm), or NIfTI (.nii) up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || loading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              !selectedFile || loading
                ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Running Neuro-Diagnostic Pipeline...</span>
              </>
            ) : (
              <>
                <span>Execute Complete AI Diagnostic Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Video Loading Modal Component */}
      <BrainScanLoader
        isOpen={loading}
        onComplete={handleScanComplete}
      />
    </div>
  );
}
