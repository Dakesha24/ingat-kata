import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  if (!session) {
    // Jika tidak ada sesi (pengguna belum login), arahkan ke halaman login
    return <Navigate to="/" />;
  }

  // Jika ada sesi, tampilkan halaman yang diminta
  return children;
}

export default ProtectedRoute;