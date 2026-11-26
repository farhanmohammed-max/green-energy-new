-- GREEN ENERGY — Supabase PostgreSQL schema
-- Jalankan di Supabase SQL Editor pada project baru.
-- Setelah membuat akun admin di Supabase Auth, jalankan perintah bootstrap admin di bagian paling bawah.

create extension if not exists pgcrypto;

-- 1. Helper: updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Profil pengguna: role tidak boleh diedit dari form profil biasa
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3. Kategori layanan
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Layanan
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  short_description text not null default '',
  description text not null default '',
  benefits text[] not null default '{}',
  image_url text,
  price_from numeric(14,2) check (price_from is null or price_from >= 0),
  price_note text not null default 'Harga awal/estimasi, dapat berubah setelah konsultasi.',
  estimated_duration text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Pemesanan
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique default (
    'GE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))
  ),
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid not null references public.services(id) on delete restrict,
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_email text not null,
  customer_phone text not null check (char_length(customer_phone) between 8 and 20),
  project_location text not null check (char_length(project_location) between 5 and 500),
  preferred_date date,
  preferred_time text check (
    preferred_time is null or preferred_time in ('Pagi', 'Siang', 'Sore', 'Fleksibel')
  ),
  customer_message text check (customer_message is null or char_length(customer_message) <= 2000),
  status text not null default 'pending' check (
    status in ('pending', 'contacted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')
  ),
  admin_notes text,
  agreed_date date,
  estimated_cost numeric(14,2) check (estimated_cost is null or estimated_cost >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_customer_email_not_blank check (char_length(trim(customer_email)) > 3)
);

-- 6. Pesan kontak
-- Pastikan pemesanan hanya dibuat untuk layanan yang sedang aktif.
create or replace function public.ensure_active_service_for_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_is_active boolean;
begin
  select is_active into service_is_active
  from public.services
  where id = new.service_id;

  if service_is_active is distinct from true then
    raise exception 'Layanan tidak tersedia untuk dipesan.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_booking_service_active on public.bookings;
create trigger validate_booking_service_active
before insert or update of service_id on public.bookings
for each row execute procedure public.ensure_active_service_for_booking();

-- Tolak tanggal lampau hanya ketika booking dibuat atau tanggal pilihan diubah.
-- Dengan trigger ini, histori lama tetap dapat diperbarui setelah tanggalnya lewat.
create or replace function public.validate_booking_preferred_date()
returns trigger
language plpgsql
as $$
begin
  if new.preferred_date is not null and new.preferred_date < current_date then
    raise exception 'Tanggal pilihan tidak boleh berada di masa lalu.';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_booking_preferred_date on public.bookings;
create trigger validate_booking_preferred_date
before insert or update of preferred_date on public.bookings
for each row execute procedure public.validate_booking_preferred_date();

-- Validasi transisi status dilakukan di database, bukan hanya di UI.
create or replace function public.enforce_booking_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'pending' and new.status in ('contacted', 'cancelled', 'rejected'))
    or (old.status = 'contacted' and new.status in ('confirmed', 'cancelled', 'rejected'))
    or (old.status = 'confirmed' and new.status in ('in_progress', 'cancelled'))
    or (old.status = 'in_progress' and new.status in ('completed', 'cancelled'))
  ) then
    raise exception 'Transisi status pemesanan tidak diizinkan: % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_booking_status_transition on public.bookings;
