import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

function Navbar() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk mengetahui rute saat ini

  // State untuk mengontrol apakah menu mobile terbuka atau tertutup
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  // Fungsi untuk menutup menu mobile saat link diklik
  const handleLinkClick = () => {
    setExpanded(false);
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/dashboard" onClick={handleLinkClick}>
          <img
            src="/logo.png"
            alt="Ingat Kata Logo"
            width="40"
            height="40"
            className="d-inline-block align-text-top me-2"
          />
        </Link>

        {/* Tombol hamburger untuk mobile */}
        <button
          className="navbar-toggler"
          type="button"
          // Menggunakan state untuk mengontrol perilaku
          onClick={() => setExpanded(!expanded)}
          aria-controls="navbarNav"
          aria-expanded={expanded}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu Navigasi */}
        <div
          className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              {/* Tambahkan onClick untuk menutup menu di mobile */}
              <Link className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} to="/dashboard" onClick={handleLinkClick}>
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/settings">
                <i className="bi bi-gear me-1"></i> Settings
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-link nav-link" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;