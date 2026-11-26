# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# GREEN ENERGY — Hemat Energi untuk Masa Depan

**Versi:** 1.0  
**Status:** Draft siap implementasi  
**Platform:** Web responsif  
**Bahasa:** Indonesia  
**Mata uang:** Rupiah (IDR)  
**Zona waktu:** Asia/Jakarta  
**Frontend:** React + TypeScript + Vite  
**Backend-as-a-Service:** Supabase (PostgreSQL, Auth, Storage)  
**Hosting:** Vercel

---

## 1. Ringkasan Produk

GREEN ENERGY adalah aplikasi web untuk memperkenalkan layanan dan solusi hemat energi, menerima permintaan pemesanan dari calon pelanggan, serta membantu admin mengelola layanan, pelanggan, pesan, dan status pemesanan.

Pada MVP, istilah **pemesanan** berarti permintaan konsultasi, survei, atau penawaran layanan. Pengiriman formulir **belum berarti transaksi langsung, jadwal telah disetujui, atau pembayaran telah dilakukan**. Admin meninjau permintaan, menghubungi pelanggan, menyampaikan estimasi, lalu mengonfirmasi jadwal.

### Asumsi ruang lingkup

Aplikasi ini diasumsikan menawarkan layanan seperti konsultasi energi, survei potensi panel surya, instalasi panel surya, dan audit efisiensi energi. Nama, deskripsi, harga awal, dan status layanan harus dapat diubah admin dari dashboard tanpa mengubah kode.

### Masalah yang ingin diselesaikan

- Calon pelanggan membutuhkan satu tempat untuk mengenali solusi energi dan mengirim permintaan layanan.
- Proses pemesanan melalui chat manual rawan kehilangan data dan sulit dilacak.
- Admin membutuhkan panel terpusat untuk mengelola layanan, data pelanggan, pesan, dan progres pemesanan.

### Solusi

Website publik yang informatif dan mudah digunakan, formulir pemesanan yang tervalidasi, penyimpanan data terpusat, serta dashboard admin dengan CRUD dan status pemesanan.

## 2. Tujuan dan Indikator Keberhasilan

### Tujuan bisnis

1. Mempermudah calon pelanggan mengirim permintaan layanan.
2. Mengurangi pencatatan pesanan secara manual.
3. Mempercepat admin menindaklanjuti permintaan masuk.
4. Menyediakan katalog layanan yang dapat diperbarui tanpa bantuan developer.

### KPI MVP

- Pengunjung dapat mengirim formulir pemesanan tanpa error.
- Setiap permintaan tersimpan di database dengan kode pemesanan unik.
- Admin dapat melihat, mencari, memfilter, memperbarui, dan mengarsipkan pemesanan.
- Admin dapat mengelola kategori, layanan, testimoni, dan pesan masuk.
- Halaman utama dan halaman layanan dapat digunakan di layar ponsel maupun desktop.
- Tidak ada akses publik ke data pemesanan pelanggan atau catatan internal admin.

## 3. Pengguna dan Hak Akses

| Peran | Kebutuhan | Hak akses |
|---|---|---|
| Pengunjung | Mengenal perusahaan dan layanan | Melihat halaman publik, katalog aktif, FAQ, dan testimoni yang dipublikasikan; mengirim pesan dan pemesanan |
| Pelanggan terdaftar | Melakukan pemesanan dan melihat permintaannya | Semua hak pengunjung; melihat pemesanan milik akun sendiri dan mengubah data profil sendiri |
| Admin | Mengelola operasional aplikasi | Mengelola layanan, kategori, pemesanan, pesan masuk, testimoni, dan melihat daftar profil pelanggan |

**Catatan keamanan:** Pengunjung dapat membuat pemesanan sebagai tamu. Untuk pemesanan tamu, kode pemesanan ditampilkan setelah formulir berhasil dikirim. Data pemesanan tamu tidak boleh dapat dicari oleh publik hanya dengan menebak kode. Fitur pelacakan pemesanan tamu melalui OTP email/WhatsApp merupakan pengembangan lanjutan. Pelanggan yang login dapat melihat pemesanannya sendiri.

## 4. Ruang Lingkup Produk

### 4.1 Termasuk MVP

- Website publik responsif.
- Beranda, tentang kami, katalog layanan, detail layanan, FAQ, kontak.
- Formulir pemesanan layanan.
- Formulir pesan/kontak.
- Kode pemesanan otomatis.
- Login admin dan perlindungan route dashboard.
- Dashboard ringkasan.
- CRUD kategori layanan.
- CRUD layanan.
- CRUD pemesanan: baca, ubah status/data operasional, dan arsipkan/hapus sesuai hak admin.
- CRUD testimoni.
- Pengelolaan pesan masuk.
- Profil pelanggan: lihat oleh admin; pelanggan dapat mengubah nama dan nomor telepon sendiri.
- Validasi formulir, notifikasi sukses/gagal, loading state, empty state, dan error state.
- Row Level Security (RLS) Supabase.
- Deployment Vercel.

