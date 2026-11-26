import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Unhandled application error:', error, info);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-6">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h1 className="font-display text-xl font-extrabold text-ink">
              Terjadi Gangguan Tampilan
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Maaf, halaman mengalami kendala tak terduga. Silakan muat ulang halaman atau kembali ke
              beranda GREEN ENERGY.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Button variant="primary" onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4" />
                Muat Ulang Halaman
              </Button>
              <a href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ke Beranda
                </Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
