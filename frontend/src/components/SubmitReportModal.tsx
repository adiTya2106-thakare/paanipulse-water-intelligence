import React, { useState } from 'react';
import { Locality, ObservationType, PressureLevel } from '../types';
import { submitWaterReport } from '../services/api';
import { X, CheckCircle2, AlertCircle, Droplets, Clock, XCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface SubmitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  localities: Locality[];
  selectedLocalityId: string;
  onReportSubmitted: () => void;
}

export const SubmitReportModal: React.FC<SubmitReportModalProps> = ({
  isOpen,
  onClose,
  localities,
  selectedLocalityId,
  onReportSubmitted
}) => {
  const [localityId, setLocalityId] = useState(selectedLocalityId || localities[0]?.id || '');
  const [observationType, setObservationType] = useState<ObservationType>('WATER_AVAILABLE');
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>('NORMAL');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!localityId) {
      setErrorMessage('Please select a locality.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitWaterReport({
        localityId,
        observationType,
        pressureLevel,
        notes: notes.trim()
      });

      setSuccessMessage(res.message || 'Report submitted successfully!');
      setTimeout(() => {
        onReportSubmitted();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const observationOptions: Array<{
    type: ObservationType;
    label: string;
    desc: string;
    icon: any;
    color: string;
  }> = [
    {
      type: 'WATER_AVAILABLE',
      label: 'Water Available',
      desc: 'Regular supply flowing normally in taps',
      icon: CheckCircle2,
      color: 'text-emerald-600 border-emerald-500 bg-emerald-50'
    },
    {
      type: 'NO_WATER',
      label: 'No Water / Taps Dry',
      desc: 'Completely dry taps during expected supply time',
      icon: XCircle,
      color: 'text-rose-600 border-rose-500 bg-rose-50'
    },
    {
      type: 'LOW_PRESSURE',
      label: 'Low Pressure Flow',
      desc: 'Water trickling slowly, inadequate for tanks',
      icon: Droplets,
      color: 'text-sky-600 border-sky-500 bg-sky-50'
    },
    {
      type: 'DELAYED_SUPPLY',
      label: 'Delayed Supply',
      desc: 'Supply has not started at scheduled timetable',
      icon: Clock,
      color: 'text-amber-600 border-amber-500 bg-amber-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Report Neighbourhood Water Status
              </h2>
              <p className="text-xs text-slate-300">
                Help your neighbours know the situation before the tap runs dry
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Privacy Alert */}
          <div className="bg-brand-50 border border-brand-200 p-3 rounded-xl flex items-start space-x-2 text-xs text-brand-900">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Guarantee:</strong> Only neighbourhood-level observations are recorded. Never submit flat numbers, door numbers, or private addresses.
            </span>
          </div>

          {/* Success or Error Banners */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Locality Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Select Locality / Ward
            </label>
            <select
              value={localityId}
              onChange={e => setLocalityId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {localities.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.city} • {loc.ward || 'Ward Area'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Observation Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              What is your current water supply condition?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {observationOptions.map(opt => {
                const isSelected = observationType === opt.type;
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setObservationType(opt.type)}
                    className={`cursor-pointer p-3 rounded-xl border transition flex items-start space-x-2.5 ${
                      isSelected
                        ? `${opt.color} ring-2 ring-brand-500/30 font-semibold shadow-sm`
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Water Pressure Category */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Observed Water Pressure
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'NORMAL', label: 'Normal Flow' },
                { id: 'MODERATE', label: 'Moderate' },
                { id: 'TRICKLE', label: 'Trickle' },
                { id: 'NONE', label: 'No Flow' }
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPressureLevel(p.id as PressureLevel)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition ${
                    pressureLevel === p.id
                      ? 'bg-brand-600 text-white border-brand-600 font-bold shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Optional Context Note */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Locality Notes (Optional)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {notes.length}/280
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={280}
              placeholder="e.g. Tanker arriving, pump maintenance in progress, only air coming from pipeline..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Submission Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 transition active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Validating & Storing in Cloud...</span>
                </>
              ) : (
                <span>Submit Water Observation</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

