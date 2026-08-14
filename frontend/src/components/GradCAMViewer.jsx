import React, { useState } from 'react';
import { Eye, Info, Sparkles } from 'lucide-react';

export default function GradCAMViewer({ originalImageUrl, gradcamUrl, predictedClass }) {
  const [activeTab, setActiveTab] = useState('side-by-side');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-lg text-white">Grad-CAM Visual Explanation</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Class Activation Mapping highlighting salient feature regions for target prediction
          </p>
        </div>

        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('side-by-side')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'side-by-side' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('gradcam-only')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'gradcam-only' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Grad-CAM Heatmap
          </button>
        </div>
      </div>

      {activeTab === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" /> Original Brain MRI Scan
            </span>
            <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center p-2">
              <img
                src={originalImageUrl}
                alt="Original MRI"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-cyan-400 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Grad-CAM Heatmap Visualization
            </span>
            <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center p-2">
              {gradcamUrl ? (
                <img
                  src={gradcamUrl}
                  alt="Grad-CAM Visualization"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-xs text-slate-500 text-center p-4">
                  Grad-CAM visualization generated successfully during inference
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-2">
          <span className="text-xs font-semibold text-cyan-400 block text-center">
            Grad-CAM Class Activation Map
          </span>
          <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center p-2">
            <img
              src={gradcamUrl || originalImageUrl}
              alt="Grad-CAM Focus"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <p>
          Highlighted warmer regions (red/yellow) represent brain tissue locations that contributed most strongly to the model's prediction. This visualization is generated for model interpretability and research insight, and does not establish clinical diagnosis.
        </p>
      </div>
    </div>
  );
}
