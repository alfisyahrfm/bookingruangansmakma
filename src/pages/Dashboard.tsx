import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ROOMS } from '../types';
import { getRoomStatusesForDate } from '../store/bookingStore';
import RoomCard from '../components/RoomCard';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomData, setRoomData] = useState<
    { room: string; status: 'kosong' | 'pending' | 'approved'; bookings: any[] }[]
  >([]);
  const [stats, setStats] = useState({ kosong: 0, pending: 0, approved: 0 });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
  const data = await getRoomStatusesForDate(ROOMS, selectedDate);

  setRoomData(data);
  setStats({
    kosong: data.filter((d) => d.status === 'kosong').length,
    pending: data.filter((d) => d.status === 'pending').length,
    approved: data.filter((d) => d.status === 'approved').length,
  });
  setLastRefresh(new Date());
};

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const filteredRoomData = roomData.filter((d) =>
    d.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedDate = format(new Date(selectedDate + 'T00:00:00'), 'EEEE, dd MMMM yyyy', {
    locale: id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img
                src="/logo-smak.png"
                alt="Logo SMK-SMAK"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <Building2 size={14} className="text-blue-200" />
                <span className="text-blue-100 text-xs font-medium">by Div. Rumah Tangga</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow-lg leading-tight">
                APLIKASI PEMINJAMAN RUANGAN
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-200 mt-1">
                SMK-SMAK Makassar
              </h2>
              <p className="text-blue-200 text-sm mt-2 max-w-lg">
                Pantau ketersediaan ruangan secara real-time. Pilih tanggal untuk melihat status seluruh ruangan.
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('booking')}
                  className="mt-4 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl shadow-xl hover:bg-blue-50 transition-all text-sm"
                >
                  📅 Booking Ruangan Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 -mt-6">
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <CheckCircle size={20} className="text-white sm:hidden" />
              <CheckCircle size={24} className="text-white hidden sm:block" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-800">{stats.kosong}</div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Kosong</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-100 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertCircle size={20} className="text-white sm:hidden" />
              <AlertCircle size={24} className="text-white hidden sm:block" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-800">{stats.pending}</div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Pending</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Clock size={20} className="text-white sm:hidden" />
              <Clock size={24} className="text-white hidden sm:block" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-800">{stats.approved}</div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Ter-booking</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              {/* Date Picker */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Calendar size={14} />
                  Pilih Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none text-gray-700 font-medium text-sm bg-blue-50 focus:bg-white transition-all"
                />
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  <Search size={14} />
                  Cari Ruangan
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama ruangan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">{formattedDate}</span>
            </div>
            <div className="text-xs text-gray-400">
              Terakhir diperbarui: {format(lastRefresh, 'HH:mm:ss')}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Kosong
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Pending
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Ter-booking
              </span>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        {filteredRoomData.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Tidak ada ruangan ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredRoomData.map(({ room, status, bookings }) => (
              <RoomCard key={room} room={room} status={status} bookings={bookings} />
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 text-center text-xs text-gray-400 pb-6">
          <p>Data diperbarui secara real-time. Refresh halaman atau klik tombol Refresh untuk memperbarui status ruangan.</p>
          <p className="mt-1">© 2025 SMK-SMAK Makassar — Div. Rumah Tangga</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
