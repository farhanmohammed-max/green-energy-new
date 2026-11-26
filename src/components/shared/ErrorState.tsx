import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Gagal Memuat Data',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-10 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-lg text-sm text-muted leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
