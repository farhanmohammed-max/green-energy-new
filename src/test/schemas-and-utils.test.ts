import { describe, expect, it } from 'vitest';
import {
  bookingFormSchema,
  categoryFormSchema,
  contactFormSchema,
  profileUpdateSchema,
  serviceFormSchema,
  testimonialFormSchema,
} from '@/schemas';
import { canTransitionBookingStatus } from '@/lib/constants';
import {
  formatIDR,
  formatWhatsAppLink,
  generateBookingCode,
  getJakartaYearMonth,
  getSafeRedirectPath,
  getTodayJakartaISO,
  sanitizeSearchTerm,
  slugify,
} from '@/lib/utils';

describe('Booking Code & Utility Functions', () => {
  it('generates booking code matching GE-XXXXXXXXXXXXXXXX (16 uppercase hex)', () => {
    const code = generateBookingCode();
    expect(code).toMatch(/^GE-[0-9A-F]{16}$/);
  });

  it('generates unique booking codes across repeated invocations', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateBookingCode()));
    expect(codes.size).toBe(20);
  });

  it('slugifies Indonesian service and category names cleanly', () => {
    expect(slugify('Survei Potensi Panel Surya!')).toBe('survei-potensi-panel-surya');
    expect(slugify('  Audit   Efisiensi Energi  ')).toBe('audit-efisiensi-energi');
  });

  it('formats IDR currency properly', () => {
    expect(formatIDR(1500000)).toContain('1.500.000');
    expect(formatIDR(null)).toBe('Hubungi untuk estimasi');
  });

  it('sanitizes PostgREST .or() search input cleanly', () => {
    expect(sanitizeSearchTerm('panel,surya(test)%*')).toBe('panel surya test');
    expect(sanitizeSearchTerm('andi@example.com')).toBe('andi@example.com');
    expect(sanitizeSearchTerm('  ,,,()  ')).toBe('');
  });

  it('blocks open redirect URLs and enforces optional prefix', () => {
    expect(getSafeRedirectPath('/akun/pemesanan', '/akun')).toBe('/akun/pemesanan');
    expect(getSafeRedirectPath('//evil.com/phish', '/akun')).toBe('/akun');
    expect(getSafeRedirectPath('https://evil.com', '/akun')).toBe('/akun');
    expect(getSafeRedirectPath('/admin/pemesanan', '/admin', '/admin')).toBe('/admin/pemesanan');
    expect(getSafeRedirectPath('/akun', '/admin', '/admin')).toBe('/admin');
  });

  it('buckets UTC timestamps into the correct Asia/Jakarta year-month', () => {
    // 2026-10-31 19:00 UTC == 2026-11-01 02:00 WIB
    expect(getJakartaYearMonth('2026-10-31T19:00:00.000Z')).toBe('2026-11');
    expect(getJakartaYearMonth('2026-10-31T16:59:59.000Z')).toBe('2026-10');
    expect(getJakartaYearMonth('not-a-date')).toBeNull();
  });

  it('formats Indonesian phone numbers into wa.me links', () => {
    expect(formatWhatsAppLink('0812-3456-7890')).toBe('https://wa.me/6281234567890');
    expect(formatWhatsAppLink('+62 811 2233 4455', 'Halo')).toBe(
      'https://wa.me/6281122334455?text=Halo',
    );
    expect(formatWhatsAppLink('123')).toBeNull();
  });
});

