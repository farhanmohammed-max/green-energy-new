import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Info, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ActiveStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminTestimonials,
  useCreateTestimonial,
  useDeleteTestimonial,
  useUpdateTestimonial,
} from '@/features/testimonials/api';
import { testimonialFormSchema, type TestimonialFormValues } from '@/schemas';
import { getFriendlyErrorMessage } from '@/lib/utils';
import type { Testimonial } from '@/types/database';

export function AdminTestimonialsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const toast = useToast();
  const testimonialsQuery = useAdminTestimonials();
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      customer_name: '',
      city: '',
      content: '',
      rating: 5,
      is_published: false,
      sort_order: 0,
    },
  });

  const openCreateModal = () => {
    setEditing(null);
    reset({
      customer_name: '',
      city: '',
      content: '',
      rating: 5,
      is_published: false,
      sort_order: (testimonialsQuery.data?.length ?? 0) + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditing(item);
    reset({
      customer_name: item.customer_name,
      city: item.city ?? '',
      content: item.content,
      rating: item.rating,
      is_published: item.is_published,
      sort_order: item.sort_order,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: TestimonialFormValues) => {
    const payload = {
      customer_name: values.customer_name,
      city: values.city?.trim() ? values.city.trim() : null,
      content: values.content,
      rating: values.rating,
      is_published: values.is_published,
      sort_order: values.sort_order,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Testimoni Diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Testimoni Ditambahkan');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Gagal Menyimpan Testimoni', getFriendlyErrorMessage(err));
    }
  };

  const handleTogglePublish = async (item: Testimonial) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: { is_published: !item.is_published },
      });
      toast.success(item.is_published ? 'Testimoni Disembunyikan' : 'Testimoni Dipublikasikan');
    } catch (err) {
      toast.error('Gagal Mengubah Status Publikasi', getFriendlyErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Testimoni Dihapus');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Gagal Menghapus Testimoni', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Manajemen Testimoni" />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Manajemen Testimoni</h1>
          <p className="text-sm text-muted">
            Kelola ulasan pelanggan. Hanya testimoni berstatus Dipublikasikan yang tampil di beranda.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Tambah Testimoni
        </Button>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-forest-900/10 bg-leaf-50/70 p-4 text-xs sm:text-sm text-forest-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
        <p>
          Pastikan hanya mempublikasikan testimoni asli yang telah disetujui pelanggan. Simpan
          ulasan demo sebagai <strong>Disembunyikan</strong> hingga data pelanggan nyata tersedia.
        </p>
      </div>

      {testimonialsQuery.isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : testimonialsQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(testimonialsQuery.error)}
          onRetry={() => void testimonialsQuery.refetch()}
        />
      ) : (testimonialsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="Belum Ada Testimoni"
          description="Tambahkan testimoni pelanggan yang terverifikasi untuk ditampilkan di halaman beranda."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Tambah Testimoni
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">Isi Testimoni</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Publikasi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {testimonialsQuery.data!.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink">{item.customer_name}</p>
                        {item.city && <p className="text-xs text-muted">{item.city}</p>}
                      </td>
                      <td className="px-4 py-3.5 max-w-md text-xs leading-relaxed text-ink">
                        “{item.content}”
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={
                                idx < item.rating
                                  ? 'h-3.5 w-3.5 text-solar-500 fill-solar-500'
                                  : 'h-3.5 w-3.5 text-slate-200'
                              }
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <ActiveStatusBadge
                          isActive={item.is_published}
                          activeLabel="Dipublikasikan"
                          inactiveLabel="Disembunyikan"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(item)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleTogglePublish(item)}
                            title={item.is_published ? 'Sembunyikan' : 'Publikasikan'}
                          >
                            {item.is_published ? (
                              <EyeOff className="h-4 w-4 text-amber-700" />
                            ) : (
                              <Eye className="h-4 w-4 text-emerald-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            aria-label="Hapus testimoni"
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
          </CardContent>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Testimoni' : 'Tambah Testimoni'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nama Pelanggan"
              required
              placeholder="Contoh: Budi Santoso"
              error={errors.customer_name?.message}
              {...register('customer_name')}
            />
            <Input
              label="Kota (Opsional)"
              placeholder="Contoh: Bandung"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>

          <Textarea
            label="Isi Testimoni"
            required
            rows={4}
            placeholder="Tuliskan pengalaman pelanggan terhadap layanan GREEN ENERGY..."
            error={errors.content?.message}
            {...register('content')}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Rating" required error={errors.rating?.message} {...register('rating')}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Bintang
                </option>
              ))}
            </Select>
            <Input
              label="Urutan Tampilan"
              type="number"
              min={0}
              error={errors.sort_order?.message}
              {...register('sort_order')}
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-forest-900/30"
              {...register('is_published')}
            />
            Publikasikan di Website Publik
          </label>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Simpan Perubahan' : 'Tambah Testimoni'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Hapus Testimoni?"
        description={`Yakin ingin menghapus testimoni dari "${deleteTarget?.customer_name}"?`}
        confirmLabel="Ya, Hapus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
