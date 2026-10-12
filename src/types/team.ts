export type TeamId =
  | 'strategy'
  | 'benchmarking'
  | 'customer'
  | 'business'
  | 'financial'
  | 'stakeholder';

export type Accent = 'red' | 'blue' | 'green';

export interface Workgroup {
  id: TeamId;
  name: string;
  accent: Accent;
}

export interface Member {
  id: string;
  name: string;
  /** Asal BUMN atau unit kerja. */
  company: string;
  /** Peran dalam ALP. */
  role: string;
  teamId: TeamId;
  /** Ringkasan kontribusi utama, satu kalimat (tampil di kartu). */
  summary: string;
  /** Path foto di /public, mis. "/photos/anggota-01.jpg". Kosong atau gagal dimuat → inisial. */
  photo: string;
  bio: string;
  skills: string[];
  learningGoal: string;
  /** Opsional. Isi hanya bila tersedia dan disetujui pemiliknya. */
  linkedinUrl?: string;
  /** Opsional. Isi hanya bila tersedia dan disetujui pemiliknya. */
  cvUrl?: string;
}

export interface Mentor {
  id: string;
  name: string;
  type: 'mentor' | 'asisten';
  /** Institusi atau jabatan, jika tersedia. */
  institution?: string;
  /** Bidang pendampingan atau dukungan. */
  description: string;
  photo: string;
}
