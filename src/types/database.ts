export type UserRole = 'customer' | 'admin';

export type PreferredTime = 'Pagi' | 'Siang' | 'Sore' | 'Fleksibel';

export type BookingStatus =
  | 'pending'
  | 'contacted'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type ContactMessageStatus = 'new' | 'read' | 'processed' | 'closed';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  benefits: string[];
  image_url: string | null;
  price_from: number | null;
  price_note: string;
  estimated_duration: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithCategory extends Service {
  service_categories: Pick<ServiceCategory, 'id' | 'name' | 'slug' | 'is_active'> | null;
}

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string | null;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_location: string;
  preferred_date: string | null;
  preferred_time: PreferredTime | null;
  customer_message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  agreed_date: string | null;
  estimated_cost: number | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithService extends Booking {
  services: Pick<Service, 'id' | 'name' | 'slug'> | null;
}

/**
 * Customer-visible booking projection.
 * Secara sengaja mengecualikan `admin_notes` agar catatan internal tidak pernah terekspos ke UI pelanggan.
 */
export interface CustomerBooking {
  id: string;
  booking_code: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_location: string;
  preferred_date: string | null;
  preferred_time: PreferredTime | null;
  customer_message: string | null;
  status: BookingStatus;
  agreed_date: string | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
  services: Pick<Service, 'id' | 'name' | 'slug'> | null;
}

export interface BookingInsertPayload {
  booking_code: string;
  user_id: string | null;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_location: string;
  preferred_date: string | null;
  preferred_time: PreferredTime | null;
  customer_message: string | null;
}

export interface ContactMessage {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageInsertPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subject: string;
  message: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  city: string | null;
  content: string;
  rating: number;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary extends Profile {
  booking_count: number;
}

export interface BookingConfirmationState {
  bookingCode: string;
  customerName: string;
  serviceName: string;
  preferredDate: string | null;
  preferredTime: PreferredTime | null;
}