### 4.2 Tidak termasuk MVP

- Pembayaran online dan invoice otomatis.
- Penentuan jadwal teknisi secara real-time.
- Integrasi WhatsApp Business API.
- Email transaksional otomatis.
- Perhitungan teknis kebutuhan panel surya secara otomatis.
- Multi-cabang, multi-vendor, dan aplikasi mobile native.
- Pelacakan pemesanan tamu via OTP.

Fitur tersebut dapat ditambahkan setelah alur pemesanan inti stabil.

## 5. Struktur Halaman dan Navigasi

### 5.1 Website publik

| Route | Halaman | Isi/aksi utama |
|---|---|---|
| `/` | Beranda | Hero, CTA Pesan Layanan, manfaat hemat energi, layanan unggulan, alur pemesanan, testimoni, FAQ ringkas |
| `/layanan` | Daftar layanan | Katalog layanan aktif, pencarian sederhana, filter kategori |
| `/layanan/:slug` | Detail layanan | Deskripsi, manfaat, informasi harga awal bila tersedia, CTA pesan layanan |
| `/tentang` | Tentang kami | Profil, visi, misi, komitmen lingkungan |
| `/faq` | FAQ | Pertanyaan umum dalam format accordion |
| `/kontak` | Kontak | Informasi kontak dan formulir pesan |
| `/pesan/:slug` | Form pemesanan | Form yang telah memilih layanan berdasarkan slug |
| `/pesanan/berhasil` | Konfirmasi | Kode pemesanan dan instruksi tindak lanjut; jangan tampilkan data pribadi berlebihan |
| `/login` | Login | Login admin/pelanggan |
| `/daftar` | Registrasi pelanggan (opsional) | Pendaftaran akun pelanggan bila fitur akun pelanggan diaktifkan; tidak menyediakan pendaftaran admin |

### 5.2 Dashboard admin

Semua route admin harus dilindungi autentikasi dan pengecekan role admin di sisi aplikasi **serta** oleh RLS di database.

| Route | Halaman | Fitur |
|---|---|---|
| `/admin` | Dashboard | Jumlah permintaan baru, perlu dihubungi, dikonfirmasi, selesai; daftar permintaan terbaru |
| `/admin/pemesanan` | Data pemesanan | Tabel, cari, filter status/tanggal, detail, ubah status, arsipkan |
| `/admin/pemesanan/:id` | Detail pemesanan | Data pelanggan, layanan, lokasi, tanggal pilihan, pesan, catatan internal, estimasi biaya |
| `/admin/layanan` | Data layanan | Tabel, tambah, edit, aktif/nonaktif, hapus jika tidak direferensikan |
| `/admin/kategori` | Kategori | Tambah, edit, aktif/nonaktif, hapus jika aman |
| `/admin/testimoni` | Testimoni | Tambah, edit, terbitkan/sembunyikan, hapus |
| `/admin/pesan` | Pesan masuk | Baca, tandai diproses/selesai, hapus |
| `/admin/pelanggan` | Pelanggan | Daftar profil, cari berdasarkan nama/email; tidak boleh melihat password atau token autentikasi |
| `/admin/profil` | Profil admin | Ubah nama dan nomor telepon |

## 6. Rincian Kebutuhan Fungsional

### FR-01 — Beranda

- Menampilkan identitas GREEN ENERGY dan tagline “Hemat Energi untuk Masa Depan”.
- Tombol utama “Pesan Layanan” menuju katalog atau form pemesanan.
- Menampilkan layanan unggulan yang berstatus aktif dan ditandai unggulan.
- Menampilkan manfaat, tahapan layanan, testimoni terpublikasi, dan FAQ ringkas.
- Seluruh CTA harus mengarah ke route yang benar.

### FR-02 — Katalog dan detail layanan

- Pengunjung hanya melihat kategori dan layanan aktif.
- Pengunjung dapat mencari nama layanan dan memfilter kategori.
- Detail layanan memuat nama, gambar, ringkasan, deskripsi, manfaat, harga awal opsional, dan durasi/estimasi pengerjaan bila tersedia.
- Tombol pesan membawa ID layanan/slug ke formulir.
- Admin dapat mengelola konten layanan tanpa mengedit source code.

### FR-03 — Form pemesanan

**Field formulir:**

| Field | Tipe | Wajib | Validasi |
|---|---|---:|---|
| Layanan | Relasi layanan | Ya | Harus mengacu ke layanan aktif |
| Nama lengkap | Teks | Ya | 2–100 karakter |
| Email | Email | Ya | Format email valid |
| Nomor telepon/WhatsApp | Teks | Ya | 8–20 karakter; izinkan angka, spasi, `+`, `-` |
| Alamat/lokasi proyek | Teks | Ya | 5–500 karakter |
| Tanggal yang diinginkan | Tanggal | Tidak | Tidak boleh tanggal lampau |
| Waktu yang diinginkan | Pilihan | Tidak | Pagi, Siang, Sore, atau Fleksibel |
| Pesan/kebutuhan | Teks panjang | Tidak | Maksimal 2.000 karakter |
| Persetujuan privasi | Checkbox | Ya | Harus dicentang |

