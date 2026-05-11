import { Booking, BookingStatus } from '../types';

const STORAGE_KEY = 'smak_makassar_bookings';
const SEEDED_KEY = 'smak_makassar_seeded_v1';

const seedDemoData = () => {
  if (localStorage.getItem(SEEDED_KEY)) return;
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const demoBookings: Booking[] = [
    {
      id: 'demo-1',
      nama: 'Budi Santoso',
      kelas_divisi: 'XI Analis 1',
      no_hp: '082345678901',
      tujuan: 'Praktikum Kimia Analitik',
      tanggal: today,
      waktu_mulai: '08:00',
      waktu_selesai: '10:00',
      rooms: ['Kelas A'],
      addons: { 'Kelas A': { mic: 1, speaker: 0, bosara: 0, tv: false, proyektor: true } },
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      nama: 'Siti Rahayu',
      kelas_divisi: 'XII Kimia Industri 2',
      no_hp: '081234567890',
      tujuan: 'Seminar Kelas XII',
      tanggal: today,
      waktu_mulai: '13:00',
      waktu_selesai: '15:30',
      rooms: ['Aula Utama'],
      addons: { 'Aula Utama': { mic: 4, speaker: 2, bosara: 20, tv: true, proyektor: true } },
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      nama: 'Ahmad Fauzi',
      kelas_divisi: 'X Analis 3',
      no_hp: '085678901234',
      tujuan: 'Rapat OSIS',
      tanggal: tomorrow,
      waktu_mulai: '09:00',
      waktu_selesai: '11:00',
      rooms: ['Ruang Rapat'],
      addons: { 'Ruang Rapat': { mic: 2, speaker: 1, bosara: 0, tv: true, proyektor: false } },
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoBookings));
  localStorage.setItem(SEEDED_KEY, 'true');
};

export const getBookings = (): Booking[] => {
  try {
    seedDemoData();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveBookings = (bookings: Booking[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const addBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
};

export const updateBookingStatus = (
  id: string,
  status: BookingStatus
): Booking | null => {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  bookings[idx] = {
    ...bookings[idx],
    status,
    updated_at: now,
    ...(status === 'approved' ? { approved_at: now } : {}),
    ...(status === 'rejected' ? { rejected_at: now } : {}),
  };
  saveBookings(bookings);
  return bookings[idx];
};

export const getBookingsByDate = (date: string): Booking[] => {
  return getBookings().filter((b) => b.tanggal === date);
};

export const getRoomStatusForDate = (
  room: string,
  date: string
): { status: 'kosong' | 'pending' | 'approved'; bookings: Booking[] } => {
  const bookings = getBookings().filter(
    (b) => b.tanggal === date && b.rooms.includes(room) && b.status !== 'rejected'
  );
  if (bookings.length === 0) return { status: 'kosong', bookings: [] };
  const hasApproved = bookings.some((b) => b.status === 'approved');
  if (hasApproved) return { status: 'approved', bookings };
  return { status: 'pending', bookings };
};

export const checkConflict = (
  rooms: string[],
  tanggal: string,
  waktu_mulai: string,
  waktu_selesai: string,
  excludeId?: string
): string[] => {
  const bookings = getBookings().filter(
    (b) =>
      b.tanggal === tanggal &&
      b.status === 'approved' &&
      b.id !== excludeId
  );

  const conflictRooms: string[] = [];

  for (const room of rooms) {
    for (const b of bookings) {
      if (!b.rooms.includes(room)) continue;
      const newStart = timeToMinutes(waktu_mulai);
      const newEnd = timeToMinutes(waktu_selesai);
      const bStart = timeToMinutes(b.waktu_mulai);
      const bEnd = timeToMinutes(b.waktu_selesai);

      if (newStart < bEnd && newEnd > bStart) {
        conflictRooms.push(room);
        break;
      }
    }
  }

  return conflictRooms;
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
