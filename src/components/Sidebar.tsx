import React, { useRef } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Repeat, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Settings, 
  Upload, 
  Lock,
  Layers,
  FileSpreadsheet,
  MessageSquare
} from 'lucide-react';
import { Statement } from '../types';

export type NavTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'analytics' 
  | 'recurring' 
  | 'anomalies' 
  | 'health' 
  | 'insights' 
  | 'reports' 
  | 'privacy';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeStatement: Statement | null;
  onFileUpload: (file: File) => void;
  onOpenUploadModal: () => void;
  isProcessing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeStatement,
  onFileUpload,
  onOpenUploadModal,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <CreditCard className="w-4 h-4" />, badge: activeStatement ? `${activeStatement.total_transactions}` : undefined },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'recurring', label: 'Recurring Payments', icon: <Repeat className="w-4 h-4" /> },
    { id: 'anomalies', label: 'Anomaly Detection', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'health', label: 'Financial Health', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'privacy', label: 'Settings & Privacy', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside 
      id="app_sidebar"
      className="w-64 bg-[#090D16] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none overflow-y-auto"
    >
      {/* Brand Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight overflow-hidden">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              AI-Based Bank Statement Intelligence
            </h1>
            <p className="text-[11px] text-indigo-300/80 font-medium">Bank Statement Analyzer</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav_tab_${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle/Bottom Upload Box & Privacy Note */}
      <div className="p-4 space-y-4">
        
        {/* Upload Statement Widget */}
        <div className="p-3.5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Upload New Statement</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-xl p-3 text-center cursor-pointer transition-colors group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.png,.jpg,.jpeg,.csv,.txt" 
              className="hidden" 
            />
            <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-medium text-slate-300 mt-1.5">Drag &amp; Drop your file here</p>
            <p className="text-[10px] text-slate-500">PDF, CSV, Excel or Image</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              onClick={onOpenUploadModal}
              title="Open full upload interface with SMS Stream"
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Supported Formats */}
          <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
            <span className="text-slate-400 font-semibold block">Supported Formats</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-400" /> PDF Statement
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-400" /> CSV / Excel
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-400" /> SMS / Text
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-400" /> Images (JPG, PNG)
              </span>
            </div>
          </div>
        </div>

        {/* Security & Privacy Banner */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800/70 rounded-xl flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
          <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>Your data is encrypted and secure. We never share your financial information.</span>
        </div>

      </div>
    </aside>
  );
};
