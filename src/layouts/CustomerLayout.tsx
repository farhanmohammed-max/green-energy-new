import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, User, LogOut, ArrowRight } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { SupabaseConfigNotice } from '@/components/shared/SupabaseConfigNotice';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

const customerLinks = [
  { to: '/akun', label: 'Ringkasan Akun', icon: LayoutDashboard, end: true },
  { to: '/akun/pemesanan', label: 'Riwayat Pemesanan', icon: ClipboardList, end: false },
  { to: '/akun/profil', label: 'Profil Saya', icon: User, end: false },
];

export function CustomerLayout() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <SupabaseConfigNotice />
      <PublicNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-leaf-600">
              Portal Pelanggan
            </p>
            <h1 className="text-2xl font-bold text-ink">
              Halo, {profile?.full_name || user?.email || 'Pelanggan'}
            </h1>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/pesan')}>
            Buat Pemesanan Baru
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="rounded-2xl border border-forest-900/10 bg-white p-3 shadow-xs">
              <nav className="flex flex-col gap-1" aria-label="Menu akun pelanggan">
                {customerLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-forest-900 text-white'
                            : 'text-ink hover:bg-leaf-50 hover:text-forest-900',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  );
                })}
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="mt-2 flex items-center gap-3 rounded-xl border-t border-forest-900/10 px-3.5 pt-3 pb-2 text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Keluar
                </button>
              </nav>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <Outlet />
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
