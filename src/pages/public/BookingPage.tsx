import { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck2, Info, ShieldCheck, Send } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/shared/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useActiveServices } from '@/features/services/api';
import { useCreateBooking } from '@/features/bookings/api';
import { bookingFormSchema, type BookingFormValues } from '@/schemas';
import { PREFERRED_TIME_OPTIONS } from '@/lib/constants';
import { getFriendlyErrorMessage, getTodayJakartaISO } from '@/lib/utils';
import type { BookingConfirmationState, PreferredTime } from '@/types/database';

export const LAST_BOOKING_STORAGE_KEY = 'ge_last_booking_confirmation';

export function BookingPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const querySlug = searchParams.get('layanan') || undefined;
  const targetSlug = slug || querySlug;

  const navigate = useNavigate();
  const toast = useToast();
  const { user, profile } = useAuth();
  const servicesQuery = useActiveServices();
  const createBookingMutation = useCreateBooking();

  const todayISO = getTodayJakartaISO();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      service_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      project_location: '',
      preferred_date: '',
      preferred_time: '',
      customer_message: '',
      privacy_consent: false,
    },
  });

  const selectedServiceId = watch('service_id');

  // Pre-select layanan dari URL slug/query bila tersedia dan belum dipilih pengguna
  useEffect(() => {
    if (!servicesQuery.data?.length || !targetSlug) return;
    if (getValues('service_id')) return;
    const matched = servicesQuery.data.find((s) => s.slug === targetSlug);
    if (matched) {
      setValue('service_id', matched.id, { shouldValidate: true });
    }
  }, [servicesQuery.data, targetSlug, setValue, getValues]);

  // Pre-fill data profil untuk pelanggan login tanpa menimpa input yang sudah diketik
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !getValues('customer_name')) {
        setValue('customer_name', profile.full_name);
      }
      if (profile.email && !getValues('customer_email')) {
        setValue('customer_email', profile.email);
      }
      if (profile.phone && !getValues('customer_phone')) {
        setValue('customer_phone', profile.phone);
      }
    } else if (user?.email && !getValues('customer_email')) {
      setValue('customer_email', user.email);
    }
  }, [profile, user, setValue, getValues]);

  const onSubmit = async (values: BookingFormValues) => {
    try {
      const { bookingCode } = await createBookingMutation.mutateAsync({
        service_id: values.service_id,
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        project_location: values.project_location,
        preferred_date: values.preferred_date || null,
        preferred_time: (values.preferred_time || null) as PreferredTime | null,
        customer_message: values.customer_message || null,
        user_id: user?.id ?? null,
      });

      const chosenService = servicesQuery.data?.find((s) => s.id === values.service_id);
      const confirmationState: BookingConfirmationState = {
        bookingCode,
        customerName: values.customer_name,
        serviceName: chosenService?.name ?? 'Layanan GREEN ENERGY',
        preferredDate: values.preferred_date || null,
        preferredTime: (values.preferred_time || null) as PreferredTime | null,
      };

      try {
        sessionStorage.setItem(LAST_BOOKING_STORAGE_KEY, JSON.stringify(confirmationState));
      } catch {
        // Abaikan jika sessionStorage tidak tersedia
      }

      toast.success(
        'Permintaan Pemesanan Terkirim',
        `Kode pemesanan Anda: ${bookingCode}. Tim admin akan segera menghubungi Anda.`,
      );
      navigate('/pesanan/berhasil', { state: confirmationState, replace: true });
    } catch (err) {
      toast.error('Gagal Mengirim Pemesanan', getFriendlyErrorMessage(err));
    }
  };

  const selectedService = servicesQuery.data?.find((s) => s.id === selectedServiceId);
  const isBusy = isSubmitting || createBookingMutation.isPending;

  return (
    <div className="py-10 sm:py-14">
      <PageMeta
        title="Pesan Layanan"
        description="Ajukan permintaan konsultasi, survei potensi panel surya, atau penawaran layanan GREEN ENERGY."
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
            Formulir Permintaan Layanan
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
            Pesan Layanan Energi Hijau
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Lengkapi informasi di bawah ini untuk mengajukan konsultasi, survei, atau penawaran.
            Anda akan mendapatkan kode pemesanan unik setelah permintaan tersimpan.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {servicesQuery.isError ? (
              <ErrorState
                title="Daftar Layanan Tidak Dapat Dimuat"
                message={getFriendlyErrorMessage(servicesQuery.error)}
                onRetry={() => void servicesQuery.refetch()}
              />
            ) : (
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <Select
                      label="Layanan yang Dipilih"
                      required
                      error={errors.service_id?.message}
                      disabled={servicesQuery.isLoading || isBusy}
                      {...register('service_id')}
                    >
                      <option value="">
                        {servicesQuery.isLoading
                          ? 'Memuat daftar layanan aktif...'
                          : '-- Pilih Layanan GREEN ENERGY --'}
                      </option>
                      {(servicesQuery.data ?? []).map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                          {service.service_categories?.name
                            ? ` (${service.service_categories.name})`
                            : ''}
                        </option>
                      ))}
                    </Select>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Input
                        label="Nama Lengkap"
                        required
                        placeholder="Masukkan nama lengkap Anda"
                        autoComplete="name"
                        error={errors.customer_name?.message}
                        disabled={isBusy}
                        {...register('customer_name')}
                      />

                      <Input
                        label="Email"
                        type="email"
                        required
                        placeholder="nama@email.com"
                        autoComplete="email"
                        error={errors.customer_email?.message}
                        disabled={isBusy}
                        {...register('customer_email')}
                      />
                    </div>

                    <Input
                      label="Nomor WhatsApp / Telepon"
                      type="tel"
                      required
                      placeholder="Contoh: 0812-3456-7890 atau +62 812 3456 7890"
                      hint="Digunakan tim admin untuk menghubungi dan mengonfirmasi jadwal."
                      autoComplete="tel"
                      error={errors.customer_phone?.message}
                      disabled={isBusy}
                      {...register('customer_phone')}
                    />

                    <Textarea
                      label="Alamat atau Lokasi Proyek"
                      required
                      rows={3}
                      placeholder="Tuliskan alamat lengkap, kota/kabupaten, dan jenis bangunan (rumah/kantor/usaha)"
                      error={errors.project_location?.message}
                      disabled={isBusy}
                      {...register('project_location')}
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Input
                        label="Tanggal Pilihan (Opsional)"
                        type="date"
                        min={todayISO}
                        hint="Preferensi awal; jadwal final disepakati bersama admin."
                        error={errors.preferred_date?.message}
                        disabled={isBusy}
                        {...register('preferred_date')}
                      />

                      <Select
                        label="Waktu Pilihan (Opsional)"
                        hint="Rentang waktu yang nyaman untuk dihubungi atau survei."
                        error={errors.preferred_time?.message}
                        disabled={isBusy}
                        {...register('preferred_time')}
                      >
                        <option value="">-- Pilih Rentang Waktu --</option>
                        {PREFERRED_TIME_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <Textarea
                      label="Pesan atau Kebutuhan Tambahan (Opsional)"
                      rows={4}
                      placeholder="Ceritakan daya listrik terpasang, tujuan penghematan, atau pertanyaan khusus lainnya..."
                      error={errors.customer_message?.message}
                      disabled={isBusy}
                      {...register('customer_message')}
                    />

                    {/* Persetujuan Privasi */}
                    <div className="rounded-xl border border-forest-900/10 bg-surface p-4 space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-forest-900/30 text-forest-900 focus:ring-leaf-600"
                          disabled={isBusy}
                          {...register('privacy_consent')}
                        />
                        <span className="text-xs sm:text-sm leading-relaxed text-ink">
                          Saya menyetujui penggunaan data kontak dan lokasi proyek ini oleh tim{' '}
                          <strong>GREEN ENERGY</strong> semata-mata untuk meninjau permintaan dan
                          menghubungi saya terkait tindak lanjut layanan.{' '}
                          <span className="text-rose-600">*</span>
                        </span>
                      </label>
                      {errors.privacy_consent?.message && (
                        <p role="alert" className="text-xs font-medium text-rose-600 pl-7">
                          {errors.privacy_consent.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-xs text-muted">
                        Status awal permintaan: <strong>Menunggu Tinjauan (Pending)</strong>.
                      </p>
                      <Button type="submit" variant="primary" size="lg" isLoading={isBusy}>
                        <Send className="h-4 w-4" />
                        Kirim Permintaan Pemesanan
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Sidebar */}
          <aside className="space-y-5 lg:col-span-4">
            {selectedService && (
              <Card className="border-leaf-600/30 bg-leaf-50/50">
                <CardContent className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">
                    Layanan Terpilih
                  </p>
                  <h2 className="font-display text-lg font-bold text-forest-950">
                    {selectedService.name}
                  </h2>
                  <p className="text-sm text-muted leading-relaxed">
                    {selectedService.short_description}
                  </p>
                  <p className="text-xs text-forest-900 pt-1 border-t border-forest-900/10">
                    {selectedService.price_note}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" />
                  <div>
                    <h3 className="text-sm font-bold text-ink">Bukan Konfirmasi Jadwal Otomatis</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Tanggal dan waktu yang Anda pilih berfungsi sebagai preferensi awal. Jadwal
                      resmi dan estimasi biaya ditetapkan setelah admin menghubungi Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-forest-900/8 pt-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" />
                  <div>
                    <h3 className="text-sm font-bold text-ink">Privasi Data Terlindungi</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Data pemesanan Anda tersimpan aman dengan kebijakan Row Level Security dan
                      tidak dapat dilihat oleh pengunjung publik lainnya.
                    </p>
                  </div>
                </div>

                {!user && (
                  <div className="flex items-start gap-3 border-t border-forest-900/8 pt-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-forest-800" />
                    <div>
                      <h3 className="text-sm font-bold text-ink">Ingin Memantau Riwayat?</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        Anda tetap bisa memesan sebagai tamu, atau{' '}
                        <Link to="/login?redirect=/pesan" className="font-semibold text-leaf-600 underline">
                          masuk ke akun pelanggan
                        </Link>{' '}
                        agar riwayat pemesanan tercatat di halaman Akun Saya.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
