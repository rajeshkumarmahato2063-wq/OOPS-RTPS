import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const AlertBanner = ({ type = 'error', message, onClose, onRetry }) => {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    },
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
    }
  };

  const current = styles[type] || styles.error;

  return (
    <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${current.bg} animate-in fade-in duration-200`}>
      <div className="flex items-center gap-2.5">
        {current.icon}
        <span>{message}</span>
      </div>

      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all"
          >
            Retry
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 hover:opacity-75 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
