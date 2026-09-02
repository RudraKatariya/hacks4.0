import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  FileText,
  Activity,
  Layers,
  BookOpen,
  Lock,
  Workflow
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'methodology' | 'pipeline' | 'schema'>('methodology');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Platform Architecture &amp; Analytics Methodology
              </h2>
              <p className="text-xs text-slate-400">AI-Based Bank Statement Intelligence • Enterprise Financial Diagnostics Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('methodology')}
            className={`pb-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'methodology' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Core Capabilities &amp; Standards</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pipeline' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-4 h-4" />
            <span>Technical Pipeline &amp; AI Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'schema' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>PostgreSQL Enterprise Schema (DDL)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Tab 1: Core Capabilities & Standards */}
          {activeTab === 'methodology' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Multi-Format Ingestion */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    1. Multi-Format Ingestion &amp; OCR
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">Multi-Modal</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Processes digital PDFs with coordinate text extraction, physical paper statements via <strong>multimodal Gemini 3.7 Vision OCR</strong>, and raw banking SMS alert streams with specialized polarity and balance extractors.
                </p>
              </div>

              {/* Strict Structured AI Pipeline */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    2. Schema-Validated AI Pipeline
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">Strict Typing</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Enforces strict JSON schema generation with automated retry fallback mechanisms to eliminate regex parsing errors and ensure guaranteed data typing for merchant normalization and expense categorizations.
                </p>
              </div>

              {/* Statistical & Anomaly Detection */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    3. Statistical Outlier Detection
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">Z-Score &gt; 2.0σ</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Identifies unusual spending spikes using Gaussian distribution statistics coupled with plain-language contextual explanations labeled strictly as <em>"Flagged for review"</em> for banking compliance.
                </p>
              </div>

              {/* Cadence & Recurring Payments */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    4. Recurring Cadence Detection
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">Temporal Logic</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Analyzes interval deltas (weekly, bi-weekly, monthly) to surface subscription burdens, next expected debit dates, and projected annualized commitments.
                </p>
              </div>

              {/* Transparent Financial Health */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    5. Deterministic Health Scoring
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">100% Auditable</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Computes a 0–100 composite financial health score with transparent mathematical factor formulas (savings retention, fixed burden, discretionary ratio, and anomaly frequency) paired with rupee-denominated savings suggestions.
                </p>
              </div>

              {/* Data Privacy & Hard Delete */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    6. Privacy &amp; Cryptographic Purge
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">Zero Residual</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Complete user data autonomy with instant hard deletion endpoints that purge memory buffers, database rows, vector caches, and AI summaries with an auditable cryptographic audit trail.
                </p>
              </div>

            </div>
          )}

          {/* Tab 2: Technical Pipeline */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-bold text-white text-sm">Automated 5-Stage Financial Processing Pipeline</h4>
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-900 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                    <div>
                      <p className="font-bold text-white">Ingestion &amp; Mime Type Dispatch</p>
                      <p className="text-slate-400 text-[11px]">Directs payload to digital PDF stream extraction, Gemini 3.7 Vision OCR, or banking SMS alert parser based on content headers.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                    <div>
                      <p className="font-bold text-white">Strict JSON Extraction &amp; Verification</p>
                      <p className="text-slate-400 text-[11px]">Strict schema enforcement verifies dates, normalized descriptions, amount values, debit/credit polarity, and running balances.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">3</span>
                    <div>
                      <p className="font-bold text-white">Single-Pass Batch Categorization</p>
                      <p className="text-slate-400 text-[11px]">Performs batched LLM classification across 11 standardized spend categories with confidence scoring to minimize latency.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">4</span>
                    <div>
                      <p className="font-bold text-white">Statistical &amp; Temporal Analytics Engine</p>
                      <p className="text-slate-400 text-[11px]">Calculates category-specific standard deviations for outlier flags (Z &gt; 2.0σ) and computes recurring subscription cycles.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">5</span>
                    <div>
                      <p className="font-bold text-white">Composite Financial Health Scoring &amp; AI Diagnosis</p>
                      <p className="text-slate-400 text-[11px]">Evaluates weighted financial resilience pillars and synthesizes executive observations and savings recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: PostgreSQL Schema DDL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">PostgreSQL Production Schema Ready</h4>
                  <span className="text-slate-400 text-[10px] font-mono">ANSI SQL / PostgreSQL 15+</span>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
{`-- StatementIQ Relational Production DDL
CREATE TABLE statements (
    id VARCHAR(64) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    input_type VARCHAR(32) NOT NULL,
    bank_name VARCHAR(128),
    account_holder VARCHAR(128),
    account_number_masked VARCHAR(32),
    currency VARCHAR(8) DEFAULT 'INR',
    status VARCHAR(32) NOT NULL,
    total_transactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id VARCHAR(64) PRIMARY KEY,
    statement_id VARCHAR(64) REFERENCES statements(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    merchant VARCHAR(128),
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(16) NOT NULL CHECK (type IN ('credit', 'debit')),
    category VARCHAR(64) NOT NULL,
    balance NUMERIC(12, 2),
    reference_no VARCHAR(64),
    confidence_score NUMERIC(4, 3),
    is_anomaly BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tx_statement ON transactions(statement_id);
CREATE INDEX idx_tx_category ON transactions(category);
CREATE INDEX idx_tx_date ON transactions(date);`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Enterprise-grade architecture • Built with Gemini 3.7 Flash
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors"
          >
            Close Spec
          </button>
        </div>

      </div>
    </div>
  );
};
