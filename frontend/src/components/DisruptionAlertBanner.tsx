import React from 'react';
import { DisruptionAlert } from '../types';
import { AlertTriangle, Clock, Users, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';

interface DisruptionAlertBannerProps {
  alert: DisruptionAlert | null;
  onOpenPreparedness: () => void;
}

export const DisruptionAlertBanner: React.FC<DisruptionAlertBannerProps> = ({
  alert,
  onOpenPreparedness
}) => {
  if (!alert) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-900 px-2 py-0.5 rounded border border-amber-500/30">
                Explainable Anomaly Alert
              </span>
              <span className="text-[11px] font-semibold text-amber-800">
                {alert.confidence_level === 'STRONGER' ? 'Stronger Community Signal' : 'Developing Signal'}
              </span>
            </div>
            
            <h2 className="text-base sm:text-lg font-black text-amber-950 mt-1 leading-snug">
              {alert.title}
            </h2>
            <p className="text-xs text-amber-900/80 font-medium mt-0.5">
              Locality: {alert.locality_name} • {alert.when_observed}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPreparedness}
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl transition shrink-0 shadow-sm"
        >
          <span>Action Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Anomaly Detection Explanation Details */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/70 p-4 rounded-xl border border-amber-200/80 text-xs">
        <div>
          <span className="text-[11px] font-semibold text-amber-800 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>What Changed</span>
          </span>
          <p className="text-slate-800 font-medium mt-1 leading-relaxed">
            {alert.what_changed}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-amber-800 flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>Crowd Evidence Base</span>
          </span>
          <p className="text-slate-800 font-medium mt-1 leading-relaxed">
            {alert.disruption_report_count} disruptions reported out of {alert.report_count} recent submissions by {alert.distinct_reporters} independent devices.
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-amber-800 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Explainable Rationale</span>
          </span>
          <p className="text-slate-800 font-medium mt-1 leading-relaxed">
            {alert.explanation}
          </p>
        </div>
      </div>

      {/* Practical Community Guidance */}
      <div className="mt-4 pt-3 border-t border-amber-500/20">
        <h4 className="text-xs font-bold text-amber-950 flex items-center space-x-1.5 mb-2">
          <span>Responsible Household Guidance:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900">
          {alert.guidance.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Crucial Ethical Disclaimer */}
      <div className="mt-3 text-[11px] text-amber-800/80 italic">
        * Notice: This is an anomaly indicator based on resident submissions, not an official municipal announcement. Always verify with your local water authority.
      </div>
    </div>
  );
};

