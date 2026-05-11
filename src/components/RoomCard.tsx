import React from 'react';
import { Clock, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Booking } from '../types';

interface RoomCardProps {
  room: string;
  status: 'kosong' | 'pending' | 'approved';
  bookings: Booking[];
  compact?: boolean;
}

const statusConfig = {
  kosong: {
    label: 'Kosong',
    bg: 'bg-gradient-to-br from-emerald-400 to-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle size={16} className="text-green-600" />,
    cardBorder: 'border-green-200',
    dot: 'bg-green-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <AlertCircle size={16} className="text-yellow-600" />,
    cardBorder: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  approved: {
    label: 'Ter-booking',
    bg: 'bg-gradient-to-br from-red-400 to-rose-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle size={16} className="text-red-600" />,
    cardBorder: 'border-red-200',
    dot: 'bg-red-500',
  },
};

const getRoomIcon = (room: string): string => {
  if (room.includes('Aula')) return '🏛️';
  if (room.includes('Rapat')) return '🤝';
  return '🏫';
};

const RoomCard: React.FC<RoomCardProps> = ({ room, status, bookings, compact = false }) => {
  const cfg = statusConfig[status];

  return (
    <div
      className={`bg-white rounded-2xl border-2 ${cfg.cardBorder} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group`}
    >
      {/* Header */}
      <div className={`${cfg.bg} p-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getRoomIcon(room)}</span>
          <span className="font-bold text-white text-sm drop-shadow">{room}</span>
        </div>
        <div className={`flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`} />
          <span className="text-white text-xs font-semibold">{cfg.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className={`${compact ? 'p-2' : 'p-3'}`}>
        {status === 'kosong' ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={14} />
            <span className="text-xs text-gray-500">Ruangan tersedia</span>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking, idx) => (
              <div
                key={booking.id + idx}
                className="bg-gray-50 rounded-xl p-2 border border-gray-100"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Users size={12} className="text-blue-500 flex-shrink-0" />
                  <span className="font-semibold text-gray-800 text-xs truncate">
                    {booking.kelas_divisi}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={12} className="text-purple-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">
                    {booking.waktu_mulai} – {booking.waktu_selesai}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    booking.status === 'approved'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : booking.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {booking.status === 'approved'
                    ? '✓ Approved'
                    : booking.status === 'pending'
                    ? '⏳ Pending'
                    : '✗ Ditolak'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
