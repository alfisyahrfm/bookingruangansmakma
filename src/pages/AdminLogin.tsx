import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, Home, AlertCircle } from 'lucide-react';
import { login } from '../store/authStore';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const success = login(username, password);
    setLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pt-16 flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/logo-smak.png"
                alt="Logo SMK-SMAK"
                className="w-20 h-20 object-contain drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Admin Login</h1>
            <p className="text-blue-200 text-sm">Sistem Peminjaman Ruangan</p>
            <p className="text-blue-300 text-xs mt-0.5">SMK-SMAK Makassar</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 flex items-center gap-3 bg-red-500/20 border border-red-400/30 text-red-200 rounded-2xl px-4 py-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all text-sm"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk ke Dashboard Admin
                </>
              )}
            </button>
          </form>

          {/* Back button */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="flex items-center gap-2 mx-auto text-blue-300 hover:text-white text-sm transition-colors font-medium"
            >
              <Home size={15} />
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-blue-400/60 text-xs mt-4">
          🔒 Halaman ini hanya untuk Administrator
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
