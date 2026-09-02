import React from 'react';
import { 
  Calendar, 
  Bell, 
  Zap, 
  Cpu, 
  ChevronDown, 
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Statement } from '../types';

interface TopHeaderProps {
  activeStatement: Statement | null;
  allStatements: Statement[];
  onSelectStatement: (statement: Statement) => void;
  onOpenPresetModal: () => void;
  onOpenArchitectureGuide: () => void;
  anomaliesCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeStatement,
  allStatements,
  onSelectStatement,
  onOpenPresetModal,
  onOpenArchitectureGuide,
  anomaliesCount,
}) => {
  const accountHolder = activeStatement?.account_holder || 'Ojas Goyal';
  const initials = accountHolder
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'OG';

  const bankName = activeStatement?.bank_name || 'HDFC Bank';
  const period = activeStatement?.date_range 
    ? `${activeStatement.date_range.start.slice(0, 7)} - ${activeStatement.date_range.end.slice(0, 7)}`
    : 'Aug 2025';

  return (
    <header 
      id="top_header"
      className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Greeting */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {accountHolder.split(' ')[0]}!</span>
            <span className="text-xl">👋</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Here's your financial overview for <span className="text-slate-800 font-semibold">{period}</span> ({bankName})
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Period Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{period}</span>
          </div>

          {/* Preset Datasets Button */}
          <button
            id="btn_top_demo_presets"
            onClick={onOpenPresetModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Load 1-Click pre-configured banking datasets"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden md:inline">Demo Datasets</span>
          </button>

          {/* Architecture Spec Button */}
          <button
            id="btn_top_architecture"
            onClick={onOpenArchitectureGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            title="Platform Architecture and Technical Pipeline"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline">Architecture Spec</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 border border-slate-200 transition-colors relative"
              title={`${anomaliesCount} alerts`}
            >
              <Bell className="w-4 h-4" />
              {anomaliesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {anomaliesCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                {accountHolder}
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight font-medium">Verified Account</span>
            </div>
          </div>

          {/* Switch statement if multiple statements exist */}
          {allStatements.length > 1 && (
            <select
              value={activeStatement?.id || ''}
              onChange={(e) => {
                const found = allStatements.find((s) => s.id === e.target.value);
                if (found) onSelectStatement(found);
              }}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {allStatements.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.bank_name || 'Bank'} ({s.total_transactions} txs)
                </option>
              ))}
            </select>
          )}

        </div>

      </div>
    </header>
  );
};
