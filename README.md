# GREEN ENERGY — Hemat Energi untuk Masa Depan

Platform web layanan energi ramah lingkungan yang terdiri dari **Website Publik**, **Portal Pelanggan**, dan **Dashboard Administrator**, dibangun menggunakan React, TypeScript, Vite, Tailwind CSS, dan Supabase (PostgreSQL, Auth, Storage) serta siap dideploy ke Vercel.

---

## Fitur Utama

### 1. Website Publik
- **Beranda (`/`)**: Hero visual energi surya, keunggulan layanan, kategori aktif, layanan unggulan dari database Supabase, alur pemesanan 4 langkah, testimoni terpublikasi, FAQ ringkas, dan CTA.
- **Tentang Kami (`/tentang`)**: Profil GREEN ENERGY, visi, misi, tujuan, komitmen lingkungan, dan nilai utama perusahaan.
- **Katalog Layanan (`/layanan`)**: Hanya menampilkan layanan berstatus aktif dari Supabase, dilengkapi pencarian dan filter kategori.
- **Detail Layanan (`/layanan/:slug`)**: Deskripsi lengkap, daftar manfaat, estimasi durasi, harga awal opsional beserta catatan estimasi, dan tombol pesan.
- **Form Pemesanan (`/pesan` & `/pesan/:slug`)**: Validasi React Hook Form + Zod, mendukung pemesanan tamu maupun pelanggan login, membuat kode unik `GE-XXXXXXXXXXXXXXXX` (`crypto.randomUUID()`) sebelum INSERT tanpa `SELECT` publik, dan menangani konflik kode unik otomatis.
- **Konfirmasi Pemesanan (`/pesanan/berhasil`)**: Menampilkan kode pemesanan beserta tombol salin dan penjelasan tindak lanjut admin.
- **Kontak (`/kontak`)**: Formulir pesan yang tersimpan ke tabel `contact_messages`.
- **FAQ (`/faq`)**: Accordion interaktif dengan pencarian dan filter topik.

### 2. Autentikasi & Portal Pelanggan
- **Masuk (`/login`)** & **Daftar Pelanggan (`/daftar`)**: Menggunakan Supabase Auth. Akun baru otomatis ber-role `customer` melalui trigger database; **tidak ada pendaftaran admin publik**.
- **Portal Pelanggan (`/akun`, `/akun/profil`, `/akun/pemesanan`)**: Ringkasan akun, edit nama lengkap dan nomor telepon (role tidak dapat diubah), serta riwayat pemesanan milik sendiri (catatan internal admin tidak pernah diekspos).

### 3. Dashboard Administrator (`/admin`)
- **Login Admin (`/admin/login`)**: Proteksi sesi dan pengecekan role `admin` di aplikasi sekaligus RLS di database.
- **Dashboard (`/admin`)**: Statistik aktual per status, grafik tren 6 bulan terakhir dari database, ringkasan aktivitas, dan daftar pemesanan terbaru.
- **Manajemen Pemesanan (`/admin/pemesanan` & `/admin/pemesanan/:id`)**: Pencarian, filter status/tanggal/arsip, pagination, tambah pemesanan operasional, detail pelanggan, transisi status sesuai aturan PRD & trigger DB, tanggal disepakati, estimasi biaya, catatan internal privat, arsip/pulihkan, dan hapus permanen.
- **Manajemen Kategori (`/admin/kategori`)**: CRUD lengkap + aktif/nonaktifkan.
- **Manajemen Layanan (`/admin/layanan`)**: CRUD lengkap + unggah gambar ke Supabase Storage bucket `green-energy-assets` + aktif/nonaktif + unggulan.
- **Manajemen Pelanggan (`/admin/pelanggan`)**: Daftar profil pengguna, jumlah pemesanan, dan tinjauan riwayat pemesanan per pelanggan.
- **Manajemen Testimoni (`/admin/testimoni`)**: CRUD lengkap + publikasikan/sembunyikan.
- **Manajemen Pesan Masuk (`/admin/pesan`)**: Baca pesan, ubah status (`new`, `read`, `processed`, `closed`), dan hapus pesan.
- **Pengaturan & Profil Admin (`/admin/pengaturan`)**: Edit nama dan nomor telepon admin serta status integrasi sistem.

