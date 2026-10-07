import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, FileImage, Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Axial Brain MRI Diagnostic Analysis
          </h1>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Upload a high-resolution axial brain MRI scan to evaluate cognitive status across 4 dementia stages via EfficientNet-B3, generate genuine Grad-CAM interpretability heatmaps, 3D stereotactic neural reconstructions, and comprehensive 6-pillar clinical dossiers.
        </p>
      </div>

      <Disclaimer />

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all bg-white ${
            previewUrl
              ? 'border-blue-500 bg-blue-50/20 shadow-sm'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 shadow-xs'
          }`}
        >
          {previewUrl ? (
            <div className="space-y-5">
              <div className="relative max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 flex items-center justify-center">
                <img src={previewUrl} alt="MRI Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-700 font-semibold">
                <FileImage className="w-4 h-4 text-blue-600" />
                <span className="truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-slate-400 font-mono">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                <span>Select a different scan</span>
                <input type="file" accept=".jpg,.jpeg,.png,.dcm,.nii,.nii.gz" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 w-fit mx-auto shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">
                  Click to browse or drag & drop brain MRI scan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: JPEG, PNG, DICOM (.dcm), NIfTI (.nii, .nii.gz) (max 10MB)
                </p>
              </div>
              <input type="file" accept=".jpg,.jpeg,.png,.dcm,.nii,.nii.gz" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-600/25"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Analyzing MRI with EfficientNet-B3, Grad-CAM & Three.js...</span>
            </>
          ) : (
            <>
              <span>Execute Diagnostic Evaluation & Neural Modeling</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Accelerated 3D Brain Scan Loading Modal with Smooth Cycle Completion */}
      <BrainScanLoader active={loading} onComplete={handleScanComplete} />
    </div>
  );
}
