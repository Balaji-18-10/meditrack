import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-slide-in ${
              isSuccess
                ? 'bg-white border-emerald-200 text-slate-800'
                : isError
                ? 'bg-white border-red-200 text-slate-800'
                : isWarning
                ? 'bg-white border-amber-200 text-slate-800'
                : 'bg-white border-sky-200 text-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-500" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-600" />}
            </div>
            <div className="flex-1">
              {toast.title && <div className="font-semibold text-slate-900 mb-0.5">{toast.title}</div>}
              <div className="text-slate-600 leading-relaxed text-xs sm:text-sm">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
