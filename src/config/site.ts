/**
 * Identitas proyek dan teks halaman. Ubah nilai di sini tanpa menyentuh komponen.
 */
export const site = {
  brand: {
    /** Logo resmi (sudah dipangkas). Ganti file di /public/brand/ bila ada versi baru. */
    logoSrc: '/brand/logo-pertamina.png',
    logoAlt: 'Pertamina',
    logoWidth: 467,
    logoHeight: 118,
    projectName: 'Action Learning Project',
  },

  nav: [
    { id: 'beranda', label: 'Beranda' },
    { id: 'tim', label: 'Tim Kami' },
  ],

  hero: {
    label: 'Action Learning Project • Pertamina',
    title: 'Perjalanan Belajar, Kolaborasi, dan Dampak.',
    description:
      'Kami berkolaborasi untuk memahami tantangan bisnis, mengembangkan ide, dan merumuskan solusi melalui Action Learning Project.',
    cta: 'Kenali Tim Kami',
    scrollHint: 'Gulir ke bawah',
  },

  team: {
    title: 'Kenali Tim Kami',
    description:
      'Beragam pengalaman dan keahlian, dipertemukan oleh semangat belajar dan berkontribusi.',
    mentorsTitle: 'Mentor & Pendamping',
    mentorsDescription: 'Mendampingi tim sepanjang perjalanan Action Learning Project.',
  },

  footer: {
    title: 'ALP Pertamina',
    /** Nama proyek ALP — masih dummy. */
    projectName: 'Nama Proyek ALP',
    program: 'Program Pengembangan Kepemimpinan Danantara & BUMN',
    /** Tahun atau periode kegiatan. */
    period: '2026',
  },
} as const;
