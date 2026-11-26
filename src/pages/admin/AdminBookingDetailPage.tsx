import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Calendar,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
  Trash2,
  User,
} from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminBookingById,
  useDeleteAdminBooking,
  useUpdateAdminBooking,
} from '@/features/bookings/api';
import { adminBookingUpdateSchema, type AdminBookingUpdateValues } from '@/schemas';
import { ALLOWED_BOOKING_TRANSITIONS, BOOKING_STATUS_CONFIG } from '@/lib/constants';
import {
  formatDateOnlyID,
  formatDateTimeWIB,
  formatIDR,
  formatWhatsAppLink,
  getFriendlyErrorMessage,
} from '@/lib/utils';
import type { BookingStatus } from '@/types/database';

export function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const bookingQuery = useAdminBookingById(id);
  const updateMutation = useUpdateAdminBooking();
  const deleteMutation = useDeleteAdminBooking();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminBookingUpdateValues>({
    resolver: zodResolver(adminBookingUpdateSchema),
    defaultValues: {
      status: 'pending',
      agreed_date: '',
      estimated_cost: '',
      admin_notes: '',
    },
  });

  const booking = bookingQuery.data;

  useEffect(() => {
    if (booking) {
      reset({
        status: booking.status,
        agreed_date: booking.agreed_date ?? '',
        estimated_cost:
          booking.estimated_cost !== null && booking.estimated_cost !== undefined
            ? String(booking.estimated_cost)
            : '',
        admin_notes: booking.admin_notes ?? '',
      });
    }
  }, [booking, reset]);

  if (bookingQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (bookingQuery.isError) {
    return (
      <ErrorState
        message={getFriendlyErrorMessage(bookingQuery.error)}
        onRetry={() => void bookingQuery.refetch()}
      />
    );
  }

  if (!booking) {
    return (
      <EmptyState
        title="Pemesanan Tidak Ditemukan"
        description="Data pemesanan tidak tersedia atau sudah dihapus."
        action={
          <Link to="/admin/pemesanan">
            <Button variant="primary">Kembali ke Daftar Pemesanan</Button>
          </Link>
        }
      />
    );
  }

  const allowedNextStatuses = ALLOWED_BOOKING_TRANSITIONS[booking.status];
  const availableStatusOptions: BookingStatus[] = [booking.status, ...allowedNextStatuses];
  const isTerminal = allowedNextStatuses.length === 0;
  const whatsappUrl = formatWhatsAppLink(
    booking.customer_phone,
    `Halo ${booking.customer_name}, kami dari tim GREEN ENERGY menindaklanjuti permintaan pemesanan ${booking.booking_code} (${booking.services?.name ?? 'Layanan Energi Hijau'}).`,
  );

  const onSubmit = async (values: AdminBookingUpdateValues) => {
    try {
      await updateMutation.mutateAsync({
        id: booking.id,
        payload: {
          status: values.status,
          agreed_date: values.agreed_date || null,
          estimated_cost: values.estimated_cost ? Number(values.estimated_cost) : null,
          admin_notes: values.admin_notes?.trim() ? values.admin_notes.trim() : null,
        },
      });
      toast.success('Pemesanan Diperbarui', 'Perubahan status dan catatan operasional tersimpan.');
    } catch (err) {
      toast.error('Gagal Memperbarui Pemesanan', getFriendlyErrorMessage(err));
    }
  };

  const handleToggleArchive = async () => {
    const isArchived = Boolean(booking.archived_at);
    try {
      await updateMutation.mutateAsync({
        id: booking.id,
        payload: { archived_at: isArchived ? null : new Date().toISOString() },
      });
      toast.success(isArchived ? 'Arsip Dipulihkan' : 'Pemesanan Diarsipkan');
      setArchiveConfirmOpen(false);
    } catch (err) {
      toast.error('Gagal Mengubah Arsip', getFriendlyErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(booking.id);
      toast.success('Pemesanan Dihapus Permanen');
      navigate('/admin/pemesanan', { replace: true });
    } catch (err) {
      toast.error('Gagal Menghapus', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title={`Detail Pemesanan ${booking.booking_code}`} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/admin/pemesanan"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-forest-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Manajemen Pemesanan
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-extrabold text-forest-950">
              {booking.booking_code}
            </h1>
            <BookingStatusBadge status={booking.status} />
            {booking.archived_at && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Diarsipkan
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">
            Dibuat: {formatDateTimeWIB(booking.created_at)} • Terakhir diperbarui:{' '}
            {formatDateTimeWIB(booking.updated_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <MessageCircle className="h-4 w-4" />
                Hubungi WhatsApp
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => setArchiveConfirmOpen(true)}>
            {booking.archived_at ? (
              <>
                <ArchiveRestore className="h-4 w-4 text-leaf-600" />
                Pulihkan Arsip
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 text-amber-700" />
                Arsipkan
              </>
            )}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Info Pelanggan & Permintaan */}
        <div className="space-y-6 lg:col-span-7">
          <Card>
            <CardContent className="space-y-5">
              <h2 className="font-display text-lg font-bold text-ink">Informasi Pelanggan</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                <div className="flex items-start gap-2.5">
                  <User className="mt-0.5 h-4 w-4 text-leaf-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Nama Lengkap</p>
                    <p className="font-semibold text-ink">{booking.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 text-leaf-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Email</p>
                    <p className="font-semibold text-ink break-all">{booking.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 text-leaf-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">WhatsApp / Telepon</p>
                    <p className="font-semibold text-ink">{booking.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="mt-0.5 h-4 w-4 text-leaf-600 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">Preferensi Jadwal Pelanggan</p>
                    <p className="font-semibold text-ink">
                      {formatDateOnlyID(booking.preferred_date)}
                      {booking.preferred_time ? ` (${booking.preferred_time})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-forest-900/8 pt-4 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-leaf-600 shrink-0" />
                <div>
                  <p className="text-xs text-muted">Alamat / Lokasi Proyek</p>
                  <p className="font-medium text-ink whitespace-pre-line">
                    {booking.project_location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-display text-lg font-bold text-ink">Detail Layanan & Pesan</h2>
              <div className="rounded-xl bg-leaf-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-leaf-600">
                  Layanan Dipilih
                </p>
                <p className="mt-1 font-display text-lg font-bold text-forest-950">
                  {booking.services?.name || 'Layanan tidak ditemukan'}
                </p>
                {booking.estimated_cost !== null && (
                  <p className="mt-1 text-xs text-forest-900">
                    Estimasi biaya tercatat: <strong>{formatIDR(booking.estimated_cost)}</strong>
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted">Pesan Tambahan dari Pelanggan</p>
                <p className="mt-1.5 rounded-xl border border-forest-900/10 bg-surface p-4 text-sm leading-relaxed text-ink whitespace-pre-line">
                  {booking.customer_message || 'Tidak ada pesan tambahan dari pelanggan.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Operasional Admin */}
        <div className="lg:col-span-5">
          <Card>
            <CardContent className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Tindak Lanjut Operasional
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Perbarui status sesuai aturan transisi, jadwal yang disepakati, estimasi biaya,
                  dan catatan internal.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <Select
                  label="Status Pemesanan"
                  required
                  hint={
                    isTerminal
                      ? 'Status ini merupakan status akhir sehingga tidak dapat ditransisikan lagi.'
                      : 'Hanya transisi status yang diizinkan sesuai alur operasional yang ditampilkan.'
                  }
                  error={errors.status?.message}
                  {...register('status')}
                >
                  {availableStatusOptions.map((st) => (
                    <option key={st} value={st}>
                      {BOOKING_STATUS_CONFIG[st].label}
                      {st === booking.status ? ' (Saat ini)' : ''}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Tanggal yang Disepakati"
                  type="date"
                  hint="Isi setelah jadwal disepakati bersama pelanggan."
                  error={errors.agreed_date?.message}
                  {...register('agreed_date')}
                />

                <Input
                  label="Estimasi Biaya (IDR)"
                  type="number"
                  min={0}
                  step="1000"
                  placeholder="Contoh: 2500000"
                  hint="Kosongkan jika estimasi belum ditetapkan."
                  error={errors.estimated_cost?.message}
                  {...register('estimated_cost')}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="admin_notes" className="text-sm font-medium text-ink">
                      Catatan Internal Admin
                    </label>
                    <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/10 px-2 py-0.5 text-[11px] font-semibold text-forest-900">
                      <Lock className="h-3 w-3" />
                      Privat Admin
                    </span>
                  </div>
                  <Textarea
                    id="admin_notes"
                    rows={4}
                    placeholder="Catat hasil panggilan, temuan survei, atau informasi internal tim..."
                    error={errors.admin_notes?.message}
                    {...register('admin_notes')}
                  />
                  <p className="text-xs text-muted">
                    Catatan ini tidak pernah ditampilkan pada halaman akun pelanggan.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting || updateMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  Simpan Pembaruan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        onConfirm={() => void handleToggleArchive()}
        variant="primary"
        title={booking.archived_at ? 'Pulihkan dari Arsip?' : 'Arsipkan Pemesanan?'}
        description={
          booking.archived_at
            ? 'Pemesanan akan tampil kembali di daftar aktif.'
            : 'Pemesanan akan disembunyikan dari daftar aktif tanpa menghapus histori.'
        }
        confirmLabel={booking.archived_at ? 'Pulihkan' : 'Arsipkan'}
        isLoading={updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
        title="Hapus Permanen Pemesanan?"
        description={`Yakin ingin menghapus permanen ${booking.booking_code}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
