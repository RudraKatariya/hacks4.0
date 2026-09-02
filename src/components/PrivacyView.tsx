import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Lock, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Database, 
  History, 
  Server,
  RefreshCw
} from 'lucide-react';
import { Statement } from '../types';

interface PrivacyViewProps {
  activeStatement: Statement | null;
  allStatements: Statement[];
  onDeleteStatement: (statementId: string) => Promise<void>;
  isDeleting: boolean;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({
  activeStatement,
  allStatements,
  onDeleteStatement,
  isDeleting,
}) => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [allStatements]);

  const handleDelete = async (id: string) => {
    await onDeleteStatement(id);
    setConfirmDeleteId(null);
    fetchAuditLogs();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Privacy Policy & Data Control Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Privacy &amp; Cryptographic Deletion Engine</h2>
            <p className="text-xs text-slate-500">Zero persistent leakage, isolated tenant scopes, and auditable hard deletion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>In-Memory Buffer Sanitation</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Original uploaded PDF byte buffers and SMS strings are processed in ephemeral memory and never written to raw logs.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
              <Server className="w-4 h-4" />
              <span>Statement Isolation</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every statement is scoped by a unique UUID namespace. Cross-contamination between accounts is structurally prevented.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
              <Trash2 className="w-4 h-4" />
              <span>Cryptographic Hard Deletion</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Triggering delete permanently purges original files, derived rows, vector caches, and AI summaries from the database.
            </p>
          </div>
        </div>
      </div>

      {/* Active User Statements & Immediate Hard Deletion Controls */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Stored Bank Statements ({allStatements.length})</h3>
            <p className="text-xs text-slate-500">Manage, inspect, or hard-delete your uploaded statement records</p>
          </div>
          <button
            onClick={fetchAuditLogs}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition-colors"
            title="Refresh Audit Trail"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {allStatements.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700">No active statements stored</p>
            <p>Upload a statement or load a sample preset to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allStatements.map((stmt) => {
              const isActive = activeStatement?.id === stmt.id;
              const isConfirming = confirmDeleteId === stmt.id;

              return (
                <div
                  key={stmt.id}
                  className={`p-4 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isActive ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{stmt.bank_name || stmt.filename}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold">
                          Active Scope
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: <span className="text-slate-800 font-semibold">{stmt.id}</span> • {stmt.total_transactions} Transactions • Uploaded: {new Date(stmt.uploaded_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isConfirming ? (
                      <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-1.5 rounded-xl text-xs">
                        <span className="text-rose-700 text-xs font-semibold px-1">Confirm deletion?</span>
                        <button
                          id={`btn_confirm_delete_${stmt.id}`}
                          disabled={isDeleting}
                          onClick={() => handleDelete(stmt.id)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          {isDeleting ? 'Purging...' : 'Yes, Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn_delete_statement_${stmt.id}`}
                        onClick={() => setConfirmDeleteId(stmt.id)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete My Data</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Immutable Deletion Audit Trail */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Cryptographic Hard-Deletion Audit Log</h3>
        </div>
        <p className="text-xs text-slate-500">
          Timestamped verification records demonstrating that files and derived tables were erased without residual data leakage.
        </p>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No deletion events recorded yet in this session.</p>
        ) : (
          <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-emerald-700 font-bold block">PURGE EVENT: {log.id}</span>
                  <span className="text-slate-500 text-[11px]">Purged Scope: {log.statement_id} ({log.items_purged} records deleted)</span>
                </div>
                <span className="text-slate-400 text-[11px]">{new Date(log.deleted_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