**Perilaku:**

1. Validasi dilakukan di client dan database.
2. Tombol kirim dinonaktifkan saat proses berlangsung agar tidak terjadi pengiriman ganda.
3. Sistem menyimpan pemesanan dengan status awal `pending`.
4. Frontend membuat kode acak kriptografis sebelum INSERT, berformat `GE-` ditambah 16 karakter heksadesimal uppercase; database tetap memiliki default code sebagai fallback untuk input administratif. Jika terjadi konflik unique, buat kode baru dan ulangi INSERT sekali.
5. Setelah berhasil, tampilkan halaman konfirmasi berisi kode yang telah dikirim bersama INSERT dan keterangan bahwa admin akan menghubungi pelanggan. Jangan meminta SELECT publik untuk mengambil ulang data booking, karena tabel pemesanan memang tidak boleh dibaca oleh anon.
6. Jika gagal, tampilkan pesan yang jelas dan jangan menghapus input yang sudah diisi.
7. Jika pelanggan sedang login, simpan `user_id`; jika tamu, `user_id` bernilai null.
8. Jangan menampilkan estimasi harga sebagai harga final atau menganggap tanggal pilihan sebagai jadwal yang telah dikonfirmasi.

### FR-04 — Form kontak

- Field: nama, email, nomor telepon opsional, subjek, isi pesan.
- Pesan baru memiliki status `new`.
- Pengunjung hanya dapat membuat pesan, tidak dapat membaca pesan lain.
- Admin dapat membaca, mengubah status, dan menghapus pesan.

### FR-05 — Autentikasi dan profil

- Admin login menggunakan Supabase Auth.
- Tidak boleh ada halaman registrasi admin publik.
- Profil dibuat otomatis setelah akun Supabase dibuat.
- Role default adalah `customer`; admin pertama dipromosikan secara manual melalui SQL Editor Supabase.
- Pelanggan hanya dapat membaca profil sendiri; admin dapat membaca semua profil.
- Pengguna hanya dapat mengubah `full_name` dan `phone`, bukan `role` atau `id`.
- Logout mengakhiri sesi dan mengarahkan pengguna ke halaman publik.

### FR-06 — Dashboard admin

- Kartu ringkasan jumlah pemesanan berdasarkan status.
- Tabel 5–10 pemesanan terbaru.
- Pintasan ke pemesanan baru, layanan, pesan masuk.
- Angka di dashboard harus berasal dari database, bukan angka dummy.
- Jika data kosong, tampilkan empty state yang informatif.

### FR-07 — Manajemen pemesanan

Admin dapat:

- Melihat daftar seluruh pemesanan.
- Mencari berdasarkan kode, nama, email, atau nomor telepon.
- Memfilter berdasarkan status dan rentang tanggal.
- Membuka detail pemesanan.
- Memperbarui status, tanggal yang disepakati, estimasi biaya, dan catatan internal.
- Mengarsipkan pemesanan untuk mengeluarkannya dari daftar aktif.
- Membatalkan atau menolak permintaan dengan status yang sesuai.

Pelanggan login hanya dapat membaca pemesanan miliknya. Perubahan status dan catatan internal hanya boleh dilakukan admin.

### FR-08 — Manajemen layanan dan kategori

Admin dapat menambah, melihat, mengedit, mengaktif/nonaktifkan, dan menghapus data yang tidak memiliki relasi aktif. Layanan yang sudah pernah dipesan sebaiknya dinonaktifkan, bukan dihapus, agar histori tetap utuh.

### FR-09 — Manajemen testimoni

Admin dapat menambah, melihat, mengedit, menghapus, serta menerbitkan atau menyembunyikan testimoni. Pengunjung hanya melihat testimoni yang dipublikasikan.

### FR-10 — Manajemen pesan masuk

Admin dapat melihat detail pesan, mengubah status (`new`, `read`, `processed`, `closed`), dan menghapus spam/duplikat.

## 7. Aturan Bisnis

### Status pemesanan

| Status | Makna | Transisi yang diizinkan |
|---|---|---|
| `pending` | Permintaan baru diterima | `contacted`, `cancelled`, `rejected` |
| `contacted` | Admin sudah mencoba/menghubungi pelanggan | `confirmed`, `cancelled`, `rejected` |
| `confirmed` | Layanan/jadwal telah disepakati | `in_progress`, `cancelled` |
| `in_progress` | Pekerjaan sedang berlangsung | `completed`, `cancelled` |
| `completed` | Pekerjaan selesai | Status akhir |
| `cancelled` | Dibatalkan | Status akhir |
| `rejected` | Permintaan tidak dapat dipenuhi | Status akhir |

