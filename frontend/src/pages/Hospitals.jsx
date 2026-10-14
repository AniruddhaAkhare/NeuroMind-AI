import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Star,
  Calendar,
  Search,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  ExternalLink,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Loader2,
  Compass,
  Zap,
  Activity,
  HeartPulse,
} from "lucide-react";
import { searchHospitals, directBookHospital } from "../services/api";
import HospitalMap from "../components/HospitalMap";

const QUICK_CITIES = [
  "San Francisco",
  "Chicago",
  "Boston",
  "New York",
  "London",
  "Mumbai",
];

export default function Hospitals() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL flags
  const initialHighDementia =
    searchParams.get("high_dementia") === "true" ||
    searchParams.get("autoBooked") === "true";

  const [isHighDementia, setIsHighDementia] = useState(initialHighDementia);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "San Francisco");
  const [activeQuery, setActiveQuery] = useState(searchParams.get("q") || "San Francisco");
  const [coords, setCoords] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [resolvedLocation, setResolvedLocation] = useState(null);
  const [autoBookedAppointment, setAutoBookedAppointment] = useState(null);

  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Booking Modal State
  const [bookingModalClinic, setBookingModalClinic] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("10:00 AM");

  // Fetch Hospitals Effect
  useEffect(() => {
    let isCancelled = false;

    async function loadHospitals() {
      try {
        setLoading(true);
        setError(null);

        const params = {
          high_dementia: isHighDementia,
        };

        if (coords) {
          params.lat = coords.lat;
          params.lon = coords.lon;
        } else if (activeQuery) {
          params.q = activeQuery;
        }

        const res = await searchHospitals(params);
        if (isCancelled) return;

        if (res && res.success) {
          setHospitals(res.hospitals || []);
          setResolvedLocation(res.resolved_location || null);
          setAutoBookedAppointment(res.auto_booked_appointment || null);
        } else {
          setError("Failed to load real hospitals. Please try another city.");
        }
      } catch (err) {
        if (isCancelled) return;
        console.error("Hospital search error:", err);
        setError("Error connecting to real hospital directory. Retrying...");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadHospitals();

    return () => {
      isCancelled = true;
    };
  }, [activeQuery, coords, isHighDementia]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setCoords(null); // Clear GPS coords when searching by text
    setActiveQuery(searchInput.trim());
  };

  // Handle Current GPS Location
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setSearchInput("My Current GPS Location");
        setActiveQuery("");
      },
      (err) => {
        console.warn("GPS error:", err);
        alert("Could not access GPS location. Falling back to city search.");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Filter hospitals by facility type
  const filteredHospitals = hospitals.filter((h) => {
    if (selectedType === "ALL") return true;
    return h.type === selectedType;
  });

  // Handle Direct Booking Submission
  const handleConfirmDirectBooking = async (e) => {
    e.preventDefault();
    if (!bookingModalClinic) return;

    try {
      setBookingSubmitting(true);
      const payload = {
        hospital_name: bookingModalClinic.name,
        hospital_address: bookingModalClinic.address,
        hospital_phone: bookingModalClinic.phone,
        doctor_name: bookingModalClinic.doctor_name || bookingModalClinic.doctor,
        appointment_date: appointmentDate || undefined,
        appointment_time: preferredSlot,
        patient_name: patientName || "Patient",
        contact_phone: contactPhone || "",
        reason: "Clinical Neuro-Cognitive Consultation & 3T MRI Review",
      };

      const res = await directBookHospital(payload);
      if (res && res.success) {
        setBookingSuccess(res.booking);
      } else {
        alert("Booking could not be confirmed. Please try again.");
      }
    } catch (err) {
      console.error("Direct booking error:", err);
      alert("Failed to submit direct booking: " + (err.response?.data?.error || err.message));
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ============================================================
          SECTION 1: HERO HEADER
      ============================================================ */}
      <div className="bento-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 text-cyan-300 text-xs font-semibold border border-cyan-500/30 font-mono">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-Time Geospatial Hospital Network</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Find Certified Dementia Clinics & Specialists
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl font-mono leading-relaxed">
            Directly discover verified memory institutes, accredited 3T volumetric MRI diagnostic centers, and board-certified behavioral neurologists with real-time GPS routing.
          </p>
        </div>

        {/* High Dementia Triage Toggle Button */}
        <div className="relative z-10 flex flex-col items-start sm:items-end gap-2 shrink-0">
          <button
            onClick={() => {
              const nextState = !isHighDementia;
              setIsHighDementia(nextState);
              if (nextState) {
                setSearchParams({ high_dementia: "true", autoBooked: "true" });
              } else {
                setSearchParams({});
              }
            }}
            className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-2.5 border shadow-lg cursor-pointer ${
              isHighDementia
                ? "bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                : "bg-slate-900/80 text-slate-400 hover:text-white border-white/10 hover:border-cyan-500/40"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHighDementia ? "bg-rose-500 animate-ping" : "bg-slate-600"
              }`}
            />
            <span>
              {isHighDementia
                ? "🚨 High-Dementia Emergency Triage: ACTIVE"
                : "Toggle High-Dementia Emergency Mode"}
            </span>
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            {isHighDementia
              ? "Direct hospital found & priority appointment auto-booked"
              : "Standard radius search mode"}
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION 2: HIGH-DEMENTIA DIRECT HOSPITAL FOUND & APPOINTMENT BOOKED
      ============================================================ */}
      {isHighDementia && autoBookedAppointment && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/90 via-red-950/70 to-slate-950 border-2 border-rose-500/70 shadow-[0_0_40px_rgba(244,63,94,0.35)] space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-500/30 pb-5">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
                <HeartPulse className="w-7 h-7 animate-pulse text-rose-400" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-xs font-bold uppercase font-mono tracking-wide border border-rose-500/40">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                  <span>Emergency Fast-Track Auto-Triage Activated</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  Direct Specialized Hospital Found & Priority Appointment Booked
                </h2>
                <p className="text-xs text-rose-200/90 max-w-3xl leading-relaxed">
                  Due to critical neurocognitive risk, the clinical system has automatically reserved a guaranteed priority evaluation slot with the lead cognitive neurologist at the closest certified memory institute.
                </p>
              </div>
            </div>

            <div className="text-left md:text-right font-mono bg-black/40 p-3 rounded-2xl border border-rose-500/30 shrink-0">
              <div className="text-[10px] text-rose-300 uppercase tracking-wider font-bold">
                Confirmation Token
              </div>
              <div className="text-lg font-black text-white tracking-widest text-cyan-300">
                {autoBookedAppointment.confirmation_code}
              </div>
              <span className="inline-block px-2 py-0.5 mt-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                ✓ {autoBookedAppointment.status}
              </span>
            </div>
          </div>

          {/* Auto-Booked Hospital & Slot Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Assigned Hospital & Clinic
              </span>
              <div className="font-extrabold text-white text-base font-display">
                {autoBookedAppointment.hospital_name}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{autoBookedAppointment.hospital_address}</span>
              </div>
              <div className="text-xs font-mono text-cyan-400 font-semibold pt-1">
                📍 {autoBookedAppointment.distance_km} km ({autoBookedAppointment.distance_miles} miles) from you
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                Reserved Slot & Specialist
              </span>
              <div className="font-bold text-amber-300 text-sm">
                {autoBookedAppointment.appointment_date_formatted || autoBookedAppointment.appointment_date}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{autoBookedAppointment.appointment_time}</span>
              </div>
              <div className="text-xs text-slate-300 truncate pt-1">
                👨‍⚕️ <strong>{autoBookedAppointment.assigned_doctor}</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/30 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Direct Clinical Triage Pass
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Hospital neurological team notified. Bring your NeuroMind AI MRI report upon arrival.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={autoBookedAppointment.directions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-xs shadow-md transition-all text-center"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS Directions</span>
                </a>

                {autoBookedAppointment.hospital_phone && (
                  <a
                    href={`tel:${autoBookedAppointment.hospital_phone}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs border border-white/10"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span>Call Hotline</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 3: LOCATION SEARCH BAR & GPS EXPLORER
      ============================================================ */}
      <div className="bento-card p-5 sm:p-6 rounded-3xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Type any city, area, or address (e.g., Chicago, Mumbai, Boston, London, San Francisco)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Hospitals</span>
            </button>

            <button
              type="button"
              onClick={handleUseGps}
              disabled={loading}
              title="Use current GPS device coordinates"
              className="px-4 py-3 rounded-2xl bento-glass hover:bg-white/10 text-cyan-300 font-bold text-xs font-mono transition-all border border-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">My GPS Location</span>
            </button>
          </div>
        </form>

        {/* Quick City Tags & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="text-slate-400 font-semibold mr-1">Quick Cities:</span>
            {QUICK_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setCoords(null);
                  setSearchInput(city);
                  setActiveQuery(city);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs transition-colors ${
                  activeQuery.toLowerCase() === city.toLowerCase()
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5"
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Facility Type Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Facilities" },
              { id: "MEMORY_CLINIC", label: "Memory Clinics" },
              { id: "UNIVERSITY_HOSPITAL", label: "University Hospitals" },
              { id: "DIAGNOSTIC_CENTER", label: "3T MRI Centers" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                  selectedType === t.id
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 4: REAL INTERACTIVE MAP VIEW
      ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
            <h2 className="text-base font-bold text-white font-display">
              Live Geospatial Map View
            </h2>
          </div>
          {resolvedLocation && (
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-full truncate max-w-md">
              📍 {resolvedLocation.display_name}
            </span>
          )}
        </div>

        <HospitalMap
          userLocation={resolvedLocation}
          hospitals={filteredHospitals}
          selectedHospital={selectedHospital}
          onSelectHospital={(h) => setSelectedHospital(h)}
          isHighDementia={isHighDementia}
          autoBooked={autoBookedAppointment}
        />
      </div>

      {/* ============================================================
          SECTION 5: REAL HOSPITALS DIRECTORY LIST CARDS
      ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-display">
              Verified Real Hospitals & Memory Centers ({filteredHospitals.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Sorted by live physical distance
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-3xl bento-card space-y-3">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-mono text-slate-300">
              Querying verified real hospitals and calculating haversine distances...
            </p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bento-card space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Hospitals Found in this Radius</h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
              Try searching a major metropolitan area (e.g. San Francisco, Chicago, Boston, London, Mumbai) or expand your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHospitals.map((hosp, idx) => {
              const isAutoBooked =
                autoBookedAppointment &&
                (autoBookedAppointment.hospital_name === hosp.name || idx === 0);

              return (
                <div
                  key={hosp.id || idx}
                  className={`bento-card p-6 rounded-3xl flex flex-col justify-between space-y-5 transition-all duration-300 relative overflow-hidden group ${
                    isAutoBooked
                      ? "border-2 border-rose-500/70 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.2)]"
                      : "hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  }`}
                >
                  {isAutoBooked && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 to-red-600 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md">
                      🚨 AUTO-BOOKED PRIORITY
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center border border-cyan-500/30">
                            {idx + 1}
                          </span>
                          <h3 className="font-bold text-white text-base font-display group-hover:text-cyan-300 transition-colors">
                            {hosp.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{hosp.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{hosp.rating || 4.9}</span>
                      </div>
                    </div>

                    {/* Distance & Doctor Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase">Live Distance</span>
                        <div className="text-cyan-300 font-bold">
                          {hosp.distance_km} km ({hosp.distance_miles || (hosp.distance_km * 0.62).toFixed(1)} mi)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase">Lead Neurologist</span>
                        <div className="text-slate-200 font-semibold truncate">
                          {hosp.doctor_name || "Specialist On Duty"}
                        </div>
                      </div>
                    </div>

                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(hosp.specialties || []).map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-cyan-950/40 text-cyan-300 text-[11px] font-mono border border-cyan-500/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        Consultation
                      </span>
                      <span className="text-sm font-extrabold text-white font-mono">
                        {hosp.consultation_fee || "$175"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={hosp.directions_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bento-glass hover:bg-white/10 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30 transition-colors"
                        title="Open Google Maps Route"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Route</span>
                      </a>

                      <button
                        onClick={() => {
                          setBookingSuccess(null);
                          setBookingModalClinic(hosp);
                        }}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
                          isAutoBooked
                            ? "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Consultation</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 6: DIRECT CLINICAL BOOKING MODAL
      ============================================================ */}
      {bookingModalClinic && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bento-card bg-[#090d16] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-cyan-500/30 space-y-5 animate-in zoom-in-95">
            {bookingSuccess ? (
              // Confirmed Receipt View
              <div className="space-y-5 text-center py-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                    Appointment Confirmed
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">
                    {bookingSuccess.hospital_name}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Confirmation Code: <strong className="text-cyan-300">{bookingSuccess.confirmation_code}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 text-left text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white font-bold">{bookingSuccess.appointment_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="text-cyan-300 font-bold">{bookingSuccess.appointment_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="text-slate-200">{bookingSuccess.doctor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="text-slate-200">{bookingSuccess.patient_name}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2.5 rounded-xl bento-glass text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Booking Pass</span>
                  </button>
                  <button
                    onClick={() => {
                      setBookingModalClinic(null);
                      setBookingSuccess(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              // Booking Form View
              <form onSubmit={handleConfirmDirectBooking} className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base font-display">
                      Book Clinical Consultation
                    </h3>
                    <p className="text-xs text-cyan-400 font-mono truncate max-w-xs">
                      {bookingModalClinic.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingModalClinic(null)}
                    className="text-slate-400 hover:text-white text-xl font-bold font-mono"
                  >
                    &times;
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Facility Address: </span>
                    <span className="text-slate-200">{bookingModalClinic.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Physician: </span>
                    <span className="text-slate-200 font-semibold">{bookingModalClinic.doctor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Direct Contact: </span>
                    <span className="text-cyan-300">{bookingModalClinic.phone}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Contact Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Time Slot
                      </label>
                      <select
                        value={preferredSlot}
                        onChange={(e) => setPreferredSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="09:30 AM (Priority Morning)">09:30 AM (Morning)</option>
                        <option value="11:00 AM (Cognitive Evaluation)">11:00 AM (Mid-day)</option>
                        <option value="02:30 PM (3T MRI Review)">02:30 PM (Afternoon)</option>
                        <option value="04:30 PM (Neurology Consult)">04:30 PM (Late Afternoon)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {bookingSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Confirm 1-Click Consultation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingModalClinic(null)}
                    className="py-3 px-4 rounded-xl bento-glass hover:bg-white/10 text-slate-300 font-mono text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
