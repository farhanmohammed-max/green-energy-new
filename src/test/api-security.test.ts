import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  STORAGE_BUCKET: 'green-energy-assets',
  assertSupabaseConfigured: vi.fn(),
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

import { createBooking, fetchAdminBookingById, fetchMyBookings } from '@/features/bookings/api';
import { createContactMessage } from '@/features/contact-messages/api';
import { updateOwnProfile } from '@/features/customers/api';

describe('Database & RLS Contract Security Tests', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('createBooking sends only the 10 GRANT-allowed columns and does not call .select()', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const result = await createBooking({
      service_id: '11111111-1111-4111-8111-111111111111',
      user_id: null,
      customer_name: 'Rani Kusuma',
      customer_email: 'rani@example.com',
      customer_phone: '081234567890',
      project_location: 'Jl. Kebon Sirih No. 5, Jakarta',
      preferred_date: '2026-12-20',
      preferred_time: 'Pagi',
      customer_message: 'Ingin konsultasi panel surya rumah',
    });

    expect(result.bookingCode).toMatch(/^GE-[0-9A-F]{16}$/);
    expect(mockFrom).toHaveBeenCalledWith('bookings');
    expect(mockInsert).toHaveBeenCalledTimes(1);

    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      [
        'booking_code',
        'customer_email',
        'customer_message',
        'customer_name',
        'customer_phone',
        'preferred_date',
        'preferred_time',
        'project_location',
        'service_id',
        'user_id',
      ].sort(),
    );
    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('admin_notes');
    expect(payload).not.toHaveProperty('archived_at');
    expect(payload.booking_code).toBe(result.bookingCode);
  });

  it('createBooking retries once with a newly generated code on 23505 unique collision', async () => {
    const mockInsert = vi
      .fn()
      .mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key' } })
      .mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const result = await createBooking({
      service_id: '11111111-1111-4111-8111-111111111111',
      user_id: null,
      customer_name: 'Rani Kusuma',
      customer_email: 'rani@example.com',
      customer_phone: '081234567890',
      project_location: 'Jl. Kebon Sirih No. 5, Jakarta',
      preferred_date: null,
      preferred_time: null,
      customer_message: null,
    });

    expect(mockInsert).toHaveBeenCalledTimes(2);
    const firstCode = (mockInsert.mock.calls[0][0] as { booking_code: string }).booking_code;
    const secondCode = (mockInsert.mock.calls[1][0] as { booking_code: string }).booking_code;
    expect(secondCode).not.toBe(firstCode);
    expect(result.bookingCode).toBe(secondCode);
  });

  it('fetchMyBookings excludes admin_notes from customer query projection', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockIs = vi.fn().mockReturnValue({ order: mockOrder });
    const mockEq = vi.fn().mockReturnValue({ is: mockIs });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    await fetchMyBookings('22222222-2222-4222-8222-222222222222');

    expect(mockFrom).toHaveBeenCalledWith('bookings');
    const selectedCols = mockSelect.mock.calls[0][0] as string;
    expect(selectedCols).not.toContain('admin_notes');
    expect(selectedCols).not.toContain('*');
  });

  it('fetchAdminBookingById returns null immediately for invalid UUIDs without querying DB', async () => {
    const result = await fetchAdminBookingById('not-a-valid-uuid');
    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('createContactMessage sends only the 5 GRANT-allowed columns without calling .select()', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await createContactMessage({
      customer_name: 'Dian Pratama',
      customer_email: 'dian@example.com',
      customer_phone: '',
      subject: 'Pertanyaan Layanan',
      message: 'Apakah survei tersedia di wilayah Bekasi?',
    });

    expect(mockFrom).toHaveBeenCalledWith('contact_messages');
    const payload = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(
      ['customer_email', 'customer_name', 'customer_phone', 'message', 'subject'].sort(),
    );
    expect(payload.customer_phone).toBeNull();
    expect(payload).not.toHaveProperty('status');
  });

  it('updateOwnProfile sends only full_name and phone and never updates role', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: '33333333-3333-4333-8333-333333333333',
        full_name: 'Budi Baru',
        email: 'budi@example.com',
        phone: '081234567890',
        role: 'customer',
        created_at: '',
        updated_at: '',
      },
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await updateOwnProfile('33333333-3333-4333-8333-333333333333', {
      full_name: 'Budi Baru',
      phone: '081234567890',
    });

    expect(mockFrom).toHaveBeenCalledWith('profiles');
    const payload = mockUpdate.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(payload).sort()).toEqual(['full_name', 'phone']);
    expect(payload).not.toHaveProperty('role');
  });
});
