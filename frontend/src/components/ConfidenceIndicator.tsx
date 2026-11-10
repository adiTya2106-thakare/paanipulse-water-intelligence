import React, { useState } from 'react';
import { ConfidenceData } from '../types';
import { ShieldCheck, ShieldAlert, Shield, Users, Clock, ThumbsUp, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: ConfidenceData;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ confidence }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const {
    score,
    level,
    label,
    active_report_count,
    distinct_reporters,
    agreement_ratio,
    fresh_reports_last_2h,
    reasons
  } = confidence;

  const getLevelConfig = () => {
    switch (level) {
      case 'STRONGER':
        return {
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-500',
          borderColor: 'border-emerald-300',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          icon: ShieldCheck,
          summary: 'Multiple independent neighbours confirm consistent water supply observations.'
        };
      case 'DEVELOPING':
        return {
          color: 'text-amber-700',
          bgColor: 'bg-amber-500',
          borderColor: 'border-amber-300',
          badgeBg: 'bg-amber-100 text-amber-800',
          icon: Shield,
          summary: 'Signal is emerging with some reports, but requires more neighbourhood confirmation.'
        };
      case 'LOW':
      default:
        return {
          color: 'text-slate-600',
          bgColor: 'bg-slate-400',
          borderColor: 'border-slate-300',
          badgeBg: 'bg-slate-100 text-slate-700',
          icon: ShieldAlert,
          summary: 'Limited or older observations. Cannot establish widespread neighbourhood status.'
        };
    }
  };

  const config = getLevelConfig();
  const IconComponent = config.icon;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-slate-100">
            <IconComponent className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Community Signal Confidence
            </h3>
            <p className="text-xs text-slate-500">
              Transparent reliability rating derived from independent submissions
            </p>
          </div>
        </div>

        {/* Score Badge */}
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.badgeBg} ${config.borderColor}`}>
            {label} ({score}/100)
          </span>
        </div>
      </div>

      {/* Visual Confidence Meter Bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${config.bgColor}`}
            style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
          <span>Low (0-39)</span>
          <span>Developing (40-64)</span>
          <span>Stronger Signal (65-100)</span>
        </div>
      </div>

      {/* Quick Summary Rationale */}
      <div className="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <p className="font-medium text-slate-800">
          Why this rating?
        </p>
        <ul className="mt-1 space-y-1 text-slate-600">
          {reasons.map((r, idx) => (
            <li key={idx} className="flex items-center space-x-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable Breakdown Button */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="mt-3 w-full py-1.5 px-3 flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
      >
        <span className="font-semibold text-brand-700">
          {showBreakdown ? 'Hide scoring formula breakdown' : 'Inspect transparent scoring criteria'}
        </span>
        {showBreakdown ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Scoring Breakdown Details */}
      {showBreakdown && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>Reporter Diversity</span>
            </div>
            <div className="text-base font-bold text-slate-900">{distinct_reporters} distinct devices</div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Unique device tokens prevent single-user bias.
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>Recency Weighting</span>
            </div>
            <div className="text-base font-bold text-slate-900">{fresh_reports_last_2h} within 2 hrs</div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Fresh observations carry highest weighting (1.0 vs 0.15 for older).
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold mb-1">
              <ThumbsUp className="w-3.5 h-3.5 text-brand-600" />
              <span>Consensus Concordance</span>
            </div>
            <div className="text-base font-bold text-slate-900">{intToPct(agreement_ratio)}% agreement</div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              High agreement between neighbours elevates confidence score.
            </p>
          </div>
        </div>
      )}

      {/* Anti-manipulation Assurance */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Device rate-limiting active (max 3 submissions / 15 mins)</span>
        </span>
        <span>Transparent algorithm</span>
      </div>
    </div>
  );
};

function intToPct(val: number): number {
  return Math.round((val || 0) * 100);
}

