import { Booking } from '../types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
};

export const formatTanggal = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy', { locale: id });
  } catch {
    return dateStr;
  }
};

export const buildApprovedMessage = (booking: Booking): string => {
  const roomsList = booking.rooms.join(', ');
  const tanggal = formatTanggal(booking.tanggal);

  return `Halo ${booking.nama},

Pengajuan peminjaman ruangan Anda telah *DISETUJUI* ✅

*Detail peminjaman:*

• Nama: ${booking.nama}
• Kelas/Divisi: ${booking.kelas_divisi}
• Ruangan: ${roomsList}
• Tanggal: ${tanggal}
• Waktu: ${booking.waktu_mulai} - ${booking.waktu_selesai}
• Tujuan: ${booking.tujuan}

Silakan menggunakan ruangan sesuai jadwal yang telah disetujui.

Terima kasih.
_Admin Peminjaman Ruangan SMK-SMAK Makassar_`;
};

export const buildRejectedMessage = (booking: Booking): string => {
  const roomsList = booking.rooms.join(', ');
  const tanggal = formatTanggal(booking.tanggal);

  return `Halo ${booking.nama},

Mohon maaf, pengajuan peminjaman ruangan Anda *TIDAK DISETUJUI* ❌

*Detail pengajuan:*

• Nama: ${booking.nama}
• Kelas/Divisi: ${booking.kelas_divisi}
• Ruangan: ${roomsList}
• Tanggal: ${tanggal}
• Waktu: ${booking.waktu_mulai} - ${booking.waktu_selesai}
• Tujuan: ${booking.tujuan}

Silakan menghubungi admin jika membutuhkan informasi lebih lanjut.

Terima kasih.
_Admin Peminjaman Ruangan SMK-SMAK Makassar_`;
};

export const openWhatsApp = (phone: string, message: string): void => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(url, '_blank');
};
