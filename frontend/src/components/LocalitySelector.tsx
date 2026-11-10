import React from 'react';
import { Locality } from '../types';
import { MapPin, Search, AlertTriangle, CheckCircle, Info, Droplet } from 'lucide-react';

interface LocalitySelectorProps {
  localities: Locality[];
  selectedLocalityId: string;
  onSelectLocality: (id: string) => void;
  isLoading?: boolean;
}

export const LocalitySelector: React.FC<LocalitySelectorProps> = ({
  localities,
  selectedLocalityId,
  onSelectLocality,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCity, setSelectedCity] = React.useState<string>('ALL');

  const cities = ['ALL', ...Array.from(new Set(localities.map(l => l.city)))];

  const filtered = localities.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (l.ward && l.ward.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = selectedCity === 'ALL' || l.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const getStatusBadge = (loc: Locality) => {
    if (loc.has_active_alert) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Disruption Warning</span>
        </span>
      );
    }
    if ((loc.total_reports || 0) === 0) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <Info className="w-3 h-3 text-slate-400" />
          <span>0 Reports (Fresh)</span>
        </span>
      );
    }
    if ((loc.reported_availability_share || 0) >= 65) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Reported Available ({loc.reported_availability_share}%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-300">
        <Droplet className="w-3 h-3 text-blue-600" />
        <span>Developing / Mixed</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Select Neighbourhood or Ward</span>
          </h2>
          <p className="text-xs text-slate-500">
            View verified community observations and historical supply fingerprint.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                selectedCity === city
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {city === 'ALL' ? 'All Cities' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search locality name, city, or municipal ward..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
        />
      </div>

      {/* Locality Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(loc => {
          const isSelected = loc.id === selectedLocalityId;
          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocality(loc.id)}
              className={`cursor-pointer p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {loc.city}, {loc.state} • {loc.ward || 'Ward Registry'}
                  </p>
                </div>
                {loc.has_demo_data && (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                    DEMO DATA
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                {getStatusBadge(loc)}
                <span className="text-slate-500 text-[11px] font-medium">
                  {loc.total_reports || 0} reports
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-xs text-slate-500">
          No localities found matching your search.
        </div>
      )}
    </div>
  );
};

