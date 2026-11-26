import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !supabaseUrl.includes('YOUR_PROJECT_ID') &&
    !supabasePublishableKey.includes('YOUR_SUPABASE_PUBLISHABLE_KEY'),
);

export const STORAGE_BUCKET = 'green-energy-assets';

// Gunakan fallback dummy hanya agar inisialisasi modul tidak melempar exception saat env belum disetel.
// Setiap operasi data memanggil assertSupabaseConfigured() sebelum menjalankan query.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabasePublishableKey : 'placeholder-publishable-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Koneksi Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY pada file .env.local lalu muat ulang aplikasi.',
    );
  }
}
