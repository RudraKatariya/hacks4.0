import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  ArrowUpRight,
  Filter,
  Check
} from 'lucide-react';
import { Anomaly, Statement } from '../types';

interface AnomaliesViewProps {
  statement: Statement | null;
  anomalies: Anomaly[];
  onDismissAnomaly?: (anomalyId: string) => void;
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  statement,
  anomalies,
  onDismissAnomaly,
}) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Unusual Spending &amp; Anomaly Detection</h2>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
              {anomalies.length} Flagged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statistical deviation (&gt;2σ), duplicate charge detection, and plain-English AI explanations
          </p>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-amber-900 text-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Banking Compliance Notice:</strong> Flagged items represent statistical deviations or duplicate patterns designated for review. They are not definitive fraud confirmations.
        </span>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Anomalies Detected</h3>
            <p className="text-xs text-slate-500">All statement transactions align with standard expenditure patterns.</p>
          </div>
        ) : (
          anomalies.map((anom) => (
            <div
              key={anom.id}
              className="p-5 bg-white border border-amber-200/80 rounded-2xl shadow-xs space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-bold uppercase tracking-wider">
                    {anom.flag_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{anom.date}</span>
                </div>
                <span className="text-base font-black text-rose-600 font-mono">
                  - ₹{anom.amount.toLocaleString()}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{anom.description}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Category: {anom.category}</p>
              </div>

              {/* AI Explanation */}
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong className="text-amber-950 flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  AI Flag Diagnosis:
                </strong>
                {anom.why_plain_language}
              </div>

              {anom.z_score !== undefined && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Statistical Deviation: Z-Score = {anom.z_score}σ</span>
                  <span className="text-emerald-600 font-semibold">User Review Pending</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