UI admin harus mencegah transisi status yang tidak sesuai. Catatan internal tidak pernah ditampilkan ke pelanggan.

### Aturan tambahan

- Satu pemesanan MVP merujuk pada satu layanan utama.
- Harga layanan boleh kosong. Jika terisi, itu hanya harga awal/estimasi.
- Kode pemesanan unik dan tidak berubah setelah dibuat. Frontend mengirim kode acak sebelum INSERT agar konfirmasi tidak memerlukan izin SELECT publik.
- Layanan/kategori yang sudah direferensikan pemesanan tidak dihapus secara permanen; gunakan status nonaktif.
- Pemesanan yang diarsipkan tidak muncul di daftar aktif, namun tetap disimpan.
- Waktu disimpan sebagai timestamp UTC oleh PostgreSQL dan ditampilkan menurut zona waktu Asia/Jakarta.

## 8. CRUD Lengkap per Modul

### 8.1 Kategori layanan (`service_categories`)

| Operasi | Admin | Publik |
|---|---|---|
| Create | Tambah nama, slug, deskripsi, urutan, status aktif | Tidak |
| Read | Lihat semua kategori | Lihat kategori aktif |
| Update | Edit seluruh atribut kategori | Tidak |
| Delete | Hapus jika belum dipakai; jika sudah dipakai, nonaktifkan | Tidak |

### 8.2 Layanan (`services`)

| Operasi | Admin | Publik |
|---|---|---|
| Create | Tambah layanan dan unggah gambar | Tidak |
| Read | Lihat semua layanan termasuk nonaktif | Lihat layanan aktif |
| Update | Edit nama, deskripsi, harga awal, kategori, gambar, unggulan, status | Tidak |
| Delete | Hapus bila belum direferensikan; selain itu nonaktifkan | Tidak |

### 8.3 Pemesanan (`bookings`)

| Operasi | Admin | Pelanggan login | Tamu |
|---|---|---|---|
| Create | Dapat membuat melalui alur operasional bila diperlukan | Membuat pemesanan dengan `user_id` sendiri | Membuat pemesanan dengan `user_id = null` |
| Read | Semua pemesanan | Hanya pemesanan milik sendiri | Tidak dapat membaca dari database publik |
| Update | Status, jadwal, estimasi, catatan internal, arsip | Tidak pada MVP | Tidak |
| Delete | Arsipkan; hard delete hanya untuk data uji/duplikat sesuai kebijakan | Tidak | Tidak |

### 8.4 Testimoni (`testimonials`)

| Operasi | Admin | Publik |
|---|---|---|
| Create | Tambah testimoni | Tidak |
| Read | Semua testimoni | Hanya yang dipublikasikan |
| Update | Edit dan ubah status publikasi | Tidak |
| Delete | Hapus | Tidak |

### 8.5 Pesan kontak (`contact_messages`)

| Operasi | Admin | Publik |
|---|---|---|
| Create | Tidak wajib | Kirim pesan baru |
| Read | Semua pesan | Tidak |
| Update | Ubah status tindak lanjut | Tidak |
| Delete | Hapus spam/duplikat | Tidak |

### 8.6 Profil (`profiles`)

| Operasi | Admin | Pelanggan |
|---|---|---|
| Create | Dibuat otomatis oleh trigger Supabase Auth; akun admin dibuat melalui Supabase Auth | Dibuat otomatis setelah mendaftar melalui mekanisme Auth yang diaktifkan |
| Read | Semua profil | Profil sendiri |
| Update | Nama dan telepon; perubahan role melalui SQL/operasi administratif khusus | Nama dan telepon sendiri |
| Delete | Hapus akun melalui Supabase Auth sesuai kebijakan retensi | Tidak pada MVP |

## 9. Model Data

### Entitas inti

1. `profiles`: data profil dan role pengguna, terhubung ke `auth.users`.
2. `service_categories`: kategori katalog layanan.
3. `services`: layanan yang dapat dipesan.
4. `bookings`: permintaan pemesanan pelanggan.
5. `contact_messages`: pesan dari halaman kontak.
6. `testimonials`: testimoni yang dapat dipublikasikan.

### Relasi

- Satu kategori memiliki banyak layanan.
- Satu layanan dapat memiliki banyak pemesanan.
- Satu akun dapat memiliki banyak pemesanan.
- Akun pemesan boleh kosong untuk pemesanan tamu.
- Testimoni dan pesan kontak berdiri sendiri.

SQL pembuatan tabel, indeks, trigger, kebijakan RLS, dan data awal disediakan di file `SUPABASE_SCHEMA.sql` yang menyertai dokumen ini.

## 10. Struktur Teknis yang Direkomendasikan

### Stack

