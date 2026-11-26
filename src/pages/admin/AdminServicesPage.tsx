import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Power, Search, Sparkles, Trash2, Upload } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ActiveStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAdminCategories } from '@/features/categories/api';
import {
  uploadServiceImage,
  useAdminServices,
  useCreateService,
  useDeleteService,
  useUpdateService,
} from '@/features/services/api';
import { serviceFormSchema, type ServiceFormValues } from '@/schemas';
import { formatIDR, getFriendlyErrorMessage, slugify } from '@/lib/utils';
import type { ServiceWithCategory } from '@/types/database';

export function AdminServicesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceWithCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceWithCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toast = useToast();
  const categoriesQuery = useAdminCategories();
  const servicesQuery = useAdminServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      category_id: '',
      short_description: '',
      description: '',
      benefits_text: '',
      image_url: '',
      price_from: '',
      price_note: 'Harga awal/estimasi, dapat berubah setelah konsultasi.',
      estimated_duration: '',
      is_featured: false,
      is_active: true,
      sort_order: 0,
    },
  });

  const previewImageUrl = watch('image_url');

  const openCreateModal = () => {
    setEditing(null);
    reset({
      name: '',
      slug: '',
      category_id: categoriesQuery.data?.[0]?.id ?? '',
      short_description: '',
      description: '',
      benefits_text: '',
      image_url: '',
      price_from: '',
      price_note: 'Harga awal/estimasi, dapat berubah setelah konsultasi.',
      estimated_duration: '',
      is_featured: false,
      is_active: true,
      sort_order: (servicesQuery.data?.length ?? 0) + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (svc: ServiceWithCategory) => {
    setEditing(svc);
    reset({
      name: svc.name,
      slug: svc.slug,
      category_id: svc.category_id ?? '',
      short_description: svc.short_description,
      description: svc.description,
      benefits_text: (svc.benefits ?? []).join('\n'),
      image_url: svc.image_url ?? '',
      price_from: svc.price_from !== null && svc.price_from !== undefined ? String(svc.price_from) : '',
      price_note: svc.price_note,
      estimated_duration: svc.estimated_duration ?? '',
      is_featured: svc.is_featured,
      is_active: svc.is_active,
      sort_order: svc.sort_order,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadServiceImage(file);
      setValue('image_url', publicUrl, { shouldValidate: true });
      toast.success('Gambar Diunggah', 'Gambar layanan berhasil diunggah ke Supabase Storage.');
    } catch (err) {
      toast.error('Gagal Mengunggah Gambar', getFriendlyErrorMessage(err));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const onSubmit = async (values: ServiceFormValues) => {
    const benefits = (values.benefits_text ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      name: values.name,
      slug: values.slug,
      category_id: values.category_id || null,
      short_description: values.short_description,
      description: values.description,
      benefits,
      image_url: values.image_url?.trim() ? values.image_url.trim() : null,
      price_from: values.price_from ? Number(values.price_from) : null,
      price_note: values.price_note,
      estimated_duration: values.estimated_duration?.trim() ? values.estimated_duration.trim() : null,
      is_featured: values.is_featured,
      is_active: values.is_active,
      sort_order: values.sort_order,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Layanan Diperbarui', `"${values.name}" berhasil diperbarui.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Layanan Ditambahkan', `"${values.name}" berhasil ditambahkan.`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Gagal Menyimpan Layanan', getFriendlyErrorMessage(err));
    }
  };

  const handleToggleActive = async (svc: ServiceWithCategory) => {
    try {
      await updateMutation.mutateAsync({
        id: svc.id,
        payload: { is_active: !svc.is_active },
      });
      toast.success(
        svc.is_active ? 'Layanan Dinonaktifkan' : 'Layanan Diaktifkan',
        `"${svc.name}" berhasil diperbarui.`,
      );
    } catch (err) {
      toast.error('Gagal Mengubah Status', getFriendlyErrorMessage(err));
    }
  };

  const handleToggleFeatured = async (svc: ServiceWithCategory) => {
    try {
      await updateMutation.mutateAsync({
        id: svc.id,
        payload: { is_featured: !svc.is_featured },
      });
      toast.success(
        svc.is_featured ? 'Dihapus dari Unggulan' : 'Ditandai Unggulan',
        `"${svc.name}" berhasil diperbarui.`,
      );
    } catch (err) {
      toast.error('Gagal Mengubah Unggulan', getFriendlyErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Layanan Dihapus', `"${deleteTarget.name}" telah dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Tidak Dapat Menghapus Layanan', getFriendlyErrorMessage(err));
      setDeleteTarget(null);
    }
  };

  const filtered = (servicesQuery.data ?? []).filter((svc) => {
    const matchCat = categoryFilter === 'all' || svc.category_id === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      svc.name.toLowerCase().includes(q) ||
      svc.slug.toLowerCase().includes(q) ||
      svc.short_description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageMeta title="Manajemen Data Layanan" />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Data Layanan</h1>
          <p className="text-sm text-muted">
            Kelola katalog layanan, gambar, estimasi harga awal, status aktif, dan layanan unggulan.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Tambah Layanan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau slug layanan..."
              aria-label="Cari layanan"
              className="w-full rounded-xl border border-forest-900/15 bg-surface py-2.5 pl-9 pr-3 text-sm focus:border-leaf-600 focus:bg-white focus:outline-none"
            />
          </div>
          <select
            aria-label="Filter kategori"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-leaf-600 focus:outline-none sm:w-56"
          >
            <option value="all">Semua Kategori</option>
            {(categoriesQuery.data ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {servicesQuery.isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : servicesQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(servicesQuery.error)}
          onRetry={() => void servicesQuery.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum Ada Layanan"
          description="Tambahkan layanan energi hijau agar dapat dilihat dan dipesan pelanggan."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Tambah Layanan
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Layanan</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Harga Awal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Unggulan</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {filtered.map((svc) => (
                    <tr key={svc.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {svc.image_url ? (
                            <img
                              src={svc.image_url}
                              alt={svc.name}
                              className="h-11 w-14 rounded-lg object-cover border border-forest-900/10 shrink-0"
                            />
                          ) : (
                            <div className="flex h-11 w-14 items-center justify-center rounded-lg bg-leaf-100 text-xs font-bold text-forest-900 shrink-0">
                              GE
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-ink">{svc.name}</p>
                            <p className="font-mono text-xs text-muted">/{svc.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {svc.service_categories?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-forest-900">
                        {svc.price_from !== null ? formatIDR(svc.price_from) : 'Estimasi Custom'}
                      </td>
                      <td className="px-4 py-3.5">
                        <ActiveStatusBadge isActive={svc.is_active} />
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => void handleToggleFeatured(svc)}
                          className="cursor-pointer"
                          title="Ubah status unggulan"
                        >
                          {svc.is_featured ? (
                            <Badge variant="accent">
                              <Sparkles className="h-3 w-3" />
                              Unggulan
                            </Badge>
                          ) : (
                            <Badge variant="neutral">Reguler</Badge>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(svc)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleToggleActive(svc)}
                            title={svc.is_active ? 'Nonaktifkan layanan' : 'Aktifkan layanan'}
                          >
                            <Power
                              className={
                                svc.is_active ? 'h-4 w-4 text-amber-700' : 'h-4 w-4 text-emerald-600'
                              }
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(svc)}
                            title="Hapus layanan"
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

      {/* Modal Form Layanan */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Layanan' : 'Tambah Layanan Baru'}
        description="Perubahan akan langsung terlihat pada website publik jika layanan berstatus aktif."
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nama Layanan"
              required
              placeholder="Contoh: Survei Potensi Panel Surya"
              error={errors.name?.message}
              {...register('name', {
                onChange: (e) => {
                  if (!editing) {
                    setValue('slug', slugify(e.target.value), { shouldValidate: true });
                  }
                },
              })}
            />
            <Input
              label="Slug URL"
              required
              placeholder="survei-potensi-panel-surya"
              error={errors.slug?.message}
              {...register('slug')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Kategori Layanan"
              required
              error={errors.category_id?.message}
              {...register('category_id')}
            >
              <option value="">-- Pilih Kategori --</option>
              {(categoriesQuery.data ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                  {!cat.is_active ? ' (Nonaktif)' : ''}
                </option>
              ))}
            </Select>
            <Input
              label="Estimasi Durasi"
              placeholder="Contoh: 1–2 hari kerja / Menyesuaikan lokasi"
              error={errors.estimated_duration?.message}
              {...register('estimated_duration')}
            />
          </div>

          <Input
            label="Deskripsi Singkat"
            required
            placeholder="Ringkasan satu hingga dua kalimat yang muncul di kartu layanan"
            error={errors.short_description?.message}
            {...register('short_description')}
          />

          <Textarea
            label="Deskripsi Lengkap"
            required
            rows={4}
            placeholder="Jelaskan cakupan layanan, proses, dan hal yang diperoleh pelanggan..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Daftar Manfaat (Satu manfaat per baris)"
            rows={3}
            placeholder={"Penilaian awal lokasi\nIdentifikasi kebutuhan daya\nDasar penyusunan penawaran"}
            error={errors.benefits_text?.message}
            {...register('benefits_text')}
          />

          {/* Gambar Layanan */}
          <div className="rounded-xl border border-forest-900/10 bg-surface p-4 space-y-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-ink">Gambar Layanan</p>
                <p className="text-xs text-muted">
                  Unggah gambar ke Supabase Storage (JPG/PNG/WebP maks. 5 MB) atau masukkan URL gambar.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-xl border border-forest-900/20 bg-white px-3.5 py-2 text-xs font-semibold text-forest-900 hover:bg-leaf-50 cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                {isUploading ? 'Mengunggah...' : 'Unggah Gambar'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void handleImageUpload(e)}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </div>
            <Input
              label="URL Gambar (Opsional)"
              placeholder="https://..."
              error={errors.image_url?.message}
              {...register('image_url')}
            />
            {previewImageUrl && (
              <img
                src={previewImageUrl}
                alt="Pratinjau gambar layanan"
                className="h-32 w-52 rounded-xl object-cover border border-forest-900/10"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Harga Awal (IDR, Opsional)"
              type="number"
              min={0}
              step="1000"
              placeholder="Kosongkan jika custom"
              error={errors.price_from?.message}
              {...register('price_from')}
            />
            <Input
              label="Catatan Harga"
              required
              wrapperClassName="sm:col-span-2"
              error={errors.price_note?.message}
              {...register('price_note')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center pt-1">
            <Input
              label="Urutan Tampilan"
              type="number"
              min={0}
              error={errors.sort_order?.message}
              {...register('sort_order')}
            />
            <label className="flex items-center gap-2.5 text-sm font-medium text-ink pt-5 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-forest-900/30"
                {...register('is_active')}
              />
              Status Aktif
            </label>
            <label className="flex items-center gap-2.5 text-sm font-medium text-ink pt-5 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-forest-900/30"
                {...register('is_featured')}
              />
              Tandai Unggulan
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-forest-900/10">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || isUploading || createMutation.isPending || updateMutation.isPending}
            >
              {editing ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Hapus Layanan?"
        description={`Yakin ingin menghapus "${deleteTarget?.name}"? Jika layanan sudah memiliki riwayat pemesanan, sebaiknya nonaktifkan layanan agar histori pemesanan tetap utuh.`}
        confirmLabel="Ya, Hapus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
