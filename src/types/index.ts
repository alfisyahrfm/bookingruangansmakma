export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface RoomAddon {
  mic: number;
  speaker: number;
  bosara: number;
  tv: boolean;
  proyektor: boolean;
}

export interface Booking {
  id: string;
  nama: string;
  kelas_divisi: string;
  no_hp: string;
  tujuan: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  rooms: string[];
  addons: Record<string, RoomAddon>;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_at?: string;
}

export const ROOMS = [
  'Kelas A', 'Kelas B', 'Kelas C', 'Kelas D', 'Kelas E',
  'Kelas F', 'Kelas G', 'Kelas H', 'Kelas I', 'Kelas J',
  'Kelas K', 'Kelas L', 'Kelas M', 'Kelas N', 'Kelas O',
  'Kelas P', 'Kelas Q', 'Kelas R', 'Kelas S', 'Kelas T',
  'Ruang Rapat', 'Aula Utama', 'Aula 1', 'Aula 2', 'Aula 3',
];