| Lapisan | Teknologi | Tanggung jawab |
|---|---|---|
| Frontend | React + TypeScript + Vite | Antarmuka website dan dashboard |
| Styling | Tailwind CSS + shadcn/ui atau komponen setara | Tampilan konsisten dan responsif |
| Routing | React Router | Navigasi publik dan admin |
| Data fetching | TanStack Query | Cache, loading, refetch, mutation |
| Form | React Hook Form + Zod | Validasi input |
| Backend/database | Supabase PostgreSQL | Penyimpanan data dan query |
| Authentication | Supabase Auth | Login dan sesi |
| File/image | Supabase Storage | Gambar layanan/testimoni bila diperlukan |
| Hosting | Vercel | Build dan hosting frontend |

### Prinsip arsitektur

- Pisahkan komponen UI, halaman, hooks, layanan data, dan tipe data.
- Semua akses database melalui satu Supabase client di `src/lib/supabase.ts`.
- Gunakan TypeScript types untuk setiap tabel dan payload.
- Gunakan Zod untuk memvalidasi formulir sebelum mengirim data.
- Jangan menyimpan data pemesanan penting hanya di state browser atau `localStorage`.
- Gunakan RLS sebagai lapisan keamanan utama; route guard frontend bukan pengganti RLS.
- Jangan pernah memasukkan Supabase `service_role` key ke variabel `VITE_*` atau source frontend.
- Gunakan Supabase publishable/anon key di frontend bersama RLS.
- Jika kelak menambahkan email/WhatsApp otomatis, panggil layanan dari serverless function/Edge Function, jangan meletakkan secret di browser.

### Struktur folder yang disarankan

```text
src/
  app/
    router.tsx
    providers.tsx
  components/
    layout/
    common/
    forms/
    admin/
  pages/
    public/
    auth/
    admin/
  features/
    bookings/
    services/
    categories/
    testimonials/
    messages/
    customers/
  hooks/
  lib/
    supabase.ts
    utils.ts
  schemas/
  types/
  styles/
public/
  images/
api/                  # opsional untuk Vercel Functions di fase berikutnya
supabase/
  migrations/
```

## 11. Panduan UI/UX

### Identitas visual

- Tema: energi bersih, lingkungan, teknologi, kepercayaan.
- Warna utama: hijau hutan/dark green.
- Warna sekunder: hijau daun.
- Latar: putih atau off-white.
- Aksen: kuning lembut untuk sinar matahari/energi.
- Gunakan ruang kosong yang cukup, kontras teks baik, dan ikon sederhana.
- Hindari tampilan terlalu ramai atau penggunaan efek animasi berlebihan.

### Beranda yang disarankan

1. Navbar: logo, Beranda, Layanan, Tentang, FAQ, Kontak, tombol Pesan Layanan.
2. Hero: headline “Mulai Hemat Energi, Bangun Masa Depan Lebih Hijau”, deskripsi singkat, CTA.
3. Ringkasan manfaat: hemat biaya, energi bersih, konsultasi, dukungan teknis.
4. Layanan unggulan.
5. Cara kerja: pilih layanan → isi permintaan → dihubungi admin → konfirmasi jadwal/penawaran.
6. Dampak/komitmen lingkungan (hindari angka dampak yang tidak memiliki sumber).
7. Testimoni.
8. FAQ dan footer.

### Dashboard admin

- Sidebar atau navigation rail yang jelas.
- Statistik ringkas tanpa grafik dekoratif yang tidak berguna.
- Tabel dengan search, filter, pagination, dan aksi yang jelas.
- Form tambah/edit dapat menggunakan halaman atau modal; validasi harus terlihat.
- Konfirmasi sebelum arsip/hapus.
- Status menggunakan label teks yang konsisten, tidak hanya warna.

## 12. Kebutuhan Nonfungsional

- Responsif mulai dari lebar layar 360 px.
- Aksesibilitas: label input, navigasi keyboard, focus state, alt text gambar, kontras memadai.
- Validasi client dan server/database.
- RLS aktif pada seluruh tabel yang dapat diakses melalui Supabase API.
- Tidak ada data rahasia di console log atau pesan error UI.
- Gunakan pagination untuk tabel admin.
- Tangani error jaringan, loading, empty state, dan retry.
- Optimalkan ukuran gambar dan lazy loading untuk gambar non-hero.
- Judul halaman dan meta description dasar untuk SEO.
- Simpan timestamp konsisten dan tampilkan dalam zona Asia/Jakarta.

## 13. Keamanan dan Privasi

- Semua tabel publik yang diekspos Supabase API harus memiliki RLS aktif.
- Pengunjung boleh membaca kategori/layanan aktif dan testimoni terpublikasi.
- Pengunjung hanya boleh INSERT pemesanan/pesan; tidak boleh SELECT data pelanggan lain.
- Pelanggan login hanya boleh SELECT pemesanan miliknya.
- Hanya admin yang dapat mengubah status pemesanan, estimasi, catatan internal, layanan, kategori, testimoni, dan pesan.
- Role admin tidak boleh dapat diubah dari formulir profil pengguna.
- Jangan menggunakan `service_role` key di browser.
- Jangan menyimpan password sendiri; serahkan autentikasi ke Supabase Auth.
- Minta persetujuan privasi sebelum pemesanan dan sediakan penjelasan penggunaan data untuk tindak lanjut permintaan.
- Batasi data pribadi yang ditampilkan di tabel; detail hanya untuk pengguna berwenang.

