import React, { useState, useEffect, useCallback } from 'react';
import { Locality, LocalitySummary, WaterReport, FingerprintData, DisruptionAlert } from './types';
import {
  fetchLocalities,
  fetchLocalitySummary,
  fetchReportsTimeline,
  fetchWaterFingerprint,
  fetchActiveAlerts
} from './services/api';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { LocalitySelector } from './components/LocalitySelector';
import { WaterStatusCard } from './components/WaterStatusCard';
import { ConfidenceIndicator } from './components/ConfidenceIndicator';
import { DisruptionAlertBanner } from './components/DisruptionAlertBanner';
import { WaterFingerprintCard } from './components/WaterFingerprintCard';
import { LocalityPulseMap } from './components/LocalityPulseMap';
import { ReportTimeline } from './components/ReportTimeline';
import { SubmitReportModal } from './components/SubmitReportModal';
import { EvidenceReportModal } from './components/EvidenceReportModal';
import { PreparednessGuideModal } from './components/PreparednessGuideModal';
import { MethodologyModal } from './components/MethodologyModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export function App() {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedLocalityId, setSelectedLocalityId] = useState<string>('mumbai-bandra-west');
  const [summary, setSummary] = useState<LocalitySummary | null>(null);
  const [reports, setReports] = useState<WaterReport[]>([]);
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [alerts, setAlerts] = useState<DisruptionAlert[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>('en');

  // Modals
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isPreparednessOpen, setIsPreparednessOpen] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load initial localities
  const loadLocalities = useCallback(async () => {
    try {
      const locs = await fetchLocalities();
      setLocalities(locs);
      if (locs.length > 0 && !selectedLocalityId) {
        setSelectedLocalityId(locs[0].id);
      }
    } catch (err: any) {
      console.warn("Could not load localities from API, check server.", err);
    }
  }, [selectedLocalityId]);

  // Load data for selected locality
  const loadLocalityData = useCallback(async (locId: string, showSpinner = true) => {
    if (!locId) return;
    if (showSpinner) setLoading(true);
    setError(null);

    try {
      const [sumRes, repRes, fpRes, alertRes] = await Promise.all([
        fetchLocalitySummary(locId),
        fetchReportsTimeline(locId, 50),
        fetchWaterFingerprint(locId),
        fetchActiveAlerts(locId)
      ]);

      setSummary(sumRes);
      setReports(repRes);
      setFingerprint(fpRes);
      setAlerts(alertRes);
    } catch (err: any) {
      console.error("Error loading locality data:", err);
      setError(err.message || "Failed to load neighbourhood water intelligence.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLocalities();
  }, [loadLocalities]);

  useEffect(() => {
    if (selectedLocalityId) {
      loadLocalityData(selectedLocalityId);
    }
  }, [selectedLocalityId, loadLocalityData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLocalities();
    loadLocalityData(selectedLocalityId, false);
  };

  const handleSelectLocality = (id: string) => {
    setSelectedLocalityId(id);
  };

  const totalReportsCount = localities.reduce((acc, l) => acc + (l.total_reports || 0), 0);
  const hasActiveAlert = alerts.length > 0 || !!summary?.alert;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navigation */}
      <Navbar
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenPreparedness={() => setIsPreparednessOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenReportCard={() => setIsReportCardOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Hero Civic Banner */}
      <HeroBanner
        totalReports={totalReportsCount || reports.length}
        activeLocalitiesCount={localities.length || 5}
        hasActiveAlert={hasActiveAlert}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        language={language}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error notification banner if any */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start space-x-3 text-rose-900 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Notice:</span> {error}
              <p className="mt-1 text-slate-600">
                The local mock/AWS Lambda endpoint is initializing. Click refresh below to retry.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold hover:bg-rose-50 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Locality Selector & City Filters */}
        <LocalitySelector
          localities={localities}
          selectedLocalityId={selectedLocalityId}
          onSelectLocality={handleSelectLocality}
          isLoading={loading}
        />

        {/* Dashboard Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Locality Intelligence Dashboard
            </span>
            {summary?.has_demo_data && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                DEMO LOCALITY DATA
              </span>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-600' : 'text-slate-400'}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>

        {/* Content Loading State */}
        {loading && !summary ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading locality intelligence...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving verified observations and baseline...</p>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            
            {/* Early Disruption Warning Alert (Feature C) */}
            <DisruptionAlertBanner
              alert={summary.alert}
              onOpenPreparedness={() => setIsPreparednessOpen(true)}
            />

            {/* Core Status & Signal Confidence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Locality Status Card (Feature A Snapshot) */}
              <div className="lg:col-span-7">
                <WaterStatusCard summary={summary} />
              </div>

              {/* Community Signal Confidence (Feature B) */}
              <div className="lg:col-span-5">
                <ConfidenceIndicator confidence={summary.confidence} />
              </div>

            </div>

            {/* Neighbourhood Water Fingerprint (Feature A Diurnal Profile) */}
            {fingerprint && (
              <WaterFingerprintCard fingerprint={fingerprint} />
            )}

            {/* Locality Pulse Map (Feature D) */}
            <LocalityPulseMap
              localities={localities}
              selectedLocalityId={selectedLocalityId}
              onSelectLocality={handleSelectLocality}
            />

            {/* Smart Water Report Timeline (Feature E) */}
            <ReportTimeline
              reports={reports}
              localityName={summary.locality.name}
            />

          </div>
        ) : null}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <SubmitReportModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        localities={localities}
        selectedLocalityId={selectedLocalityId}
        onReportSubmitted={handleRefresh}
      />

      <EvidenceReportModal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        localityId={selectedLocalityId}
      />

      <PreparednessGuideModal
        isOpen={isPreparednessOpen}
        onClose={() => setIsPreparednessOpen(false)}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        reports={reports}
        onReportModerated={handleRefresh}
      />

    </div>
  );
}

export default App;
