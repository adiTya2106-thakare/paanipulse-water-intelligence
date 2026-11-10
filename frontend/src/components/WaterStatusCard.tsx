import React from 'react';
import { LocalitySummary } from '../types';
import { CheckCircle2, AlertTriangle, Droplets, Clock, HelpCircle, Layers } from 'lucide-react';

interface WaterStatusCardProps {
  summary: LocalitySummary;
}

export const WaterStatusCard: React.FC<WaterStatusCardProps> = ({ summary }) => {
  const {
    locality,
    total_reports,
    reported_availability_share,
    low_pressure_share,
    delayed_share,
    current_status,
    status_label,
    status_description
  } = summary;

  // Determine styling based on current reported status
  const getStatusTheme = () => {
    switch (current_status) {
      case 'POSSIBLE_DISRUPTION':
        return {
          bg: 'bg-amber-500/10 border-amber-500/40 text-amber-900',
          badgeBg: 'bg-amber-500 text-slate-950',
          badgeText: 'Possible Supply Disruption',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          accent: 'border-l-4 border-l-amber-500'
        };
      case 'REPORTED_AVAILABLE':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          badgeText: 'Reported Available',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          accent: 'border-l-4 border-l-emerald-500'
        };
      case 'LOW_PRESSURE_REPORTED':
        return {
          bg: 'bg-sky-500/10 border-sky-500/40 text-sky-950',
          badgeBg: 'bg-sky-600 text-white',
          badgeText: 'Low Pressure Reported',
          icon: Droplets,
          iconColor: 'text-sky-600',
          accent: 'border-l-4 border-l-sky-500'
        };
      case 'INSUFFICIENT_DATA':
      default:
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-800',
          badgeBg: 'bg-slate-600 text-white',
          badgeText: 'Insufficient Community Data',
          icon: HelpCircle,
          iconColor: 'text-slate-500',
          accent: 'border-l-4 border-l-slate-400'
        };
    }
  };

  const theme = getStatusTheme();
  const StatusIcon = theme.icon;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6 ${theme.accent}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Locality Status Snapshot
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
              {theme.badgeText}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center space-x-2">
            <span>{locality.name}</span>
            <span className="text-slate-400 text-base font-normal">({locality.city})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {locality.ward || 'Municipal Ward Area'} • 24-Hour Active Reporting Window
          </p>
        </div>

        {/* Primary Metric: Reported Availability Share */}
        <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Reported Availability Share
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-brand-700">
                {total_reports > 0 ? `${reported_availability_share}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">
                ({total_reports} {total_reports === 1 ? 'report' : 'reports'})
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-1 max-w-[200px]">
              Calculated as: (valid availability reports / total observations) × 100
            </p>
          </div>
        </div>
      </div>

      {/* Description & Narrative */}
      <div className="mt-4 flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-slate-100 shrink-0">
          <StatusIcon className={`w-5 h-5 ${theme.iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-snug">
            {status_label}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {status_description}
          </p>
        </div>
      </div>

      {/* Observations Breakdown Progress Bars */}
      {total_reports > 0 ? (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported Conditions Breakdown</span>
            </span>
            <span className="text-[11px] text-slate-400">Based on verified crowd submissions</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/70">
              <div className="text-[11px] text-emerald-800 font-medium">Water Available</div>
              <div className="text-lg font-bold text-emerald-950 mt-0.5">{reported_availability_share}%</div>
            </div>

            <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-200/70">
              <div className="text-[11px] text-sky-800 font-medium">Low Pressure</div>
              <div className="text-lg font-bold text-sky-950 mt-0.5">{low_pressure_share}%</div>
            </div>

            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/70">
              <div className="text-[11px] text-amber-800 font-medium">Delayed Supply</div>
              <div className="text-lg font-bold text-amber-950 mt-0.5">{delayed_share}%</div>
            </div>

            <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200/70">
              <div className="text-[11px] text-rose-800 font-medium">No Water</div>
              <div className="text-lg font-bold text-rose-950 mt-0.5">
                {Math.max(0, Math.round((100 - reported_availability_share - low_pressure_share - delayed_share) * 10) / 10)}%
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-xs text-slate-600 font-medium">
            Be the first resident to log an observation for {locality.name}.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Community reports are stored with cryptographic hashes to safeguard reporter privacy.
          </p>
        </div>
      )}

      {/* Mandatory Civic Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Source: PAANIPULSE Crowd Observations</span>
        <span>Anti-tamper rate limit protected</span>
      </div>
    </div>
  );
};
