# PLAN.md — Rencana Arsitektur & Implementasi GREEN ENERGY

**Aplikasi:** GREEN ENERGY — Hemat Energi untuk Masa Depan  
**Versi:** 1.0 (MVP Produksi)  
**Stack:** React + TypeScript + Vite + Tailwind CSS + React Router DOM + TanStack Query + React Hook Form + Zod + Lucide React + Supabase + Vercel

---

## 1. Ringkasan Analisis Kebutuhan

Berdasarkan `PRD_GREEN_ENERGY.md` dan `SUPABASE_SCHEMA.sql`:
- **Public Website**: Memperkenalkan GREEN ENERGY, katalog layanan aktif dari Supabase (dengan pencarian dan filter kategori), detail layanan, formulir pemesanan tervalidasi (tamu & pelanggan login) dengan kode unik `GE-XXXXXXXXXXXXXXXX` (`crypto.randomUUID()`), halaman konfirmasi tanpa `SELECT` publik, halaman Tentang Kami, FAQ interaktif, dan formulir kontak ke `contact_messages`.
- **Autentikasi & Akun Pelanggan**: Supabase Auth untuk login/daftar pelanggan (role otomatis `customer` melalui trigger database, tanpa registrasi admin publik), manajemen profil terbatas pada `full_name` & `phone`, serta riwayat pemesanan milik sendiri (tanpa `admin_notes`).
- **Admin Dashboard**: Proteksi sesi + verifikasi role `admin` di aplikasi dan RLS database. Mencakup ringkasan statistik nyata dari database + grafik tren pemesanan, CRUD lengkap untuk Pemesanan (termasuk transisi status tervalidasi, estimasi biaya, tanggal disepakati, catatan internal, arsip, buat pemesanan operasional), Kategori Layanan, Data Layanan (termasuk upload gambar ke Supabase Storage `green-energy-assets`), Pelanggan, Testimoni, Pesan Masuk, dan Pengaturan/Profil Admin.

## 2. Keputusan Arsitektur & Keamanan

1. **Single Supabase Client (`src/lib/supabase.ts`)**
   - Menggunakan hanya `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY`.
   - Tidak ada `service_role` key, secret, atau kredensial hardcoded di frontend.
   - Mendeteksi secara aman bila environment variable belum dikonfigurasi dan menampilkan panduan konfigurasi yang ramah tanpa membuat aplikasi crash.
2. **Kepatuhan Penuh Terhadap GRANT & RLS `SUPABASE_SCHEMA.sql`**
   - **INSERT `bookings`**: Hanya mengirim 10 kolom yang diberi izin GRANT (`booking_code`, `user_id`, `service_id`, `customer_name`, `customer_email`, `customer_phone`, `project_location`, `preferred_date`, `preferred_time`, `customer_message`). Tidak mengirim `status`, `archived_at`, dll. (menggunakan default DB). Tidak menggunakan `.select()` setelah `.insert()` agar pengunjung `anon` tidak terkena error RLS. Jika terjadi konflik unique `23505` pada `booking_code`, regenerasi kode baru dan ulangi INSERT 1 kali.
   - **INSERT `contact_messages`**: Hanya mengirim `customer_name`, `customer_email`, `customer_phone`, `subject`, `message` tanpa `.select()`.
   - **UPDATE `profiles`**: Hanya mengirim `full_name` dan `phone` sesuai column-level GRANT. Role tidak pernah dapat diubah lewat UI.
   - **SELECT `bookings` untuk Customer**: Secara eksplisit hanya mengambil kolom yang boleh dilihat pelanggan dan mengecualikan `admin_notes`.
   - **Transisi Status Pemesanan**: Dibatasi di UI sesuai matriks transisi PRD dan diperkuat oleh trigger `validate_booking_status_transition` di PostgreSQL.
   - **Delete vs Deactivate/Archive**: Kategori/layanan yang direferensikan foreign key (`on delete restrict`) ditangani dengan pesan ramah dan anjuran menonaktifkan; pemesanan mendukung arsip (`archived_at`) serta hapus terbatas untuk data uji/duplikat dengan dialog konfirmasi.
3. **Zona Waktu & Mata Uang**
   - Semua timestamp UTC diformat dalam zona waktu `Asia/Jakarta` (WIB) menggunakan `Intl.DateTimeFormat('id-ID', ...)`.
   - Format mata uang menggunakan Rupiah (`IDR`).
   - Validasi tanggal pilihan menggunakan tanggal lokal `Asia/Jakarta` agar konsisten dengan pengguna Indonesia.
4. **Identitas Visual & Aksesibilitas**
   - Palet warna: Dark Forest Green (`#0F3D2E`), Leaf Green (`#2D8A56` / `#3CA66B`), Off-White (`#F6F8F5`), Putih (`#FFFFFF`), Aksen Solar Yellow (`#E8B931`).
   - Tipografi modern bersih (`Plus Jakarta Sans` + `Inter`) dengan kontras tinggi (WCAG AA), focus ring yang jelas, label terhubung ke input, skip-to-content, dan desain mobile-first mulai 360px.
   - Tidak mengarang klaim sertifikasi, penghargaan, jumlah pelanggan, atau angka penghematan tanpa sumber; konten profil dan demo ditandai secara transparan dan mudah diubah.

