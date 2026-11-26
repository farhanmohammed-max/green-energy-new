import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { ServiceCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/Button';
import { useActiveCategories } from '@/features/categories/api';
import { useActiveServices } from '@/features/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { cn, getFriendlyErrorMessage } from '@/lib/utils';

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('kategori') || 'all';
  const [categoryId, setCategoryId] = useState<string>(initialCategory);
  const [searchInput, setSearchInput] = useState<string>(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchInput, 250);

  useEffect(() => {
    const paramCat = searchParams.get('kategori') || 'all';
    if (paramCat !== categoryId) {
      setCategoryId(paramCat);
    }
  }, [searchParams, categoryId]);

  const categoriesQuery = useActiveCategories();
  const servicesQuery = useActiveServices({
    categoryId,
    search: debouncedSearch,
  });

  const handleSelectCategory = (nextCat: string) => {
    setCategoryId(nextCat);
    const nextParams = new URLSearchParams(searchParams);
    if (nextCat === 'all') {
      nextParams.delete('kategori');
    } else {
      nextParams.set('kategori', nextCat);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleReset = () => {
    setSearchInput('');
    handleSelectCategory('all');
  };

  return (
    <div className="py-12 sm:py-16">
      <PageMeta
        title="Katalog Layanan"
        description="Jelajahi layanan energi hijau GREEN ENERGY: konsultasi energi, survei potensi panel surya, instalasi panel surya, dan audit efisiensi energi."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
            Katalog Layanan Aktif
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
            Solusi Energi Hijau untuk Kebutuhan Anda
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Pilih layanan untuk melihat detail manfaat, estimasi durasi, dan mengajukan permintaan
            konsultasi atau penawaran.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 space-y-4 rounded-2xl border border-forest-900/10 bg-white p-4 sm:p-5 shadow-xs">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama layanan atau kata kunci (contoh: panel surya, audit, konsultasi)..."
              aria-label="Cari layanan"
              className="w-full rounded-xl border border-forest-900/15 bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-muted/70 focus:border-leaf-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-leaf-600/20"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Kategori:
            </span>
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                categoryId === 'all'
                  ? 'border-forest-900 bg-forest-900 text-white'
                  : 'border-forest-900/15 bg-white text-ink hover:bg-leaf-50',
              )}
            >
              Semua Kategori
            </button>
            {(categoriesQuery.data ?? []).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                  categoryId === cat.id
                    ? 'border-forest-900 bg-forest-900 text-white'
                    : 'border-forest-900/15 bg-white text-ink hover:bg-leaf-50',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Service Grid */}
        <div className="mt-8">
          {servicesQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ServiceCardSkeleton key={idx} />
              ))}
            </div>
          ) : servicesQuery.isError ? (
            <ErrorState
              message={getFriendlyErrorMessage(servicesQuery.error)}
              onRetry={() => void servicesQuery.refetch()}
            />
          ) : (servicesQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="Layanan Tidak Ditemukan"
              description={
                debouncedSearch || categoryId !== 'all'
                  ? 'Tidak ada layanan aktif yang cocok dengan filter pencarian Anda.'
                  : 'Belum ada layanan aktif yang tersedia saat ini.'
              }
              action={
                (debouncedSearch || categoryId !== 'all') && (
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset Pencarian & Filter
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {servicesQuery.data!.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
