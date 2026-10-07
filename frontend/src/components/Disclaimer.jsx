import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
          Institutional Medical Research & Clinical Decision-Support Disclaimer
        </h4>
        <p className="text-amber-900/90 text-xs leading-relaxed">
          This system utilizes an EfficientNet-B3 deep learning neural network and Grad-CAM saliency mapping strictly as an auxiliary diagnostic tool for research and clinical assistance. All predictive classifications and AI interpretations must be independently reviewed and corroborated by a board-certified neurologist or radiologist prior to clinical intervention.
        </p>
      </div>
    </div>
  );
}
