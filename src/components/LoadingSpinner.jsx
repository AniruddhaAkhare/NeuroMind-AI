import React from 'react';
import { Brain } from 'lucide-react';

export default function LoadingSpinner({ text = 'Analyzing MRI...', subtext = 'Running PyTorch EfficientNet-B3 inference & Grad-CAM pipeline' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
          <Brain className="w-7 h-7 animate-pulse" />
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{text}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{subtext}</p>
      </div>
    </div>
  );
}
