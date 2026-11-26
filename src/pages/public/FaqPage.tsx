import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { FAQ_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [search, setSearch] = useState<string>('');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(FAQ_ITEMS.map((item) => item.category)));
    return ['Semua', ...unique];
  }, []);

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, search]);

  return (
    <div className="py-12 sm:py-16">
      <PageMeta
        title="Pertanyaan Umum (FAQ)"
        description="Temukan jawaban atas pertanyaan seputar pemesanan layanan, panel surya, konsultasi energi, survei, biaya, dan konfirmasi jadwal GREEN ENERGY."
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
            Pusat Informasi
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Pelajari cara kerja layanan, proses survei, konsultasi energi, serta alur konfirmasi
            jadwal GREEN ENERGY.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan (contoh: panel surya, biaya, survei, jadwal)..."
              aria-label="Cari FAQ"
              className="w-full rounded-xl border border-forest-900/15 bg-white py-3 pl-10 pr-4 text-sm text-ink placeholder:text-muted/70 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                  selectedCategory === cat
                    ? 'border-forest-900 bg-forest-900 text-white'
                    : 'border-forest-900/15 bg-white text-ink hover:bg-leaf-50',
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            title="Pertanyaan Tidak Ditemukan"
            description="Coba kata kunci lain atau pilih kategori Semua."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('Semua');
                }}
              >
                Reset Pencarian
              </Button>
            }
          />
        ) : (
          <Accordion items={filteredItems} />
        )}

        {/* CTA */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-forest-900/10 bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Masih memiliki pertanyaan lain?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Tim kami siap membantu menjelaskan layanan yang sesuai dengan lokasi Anda.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link to="/kontak">
              <Button variant="outline">Hubungi Kami</Button>
            </Link>
            <Link to="/pesan">
              <Button variant="primary">
                Pesan Layanan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
