import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Brain, History, Info, LayoutDashboard, Search, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Workstation', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze MRI', path: '/analyze', icon: Search },
    { name: 'Audit Log', path: '/history', icon: History },
    { name: 'Clinical Assistant', path: '/assistant', icon: Sparkles },
    { name: 'Hospitals', path: '/hospitals', icon: Info },
  ];

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black tracking-wider text-slate-900 font-mono">
              NEUROVIA
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
              CLINICAL AI
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <Activity className="w-3 h-3 animate-pulse text-emerald-600" />
            <span>EfficientNet-B3 Engine Online</span>
          </div>

          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <span>Scan MRI</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
