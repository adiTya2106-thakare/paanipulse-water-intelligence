import React from 'react';
import { Activity, ShieldAlert, Users, Cloud, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  totalReports: number;
  activeLocalitiesCount: number;
  hasActiveAlert: boolean;
  onOpenSubmit: () => void;
  language: 'en' | 'hi' | 'mr';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalReports,
  activeLocalitiesCount,
  hasActiveAlert,
  onOpenSubmit,
  language
}) => {
  const titles = {
    en: "Know your neighbourhood's water situation before the tap runs dry.",
    hi: "नल सूखने से पहले जानें अपने मोहल्ले में पानी की स्थिति।",
    mr: "नळ कोरडा पडण्याआधी जाणून घ्या आपल्या परिसरातील पाण्याची स्थिती."
  };

  const descriptions = {
    en: "India's community-powered water intelligence network. We transform scattered WhatsApp alerts, neighbour calls, and ground observations into explainable neighbourhood water signals.",
    hi: "भारत का सामुदायिक जल सूचना नेटवर्क। हम व्हाट्सऐप संदेशों और पड़ोसियों के अनुमानों को स्पष्ट और पारदर्शी जल संकेतों में बदलते हैं।",
    mr: "भारताचे समुदाय-चालित पाणी गुप्तचर नेटवर्क. आम्ही विखुरलेल्या व्हॉट्सअॅप मेसेज आणि अंदाजांना स्पष्ट मोहल्ला पातळीवरील सिग्नलमध्ये रूपांतरित करतो."
  };

  return (
    <div className="bg-gradient-to-b from-navy-900 via-navy-950 to-slate-900 text-white pt-8 pb-10 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hackathon Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Techfest 2026–27 Campus to Cloud Hackathon (AWS)</span>
          </div>

          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>AWS Serverless: API Gateway + Lambda + DynamoDB</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Title & Subtitle */}
          <div className="lg:col-span-8 space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {titles[language]}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {descriptions[language]}
            </p>

            {/* Transparency Note */}
            <div className="flex items-start space-x-2 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-xl max-w-2xl">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Civic Data Transparency:</strong> PAANIPULSE aggregates voluntary resident observations and historical baselines. We do not claim municipal pipeline telemetry or replace official Jal Sansthan notices.
              </span>
            </div>
          </div>

          {/* Quick Metrics & Live State Box */}
          <div className="lg:col-span-4 bg-navy-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Live Intelligence Pulse</span>
              </span>
              <span className="text-[11px] bg-slate-700/60 px-2 py-0.5 rounded text-cyan-300 font-mono">
                Active 24h
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Observations</span>
                </div>
                <div className="text-xl font-extrabold text-white mt-1">
                  {totalReports}
                </div>
                <div className="text-[10px] text-slate-400">Locality reports</div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Early Warning</span>
                </div>
                <div className="text-xl font-extrabold text-amber-400 mt-1">
                  {hasActiveAlert ? "1 Active" : "Nominal"}
                </div>
                <div className="text-[10px] text-slate-400">Baseline deviation</div>
              </div>
            </div>

            <button
              onClick={onOpenSubmit}
              className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-[0.98]"
            >
              <span>Contribute an Observation Now</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
