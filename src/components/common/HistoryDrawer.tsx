import React from 'react';
import { useHistory } from '../../context/HistoryContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  History,
  X,
  Trash2,
  Clock,
  RotateCcw,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { ShareButton } from './ShareButton';

interface Props {
  onSelectCalculator: (id: string, inputs?: Record<string, any>) => void;
}

export const HistoryDrawer: React.FC<Props> = ({ onSelectCalculator }) => {
  const { history, isHistoryOpen, setIsHistoryOpen, removeHistoryItem, clearHistory } =
    useHistory();
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isHistoryOpen) return null;

  const handleCopySummary = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRestore = (calculatorId: string, inputs?: Record<string, any>) => {
    onSelectCalculator(calculatorId, inputs);
    setIsHistoryOpen(false);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsHistoryOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {t('history_title')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {history.length > 0
                  ? `${history.length} calculations saved locally`
                  : t('history_empty')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm mb-1">
                {t('history_empty')}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Save your calculations to history to quickly access them anytime.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-indigo-300 transition group space-y-2.5"
              >
                {/* Item Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {item.calculatorTitle}
                    </span>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Web Share API for saved calculation item */}
                    <ShareButton
                      title={`CalcPro ${item.calculatorTitle}`}
                      text={`${item.calculatorTitle} Result:\n${item.summary}\n${Object.entries(item.details).map(([k, v]) => `${k}: ${v}`).join('\n')}`}
                      calcId={item.calculatorId}
                      inputs={item.inputs}
                      variant="compact"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySummary(
                          item.id,
                          `${item.calculatorTitle} Result:\n${item.summary}\n${Object.entries(
                            item.details
                          )
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n')}`
                        )
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition"
                      title="Copy calculation"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHistoryItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Primary Result Highlight */}
                <div className="bg-indigo-50/70 text-indigo-900 px-3 py-2 rounded-xl text-xs font-bold font-mono tracking-tight flex items-center justify-between">
                  <span>{item.summary}</span>
                </div>

                {/* Key Inputs / Details */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  {Object.entries(item.details).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
                        {key}
                      </span>
                      <span className="font-semibold text-slate-700 font-mono truncate block">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reload / Open Button */}
                <button
                  type="button"
                  onClick={() => handleRestore(item.calculatorId, item.inputs)}
                  className="w-full btn-gloss btn-gloss-indigo py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 mt-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('load_calculation')}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete all calculation history?')) {
                  clearHistory();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('clear_all')}
            </button>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              100% Local Storage
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
