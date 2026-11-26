import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { COMPANY_INFO } from '@/lib/constants';

export function PublicFooter() {
  return (
    <footer className="bg-forest-950 text-leaf-100/90">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo inverted />
            <p className="text-sm leading-relaxed text-leaf-100/75">
              Platform layanan energi hijau untuk membantu rumah tangga dan pelaku usaha beralih ke
              penggunaan energi yang lebih bersih, efisien, dan berkelanjutan.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-solar-400">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-white transition-colors">
                  Katalog Layanan
                </Link>
              </li>
              <li>
                <Link to="/pesan" className="hover:text-white transition-colors">
                  Pesan Layanan
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Pertanyaan Umum (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="hover:text-white transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-solar-400">
              Akses Akun
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Masuk Pelanggan
                </Link>
              </li>
              <li>
                <Link to="/daftar" className="hover:text-white transition-colors">
                  Daftar Akun Pelanggan
                </Link>
              </li>
              <li>
                <Link to="/akun/pemesanan" className="hover:text-white transition-colors">
                  Riwayat Pemesanan Saya
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Portal Administrator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-solar-400">
              Informasi Kontak
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-leaf-100/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-solar-400" aria-hidden="true" />
                <span>{COMPANY_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-solar-400" aria-hidden="true" />
                <span>{COMPANY_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-solar-400" aria-hidden="true" />
                <span>{COMPANY_INFO.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-solar-400" aria-hidden="true" />
                <span>{COMPANY_INFO.operationalHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-leaf-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY_INFO.name} — {COMPANY_INFO.tagline}.
          </p>
          <p>Zona waktu operasional: Asia/Jakarta (WIB).</p>
        </div>
      </div>
    </footer>
  );
}
