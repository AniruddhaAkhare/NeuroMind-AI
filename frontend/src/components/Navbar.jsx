import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, LayoutDashboard, Search, History, Sparkles, Building2, 
  ShieldCheck, LogOut, ChevronDown, User, Stethoscope, Microscope,
  Activity, Check, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIGS = {
  doctor: {
    label: 'DOCTOR',
    fullName: 'Attending Neurologist',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    badgeBg: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300',
    icon: Stethoscope,
    homePath: '/doctor/dashboard',
    links: [
      { name: 'Workstation', path: '/doctor/dashboard', icon: LayoutDashboard },
      { name: 'Analyze MRI', path: '/analyze', icon: Search },
      { name: 'Scan History', path: '/history', icon: History },
      { name: 'Medical Vault', path: '/vault', icon: ShieldCheck },
      { name: 'Hospitals', path: '/hospitals', icon: Building2 },
      { name: 'AI Assistant', path: '/assistant', icon: Sparkles },
    ]
  },
  radiologist: {
    label: 'RADIOLOGIST',
    fullName: 'Neuroradiologist',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    badgeBg: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
    icon: Microscope,
    homePath: '/radiologist/dashboard',
    links: [
      { name: 'PACS Worklist', path: '/radiologist/dashboard', icon: LayoutDashboard },
      { name: 'Analyze MRI', path: '/analyze', icon: Search },
      { name: 'Scan History', path: '/history', icon: History },
      { name: 'Medical Vault', path: '/vault', icon: ShieldCheck },
      { name: 'AI Assistant', path: '/assistant', icon: Sparkles },
    ]
  },
  patient: {
    label: 'PATIENT',
    fullName: 'Patient & Family',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    icon: User,
    homePath: '/patient/dashboard',
    links: [
      { name: 'My Health Portal', path: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'Upload Scan', path: '/analyze', icon: Search },
      { name: 'My Scans', path: '/history', icon: History },
      { name: 'Medical Vault', path: '/vault', icon: ShieldCheck },
      { name: 'Find Hospitals', path: '/hospitals', icon: Building2 },
      { name: 'Health Assistant', path: '/assistant', icon: Sparkles },
    ]
  },
  admin: {
    label: 'ADMIN',
    fullName: 'System Administrator',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badgeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    icon: ShieldCheck,
    homePath: '/admin/dashboard',
    links: [
      { name: 'Infrastructure', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Clinical Workstation', path: '/doctor/dashboard', icon: Stethoscope },
      { name: 'Analyze MRI', path: '/analyze', icon: Search },
      { name: 'Audit & History', path: '/history', icon: History },
      { name: 'Hospitals', path: '/hospitals', icon: Building2 },
    ]
  },
  lab_technician: {
    label: 'LAB TECH',
    fullName: 'Lab Technician',
    color: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    badgeBg: 'bg-sky-950/70 border-sky-500/40 text-sky-300',
    icon: Activity,
    homePath: '/radiologist/dashboard',
    links: [
      { name: 'MRI Worklist', path: '/radiologist/dashboard', icon: LayoutDashboard },
      { name: 'Scan Ingestion', path: '/analyze', icon: Search },
      { name: 'History Records', path: '/history', icon: History },
      { name: 'Vault Archive', path: '/vault', icon: ShieldCheck },
    ]
  },
  receptionist: {
    label: 'RECEPTION',
    fullName: 'Clinical Receptionist',
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    badgeBg: 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300',
    icon: Building2,
    homePath: '/hospitals',
    links: [
      { name: 'Hospital Directory', path: '/hospitals', icon: Building2 },
      { name: 'Patient Portal', path: '/patient/dashboard', icon: User },
      { name: 'Scan Archive', path: '/history', icon: History },
      { name: 'Medical Vault', path: '/vault', icon: ShieldCheck },
    ]
  }
};

const DEMO_PERSONAS = [
  { role: 'doctor', name: 'Dr. Marcus Vance', email: 'doctor@neuromind.ai' },
  { role: 'radiologist', name: 'Dr. Elena Rostova', email: 'radiologist@neuromind.ai' },
  { role: 'patient', name: 'Arthur Pendelton', email: 'patient@neuromind.ai' },
  { role: 'admin', name: 'System Admin', email: 'admin@neuromind.ai' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roleKey = (user?.role || 'doctor').toLowerCase();
  const roleConfig = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS.doctor;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchPersona = async (persona) => {
    try {
      setSwitching(true);
      await login(persona.email, 'Password123!');
      setDropdownOpen(false);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="border-b border-cyan-500/20 bg-[#050814]/90 backdrop-blur-xl sticky top-0 z-50 transition-colors shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Home Link */}
        <div className="flex items-center gap-4">
          <Link to={roleConfig.homePath} className="flex items-center gap-3 group">
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

          {/* GLOWING ROLE BADGE */}
          <div
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider ${roleConfig.badgeBg}`}
            style={{ boxShadow: `0 0 12px ${roleConfig.glowColor}` }}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: roleConfig.color }}
            />
            <span>{roleConfig.label}</span>
          </div>
        </div>

        {/* Dynamic Navigation Links Tailored to Active Role */}
        <nav className="hidden lg:flex items-center gap-1">
          {roleConfig.links.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: User Status, Role Switcher & Logout */}
        <div className="flex items-center gap-3">
          {/* Quick CTA to analyze scan */}
          <Link
            to="/analyze"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-[0_0_18px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Scan MRI</span>
          </Link>

          {/* User Account & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all"
            >
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: roleConfig.color }}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight max-w-[130px] truncate">
                  {user?.full_name || 'Active Session'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono capitalize">
                  {roleConfig.label}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* DROPDOWN MENU */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl shadow-black/80 py-2 z-50 text-slate-200 divide-y divide-slate-800">
                {/* User info header */}
                <div className="px-4 py-3">
                  <div className="text-xs font-bold text-white">{user?.full_name || 'Authenticated User'}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono font-bold" style={{ color: roleConfig.color }}>
                    Role: {roleConfig.fullName}
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="lg:hidden py-1">
                  {roleConfig.links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-slate-800 text-slate-300"
                    >
                      <link.icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Demo Switcher Quick Menu */}
                <div className="px-3 py-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 font-mono">
                    ⚡ Switch Role Persona (Demo):
                  </div>
                  <div className="space-y-1">
                    {DEMO_PERSONAS.map((persona) => {
                      const isCurrent = user?.email === persona.email;
                      return (
                        <button
                          key={persona.role}
                          onClick={() => handleSwitchPersona(persona)}
                          disabled={switching || isCurrent}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isCurrent
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{persona.role}</span>
                            <span className="text-[10px] text-slate-400">({persona.name.split(' ')[0]})</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
