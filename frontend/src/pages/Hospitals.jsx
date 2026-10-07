import React, { useState } from "react";
import { 
  Building2, MapPin, Phone, Star, Calendar, 
  Search, ShieldCheck, Stethoscope, ArrowRight, ExternalLink 
} from "lucide-react";

export default function Hospitals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [bookedClinic, setBookedClinic] = useState(null);

  const hospitalsData = [
    {
      id: 1,
      name: "Mayo Memorial Neuro-Cognitive Institute",
      type: "MEMORY_CLINIC",
      address: "100 Medical Parkway, Rochester, MN",
      phone: "+1 (555) 234-5678",
      rating: 4.9,
      reviews: 320,
      specialties: ["Alzheimer's Disease", "Tau Biomarkers", "Volumetric 3D MRI", "Memory Rehabilitation"],
      distance: "2.4 miles",
      doctor: "Dr. Gregory Vance, Chief Neurologist",
      consultationFee: "$180",
    },
    {
      id: 2,
      name: "Johns Hopkins Memory & Aging Center",
      type: "UNIVERSITY_HOSPITAL",
      address: "600 N Wolfe St, Baltimore, MD",
      phone: "+1 (555) 876-5432",
      rating: 4.8,
      reviews: 410,
      specialties: ["Early Onset Dementia", "Cognitive Neurology", "Clinical Trials", "Ayurvedic Integrative Care"],
      distance: "5.1 miles",
      doctor: "Dr. Elena Rostova, MD",
      consultationFee: "$220",
    },
    {
      id: 3,
      name: "Cedars-Sinai Advanced Neuro-Imaging Center",
      type: "DIAGNOSTIC_CENTER",
      address: "8700 Beverly Blvd, Los Angeles, CA",
      phone: "+1 (555) 345-6789",
      rating: 4.9,
      reviews: 280,
      specialties: ["3T Axial MRI", "Amyloid PET Scans", "Grad-CAM Review", "CSF Biomarker Panel"],
      distance: "8.3 miles",
      doctor: "Dr. Marcus Chen, Lead Radiologist",
      consultationFee: "$150",
    },
    {
      id: 4,
      name: "Cleveland Clinic Lou Ruvo Center for Brain Health",
      type: "MEMORY_CLINIC",
      address: "888 W Bonneville Ave, Las Vegas, NV",
      phone: "+1 (555) 987-6543",
      rating: 4.7,
      reviews: 195,
      specialties: ["Caregiver Safety Programs", "BPSD Management", "Holistic Neuro-Vitality", "MMSE/MoCA Scoring"],
      distance: "12.0 miles",
      doctor: "Dr. Rachel Adams, MD",
      consultationFee: "$175",
    },
  ];

  const filtered = hospitalsData.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "ALL" || h.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Building2 className="w-3.5 h-3.5" />
            <span>Specialist Hospital & Memory Clinic Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Find Certified Dementia Clinics & Specialists
          </h1>
          <p className="text-sm text-slate-500">
            Discover accredited memory institutes, high-resolution MRI diagnostic labs, and behavioral neurologists.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by clinic name, city, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "ALL", label: "All Facilities" },
            { id: "MEMORY_CLINIC", label: "Memory Clinics" },
            { id: "UNIVERSITY_HOSPITAL", label: "University Hospitals" },
            { id: "DIAGNOSTIC_CENTER", label: "Imaging Centers" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === t.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{clinic.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{clinic.address} • <strong>{clinic.distance}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{clinic.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <span>Primary Neurologist: <strong>{clinic.doctor}</strong></span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {clinic.specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Consultation Fee</span>
                <span className="text-base font-extrabold text-slate-900">{clinic.consultationFee}</span>
              </div>

              <button
                onClick={() => setBookedClinic(clinic)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm shadow-blue-600/20"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Confirmation Modal */}
      {bookedClinic && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Book Clinical Consultation</h3>
              <button
                onClick={() => setBookedClinic(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-slate-600">
                You are scheduling an in-person or telemedicine evaluation with <strong>{bookedClinic.name}</strong>.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div><strong>Lead Neurologist:</strong> {bookedClinic.doctor}</div>
                <div><strong>Direct Contact:</strong> {bookedClinic.phone}</div>
                <div><strong>Consultation Fee:</strong> {bookedClinic.consultationFee}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Consultation booked successfully with ${bookedClinic.name}! Confirmation sent to your registered email.`);
                  setBookedClinic(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
              >
                Confirm Appointment
              </button>
              <button
                onClick={() => setBookedClinic(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
