import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Dapatkan sesi awal saat aplikasi dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Dengarkan perubahan status autentikasi (login, logout, dll)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Bersihkan listener saat komponen tidak lagi digunakan
    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook untuk memudahkan penggunaan context
export function useAuth() {
  return useContext(AuthContext);
}