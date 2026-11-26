import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { SupabaseConfigNotice } from '@/components/shared/SupabaseConfigNotice';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Langsung ke konten utama
      </a>
      <SupabaseConfigNotice />
      <PublicNavbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
