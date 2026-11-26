import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Testimonial } from '@/types/database';

export const testimonialKeys = {
  all: ['testimonials'] as const,
  published: () => [...testimonialKeys.all, 'published'] as const,
  admin: () => [...testimonialKeys.all, 'admin'] as const,
};

export async function fetchPublishedTestimonials(): Promise<Testimonial[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export interface TestimonialMutationPayload {
  customer_name: string;
  city: string | null;
  content: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
}

export async function createTestimonial(payload: TestimonialMutationPayload): Promise<Testimonial> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('testimonials')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as Testimonial;
}

export async function updateTestimonial(
  id: string,
  payload: Partial<TestimonialMutationPayload>,
): Promise<Testimonial> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from('testimonials')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Testimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

export function usePublishedTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.published(),
    queryFn: fetchPublishedTestimonials,
  });
}

export function useAdminTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.admin(),
    queryFn: fetchAdminTestimonials,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: testimonialKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TestimonialMutationPayload> }) =>
      updateTestimonial(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: testimonialKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: testimonialKeys.all });
      void qc.invalidateQueries({ queryKey: ['bookings', 'dashboard'] });
    },
  });
}
