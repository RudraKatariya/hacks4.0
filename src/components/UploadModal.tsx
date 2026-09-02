import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { UploadView } from './UploadView';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: File, bankName?: string) => Promise<void>;
  onUploadSms: (smsText: string, bankName?: string) => Promise<void>;
  onLoadPreset: (presetId: string) => Promise<void>;
  isProcessing: boolean;
  processingStep: string;
  error: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
  onUploadSms,
  onLoadPreset,
  isProcessing,
  processingStep,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Upload &amp; Analyze Bank Statement
              </h2>
              <p className="text-xs text-slate-400">PDF, Scanned Document OCR, CSV, or Raw SMS Alerts Stream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <UploadView
            onUploadFile={async (file, bankName) => {
              await onUploadFile(file, bankName);
              onClose();
            }}
            onUploadSms={async (sms, bankName) => {
              await onUploadSms(sms, bankName);
              onClose();
            }}
            onLoadPreset={async (presetId) => {
              await onLoadPreset(presetId);
              onClose();
            }}
            isProcessing={isProcessing}
            processingStep={processingStep}
            error={error}
          />
        </div>

      </div>
    </div>
  );
};
