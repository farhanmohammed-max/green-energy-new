import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Leaf,
  MessageSquareHeart,
  PhoneCall,
  ShieldCheck,
  Star,
  Sun,
  Zap,
} from 'lucide-react';
import heroSolarImg from '@/assets/hero-solar.jpg';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';
import { ServiceCardSkeleton } from '@/components/ui/Skeleton';
import { ServiceCard } from '@/components/shared/ServiceCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { PageMeta } from '@/components/shared/PageMeta';
import { useActiveCategories } from '@/features/categories/api';
import { useActiveServices } from '@/features/services/api';
import { usePublishedTestimonials } from '@/features/testimonials/api';
import { FAQ_ITEMS } from '@/lib/constants';
import { getFriendlyErrorMessage } from '@/lib/utils';

const advantages = [
  {
    icon: Leaf,
    title: 'Fokus Energi Ramah Lingkungan',
    description:
      'Solusi dirancang untuk mendukung transisi menuju pemanfaatan energi bersih dan pengurangan ketergantungan energi fosil.',
  },
  {
    icon: Zap,
    title: 'Pendekatan Efisiensi Terukur',
    description:
      'Setiap rekomendasi dimulai dari pemahaman pola penggunaan energi di lokasi Anda agar langkah penghematan lebih tepat sasaran.',
  },
  {
    icon: ShieldCheck,
    title: 'Proses Transparan & Terdokumentasi',
    description:
      'Setiap permintaan tercatat dengan kode pemesanan unik dan ditindaklanjuti oleh tim admin sebelum jadwal maupun estimasi disepakati.',
  },
  {
    icon: Compass,
    title: 'Solusi Menyesuaikan Kebutuhan',
    description:
      'Tersedia pilihan konsultasi energi, survei potensi panel surya, audit efisiensi, hingga permintaan penawaran instalasi.',
  },
];

const bookingSteps = [
  {
    step: '01',
    icon: Sun,
    title: 'Pilih Layanan',
    description: 'Telusuri katalog layanan aktif dan pilih layanan yang paling sesuai dengan kebutuhan Anda.',
  },
  {
    step: '02',
    icon: ClipboardCheck,
    title: 'Kirim Permintaan',
    description: 'Lengkapi formulir pemesanan dengan lokasi proyek serta preferensi jadwal Anda.',
  },
  {
    step: '03',
    icon: PhoneCall,
    title: 'Dihubungi Tim Admin',
    description: 'Admin meninjau permintaan dan menghubungi Anda untuk klarifikasi teknis serta estimasi.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Konfirmasi Jadwal',
    description: 'Jadwal pelaksanaan dan penawaran disepakati bersama sebelum pekerjaan dimulai.',
  },
];

