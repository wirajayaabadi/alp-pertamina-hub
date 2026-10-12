# ALP Pertamina — Website Tim

Website satu halaman untuk tim Action Learning Project (ALP) Pertamina, program pengembangan
kepemimpinan Danantara & BUMN. Hero menampilkan miniatur SPBU 3D yang dibangun prosedural
dengan Three.js (tanpa model, gambar render, atau video).

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · three.js

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build produksi
npm run typecheck
```

## Memperbarui konten

| Yang diganti | Lokasi |
| --- | --- |
| Nama, organisasi, peran, bio, keahlian, tujuan belajar anggota | `src/data/team.ts` → `members` |
| Mentor (kartu sorotan di awal bagian tim: jabatan, area fokus, pesan) | `src/data/team.ts` → `mentors` |
| Asisten kelas (setelah daftar anggota) | `src/data/team.ts` → `assistants` |
| Nama kelompok kerja | `src/data/team.ts` → `workgroups` |
| Teks hero, navigasi, judul bagian, footer (nama proyek, program, tahun) | `src/config/site.ts` |
| Logo | ganti `public/brand/logo-pertamina.png`, lalu sesuaikan `logoWidth`/`logoHeight` di `src/config/site.ts` |

**Foto.** Simpan file di `public/photos/` (JPG/WebP persegi, sekitar 800×800 px), lalu isi
`photo: '/photos/nama-file.jpg'`. Jika foto kosong atau gagal dimuat, inisial tampil otomatis.
Avatar dummy saat ini ada di `public/avatars/`.

**LinkedIn & CV.** Isi `linkedinUrl` / `cvUrl` hanya bila tersedia dan disetujui pemiliknya.
CV dapat berupa tautan `https://...` atau file lokal di `public/cv/` (`cvUrl: '/cv/nama.pdf'`).
Tombol disembunyikan selama nilainya kosong.

Seluruh data personel saat ini masih **dummy**.

## Struktur

```
src/
  app/                      layout, halaman, globals.css (token warna)
  config/site.ts            teks & identitas yang dapat diubah
  data/team.ts              satu sumber data personel
  components/
    navigation/SiteHeader   navigasi
    hero/ALPHero            teks, tombol, komposisi hero
    station/                PertaminaStationScene (integrasi React ↔ 3D), StationFallback (SVG statis)
    team/                   TeamSection, TeamFilter, MemberCard, MemberDetail, Avatar
    mentors/                MentorSpotlight (sorotan mentor), AssistantSection
    footer/SiteFooter
  lib/station/
    config.ts               dimensi, posisi, warna, jalur mobil, kamera, timing
    build-station.ts        geometri SPBU (landasan, jalan, marka, kanopi, dispenser, bangunan, papan, mobil)
    materials.ts            material & pencahayaan
    car-animation.ts        siklus mobil masuk → berhenti → keluar
    helpers.ts              cache geometri, tekstur canvas
    scene.ts                renderer, kamera, kontrol, visibilitas, error, cleanup
```

Mengubah tata letak SPBU cukup lewat `src/lib/station/config.ts`. Contohnya `CANOPY`, `ISLANDS`,
`BUILDING`, `PYLON`, `CAR.path`, `CYCLE`, dan `CAMERA`. Jarak kamera dihitung otomatis dari
ukuran objek dan ruang yang tersedia.

## Perilaku 3D

- Three.js dimuat terpisah. Teks dan tombol hero tetap tersedia selama adegan dimuat atau jika gagal.
- Rotasi drag terbatas hanya aktif di perangkat dengan mouse. Roda mouse dan gestur sentuh tetap menggulir halaman.
- Tersedia tombol jeda/putar, plus tombol "Sudut awal" setelah adegan diputar.
- Saat reduced motion aktif, animasi berhenti dan kamera kembali ke sudut stabil. Perubahan preferensi saat halaman terbuka ikut diikuti.
- Render berhenti saat adegan di luar layar atau tab tidak aktif. Resolusi turun otomatis di perangkat lambat.
- Jika WebGL gagal atau konteks grafis hilang, ilustrasi SVG statis ditampilkan.
