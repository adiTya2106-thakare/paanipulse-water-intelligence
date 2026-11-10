import React, { useState } from 'react';
import { Locality } from '../types';
import { Map, AlertTriangle, CheckCircle, Info, Droplet, Navigation, ExternalLink } from 'lucide-react';

interface LocalityPulseMapProps {
  localities: Locality[];
  selectedLocalityId: string;
  onSelectLocality: (id: string) => void;
}

export const LocalityPulseMap: React.FC<LocalityPulseMapProps> = ({
  localities,
  selectedLocalityId,
  onSelectLocality
}) => {
  const [activeTabCity, setActiveTabCity] = useState<string>('Mumbai');

  const cityCoordinates: Record<string, { lat: number; lng: number; desc: string }> = {
    Mumbai: { lat: 19.0760, lng: 72.8777, desc: "Western & Central Mumbai Suburbs" },
    Pune: { lat: 18.5204, lng: 73.8567, desc: "Pune Metropolitan Region" },
    Bengaluru: { lat: 12.9716, lng: 77.5946, desc: "Bengaluru Tech Corridors" },
    "New Delhi": { lat: 28.6139, lng: 77.2090, desc: "National Capital Region" }
  };

  const cities = ['Mumbai', 'Pune', 'Bengaluru', 'New Delhi'];

  const localitiesInCity = localities.filter(l => l.city === activeTabCity);

  const getStatusColor = (loc: Locality) => {
    if (loc.has_active_alert) return { dot: 'bg-amber-500 animate-ping', pill: 'bg-amber-500 text-slate-950', border: 'border-amber-400' };
    if ((loc.total_reports || 0) === 0) return { dot: 'bg-slate-400', pill: 'bg-slate-200 text-slate-700', border: 'border-slate-300' };
    if ((loc.reported_availability_share || 0) >= 65) return { dot: 'bg-emerald-500', pill: 'bg-emerald-600 text-white', border: 'border-emerald-400' };
    return { dot: 'bg-sky-500', pill: 'bg-sky-600 text-white', border: 'border-sky-400' };
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Map className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Locality Pulse Map & Spatial Explorer
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Privacy-preserving locality network. Coordinates represent municipal ward centroids, never individual homes.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl">
          {cities.map(c => (
            <button
              key={c}
              onClick={() => setActiveTabCity(c)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeTabCity === c
                  ? 'bg-white text-slate-900 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Spatial Canvas */}
      <div className="relative mt-5 bg-gradient-to-b from-navy-950 to-slate-900 rounded-2xl p-6 overflow-hidden min-h-[300px] flex flex-col justify-between text-white border border-slate-800">
        
        {/* Spatial Grid overlay effect */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* City header badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold tracking-wide text-white">{activeTabCity} Region</span>
            <span className="text-xs text-slate-400">({cityCoordinates[activeTabCity]?.desc})</span>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            Centroid: {cityCoordinates[activeTabCity]?.lat}° N, {cityCoordinates[activeTabCity]?.lng}° E
          </div>
        </div>

        {/* Locality Nodes Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
          {localitiesInCity.map(loc => {
            const isSelected = loc.id === selectedLocalityId;
            const style = getStatusColor(loc);

            return (
              <div
                key={loc.id}
                onClick={() => onSelectLocality(loc.id)}
                className={`cursor-pointer p-4 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${style.dot.replace('animate-ping', '')}`} />
                    </span>
                    <h4 className="text-sm font-bold text-white">{loc.name}</h4>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-1 pl-5">
                  {loc.ward || 'Ward Jurisdiction'}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {loc.total_reports || 0} observations
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.pill}`}>
                    {loc.has_active_alert
                      ? 'Disruption Signal'
                      : (loc.total_reports || 0) === 0
                        ? 'Insufficient Data'
                        : `${loc.reported_availability_share}% Avail.`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Reported Available (&ge; 65%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Disruption Signal Detected</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Low Pressure / Developing</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>0 Reports (Fresh Locality)</span>
            </span>
          </div>

          <span className="italic">Click any node to focus locality view</span>
        </div>

      </div>
    </div>
  );
};
