import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FolderTree,
  Zap,
  Users,
  MessageSquareQuote,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { SupabaseConfigNotice } from '@/components/shared/SupabaseConfigNotice';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

const adminMenu = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pemesanan', label: 'Pemesanan', icon: ClipboardList, end: false },
  { to: '/admin/kategori', label: 'Kategori Layanan', icon: FolderTree, end: false },
  { to: '/admin/layanan', label: 'Data Layanan', icon: Zap, end: false },
  { to: '/admin/pelanggan', label: 'Pelanggan', icon: Users, end: false },
  { to: '/admin/testimoni', label: 'Testimoni', icon: MessageSquareQuote, end: false },
  { to: '/admin/pesan', label: 'Pesan Masuk', icon: Mail, end: false },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: Settings, end: false },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-forest-950 text-leaf-100">
      <div className="flex h-18 items-center justify-between border-b border-white/10 px-5">
        <Link to="/admin" aria-label="Dashboard Admin GREEN ENERGY">
          <BrandLogo inverted />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-leaf-100/80 hover:bg-white/10 lg:hidden cursor-pointer"
          aria-label="Tutup sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu administrator">
        {adminMenu.map((item) => {
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
                    ? 'bg-leaf-600 text-white shadow-sm'
                    : 'text-leaf-100/80 hover:bg-white/8 hover:text-white',
                )
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1.5">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-leaf-100/80 hover:bg-white/8 hover:text-white transition-colors"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          Lihat Website Publik
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      {/* Desktop Sidebar */}
      <aside className="hidden w-68 shrink-0 lg:block sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <SupabaseConfigNotice />
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-forest-900/10 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-forest-900 hover:bg-forest-900/5 lg:hidden cursor-pointer"
              aria-label="Buka menu admin"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-leaf-600">
                Panel Administrator
              </p>
              <p className="text-sm font-bold text-ink">GREEN ENERGY</p>
            </div>
          </div>

          <Link
            to="/admin/pengaturan"
            className="flex items-center gap-2.5 rounded-xl border border-forest-900/10 bg-surface px-3 py-1.5 hover:bg-leaf-50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-900 text-xs font-bold text-white">
              {(profile?.full_name || user?.email || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-ink">
                {profile?.full_name || 'Administrator'}
              </p>
              <p className="text-[11px] text-muted">{profile?.email || user?.email}</p>
            </div>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
