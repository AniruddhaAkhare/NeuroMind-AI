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
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-all shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-wider text-slate-900 font-display">
              NEUROVIA
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
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
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Engine Status & CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-medium">
            <Activity className="w-3 h-3 animate-pulse text-emerald-600" />
            <span>EfficientNet-B3 Engine Online</span>
          </div>

          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-all shadow-sm hover:shadow-md"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Scan MRI</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