## 14. Notifikasi

### MVP

- Notifikasi sukses di halaman setelah pemesanan disimpan.
- Kode pemesanan tampil dan dapat disalin.
- Dashboard admin menampilkan jumlah permintaan baru.

### Tahap berikutnya

- Email ke admin saat ada pemesanan baru.
- Email konfirmasi ke pelanggan.
- Integrasi WhatsApp Business API atau tautan WhatsApp untuk tindak lanjut.

Jangan mengklaim email/WhatsApp sudah terkirim sebelum integrasi benar-benar dibuat dan diuji.

## 15. Rencana Pengujian dan Acceptance Criteria

### Website publik

- [ ] Semua route publik dapat dibuka langsung melalui URL.
- [ ] Katalog hanya menampilkan layanan aktif.
- [ ] Filter kategori dan pencarian bekerja.
- [ ] Form pemesanan memvalidasi seluruh field wajib.
- [ ] Tanggal lampau ditolak.
- [ ] Pemesanan tersimpan sekali meskipun pengguna menekan tombol beberapa kali.
- [ ] Kode unik dan status awal `pending` dihasilkan.
- [ ] Pengunjung tidak dapat membaca data pemesanan melalui query publik.
- [ ] Form kontak dapat membuat pesan baru.

### Dashboard admin

- [ ] Pengguna non-admin tidak dapat membuka halaman admin.
- [ ] Pengguna non-admin tidak dapat membaca/mengubah data admin melalui Supabase API.
- [ ] Admin dapat CRUD kategori dan layanan.
- [ ] Admin dapat mencari/filter pemesanan.
- [ ] Admin dapat memperbarui status sesuai transisi yang diizinkan.
- [ ] Admin dapat mengarsipkan pemesanan.
- [ ] Admin dapat CRUD testimoni dan mempublikasikannya.
- [ ] Admin dapat membaca dan mengubah status pesan masuk.
- [ ] Statistik berasal dari data aktual.

### Build dan deploy

- [ ] `npm run build` berhasil tanpa error TypeScript.
- [ ] `npm run lint` berhasil jika lint dikonfigurasi.
- [ ] Tidak ada secret pada bundle frontend.
- [ ] Refresh langsung pada route seperti `/layanan` dan `/admin/pemesanan` tidak menghasilkan 404 di Vercel.
- [ ] Environment variables tersedia di Vercel Production dan Preview.
- [ ] Database RLS diuji dengan anon, customer, dan admin.

## 16. Environment Variables

Buat `.env.local` untuk development:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Tambahkan nama variabel yang sama pada Vercel Project Settings → Environment Variables. Ganti nilainya dengan URL project dan publishable key dari Supabase.

**Dilarang:** `VITE_SUPABASE_SERVICE_ROLE_KEY`. Service role key bersifat rahasia dan tidak boleh dikirim ke browser.

## 17. Deployment Vercel

1. Pastikan `npm run build` berhasil di komputer lokal.
2. Push repository ke GitHub.
3. Import repository di Vercel.
4. Framework preset: Vite (biasanya terdeteksi otomatis).
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Tambahkan environment variables Supabase.
8. Deploy dan uji route publik serta admin.
9. Untuk SPA, buat `vercel.json` agar deep link diarahkan ke `index.html`.

Isi `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 18. Tahapan Pengembangan

### Tahap 1 — Fondasi

- Inisialisasi Vite React TypeScript.
- Pasang Tailwind dan komponen UI.
- Siapkan router, layout, tema, dan Supabase client.
- Buat SQL schema, seed data, trigger, dan RLS.

### Tahap 2 — Website publik

- Beranda, tentang, FAQ, kontak.
- Katalog, detail layanan, filter kategori.
- Form pemesanan dan konfirmasi.

### Tahap 3 — Autentikasi dan admin

- Login, route guard, role check.
- Dashboard ringkasan.
- CRUD kategori dan layanan.
- CRUD pemesanan dan perubahan status.
- CRUD testimoni dan pengelolaan pesan.

### Tahap 4 — QA dan deployment

- Uji RLS dengan tiga konteks: anon, customer, admin.
- Uji validasi dan skenario error.
- Audit responsive dan aksesibilitas.
- Build production, deploy Vercel, uji deep link.

### Tahap 5 — Pengembangan lanjutan

- Email/WhatsApp notification.
- OTP tracking untuk pemesanan tamu.
- Pembayaran online, invoice, dan penjadwalan teknisi.

## 19. Definisi Selesai (Definition of Done)

MVP dinyatakan selesai ketika pelanggan dapat mengirim permintaan pemesanan yang tersimpan aman di Supabase, admin dapat memproses permintaan melalui dashboard dengan operasi CRUD yang diperlukan, konten layanan dapat dikelola admin, seluruh tabel terlindungi RLS, dan aplikasi berhasil dibangun serta diakses melalui domain Vercel.

---

# PROMPT MASTER UNTUK GOOGLE ANTIGRAVITY

Salin prompt di bawah ini ke project Antigravity setelah membuka folder proyek. Minta agent membuat rencana terlebih dahulu, lalu implementasikan bertahap. Sertakan file `SUPABASE_SCHEMA.sql` ini ke workspace dan jalankan SQL tersebut pada Supabase SQL Editor sebelum pengujian integrasi database.

```text
Bertindaklah sebagai Senior Full-Stack Engineer, UI/UX Designer, Database Engineer, dan QA Engineer.

