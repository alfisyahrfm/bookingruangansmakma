import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  User, Phone, Target, Calendar, Clock, Building2,
  Plus, Minus, CheckSquare, Square, Send, AlertTriangle,
  CheckCircle, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { ROOMS, RoomAddon } from '../types';
import { addBooking, checkConflict } from '../store/bookingStore';
import { v4 as uuidv4 } from 'uuid';

const defaultAddon = (): RoomAddon => ({
  mic: 0, speaker: 0, bosara: 0, tv: false, proyektor: false,
});

const BookingPage: React.FC = () => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const [form, setForm] = useState({
    nama: '',
    kelas_divisi: '',
    no_hp: '',
    tujuan: '',
    tanggal: today,
    waktu_mulai: '08:00',
    waktu_selesai: '10:00',
  });

  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [addons, setAddons] = useState<Record<string, RoomAddon>>({});
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');

  const filteredRooms = ROOMS.filter((r) =>
    r.toLowerCase().includes(roomSearch.toLowerCase())
  );

  const toggleRoom = (room: string) => {
    setSelectedRooms((prev) => {
      if (prev.includes(room)) {
        const newRooms = prev.filter((r) => r !== room);
        const newAddons = { ...addons };
        delete newAddons[room];
        setAddons(newAddons);
        return newRooms;
      } else {
        setAddons((a) => ({ ...a, [room]: defaultAddon() }));
        return [...prev, room];
      }
    });
  };

  const updateAddon = (room: string, field: keyof RoomAddon, value: number | boolean) => {
    setAddons((a) => ({
      ...a,
      [room]: { ...a[room], [field]: value },
    }));
  };

  const incrementAddon = (room: string, field: 'mic' | 'speaker' | 'bosara') => {
    setAddons((a) => ({
      ...a,
      [room]: { ...a[room], [field]: (a[room][field] as number) + 1 },
    }));
  };

  const decrementAddon = (room: string, field: 'mic' | 'speaker' | 'bosara') => {
    setAddons((a) => ({
      ...a,
      [room]: {
        ...a[room],
        [field]: Math.max(0, (a[room][field] as number) - 1),
      },
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.nama.trim()) errs.nama = 'Nama wajib diisi';
    if (!form.kelas_divisi.trim()) errs.kelas_divisi = 'Kelas/Divisi wajib diisi';
    if (!form.no_hp.trim()) {
      errs.no_hp = 'No HP wajib diisi';
    } else if (!/^[0-9+\s-]+$/.test(form.no_hp)) {
      errs.no_hp = 'No HP hanya boleh berisi angka dan simbol + - (spasi)';
    }
    if (!form.tujuan.trim()) errs.tujuan = 'Tujuan wajib diisi';
    if (!form.tanggal) errs.tanggal = 'Tanggal wajib diisi';
    if (!form.waktu_mulai) errs.waktu_mulai = 'Waktu mulai wajib diisi';
    if (!form.waktu_selesai) errs.waktu_selesai = 'Waktu selesai wajib diisi';

    if (form.waktu_mulai && form.waktu_selesai) {
      const [sh, sm] = form.waktu_mulai.split(':').map(Number);
      const [eh, em] = form.waktu_selesai.split(':').map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        errs.waktu_selesai = 'Waktu selesai harus lebih besar dari waktu mulai';
      }
    }

    if (selectedRooms.length === 0) errs.rooms = 'Pilih minimal satu ruangan';

    if (selectedRooms.length > 0 && form.tanggal && form.waktu_mulai && form.waktu_selesai) {
      const conflicts = checkConflict(selectedRooms, form.tanggal, form.waktu_mulai, form.waktu_selesai);
      if (conflicts.length > 0) {
        errs.rooms = `Ruangan berikut sudah ter-booking pada waktu yang dipilih: ${conflicts.join(', ')}`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const booking = {
      id: uuidv4(),
      ...form,
      rooms: selectedRooms,
      addons,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addBooking(booking);
    setSubmitting(false);
    setSuccess(true);

    // Reset form
    setForm({
      nama: '', kelas_divisi: '', no_hp: '', tujuan: '',
      tanggal: today, waktu_mulai: '08:00', waktu_selesai: '10:00',
    });
    setSelectedRooms([]);
    setAddons({});
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-green-100">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-3">Pengajuan Berhasil!</h2>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
            <p className="text-green-800 text-sm leading-relaxed font-medium">
              Pengajuan peminjaman ruangan berhasil dikirim. Silakan cek dashboard secara berkala
              untuk melihat status pengajuan Anda, apakah sudah disetujui atau tidak disetujui
              oleh admin.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Buat Booking Lain
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-6 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
            <Calendar size={14} className="text-blue-200" />
            <span className="text-blue-100 text-xs font-medium">Form Peminjaman Ruangan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Booking Ruangan</h1>
          <p className="text-blue-200 mt-2 text-sm">
            SMK-SMAK Makassar — Isi form di bawah untuk mengajukan peminjaman ruangan
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <User size={18} />
                Informasi Pemohon
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 ${
                      errors.nama ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none text-gray-700 text-sm transition-all`}
                  />
                </div>
                {errors.nama && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.nama}</p>}
              </div>

              {/* Kelas/Divisi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kelas / Divisi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: XA / Persama / Keu"
                  value={form.kelas_divisi}
                  onChange={(e) => setForm({ ...form, kelas_divisi: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.kelas_divisi ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none text-gray-700 text-sm transition-all`}
                />
                {errors.kelas_divisi && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.kelas_divisi}</p>}
              </div>

              {/* No HP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  No HP / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="contoh: 0812-3456-7890"
                    value={form.no_hp}
                    onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 ${
                      errors.no_hp ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none text-gray-700 text-sm transition-all`}
                  />
                </div>
                {errors.no_hp && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.no_hp}</p>}
              </div>

              {/* Tujuan */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tujuan Pemakaian Ruangan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Target size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    rows={3}
                    placeholder="Jelaskan tujuan pemakaian ruangan..."
                    value={form.tujuan}
                    onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 ${
                      errors.tujuan ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none text-gray-700 text-sm transition-all resize-none`}
                  />
                </div>
                {errors.tujuan && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{errors.tujuan}</p>}
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-2xl shadow-md border border-purple-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Clock size={18} />
                Jadwal Pemakaian
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={form.tanggal}
                    min={today}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 ${
                      errors.tanggal ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none text-gray-700 text-sm transition-all`}
                  />
                </div>
                {errors.tanggal && <p className="mt-1 text-xs text-red-500"><AlertTriangle size={12} className="inline" /> {errors.tanggal}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Waktu Mulai <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={form.waktu_mulai}
                    onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 ${
                      errors.waktu_mulai ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none text-gray-700 text-sm transition-all`}
                  />
                </div>
                {errors.waktu_mulai && <p className="mt-1 text-xs text-red-500"><AlertTriangle size={12} className="inline" /> {errors.waktu_mulai}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Waktu Selesai <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={form.waktu_selesai}
                    onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })}
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 ${
                      errors.waktu_selesai ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none text-gray-700 text-sm transition-all`}
                  />
                </div>
                {errors.waktu_selesai && <p className="mt-1 text-xs text-red-500"><AlertTriangle size={12} className="inline" /> {errors.waktu_selesai}</p>}
              </div>
            </div>
          </div>

          {/* Room Selection Card */}
          <div className="bg-white rounded-2xl shadow-md border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Building2 size={18} />
                Pilih Ruangan
                {selectedRooms.length > 0 && (
                  <span className="ml-auto bg-white/30 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {selectedRooms.length} dipilih
                  </span>
                )}
              </h3>
            </div>
            <div className="p-6">
              {/* Selected rooms chips */}
              {selectedRooms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRooms.map((room) => (
                    <div key={room} className="flex items-center gap-1.5 bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-teal-200">
                      {room}
                      <button type="button" onClick={() => toggleRoom(room)} className="hover:text-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search rooms */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Cari nama ruangan..."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredRooms.map((room) => {
                  const isSelected = selectedRooms.includes(room);
                  return (
                    <button
                      type="button"
                      key={room}
                      onClick={() => toggleRoom(room)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-teal-400 hover:bg-teal-50'
                      }`}
                    >
                      {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                      {room}
                    </button>
                  );
                })}
              </div>
              {errors.rooms && (
                <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">{errors.rooms}</p>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons per room */}
          {selectedRooms.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  ⚡ Add-ons per Ruangan
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {selectedRooms.map((room) => (
                  <div key={room} className="border-2 border-orange-100 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-orange-50 hover:bg-orange-100 transition-colors"
                      onClick={() =>
                        setExpandedAddons((p) => ({ ...p, [room]: !p[room] }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{room.includes('Aula') ? '🏛️' : room.includes('Rapat') ? '🤝' : '🏫'}</span>
                        <span className="font-bold text-orange-800 text-sm">{room}</span>
                      </div>
                      {expandedAddons[room] ? (
                        <ChevronUp size={18} className="text-orange-600" />
                      ) : (
                        <ChevronDown size={18} className="text-orange-600" />
                      )}
                    </button>
                    {(expandedAddons[room] !== false) && (
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Mic */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🎤</span>
                            <span className="text-sm font-semibold text-gray-700">Mic</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => decrementAddon(room, 'mic')}
                              className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-800">
                              {addons[room]?.mic ?? 0}
                            </span>
                            <button type="button" onClick={() => incrementAddon(room, 'mic')}
                              className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Speaker */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔊</span>
                            <span className="text-sm font-semibold text-gray-700">Speaker</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => decrementAddon(room, 'speaker')}
                              className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-800">
                              {addons[room]?.speaker ?? 0}
                            </span>
                            <button type="button" onClick={() => incrementAddon(room, 'speaker')}
                              className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Bosara */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🍽️</span>
                            <span className="text-sm font-semibold text-gray-700">Bosara</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => decrementAddon(room, 'bosara')}
                              className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-800">
                              {addons[room]?.bosara ?? 0}
                            </span>
                            <button type="button" onClick={() => incrementAddon(room, 'bosara')}
                              className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* TV */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📺</span>
                            <span className="text-sm font-semibold text-gray-700">TV</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateAddon(room, 'tv', !addons[room]?.tv)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              addons[room]?.tv ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              addons[room]?.tv ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>

                        {/* Proyektor */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📽️</span>
                            <span className="text-sm font-semibold text-gray-700">Proyektor</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateAddon(room, 'proyektor', !addons[room]?.proyektor)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              addons[room]?.proyektor ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              addons[room]?.proyektor ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-blue-300 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Kirim Pengajuan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
