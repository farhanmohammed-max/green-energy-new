import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/auth/AuthContext';
import { FaqPage } from '@/pages/public/FaqPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { BookingSuccessPage } from '@/pages/public/BookingSuccessPage';
import type { BookingConfirmationState } from '@/types/database';

function renderWithProviders(initialEntry: string | { pathname: string; state?: unknown }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/tentang" element={<AboutPage />} />
              <Route path="/pesanan/berhasil" element={<BookingSuccessPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('Public Pages Rendering', () => {
  it('renders FAQ page with Indonesian questions', () => {
    renderWithProviders('/faq');
    expect(screen.getByText(/Pertanyaan yang Sering Diajukan/i)).toBeInTheDocument();
    expect(screen.getByText(/Bagaimana cara melakukan pemesanan layanan/i)).toBeInTheDocument();
  });

  it('renders About page with GREEN ENERGY identity', () => {
    renderWithProviders('/tentang');
    expect(screen.getByText(/Mengenal GREEN ENERGY/i)).toBeInTheDocument();
    expect(screen.getByText(/Visi Kami/i)).toBeInTheDocument();
  });

  it('renders BookingSuccessPage confirmation code and copy button from route state', () => {
    const state: BookingConfirmationState = {
      bookingCode: 'GE-ABCDEF1234567890',
      customerName: 'Dewi Lestari',
      serviceName: 'Konsultasi Energi',
      preferredDate: '2026-12-20',
      preferredTime: 'Pagi',
    };
    renderWithProviders({ pathname: '/pesanan/berhasil', state });
    expect(screen.getByText('GE-ABCDEF1234567890')).toBeInTheDocument();
    expect(screen.getByText('Dewi Lestari')).toBeInTheDocument();
    expect(screen.getByText('Konsultasi Energi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salin Kode Pemesanan/i })).toBeInTheDocument();
  });
});
