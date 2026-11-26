import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ShieldCheck } from 'lucide-react';
import { PageMeta } from '@/components/shared/PageMeta';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { useUpdateOwnProfile } from '@/features/customers/api';
import { profileUpdateSchema, type ProfileUpdateValues } from '@/schemas';
import { getFriendlyErrorMessage } from '@/lib/utils';

export function CustomerProfilePage() {
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
      toast.success('Profil Diperbarui', 'Perubahan nama dan nomor telepon berhasil disimpan.');
    } catch (err) {
      toast.error('Gagal Menyimpan Profil', getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta title="Profil Saya" />

      <Card>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Informasi Profil Pelanggan</h2>
            <p className="mt-1 text-sm text-muted">
              Anda dapat memperbarui nama lengkap dan nomor WhatsApp/telepon Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 max-w-xl">
            <Input
              label="Email Akun"
              value={profile?.email ?? user?.email ?? ''}
              disabled
              hint="Email dikelola melalui autentikasi akun."
            />

            <Input
              label="Nama Lengkap"
              required
              placeholder="Masukkan nama lengkap"
              error={errors.full_name?.message}
              disabled={isSubmitting}
              {...register('full_name')}
            />

            <Input
              label="Nomor Telepon / WhatsApp"
              type="tel"
              placeholder="0812-3456-7890"
              error={errors.phone?.message}
              disabled={isSubmitting}
              {...register('phone')}
            />

            <div className="flex items-start gap-2.5 rounded-xl bg-surface p-3.5 text-xs text-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
              <p>
                Peran akun saat ini: <strong className="uppercase">{profile?.role ?? 'customer'}</strong>.
                Demi keamanan, peran akun tidak dapat diubah melalui formulir profil.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || updateProfileMutation.isPending}
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