BANGUN APLIKASI WEB PRODUKSI bernama:
GREEN ENERGY — Hemat Energi untuk Masa Depan

TUJUAN PRODUK
Website untuk memperkenalkan layanan energi hijau serta menerima permintaan pemesanan/konsultasi/survei/penawaran. Admin memproses permintaan dari dashboard. Pemesanan pada MVP bukan pembayaran langsung dan bukan konfirmasi jadwal otomatis.

STACK WAJIB
- React + TypeScript + Vite.
- Tailwind CSS; gunakan shadcn/ui atau komponen accessible yang setara.
- React Router.
- TanStack Query untuk fetching, caching, dan mutations.
- React Hook Form + Zod untuk formulir dan validasi.
- Supabase PostgreSQL + Supabase Auth + Supabase Storage bila gambar diperlukan.
- Deployment target Vercel.
- Jangan mengganti Vite menjadi Next.js.
- Jangan memakai localStorage sebagai database utama.

SUMBER KEBUTUHAN
Ikuti dokumen PRD_GREEN_ENERGY.md dan skema SUPABASE_SCHEMA.sql di workspace. Jangan mengurangi fitur inti yang ditentukan dokumen tersebut. Bila ada keputusan desain kecil yang belum ditentukan, pilih pendekatan yang paling sederhana, aman, konsisten, dan mudah dipelihara; dokumentasikan asumsi.

DESAIN
Buat desain profesional, modern, bersih, terpercaya, dan responsif. Identitas visual energi hijau: dark forest green, leaf green, putih/off-white, aksen solar yellow secukupnya. Gunakan tipografi mudah dibaca, whitespace cukup, ikon konsisten, animasi ringan, dan layout mobile-first. Hindari template generik yang terlalu ramai. Seluruh antarmuka menggunakan Bahasa Indonesia.

FITUR WEBSITE PUBLIK
1. Beranda dengan navbar, hero, CTA, manfaat, layanan unggulan, alur pemesanan, testimoni, FAQ, dan footer.
2. Tentang kami.
3. Katalog layanan aktif dengan pencarian dan filter kategori.
4. Detail layanan.
5. Form pemesanan: layanan, nama lengkap, email, WhatsApp, lokasi proyek, tanggal pilihan opsional, waktu pilihan opsional, pesan opsional, dan persetujuan privasi.
6. Sebelum INSERT, buat kode unik `GE-` + 16 karakter heksadesimal uppercase menggunakan `crypto.randomUUID()`; kirim kode tersebut bersama data booking berstatus pending dan tampilkan kode itu setelah INSERT sukses. Jangan memakai `.select()` pada INSERT publik untuk membaca kembali row booking. Jelaskan bahwa admin akan menghubungi pelanggan untuk konfirmasi; tanggal pilihan belum merupakan jadwal final.
7. Form kontak yang menyimpan pesan ke database.
8. FAQ.

FITUR ADMIN
1. Login Supabase Auth; tidak ada pendaftaran admin publik.
2. Route admin terlindungi dan role harus diperiksa.
3. Dashboard memakai data database nyata: jumlah booking per status dan booking terbaru.
4. CRUD kategori layanan.
5. CRUD layanan, termasuk gambar, harga awal opsional, status aktif, dan unggulan.
6. CRUD pemesanan: daftar, pencarian, filter, detail, update status, tanggal yang disepakati, estimasi, catatan internal, dan arsip.
7. Status: pending, contacted, confirmed, in_progress, completed, cancelled, rejected. Terapkan transisi status sesuai PRD.
8. CRUD testimoni dan status publikasi.
9. Pengelolaan pesan kontak.
10. Daftar profil pelanggan; pengguna hanya boleh mengubah nama dan nomor telepon sendiri.