describe('Booking Status Transition Rules (PRD Section 7)', () => {
  it('allows valid forward and cancel/reject transitions', () => {
    expect(canTransitionBookingStatus('pending', 'contacted')).toBe(true);
    expect(canTransitionBookingStatus('pending', 'cancelled')).toBe(true);
    expect(canTransitionBookingStatus('pending', 'rejected')).toBe(true);
    expect(canTransitionBookingStatus('contacted', 'confirmed')).toBe(true);
    expect(canTransitionBookingStatus('confirmed', 'in_progress')).toBe(true);
    expect(canTransitionBookingStatus('in_progress', 'completed')).toBe(true);
  });

  it('blocks disallowed jumps and transitions out of terminal statuses', () => {
    expect(canTransitionBookingStatus('pending', 'completed')).toBe(false);
    expect(canTransitionBookingStatus('pending', 'confirmed')).toBe(false);
    expect(canTransitionBookingStatus('confirmed', 'rejected')).toBe(false);
    expect(canTransitionBookingStatus('completed', 'cancelled')).toBe(false);
    expect(canTransitionBookingStatus('cancelled', 'pending')).toBe(false);
    expect(canTransitionBookingStatus('rejected', 'contacted')).toBe(false);
  });
});

describe('Zod Form Schemas', () => {
  const validUuid = '11111111-1111-4111-8111-111111111111';

  it('accepts a valid booking payload and rejects past preferred dates', () => {
    const today = getTodayJakartaISO();
    const ok = bookingFormSchema.safeParse({
      service_id: validUuid,
      customer_name: 'Siti Rahma',
      customer_email: 'siti@example.com',
      customer_phone: '+62 812-3456-7890',
      project_location: 'Jl. Merdeka No. 12, Bandung',
      preferred_date: today,
      preferred_time: 'Pagi',
      customer_message: 'Ingin survei atap rumah 2200 VA.',
      privacy_consent: true,
    });
    expect(ok.success).toBe(true);

    const pastDate = bookingFormSchema.safeParse({
      service_id: validUuid,
      customer_name: 'Siti Rahma',
      customer_email: 'siti@example.com',
      customer_phone: '081234567890',
      project_location: 'Jl. Merdeka No. 12, Bandung',
      preferred_date: '2020-01-01',
      preferred_time: 'Pagi',
      privacy_consent: true,
    });
    expect(pastDate.success).toBe(false);

    const noConsent = bookingFormSchema.safeParse({
      service_id: validUuid,
      customer_name: 'Siti Rahma',
      customer_email: 'siti@example.com',
      customer_phone: '081234567890',
      project_location: 'Jl. Merdeka No. 12, Bandung',
      privacy_consent: false,
    });
    expect(noConsent.success).toBe(false);
  });

  it('validates contact, category, service, testimonial, and profile schemas', () => {
    expect(
      contactFormSchema.safeParse({
        customer_name: 'Andi Pratama',
        customer_email: 'andi@example.com',
        customer_phone: '',
        subject: 'Pertanyaan Konsultasi',
        message: 'Halo, apakah melayani area Surabaya?',
      }).success,
    ).toBe(true);

    expect(
      categoryFormSchema.safeParse({
        name: 'Panel Surya',
        slug: 'panel-surya',
        description: 'Kategori panel surya',
        sort_order: 1,
        is_active: true,
      }).success,
    ).toBe(true);

    expect(
      serviceFormSchema.safeParse({
        name: 'Audit Efisiensi Energi',
        slug: 'audit-efisiensi-energi',
        category_id: validUuid,
        short_description: 'Evaluasi pemakaian energi rumah dan bisnis.',
        description: 'Layanan peninjauan penggunaan listrik secara menyeluruh.',
        price_from: '',
        price_note: 'Estimasi setelah konsultasi.',
        is_active: true,
        is_featured: false,
        sort_order: 1,
      }).success,
    ).toBe(true);

    expect(
      testimonialFormSchema.safeParse({
        customer_name: 'Rina',
        city: 'Jakarta',
        content: 'Pelayanan konsultasi sangat jelas dan komunikatif.',
        rating: 5,
        is_published: false,
        sort_order: 1,
      }).success,
    ).toBe(true);

    expect(
      profileUpdateSchema.safeParse({
        full_name: 'Budi Santoso',
        phone: '0812 3456 7890',
      }).success,
    ).toBe(true);
  });
});
