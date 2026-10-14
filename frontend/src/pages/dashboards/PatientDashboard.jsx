import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, Brain, Calendar, FileText, CheckCircle2, 
  ArrowUpRight, ShieldCheck, Sparkles, Clock, AlertCircle, 
  PhoneCall, Leaf, Sun, Moon, Plus, Eye, UserCheck, Shield
} from "lucide-react";
import { getPredictionHistory, getMyPatientProfile } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [scans, setScans] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({
    morningLight: true,
    medication: true,
    memoryBoard: false,
    ayurvedicHerb: false,
    eveningFootMassage: false,
  });

  useEffect(() => {
    async function loadPatientData() {
      try {
        setLoading(true);
        const [historyRes, profileRes] = await Promise.allSettled([
          getPredictionHistory({ per_page: 5 }),
          getMyPatientProfile()
        ]);

        if (historyRes.status === "fulfilled" && historyRes.value?.success) {
          setScans(historyRes.value.records || []);
        }
        if (profileRes.status === "fulfilled" && profileRes.value?.success) {
          setProfile(profileRes.value.patient || null);
        }
      } catch (err) {
        console.error("Failed to load patient records:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientData();
  }, []);

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const latestScan = scans[0] || null;
  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#0f172a] to-blue-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-500/40 font-mono shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Heart className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Patient & Family Health Portal • Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Welcome, {user?.full_name || profile?.user?.full_name || "Arthur Pendelton"}
          </h1>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Your personalized cognitive health journey, caregiver safety routines, and AI-assisted axial brain MRI tracking.
          </p>

          {/* Quick Demographics Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              Role: Patient
            </span>
            {profile?.blood_group && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                Blood: {profile.blood_group}
              </span>
            )}
            {profile?.gender && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
                {profile.gender}
              </span>
            )}
            {user?.email && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-400 font-mono truncate max-w-[220px]">
                {user.email}
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Scan</span>
          </Link>
          <Link
            to="/hospitals"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Book Doctor</span>
          </Link>
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
          >
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Medical Vault</span>
          </Link>
        </div>
      </div>

      {/* Latest Evaluation Summary Card */}
      {latestScan ? (
        <div className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/70 text-cyan-400 border border-cyan-500/30">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Latest MRI Brain Analysis</h3>
                <p className="text-xs text-slate-400">
                  Evaluated on {new Date(latestScan.created_at).toLocaleDateString()} • {latestScan.image_filename}
                </p>
              </div>
            </div>

            <Link
              to={`/result/${latestScan.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] self-start sm:self-auto"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Explore Interactive 3D Brain & Report</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Cognitive State</div>
              <div className="text-lg font-extrabold text-white">{latestScan.predicted_class}</div>
              <p className="text-xs text-slate-400">AI confidence: {(latestScan.confidence * 100).toFixed(1)}%</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Clinical Risk Tier</div>
              <div className="text-lg font-extrabold text-emerald-400">{latestScan.risk_level || "MONITORED"}</div>
              <p className="text-xs text-slate-400">Regular check-ups advised</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Primary Neurologist</div>
              <div className="text-lg font-extrabold text-white">Dr. Marcus Vance</div>
              <p className="text-xs text-slate-400">NeuroMind Clinic</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">No MRI Scans Evaluated Yet</h3>
              <p className="text-xs text-slate-400 max-w-lg mt-0.5">
                Upload your axial brain MRI scan to receive real-time 4-class dementia staging, Grad-CAM interpretability, and 6-pillar care protocols.
              </p>
            </div>
          </div>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Scan</span>
          </Link>
        </div>
      )}

      {/* Two Column Layout: Daily Caregiver Action Plan & Ayurvedic Care */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Caregiver Protocols */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-base">Today's Caregiver & Safety Routine</h2>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-500/30 font-mono">
              {completedCount} / 5 Complete
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div 
              onClick={() => toggleCheck('morningLight')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.morningLight ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200" : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className={`w-4 h-4 ${checklist.morningLight ? "text-emerald-400" : "text-amber-400"}`} />
                <span className="text-sm font-semibold">Morning natural sunlight walk (20 mins)</span>
              </div>
              <input type="checkbox" checked={checklist.morningLight} readOnly className="w-4 h-4 accent-emerald-500 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('medication')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.medication ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200" : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-4 h-4 ${checklist.medication ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="text-sm font-semibold">Morning prescription & hydration intake</span>
              </div>
              <input type="checkbox" checked={checklist.medication} readOnly className="w-4 h-4 accent-emerald-500 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('memoryBoard')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.memoryBoard ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200" : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className={`w-4 h-4 ${checklist.memoryBoard ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="text-sm font-semibold">Daily date, time & family memory board review</span>
              </div>
              <input type="checkbox" checked={checklist.memoryBoard} readOnly className="w-4 h-4 accent-emerald-500 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('ayurvedicHerb')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.ayurvedicHerb ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200" : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <Leaf className={`w-4 h-4 ${checklist.ayurvedicHerb ? "text-emerald-400" : "text-emerald-500"}`} />
                <span className="text-sm font-semibold">Brahmi & warm golden turmeric milk (4:00 PM)</span>
              </div>
              <input type="checkbox" checked={checklist.ayurvedicHerb} readOnly className="w-4 h-4 accent-emerald-500 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('eveningFootMassage')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.eveningFootMassage ? "bg-emerald-950/30 border-emerald-500/40 text-slate-200" : "bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className={`w-4 h-4 ${checklist.eveningFootMassage ? "text-emerald-400" : "text-indigo-400"}`} />
                <span className="text-sm font-semibold">Calming evening foot massage (Padabhyanga)</span>
              </div>
              <input type="checkbox" checked={checklist.eveningFootMassage} readOnly className="w-4 h-4 accent-emerald-500 rounded" />
            </div>
          </div>
        </div>

        {/* Holistic Ayurvedic Supportive Home Care */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white text-base">Ayurvedic Supportive Regimen</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">Medhya Rasayana</span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <div className="text-sm font-bold text-emerald-300">Medhya Rasayana Botanical Tonics</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Brahmi</strong> (<em>Bacopa monnieri</em>) and <strong>Shankhpushpi</strong> traditionally nourish cognitive retention, soothe mental fatigue, and support synaptic resilience.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
              <div className="text-sm font-bold text-amber-300">Neuro-Protective Nutrition (Pathya)</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Include soaked almonds, raw walnuts, and pure A2 cow's ghee. Avoid refined sugars, ultra-processed items, and heavy evening meals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
              <div className="text-sm font-bold text-cyan-300">Vagal Calm & Shiroabhyanga</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gentle scalp massage with warm Brahmi taila, paired with 10 minutes of gentle Bhramari Pranayama to alleviate restlessness.
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Ayurvedic measures are complementary supportive practices for cognitive vitality and do not replace neurologist-directed prescriptions.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
