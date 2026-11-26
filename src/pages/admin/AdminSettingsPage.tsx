import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Database, Save, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useUpdateOwnProfile } from '@/features/customers/api';
import { profileUpdateSchema, type ProfileUpdateValues } from '@/schemas';
import { isSupabaseConfigured, STORAGE_BUCKET } from '@/lib/supabase';
import { getFriendlyErrorMessage } from '@/lib/utils';

export function AdminSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const updateProfileMutation = useUpdateOwnProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileUpdateValues) => {
    if (!user?.id) return;
    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        payload: {
          full_name: values.full_name,
          phone: values.phone || null,
        },
      });
      await refreshProfile();
      toast.success('Profil Admin Diperbarui', 'Nama dan nomor telepon berhasil disimpan.');
    } catch (err) {
      toast.error('Gagal Menyimpan Profil', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Pengaturan & Profil Admin" />

      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Pengaturan & Profil Admin</h1>
        <p className="text-sm text-muted">
          Kelola informasi profil administrator Anda dan tinjau status integrasi sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Admin Profile Form */}
        <Card className="lg:col-span-7">
          <CardContent className="p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Profil Administrator</h2>
              <p className="mt-1 text-xs text-muted">
                Sesuai kebijakan keamanan database, formulir ini hanya memperbarui nama lengkap dan
                nomor telepon.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Email"
                value={profile?.email ?? user?.email ?? ''}
                disabled
              />
              <Input
                label="Nama Lengkap"
                required
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Nomor Telepon / WhatsApp"
                type="tel"
                placeholder="0812-3456-7890"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <div className="flex items-center justify-between rounded-xl bg-surface p-3.5 text-xs">
                <span className="text-muted">Peran Akun</span>
                <Badge variant="accent">Administrator ({profile?.role ?? 'admin'})</Badge>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting || updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4" />
                Simpan Perubahan Profil
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-5">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-ink">Status Sistem & Keamanan</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <Database className="h-4 w-4 text-leaf-600" />
                  Koneksi Supabase
                </span>
                {isSupabaseConfigured ? (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Terkonfigurasi
                  </Badge>
                ) : (
                  <Badge variant="warning">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Belum Disetel
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5">
                <span className="font-medium text-ink">Storage Bucket</span>
                <code className="rounded bg-white px-2 py-0.5 font-mono text-xs text-forest-900">
                  {STORAGE_BUCKET}
                </code>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-surface p-3.5">
                <span className="font-medium text-ink">Zona Waktu Tampilan</span>
                <span className="text-xs font-semibold text-forest-900">Asia/Jakarta (WIB)</span>
              </div>
            </div>

            <div className="rounded-xl border border-forest-900/10 bg-leaf-50/70 p-4 text-xs leading-relaxed text-forest-900 space-y-1.5">
              <p className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="h-4 w-4 text-leaf-600" />
                Ringkasan Perlindungan Keamanan
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted">
                <li>Hanya menggunakan publishable key di frontend (tanpa service_role key).</li>
                <li>Pembatasan akses data ditegakkan oleh PostgreSQL RLS & column-level GRANT.</li>
                <li>Penambahan admin baru dilakukan melalui Supabase Auth + SQL Editor.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
