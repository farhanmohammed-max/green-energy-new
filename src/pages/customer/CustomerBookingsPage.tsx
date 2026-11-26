import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Clock } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { useMyBookings } from '@/features/bookings/api';
import { BOOKING_STATUS_CONFIG } from '@/lib/constants';
import {
  formatDateOnlyID,
  formatDateTimeWIB,
  formatIDR,
  getFriendlyErrorMessage,
} from '@/lib/utils';

export function CustomerBookingsPage() {
  const { user } = useAuth();
  const bookingsQuery = useMyBookings(user?.id);

  return (
    <div className="space-y-6">
      <PageMeta title="Riwayat Pemesanan Saya" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Riwayat Pemesanan Saya</h2>
          <p className="text-sm text-muted">
            Daftar permintaan layanan yang tercatat atas akun Anda.
          </p>
        </div>
      </div>

      {bookingsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : bookingsQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(bookingsQuery.error)}
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : (bookingsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Belum Ada Pemesanan"
          description="Anda belum memiliki permintaan pemesanan layanan pada akun ini."
          action={
            <Link to="/pesan">
              <Button variant="primary" size="sm">
                Pesan Layanan Sekarang
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookingsQuery.data!.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="space-y-4">
                <div className="flex flex-col justify-between gap-3 border-b border-forest-900/8 pb-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-forest-900 bg-leaf-50 px-2.5 py-1 rounded-lg">
                        {booking.booking_code}
                      </span>
                      <span className="text-xs text-muted">
                        Diajukan {formatDateTimeWIB(booking.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold text-ink">
                      {booking.services?.name || 'Layanan GREEN ENERGY'}
                    </h3>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <p className="text-xs text-muted">
                  Status: {BOOKING_STATUS_CONFIG[booking.status].description}
                </p>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-start gap-2 rounded-xl bg-surface p-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
                    <div>
                      <p className="text-xs text-muted">Lokasi Proyek</p>
                      <p className="font-medium text-ink">{booking.project_location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-surface p-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
                    <div>
                      <p className="text-xs text-muted">
                        {booking.agreed_date ? 'Jadwal Disepakati' : 'Preferensi Tanggal'}
                      </p>
                      <p className="font-medium text-ink">
                        {booking.agreed_date
                          ? formatDateOnlyID(booking.agreed_date)
                          : formatDateOnlyID(booking.preferred_date)}
                        {!booking.agreed_date && booking.preferred_time
                          ? ` (${booking.preferred_time})`
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-surface p-3">
                    <Tag className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
                    <div>
                      <p className="text-xs text-muted">Estimasi Biaya</p>
                      <p className="font-medium text-ink">
                        {booking.estimated_cost !== null
                          ? formatIDR(booking.estimated_cost)
                          : 'Menunggu peninjauan admin'}
                      </p>
                    </div>
                  </div>
                </div>

                {booking.customer_message && (
                  <div className="flex items-start gap-2 text-xs text-muted border-t border-forest-900/8 pt-3">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                    <p>
                      <span className="font-semibold text-ink">Catatan Anda:</span>{' '}
                      {booking.customer_message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
