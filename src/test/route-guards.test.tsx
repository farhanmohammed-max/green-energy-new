import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import { RequireAdmin, RequireAuth } from '@/features/auth/RouteGuards';

const mockUseAuth = vi.fn();

vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderGuards(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Halaman Login Pelanggan</div>} />
        <Route path="/admin/login" element={<div>Halaman Login Admin</div>} />
        <Route element={<RequireAuth />}>
          <Route path="/akun" element={<div>Portal Pelanggan</div>} />
        </Route>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<div>Dashboard Admin Rahasia</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

const baseAuth = {
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  isAdmin: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  refreshProfile: vi.fn(),
};

describe('Route Guards & Role Protection', () => {
  it('redirects unauthenticated visitors from /akun to /login', () => {
    mockUseAuth.mockReturnValue(baseAuth);
    renderGuards('/akun');
    expect(screen.getByText('Halaman Login Pelanggan')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors from /admin to /admin/login', () => {
    mockUseAuth.mockReturnValue(baseAuth);
    renderGuards('/admin');
    expect(screen.getByText('Halaman Login Admin')).toBeInTheDocument();
  });

  it('shows loader while auth/profile role is still resolving on /admin', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { id: 'u-1', email: 'admin@example.com' } as User,
      isLoading: true,
    });
    renderGuards('/admin');
    expect(screen.getByText(/Memeriksa sesi autentikasi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Akses Dashboard Ditolak/i)).not.toBeInTheDocument();
  });

  it('blocks logged-in customer accounts from accessing /admin', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { id: 'u-2', email: 'pelanggan@example.com' } as User,
      profile: {
        id: 'u-2',
        full_name: 'Pelanggan Uji',
        email: 'pelanggan@example.com',
        phone: null,
        role: 'customer',
        created_at: '',
        updated_at: '',
      } as Profile,
      isAdmin: false,
    });
    renderGuards('/admin');
    expect(screen.getByText(/Akses Dashboard Ditolak/i)).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Admin Rahasia')).not.toBeInTheDocument();
  });

  it('allows verified admin accounts into /admin', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { id: 'u-3', email: 'admin@example.com' } as User,
      profile: {
        id: 'u-3',
        full_name: 'Admin Utama',
        email: 'admin@example.com',
        phone: null,
        role: 'admin',
        created_at: '',
        updated_at: '',
      } as Profile,
      isAdmin: true,
    });
    renderGuards('/admin');
    expect(screen.getByText('Dashboard Admin Rahasia')).toBeInTheDocument();
  });
});