create trigger validate_booking_status_transition
before update of status on public.bookings
for each row execute procedure public.enforce_booking_status_transition();

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 100),
  customer_email text not null,
  customer_phone text,
  subject text not null check (char_length(subject) between 2 and 150),
  message text not null check (char_length(message) between 5 and 3000),
  status text not null default 'new' check (status in ('new', 'read', 'processed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Testimoni
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  city text,
  content text not null check (char_length(content) between 10 and 1000),
  rating integer not null default 5 check (rating between 1 and 5),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Indeks untuk pencarian/filter yang sering digunakan
create index if not exists idx_services_category_id on public.services(category_id);
create index if not exists idx_services_active_featured on public.services(is_active, is_featured);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_status_created on public.bookings(status, created_at desc);
create index if not exists idx_bookings_code on public.bookings(booking_code);
create index if not exists idx_bookings_customer_email on public.bookings(customer_email);
create index if not exists idx_contact_messages_status_created on public.contact_messages(status, created_at desc);
create index if not exists idx_testimonials_published_sort on public.testimonials(is_published, sort_order);

-- 9. Trigger updated_at
 drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.service_categories;
create trigger set_categories_updated_at before update on public.service_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at before update on public.services
for each row execute procedure public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at before update on public.bookings
for each row execute procedure public.set_updated_at();

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at before update on public.contact_messages
for each row execute procedure public.set_updated_at();

drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at before update on public.testimonials
for each row execute procedure public.set_updated_at();

-- 10. Fungsi pemeriksa admin. Security definer mencegah masalah policy rekursif.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 11. Aktifkan RLS pada semua tabel
alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.testimonials enable row level security;

-- 12. Hapus policy lama agar skrip dapat dijalankan ulang pada tahap development
 drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "categories_public_read_active" on public.service_categories;
drop policy if exists "categories_admin_all" on public.service_categories;
drop policy if exists "services_public_read_active" on public.services;
drop policy if exists "services_admin_all" on public.services;
drop policy if exists "bookings_public_insert_pending" on public.bookings;
drop policy if exists "bookings_select_own_or_admin" on public.bookings;
drop policy if exists "bookings_admin_update" on public.bookings;
drop policy if exists "bookings_admin_delete" on public.bookings;
drop policy if exists "contact_public_insert_new" on public.contact_messages;
drop policy if exists "contact_admin_select" on public.contact_messages;
drop policy if exists "contact_admin_update" on public.contact_messages;
drop policy if exists "contact_admin_delete" on public.contact_messages;
drop policy if exists "testimonials_public_read_published" on public.testimonials;
drop policy if exists "testimonials_admin_all" on public.testimonials;

-- Profiles: pengguna melihat profil sendiri; admin melihat semua.
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

-- Kolom yang dapat diubah pengguna dibatasi lagi melalui GRANT di bawah.
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Categories: publik hanya membaca kategori aktif; admin CRUD.
create policy "categories_public_read_active"
on public.service_categories for select to anon, authenticated
using (is_active = true or public.is_admin());

create policy "categories_admin_all"
on public.service_categories for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Services: publik hanya membaca layanan aktif; admin CRUD.
create policy "services_public_read_active"
on public.services for select to anon, authenticated
using (is_active = true or public.is_admin());

create policy "services_admin_all"
on public.services for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Bookings: siapa pun boleh membuat permintaan pending; tidak ada akses SELECT publik.
create policy "bookings_public_insert_pending"
on public.bookings for insert to anon, authenticated
with check (
  status = 'pending'
  and archived_at is null
  and (user_id is null or user_id = auth.uid())
);

create policy "bookings_select_own_or_admin"
on public.bookings for select to authenticated
using ((user_id = auth.uid() and archived_at is null) or public.is_admin());

create policy "bookings_admin_update"
on public.bookings for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "bookings_admin_delete"
on public.bookings for delete to authenticated
using (public.is_admin());

-- Contact messages: publik hanya INSERT pesan baru; admin mengelola pesan.
create policy "contact_public_insert_new"
on public.contact_messages for insert to anon, authenticated
with check (status = 'new');

create policy "contact_admin_select"
on public.contact_messages for select to authenticated
using (public.is_admin());

create policy "contact_admin_update"
on public.contact_messages for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "contact_admin_delete"
on public.contact_messages for delete to authenticated
using (public.is_admin());

-- Testimonials: publik hanya membaca yang dipublikasikan; admin CRUD.
create policy "testimonials_public_read_published"
on public.testimonials for select to anon, authenticated
using (is_published = true or public.is_admin());

create policy "testimonials_admin_all"
on public.testimonials for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 13. Hak akses SQL dasar. RLS tetap menentukan baris mana yang boleh diakses.
revoke all on public.profiles from anon, authenticated;
revoke all on public.service_categories from anon, authenticated;
revoke all on public.services from anon, authenticated;
revoke all on public.bookings from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;
revoke all on public.testimonials from anon, authenticated;

grant select on public.service_categories, public.services, public.testimonials to anon, authenticated;
grant insert, select, update, delete on public.service_categories, public.services, public.testimonials to authenticated;

-- Pengunjung/customer hanya boleh mengisi kolom input pemesanan.
-- status, admin_notes, agreed_date, estimated_cost, archived_at, dan timestamps tidak dapat disetel oleh publik.
grant insert (booking_code, user_id, service_id, customer_name, customer_email,
              customer_phone, project_location, preferred_date, preferred_time,
              customer_message)
on public.bookings to anon, authenticated;
grant select, update, delete on public.bookings to authenticated;

-- Publik hanya dapat mengirim isi pesan; status dan timestamps memakai default database.
grant insert (customer_name, customer_email, customer_phone, subject, message)
on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- 14. Seed kategori awal (contoh yang dapat diedit admin)
insert into public.service_categories (name, slug, description, sort_order, is_active)
values
  ('Panel Surya', 'panel-surya', 'Solusi pemanfaatan energi matahari.', 1, true),
  ('Konsultasi Energi', 'konsultasi-energi', 'Konsultasi kebutuhan dan efisiensi energi.', 2, true),
  ('Audit Energi', 'audit-energi', 'Evaluasi penggunaan energi dan peluang penghematan.', 3, true),
  ('Solusi Hemat Energi', 'solusi-hemat-energi', 'Rekomendasi perangkat dan langkah hemat energi.', 4, true)
on conflict (slug) do nothing;

-- 15. Seed layanan demo. Ganti deskripsi/harga sesuai layanan nyata sebelum dipublikasikan.
insert into public.services (
  category_id, name, slug, short_description, description, benefits,
  price_from, price_note, estimated_duration, is_featured, is_active, sort_order
)
select c.id, v.name, v.slug, v.short_description, v.description, v.benefits,
       null, 'Hubungi tim GREEN ENERGY untuk estimasi berdasarkan kebutuhan dan lokasi.',
       v.estimated_duration, v.is_featured, true, v.sort_order
from (values
  ('konsultasi-energi', 'Konsultasi Energi', 'konsultasi-energi-rumah',
   'Diskusikan kebutuhan energi dan peluang penghematan di rumah atau bisnis.',
   'Sesi konsultasi awal untuk memahami kebutuhan, pola pemakaian, dan solusi energi yang mungkin diterapkan.',
   array['Mengenali kebutuhan energi','Mendapat rekomendasi awal','Menentukan langkah berikutnya']::text[],
   'Sesuai kebutuhan', true, 1),
  ('panel-surya', 'Survei Potensi Panel Surya', 'survei-potensi-panel-surya',
   'Tinjau potensi pemasangan panel surya berdasarkan kondisi lokasi.',
   'Permintaan survei untuk menilai kondisi lokasi, kebutuhan listrik, dan faktor awal pemasangan panel surya.',
   array['Penilaian awal lokasi','Identifikasi kebutuhan daya','Dasar penyusunan penawaran']::text[],
   'Menyesuaikan lokasi', true, 2),
  ('panel-surya', 'Instalasi Panel Surya', 'instalasi-panel-surya',
   'Ajukan permintaan penawaran instalasi sistem panel surya.',
   'Layanan permintaan konsultasi dan penawaran pemasangan panel surya. Spesifikasi dan estimasi akhir ditentukan setelah peninjauan kebutuhan.',
   array['Solusi energi terbarukan','Desain menyesuaikan kebutuhan','Estimasi setelah survei']::text[],
   'Menyesuaikan kapasitas', true, 3),
  ('audit-energi', 'Audit Efisiensi Energi', 'audit-efisiensi-energi',
   'Identifikasi peluang penggunaan energi yang lebih efisien.',
   'Layanan peninjauan penggunaan energi untuk membantu menemukan peluang penghematan dan rekomendasi perbaikan.',
   array['Pemetaan penggunaan energi','Identifikasi peluang efisiensi','Rekomendasi tindak lanjut']::text[],
   'Menyesuaikan lingkup', false, 4)
) as v(category_slug, name, slug, short_description, description, benefits, estimated_duration, is_featured, sort_order)
join public.service_categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

-- 16. Supabase Storage untuk gambar layanan/testimoni (bucket publik untuk membaca gambar).
-- File hanya boleh diunggah, diganti, atau dihapus oleh admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'green-energy-assets',
  'green-energy-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "green_energy_assets_public_read" on storage.objects;
drop policy if exists "green_energy_assets_admin_insert" on storage.objects;
drop policy if exists "green_energy_assets_admin_update" on storage.objects;
drop policy if exists "green_energy_assets_admin_delete" on storage.objects;

create policy "green_energy_assets_public_read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'green-energy-assets');

create policy "green_energy_assets_admin_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'green-energy-assets' and public.is_admin());

create policy "green_energy_assets_admin_update"
on storage.objects for update to authenticated
using (bucket_id = 'green-energy-assets' and public.is_admin())
with check (bucket_id = 'green-energy-assets' and public.is_admin());

create policy "green_energy_assets_admin_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'green-energy-assets' and public.is_admin());

-- 17. Bootstrap akun admin pertama:
-- A. Buat akun pengguna melalui Supabase Dashboard > Authentication > Users.
-- B. Ganti email di bawah dengan email akun tersebut, lalu jalankan query ini secara manual.
-- UPDATE public.profiles p
-- SET role = 'admin'
-- FROM auth.users u
-- WHERE p.id = u.id AND u.email = 'email-admin-anda@example.com';
--
-- Verifikasi:
-- SELECT p.id, u.email, p.role
-- FROM public.profiles p JOIN auth.users u ON u.id = p.id;
