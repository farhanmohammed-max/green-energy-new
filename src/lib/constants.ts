import type { BookingStatus, ContactMessageStatus, PreferredTime } from '@/types/database';

export const APP_NAME = 'GREEN ENERGY';
export const APP_TAGLINE = 'Hemat Energi untuk Masa Depan';

/**
 * Informasi perusahaan placeholder yang mudah diubah sebelum publikasi produksi.
 */
export const COMPANY_INFO = {
  name: 'GREEN ENERGY',
  tagline: 'Hemat Energi untuk Masa Depan',
  email: 'halo@greenenergy-contoh.id',
  phone: '+62 812-0000-0000 (Placeholder)',
  address: 'Jl. Energi Hijau No. 10, Jakarta (Alamat Placeholder — perbarui sebelum publikasi)',
  operationalHours: 'Senin – Jumat, 08.30 – 17.00 WIB (Placeholder)',
  disclaimerNote:
    'Data kontak dan profil perusahaan di atas merupakan placeholder yang dapat diperbarui pada konfigurasi aplikasi sebelum publikasi resmi.',
};

export const PREFERRED_TIME_OPTIONS: readonly PreferredTime[] = [
  'Pagi',
  'Siang',
  'Sore',
  'Fleksibel',
] as const;

export const BOOKING_STATUS_LIST: readonly BookingStatus[] = [
  'pending',
  'contacted',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
] as const;

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
  }
> = {
  pending: {
    label: 'Menunggu Tinjauan',
    description: 'Permintaan baru diterima dan menunggu tinjauan tim.',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  contacted: {
    label: 'Sudah Dihubungi',
    description: 'Admin sudah menghubungi pelanggan untuk klarifikasi kebutuhan.',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    description: 'Layanan, estimasi, dan jadwal telah disepakati bersama.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  in_progress: {
    label: 'Sedang Berjalan',
    description: 'Tim sedang melaksanakan konsultasi, survei, atau pekerjaan di lokasi.',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  completed: {
    label: 'Selesai',
    description: 'Seluruh rangkaian layanan telah selesai dilaksanakan.',
    badgeClass: 'bg-forest-900/10 text-forest-900 border-forest-900/20',
  },
  cancelled: {
    label: 'Dibatalkan',
    description: 'Permintaan pemesanan dibatalkan.',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  rejected: {
    label: 'Ditolak',
    description: 'Permintaan tidak dapat dipenuhi saat ini.',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

export const ALLOWED_BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ['contacted', 'cancelled', 'rejected'],
  contacted: ['confirmed', 'cancelled', 'rejected'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
};

export function canTransitionBookingStatus(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return true;
  return ALLOWED_BOOKING_TRANSITIONS[from].includes(to);
}

export const CONTACT_STATUS_LIST: readonly ContactMessageStatus[] = [
  'new',
  'read',
  'processed',
  'closed',
] as const;

export const CONTACT_STATUS_CONFIG: Record<
  ContactMessageStatus,
  { label: string; badgeClass: string }
> = {
  new: {
    label: 'Baru',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  read: {
    label: 'Dibaca',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  processed: {
    label: 'Diproses',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  closed: {
    label: 'Selesai',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'cara-pemesanan',
    category: 'Pemesanan',
    question: 'Bagaimana cara melakukan pemesanan layanan di GREEN ENERGY?',
    answer:
      'Pilih layanan yang sesuai di halaman Layanan, lalu klik "Pesan Layanan". Isi data kontak, lokasi proyek, serta preferensi tanggal dan waktu. Setelah formulir dikirim, Anda akan memperoleh kode pemesanan unik (GE-...) sebagai referensi tindak lanjut bersama admin.',
  },
  {
    id: 'konfirmasi-jadwal',
    category: 'Konfirmasi Jadwal',
    question: 'Apakah tanggal yang saya pilih pada formulir langsung menjadi jadwal resmi?',
    answer:
      'Belum. Pengiriman formulir merupakan permintaan konsultasi, survei, atau penawaran awal. Admin GREEN ENERGY akan menghubungi Anda melalui WhatsApp atau email untuk meninjau kebutuhan, menyampaikan estimasi, dan menyepakati jadwal final.',
  },
  {
    id: 'cara-kerja-panel-surya',
    category: 'Panel Surya',
    question: 'Bagaimana cara kerja sistem panel surya untuk rumah atau bangunan usaha?',
    answer:
      'Panel surya menangkap sinar matahari dan mengubahnya menjadi energi listrik arus searah (DC), kemudian inverter mengubahnya menjadi arus bolak-balik (AC) yang dapat dimanfaatkan untuk peralatan listrik harian. Spesifikasi sistem menyesuaikan kebutuhan daya dan kondisi atap lokasi.',
  },
  {
    id: 'konsultasi-energi',
    category: 'Konsultasi Energi',
    question: 'Apa yang dibahas saat sesi konsultasi energi?',
    answer:
      'Tim kami membantu memahami profil pemakaian listrik Anda, mengevaluasi tujuan penghematan, serta memberikan gambaran awal mengenai opsi solusi yang relevan—mulai dari langkah efisiensi energi hingga potensi pemasangan panel surya.',
  },
  {
    id: 'biaya-layanan',
    category: 'Biaya Layanan',
    question: 'Apakah harga yang tercantum di katalog merupakan biaya final?',
    answer:
      'Tidak. Apabila harga awal ditampilkan pada layanan, angka tersebut bersifat estimasi awal. Biaya akhir sangat bergantung pada lingkup pekerjaan, kondisi lokasi, dan kapasitas sistem yang disepakati setelah konsultasi atau survei.',
  },
  {
    id: 'proses-survei',
    category: 'Proses Survei',
    question: 'Apa saja yang diperiksa pada saat survei potensi panel surya?',
    answer:
      'Survei mencakup peninjauan struktur dan arah atap, potensi bayangan di sekitar lokasi, panel kelistrikan yang ada, serta kebutuhan daya harian. Hasil survei menjadi dasar penyusunan rekomendasi teknis dan penawaran yang transparan.',
  },
  {
    id: 'status-pemesanan',
    category: 'Pemesanan',
    question: 'Bagaimana cara memantau status permintaan pemesanan saya?',
    answer:
      'Jika Anda membuat akun pelanggan dan masuk sebelum memesan, Anda dapat memantau riwayat dan status pemesanan langsung dari menu Akun Saya. Jika memesan sebagai tamu, simpan kode pemesanan Anda dan tim admin akan menginformasikan perkembangan secara langsung.',
  },
];