---

## Teknologi

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React
- **Routing & State**: React Router DOM 7, TanStack Query 5
- **Form & Validasi**: React Hook Form + Zod
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **Testing & Lint**: Vitest, React Testing Library, ESLint
- **Deployment**: Vercel (`vercel.json` SPA fallback)

---

## Cara Menjalankan di Lokal

### 1. Instalasi Dependency

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Salin `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Isi dengan kredensial publik dari project Supabase Anda:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

> **Peringatan Keamanan:** Jangan pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY`, password database, atau secret apa pun ke file `.env.local`, source code frontend, maupun variabel `VITE_*`. File `.env.local` sudah masuk `.gitignore`.

### 3. Menjalankan Server Development

```bash
npm run dev
```

---

## Konfigurasi Supabase (Database, RLS, Storage & Admin)

### 1. Jalankan SQL Schema

1. Buka **Supabase Dashboard → SQL Editor**.
2. Salin seluruh isi file [`SUPABASE_SCHEMA.sql`](./SUPABASE_SCHEMA.sql) dari root project.
3. Jalankan skrip tersebut. Skrip ini otomatis membuat:
   - 6 tabel utama: `profiles`, `service_categories`, `services`, `bookings`, `contact_messages`, `testimonials`
   - Indeks dan trigger `updated_at`, validasi layanan aktif, validasi tanggal pilihan, validasi transisi status, serta trigger pembuatan profil otomatis
   - Kebijakan **Row Level Security (RLS)** dan column-level `GRANT`
   - Seed kategori dan layanan contoh
   - Bucket Storage `green-energy-assets` beserta policy baca publik dan tulis khusus admin

### 2. Menetapkan Akun Admin Pertama

1. Buka **Supabase Dashboard → Authentication → Users** lalu klik **Add User** (masukkan email & kata sandi admin, centang *Auto Confirm User*).
2. Jalankan query berikut di **SQL Editor** dengan mengganti email admin Anda:

```sql
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id AND u.email = 'email-admin-anda@example.com';
```

3. Verifikasi hasilnya:

```sql
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id;
```

4. Sekarang Anda dapat login melalui `/admin/login`.

---

## Perintah Pengembangan

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan Vite |
| `npm run build` | Pemeriksaan TypeScript (`tsc -b`) dan build produksi ke folder `dist/` |
| `npm run preview` | Pratinjau hasil build produksi secara lokal |
| `npm run lint` | Pemeriksaan kualitas kode dengan ESLint |
| `npm run test` | Menjalankan automated unit & component test dengan Vitest |

---

## Panduan Deployment ke GitHub & Vercel

1. Pastikan `npm run lint`, `npm run test`, dan `npm run build` berhasil tanpa error.
2. Inisialisasi dan push kode ke repository GitHub (pastikan `.env.local` **tidak** ter-commit):
   ```bash
   git init
   git add .
   git commit -m "Initial GREEN ENERGY application"
   git branch -M main
   git remote add origin https://github.com/USERNAME/green-energy.git
   git push -u origin main
   ```
3. Buka [Vercel](https://vercel.com) → **Add New Project** → pilih repository GitHub Anda.
4. Pastikan pengaturan build:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Tambahkan **Environment Variables** pada Vercel (Production & Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Klik **Deploy**. File [`vercel.json`](./vercel.json) sudah dikonfigurasi untuk rewrite SPA sehingga refresh langsung pada route seperti `/layanan/instalasi-panel-surya` atau `/admin/pemesanan` tidak menghasilkan error 404.
7. Pada **Supabase Dashboard → Authentication → URL Configuration**, tambahkan domain Vercel Anda ke **Site URL** dan **Redirect URLs**.
