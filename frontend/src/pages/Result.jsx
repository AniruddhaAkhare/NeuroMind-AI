import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Brain, Eye, ArrowLeft, Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { fetchPredictionDetail } from '../services/api';
import Disclaimer from '../components/Disclaimer';

export default function Result() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await fetchPredictionDetail(id);
        if (res.success && res.prediction) {
          setData(res.prediction);
        } else {
          setError(res.error || 'Prediction record not found');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch prediction details');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Fetching diagnostic report and Grad-CAM saliency map...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto space-y-4 text-center py-12">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error || 'Record not found'}</span>
        </div>
        <Link to="/analyze" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-sm font-semibold text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Analyze Another Scan</span>
        </Link>
      </div>
    );
  }

  const {
    image_filename,
    predicted_class,
    confidence,
    class_probabilities,
    image_path,
    gradcam_path,
    created_at,
  } = data;

  const classBadges = {
    NonDemented: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    VeryMildDemented: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    MildDemented: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ModerateDemented: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <Link to="/history" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to History</span>
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>Diagnostic Report #{id}</span>
            <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${classBadges[predicted_class] || 'bg-slate-800 text-slate-300'}`}>
              {predicted_class}
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Filename: {image_filename} • Analyzed on {created_at ? new Date(created_at).toLocaleString() : 'N/A'}
          </p>
        </div>

        <Link
          to="/analyze"
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
        >
          Analyze New Scan
        </Link>
      </div>

      <Disclaimer />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <span>Classification Summary</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Predicted Cognitive State</span>
                <span className="text-sm font-extrabold text-white">{predicted_class}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Model Confidence</span>
                <span className="text-sm font-extrabold text-cyan-400">{(confidence * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Class Probabilities</h4>
              {class_probabilities &&
                Object.entries(class_probabilities).map(([cls, prob]) => (
                  <div key={cls} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className={cls === predicted_class ? 'text-cyan-400 font-bold' : 'text-slate-300'}>{cls}</span>
                      <span className="text-slate-400">{(prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cls === predicted_class ? 'bg-cyan-400' : 'bg-slate-700'
                        }`}
                        style={{ width: `${prob * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              <span>Visual Explainability (Grad-CAM)</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium block text-center">Original MRI Input</span>
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black">
                  <img src={image_path} alt="Original MRI" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium block text-center">Grad-CAM Heatmap</span>
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
                  {gradcam_path ? (
                    <img src={gradcam_path} alt="GradCAM Visual" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-slate-500 text-center p-4">Grad-CAM heatmap not generated for this scan</div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              Grad-CAM (Gradient-weighted Class Activation Mapping) highlights high-impact region features in warmer colors (red/yellow), highlighting areas of cortical atrophy or tissue loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
