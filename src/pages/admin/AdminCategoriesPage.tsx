import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Power, Search, Trash2 } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ActiveStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/api';
import { categoryFormSchema, type CategoryFormValues } from '@/schemas';
import { getFriendlyErrorMessage, slugify } from '@/lib/utils';
import type { ServiceCategory } from '@/types/database';

export function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(null);

  const toast = useToast();
  const categoriesQuery = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      sort_order: 0,
      is_active: true,
    },
  });

  const openCreateModal = () => {
    setEditing(null);
    reset({
      name: '',
      slug: '',
      description: '',
      sort_order: (categoriesQuery.data?.length ?? 0) + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: ServiceCategory) => {
    setEditing(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      sort_order: cat.sort_order,
      is_active: cat.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description?.trim() ? values.description.trim() : null,
      sort_order: values.sort_order,
      is_active: values.is_active,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
        toast.success('Kategori Diperbarui', `Kategori "${values.name}" berhasil disimpan.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Kategori Ditambahkan', `Kategori "${values.name}" berhasil dibuat.`);
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Gagal Menyimpan Kategori', getFriendlyErrorMessage(err));
    }
  };

  const handleToggleActive = async (cat: ServiceCategory) => {
    try {
      await updateMutation.mutateAsync({
        id: cat.id,
        payload: { is_active: !cat.is_active },
      });
      toast.success(
        cat.is_active ? 'Kategori Dinonaktifkan' : 'Kategori Diaktifkan',
        `Status "${cat.name}" berhasil diubah.`,
      );
    } catch (err) {
      toast.error('Gagal Mengubah Status', getFriendlyErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Kategori Dihapus', `Kategori "${deleteTarget.name}" telah dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Tidak Dapat Menghapus Kategori', getFriendlyErrorMessage(err));
      setDeleteTarget(null);
    }
  };

  const filtered = (categoriesQuery.data ?? []).filter((cat) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.description ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageMeta title="Manajemen Kategori Layanan" />

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Kategori Layanan</h1>
          <p className="text-sm text-muted">
            Kelola kategori layanan yang tampil pada katalog website publik.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau slug kategori..."
              aria-label="Cari kategori"
              className="w-full rounded-xl border border-forest-900/15 bg-surface py-2.5 pl-9 pr-3 text-sm focus:border-leaf-600 focus:bg-white focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {categoriesQuery.isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : categoriesQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(categoriesQuery.error)}
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Belum Ada Kategori"
          description="Tambahkan kategori layanan pertama untuk mengelompokkan katalog layanan."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Tambah Kategori
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Urutan</th>
                    <th className="px-4 py-3">Nama & Slug</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-muted">
                        #{cat.sort_order}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink">{cat.name}</p>
                        <p className="font-mono text-xs text-muted">/{cat.slug}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted max-w-xs">
                        {cat.description || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <ActiveStatusBadge isActive={cat.is_active} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            aria-label={`Edit ${cat.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleToggleActive(cat)}
                            title={cat.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            aria-label={cat.is_active ? 'Nonaktifkan kategori' : 'Aktifkan kategori'}
                          >
                            <Power
                              className={
                                cat.is_active ? 'h-4 w-4 text-amber-700' : 'h-4 w-4 text-emerald-600'
                              }
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(cat)}
                            aria-label={`Hapus ${cat.name}`}
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
        title={editing ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Nama Kategori"
            required
            placeholder="Contoh: Panel Surya"
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
            label="Slug"
            required
            placeholder="panel-surya"
            hint="Huruf kecil, angka, dan tanda hubung (-)."
            error={errors.slug?.message}
            {...register('slug')}
          />

          <Textarea
            label="Deskripsi"
            rows={3}
            placeholder="Ringkasan singkat kategori layanan..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Urutan Tampilan"
            type="number"
            min={0}
            error={errors.sort_order?.message}
            {...register('sort_order')}
          />

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-forest-900/30"
              {...register('is_active')}
            />
            Kategori Aktif (tampil di website publik)
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
              {editing ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Hapus Kategori Layanan?"
        description={`Hapus kategori "${deleteTarget?.name}"? Jika kategori sudah dipakai oleh layanan, database akan menolak penghapusan — gunakan tombol nonaktif sebagai gantinya.`}
        confirmLabel="Ya, Hapus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
