import React from 'react';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { FinancialSummary, Statement, FinancialHealthScore } from '../types';

interface AiInsightsViewProps {
  statement: Statement | null;
  summary: FinancialSummary | null;
  healthScore: FinancialHealthScore | null;
  isGeneratingSummary: boolean;
  onRegenerateSummary?: () => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  statement,
  summary,
  healthScore,
  isGeneratingSummary,
  onRegenerateSummary,
}) => {
  if (!summary) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
        <p>Synthesizing financial intelligence narrative...</p>
      </div>
    );
  }

  const totalPotentialSavings = summary.actionable_suggestions.reduce((s, a) => s + a.potential_monthly_savings, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Financial Intelligence &amp; Recommendations</h2>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Executive financial summary, key behavioral observations, and actionable savings opportunities
          </p>
        </div>

        {onRegenerateSummary && (
          <button
            onClick={onRegenerateSummary}
            disabled={isGeneratingSummary}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingSummary ? 'Synthesizing...' : 'Regenerate Narrative'}</span>
          </button>
        )}
      </div>

      {/* Executive Summary Card */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">Executive Summary</h3>
        </div>

        <p className="text-sm font-semibold text-slate-800 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
          {summary.executive_summary}
        </p>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed pt-2">
          {summary.detailed_paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      {/* Key Behavioral Observations */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Key Spending Observations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.key_observations.map((obs, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Savings Opportunities */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Actionable Savings Opportunities</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Total Potential: ~₹{totalPotentialSavings.toLocaleString()}/month
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.actionable_suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">
                    {sug.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">{sug.impact} Impact</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{sug.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{sug.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">EST. SAVINGS</span>
                <span className="text-emerald-600 font-extrabold text-sm">+₹{sug.potential_monthly_savings.toLocaleString()}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
