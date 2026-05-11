import React, { useState } from 'react';
import { Menu, X, LogIn, LayoutDashboard, CalendarPlus } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'booking', label: 'Booking Ruangan', icon: <CalendarPlus size={18} /> },
    { id: 'admin-login', label: 'Admin Login', icon: <LogIn size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="relative">
              <img
                src="/logo-smak.png"
                alt="Logo SMK-SMAK Makassar"
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-blue-800 leading-tight">SMK-SMAK</div>
              <div className="text-xs text-blue-600 leading-tight">Makassar</div>
            </div>
            <div className="hidden lg:block h-8 w-px bg-blue-200 mx-1" />
            <div className="hidden lg:block">
              <div className="text-xs font-semibold text-gray-600 leading-tight">Sistem Peminjaman</div>
              <div className="text-xs text-gray-500 leading-tight">Ruangan</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : item.id === 'admin-login'
                    ? 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-blue-100 shadow-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
