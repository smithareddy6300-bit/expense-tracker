import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    exportCSV,
    exportJSON,
    importCSV,
    importJSON,
    resetData,
    transactions,
  } = useFinance();

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        const res = importJSON(content);
        if (res.success) {
          setMessage({
            type: 'success',
            text: `Successfully imported ${res.count} transactions and configuration from JSON!`,
          });
        } else {
          setMessage({
            type: 'error',
            text: res.error || 'Failed to import JSON.',
          });
        }
      } else {
        const res = importCSV(content);
        if (res.success) {
          setMessage({
            type: 'success',
            text: `Successfully imported ${res.count} transactions from CSV!`,
          });
        } else {
          setMessage({
            type: 'error',
            text: res.error || 'Failed to import CSV.',
          });
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Data Portability & Backup
            </h3>
            <p className="text-xs text-slate-500">
              Export your personal finance data, upload spreadsheets, or create backups
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg mb-4 text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Export Options */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Export Ledger
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <div>Export as CSV</div>
                  <div className="text-[10px] text-slate-400 font-normal">Excel / Sheets compatible</div>
                </div>
              </button>

              <button
                type="button"
                onClick={exportJSON}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <div className="text-left">
                  <div>Export as JSON</div>
                  <div className="text-[10px] text-slate-400 font-normal">Full database backup</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Import Ledger or Backup
            </h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700 mb-0.5">
                Click to browse CSV or JSON file
              </p>
              <p className="text-[11px] text-slate-400">
                Supports standard CSV with Date, Title, Type, Category, Amount, Payment Method columns
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Quick Demo Reset */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Currently holding <span className="font-semibold text-slate-800">{transactions.length}</span> records
            </span>
            <button
              type="button"
              onClick={() => {
                resetData();
                setMessage({
                  type: 'success',
                  text: 'Data reset to original realistic sample transactions.',
                });
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
