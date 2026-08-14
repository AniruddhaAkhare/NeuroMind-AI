import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Search, History, Info, BrainCircuit, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Scan', path: '/analyze', icon: Search },
    { name: 'History Records', path: '/history', icon: History },
    { name: 'About & Model', path: '/about', icon: Info },
  ];

  return (
    <aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-900/50 p-4 space-y-6">
      <div>
        <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </h3>
        <div className="mt-3 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>Model Details</span>
          </div>
          <p className="text-slate-400">Architectural backbone:</p>
          <div className="font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-800 text-cyan-300">
            EfficientNet-B3
          </div>
          <p className="text-[11px] text-slate-400">
            Grad-CAM Heatmap saliency mapping enabled for visual interpretation.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>For academic research and clinical decision support purposes.</span>
        </div>
      </div>
    </aside>
  );
}
