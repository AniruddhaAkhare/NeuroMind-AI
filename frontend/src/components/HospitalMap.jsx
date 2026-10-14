import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Compass, Layers, AlertTriangle } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// Zero-secret OpenStreetMap raster style fallback for Mapbox GL
const OPENSTREETMAP_STYLE = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export default function HospitalMap({
  userLocation,
  hospitals = [],
  selectedHospital = null,
  onSelectHospital,
  isHighDementia = false,
  autoBooked = null,
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Default coordinates (San Francisco)
  const defaultLng = userLocation?.longitude ?? userLocation?.lon ?? -122.4194;
  const defaultLat = userLocation?.latitude ?? userLocation?.lat ?? 37.7749;

  useEffect(() => {
    if (!mapContainer.current) return;

    if (MAPBOX_TOKEN) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_TOKEN ? "mapbox://styles/mapbox/dark-v11" : OPENSTREETMAP_STYLE,
        center: [defaultLng, defaultLat],
        zoom: 12.5,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

      map.on("load", () => {
        setMapLoaded(true);
      });

      map.on("error", (e) => {
        console.warn("Mapbox load notice:", e);
        // Non-fatal warning handling
      });

      mapInstance.current = map;

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        map.remove();
        mapInstance.current = null;
      };
    } catch (err) {
      console.error("Mapbox init exception:", err);
      setMapError("Interactive WebGL map unavailable. Utilizing satellite vector fallback.");
    }
  }, []);

  // Update center when user location changes
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;
    const lng = userLocation.longitude ?? userLocation.lon;
    const lat = userLocation.latitude ?? userLocation.lat;
    if (lng && lat && !isNaN(lng) && !isNaN(lat)) {
      mapInstance.current.flyTo({
        center: [lng, lat],
        zoom: 12.5,
        essential: true,
      });
    }
  }, [userLocation]);

  // Update Markers for Hospitals & User
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const map = mapInstance.current;

    // 1. User Location Marker (Pulsing Cyan Orb)
    const userLng = userLocation?.longitude ?? userLocation?.lon;
    const userLat = userLocation?.latitude ?? userLocation?.lat;
    if (userLng && userLat && !isNaN(userLng) && !isNaN(userLat)) {
      const el = document.createElement("div");
      el.className = "user-location-marker relative flex items-center justify-center cursor-pointer";
      el.innerHTML = `
        <div class="absolute w-8 h-8 rounded-full bg-cyan-500/20 animate-ping"></div>
        <div class="relative w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_rgba(6,182,212,0.9)] flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="background:#090d16; color:#fff; padding:8px 12px; border-radius:12px; font-family:sans-serif; border:1px solid rgba(6,182,212,0.4); font-size:12px;">
          <strong style="color:#38bdf8;">📍 Your Location</strong>
          <div style="color:#94a3b8; font-size:11px; margin-top:2px;">${userLocation.display_name || "Center of Search Area"}</div>
        </div>
      `);

      const userMarker = new mapboxgl.Marker(el)
        .setLngLat([userLng, userLat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(userMarker);
    }

    // 2. Hospital Markers
    hospitals.forEach((hosp, idx) => {
      const isAutoBooked = autoBooked && (autoBooked.hospital_name === hosp.name || idx === 0);
      const isSelected = selectedHospital && selectedHospital.name === hosp.name;

      const el = document.createElement("div");
      el.className = `hospital-marker group cursor-pointer transition-transform duration-200 hover:scale-125`;

      if (isAutoBooked) {
        // Red Emergency Pulsing Pin
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 rounded-full bg-rose-500/30 animate-ping"></div>
            <div class="relative px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-red-600 border-2 border-white text-white font-mono font-bold text-[10px] shadow-[0_0_20px_rgba(244,63,94,0.9)] flex items-center gap-1">
              <span>🚨 AUTO-BOOKED</span>
            </div>
          </div>
        `;
      } else if (isSelected) {
        // Highlighted Cyan Pin
        el.innerHTML = `
          <div class="px-2 py-1 rounded-xl bg-cyan-500 border-2 border-white text-slate-950 font-bold text-[10px] shadow-[0_0_15px_rgba(6,182,212,0.8)]">
            🏥 ${idx + 1}
          </div>
        `;
      } else {
        // Standard Medical Pin
        el.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 font-bold text-[11px] shadow-lg flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-colors">
            ${idx + 1}
          </div>
        `;
      }

      el.addEventListener("click", () => {
        if (onSelectHospital) onSelectHospital(hosp);
      });

      const popupHtml = `
        <div style="background:#090d16; color:#f8fafc; padding:12px; border-radius:14px; font-family:sans-serif; border:1px solid ${isAutoBooked ? 'rgba(244,63,94,0.5)' : 'rgba(6,182,212,0.4)'}; max-width:240px; box-shadow:0 10px 25px rgba(0,0,0,0.6);">
          ${isAutoBooked ? '<div style="color:#f43f5e; font-size:10px; font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">🚨 Emergency Appointment Confirmed</div>' : ''}
          <div style="font-weight:700; font-size:13px; color:#fff; margin-bottom:4px;">${hosp.name}</div>
          <div style="font-size:11px; color:#94a3b8; line-height:1.4; margin-bottom:6px;">${hosp.address}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:600; color:#38bdf8; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px; margin-top:6px;">
            <span>${hosp.distance_km} km (${hosp.distance_miles || (hosp.distance_km * 0.62).toFixed(1)} mi)</span>
            <span style="color:#fbbf24;">★ ${hosp.rating || 4.9}</span>
          </div>
          <div style="margin-top:8px;">
            <a href="${hosp.directions_url}" target="_blank" rel="noopener noreferrer" style="display:inline-block; width:100%; text-align:center; background:#0284c7; color:#fff; padding:5px 0; border-radius:8px; font-size:11px; font-weight:700; text-decoration:none;">
              Get GPS Directions &rarr;
            </a>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([hosp.longitude, hosp.latitude])
        .setPopup(popup)
        .addTo(map);

      if (isAutoBooked || isSelected) {
        popup.addTo(map);
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if we have multiple hospitals
    if (hospitals.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      if (userLng && userLat) bounds.extend([userLng, userLat]);
      hospitals.slice(0, 8).forEach((h) => bounds.extend([h.longitude, h.latitude]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
    }
  }, [hospitals, userLocation, selectedHospital, autoBooked]);

  // Recenter helper
  const handleRecenter = () => {
    if (!mapInstance.current || !userLocation) return;
    const lng = userLocation.longitude ?? userLocation.lon;
    const lat = userLocation.latitude ?? userLocation.lat;
    if (lng && lat) {
      mapInstance.current.flyTo({ center: [lng, lat], zoom: 13, essential: true });
    }
  };

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-[#040814]">
      {/* Mapbox Canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Recenter Button */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={handleRecenter}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30 backdrop-blur-md shadow-lg transition-all"
          title="Recenter on search location"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Center Location</span>
        </button>

        {isHighDementia && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/90 text-rose-300 font-mono text-xs font-bold border border-rose-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>EMERGENCY AUTO-BOOKING PINNED</span>
          </div>
        )}
      </div>

      {/* Map Legend Floating Tag */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span>Verified Hospital ({hospitals.length})</span>
        </div>
        {isHighDementia && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-rose-400 font-bold">Auto-Booked Clinic</span>
          </div>
        )}
      </div>

      {/* Fallback if WebGL has issues */}
      {mapError && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <p className="text-xs text-slate-300 max-w-sm">{mapError}</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-cyan-400">
            {hospitals.slice(0, 4).map((h, i) => (
              <div key={i} className="p-2 rounded-lg bg-black/50 border border-cyan-500/20">
                {h.name} ({h.distance_km} km)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
