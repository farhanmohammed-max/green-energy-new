import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema, type RegisterFormValues } from '@/schemas';
import { getFriendlyErrorMessage } from '@/lib/utils';

export function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signUp } = useAuth();
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await signUp({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
      });

      if (result.needsEmailConfirmation) {
        setNeedsConfirmation(true);
        toast.info(
          'Periksa Email Anda',
          'Silakan konfirmasi alamat email Anda melalui tautan yang dikirimkan oleh Supabase Auth.',
        );
      } else {
        toast.success('Pendaftaran Berhasil', 'Akun pelanggan Anda siap digunakan.');
        navigate('/akun', { replace: true });
      }
    } catch (err) {
      toast.error('Pendaftaran Gagal', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <PageMeta
        title="Daftar Akun Pelanggan"
        description="Buat akun pelanggan GREEN ENERGY untuk memantau riwayat pemesanan layanan Anda."
      />
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {needsConfirmation ? (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h1 className="font-display text-xl font-bold text-ink">
                  Konfirmasi Email Anda
                </h1>
                <p className="text-sm leading-relaxed text-muted">
                  Akun pelanggan berhasil didaftarkan. Silakan buka kotak masuk email Anda untuk
                  mengaktifkan akun, lalu masuk melalui halaman Login.
                </p>
                <Link to="/login" className="block">
                  <Button variant="primary" className="w-full">
                    Ke Halaman Masuk
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100 text-forest-900">
                    <UserPlus className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h1 className="font-display text-2xl font-extrabold text-forest-950">
                    Daftar Akun Pelanggan
                  </h1>
                  <p className="mt-1.5 text-sm text-muted">
                    Akun baru otomatis terdaftar sebagai pelanggan untuk melacak pemesanan Anda.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    required
                    autoComplete="name"
                    placeholder="Masukkan nama lengkap Anda"
                    error={errors.full_name?.message}
                    disabled={isSubmitting}
                    {...register('full_name')}
                  />

                  <Input
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    {...register('email')}
                  />

                  <Input
                    label="Kata Sandi"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    {...register('password')}
                  />

                  <Input
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Ulangi kata sandi"
                    error={errors.confirm_password?.message}
                    disabled={isSubmitting}
                    {...register('confirm_password')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    Buat Akun Pelanggan
                  </Button>
                </form>

                <p className="border-t border-forest-900/10 pt-5 text-center text-sm text-muted">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="font-semibold text-leaf-600 hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