export function HomePage() {
  const categoriesQuery = useActiveCategories();
  const featuredServicesQuery = useActiveServices({ featuredOnly: true });
  const testimonialsQuery = usePublishedTestimonials();

  return (
    <div>
      <PageMeta
        description="GREEN ENERGY — Hemat Energi untuk Masa Depan. Temukan solusi energi ramah lingkungan untuk penggunaan energi yang lebih efisien, hemat, dan berkelanjutan."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-leaf-50 via-white to-surface pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-6 lg:col-span-6">
              <Badge variant="default" className="px-3.5 py-1 text-xs font-semibold">
                <Sun className="h-3.5 w-3.5 text-solar-500 fill-solar-500" />
                GREEN ENERGY — Hemat Energi untuk Masa Depan
              </Badge>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-forest-950 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                Bangun Masa Depan Lebih Hijau dengan Energi Bersih
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Temukan solusi energi ramah lingkungan untuk penggunaan energi yang lebih efisien,
                hemat, dan berkelanjutan bagi hunian maupun bangunan usaha Anda.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Link to="/pesan">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Pesan Layanan
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </Link>
                <Link to="/tentang">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3 border-t border-forest-900/10">
                <div className="flex items-center gap-2 text-xs font-medium text-forest-900">
                  <CheckCircle2 className="h-4 w-4 text-leaf-600 shrink-0" />
                  Konsultasi & Survei Terstruktur
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-forest-900">
                  <CheckCircle2 className="h-4 w-4 text-leaf-600 shrink-0" />
                  Kode Pemesanan Unik
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-forest-900">
                  <CheckCircle2 className="h-4 w-4 text-leaf-600 shrink-0" />
                  Estimasi Transparan
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-forest-900/10 bg-forest-900 shadow-xl">
                <img
                  src={heroSolarImg}
                  alt="Ilustrasi bangunan modern ramah lingkungan dengan panel surya di atap dan pepohonan hijau"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 via-forest-950/35 to-transparent p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-white">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-solar-400">
                        Solusi Energi Terbarukan
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white/95">
                        Konsultasi energi, survei potensi surya, audit efisiensi, & instalasi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Layanan */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
              Mengapa GREEN ENERGY
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Pendekatan Terencana untuk Efisiensi Energi Anda
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
              Kami membantu Anda memahami opsi energi bersih secara objektif sebelum menentukan
              langkah implementasi yang paling tepat.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="h-full">
                  <CardContent className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-base font-bold text-ink">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kategori Layanan Unggulan */}
      <section className="border-y border-forest-900/8 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
                Kategori Layanan
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Bidang Solusi Energi Hijau
              </h2>
            </div>
            <Link to="/layanan">
              <Button variant="outline" size="sm">
                Lihat Semua Layanan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            {categoriesQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl border border-forest-900/10 bg-surface"
                  />
                ))}
              </div>
            ) : categoriesQuery.isError ? (
              <ErrorState
                message={getFriendlyErrorMessage(categoriesQuery.error)}
                onRetry={() => void categoriesQuery.refetch()}
              />
            ) : (categoriesQuery.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="Kategori Belum Tersedia"
                description="Kategori layanan aktif akan ditampilkan di sini setelah ditambahkan melalui dashboard admin."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categoriesQuery.data!.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/layanan?kategori=${cat.id}`}
                    className="group rounded-2xl border border-forest-900/10 bg-surface p-5 transition-all hover:border-leaf-600/40 hover:bg-leaf-50/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-forest-900 group-hover:text-leaf-600 transition-colors">
                        {cat.name}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-leaf-600" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                      {cat.description || 'Jelajahi pilihan layanan aktif pada kategori ini.'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Daftar Layanan Unggulan */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
                Layanan Unggulan
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
                Mulai Langkah Hemat Energi Hari Ini
              </h2>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Seluruh layanan ditampilkan langsung dari katalog database aktif GREEN ENERGY.
              </p>
            </div>
            <Link to="/layanan">
              <Button variant="secondary" size="sm">
                Jelajahi Katalog
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-9">
            {featuredServicesQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <ServiceCardSkeleton key={idx} />
                ))}
              </div>
            ) : featuredServicesQuery.isError ? (
              <ErrorState
                message={getFriendlyErrorMessage(featuredServicesQuery.error)}
                onRetry={() => void featuredServicesQuery.refetch()}
              />
            ) : (featuredServicesQuery.data?.length ?? 0) === 0 ? (
              <EmptyState
                title="Belum Ada Layanan Unggulan"
                description="Layanan unggulan aktif akan muncul di sini. Anda tetap dapat melihat seluruh katalog layanan."
                action={
                  <Link to="/layanan">
                    <Button variant="primary" size="sm">
                      Buka Katalog Layanan
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredServicesQuery.data!.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cara Kerja Pemesanan */}
      <section className="border-y border-forest-900/8 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
              Alur Pemesanan
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Cara Kerja Permintaan Layanan
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
              Pengiriman formulir adalah langkah awal konsultasi/penawaran. Jadwal dan estimasi
              biaya dikonfirmasi langsung oleh tim admin bersama Anda.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bookingSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-forest-900/10 bg-surface p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-solar-400">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-display text-2xl font-extrabold text-forest-900/15">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimoni Pelanggan */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
              Testimoni Pelanggan
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Ulasan yang Telah Dipublikasikan
            </h2>
          </div>

          <div className="mt-8">
            {testimonialsQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-44 animate-pulse rounded-2xl border border-forest-900/10 bg-white"
                  />
                ))}
              </div>
            ) : testimonialsQuery.isError ? (
              <ErrorState
                message={getFriendlyErrorMessage(testimonialsQuery.error)}
                onRetry={() => void testimonialsQuery.refetch()}
              />
            ) : (testimonialsQuery.data?.length ?? 0) === 0 ? (
              <EmptyState
                icon={<MessageSquareHeart className="h-6 w-6" />}
                title="Belum Ada Testimoni Dipublikasikan"
                description="Testimoni pelanggan yang telah diverifikasi dan dipublikasikan oleh admin akan ditampilkan di bagian ini."
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialsQuery.data!.map((t) => (
                  <Card key={t.id} className="h-full">
                    <CardContent className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1" aria-label={`Rating ${t.rating} dari 5`}>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={
                                idx < t.rating
                                  ? 'h-4 w-4 text-solar-500 fill-solar-500'
                                  : 'h-4 w-4 text-slate-200'
                              }
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-ink">“{t.content}”</p>
                      </div>
                      <div className="border-t border-forest-900/8 pt-3">
                        <p className="text-sm font-bold text-forest-900">{t.customer_name}</p>
                        {t.city && <p className="text-xs text-muted">{t.city}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Ringkas */}
      <section className="border-t border-forest-900/8 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
              Pertanyaan Umum
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
              Hal yang Sering Ditanyakan
            </h2>
          </div>

          <div className="mt-8">
            <Accordion items={FAQ_ITEMS.slice(0, 4)} />
          </div>

          <div className="mt-6 text-center">
            <Link to="/faq">
              <Button variant="outline">
                Lihat Semua FAQ
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Penutup */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-forest-900 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-solar-400">
                  <Leaf className="h-3.5 w-3.5" />
                  Siap Berdiskusi dengan Tim Kami?
                </span>
                <h2 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">
                  Ajukan Permintaan Konsultasi atau Survei Energi Hijau Anda
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-leaf-100/85 sm:text-base">
                  Kirim permintaan dalam hitungan menit tanpa komitmen pembayaran di muka. Tim admin
                  kami akan menghubungi Anda untuk membahas solusi terbaik.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link to="/pesan">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto">
                    Pesan Layanan Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/kontak">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 sm:w-auto"
                  >
                    Hubungi Kami
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
