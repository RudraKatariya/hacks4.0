import React from 'react';
import { X, Zap, ArrowRight, FileText, Camera, MessageSquare } from 'lucide-react';
import { PRESET_DATASETS } from '../../server/presets';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
  isProcessing: boolean;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  isProcessing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Select a Sample Financial Dataset
              </h2>
              <p className="text-xs text-slate-400">Production-grade banking datasets for instant live exploration and testing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {PRESET_DATASETS.map((preset) => {
            const isPdf = preset.input_type === 'digital_pdf';
            const isScanned = preset.input_type === 'scanned_pdf_image';
            const isSms = preset.input_type === 'sms_text';

            return (
              <div
                key={preset.id}
                onClick={() => {
                  if (!isProcessing) {
                    onSelectPreset(preset.id);
                    onClose();
                  }
                }}
                className="group p-5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      isPdf ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      isScanned ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {isPdf ? 'Digital PDF Statement' : isScanned ? 'Scanned Camera OCR' : 'SMS Alert Stream'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {preset.transactions.length} Transactions
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    disabled={isProcessing}
                    className="px-4 py-2 bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 border border-emerald-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <span>Load Dataset</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