KEAMANAN WAJIB
- Terapkan Supabase RLS. Jangan mengandalkan route guard frontend saja.
- Pengunjung hanya boleh membaca kategori/layanan aktif dan testimoni yang dipublikasikan.
- Pengunjung boleh INSERT booking berstatus pending dan pesan kontak baru, tetapi tidak boleh SELECT data booking/pesan milik orang lain.
- Pelanggan login hanya boleh membaca booking miliknya.
- Hanya admin boleh membaca seluruh booking, mengubah status/catatan internal/estimasi, serta CRUD layanan/kategori/testimoni/pesan.
- Role admin tidak boleh dapat diubah melalui UI profil.
- Gunakan hanya VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY pada frontend.
- DILARANG meletakkan service_role key, password, atau secret di source code, browser, atau variabel VITE_*.
- Jangan membuat kredensial admin hardcoded.

STRUKTUR KODE
Pisahkan app/router, components, pages/public, pages/admin, features, hooks, lib, schemas, types, dan styles. Buat satu Supabase client. Gunakan reusable components. Hindari satu file raksasa. Gunakan tipe TypeScript yang jelas. Tangani loading, error, empty state, retry, dan notifikasi sukses.

IMPLEMENTASI DAN URUTAN KERJA
Tahap A: Periksa workspace. Jika belum ada project, scaffold Vite React TypeScript. Buat PLAN.md dan jelaskan tahapan serta keputusan arsitektur sebelum implementasi.
Tahap B: Pasang dependency, konfigurasi Tailwind, router, theme, layout, dan komponen dasar.
Tahap C: Buat integrasi Supabase, types, query hooks, schemas, dan dokumentasi environment variables.
Tahap D: Implementasikan halaman publik dan pemesanan.
Tahap E: Implementasikan autentikasi, proteksi admin, dashboard, dan seluruh CRUD.
Tahap F: Implementasikan verifikasi validasi, error handling, responsive states, dan accessibility.
Tahap G: Tambahkan vercel.json untuk SPA deep-link fallback.
Tahap H: Jalankan test dan production build, perbaiki seluruh error.

BATASAN PENTING
- Jangan mengarang data statistik, testimoni, sertifikasi, klaim penghematan, alamat, nomor telepon, atau penghargaan perusahaan. Gunakan placeholder yang diberi tanda jelas atau konten contoh yang jelas merupakan demo.
- Jangan membuat tombol yang tidak berfungsi.
- Jangan gunakan data mock untuk menggantikan integrasi Supabase setelah konfigurasi tersedia. Data seed hanya untuk demo/dev.
- Jangan mengubah stack wajib.
- Jangan menghapus file yang sudah ada tanpa alasan dan penjelasan.
- Jangan mengklaim deployment, email, atau integrasi berhasil sebelum benar-benar diuji.

KONFIGURASI
Sediakan .env.example dengan:
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

Pastikan .env.local masuk .gitignore. Sertakan README berisi instalasi, setup Supabase, cara menjalankan SQL schema, cara menjadikan akun pertama sebagai admin melalui SQL Editor, command dev/build/lint/test, dan langkah deploy Vercel.

VERCEL
Buat vercel.json SPA rewrite ke /index.html. Build command npm run build dan output dist. Jangan letakkan secret di konfigurasi frontend.

PENGUJIAN WAJIB SEBELUM MENYATAKAN SELESAI
- npm run build harus berhasil.
- Jalankan lint/test yang tersedia dan perbaiki error.
- Uji halaman publik pada mobile dan desktop.
- Uji booking sebagai pengunjung tanpa login.
- Uji booking sebagai customer login.
- Uji bahwa customer tidak bisa membaca booking customer lain.
- Uji bahwa anon tidak bisa membaca booking atau pesan masuk.
- Uji bahwa customer bukan admin tidak bisa mengakses operasi admin.
- Uji CRUD admin untuk kategori, layanan, booking, testimoni, dan pesan.
- Uji refresh langsung pada route nested agar tidak 404 di Vercel.
- Jika kredensial Supabase belum tersedia, tetap implementasikan integrasi dan jelaskan bahwa pengujian database live belum dapat dilakukan; jangan mengarang hasil.

OUTPUT YANG HARUS DIBERIKAN
1. Aplikasi yang benar-benar berjalan, bukan hanya mockup.
2. Semua file source code.
3. PLAN.md dan README.md.
4. .env.example tanpa secret.
5. vercel.json.
6. SQL/migration yang diperlukan.
7. Ringkasan route dan fitur CRUD.
8. Hasil build/test yang benar-benar dijalankan.
9. Daftar langkah manual yang masih harus dilakukan oleh pemilik project.

Mulai dengan membaca file PRD dan SQL schema. Buat PLAN.md, kemudian implementasikan bertahap sampai build berhasil. Jangan berhenti setelah membuat tampilan beranda saja.
```

## 20. Referensi Implementasi

- Antigravity — Prompting and instructions: https://antigravity.google/docs/learn/prompting
- Supabase — React Auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/react
- Vite — Static deployment: https://vite.dev/guide/static-deploy
- Vercel — Vite framework guide: https://vercel.com/docs/frameworks/frontend/vite
