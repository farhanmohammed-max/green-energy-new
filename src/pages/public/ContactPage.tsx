import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Info, Mail, MapPin, Phone, Send } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCreateContactMessage } from '@/features/contact-messages/api';
import { contactFormSchema, type ContactFormValues } from '@/schemas';
import { COMPANY_INFO } from '@/lib/constants';
import { getFriendlyErrorMessage } from '@/lib/utils';

export function ContactPage() {
  const toast = useToast();
  const createMessageMutation = useCreateContactMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await createMessageMutation.mutateAsync({
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone || null,
        subject: values.subject,
        message: values.message,
      });
      toast.success(
        'Pesan Berhasil Dikirim',
        'Terima kasih telah menghubungi GREEN ENERGY. Tim admin akan meninjau pesan Anda.',
      );
      reset();
    } catch (err) {
      toast.error('Gagal Mengirim Pesan', getFriendlyErrorMessage(err));
    }
  };

  const isBusy = isSubmitting || createMessageMutation.isPending;

  return (
    <div className="py-12 sm:py-16">
      <PageMeta
        title="Kontak Kami"
        description="Hubungi tim GREEN ENERGY untuk pertanyaan seputar layanan energi hijau, konsultasi, atau kerja sama."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-leaf-600">Hubungi Kami</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
            Ada Pertanyaan Seputar Energi Hijau?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Kirimkan pesan melalui formulir di bawah ini. Pesan Anda tersimpan langsung ke sistem
            admin GREEN ENERGY untuk ditindaklanjuti.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Contact Info */}
          <div className="space-y-4 lg:col-span-5">
            <Card>
              <CardContent className="space-y-5">
                <h2 className="font-display text-lg font-bold text-ink">Informasi Kontak</h2>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Alamat Kantor</p>
                      <p className="mt-0.5 text-muted">{COMPANY_INFO.address}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Telepon / WhatsApp</p>
                      <p className="mt-0.5 text-muted">{COMPANY_INFO.phone}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Email</p>
                      <p className="mt-0.5 text-muted">{COMPANY_INFO.email}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-100 text-forest-900">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Jam Operasional</p>
                      <p className="mt-0.5 text-muted">{COMPANY_INFO.operationalHours}</p>
                    </div>
                  </li>
                </ul>

                <div className="flex items-start gap-2.5 rounded-xl bg-surface p-3.5 text-xs text-muted">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
                  <p>{COMPANY_INFO.disclaimerNote}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold text-ink">Kirim Pesan</h2>
                <p className="mt-1 text-xs sm:text-sm text-muted">
                  Kolom bertanda bintang (*) wajib diisi.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="Nama Lengkap"
                      required
                      placeholder="Masukkan nama Anda"
                      error={errors.customer_name?.message}
                      disabled={isBusy}
                      {...register('customer_name')}
                    />
                    <Input
                      label="Email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      error={errors.customer_email?.message}
                      disabled={isBusy}
                      {...register('customer_email')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input
                      label="Nomor Telepon (Opsional)"
                      type="tel"
                      placeholder="0812-3456-7890"
                      error={errors.customer_phone?.message}
                      disabled={isBusy}
                      {...register('customer_phone')}
                    />
                    <Input
                      label="Subjek"
                      required
                      placeholder="Contoh: Pertanyaan Survei Panel Surya"
                      error={errors.subject?.message}
                      disabled={isBusy}
                      {...register('subject')}
                    />
                  </div>

                  <Textarea
                    label="Isi Pesan"
                    required
                    rows={5}
                    placeholder="Tuliskan pertanyaan atau informasi yang ingin Anda sampaikan..."
                    error={errors.message?.message}
                    disabled={isBusy}
                    {...register('message')}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="lg" isLoading={isBusy}>
                      <Send className="h-4 w-4" />
                      Kirim Pesan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
