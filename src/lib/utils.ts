import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Hubungi untuk estimasi';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTimeWIB(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)} WIB`;
}

export function formatDateShortWIB(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateOnlyID(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Belum ditentukan';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD mengikuti zona waktu Asia/Jakarta.
 */
export function getTodayJakartaISO(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year')?.value ?? '2026';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
}

/**
 * Mengembalikan string YYYY-MM mengikuti zona waktu Asia/Jakarta (WIB).
 */
export function getJakartaYearMonth(value: Date | string): string | null {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  if (!year || !month) return null;
  return `${year}-${month}`;
}

/**
 * Membersihkan kata kunci pencarian dari karakter sintaks PostgREST (.or / ilike).
 */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .replace(/[,()*%"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Memastikan target redirect adalah path internal yang aman (mencegah open redirect seperti //evil.com).
 */
export function getSafeRedirectPath(
  raw: string | null | undefined,
  fallback: string,
  requiredPrefix?: string,
): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }
  if (requiredPrefix && !trimmed.startsWith(requiredPrefix)) {
    return fallback;
  }
  return trimmed;
}

/**
 * Mengubah nomor WhatsApp Indonesia menjadi tautan https://wa.me/... yang valid.
 */
export function formatWhatsAppLink(phone: string | null | undefined, text?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;

  let normalized = digits;
  if (normalized.startsWith('0')) {
    normalized = `62${normalized.slice(1)}`;
  }

  const base = `https://wa.me/${normalized}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function isValidUUID(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

/**
 * Menghasilkan kode pemesanan unik kriptografis: GE- + 16 karakter heksadesimal uppercase.
 */
export function generateBookingCode(): string {
  const hex = crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase();
  return `GE-${hex}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.';
    }
    return msg;
  }

  if (typeof error === 'object') {
    const err = error as { code?: string; message?: string; details?: string };
    if (err.code === '23505') {
      return 'Data dengan nilai unik yang sama (misalnya slug atau kode) sudah terdaftar.';
    }
    if (err.code === '23503') {
      return 'Data ini tidak dapat dihapus karena masih digunakan oleh data lain. Silakan nonaktifkan statusnya.';
    }
    if (err.code === '42501') {
      return 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
    }
    if (err.message) {
      return err.message;
    }
  }

  return 'Terjadi kesalahan saat memproses permintaan. Silakan coba beberapa saat lagi.';
}
