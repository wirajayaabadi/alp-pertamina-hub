/**
 * Parameter adegan SPBU. Satuan ≈ meter; sumbu x ke kanan, z ke arah penonton, y ke atas.
 * Ubah angka di sini untuk menggeser, memperbesar, atau mewarnai ulang elemen tanpa
 * menyentuh kode pembentuk geometri.
 */

export type XZ = [number, number];

export const PALETTE = {
  red: 0xed1b2f,
  blue: 0x006cb8,
  green: 0xacc42a,
  white: 0xf7f7f4,
  canopyUnderside: 0xf1f0ec,
  column: 0xe9e8e4,
  concrete: 0xe6e6e3,
  concreteSide: 0xd2d0cb,
  platformSide: 0xdcdad5,
  asphalt: 0x6a7079,
  curb: 0xd4d0c8,
  marking: 0xfbfbf8,
  island: 0xe4e1db,
  steel: 0x9aa1a9,
  dark: 0x2b3038,
  rubber: 0x1f2328,
  glass: 0x9cb9cf,
  glassDark: 0x4a5d70,
  grass: 0x9dbb4a,
  leaf: 0x86ad3c,
  leafDark: 0x6f9a32,
  trunk: 0x8a7663,
  car: 0x2f6fb7,
  lightWarm: 0xfff3dc,
  tailLight: 0xd8232f,
} as const;

export const PLATFORM = {
  width: 16,
  depth: 12,
  thickness: 0.5,
  /** Area jalan di tepi depan (z). */
  road: { zMin: 3.6, zMax: 6 },
  /** Bukaan trotoar untuk jalur masuk dan keluar (rentang x). */
  entrance: { xMin: -6.2, xMax: -4.0 },
  exit: { xMin: 4.2, xMax: 6.4 },
  curbDepth: 0.22,
  curbHeight: 0.14,
} as const;

export const CANOPY = {
  center: [0.4, -0.4] as XZ,
  width: 8.4,
  depth: 5.6,
  /** Tinggi sisi bawah kanopi. */
  clearance: 4.2,
  fasciaHeight: 0.8,
  redBand: 0.2,
  stripe: 0.045,
} as const;

export const ISLANDS = {
  /** Posisi z tiap pulau pompa; pulau memanjang searah sumbu x. */
  z: [-1.5, 0.7],
  centerX: 0.4,
  length: 5,
  depth: 0.8,
  height: 0.18,
  /** Posisi x tiang kanopi pada setiap pulau. */
  columnX: [-1.5, 2.3],
  columnSize: 0.34,
} as const;

export const DISPENSER = {
  width: 1,
  height: 1.55,
  depth: 0.5,
  headerHeight: 0.28,
} as const;

/**
 * Bangunan layanan di sisi kiri pelataran. Dibangun menghadap +z lalu diputar
 * sehingga etalase menghadap pelataran (+x) dan tetap terlihat dari kamera awal.
 */
export const BUILDING = {
  center: [-6.3, -0.75] as XZ,
  /** Panjang fasad etalase. */
  width: 3.4,
  depth: 2.7,
  height: 2.6,
  rotationY: Math.PI / 2,
} as const;

export const PYLON = {
  position: [-7.05, 2.75] as XZ,
  /** Rotasi papan agar menghadap kamera awal. */
  rotationY: 0.38,
  poleHeight: 3.2,
  panelWidth: 1.8,
  panelHeight: 2.8,
  panelDepth: 0.3,
} as const;

export const PLANTER = { xMin: -3.3, xMax: 3.3, zMin: 2.95, zMax: 3.42, height: 0.24 } as const;

export const TREES: Array<{ at: XZ; scale: number }> = [
  { at: [5.6, -4.7], scale: 1.05 },
  { at: [7.05, -3.9], scale: 0.85 },
  { at: [6.9, -5.35], scale: 0.95 },
  { at: [-7.2, -3.4], scale: 0.85 },
  { at: [-4.6, -4.9], scale: 0.7 },
  { at: [7.35, 2.6], scale: 0.75 },
];

export const PARKING = { xStart: 0.9, count: 3, bayWidth: 1.6, zMin: -5.8, zMax: -4.1 } as const;

export const CAR = {
  length: 3,
  width: 1.38,
  wheelRadius: 0.27,
  /**
   * Jalur mobil (x, z): datang dari kiri di lajur kiri jalan, masuk lewat bukaan kiri,
   * berhenti di sisi depan dispenser kedua, lalu keluar lewat bukaan kanan.
   */
  path: [
    [-10.5, 4.2],
    [-7.2, 4.2],
    [-5.5, 3.95],
    [-5.0, 3.05],
    [-4.35, 2.2],
    [-3.0, 1.95],
    [0.4, 1.95],
    [3.3, 1.95],
    [4.65, 2.25],
    [5.3, 3.15],
    [5.9, 4.0],
    [7.6, 4.2],
    [10.5, 4.2],
  ] as XZ[],
  /** Titik berhenti: pusat mobil sejajar dispenser di pulau kedua. */
  stopAt: [0.4, 1.95] as XZ,
} as const;

/** Siklus animasi (detik): masuk → berhenti → keluar → jeda. */
export const CYCLE = {
  enter: 6,
  stop: 3.2,
  exit: 5,
  gap: 2.2,
} as const;

export const CAMERA = {
  fov: 30,
  /** Sudut pandang awal: azimut dari sumbu +z ke +x, elevasi dari bidang tanah (derajat). */
  azimuth: 36,
  elevation: 31,
  /** Batas rotasi drag di sekitar sudut awal (derajat). */
  azimuthRange: 38,
  elevationRange: [-8, 14] as [number, number],
  /** Porsi layar (NDC) yang boleh diisi objek. */
  fill: { desktop: [0.94, 0.9], mobile: [0.97, 0.92] } as Record<'desktop' | 'mobile', [number, number]>,
  /** Ruang bawah (px) yang disisihkan untuk tombol kontrol agar tidak menutupi SPBU. */
  bottomInset: 60,
  /** Durasi kembali ke sudut awal (ms). */
  resetDuration: 700,
} as const;
