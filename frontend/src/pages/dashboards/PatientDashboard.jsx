import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, Brain, Calendar, FileText, CheckCircle2, 
  ArrowUpRight, ShieldCheck, Sparkles, Clock, AlertCircle, 
  PhoneCall, Leaf, Sun, Moon, Plus, Eye
} from "lucide-react";
import { getPredictionHistory } from "../../services/api";

export default function PatientDashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState({
    morningLight: true,
    medication: true,
    memoryBoard: false,
    ayurvedicHerb: false,
    eveningFootMassage: false,
  });

  useEffect(() => {
    async function loadPatientScans() {
      try {
        const res = await getPredictionHistory({ per_page: 5 });
        if (res.success && res.records) {
          setScans(res.records);
        }
      } catch (err) {
        console.error("Failed to load patient records:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPatientScans();
  }, []);

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const latestScan = scans[0] || null;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-teal-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-blue-600" />
            <span>Patient & Family Health Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome, Robert Miller
          </h1>
          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            Personal cognitive health journey, daily caregiver safety protocols, and AI-assisted brain imaging insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Scan</span>
          </Link>
          <Link
            to="/hospitals"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all border border-slate-200"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Book Doctor</span>
          </Link>
        </div>
      </div>

      {/* Latest Evaluation Summary Card */}
      {latestScan && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Latest MRI Brain Analysis</h3>
                <p className="text-xs text-slate-400">
                  Evaluated on {new Date(latestScan.created_at).toLocaleDateString()} • {latestScan.image_filename}
                </p>
              </div>
            </div>

            <Link
              to={`/result/${latestScan.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors self-start sm:self-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Explore Interactive 3D Brain & Report</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cognitive State</div>
              <div className="text-lg font-extrabold text-slate-900">{latestScan.predicted_class}</div>
              <p className="text-xs text-slate-500">AI confidence: {(latestScan.confidence * 100).toFixed(1)}%</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Clinical Risk Tier</div>
              <div className="text-lg font-extrabold text-blue-700">{latestScan.risk_level || "MONITORED"}</div>
              <p className="text-xs text-slate-500">Regular check-ups advised</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Primary Neurologist</div>
              <div className="text-lg font-extrabold text-slate-900">Dr. Sarah Jenkins</div>
              <p className="text-xs text-slate-500">NeuroMind Clinic</p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Daily Caregiver Action Plan & Ayurvedic Care */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Caregiver Protocols */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Today's Caregiver & Safety Routine</h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              2 / 5 Complete
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div 
              onClick={() => toggleCheck('morningLight')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.morningLight ? "bg-emerald-50/60 border-emerald-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className={`w-4 h-4 ${checklist.morningLight ? "text-emerald-600" : "text-amber-500"}`} />
                <span className="text-sm font-semibold">Morning natural sunlight walk (20 mins)</span>
              </div>
              <input type="checkbox" checked={checklist.morningLight} readOnly className="w-4 h-4 accent-emerald-600 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('medication')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.medication ? "bg-emerald-50/60 border-emerald-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-4 h-4 ${checklist.medication ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-sm font-semibold">Morning prescription & hydration intake</span>
              </div>
              <input type="checkbox" checked={checklist.medication} readOnly className="w-4 h-4 accent-emerald-600 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('memoryBoard')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.memoryBoard ? "bg-emerald-50/60 border-emerald-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className={`w-4 h-4 ${checklist.memoryBoard ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="text-sm font-semibold">Daily date, time & family memory board review</span>
              </div>
              <input type="checkbox" checked={checklist.memoryBoard} readOnly className="w-4 h-4 accent-emerald-600 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('ayurvedicHerb')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.ayurvedicHerb ? "bg-emerald-50/60 border-emerald-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Leaf className={`w-4 h-4 ${checklist.ayurvedicHerb ? "text-emerald-600" : "text-emerald-500"}`} />
                <span className="text-sm font-semibold">Brahmi & warm golden turmeric milk (4:00 PM)</span>
              </div>
              <input type="checkbox" checked={checklist.ayurvedicHerb} readOnly className="w-4 h-4 accent-emerald-600 rounded" />
            </div>

            <div 
              onClick={() => toggleCheck('eveningFootMassage')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                checklist.eveningFootMassage ? "bg-emerald-50/60 border-emerald-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className={`w-4 h-4 ${checklist.eveningFootMassage ? "text-emerald-600" : "text-indigo-400"}`} />
                <span className="text-sm font-semibold">Calming evening foot massage (Padabhyanga)</span>
              </div>
              <input type="checkbox" checked={checklist.eveningFootMassage} readOnly className="w-4 h-4 accent-emerald-600 rounded" />
            </div>
          </div>
        </div>

        {/* Holistic Ayurvedic Supportive Home Care */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-base">Ayurvedic Supportive Regimen</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">Home Care</span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100/80 space-y-1">
              <div className="text-sm font-bold text-emerald-900">Medhya Rasayana Herbs</div>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                <strong>Brahmi</strong> (Bacopa monnieri) and <strong>Shankhpushpi</strong> traditionally nourish cognitive retention, soothe mental fatigue, and support synaptic resilience.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100/80 space-y-1">
              <div className="text-sm font-bold text-amber-900">Neuro-Protective Nutrition (Pathya)</div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Include soaked almonds, raw walnuts, and pure A2 cow's ghee. Avoid refined sugars, ultra-processed items, and heavy evening meals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/80 space-y-1">
              <div className="text-sm font-bold text-blue-900">Vagal Calm & Shiroabhyanga</div>
              <p className="text-xs text-blue-800/90 leading-relaxed">
                Gentle scalp massage with warm Brahmi taila, paired with 10 minutes of gentle Bhramari Pranayama to alleviate restlessness.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
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
