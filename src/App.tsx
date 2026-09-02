import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { RecurringView } from './components/RecurringView';
import { AnomaliesView } from './components/AnomaliesView';
import { FinancialHealthView } from './components/FinancialHealthView';
import { AiInsightsView } from './components/AiInsightsView';
import { ReportsView } from './components/ReportsView';
import { PrivacyView } from './components/PrivacyView';
import { UploadView } from './components/UploadView';
import { UploadModal } from './components/UploadModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { 
  Statement, 
  Transaction, 
  TransactionCategory, 
  AnalyticsData, 
  RecurringPayment, 
  Anomaly, 
  FinancialHealthScore, 
  FinancialSummary 
} from './types';
import { CheckCircle2, Sparkles, Menu, X } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [allStatements, setAllStatements] = useState<Statement[]>([]);
  const [activeStatement, setActiveStatement] = useState<Statement | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recurring, setRecurring] = useState<RecurringPayment[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load all derived data for a specific statement ID
  const loadStatementDetails = useCallback(async (statementId: string) => {
    try {
      const [stmtRes, analRes, recRes, anomRes, healthRes, sumRes] = await Promise.all([
        fetch('/api/statements'),
        fetch(`/api/analytics/${statementId}`),
        fetch(`/api/recurring/${statementId}`),
        fetch(`/api/anomalies/${statementId}`),
        fetch(`/api/health-score/${statementId}`),
        fetch(`/api/summary/${statementId}`),
      ]);

      if (stmtRes.ok) {
        const d = await stmtRes.json();
        const found = d.statements?.find((s: Statement) => s.id === statementId);
        if (found) setActiveStatement(found);
      }

      if (analRes.ok) {
        const d = await analRes.json();
        setAnalytics(d.analytics);
      }

      if (recRes.ok) {
        const d = await recRes.json();
        setRecurring(d.recurring || []);
      }

      if (anomRes.ok) {
        const d = await anomRes.json();
        setAnomalies(d.anomalies || []);
      }

      if (healthRes.ok) {
        const d = await healthRes.json();
        setHealthScore(d.healthScore);
      }

      if (sumRes.ok) {
        const d = await sumRes.json();
        setSummary(d.summary);
      }

      // Also fetch structured transactions
      const txRes = await fetch(`/api/categorize/${statementId}`, { method: 'POST' });
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.transactions) setTransactions(txData.transactions);
      }
    } catch (err: any) {
      console.error('Error loading statement details:', err);
    }
  }, []);

  // Fetch all existing statements on mount
  const fetchStatements = useCallback(async () => {
    try {
      const res = await fetch('/api/statements');
      if (res.ok) {
        const data = await res.json();
        setAllStatements(data.statements || []);
        if (data.statements && data.statements.length > 0) {
          loadStatementDetails(data.statements[0].id);
        } else {
          // If no statements exist yet, auto seed the standard HDFC statement preset
          handleLoadPreset('preset_hdfc_monthly');
        }
      }
    } catch (e) {
      console.error('Error fetching statements:', e);
    }
  }, [loadStatementDetails]);

  useEffect(() => {
    fetchStatements();
  }, []);

  // Pipeline Execution for Fresh Uploads (PDF / Image / SMS)
  const runFullPipeline = async (statementId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Extract Transactions
      setProcessingStep('Extracting transactions via deterministic regex & OCR parser...');
      const extractRes = await fetch(`/api/extract/${statementId}`, { method: 'POST' });
      const extractData = await extractRes.json();

      if (!extractRes.ok) {
        throw new Error(extractData.error || 'Extraction failed');
      }

      setTransactions(extractData.transactions || []);

      // Step 2: Batch Categorization AI
      setProcessingStep('AI single-pass batch categorization...');
      const catRes = await fetch(`/api/categorize/${statementId}`, { method: 'POST' });
      const catData = await catRes.json();
      if (catRes.ok && catData.transactions) {
        setTransactions(catData.transactions);
      }

      // Step 3: Statistical Anomalies & Recurring Cadence Detection
      setProcessingStep('Detecting anomaly Z-scores & recurring cadence...');
      const [anomRes, recRes, analRes] = await Promise.all([
        fetch(`/api/anomalies/${statementId}`),
        fetch(`/api/recurring/${statementId}`),
        fetch(`/api/analytics/${statementId}`),
      ]);

      const anomData = await anomRes.json();
      const recData = await recRes.json();
      const analData = await analRes.json();

      setAnomalies(anomData.anomalies || []);
      setRecurring(recData.recurring || []);
      setAnalytics(analData.analytics || null);

      // Step 4: Health Score & Executive Summary
      setProcessingStep('Computing composite health score & AI summary...');
      const [healthRes, sumRes] = await Promise.all([
        fetch(`/api/health-score/${statementId}`),
        fetch(`/api/summary/${statementId}`),
      ]);

      const healthData = await healthRes.json();
      const sumData = await sumRes.json();

      setHealthScore(healthData.healthScore || null);
      setSummary(sumData.summary || null);

      // Refresh statement list
      const allStmtRes = await fetch('/api/statements');
      const allData = await allStmtRes.json();
      setAllStatements(allData.statements || []);
      const current = allData.statements?.find((s: Statement) => s.id === statementId);
      if (current) setActiveStatement(current);

      setIsProcessing(false);
      setProcessingStep('');
      showToast('Bank statement analysis complete!');
      setActiveTab('dashboard');
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStep('');
      setError(err.message || 'Pipeline processing failed');
    }
  };

  // Upload File Handler
  const handleUploadFile = async (file: File, bankName?: string) => {
    setIsProcessing(true);
    setProcessingStep('Uploading statement binary...');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (bankName) formData.append('bank_name', bankName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'File upload failed');
      }

      await runFullPipeline(data.statement_id);
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStep('');
      setError(err.message || 'Upload failed');
    }
  };

  // Upload SMS Handler
  const handleUploadSms = async (smsText: string, bankName?: string) => {
    setIsProcessing(true);
    setProcessingStep('Ingesting SMS text stream...');
    setError(null);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_text: smsText, bank_name: bankName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SMS stream ingestion failed');
      }

      await runFullPipeline(data.statement_id);
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStep('');
      setError(err.message || 'SMS processing failed');
    }
  };

  // 1-Click Preset Dataset Loader
  const handleLoadPreset = async (presetId: string) => {
    setIsProcessing(true);
    setProcessingStep('Loading sample banking dataset...');
    setError(null);

    try {
      const res = await fetch(`/api/seed-preset/${presetId}`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to seed preset');
      }

      setActiveStatement(data.statement);
      setTransactions(data.transactions || []);
      setRecurring(data.recurring || []);
      setAnomalies(data.anomalies || []);
      setAnalytics(data.analytics || null);
      setHealthScore(data.healthScore || null);
      setSummary(data.summary || null);

      const allStmtRes = await fetch('/api/statements');
      const allData = await allStmtRes.json();
      setAllStatements(allData.statements || []);

      setIsProcessing(false);
      setProcessingStep('');
      showToast(`Loaded ${data.statement?.bank_name} demo dataset!`);
      setActiveTab('dashboard');
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingStep('');
      setError(err.message || 'Preset loading failed');
    }
  };

  // Live Category Inline Edit (PATCH)
  const handleUpdateCategory = async (transactionId: string, newCategory: TransactionCategory) => {
    if (!activeStatement) return;
    setIsUpdatingId(transactionId);

    try {
      const res = await fetch(`/api/transaction/${activeStatement.id}/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });

      const data = await res.json();
      if (res.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? { ...t, category: newCategory } : t))
        );
        if (data.analytics) setAnalytics(data.analytics);
        if (data.healthScore) setHealthScore(data.healthScore);
        showToast(`Category updated to "${newCategory}"`);
      }
    } catch (err: any) {
      console.error('Error updating category:', err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Hard Delete Statement
  const handleDeleteStatement = async (statementId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/statement/${statementId}`, { method: 'DELETE' });

      if (res.ok) {
        showToast('Statement and derived records permanently erased.');
        if (activeStatement?.id === statementId) {
          setActiveStatement(null);
          setTransactions([]);
          setAnalytics(null);
          setRecurring([]);
          setAnomalies([]);
          setHealthScore(null);
          setSummary(null);
        }
        await fetchStatements();
      }
    } catch (err: any) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Regenerate Summary
  const handleRegenerateSummary = async () => {
    if (!activeStatement) return;
    setIsGeneratingSummary(true);
    try {
      const res = await fetch(`/api/summary/${activeStatement.id}`);
      const data = await res.json();
      if (res.ok && data.summary) {
        setSummary(data.summary);
        showToast('AI financial narrative refreshed!');
      }
    } catch (err: any) {
      console.error('Error regenerating summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeStatement={activeStatement}
          onFileUpload={(file) => handleUploadFile(file)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          isProcessing={isProcessing}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" 
            onClick={() => setIsMobileSidebarOpen(false)} 
          />
          <div className="relative z-10">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              activeStatement={activeStatement}
              onFileUpload={(file) => {
                handleUploadFile(file);
                setIsMobileSidebarOpen(false);
              }}
              onOpenUploadModal={() => {
                setIsUploadModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Top App Bar with hamburger */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs tracking-tight truncate max-w-[200px]">
                AI-Based Bank Statement Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Global Top Header with greeting, statement selector, presets */}
        <TopHeader
          activeStatement={activeStatement}
          allStatements={allStatements}
          onSelectStatement={(stmt) => {
            setActiveStatement(stmt);
            loadStatementDetails(stmt.id);
          }}
          onOpenPresetModal={() => setIsPresetModalOpen(true)}
          onOpenArchitectureGuide={() => setIsArchitectureModalOpen(true)}
          anomaliesCount={anomalies.length}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab View Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              statement={activeStatement}
              analytics={analytics}
              recurring={recurring}
              anomalies={anomalies}
              transactions={transactions}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              statement={activeStatement}
              transactions={transactions}
              onUpdateCategory={handleUpdateCategory}
              isUpdatingId={isUpdatingId}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              statement={activeStatement}
              analytics={analytics}
              transactions={transactions}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringView
              statement={activeStatement}
              recurring={recurring}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomaliesView
              statement={activeStatement}
              anomalies={anomalies}
            />
          )}

          {activeTab === 'health' && (
            <FinancialHealthView
              statement={activeStatement}
              healthScore={healthScore}
              summary={summary}
              isGeneratingSummary={isGeneratingSummary}
              onRegenerateSummary={handleRegenerateSummary}
            />
          )}

          {activeTab === 'insights' && (
            <AiInsightsView
              statement={activeStatement}
              summary={summary}
              healthScore={healthScore}
              isGeneratingSummary={isGeneratingSummary}
              onRegenerateSummary={handleRegenerateSummary}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              statement={activeStatement}
              analytics={analytics}
              healthScore={healthScore}
              summary={summary}
            />
          )}

          {activeTab === 'privacy' && (
            <PrivacyView
              activeStatement={activeStatement}
              allStatements={allStatements}
              onDeleteStatement={handleDeleteStatement}
              isDeleting={isDeleting}
            />
          )}
        </main>
      </div>

      {/* Full Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadFile={handleUploadFile}
        onUploadSms={handleUploadSms}
        onLoadPreset={handleLoadPreset}
        isProcessing={isProcessing}
        processingStep={processingStep}
        error={error}
      />

      {/* Architecture & Methodology Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* Preset Dataset Selector Modal */}
      <PresetSelectorModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleLoadPreset}
        isProcessing={isProcessing}
      />

    </div>
  );
}

export default App;
