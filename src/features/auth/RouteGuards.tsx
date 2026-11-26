import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/Button';

function FullScreenLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6">
      <Loader2 className="h-8 w-8 animate-spin text-forest-900" aria-hidden="true" />
      <p className="text-sm font-medium text-muted">Memeriksa sesi autentikasi...</p>
    </div>
  );
}

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { user, profile, isLoading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-ink">Akses Dashboard Ditolak</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Akun Anda ({profile?.email ?? user.email}) tidak memiliki hak akses administrator.
            Halaman ini dilindungi oleh verifikasi peran dan Row Level Security (RLS).
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2.5">
            <Link to="/">
              <Button variant="primary" className="w-full sm:w-auto">
                Kembali ke Beranda
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                void signOut();
              }}
            >
              Keluar Akun
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
