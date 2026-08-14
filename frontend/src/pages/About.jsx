import React from 'react';
import { Brain, Cpu, Database, ShieldCheck, Eye, Layers } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-bold text-white">About & System Specifications</h1>
        <p className="text-slate-400 mt-1">
          Academic research overview for Alzheimer's MRI Detection & Explainable AI.
        </p>
      </div>

      <Disclaimer />

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Model Architecture: EfficientNet-B3</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          The core classification network utilizes PyTorch's EfficientNet-B3 pre-trained architecture with fine-tuned top feature blocks. EfficientNet leverages compound scaling across network depth, width, and resolution to maximize accuracy while maintaining low parameter count and high inference throughput.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Validation Benchmarks</span>
            <div className="text-lg font-extrabold text-white">Accuracy: 79.69%</div>
            <p className="text-xs text-slate-400">Macro F1 Score: 83.87%</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Test Holdout Performance</span>
            <div className="text-lg font-extrabold text-white">Accuracy: 75.83%</div>
            <p className="text-xs text-slate-400">Weighted F1: 75.95% | Macro F1: 79.49%</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          <span>Explainable AI (Grad-CAM)</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Gradient-weighted Class Activation Mapping (Grad-CAM) uses the gradients of any target concept entering the final convolutional layer of the EfficientNet-B3 network to produce a coarse localization map highlighting important regions in the image for predicting the concept.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>Database & Persistence Layer</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Configured with Flask-SQLAlchemy and PostgreSQL database engine storing image references, confidence metrics, class probability vectors, and timestamps.
        </p>
      </div>
    </div>
  );
}
