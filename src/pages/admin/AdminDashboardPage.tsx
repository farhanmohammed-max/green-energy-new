import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Mail,
  MessageSquareQuote,
  PlayCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { useDashboardSummary } from '@/features/bookings/api';
import { formatDateShortWIB, getFriendlyErrorMessage } from '@/lib/utils';

export function AdminDashboardPage() {
  const summaryQuery = useDashboardSummary();

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageMeta title="Dashboard Admin" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  if (summaryQuery.isError) {
    return (
      <div className="space-y-6">
        <PageMeta title="Dashboard Admin" />
        <ErrorState
          title="Gagal Memuat Ringkasan Dashboard"
          message={getFriendlyErrorMessage(summaryQuery.error)}
          onRetry={() => void summaryQuery.refetch()}
        />
      </div>
    );
  }

  const data = summaryQuery.data!;
  const maxMonthly = Math.max(1, ...data.monthlyTrend.map((m) => m.count));

  const kpiCards = [
    {
      label: 'Total Pemesanan',
      value: data.total,
      icon: ClipboardList,
      tone: 'bg-forest-900/10 text-forest-900',
    },
    {
      label: 'Pending',
      value: data.byStatus.pending,
      icon: Clock,
      tone: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Dikonfirmasi',
      value: data.byStatus.confirmed,
      icon: ShieldCheck,
      tone: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Sedang Berjalan',
      value: data.byStatus.in_progress,
      icon: PlayCircle,
      tone: 'bg-indigo-100 text-indigo-800',
    },
    {
      label: 'Selesai',
      value: data.byStatus.completed,
      icon: CheckCircle2,
      tone: 'bg-leaf-100 text-forest-900',
    },
  ];

  return (
    <div className="space-y-6">
      <PageMeta title="Dashboard Admin" />

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Dashboard Administrator</h1>
          <p className="text-sm text-muted">
            Ringkasan operasional aktual dari database Supabase GREEN ENERGY.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/pemesanan">
            <Button variant="primary" size="sm">
              Kelola Pemesanan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/admin/layanan">
            <Button variant="outline" size="sm">
              Kelola Layanan
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-xs font-medium text-muted">{kpi.label}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold text-ink">{kpi.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart + Ringkasan Aktivitas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Grafik Perkembangan Pemesanan
                </h2>
                <p className="text-xs text-muted">
                  Jumlah pemesanan aktif dalam 6 bulan terakhir (data aktual database).
                </p>
              </div>
              <span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-semibold text-forest-900">
                Total: {data.total}
              </span>
            </div>

            {data.total === 0 ? (
              <EmptyState
                title="Belum Ada Data Pemesanan"
                description="Grafik perkembangan akan terisi otomatis setelah ada pemesanan masuk ke database."
              />
            ) : (
              <div className="pt-2">
                <div
                  className="grid grid-cols-6 items-end gap-3 sm:gap-5 h-52 rounded-2xl bg-surface p-5 border border-forest-900/8"
                  role="img"
                  aria-label="Grafik batang jumlah pemesanan 6 bulan terakhir"
                >
                  {data.monthlyTrend.map((point) => {
                    const heightPct = Math.max(8, Math.round((point.count / maxMonthly) * 100));
                    return (
                      <div key={point.label} className="flex h-full flex-col items-center justify-end gap-2">
                        <span className="text-xs font-bold text-forest-900">{point.count}</span>
                        <div className="flex w-full flex-1 items-end justify-center">
                          <div
                            className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-forest-900 to-leaf-500 transition-all duration-300"
                            style={{ height: point.count === 0 ? '4px' : `${heightPct}%` }}
                            title={`${point.label}: ${point.count} pemesanan`}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-muted text-center">
                          {point.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardContent className="space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">Ringkasan Aktivitas</h2>
            <div className="space-y-3">
              <Link
                to="/admin/pemesanan?status=contacted"
                className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5 hover:bg-leaf-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-4.5 w-4.5 text-sky-700" />
                  <span className="text-sm font-medium text-ink">Sudah Dihubungi</span>
                </div>
                <span className="font-display text-base font-bold text-ink">
                  {data.byStatus.contacted}
                </span>
              </Link>

              <Link
                to="/admin/pesan"
                className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5 hover:bg-leaf-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4.5 w-4.5 text-amber-700" />
                  <span className="text-sm font-medium text-ink">Pesan Masuk Baru</span>
                </div>
                <span className="font-display text-base font-bold text-ink">
                  {data.unreadMessagesCount}
                </span>
              </Link>

              <Link
                to="/admin/layanan"
                className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5 hover:bg-leaf-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-4.5 w-4.5 text-leaf-600" />
                  <span className="text-sm font-medium text-ink">Layanan Aktif</span>
                </div>
                <span className="font-display text-base font-bold text-ink">
                  {data.activeServicesCount}
                </span>
              </Link>

              <Link
                to="/admin/testimoni"
                className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5 hover:bg-leaf-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MessageSquareQuote className="h-4.5 w-4.5 text-forest-800" />
                  <span className="text-sm font-medium text-ink">Testimoni Terpublikasi</span>
                </div>
                <span className="font-display text-base font-bold text-ink">
                  {data.publishedTestimonialsCount}
                </span>
              </Link>

              <div className="rounded-xl bg-leaf-50/70 p-3 text-xs text-muted flex justify-between">
                <span>Dibatalkan: <strong>{data.byStatus.cancelled}</strong></span>
                <span>Ditolak: <strong>{data.byStatus.rejected}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Pemesanan Terbaru</h2>
              <p className="text-xs text-muted">Menampilkan maksimal 8 permintaan terbaru.</p>
            </div>
            <Link to="/admin/pemesanan">
              <Button variant="ghost" size="sm">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {data.recentBookings.length === 0 ? (
            <EmptyState
              title="Belum Ada Pemesanan Masuk"
              description="Permintaan pemesanan baru dari pelanggan akan segera tampil di sini."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="py-3 pr-4">Kode</th>
                    <th className="py-3 pr-4">Pelanggan</th>
                    <th className="py-3 pr-4">Layanan</th>
                    <th className="py-3 pr-4">Tanggal Masuk</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {data.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-surface/60 transition-colors">
                      <td className="py-3.5 pr-4 font-mono text-xs font-bold text-forest-900">
                        {booking.booking_code}
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-ink">{booking.customer_name}</p>
                        <p className="text-xs text-muted">{booking.customer_phone}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-ink">
                        {booking.services?.name || '—'}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-muted">
                        {formatDateShortWIB(booking.created_at)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <Link to={`/admin/pemesanan/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
