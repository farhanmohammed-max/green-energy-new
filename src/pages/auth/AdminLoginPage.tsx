import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { SupabaseConfigNotice } from '@/components/shared/SupabaseConfigNotice';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema, type LoginFormValues } from '@/schemas';
import { getFriendlyErrorMessage, getSafeRedirectPath } from '@/lib/utils';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const toast = useToast();
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();

  useEffect(() => {
    if (user && !isLoading && isAdmin) {
      const target = getSafeRedirectPath(redirect, '/admin', '/admin');
      navigate(target, { replace: true });
    }
  }, [user, isAdmin, isLoading, redirect, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { profile } = await signIn(values.email, values.password);
      if (profile?.role !== 'admin') {
        await signOut();
        toast.error(
          'Akses Ditolak',
          'Akun ini bukan administrator. Penetapan admin hanya dilakukan melalui Supabase SQL Editor.',
        );
        return;
      }
      toast.success('Login Admin Berhasil', 'Selamat datang di Dashboard Administrator GREEN ENERGY.');
      const target = getSafeRedirectPath(redirect, '/admin', '/admin');
      navigate(target, { replace: true });
    } catch (err) {
      toast.error('Gagal Masuk Admin', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-forest-950">
      <PageMeta title="Login Administrator" description="Portal masuk khusus administrator GREEN ENERGY." />
      <SupabaseConfigNotice />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-8">
          <BrandLogo inverted />
        </div>

        <Card className="w-full max-w-md border-white/10 shadow-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-solar-400">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-extrabold text-forest-950">
                Portal Administrator
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted">
                Masuk menggunakan akun administrator yang telah terdaftar di Supabase Auth. Tidak
                tersedia pendaftaran admin publik.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Email Administrator"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@domain-anda.id"
                error={errors.email?.message}
                disabled={isSubmitting}
                {...register('email')}
              />

              <Input
                label="Kata Sandi"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register('password')}
              />

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Masuk ke Dashboard Admin
              </Button>
            </form>

            <div className="border-t border-forest-900/10 pt-4 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke Website Publik
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
