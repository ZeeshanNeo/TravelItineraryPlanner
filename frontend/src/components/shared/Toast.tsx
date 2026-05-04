import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const colors = {
    success: 'bg-emerald-950/95 border-emerald-500/50 text-emerald-50 shadow-[0_8px_32px_-4px_rgba(16,185,129,0.2)]',
    error: 'bg-red-950/95 border-red-500/50 text-red-50 shadow-[0_8px_32px_-4px_rgba(239,68,68,0.2)]',
    info: 'bg-blue-950/95 border-blue-500/50 text-blue-50 shadow-[0_8px_32px_-4px_rgba(59,130,246,0.2)]',
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-4 p-5 rounded-2xl border backdrop-blur-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 ${colors[toast.type]}`}>
      <div className="shrink-0 p-2 rounded-xl bg-white/5 border border-white/10">
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-sm font-black tracking-tight leading-relaxed">{toast.message}</p>
      <button onClick={onRemove} className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90">
        <X size={18} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
