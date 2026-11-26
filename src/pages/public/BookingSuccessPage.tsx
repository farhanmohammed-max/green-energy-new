import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Copy, Check, ArrowRight, ClipboardList, PhoneCall } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { LAST_BOOKING_STORAGE_KEY } from './BookingPage';
import { formatDateOnlyID } from '@/lib/utils';
import type { BookingConfirmationState } from '@/types/database';

function loadConfirmation(locationState: unknown): BookingConfirmationState | null {
  if (
    locationState &&
    typeof locationState === 'object' &&
    'bookingCode' in locationState &&
    typeof (locationState as BookingConfirmationState).bookingCode === 'string'
  ) {
    return locationState as BookingConfirmationState;
  }

  try {
    const raw = sessionStorage.getItem(LAST_BOOKING_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as BookingConfirmationState;
    }
  } catch {
    return null;
  }
  return null;
}

export function BookingSuccessPage() {
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const confirmation = loadConfirmation(location.state);

  const handleCopyCode = async () => {
    if (!confirmation?.bookingCode) return;
    try {
      await navigator.clipboard.writeText(confirmation.bookingCode);
      setCopied(true);
      toast.success('Kode Pemesanan Disalin', confirmation.bookingCode);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal Menyalin', 'Silakan salin kode pemesanan secara manual.');
    }
  };

  if (!confirmation) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <PageMeta title="Konfirmasi Pemesanan" />
        <Card>
          <CardContent className="p-8 space-y-4">
            <h1 className="font-display text-2xl font-bold text-ink">
              Data Konfirmasi Tidak Tersedia
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              Demi privasi, detail pemesanan tamu tidak dapat diakses kembali secara publik setelah
              sesi browser berakhir. Jika Anda ingin mengajukan permintaan baru, silakan buka
              formulir pemesanan.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/pesan">
                <Button variant="primary">Buat Pemesanan Baru</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Kembali ke Beranda</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16">
      <PageMeta
        title="Pemesanan Berhasil Dikirim"
        description="Permintaan pemesanan GREEN ENERGY Anda berhasil tercatat."
      />

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Card className="overflow-hidden border-emerald-200 shadow-md">
          <div className="bg-forest-900 px-6 py-8 text-center text-white sm:px-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-600 text-white shadow-sm">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-solar-400">
              Status: Berhasil Diterima (Pending)
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
              Permintaan Pemesanan Anda Telah Tercatat
            </h1>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Booking Code Box */}
            <div className="rounded-2xl border border-forest-900/15 bg-leaf-50/70 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Kode Pemesanan Anda
              </p>
              <p className="mt-1.5 font-mono text-xl font-extrabold tracking-wide text-forest-950 sm:text-2xl break-all">
                {confirmation.bookingCode}
              </p>
              <div className="mt-3 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => void handleCopyCode()}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Salin Kode Pemesanan
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2.5 text-xs text-muted">
                Simpan kode ini sebagai referensi saat tim admin menghubungi Anda.
              </p>
            </div>

            {/* Summary Details */}
            <dl className="divide-y divide-forest-900/8 rounded-2xl border border-forest-900/10 bg-white px-5">
              <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:justify-between">
                <dt className="text-xs font-medium text-muted">Nama Pelanggan</dt>
                <dd className="text-sm font-semibold text-ink">{confirmation.customerName}</dd>
              </div>
              <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:justify-between">
                <dt className="text-xs font-medium text-muted">Layanan Dipilih</dt>
                <dd className="text-sm font-semibold text-ink">{confirmation.serviceName}</dd>
              </div>
              {confirmation.preferredDate && (
                <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:justify-between">
                  <dt className="text-xs font-medium text-muted">Preferensi Tanggal</dt>
                  <dd className="text-sm font-semibold text-ink">
                    {formatDateOnlyID(confirmation.preferredDate)}
                    {confirmation.preferredTime ? ` (${confirmation.preferredTime})` : ''}
                  </dd>
                </div>
              )}
            </dl>

            {/* Next Step Explanation */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs sm:text-sm leading-relaxed text-amber-950">
              <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <p className="font-semibold">Langkah Selanjutnya</p>
                <p className="mt-1">
                  Admin GREEN ENERGY akan meninjau permintaan Anda dan menghubungi Anda melalui
                  WhatsApp atau email untuk klarifikasi kebutuhan, penyampaian estimasi biaya, serta
                  konfirmasi jadwal resmi. Tanggal yang dipilih sebelumnya belum merupakan jadwal
                  final.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {user && (
                <Link to="/akun/pemesanan" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    <ClipboardList className="h-4 w-4" />
                    Lihat Riwayat Pemesanan
                  </Button>
                </Link>
              )}
              <Link to="/layanan" className="flex-1">
                <Button variant="primary" className="w-full">
                  Lihat Layanan Lainnya
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/" className="sm:w-auto">
                <Button variant="outline" className="w-full">
                  Beranda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
