import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertOctagon, PhoneCall, Droplets, Info } from 'lucide-react';

interface PreparednessGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreparednessGuideModal: React.FC<PreparednessGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Community Water Preparedness Guide
              </h2>
              <p className="text-xs text-slate-300">
                Responsible steps when neighbourhood water disruption signals occur
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
        <div className="p-6 space-y-5 text-xs text-slate-700">
          
          {/* Step 1 */}
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Verify Local Building Infrastructure
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Before assuming a municipal pipeline outage, check your building’s main inlet valve, underground sump level, and society motor pump breaker with your building manager or immediate neighbours.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Responsible Household Water Conservation
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Postpone heavy water-consuming tasks such as car washing, garden hose watering, and washing machine rinse cycles until normal community pressure is restored.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Safe and Hygienic Water Storage
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Store domestic water in clean, tightly covered food-grade containers. Avoid keeping open stagnant buckets which create mosquito breeding grounds. Boil drinking water if supply resumes after pipe maintenance.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Escalate via Official Ward Helplines
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                If disruption exceeds 6 hours beyond normal timetable, log a formal service ticket with your municipal corporation:
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-800">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  MCGM Mumbai: <strong>1916</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  PMC Pune: <strong>1800 1030 222</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  BWSSB Bengaluru: <strong>1916</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  Delhi Jal Board: <strong>1916</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-[11px] text-amber-900">
            <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Safety Advisory:</strong> Never consume untreated ground water or unverified tanker water without boiling or certified filtration.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition text-xs"
          >
            Understood
          </button>

        </div>

      </div>
    </div>
  );
};
