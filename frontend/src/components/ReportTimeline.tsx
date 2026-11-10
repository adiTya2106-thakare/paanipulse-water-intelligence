import React, { useState } from 'react';
import { WaterReport, ObservationType } from '../types';
import { Clock, Filter, Search, CheckCircle2, XCircle, Droplets, AlertCircle, HelpCircle } from 'lucide-react';

interface ReportTimelineProps {
  reports: WaterReport[];
  localityName: string;
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({ reports, localityName }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = reports.filter(r => {
    const matchesFilter = filterType === 'ALL' || r.observation_type === filterType;
    const matchesSearch = !searchTerm || 
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.observation_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getObservationBadge = (obsType: ObservationType) => {
    switch (obsType) {
      case 'WATER_AVAILABLE':
        return {
          label: 'Water Available',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600'
        };
      case 'NO_WATER':
        return {
          label: 'No Water / Taps Dry',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
          iconColor: 'text-rose-600'
        };
      case 'LOW_PRESSURE':
        return {
          label: 'Low Pressure Flow',
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: Droplets,
          iconColor: 'text-sky-600'
        };
      case 'DELAYED_SUPPLY':
        return {
          label: 'Delayed Supply',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertCircle,
          iconColor: 'text-amber-600'
        };
      case 'OTHER':
      default:
        return {
          label: 'General Observation',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: HelpCircle,
          iconColor: 'text-slate-600'
        };
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const dt = new Date(ts);
      return dt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Smart Water Report Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological log of verified observations for {localityName}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Reports' },
            { id: 'WATER_AVAILABLE', label: 'Available' },
            { id: 'NO_WATER', label: 'No Water' },
            { id: 'LOW_PRESSURE', label: 'Low Pressure' },
            { id: 'DELAYED_SUPPLY', label: 'Delayed' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                filterType === btn.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative my-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter observations by keywords (e.g. pressure, tank, pump)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        />
      </div>

      {/* Timeline Stream */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No reports match the selected filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the filter or submit a new observation above.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map(report => {
            const badge = getObservationBadge(report.observation_type);
            const Icon = badge.icon;

            return (
              <div
                key={report.report_id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${badge.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {report.pressure_level && (
                        <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          Pressure: {report.pressure_level}
                        </span>
                      )}
                      {report.is_demo_data && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded">
                          DEMO DATA
                        </span>
                      )}
                    </div>

                    {report.notes && (
                      <p className="text-xs sm:text-sm text-slate-800 mt-1.5 leading-relaxed font-normal">
                        “{report.notes}”
                      </p>
                    )}

                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>Reporter Device: {report.reporter_token.slice(0, 10)}•••</span>
                      <span>•</span>
                      <span>Verified Timestamp</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-medium text-slate-500 sm:text-right shrink-0 whitespace-nowrap">
                  {formatTimestamp(report.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing {filtered.length} of {reports.length} observations</span>
        <span>Cryptographically verified server timestamps</span>
      </div>
    </div>
  );
};
