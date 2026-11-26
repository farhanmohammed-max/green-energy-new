import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  Sparkles,
  Sun,
  Tag,
} from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useActiveServiceBySlug } from '@/features/services/api';
import { formatIDR, getFriendlyErrorMessage } from '@/lib/utils';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const serviceQuery = useActiveServiceBySlug(slug);

  if (serviceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (serviceQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState
          message={getFriendlyErrorMessage(serviceQuery.error)}
          onRetry={() => void serviceQuery.refetch()}
        />
      </div>
    );
  }

  const service = serviceQuery.data;

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <PageMeta title="Layanan Tidak Ditemukan" />
        <EmptyState
          title="Layanan Tidak Ditemukan atau Tidak Aktif"
          description="Layanan yang Anda cari mungkin sudah dinonaktifkan atau tautan tidak valid."
          action={
            <Link to="/layanan">
              <Button variant="primary">Kembali ke Katalog Layanan</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14">
      <PageMeta title={service.name} description={service.short_description} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/layanan"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-forest-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog Layanan
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Content */}
          <div className="space-y-6 lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-forest-900/10 bg-gradient-to-br from-forest-900 via-forest-800 to-leaf-600 shadow-sm">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] w-full flex-col items-center justify-center p-8 text-center text-leaf-100">
                  <Sun className="h-14 w-14 text-solar-400" aria-hidden="true" />
                  <p className="mt-3 font-display text-lg font-bold">{service.name}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {service.service_categories?.name && (
                <Badge variant="default">{service.service_categories.name}</Badge>
              )}
              {service.is_featured && (
                <Badge variant="accent">
                  <Sparkles className="h-3 w-3" />
                  Layanan Unggulan
                </Badge>
              )}
            </div>

            <div>
              <h1 className="font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
                {service.name}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {service.short_description}
              </p>
            </div>

            <Card>
              <CardContent className="space-y-4">
                <h2 className="font-display text-lg font-bold text-ink">Deskripsi Lengkap</h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
                  {service.description}
                </div>
              </CardContent>
            </Card>

            {service.benefits && service.benefits.length > 0 && (
              <Card>
                <CardContent className="space-y-4">
                  <h2 className="font-display text-lg font-bold text-ink">Manfaat Utama</h2>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {service.benefits.map((benefit, index) => (
                      <li
                        key={`${benefit}-${index}`}
                        className="flex items-start gap-2.5 rounded-xl bg-leaf-50/70 p-3 text-sm text-ink"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4.5 w-4.5 shrink-0 text-leaf-600"
                          aria-hidden="true"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sticky Booking Card */}
          <aside className="lg:col-span-4">
            <Card className="sticky top-24">
              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Informasi Estimasi
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-forest-900">
                    <Tag className="h-5 w-5 text-leaf-600 shrink-0" aria-hidden="true" />
                    <span className="font-display text-2xl font-extrabold">
                      {service.price_from !== null
                        ? `Mulai ${formatIDR(service.price_from)}`
                        : 'Estimasi Custom'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{service.price_note}</p>
                </div>

                {service.estimated_duration && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-surface p-3.5 text-sm">
                    <Clock className="h-4.5 w-4.5 text-leaf-600 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-muted">Estimasi Durasi</p>
                      <p className="font-semibold text-ink">{service.estimated_duration}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-950">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                  <p>
                    Pengajuan pemesanan belum mengikat pembayaran ataupun jadwal final. Tim admin
                    akan menghubungi Anda untuk konfirmasi.
                  </p>
                </div>

                <Link to={`/pesan/${service.slug}`} className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Pesan Layanan Ini
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </Link>

                <Link to="/kontak" className="block">
                  <Button variant="outline" className="w-full">
                    Tanya Tim Kami
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
