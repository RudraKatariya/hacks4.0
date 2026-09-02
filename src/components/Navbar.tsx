import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Trash2, 
  FileText, 
  Activity, 
  Award,
  Zap,
  Cpu
} from 'lucide-react';
import { Statement } from '../types';

interface NavbarProps {
  currentTab: 'upload' | 'transactions' | 'insights' | 'health' | 'privacy';
  setCurrentTab: (tab: 'upload' | 'transactions' | 'insights' | 'health' | 'privacy') => void;
  activeStatement: Statement | null;
  allStatements: Statement[];
  onSelectStatement: (stmt: Statement) => void;
  onOpenArchitectureGuide: () => void;
  onOpenPresetModal: () => void;
  onDeleteCurrentStatement: () => void;
  serverHealth: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeStatement,
  allStatements,
  onSelectStatement,
  onOpenArchitectureGuide,
  onOpenPresetModal,
  onDeleteCurrentStatement,
  serverHealth,
}) => {
  return (
    <header id="app_header" className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">Statement<span className="text-emerald-400">IQ</span></span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full">
                  Enterprise FinTech
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Bank Statement Intelligence &amp; Health Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              id="tab_upload"
              onClick={() => setCurrentTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'upload'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ingestion</span>
            </button>

            <button
              id="tab_transactions"
              disabled={!activeStatement}
              onClick={() => setCurrentTab('transactions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !activeStatement
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : currentTab === 'transactions'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Transactions</span>
              {activeStatement?.total_transactions ? (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  currentTab === 'transactions' ? 'bg-slate-950/40 text-slate-900' : 'bg-slate-800 text-slate-300'
                }`}>
                  {activeStatement.total_transactions}
                </span>
              ) : null}
            </button>

            <button
              id="tab_insights"
              disabled={!activeStatement}
              onClick={() => setCurrentTab('insights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !activeStatement
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : currentTab === 'insights'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>

            <button
              id="tab_health"
              disabled={!activeStatement}
              onClick={() => setCurrentTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                !activeStatement
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : currentTab === 'health'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Health Score</span>
            </button>

            <button
              id="tab_privacy"
              onClick={() => setCurrentTab('privacy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'privacy'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy &amp; Data Control</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Preset Launcher for Sample Statements */}
            <button
              id="btn_demo_presets"
              onClick={onOpenPresetModal}
              className="px-2.5 py-1.5 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 hover:from-teal-500/20 hover:to-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              title="Load pre-configured sample financial datasets"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Demo Datasets</span>
            </button>

            {/* Architecture Specification & Methodology */}
            <button
              id="btn_architecture_guide"
              onClick={onOpenArchitectureGuide}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Platform Architecture & Technical Methodology"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Architecture Spec</span>
            </button>

            {/* Statement Switcher dropdown if multiple exist */}
            {allStatements.length > 1 && (
              <select
                id="select_statement"
                value={activeStatement?.id || ''}
                onChange={(e) => {
                  const found = allStatements.find((s) => s.id === e.target.value);
                  if (found) onSelectStatement(found);
                }}
                className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 max-w-[130px] sm:max-w-[160px] truncate"
              >
                {allStatements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.bank_name || s.filename} ({s.total_transactions} tx)
                  </option>
                ))}
              </select>
            )}

            {/* Quick hard delete for active statement */}
            {activeStatement && (
              <button
                id="btn_quick_delete"
                onClick={onDeleteCurrentStatement}
                title="Permanently erase this statement & derived data"
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-rose-900/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Server Status Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${serverHealth ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{serverHealth ? 'AI Engine Online' : 'Connecting'}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
