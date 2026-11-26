import { z } from 'zod';
import { getTodayJakartaISO } from '@/lib/utils';

const phoneRegex = /^[0-9+\-\s]+$/;

export const bookingFormSchema = z.object({
  service_id: z.string().uuid('Silakan pilih layanan yang valid.'),
  customer_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter.')
    .max(100, 'Nama lengkap maksimal 100 karakter.'),
  customer_email: z
    .string()
    .trim()
    .min(4, 'Email wajib diisi.')
    .email('Masukkan alamat email yang valid.'),
  customer_phone: z
    .string()
    .trim()
    .min(8, 'Nomor WhatsApp minimal 8 karakter.')
    .max(20, 'Nomor WhatsApp maksimal 20 karakter.')
    .regex(phoneRegex, 'Nomor telepon hanya boleh berisi angka, spasi, +, atau -.'),
  project_location: z
    .string()
    .trim()
    .min(5, 'Alamat atau lokasi proyek minimal 5 karakter.')
    .max(500, 'Alamat atau lokasi proyek maksimal 500 karakter.'),
  preferred_date: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : ''))
    .refine((val) => {
      if (!val) return true;
      return val >= getTodayJakartaISO();
    }, 'Tanggal pilihan tidak boleh berada di masa lalu.'),
  preferred_time: z
    .enum(['', 'Pagi', 'Siang', 'Sore', 'Fleksibel'])
    .optional()
    .default(''),
  customer_message: z
    .string()
    .max(2000, 'Pesan tambahan maksimal 2.000 karakter.')
    .optional()
    .default(''),
  privacy_consent: z.boolean().refine((v) => v === true, {
    message: 'Anda harus menyetujui kebijakan privasi untuk melanjutkan pemesanan.',
  }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const adminCreateBookingSchema = bookingFormSchema.omit({ privacy_consent: true });
export type AdminCreateBookingValues = z.infer<typeof adminCreateBookingSchema>;

export const adminBookingUpdateSchema = z.object({
  status: z.enum([
    'pending',
    'contacted',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'rejected',
  ]),
  agreed_date: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : '')),
  estimated_cost: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : ''))
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return !Number.isNaN(num) && num >= 0;
    }, 'Estimasi biaya harus berupa angka 0 atau lebih.'),
  admin_notes: z.string().max(4000, 'Catatan internal maksimal 4.000 karakter.').optional().default(''),
});

export type AdminBookingUpdateValues = z.infer<typeof adminBookingUpdateSchema>;

export const contactFormSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(100, 'Nama maksimal 100 karakter.'),
  customer_email: z
    .string()
    .trim()
    .email('Masukkan alamat email yang valid.'),
  customer_phone: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((val) => {
      if (!val) return true;
      return val.length >= 8 && val.length <= 20 && phoneRegex.test(val);
    }, 'Nomor telepon harus 8–20 karakter dan hanya berisi angka, spasi, +, atau -.'),
  subject: z
    .string()
    .trim()
    .min(2, 'Subjek minimal 2 karakter.')
    .max(150, 'Subjek maksimal 150 karakter.'),
  message: z
    .string()
    .trim()
    .min(5, 'Isi pesan minimal 5 karakter.')
    .max(3000, 'Isi pesan maksimal 3.000 karakter.'),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, 'Nama lengkap minimal 2 karakter.')
      .max(100, 'Nama lengkap maksimal 100 karakter.'),
    email: z.string().trim().email('Masukkan alamat email yang valid.'),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
    confirm_password: z.string().min(8, 'Konfirmasi kata sandi minimal 8 karakter.'),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Konfirmasi kata sandi tidak cocok.',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter.')
    .max(100, 'Nama lengkap maksimal 100 karakter.'),
  phone: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((val) => {
      if (!val) return true;
      return val.length >= 8 && val.length <= 20 && phoneRegex.test(val);
    }, 'Nomor telepon harus 8–20 karakter dan hanya berisi angka, spasi, +, atau -.'),
});

export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, 'Nama kategori minimal 2 karakter.').max(100),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug minimal 2 karakter.')
    .max(100)
    .regex(slugRegex, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-).'),
  description: z.string().trim().max(500).optional().default(''),
  sort_order: z.coerce.number().int('Urutan harus bilangan bulat.').min(0).max(9999),
  is_active: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const serviceFormSchema = z.object({
  name: z.string().trim().min(2, 'Nama layanan minimal 2 karakter.').max(140),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug minimal 2 karakter.')
    .max(140)
    .regex(slugRegex, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-).'),
  category_id: z.string().uuid('Pilih kategori layanan yang valid.'),
  short_description: z
    .string()
    .trim()
    .min(5, 'Deskripsi singkat minimal 5 karakter.')
    .max(300, 'Deskripsi singkat maksimal 300 karakter.'),
  description: z
    .string()
    .trim()
    .min(10, 'Deskripsi lengkap minimal 10 karakter.')
    .max(4000, 'Deskripsi lengkap maksimal 4.000 karakter.'),
  benefits_text: z.string().optional().default(''),
  image_url: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    }, 'URL gambar harus menggunakan format http:// atau https:// yang valid.'),
  price_from: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : ''))
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return !Number.isNaN(num) && num >= 0;
    }, 'Harga awal harus angka 0 atau lebih.'),
  price_note: z
    .string()
    .trim()
    .min(3, 'Catatan harga wajib diisi.')
    .max(300),
  estimated_duration: z.string().trim().max(120).optional().default(''),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export const testimonialFormSchema = z.object({
  customer_name: z.string().trim().min(2, 'Nama pelanggan minimal 2 karakter.').max(100),
  city: z.string().trim().max(100).optional().default(''),
  content: z
    .string()
    .trim()
    .min(10, 'Isi testimoni minimal 10 karakter.')
    .max(1000, 'Isi testimoni maksimal 1.000 karakter.'),
  rating: z.coerce.number().int().min(1, 'Rating minimal 1.').max(5, 'Rating maksimal 5.'),
  is_published: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;
