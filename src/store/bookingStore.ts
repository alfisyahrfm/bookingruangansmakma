import { Booking, BookingStatus } from '../types';
import { supabase } from '../lib/supabase';

const mapBookingFromDb = (item: any): Booking => ({
  id: item.id,
  nama: item.nama,
  kelas_divisi: item.kelas_divisi,
  no_hp: item.no_hp,
  tujuan: item.tujuan,
  tanggal: item.tanggal,
  waktu_mulai: item.waktu_mulai,
  waktu_selesai: item.waktu_selesai,
  rooms: item.rooms || [],
  addons: item.addons || {},
  status: item.status,
  created_at: item.created_at,
  updated_at: item.updated_at,
  approved_at: item.approved_at || undefined,
  rejected_at: item.rejected_at || undefined,
});

export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data booking:', error.message);
    return [];
  }

  return (data || []).map(mapBookingFromDb);
};

export const getBookingsByDate = async (date: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('tanggal', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil data booking berdasarkan tanggal:', error.message);
    return [];
  }

  return (data || []).map(mapBookingFromDb);
};

export const addBooking = async (booking: Booking): Promise<void> => {
  const { error } = await supabase.from('bookings').insert([
    {
      id: booking.id,
      nama: booking.nama,
      kelas_divisi: booking.kelas_divisi,
      no_hp: booking.no_hp,
      tujuan: booking.tujuan,
      tanggal: booking.tanggal,
      waktu_mulai: booking.waktu_mulai,
      waktu_selesai: booking.waktu_selesai,
      rooms: booking.rooms,
      addons: booking.addons,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      approved_at: booking.approved_at || null,
      rejected_at: booking.rejected_at || null,
    },
  ]);

  if (error) {
    console.error('Gagal menyimpan booking:', error.message);
    throw error;
  }
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
): Promise<Booking | null> => {
  const now = new Date().toISOString();

  const updateData = {
    status,
    updated_at: now,
    approved_at: status === 'approved' ? now : null,
    rejected_at: status === 'rejected' ? now : null,
  };

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Gagal update status booking:', error.message);
    return null;
  }

  return mapBookingFromDb(data);
};

export const getRoomStatusForDate = async (
  room: string,
  date: string
): Promise<{ status: 'kosong' | 'pending' | 'approved'; bookings: Booking[] }> => {
  const bookings = (await getBookingsByDate(date)).filter(
    (b) => b.rooms.includes(room) && b.status !== 'rejected'
  );

  if (bookings.length === 0) {
    return { status: 'kosong', bookings: [] };
  }

  const hasApproved = bookings.some((b) => b.status === 'approved');

  if (hasApproved) {
    return { status: 'approved', bookings };
  }

  return { status: 'pending', bookings };
};

export const getRoomStatusesForDate = async (
  rooms: string[],
  date: string
): Promise<{ room: string; status: 'kosong' | 'pending' | 'approved'; bookings: Booking[] }[]> => {
  const bookings = await getBookingsByDate(date);

  return rooms.map((room) => {
    const roomBookings = bookings.filter(
      (b) => b.rooms.includes(room) && b.status !== 'rejected'
    );

    if (roomBookings.length === 0) {
      return { room, status: 'kosong', bookings: [] };
    }

    const hasApproved = roomBookings.some((b) => b.status === 'approved');

    return {
      room,
      status: hasApproved ? 'approved' : 'pending',
      bookings: roomBookings,
    };
  });
};

export const checkConflict = async (
  rooms: string[],
  tanggal: string,
  waktu_mulai: string,
  waktu_selesai: string,
  excludeId?: string
): Promise<string[]> => {
  const bookings = (await getBookingsByDate(tanggal)).filter(
    (b) => b.status === 'approved' && b.id !== excludeId
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