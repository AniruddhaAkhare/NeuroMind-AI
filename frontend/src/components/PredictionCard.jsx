import React from 'react';
import { Brain, Award, Activity } from 'lucide-react';
import { formatClassName, getClassBadgeColor } from '../utils/helpers';

export default function PredictionCard({ prediction }) {
  if (!prediction) return null;

  const formattedClass = formatClassName(prediction.predicted_class);
  const badgeStyle = getClassBadgeColor(prediction.predicted_class);
  const confidencePercent = (prediction.confidence * 100).toFixed(2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              AI Prediction Output
            </h3>
            <span className="text-xs text-cyan-400 font-mono">EfficientNet-B3 • 4-Class</span>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-xs ${badgeStyle}`}>
          {formattedClass}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <span className="text-xs text-slate-400 block mb-1">Predicted Dementia Stage</span>
          <span className="text-2xl font-bold text-white tracking-tight">{formattedClass}</span>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400">Model Confidence</span>
            <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> High Precision
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 tracking-tight">
              {confidencePercent}%
            </span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${confidencePercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
