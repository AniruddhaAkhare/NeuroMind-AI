import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, ShieldCheck, Eye, Database, Cpu, CheckCircle2 } from 'lucide-react';
import Disclaimer from '../components/Disclaimer';

export default function LandingPage() {
  const features = [
    {
      title: 'EfficientNet-B3 Classifier',
      desc: 'Leverages compound scaling architecture to accurately categorize MRI scans into 4 cognitive stages.',
      icon: Cpu,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Grad-CAM Explainability',
      desc: 'Visual saliency maps highlight cortical shrinkage and ventricular expansion influencing predictions.',
      icon: Eye,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'PostgreSQL Audit History',
      desc: 'Persistent relational tracking of diagnostic logs, confidence scores, and raw/processed scan paths.',
      icon: Database,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  const classes = [
    { name: 'NonDemented', label: 'Normal Cognitive Baseline', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { name: 'VeryMildDemented', label: 'Very Mild Cognitive Impairment', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { name: 'MildDemented', label: 'Mild Alzheimer’s Stage', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { name: 'ModerateDemented', label: 'Moderate Alzheimer’s Stage', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  ];

  return (
    <div className="space-y-12 py-4">
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Brain className="w-4 h-4 text-cyan-400" />
          <span>Explainable AI in Medical Neuroimaging</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Alzheimer’s Disease MRI Classification & Visual Interpretability
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Deep learning diagnostic assistance using EfficientNet-B3 PyTorch architecture paired with Grad-CAM gradient-weighted class activation mapping for clinical transparency.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>Upload & Analyze MRI</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold border border-slate-700 transition-all"
          >
            <span>View Analytics Dashboard</span>
          </Link>
        </div>
      </section>

      <Disclaimer />

      <section className="grid md:grid-cols-3 gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className={`p-3 rounded-xl border w-fit ${item.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Recognized Diagnostic Categories</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${c.badge}`}>
                {c.name}
              </span>
              <p className="text-xs text-slate-300 font-medium">{c.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
