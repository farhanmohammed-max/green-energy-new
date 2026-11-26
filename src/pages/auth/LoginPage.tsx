import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Shield } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema, type LoginFormValues } from '@/schemas';
import { getFriendlyErrorMessage, getSafeRedirectPath } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const toast = useToast();
  const { user, isAdmin, isLoading, signIn } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      const target = getSafeRedirectPath(redirect, isAdmin ? '/admin' : '/akun');
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
      toast.success('Berhasil Masuk', 'Selamat datang kembali di GREEN ENERGY.');
      const target = getSafeRedirectPath(
        redirect,
        profile?.role === 'admin' ? '/admin' : '/akun',
      );
      navigate(target, { replace: true });
    } catch (err) {
      toast.error('Gagal Masuk', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="py-12 sm:py-16">
      <PageMeta title="Masuk Akun" description="Masuk ke akun pelanggan atau administrator GREEN ENERGY." />
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100 text-forest-900">
                <LogIn className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-extrabold text-forest-950">Masuk ke Akun</h1>
              <p className="mt-1.5 text-sm text-muted">
                Akses riwayat pemesanan dan kelola profil Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                error={errors.password?.message}
                disabled={isSubmitting}
                {...register('password')}
              />

              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Masuk
              </Button>
            </form>

            <div className="space-y-3 border-t border-forest-900/10 pt-5 text-center text-sm text-muted">
              <p>
                Belum memiliki akun pelanggan?{' '}
                <Link to="/daftar" className="font-semibold text-leaf-600 hover:underline">
                  Daftar di sini
                </Link>
              </p>
              <p className="text-xs">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 font-medium text-forest-900 hover:underline"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Masuk sebagai Administrator
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
