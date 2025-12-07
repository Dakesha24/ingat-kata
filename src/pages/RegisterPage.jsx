import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import '../styles/AuthPage.css'; // Import file CSS yang sama

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <img src="/logo.png" alt="Ingat Kata Logo" className="login-logo" />
        <h2 className="login-title">Buat Akun Baru</h2>
        <p className="login-subtitle">Daftar untuk mulai menghafal kosakata</p>

        <form className="login-form" onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              className="form-control"
              placeholder="Password Anda (minimal 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 login-btn" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        {message && <div className="alert alert-info login-message">{message}</div>}

        <p className="mt-4">
          Sudah punya akun? <Link to="/" className="login-link">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;