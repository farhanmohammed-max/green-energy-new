import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast],
  );

  const success = useCallback(
    (title: string, description?: string) => showToast({ title, description, variant: 'success' }),
    [showToast],
  );
  const error = useCallback(
    (title: string, description?: string) => showToast({ title, description, variant: 'error' }),
    [showToast],
  );
  const info = useCallback(
    (title: string, description?: string) => showToast({ title, description, variant: 'info' }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg bg-white animate-fade-slide-up',
              toast.variant === 'success' && 'border-emerald-200',
              toast.variant === 'error' && 'border-rose-200',
              toast.variant === 'info' && 'border-forest-900/15',
            )}
          >
            {toast.variant === 'success' && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
            )}
            {toast.variant === 'error' && (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
            )}
            {toast.variant === 'info' && (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-muted leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-muted hover:bg-slate-100 hover:text-ink cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus digunakan di dalam ToastProvider.');
  }
  return ctx;
}
