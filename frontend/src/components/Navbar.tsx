import React, { useState } from 'react';
import { Droplets, ShieldCheck, FileText, HelpCircle, Lock, PlusCircle, Globe } from 'lucide-react';

interface NavbarProps {
  onOpenSubmit: () => void;
  onOpenMethodology: () => void;
  onOpenPreparedness: () => void;
  onOpenAdmin: () => void;
  onOpenReportCard: () => void;
  language: 'en' | 'hi' | 'mr';
  onLanguageChange: (lang: 'en' | 'hi' | 'mr') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmit,
  onOpenMethodology,
  onOpenPreparedness,
  onOpenAdmin,
  onOpenReportCard,
  language,
  onLanguageChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-navy-900 border-b border-navy-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  PAANI<span className="text-cyan-400">PULSE</span>
                </span>
                <span className="bg-cyan-900/60 text-cyan-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-cyan-700/50">
                  CIVIC AWS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Community Water Intelligence & Disruption Detection
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onOpenMethodology}
              className="text-xs text-slate-300 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>How It Works</span>
            </button>

            <button
              onClick={onOpenPreparedness}
              className="text-xs text-slate-300 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preparedness</span>
            </button>

            <button
              onClick={onOpenReportCard}
              className="text-xs text-slate-300 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Evidence Audit</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded font-medium ${language === 'en' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-1.5 py-0.5 rounded font-medium ${language === 'hi' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('mr')}
                className={`px-1.5 py-0.5 rounded font-medium ${language === 'mr' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                मराठी
              </button>
            </div>

            {/* Admin trigger */}
            <button
              onClick={onOpenAdmin}
              title="Moderation Console"
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>

            {/* Primary CTA */}
            <button
              onClick={onOpenSubmit}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Report Water Status</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onOpenSubmit}
              className="bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-navy-800 px-4 py-3 space-y-2">
          <button
            onClick={() => { onOpenMethodology(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm text-slate-300 flex items-center space-x-2"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>How PAANIPULSE Works</span>
          </button>
          <button
            onClick={() => { onOpenPreparedness(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm text-slate-300 flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Water Preparedness Guide</span>
          </button>
          <button
            onClick={() => { onOpenReportCard(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm text-slate-300 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Download Evidence Report</span>
          </button>
          <button
            onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm text-slate-400 flex items-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>Moderator Console</span>
          </button>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Language:</span>
            <div className="flex space-x-2">
              <button onClick={() => onLanguageChange('en')} className={`px-2 py-1 rounded ${language === 'en' ? 'bg-cyan-500 text-slate-950 font-bold' : ''}`}>English</button>
              <button onClick={() => onLanguageChange('hi')} className={`px-2 py-1 rounded ${language === 'hi' ? 'bg-cyan-500 text-slate-950 font-bold' : ''}`}>हिन्दी</button>
              <button onClick={() => onLanguageChange('mr')} className={`px-2 py-1 rounded ${language === 'mr' ? 'bg-cyan-500 text-slate-950 font-bold' : ''}`}>मराठी</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
