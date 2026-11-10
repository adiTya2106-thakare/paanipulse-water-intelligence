import React, { useState, useEffect } from 'react';
import { ReportCardData } from '../types';
import { fetchReportCard } from '../services/api';
import { X, Printer, Download, ShieldCheck, Droplets, CheckCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';

interface EvidenceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  localityId: string;
}

export const EvidenceReportModal: React.FC<EvidenceReportModalProps> = ({
  isOpen,
  onClose,
  localityId
}) => {
  const [data, setData] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && localityId) {
      setLoading(true);
      setError('');
      fetchReportCard(localityId)
        .then(res => setData(res))
        .catch(err => setError(err.message || 'Failed to load report card'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, localityId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Actions (no-print) */}
        <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Evidence-Based Locality Report</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Audit Document */}
        <div className="p-6 sm:p-8 bg-white text-slate-900" id="printable-evidence-report">
          {loading && (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Generating verified evidence audit...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              
              {/* Document Letterhead */}
              <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-brand-700 font-extrabold text-xl tracking-tight">
                    <Droplets className="w-6 h-6 text-brand-600" />
                    <span>PAANIPULSE CIVIC WATER AUDIT</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    India's Community-Powered Water Intelligence & Early Disruption Detection Network
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Powered by AWS Serverless Infrastructure • Techfest 2026–27 (IIT Bombay)
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-600">
                  <div className="font-bold text-slate-900">Audit Timestamp</div>
                  <div>{new Date(data.generated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">Ref: {localityId}-AUDIT</div>
                </div>
              </div>

              {/* Locality Header */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Locality:</span>
                    <div className="text-sm font-bold text-slate-900">{data.locality_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Jurisdiction / Ward:</span>
                    <div className="text-sm font-bold text-slate-900">{data.ward || 'Municipal Ward Area'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">City & State:</span>
                    <div className="text-sm font-bold text-slate-900">{data.city}, India</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Observed Metrics (Active 24-Hour Cycle)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="text-[11px] text-emerald-800 font-medium">Reported Availability</div>
                    <div className="text-xl font-black text-emerald-950 mt-1">{data.metrics.reported_availability_share}</div>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <div className="text-[11px] text-rose-800 font-medium">Reported No Water</div>
                    <div className="text-xl font-black text-rose-950 mt-1">{data.metrics.reported_no_water_share}</div>
                  </div>

                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                    <div className="text-[11px] text-sky-800 font-medium">Low Pressure Frequency</div>
                    <div className="text-xl font-black text-sky-950 mt-1">{data.metrics.low_pressure_frequency}</div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="text-[11px] text-amber-800 font-medium">Supply Delay Frequency</div>
                    <div className="text-xl font-black text-amber-950 mt-1">{data.metrics.supply_delay_frequency}</div>
                  </div>
                </div>
              </div>

              {/* Confidence Analysis */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800">
                    Community Signal Confidence Breakdown
                  </h4>
                  <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-0.5 rounded-full">
                    {data.community_confidence.label} ({data.community_confidence.score})
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                  {data.community_confidence.explanation.map((exp, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Warning Section if applicable */}
              {data.active_disruption_warning && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-xs">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Active Disruption Signal Detected</span>
                  </div>
                  <p className="mt-1 text-slate-800">
                    {data.active_disruption_warning.explanation}
                  </p>
                </div>
              )}

              {/* Legal & Methodological Disclaimer (Mandatory) */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-100 text-[11px] text-slate-600 leading-relaxed">
                <div className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>Methodological Limitations & Disclaimer</span>
                </div>
                {data.legal_and_methodological_disclaimer}
              </div>

              {/* Sign-off Seal */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                <span>PAANIPULSE Civic Engine v1.0 • Verified Server-Side Hash</span>
                <span>Page 1 of 1</span>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

