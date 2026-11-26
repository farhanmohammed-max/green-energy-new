import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PublicLayout } from '@/layouts/PublicLayout';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { RequireAdmin, RequireAuth } from '@/features/auth/RouteGuards';
import { HomePage } from '@/pages/public/HomePage';

// Lazy-loaded pages untuk mempercepat muat awal dan memecah bundle per area fitur
const AboutPage = lazy(() =>
  import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const ServicesPage = lazy(() =>
  import('@/pages/public/ServicesPage').then((m) => ({ default: m.ServicesPage })),
);
const ServiceDetailPage = lazy(() =>
  import('@/pages/public/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })),
);
const BookingPage = lazy(() =>
  import('@/pages/public/BookingPage').then((m) => ({ default: m.BookingPage })),
);
const BookingSuccessPage = lazy(() =>
  import('@/pages/public/BookingSuccessPage').then((m) => ({ default: m.BookingSuccessPage })),
);
const ContactPage = lazy(() =>
  import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const FaqPage = lazy(() =>
  import('@/pages/public/FaqPage').then((m) => ({ default: m.FaqPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const AdminLoginPage = lazy(() =>
  import('@/pages/auth/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);

const CustomerDashboardPage = lazy(() =>
  import('@/pages/customer/CustomerDashboardPage').then((m) => ({
    default: m.CustomerDashboardPage,
  })),
);
const CustomerProfilePage = lazy(() =>
  import('@/pages/customer/CustomerProfilePage').then((m) => ({
    default: m.CustomerProfilePage,
  })),
);
const CustomerBookingsPage = lazy(() =>
  import('@/pages/customer/CustomerBookingsPage').then((m) => ({
    default: m.CustomerBookingsPage,
  })),
);

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminBookingsPage = lazy(() =>
  import('@/pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })),
);
const AdminBookingDetailPage = lazy(() =>
  import('@/pages/admin/AdminBookingDetailPage').then((m) => ({
    default: m.AdminBookingDetailPage,
  })),
);
const AdminCategoriesPage = lazy(() =>
  import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
);
const AdminServicesPage = lazy(() =>
  import('@/pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })),
);
const AdminCustomersPage = lazy(() =>
  import('@/pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })),
);
const AdminTestimonialsPage = lazy(() =>
  import('@/pages/admin/AdminTestimonialsPage').then((m) => ({
    default: m.AdminTestimonialsPage,
  })),
);
const AdminMessagesPage = lazy(() =>
  import('@/pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })),
);
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
      <Loader2 className="h-7 w-7 animate-spin text-forest-900" aria-hidden="true" />
      <p className="text-sm font-medium text-muted">Memuat halaman...</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tentang" element={<AboutPage />} />
            <Route path="/layanan" element={<ServicesPage />} />
            <Route path="/layanan/:slug" element={<ServiceDetailPage />} />
            <Route path="/pesan" element={<BookingPage />} />
            <Route path="/pesan/:slug" element={<BookingPage />} />
            <Route path="/pesanan/berhasil" element={<BookingSuccessPage />} />
            <Route path="/kontak" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/daftar" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Login (standalone) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Customer Portal */}
          <Route element={<RequireAuth />}>
            <Route element={<CustomerLayout />}>
              <Route path="/akun" element={<CustomerDashboardPage />} />
              <Route path="/akun/profil" element={<CustomerProfilePage />} />
              <Route path="/akun/pemesanan" element={<CustomerBookingsPage />} />
            </Route>
          </Route>

          {/* Protected Admin Dashboard */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="pemesanan" element={<AdminBookingsPage />} />
              <Route path="pemesanan/:id" element={<AdminBookingDetailPage />} />
              <Route path="kategori" element={<AdminCategoriesPage />} />
              <Route path="layanan" element={<AdminServicesPage />} />
              <Route path="pelanggan" element={<AdminCustomersPage />} />
              <Route path="testimoni" element={<AdminTestimonialsPage />} />
              <Route path="pesan" element={<AdminMessagesPage />} />
              <Route path="pengaturan" element={<AdminSettingsPage />} />
              <Route path="profil" element={<Navigate to="/admin/pengaturan" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
