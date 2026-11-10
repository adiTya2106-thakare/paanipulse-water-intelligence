import React from 'react';
import { X, BookOpen, ShieldCheck, Activity, Users, Database, Lock } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                About & Methodological Architecture
              </h2>
              <p className="text-xs text-slate-300">
                Transparent civic algorithms and privacy protections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Problem & Mission */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              <span>The Civic Information Problem in India</span>
            </h3>
            <p className="leading-relaxed text-slate-600">
              In urban and peri-urban India, municipal water supply is intermittent, operating for only 1 to 4 hours daily. When taps run dry or pressure drops, residents have no transparent way of knowing whether the issue is internal (overhead tank float valve, society motor pump) or an external municipal line disruption. Residents resort to chaotic WhatsApp groups and phone calls. PAANIPULSE bridges this gap with verifiable crowd intelligence.
            </p>
          </div>

          {/* Section 2: Transparent Confidence Calculation */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Community Signal Confidence Formula</span>
            </h3>
            <p className="text-slate-600 mb-2 leading-relaxed">
              Confidence is evaluated transparently using a deterministic 100-point composite model:
            </p>
            <div className="space-y-2 text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 font-mono text-[11px]">
              <div><strong>1. Reporter Diversity (Max 30 pts):</strong> Distinct verified device tokens submitting within 24 hours. Single users cannot inflate scores.</div>
              <div><strong>2. Recency Decay (Max 35 pts):</strong> Observations &le; 2 hours receive full weight (1.0); 2-6 hrs (0.7); 6-12 hrs (0.4); &gt; 12 hrs (0.15).</div>
              <div><strong>3. Agreement Concordance (Max 35 pts):</strong> Percentage concordance among submissions for the current cycle.</div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Thresholds: 0-39 (Low confidence), 40-64 (Developing signal), 65-100 (Stronger community signal).
            </p>
          </div>

          {/* Section 3: Explainable Disruption Anomaly Detection */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Explainable Disruption Early-Warning</span>
            </h3>
            <p className="leading-relaxed text-slate-600">
              Unlike opaque AI models, PAANIPULSE uses explainable statistical rules:
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600">
              <li>Each locality maintains a historical <strong>Water Fingerprint</strong> segmented into diurnal windows: Morning (6-10 AM), Midday (10-4 PM), Evening (4-9 PM), Night (9-6 AM).</li>
              <li>If a time window historically exhibits high availability (&ge; 60%), but recent 4-hour submissions from &ge; 2 independent devices show &ge; 50% disruption ("No Water" or "Delayed Supply"), an early-warning signal is triggered.</li>
              <li>If historical data has fewer than 12 reports, the system transparently reports: <em>“Not enough verified community history yet. Baseline developing.”</em> No alerts are hallucinated.</li>
            </ul>
          </div>

          {/* Section 4: Privacy & Anti-Tampering */}
          <div className="bg-brand-50/50 p-4 rounded-2xl border border-brand-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-brand-600" />
              <span>Data Integrity & Privacy Guarantees</span>
            </h3>
            <ul className="space-y-1.5 text-slate-600">
              <li><strong>Zero Private Location Storage:</strong> Only locality and municipal ward centroids are registered. Flat numbers and building names are strictly discarded.</li>
              <li><strong>Rate-Limiting Protection:</strong> Devices are capped at 3 submissions per 15-minute window to thwart bot inflation and duplicate spamming.</li>
              <li><strong>Server-Side Timestamps:</strong> All timestamps are validated on AWS Lambda to prevent manipulation of temporal baselines.</li>
            </ul>
          </div>

          {/* Section 5: Legal & Technical Boundaries */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            <strong>Clear System Boundary:</strong> PAANIPULSE is a civic crowdsourcing network designed for neighbourhood preparedness. It does not possess direct telemetry sensors inside government pipeline junctions and does not replace official municipal water board notices.
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs"
          >
            Close Methodology
          </button>

        </div>

      </div>
    </div>
  );
};
