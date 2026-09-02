import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Building2,
  Lock
} from 'lucide-react';
import { InputType } from '../types';

interface UploadViewProps {
  onUploadFile: (file: File, bankName?: string) => Promise<void>;
  onUploadSms: (smsText: string, bankName?: string) => Promise<void>;
  onLoadPreset: (presetId: string) => Promise<void>;
  isProcessing: boolean;
  processingStep: string;
  error: string | null;
}

export const UploadView: React.FC<UploadViewProps> = ({
  onUploadFile,
  onUploadSms,
  onLoadPreset,
  isProcessing,
  processingStep,
  error,
}) => {
  const [ingestMode, setIngestMode] = useState<'file' | 'sms'>('file');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState('HDFC Bank');
  const [customBank, setCustomBank] = useState('');
  const [smsText, setSmsText] = useState(
`Dear Customer, Rs. 1,25,000.00 credited to your A/c XX4091 on 01-Jul-24 by ECS towards SALARY FOR JUN 2024. Avl Bal Rs 1,42,450.00. - HDFC Bank

Dear SBI User, Rs 18,500.00 debited from A/c 2841 on 02-Jul-24 towards SBI HOME LOAN EMI. Available Balance: INR 1,23,950.00. - SBI

Sent Rs. 450.00 from HDFC A/c ...4091 to Swiggy UPI on 03-Jul-24. Ref: 41829301. Avl Bal: Rs 1,23,500.00.

Your HDFC Credit Card ending 4402 was used for Rs 649.00 at NETFLIX COM on 04-Jul-2024. Avl Limit Rs 1,84,000.

Paid Rs. 2,450.00 to BESCOM ELECTRICITY via Paytm UPI on 05-Jul-2024. Avl Bal Rs 1,21,050.00.

Sent Rs. 1,290.00 to Blinkit Grocery on 08-Jul-24 from A/c XX4091. Bal Rs 1,19,760.00.

Dear Customer, Rs. 48,990.00 debited from HDFC A/c XX4091 on 12-Jul-24 at CROMA RETAIL BANGALORE. Avl Bal Rs 70,770.00.

Sent Rs. 850.00 to Zomato UPI on 15-Jul-24. Ref 49201923. Bal Rs 69,920.00.
Sent Rs. 850.00 to Zomato UPI on 15-Jul-24. Ref 49201923. Bal Rs 69,070.00.

Your A/c XX4091 is debited for Rs 1,179.00 on 18-Jul-24 towards AIRTEL FIBRE BILL. Avl Bal Rs 67,891.00.`
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const finalBank = customBank.trim() || bankName;
    if (ingestMode === 'file' && selectedFile) {
      await onUploadFile(selectedFile, finalBank);
    } else if (ingestMode === 'sms' && smsText.trim()) {
      await onUploadSms(smsText, finalBank);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen Financial Intelligence • Multi-Format Statement Diagnostics
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Transform Raw Statements into <span className="text-emerald-400">Actionable Financial Health</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Extract multi-format statements (Digital PDF, Scanned OCR, or Bank SMS Alerts), categorize expenses with strict JSON verification, detect anomalous spikes, and compute deep financial health analytics.
        </p>
      </div>

      {/* Interactive Demo Datasets */}
      <div id="section_demo_presets" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Demo Datasets (Instant 1-Click Load)</h3>
              <p className="text-xs text-slate-400">Pre-configured real-world banking datasets for instant zero-friction demonstration</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 self-start sm:self-auto">
            Ready-to-Explore
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Preset 1 */}
          <button
            id="preset_btn_hdfc"
            disabled={isProcessing}
            onClick={() => onLoadPreset('sample_hdfc_salaried')}
            className="group text-left p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all duration-200 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px] font-bold">
                  Digital PDF • 3-Month
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                HDFC Bank Salaried Account
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                3 months of salary credits, fixed rent, recurring OTT/cloud, food delivery, and 2 flagged anomaly patterns.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>30 Transactions</span>
              <span className="text-emerald-400 font-semibold">Score: 78/100</span>
            </div>
          </button>

          {/* Preset 2 */}
          <button
            id="preset_btn_icici"
            disabled={isProcessing}
            onClick={() => onLoadPreset('sample_icici_scanned')}
            className="group text-left p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all duration-200 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded text-[10px] font-bold">
                  Vision OCR • Scanned PDF
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                ICICI Consultant &amp; Retail
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Simulates physical paper statement captured via scanner/camera with irregular freelance payouts and medical expenses.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>10 Transactions</span>
              <span className="text-emerald-400 font-semibold">Score: 82/100</span>
            </div>
          </button>

          {/* Preset 3 */}
          <button
            id="preset_btn_sms"
            disabled={isProcessing}
            onClick={() => onLoadPreset('sample_sms_feed')}
            className="group text-left p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all duration-200 relative flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                  SMS Alert Stream • Multi-Bank
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Indian Bank SMS Alerts Feed
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Real-world bank transaction SMS messages (HDFC, SBI, Paytm UPI) with duplicate charges and high-value POS alert.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>10 SMS Alerts</span>
              <span className="text-emerald-400 font-semibold">Score: 71/100</span>
            </div>
          </button>

        </div>
      </div>

      {/* Main Ingestion Card */}
      <div id="card_upload_engine" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Toggle Mode: File Upload vs SMS Text Block */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="mode_btn_file"
              onClick={() => setIngestMode('file')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                ingestMode === 'file'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Statement PDF / Scanned Image</span>
            </button>
            <button
              id="mode_btn_sms"
              onClick={() => setIngestMode('sms')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                ingestMode === 'sms'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Paste Bank SMS Alerts Block</span>
            </button>
          </div>

          {/* Bank Affiliation Selector */}
          <div className="flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Target Bank:</span>
            <select
              id="select_bank_provider"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-400"
            >
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="State Bank of India">State Bank of India (SBI)</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              <option value="Paytm Payments Bank">Paytm Payments Bank</option>
              <option value="Custom / International">Custom / Other Bank</option>
            </select>
          </div>
        </div>

        {/* Mode 1: Drag-and-Drop File Upload */}
        {ingestMode === 'file' && (
          <div className="space-y-4">
            <div
              id="file_dropzone"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-emerald-400 bg-emerald-950/20 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-slate-950/60'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-medium">Click to replace file</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      Drag &amp; drop bank statement PDF or scanned image here
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports Digital PDF, Scanned Image PDF, JPEG, PNG (up to 25MB)
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Bank-grade client encryption &amp; zero log persistence
              </span>
              <span>Supported: PDF, JPG, PNG, WEBP</span>
            </div>
          </div>
        )}

        {/* Mode 2: SMS Bank Alerts Block */}
        {ingestMode === 'sms' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="textarea_sms_feed" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Raw Bank Transaction SMS Alerts
              </label>
              <button
                type="button"
                onClick={() => setSmsText('')}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                Clear Text
              </button>
            </div>
            <textarea
              id="textarea_sms_feed"
              rows={8}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Paste multiple bank debit/credit SMS messages here..."
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-3.5 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500/50 transition-all resize-y"
            />
            <p className="text-[11px] text-slate-400">
              * The engine automatically identifies amount, debit/credit polarity, merchant VPA, balance, and dates from standard Indian banking SMS templates.
            </p>
          </div>
        )}

        {/* Error Banner if any */}
        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Extraction Warning:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Action Button & Processing Progress Indicator */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>SQLite Storage • PostgreSQL Scale Ready</span>
          </div>

          <button
            id="btn_submit_ingest"
            disabled={isProcessing || (ingestMode === 'file' && !selectedFile) || (ingestMode === 'sms' && !smsText.trim())}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isProcessing || (ingestMode === 'file' && !selectedFile) || (ingestMode === 'sms' && !smsText.trim())
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 font-extrabold cursor-pointer hover:scale-[1.02]'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{processingStep || 'Processing Pipeline...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Statement Intelligence</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Trust & Architecture Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-400">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Strict Schema Validation
          </div>
          <p className="text-xs text-slate-400">
            Automated retry fallback prevents fragile LLM regex errors; guarantees 100% typed structured JSON.
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Zap className="w-4 h-4" />
            Batch Categorization
          </div>
          <p className="text-xs text-slate-400">
            Categorizes all transactions in a single batch LLM call to slash latency and optimize cost.
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            Zero-Leakage Hard Deletion
          </div>
          <p className="text-xs text-slate-400">
            Fully wired DELETE endpoint purges raw buffers and derived records with an auditable cryptographic log.
          </p>
        </div>
      </div>

    </div>
  );
};
