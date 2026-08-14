import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-3 my-6">
      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="font-semibold text-amber-300">Medical Research & Academic Disclaimer</h4>
        <p className="text-amber-200/90 text-xs sm:text-sm leading-relaxed">
          This system uses an EfficientNet-B3 deep learning model and Grad-CAM interpretability algorithms strictly for academic research and initial clinical decision assistance. All outputs must be validated by certified radiologists and clinical healthcare professionals before informing diagnosis or treatment.
        </p>
      </div>
    </div>
  );
}