## 3. Struktur Folder

```text
src/
├── assets/                   # Aset gambar & ilustrasi lokal
├── components/
│   ├── ui/                   # Komponen UI reusable & accessible (Button, Input, Card, Badge, Modal, Dialog, Toast, Skeleton, Pagination, Accordion)
│   ├── layout/               # PublicNavbar, PublicFooter, AdminSidebar, AdminHeader
│   ├── shared/               # BrandLogo, StatusBadge, EmptyState, ErrorState, ConfirmDialog, SupabaseConfigNotice, PageMeta
│   └── forms/                # Komponen helper formulir
├── features/
│   ├── auth/                 # AuthContext, useAuth, ProtectedRoute, AdminRoute
│   ├── bookings/             # API, query hooks, status transition helpers, booking code generator
│   ├── categories/           # API, query hooks CRUD kategori
│   ├── services/             # API, query hooks CRUD layanan + upload storage
│   ├── customers/            # API, query hooks daftar pelanggan & update profil
│   ├── testimonials/         # API, query hooks CRUD testimoni
│   └── contact-messages/     # API, query hooks pesan masuk
├── layouts/
│   ├── PublicLayout.tsx
│   ├── CustomerLayout.tsx
│   └── AdminLayout.tsx
├── lib/
│   ├── supabase.ts           # Single Supabase client + helper cek konfigurasi
│   ├── utils.ts              # cn, formatIDR, formatDateWIB, slugify, dll.
│   └── constants.ts          # Status pemesanan, transisi valid, FAQ default, info kontak placeholder
├── pages/
│   ├── public/               # HomePage, AboutPage, ServicesPage, ServiceDetailPage, BookingPage, BookingSuccessPage, ContactPage, FaqPage, NotFoundPage
│   ├── auth/                 # LoginPage, RegisterPage, AdminLoginPage
│   ├── customer/             # CustomerDashboardPage, CustomerProfilePage, CustomerBookingsPage
│   └── admin/                # AdminDashboardPage, AdminBookingsPage, AdminBookingDetailPage, AdminCategoriesPage, AdminServicesPage, AdminCustomersPage, AdminTestimonialsPage, AdminMessagesPage, AdminSettingsPage
├── routes/
│   └── AppRouter.tsx
├── schemas/                  # Zod schemas untuk semua form
├── types/                    # Database types & domain interfaces
├── App.tsx
└── main.tsx
```

## 4. Peta Routing

- **Public**: `/`, `/tentang`, `/layanan`, `/layanan/:slug`, `/pesan`, `/pesan/:slug`, `/pesanan/berhasil`, `/kontak`, `/faq`
- **Auth**: `/login`, `/daftar`, `/admin/login`
- **Customer**: `/akun`, `/akun/profil`, `/akun/pemesanan`
- **Admin**: `/admin`, `/admin/pemesanan`, `/admin/pemesanan/:id`, `/admin/kategori`, `/admin/layanan`, `/admin/pelanggan`, `/admin/testimoni`, `/admin/pesan`, `/admin/pengaturan`, `/admin/profil`

## 5. Tahapan Implementasi

1. **Tahap 1 — Analisis & Perencanaan**: Baca PRD & SQL schema, susun `PLAN.md`.
2. **Tahap 2 — Setup Project**: Inisialisasi Vite + React + TypeScript, pasang Tailwind CSS v4/v3, React Router, TanStack Query, React Hook Form, Zod, Lucide React, Supabase JS, Vitest + Testing Library, ESLint.
3. **Tahap 3 — Design System & Layout**: Tema warna GREEN ENERGY, komponen UI accessible, Toast provider, PublicLayout, CustomerLayout, AdminLayout, aset visual energi surya.
4. **Tahap 4 — Integrasi Database & Validasi**: `src/lib/supabase.ts`, TypeScript database types, Zod schemas, TanStack Query hooks & API modules untuk semua 6 tabel + Storage.
5. **Tahap 5 — Website Publik**: Beranda lengkap, Tentang Kami, Katalog & Detail Layanan, Form Pemesanan + Konfirmasi, Kontak, FAQ.
6. **Tahap 6 — Autentikasi & Portal Pelanggan**: Login, Registrasi Pelanggan, Admin Login, Route Guards, Akun/Profil/Riwayat Pemesanan.
7. **Tahap 7 — Admin Dashboard**: Dashboard statistik & grafik tren nyata, Manajemen Pemesanan (+ detail, buat, ubah status, arsip, hapus), Kategori, Layanan (+ upload gambar), Pelanggan, Testimoni, Pesan Masuk, Pengaturan & Profil Admin.
8. **Tahap 8 — Pengujian, Build & Deployment**: Unit/schema/logic tests, ESLint, TypeScript check, `npm run build`, `vercel.json`, `.env.example`, `README.md`.
