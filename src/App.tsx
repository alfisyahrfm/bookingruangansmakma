import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { isAuthenticated } from './store/authStore';

type Page = 'dashboard' | 'booking' | 'admin-login' | 'admin-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    setAdminLoggedIn(isAuthenticated());
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'admin-login') {
      if (isAuthenticated()) {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('admin-login');
      }
    } else {
      setCurrentPage(page as Page);
    }
  };

  const handleLoginSuccess = () => {
    setAdminLoggedIn(true);
    setCurrentPage('admin-dashboard');
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setCurrentPage('dashboard');
  };

  // Admin dashboard has its own full layout with its own header
  if (currentPage === 'admin-dashboard' && adminLoggedIn) {
    return (
      <div className="font-sans antialiased">
        <AdminDashboard onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="font-sans antialiased">
      {currentPage !== 'admin-login' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'booking' && <BookingPage />}
      {currentPage === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  );
}

export default App;
