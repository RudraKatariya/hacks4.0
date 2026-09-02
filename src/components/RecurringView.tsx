import React from 'react';
import { 
  Repeat, 
  Calendar, 
  Sparkles, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Tv,
  Smartphone,
  Shield,
  Zap,
  Tag
} from 'lucide-react';
import { RecurringPayment, Statement } from '../types';

interface RecurringViewProps {
  statement: Statement | null;
  recurring: RecurringPayment[];
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  statement,
  recurring,
}) => {
  const totalMonthly = recurring.reduce((s, r) => s + (r.frequency === 'Weekly' ? r.amount * 4.33 : r.amount), 0);
  const totalAnnual = recurring.reduce((s, r) => s + r.annual_cost_estimate, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recurring Subscriptions &amp; Commitments</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
              {recurring.length} Streams Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated periodicity detection, estimated cadence, and projected annual burden
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium block">MONTHLY RUN RATE</span>
            <span className="text-lg font-black text-slate-900 font-mono">₹{Math.round(totalMonthly).toLocaleString()} / mo</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">IDENTIFIED SUBSCRIPTIONS</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{recurring.length}</p>
          <p className="text-xs text-blue-600 font-medium mt-1">Cadence matched</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">PROJECTED ANNUAL COMMITMENT</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">₹{totalAnnual.toLocaleString()}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">12-month forward run rate</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4.5 rounded-2xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">UPCOMING RENEWALS</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">Next 30 Days</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Auto-debit alert active</p>
        </div>
      </div>

      {/* Recurring Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurring.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white border border-slate-200/80 rounded-2xl text-slate-400">
            <Repeat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No recurring payment cadences found in this statement.</p>
          </div>
        ) : (
          recurring.map((rec) => (
            <div
              key={rec.id}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-sm border border-indigo-100">
                      {rec.merchant.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{rec.merchant}</h4>
                      <span className="text-xs text-slate-500">{rec.category}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold">
                    {rec.frequency}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">BILLING AMOUNT</span>
                    <span className="text-slate-900 font-bold font-mono text-sm">₹{rec.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EST. ANNUAL</span>
                    <span className="text-indigo-600 font-bold font-mono text-sm">₹{rec.annual_cost_estimate.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Next Due: <strong className="text-slate-700">{rec.next_expected_date}</strong>
                </span>
                <span className="text-emerald-600 font-semibold">{rec.transaction_count} recurring cycles</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
