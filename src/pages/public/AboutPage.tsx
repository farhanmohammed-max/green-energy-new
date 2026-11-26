import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Eye, HeartHandshake, Leaf, ShieldCheck, Target, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/shared/PageMeta';
import { COMPANY_INFO } from '@/lib/constants';

const values = [
  {
    icon: Leaf,
    title: 'Keberlanjutan',
    description:
      'Setiap rekomendasi layanan berorientasi pada pengurangan pemborosan energi dan pemanfaatan sumber energi yang lebih ramah lingkungan.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparansi',
    description:
      'Estimasi awal, lingkup pekerjaan, dan jadwal disampaikan secara terbuka tanpa klaim berlebihan.',
  },
  {
    icon: Compass,
    title: 'Ketepatan Analisis',
    description:
      'Keputusan solusi selalu didahului peninjauan kebutuhan dan kondisi lokasi secara objektif.',
  },
  {
    icon: HeartHandshake,
    title: 'Kemitraan Jangka Panjang',
    description:
      'Kami mendampingi pelanggan mulai dari tahap konsultasi awal hingga pelaksanaan layanan selesai.',
  },
];

export function AboutPage() {
  return (
    <div className="py-12 sm:py-16">
      <PageMeta
        title="Tentang Kami"
        description="Kenali profil, visi, misi, nilai utama, dan komitmen lingkungan GREEN ENERGY."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">Tentang Kami</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
            Mengenal GREEN ENERGY — Hemat Energi untuk Masa Depan
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            GREEN ENERGY hadir sebagai platform layanan energi ramah lingkungan yang menjembatani
            kebutuhan masyarakat dan pelaku usaha terhadap solusi efisiensi energi, konsultasi,
            survei potensi panel surya, hingga instalasi sistem energi bersih secara terstruktur.
          </p>
        </div>

        {/* Notice Placeholder Konten */}
        <div className="flex items-start gap-3 rounded-2xl border border-forest-900/10 bg-leaf-50/80 p-4 text-xs sm:text-sm text-forest-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
          <p>
            <span className="font-semibold">Catatan Profil Perusahaan:</span> Konten profil
            perusahaan pada halaman ini disiapkan sebagai struktur awal yang bersih dan dapat
            disesuaikan dengan informasi legalitas atau sejarah perusahaan Anda sebelum publikasi.
          </p>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-900 text-solar-400">
                <Eye className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-bold text-ink">Visi Kami</h2>
              <p className="text-sm leading-relaxed text-muted">
                Menjadi mitra terpercaya dalam mendorong pemanfaatan energi bersih dan budaya hemat
                energi di Indonesia melalui layanan yang mudah diakses, transparan, dan
                bertanggung jawab terhadap lingkungan.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-600 text-white">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-bold text-ink">Misi Kami</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-muted list-disc pl-5">
                <li>
                  Mempermudah masyarakat mengenal dan memesan layanan konsultasi, survei, audit,
                  serta solusi energi ramah lingkungan.
                </li>
                <li>
                  Menyediakan alur permintaan dan komunikasi layanan yang tertata dan terdokumentasi.
                </li>
                <li>
                  Memberikan rekomendasi efisiensi energi yang objektif sesuai kebutuhan masing-masing lokasi.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tujuan & Komitmen Lingkungan */}
        <Card className="bg-forest-900 text-white border-0">
          <CardContent className="p-6 sm:p-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-solar-400">
                Tujuan Perusahaan
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Mempermudah Transisi Menuju Penggunaan Energi yang Lebih Bijak
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-leaf-100/85">
                Banyak pemilik rumah maupun bisnis ingin mulai berhemat energi dan memanfaatkan
                energi surya, tetapi sering terkendala oleh kurangnya informasi awal dan alur
                pemesanan yang tidak terpusat. GREEN ENERGY menyederhanakan langkah pertama tersebut.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-solar-400">
                Komitmen Lingkungan
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Langkah Nyata Tanpa Klaim Berlebihan
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-leaf-100/85">
                Kami percaya upaya pelestarian lingkungan harus dibangun di atas kejujuran data.
                Oleh karena itu, setiap estimasi efisiensi dan potensi panel surya dibahas
                berdasarkan kondisi aktual lokasi pelanggan, bukan janji generik.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nilai Utama */}
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Nilai Utama Perusahaan</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <Card key={val.title} className="h-full">
                  <CardContent className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-base font-bold text-ink">{val.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{val.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-forest-900/10 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Ingin Mengetahui Layanan {COMPANY_INFO.name} Lebih Lanjut?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Jelajahi katalog layanan aktif kami atau kirim pertanyaan langsung kepada tim.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/layanan">
              <Button variant="primary">
                Lihat Layanan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/kontak">
              <Button variant="outline">Hubungi Kami</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
