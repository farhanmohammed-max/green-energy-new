import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Clock, CheckCircle2, User } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { useMyBookings } from '@/features/bookings/api';
import { formatDateShortWIB, getFriendlyErrorMessage } from '@/lib/utils';

export function CustomerDashboardPage() {
  const { user, profile } = useAuth();
  const bookingsQuery = useMyBookings(user?.id);

  const bookings = bookingsQuery.data ?? [];
  const activeCount = bookings.filter((b) =>
    ['pending', 'contacted', 'confirmed', 'in_progress'].includes(b.status),
  ).length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <PageMeta title="Ringkasan Akun" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Total Pemesanan</p>
              <p className="font-display text-2xl font-extrabold text-ink">{bookings.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Sedang Diproses</p>
              <p className="font-display text-2xl font-extrabold text-ink">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Selesai</p>
              <p className="font-display text-2xl font-extrabold text-ink">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Profile Reminder */}
      {!profile?.phone && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-sm text-amber-950">
            <User className="h-5 w-5 shrink-0 text-amber-700" />
            <p>
              Lengkapi nomor WhatsApp pada profil Anda agar formulir pemesanan terisi otomatis lebih
              cepat.
            </p>
          </div>
          <Link to="/akun/profil">
            <Button variant="outline" size="sm">
              Lengkapi Profil
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Bookings */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink">Pemesanan Terbaru Anda</h2>
            <Link to="/akun/pemesanan">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {bookingsQuery.isLoading ? (
            <TableSkeleton rows={3} cols={4} />
          ) : bookingsQuery.isError ? (
            <ErrorState
              message={getFriendlyErrorMessage(bookingsQuery.error)}
              onRetry={() => void bookingsQuery.refetch()}
            />
          ) : bookings.length === 0 ? (
            <EmptyState
              title="Belum Ada Riwayat Pemesanan"
              description="Anda belum membuat permintaan layanan saat masuk dengan akun ini."
              action={
                <Link to="/pesan">
                  <Button variant="primary" size="sm">
                    Pesan Layanan Pertama Anda
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-forest-900/8">
              {bookings.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-forest-900">{item.booking_code}</p>
                    <p className="text-sm font-semibold text-ink">
                      {item.services?.name || 'Layanan GREEN ENERGY'}
                    </p>
                    <p className="text-xs text-muted">
                      Diajukan {formatDateShortWIB(item.created_at)}
                    </p>
                  </div>
                  <BookingStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
