import React from 'react';
import { FingerprintData } from '../types';
import { Activity, Clock, AlertCircle, Droplet, CheckCircle } from 'lucide-react';

interface WaterFingerprintCardProps {
  fingerprint: FingerprintData;
}

export const WaterFingerprintCard: React.FC<WaterFingerprintCardProps> = ({ fingerprint }) => {
  const {
    status,
    message,
    total_reports,
    window_profiles,
    common_delay_periods,
    low_pressure_frequency_pct,
    overall_availability_share
  } = fingerprint;

  const isDeveloping = status === 'DEVELOPING' || Object.keys(window_profiles || {}).length === 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Neighbourhood Water Fingerprint
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical supply profile across diurnal time intervals
          </p>
        </div>

        <div>
          {isDeveloping ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Baseline Developing</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Baseline Established</span>
            </span>
          )}
        </div>
      </div>

      {/* When Insufficient Data */}
      {isDeveloping ? (
        <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {message}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            PAANIPULSE requires at least 12 consistent community observations across distinct time windows before establishing an official Water Fingerprint.
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
            <span>Current observations recorded:</span>
            <span className="font-bold text-brand-700">{total_reports} / 12</span>
          </div>
        </div>
      ) : (
        /* Established Baseline Graphs */
        <div className="mt-5 space-y-5">
          
          {/* Diurnal Time Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(window_profiles).map(([key, win]) => (
              <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {win.window_name.split(' (')[0]}
                </div>
                <div className="text-[10px] text-slate-500">
                  {win.window_name.includes('(') ? `(${win.window_name.split('(')[1]}` : ''}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-lg font-black text-brand-700">
                    {win.availability_share}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {win.typical_status}
                  </span>
                </div>

                {/* Micro availability bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-1.5 rounded-full"
                    style={{ width: `${win.availability_share}%` }}
                  />
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[10px] text-slate-500">
                  <span>Low P: {win.low_pressure_pct}%</span>
                  <span>Delay: {win.delay_pct}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Aggregate Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-50/50 p-4 rounded-xl border border-brand-100">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Typical Availability Share</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{overall_availability_share}%</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-500">Low-Pressure Frequency</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{low_pressure_frequency_pct}%</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-500">Common Delay Windows</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {common_delay_periods.join(', ')}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Methodology notice */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        Fingerprints dynamically update as community reports are corroborated over 7-day rolling periods.
      </div>
    </div>
  );
};
