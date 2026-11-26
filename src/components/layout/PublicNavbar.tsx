import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/layanan', label: 'Layanan', end: false },
  { to: '/tentang', label: 'Tentang Kami', end: false },
  { to: '/faq', label: 'FAQ', end: false },
  { to: '/kontak', label: 'Kontak', end: false },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-white/92 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Beranda GREEN ENERGY">
          <BrandLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-leaf-100 text-forest-900 font-semibold'
                    : 'text-muted hover:bg-forest-900/5 hover:text-forest-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          {user ? (
            isAdmin ? (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ShieldCheck className="h-4 w-4 text-leaf-600" />
                  Dashboard Admin
                </Button>
              </Link>
            ) : (
              <Link to="/akun">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 text-leaf-600" />
                  Akun Saya
                </Button>
              </Link>
            )
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
          )}
          <Link to="/pesan">
            <Button variant="primary" size="sm">
              Pesan Layanan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-xl p-2 text-forest-900 hover:bg-forest-900/5 lg:hidden cursor-pointer"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="border-t border-forest-900/10 bg-white px-4 pb-5 pt-3 lg:hidden animate-fade-slide-up"
        >
          <nav className="flex flex-col gap-1" aria-label="Navigasi seluler">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-4 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-leaf-100 text-forest-900 font-semibold'
                      : 'text-ink hover:bg-surface',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-forest-900/10 pt-4">
            {user ? (
              isAdmin ? (
                <Link to="/admin">
                  <Button variant="outline" className="w-full">
                    <ShieldCheck className="h-4 w-4 text-leaf-600" />
                    Dashboard Admin
                  </Button>
                </Link>
              ) : (
                <Link to="/akun">
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 text-leaf-600" />
                    Akun Saya
                  </Button>
                </Link>
              )
            ) : (
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Masuk / Daftar Pelanggan
                </Button>
              </Link>
            )}
            <Link to="/pesan">
              <Button variant="primary" className="w-full">
                Pesan Layanan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
