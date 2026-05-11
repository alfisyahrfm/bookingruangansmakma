import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  LogOut, Calendar, Search, Filter, CheckCircle, XCircle,
  Building2, Phone, Target, RefreshCw,
  ChevronLeft, ChevronRight, LayoutDashboard, List,
} from 'lucide-react';
import { ROOMS, Booking, BookingStatus } from '../types';
import {
  getBookings,
  getRoomStatusesForDate,
  updateBookingStatus,
} from '../store/bookingStore';
import { logout } from '../store/authStore';
import {
  buildApprovedMessage, buildRejectedMessage, openWhatsApp, formatTanggal,
} from '../utils/whatsapp';
import RoomCard from '../components/RoomCard';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'bookings';

const ITEMS_PER_PAGE = 10;

const ConfirmModal: React.FC<{
  type: 'approve' | 'reject';
  booking: Booking;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ type, booking, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
        type === 'approve' ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {type === 'approve'
          ? <CheckCircle size={32} className="text-green-600" />
          : <XCircle size={32} className="text-red-600" />}
      </div>
      <h3 className="text-xl font-black text-center text-gray-800 mb-2">
        {type === 'approve' ? 'Setujui Booking?' : 'Tolak Booking?'}
      </h3>
      <p className="text-gray-500 text-sm text-center mb-5">
        {type === 'approve'
          ? 'Status booking akan berubah menjadi Approved dan notifikasi WhatsApp akan dikirim ke pemohon.'
          : 'Status booking akan berubah menjadi Tidak Disetujui dan notifikasi WhatsApp akan dikirim ke pemohon.'}
      </p>
      <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Nama</span>
          <span className="font-semibold text-gray-800">{booking.nama}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Kelas/Divisi</span>
          <span className="font-semibold text-gray-800">{booking.kelas_divisi}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Ruangan</span>
          <span className="font-semibold text-gray-800 text-right max-w-48">{booking.rooms.join(', ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tanggal</span>
          <span className="font-semibold text-gray-800">{formatTanggal(booking.tanggal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Waktu</span>
          <span className="font-semibold text-gray-800">{booking.waktu_mulai} – {booking.waktu_selesai}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all ${
            type === 'approve'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
          } disabled:opacity-70`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          ) : (
            type === 'approve' ? '✓ Ya, Setujui' : '✗ Ya, Tolak'
          )}
        </button>
      </div>
    </div>
  </div>
);

const AddonDisplay: React.FC<{ addons: Record<string, any>; rooms: string[] }> = ({ addons, rooms }) => (
  <div className="space-y-2">
    {rooms.map((room) => {
      const addon = addons[room];
      if (!addon) return <div key={room} className="text-xs text-gray-400">{room}: -</div>;
      const parts: string[] = [];
      if (addon.mic > 0) parts.push(`Mic×${addon.mic}`);
      if (addon.speaker > 0) parts.push(`Speaker×${addon.speaker}`);
      if (addon.bosara > 0) parts.push(`Bosara×${addon.bosara}`);
      if (addon.tv) parts.push('TV');
      if (addon.proyektor) parts.push('Proyektor');
      return (
        <div key={room} className="text-xs">
          <span className="font-semibold text-gray-600">{room}:</span>{' '}
          <span className="text-gray-500">{parts.length > 0 ? parts.join(', ') : 'Tidak ada add-ons'}</span>
        </div>
      );
    })}
  </div>
);

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const cfg = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }[status];
  const label = { pending: '⏳ Pending', approved: '✓ Approved', rejected: '✗ Ditolak' }[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg}`}>
      {label}
    </span>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [tab, setTab] = useState<TabType>('overview');
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomData, setRoomData] = useState<
    { room: string; status: 'kosong' | 'pending' | 'approved'; bookings: Booking[] }[]
  >([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  // Table filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | BookingStatus>('all');
  const [filterDate, setFilterDate] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [confirmModal, setConfirmModal] = useState<{ type: 'approve' | 'reject'; booking: Booking } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    const all = await getBookings();
    setBookings(all);
    setStats({
      pending: all.filter((b) => b.status === 'pending').length,
      approved: all.filter((b) => b.status === 'approved').length,
      rejected: all.filter((b) => b.status === 'rejected').length,
      total: all.length,
    });

    const data = await getRoomStatusesForDate(ROOMS, selectedDate);
    setRoomData(data);
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async () => {
    if (!confirmModal) return;
    setActionLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const updated = await updateBookingStatus(
      confirmModal.booking.id,
      confirmModal.type === 'approve' ? 'approved' : 'rejected'
    );

    setActionLoading(false);
    setConfirmModal(null);

    if (updated) {
      loadData();

      // Open WhatsApp
      const message =
        confirmModal.type === 'approve'
          ? buildApprovedMessage(updated)
          : buildRejectedMessage(updated);
      setTimeout(() => {
        openWhatsApp(updated.no_hp, message);
      }, 300);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Filter bookings for table
  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.nama.toLowerCase().includes(search.toLowerCase()) ||
      b.kelas_divisi.toLowerCase().includes(search.toLowerCase()) ||
      b.no_hp.includes(search) ||
      b.rooms.some((r) => r.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchDate = !filterDate || b.tanggal === filterDate;
    return matchSearch && matchStatus && matchDate;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const roomStats = {
    kosong: roomData.filter((d) => d.status === 'kosong').length,
    pending: roomData.filter((d) => d.status === 'pending').length,
    approved: roomData.filter((d) => d.status === 'approved').length,
  };

  const formattedDate = (() => {
    try {
      return format(new Date(selectedDate + 'T00:00:00'), 'EEEE, dd MMMM yyyy', { locale: id });
    } catch { return selectedDate; }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16">
      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          type={confirmModal.type}
          booking={confirmModal.booking}
          onConfirm={handleAction}
          onCancel={() => setConfirmModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/logo-smak.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">ADMIN PANEL</span>
                </div>
                <h1 className="text-xl font-black text-white">Dashboard Admin</h1>
                <p className="text-blue-300 text-xs">Sistem Peminjaman Ruangan SMK-SMAK Makassar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold border border-white/20 transition-all"
              >
                <RefreshCw size={15} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-xl text-sm font-semibold border border-red-400/30 transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setTab('overview')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'overview'
                  ? 'bg-white text-blue-800 shadow-lg'
                  : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview Ruangan
            </button>
            <button
              onClick={() => setTab('bookings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === 'bookings'
                  ? 'bg-white text-blue-800 shadow-lg'
                  : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <List size={16} />
              Semua Booking
              {stats.pending > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {stats.pending}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total Booking', value: stats.total, color: 'from-blue-500 to-indigo-500', icon: '📋' },
            { label: 'Pending', value: stats.pending, color: 'from-amber-400 to-yellow-500', icon: '⏳' },
            { label: 'Approved', value: stats.approved, color: 'from-emerald-400 to-green-500', icon: '✅' },
            { label: 'Ditolak', value: stats.rejected, color: 'from-red-400 to-rose-500', icon: '❌' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            {/* Date filter */}
            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-4 sm:p-5 mb-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Filter Tanggal
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none text-gray-700 text-sm font-medium bg-blue-50"
                    />
                  </div>
                  <div className="sm:self-end">
                    <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                      <Calendar size={16} />
                      {formattedDate}
                    </div>
                  </div>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>

              {/* Room date stats */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm text-gray-600">Kosong: <strong>{roomStats.kosong}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-gray-600">Pending: <strong>{roomStats.pending}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm text-gray-600">Ter-booking: <strong>{roomStats.approved}</strong></span>
                </div>
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {roomData.map(({ room, status, bookings: rb }) => (
                <RoomCard key={room} room={room} status={status} bookings={rb} />
              ))}
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-4 sm:p-5 mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    <Search size={12} className="inline mr-1" />Cari
                  </label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nama, kelas, no HP, ruangan..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    <Filter size={12} className="inline mr-1" />Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value as any); setPage(1); }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    <Calendar size={12} className="inline mr-1" />Tanggal
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Menampilkan <strong>{filteredBookings.length}</strong> dari <strong>{bookings.length}</strong> booking
                </span>
                {(search || filterStatus !== 'all' || filterDate) && (
                  <button
                    onClick={() => { setSearch(''); setFilterStatus('all'); setFilterDate(''); setPage(1); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Table - Desktop */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                      <th className="text-left px-4 py-4 font-semibold whitespace-nowrap">Pemohon</th>
                      <th className="text-left px-4 py-4 font-semibold">No HP</th>
                      <th className="text-left px-4 py-4 font-semibold">Tujuan</th>
                      <th className="text-left px-4 py-4 font-semibold whitespace-nowrap">Tanggal & Waktu</th>
                      <th className="text-left px-4 py-4 font-semibold">Ruangan & Add-ons</th>
                      <th className="text-left px-4 py-4 font-semibold">Status</th>
                      <th className="text-center px-4 py-4 font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-gray-400">
                          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                          <p className="font-medium">Tidak ada data booking</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedBookings.map((booking, idx) => (
                        <tr
                          key={booking.id}
                          className={`hover:bg-blue-50/50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="font-bold text-gray-800">{booking.nama}</div>
                            <div className="text-xs text-blue-600 font-medium">{booking.kelas_divisi}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-gray-600 text-xs font-mono">{booking.no_hp}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-gray-600 text-xs max-w-32 block truncate" title={booking.tujuan}>
                              {booking.tujuan}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-xs font-semibold text-gray-700">
                              {formatTanggal(booking.tanggal)}
                            </div>
                            <div className="text-xs text-purple-600">
                              {booking.waktu_mulai} – {booking.waktu_selesai}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1 mb-1.5 max-w-48">
                              {booking.rooms.map((r) => (
                                <span key={r} className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">{r}</span>
                              ))}
                            </div>
                            <AddonDisplay addons={booking.addons} rooms={booking.rooms} />
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={booking.status} />
                          </td>
                          <td className="px-4 py-4">
                            {booking.status === 'pending' && (
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => setConfirmModal({ type: 'approve', booking })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm whitespace-nowrap"
                                >
                                  <CheckCircle size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => setConfirmModal({ type: 'reject', booking })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg text-xs font-bold hover:from-red-600 hover:to-rose-600 transition-all shadow-sm whitespace-nowrap"
                                >
                                  <XCircle size={13} /> Tolak
                                </button>
                              </div>
                            )}
                            {booking.status !== 'pending' && (
                              <span className="text-xs text-gray-400 italic">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards - Mobile */}
            <div className="lg:hidden space-y-4">
              {paginatedBookings.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
                  <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Tidak ada data booking</p>
                </div>
              ) : (
                paginatedBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-800 text-base">{booking.nama}</div>
                        <div className="text-xs text-blue-600 font-semibold">{booking.kelas_divisi}</div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={13} className="text-gray-400" />
                        {booking.no_hp}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={13} className="text-gray-400" />
                        {formatTanggal(booking.tanggal)} • {booking.waktu_mulai}–{booking.waktu_selesai}
                      </div>
                      <div className="flex items-start gap-2 text-gray-600">
                        <Target size={13} className="text-gray-400 mt-0.5" />
                        <span className="text-xs">{booking.tujuan}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {booking.rooms.map((r) => (
                          <span key={r} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">{r}</span>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <AddonDisplay addons={booking.addons} rooms={booking.rooms} />
                      </div>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmModal({ type: 'approve', booking })}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => setConfirmModal({ type: 'reject', booking })}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          <XCircle size={16} /> Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 bg-white rounded-2xl shadow-md border border-gray-100 px-5 py-3">
                <span className="text-sm text-gray-500">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                            p === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
