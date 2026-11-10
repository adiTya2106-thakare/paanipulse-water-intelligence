import React, { useState } from 'react';
import { WaterReport } from '../types';
import { moderateReport } from '../services/api';
import { X, Lock, ShieldAlert, EyeOff, CheckCircle, AlertCircle, Key, Loader2 } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: WaterReport[];
  onReportModerated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  reports,
  onReportModerated
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'paanipulse-admin-2026') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid administrative passcode.');
    }
  };

  const handleToggleFlag = async (reportId: string, currentFlag: boolean) => {
    setActionLoading(reportId);
    try {
      await moderateReport(reportId, !currentFlag, passcode);
      onReportModerated();
    } catch (err: any) {
      alert(err.message || 'Moderation action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-navy-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Civic Moderation & Integrity Console
              </h2>
              <p className="text-xs text-slate-400">
                Authorized gatekeeper portal to flag spam or fraudulent observations
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
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-700">
              <Key className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Protected Admin Console</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your administrative key to inspect device tokens and moderate community reports.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Passcode: paanipulse-admin-2026"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
              )}
              <button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                Authenticate Console
              </button>
            </form>
            <p className="text-[10px] text-slate-400">
              Demo Key: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">paanipulse-admin-2026</code>
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900">
              <span className="flex items-center space-x-1.5 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Session Active • Administrator Privileges Granted</span>
              </span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-slate-500 hover:text-slate-800 underline text-[11px]"
              >
                Lock Console
              </button>
            </div>

            <div className="text-xs text-slate-500 flex justify-between items-center">
              <span>Inspect active submissions for selected locality:</span>
              <span className="font-mono">{reports.length} records in buffer</span>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2.5">
              {reports.map(rep => (
                <div
                  key={rep.report_id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    rep.flagged
                      ? 'bg-rose-50/50 border-rose-200 opacity-60'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{rep.observation_type}</span>
                      <span className="text-[10px] font-mono text-slate-400">ID: {rep.report_id}</span>
                      {rep.flagged && (
                        <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.2 rounded">
                          FLAGGED / HIDDEN
                        </span>
                      )}
                    </div>
                    {rep.notes && (
                      <p className="text-slate-700 italic">“{rep.notes}”</p>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      Token: {rep.reporter_token} • Pressure: {rep.pressure_level || 'N/A'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(rep.report_id, !!rep.flagged)}
                    disabled={actionLoading === rep.report_id}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 ${
                      rep.flagged
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                    }`}
                  >
                    {actionLoading === rep.report_id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : rep.flagged ? (
                      <span>Restore</span>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hide / Flag</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
