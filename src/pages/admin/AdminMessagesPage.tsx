import { useState } from 'react';
import { Eye, Search, Trash2 } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ContactStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  useAdminContactMessages,
  useDeleteContactMessage,
  useUpdateContactMessageStatus,
} from '@/features/contact-messages/api';
import { useDebounce } from '@/hooks/useDebounce';
import { CONTACT_STATUS_CONFIG, CONTACT_STATUS_LIST } from '@/lib/constants';
import { formatDateTimeWIB, getFriendlyErrorMessage } from '@/lib/utils';
import type { ContactMessage, ContactMessageStatus } from '@/types/database';

const PAGE_SIZE = 10;

export function AdminMessagesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContactMessageStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const toast = useToast();
  const debouncedSearch = useDebounce(search, 300);
  const messagesQuery = useAdminContactMessages({
    search: debouncedSearch,
    status,
    page,
    pageSize: PAGE_SIZE,
  });
  const updateStatusMutation = useUpdateContactMessageStatus();
  const deleteMutation = useDeleteContactMessage();

  const handleOpenDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'new') {
      void updateStatusMutation
        .mutateAsync({ id: msg.id, status: 'read' })
        .then((updated) => setSelectedMessage(updated))
        .catch(() => {
          // Biarkan tetap terbuka meski gagal auto-mark read
        });
    }
  };

  const handleChangeStatus = async (msg: ContactMessage, nextStatus: ContactMessageStatus) => {
    try {
      const updated = await updateStatusMutation.mutateAsync({ id: msg.id, status: nextStatus });
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(updated);
      }
      toast.success(
        'Status Pesan Diperbarui',
        `Status diubah menjadi ${CONTACT_STATUS_CONFIG[nextStatus].label}.`,
      );
    } catch (err) {
      toast.error('Gagal Mengubah Status', getFriendlyErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      toast.success('Pesan Dihapus');
      setDeleteTarget(null);
    } catch (err) {
      toast.error('Gagal Menghapus Pesan', getFriendlyErrorMessage(err));
    }
  };

  const items = messagesQuery.data?.items ?? [];
  const total = messagesQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageMeta title="Manajemen Pesan Masuk" />

      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Pesan Masuk</h1>
        <p className="text-sm text-muted">
          Tinjau pesan dari formulir kontak website publik dan perbarui status tindak lanjutnya.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama pengirim, email, atau subjek..."
              aria-label="Cari pesan masuk"
              className="w-full rounded-xl border border-forest-900/15 bg-surface py-2.5 pl-9 pr-3 text-sm focus:border-leaf-600 focus:bg-white focus:outline-none"
            />
          </div>
          <select
            aria-label="Filter status pesan"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ContactMessageStatus | 'all');
              setPage(1);
            }}
            className="rounded-xl border border-forest-900/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-leaf-600 focus:outline-none sm:w-52"
          >
            <option value="all">Semua Status</option>
            {CONTACT_STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                {CONTACT_STATUS_CONFIG[st].label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {messagesQuery.isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : messagesQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(messagesQuery.error)}
          onRetry={() => void messagesQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesan Masuk"
          description="Belum ada pesan yang sesuai dengan pencarian atau filter status."
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Pengirim</th>
                    <th className="px-4 py-3">Subjek & Ringkasan</th>
                    <th className="px-4 py-3">Tanggal Masuk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {items.map((msg) => (
                    <tr key={msg.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink">{msg.customer_name}</p>
                        <p className="text-xs text-muted">{msg.customer_email}</p>
                        {msg.customer_phone && (
                          <p className="text-xs text-muted">{msg.customer_phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-sm">
                        <p className="font-semibold text-ink">{msg.subject}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{msg.message}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap">
                        {formatDateTimeWIB(msg.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <ContactStatusBadge status={msg.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetail(msg)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Baca
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(msg)}
                            aria-label="Hapus pesan"
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

      {/* Detail Modal */}
      <Modal
        open={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject ?? 'Detail Pesan'}
        description={
          selectedMessage
            ? `${selectedMessage.customer_name} • ${selectedMessage.customer_email}`
            : undefined
        }
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>Diterima: {formatDateTimeWIB(selectedMessage.created_at)}</span>
              {selectedMessage.customer_phone && (
                <span>Telepon: {selectedMessage.customer_phone}</span>
              )}
              <ContactStatusBadge status={selectedMessage.status} />
            </div>

            <div className="rounded-xl border border-forest-900/10 bg-surface p-4 text-sm leading-relaxed text-ink whitespace-pre-line">
              {selectedMessage.message}
            </div>

            <div className="space-y-2 border-t border-forest-900/10 pt-4">
              <p className="text-xs font-semibold text-muted">Ubah Status Tindak Lanjut:</p>
              <div className="flex flex-wrap gap-2">
                {CONTACT_STATUS_LIST.map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={selectedMessage.status === st ? 'primary' : 'outline'}
                    disabled={updateStatusMutation.isPending}
                    onClick={() => void handleChangeStatus(selectedMessage, st)}
                  >
                    {CONTACT_STATUS_CONFIG[st].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Hapus Pesan Masuk?"
        description={`Yakin ingin menghapus pesan dari "${deleteTarget?.customer_name}" dengan subjek "${deleteTarget?.subject}"?`}
        confirmLabel="Ya, Hapus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
