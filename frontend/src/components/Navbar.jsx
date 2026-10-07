import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Brain, History, Info, LayoutDashboard, Search, Sparkles, Building2, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Workstation', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Analyze MRI', path: '/analyze', icon: Search },
    { name: 'Audit Log', path: '/history', icon: History },
    { name: 'Clinical Assistant', path: '/assistant', icon: Sparkles },
    { name: 'Hospitals', path: '/hospitals', icon: Building2 },
    { name: 'Medical Vault', path: '/vault', icon: ShieldCheck },
  ];

  return (
    <header className="border-b border-cyan-500/20 bg-[#050814]/85 backdrop-blur-xl sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-wider text-white font-display">
              NEUROVIA
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
              CLINICAL AI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/doctor/dashboard' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Engine Status & CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
            <span>EfficientNet-B3 Engine Online</span>
          </div>

          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Scan MRI</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
