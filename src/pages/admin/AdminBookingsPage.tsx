import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  ArchiveRestore,
  Eye,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminBookings,
  useCreateBooking,
  useDeleteAdminBooking,
  useUpdateAdminBooking,
} from '@/features/bookings/api';
import { useActiveServices } from '@/features/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { adminCreateBookingSchema, type AdminCreateBookingValues } from '@/schemas';
import {
  BOOKING_STATUS_CONFIG,
  BOOKING_STATUS_LIST,
  PREFERRED_TIME_OPTIONS,
} from '@/lib/constants';
import {
  formatDateOnlyID,
  formatDateShortWIB,
  getFriendlyErrorMessage,
  getTodayJakartaISO,
} from '@/lib/utils';
import type { BookingStatus, BookingWithService, PreferredTime } from '@/types/database';

const PAGE_SIZE = 10;

export function AdminBookingsPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') as BookingStatus | 'all') || 'all';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | 'all'>(initialStatus);
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<BookingWithService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookingWithService | null>(null);

  const toast = useToast();
  const debouncedSearch = useDebounce(search, 300);

  const bookingsQuery = useAdminBookings({
    search: debouncedSearch,
    status,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    archiveFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const activeServicesQuery = useActiveServices();
  const createBookingMutation = useCreateBooking();
  const updateBookingMutation = useUpdateAdminBooking();
  const deleteBookingMutation = useDeleteAdminBooking();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateBookingValues>({
    resolver: zodResolver(adminCreateBookingSchema),
    defaultValues: {
      service_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      project_location: '',
      preferred_date: '',
      preferred_time: '',
      customer_message: '',
    },
  });

  const handleCreateSubmit = async (values: AdminCreateBookingValues) => {
    try {
      const { bookingCode } = await createBookingMutation.mutateAsync({
        service_id: values.service_id,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        project_location: values.project_location,
        preferred_date: values.preferred_date || null,
        preferred_time: (values.preferred_time || null) as PreferredTime | null,
        customer_message: values.customer_message || null,
        user_id: null,
      });
      toast.success('Pemesanan Ditambahkan', `Kode pemesanan: ${bookingCode}`);
      reset();
      setCreateOpen(false);
    } catch (err) {
      toast.error('Gagal Membuat Pemesanan', getFriendlyErrorMessage(err));
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    const isCurrentlyArchived = Boolean(archiveTarget.archived_at);
    try {
      await updateBookingMutation.mutateAsync({
        id: archiveTarget.id,
        payload: {
          archived_at: isCurrentlyArchived ? null : new Date().toISOString(),
        },
      });
      toast.success(
        isCurrentlyArchived ? 'Pemesanan Dipulihkan' : 'Pemesanan Diarsipkan',
        `Kode ${archiveTarget.booking_code} berhasil diperbarui.`,
      );
      setArchiveTarget(null);
    } catch (err) {
      toast.error('Gagal Mengubah Status Arsip', getFriendlyErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBookingMutation.mutateAsync(deleteTarget.id);
      toast.success('Pemesanan Dihapus', `Kode ${deleteTarget.booking_code} telah dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Gagal Menghapus Pemesanan', getFriendlyErrorMessage(err));
    }
  };

  const items = bookingsQuery.data?.items ?? [];
  const total = bookingsQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageMeta title="Manajemen Pemesanan" />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Manajemen Pemesanan</h1>
          <p className="text-sm text-muted">
            Tinjau, cari, filter, perbarui status, dan arsipkan permintaan layanan pelanggan.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Pemesanan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari kode, nama, email, atau WhatsApp..."
                aria-label="Cari pemesanan"
                className="w-full rounded-xl border border-forest-900/15 bg-surface py-2.5 pl-9 pr-3 text-sm text-ink focus:border-leaf-600 focus:bg-white focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter status pemesanan"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as BookingStatus | 'all');
                setPage(1);
              }}
              className="rounded-xl border border-forest-900/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-leaf-600 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              {BOOKING_STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {BOOKING_STATUS_CONFIG[st].label}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter arsip"
              value={archiveFilter}
              onChange={(e) => {
                setArchiveFilter(e.target.value as 'active' | 'archived' | 'all');
                setPage(1);
              }}
              className="rounded-xl border border-forest-900/15 bg-white px-3 py-2.5 text-sm text-ink focus:border-leaf-600 focus:outline-none"
            >
              <option value="active">Daftar Aktif</option>
              <option value="archived">Diarsipkan</option>
              <option value="all">Semua (Termasuk Arsip)</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatus('all');
                setArchiveFilter('active');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
            >
              Reset Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-lg">
            <Input
              label="Dari Tanggal Masuk"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label="Sampai Tanggal Masuk"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {bookingsQuery.isLoading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : bookingsQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(bookingsQuery.error)}
          onRetry={() => void bookingsQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Pemesanan"
          description="Belum ada pemesanan yang cocok dengan kriteria pencarian atau filter saat ini."
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Kode</th>
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">Layanan</th>
                    <th className="px-4 py-3">Email & WhatsApp</th>
                    <th className="px-4 py-3">Tgl Pemesanan</th>
                    <th className="px-4 py-3">Tgl Pilihan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-forest-900">
                          {item.booking_code}
                        </span>
                        {item.archived_at && (
                          <span className="mt-1 block text-[11px] font-medium text-amber-700">
                            Diarsipkan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-ink">{item.customer_name}</td>
                      <td className="px-4 py-3.5 text-ink">{item.services?.name || '—'}</td>
                      <td className="px-4 py-3.5 text-xs">
                        <p className="text-ink">{item.customer_email}</p>
                        <p className="text-muted">{item.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {formatDateShortWIB(item.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {item.preferred_date ? formatDateOnlyID(item.preferred_date) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <BookingStatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/admin/pemesanan/${item.id}`}>
                            <Button variant="outline" size="sm" aria-label={`Lihat detail ${item.booking_code}`}>
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArchiveTarget(item)}
                            title={item.archived_at ? 'Pulihkan dari arsip' : 'Arsipkan'}
                            aria-label={item.archived_at ? 'Pulihkan arsip' : 'Arsipkan pemesanan'}
                          >
                            {item.archived_at ? (
                              <ArchiveRestore className="h-4 w-4 text-leaf-600" />
                            ) : (
                              <Archive className="h-4 w-4 text-amber-700" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            title="Hapus permanen (data uji/duplikat)"
                            aria-label="Hapus pemesanan"
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 pb-4 sm:px-0 sm:pb-0">
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Tambah Pemesanan Operasional */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tambah Pemesanan Baru"
        description="Catat permintaan layanan baru secara operasional dengan status awal Pending."
      >
        <form onSubmit={handleSubmit(handleCreateSubmit)} noValidate className="space-y-4">
          <Select
            label="Layanan Aktif"
            required
            error={errors.service_id?.message}
            {...register('service_id')}
          >
            <option value="">-- Pilih Layanan --</option>
            {(activeServicesQuery.data ?? []).map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nama Pelanggan"
              required
              error={errors.customer_name?.message}
              {...register('customer_name')}
            />
            <Input
              label="Email Pelanggan"
              type="email"
              required
              error={errors.customer_email?.message}
              {...register('customer_email')}
            />
          </div>

          <Input
            label="Nomor WhatsApp"
            required
            error={errors.customer_phone?.message}
            {...register('customer_phone')}
          />

          <Textarea
            label="Lokasi Proyek"
            required
            rows={2}
            error={errors.project_location?.message}
            {...register('project_location')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Tanggal Pilihan (Opsional)"
              type="date"
              min={getTodayJakartaISO()}
              error={errors.preferred_date?.message}
              {...register('preferred_date')}
            />
            <Select
              label="Waktu Pilihan (Opsional)"
              error={errors.preferred_time?.message}
              {...register('preferred_time')}
            >
              <option value="">-- Pilih Waktu --</option>
              {PREFERRED_TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Pesan Tambahan (Opsional)"
            rows={3}
            error={errors.customer_message?.message}
            {...register('customer_message')}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createBookingMutation.isPending}
            >
              Simpan Pemesanan
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => void handleConfirmArchive()}
        variant="primary"
        title={archiveTarget?.archived_at ? 'Pulihkan Pemesanan?' : 'Arsipkan Pemesanan?'}
        description={
          archiveTarget?.archived_at
            ? `Pemesanan ${archiveTarget.booking_code} akan dikembalikan ke daftar aktif.`
            : `Pemesanan ${archiveTarget?.booking_code} akan dipindahkan ke arsip dan tidak tampil pada daftar aktif.`
        }
        confirmLabel={archiveTarget?.archived_at ? 'Ya, Pulihkan' : 'Ya, Arsipkan'}
        isLoading={updateBookingMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Hapus Pemesanan Permanen?"
        description={`Tindakan ini akan menghapus permanen pemesanan ${deleteTarget?.booking_code}. Gunakan arsip jika Anda masih ingin menyimpan histori.`}
        confirmLabel="Ya, Hapus Permanen"
        isLoading={deleteBookingMutation.isPending}
      />
    </div>
  );
}
