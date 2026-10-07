import React from 'react';
import { Brain, Cpu, Database, ShieldCheck, Eye, Layers, Sparkles } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Specifications & Architecture</h1>
        <p className="text-xs text-slate-500">
          Technical specifications for NEUROVIA's deep learning pipeline, explainability engine, and 3D modeling
        </p>
      </div>

      <Disclaimer />

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-600" />
          <span>Model Architecture: EfficientNet-B3</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The core classification network utilizes PyTorch's EfficientNet-B3 pre-trained architecture with fine-tuned top feature blocks. EfficientNet leverages compound scaling across network depth, width, and resolution to maximize accuracy while maintaining low parameter count and high inference throughput.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Validation Benchmarks</span>
            <div className="text-base font-extrabold text-slate-900">Accuracy: 79.69%</div>
            <p className="text-xs text-slate-500">Macro F1 Score: 83.87%</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Test Holdout Performance</span>
            <div className="text-base font-extrabold text-slate-900">Accuracy: 75.83%</div>
            <p className="text-xs text-slate-500">Weighted F1: 75.95% | Macro F1: 79.49%</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-teal-600" />
          <span>Explainable AI (Grad-CAM)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Gradient-weighted Class Activation Mapping (Grad-CAM) uses the gradients of any target concept entering the final convolutional layer of the EfficientNet-B3 network to produce a coarse localization map highlighting important regions in the image for predicting the concept.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-600" />
          <span>Database & Persistence Layer</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Configured with Flask-SQLAlchemy and PostgreSQL / SQLite database engine storing image references, confidence metrics, class probability vectors, 3D peak defect coordinates, and longitudinal timestamps.
        </p>
      </div>
    </div>
  );
}
