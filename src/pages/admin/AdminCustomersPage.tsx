import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, ShieldCheck } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAdminCustomers, useCustomerBookingsByAdmin } from '@/features/customers/api';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateShortWIB, getFriendlyErrorMessage } from '@/lib/utils';
import type { CustomerSummary } from '@/types/database';

const PAGE_SIZE = 10;

export function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const customersQuery = useAdminCustomers({ search: debouncedSearch, page, pageSize: PAGE_SIZE });
  const customerBookingsQuery = useCustomerBookingsByAdmin(selectedCustomer?.id ?? null);

  const items = customersQuery.data?.items ?? [];
  const total = customersQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageMeta title="Manajemen Pelanggan" />

      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Data Pelanggan</h1>
        <p className="text-sm text-muted">
          Daftar akun terdaftar dari tabel profil beserta jumlah pemesanan terkait.
        </p>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-forest-900/10 bg-leaf-50/70 p-4 text-xs sm:text-sm text-forest-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
        <p>
          Demi keamanan dan privasi, kredensial autentikasi tidak pernah ditampilkan. Perubahan
          peran pengguna hanya dilakukan melalui operasi SQL administratif Supabase.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, email, atau nomor telepon..."
              aria-label="Cari pelanggan"
              className="w-full rounded-xl border border-forest-900/15 bg-surface py-2.5 pl-9 pr-3 text-sm focus:border-leaf-600 focus:bg-white focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {customersQuery.isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : customersQuery.isError ? (
        <ErrorState
          message={getFriendlyErrorMessage(customersQuery.error)}
          onRetry={() => void customersQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Pelanggan"
          description="Profil pengguna akan tercatat otomatis ketika pengguna mendaftar melalui Supabase Auth."
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-900/10 text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Nama Pelanggan</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Nomor Telepon</th>
                    <th className="px-4 py-3">Peran</th>
                    <th className="px-4 py-3">Tgl Daftar</th>
                    <th className="px-4 py-3">Pemesanan</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-900/6">
                  {items.map((cust) => (
                    <tr key={cust.id} className="hover:bg-surface/60 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-ink">
                        {cust.full_name || 'Tanpa Nama'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink">{cust.email}</td>
                      <td className="px-4 py-3.5 text-xs text-muted">{cust.phone || '—'}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={cust.role === 'admin' ? 'accent' : 'default'}>
                          {cust.role === 'admin' ? 'Admin' : 'Pelanggan'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {formatDateShortWIB(cust.created_at)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-forest-900">
                        {cust.booking_count}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(cust)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Riwayat
                        </Button>
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

      {/* Modal Riwayat Pemesanan Pelanggan */}
      <Modal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={`Riwayat Pemesanan — ${selectedCustomer?.full_name || selectedCustomer?.email || ''}`}
        description={selectedCustomer?.email}
        size="lg"
      >
        {customerBookingsQuery.isLoading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : customerBookingsQuery.isError ? (
          <ErrorState
            message={getFriendlyErrorMessage(customerBookingsQuery.error)}
            onRetry={() => void customerBookingsQuery.refetch()}
          />
        ) : (customerBookingsQuery.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="Belum Ada Pemesanan"
            description="Akun ini belum memiliki riwayat pemesanan yang terhubung langsung ke user_id."
          />
        ) : (
          <div className="divide-y divide-forest-900/10">
            {customerBookingsQuery.data!.map((b) => (
              <div
                key={b.id}
                className="flex flex-col justify-between gap-2 py-3.5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-forest-900">{b.booking_code}</p>
                  <p className="text-sm font-semibold text-ink">{b.services?.name || '—'}</p>
                  <p className="text-xs text-muted">{formatDateShortWIB(b.created_at)}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookingStatusBadge status={b.status} />
                  <Link to={`/admin/pemesanan/${b.id}`} onClick={() => setSelectedCustomer(null)}>
                    <Button variant="outline" size="sm">
                      Buka
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
