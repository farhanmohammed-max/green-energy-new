import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <PageMeta title="Halaman Tidak Ditemukan" />
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf-100 text-forest-900">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">Error 404</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-forest-950">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Tautan yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke halaman
        utama atau telusuri katalog layanan GREEN ENERGY.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>
        <Link to="/layanan">
          <Button variant="outline">Lihat Layanan</Button>
        </Link>
      </div>
    </div>
  );
}
