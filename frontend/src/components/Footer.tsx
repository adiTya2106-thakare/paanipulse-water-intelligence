import React from 'react';
import { Droplets, Cloud, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-xs border-t border-slate-800/80 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="font-black text-lg text-white tracking-tight">
                PAANI<span className="text-cyan-400">PULSE</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              India's Community-Powered Water Intelligence and Early Disruption Detection Network. Transforming scattered neighbour observations into transparent, explainable water signals for Indian localities.
            </p>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <span>Built for</span>
              <span className="text-cyan-300 font-semibold">Techfest 2026–27 Campus to Cloud Hackathon (AWS)</span>
            </div>
          </div>

          {/* Cloud Architecture */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Cloud className="w-3.5 h-3.5 text-amber-400" />
              <span>AWS Cloud Stack</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• Amazon API Gateway (HTTP API v2)</li>
              <li>• AWS Lambda (Python 3.12 Serverless)</li>
              <li>• Amazon DynamoDB (On-Demand PAYG)</li>
              <li>• AWS Amplify Hosting & S3 Edge</li>
              <li>• Amazon CloudWatch Log Alarms</li>
            </ul>
          </div>

          {/* Civic Ethics */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Civic Trust Principles</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• Zero private home address collection</li>
              <li>• Device token rate-limiting (anti-spam)</li>
              <li>• Transparent 100-point confidence formula</li>
              <li>• Explainable anomaly detection baseline</li>
              <li>• Open-source community code (MIT)</li>
            </ul>
          </div>

        </div>

        {/* Disclaimer Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            &copy; 2026 PAANIPULSE Civic Project. Released under MIT Open Source License.
          </p>
          <p className="text-center sm:text-right max-w-xl">
            PAANIPULSE displays voluntary crowd-reported observations. It is not an official municipal sensor telemetry system and does not replace statutory water authority circulars.
          </p>
        </div>

      </div>
    </footer>
  );
};

