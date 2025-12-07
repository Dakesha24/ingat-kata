// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SettingsPage() {
  const { session } = useAuth();
  const [maxScore, setMaxScore] = useState(20);
  const [timerDuration, setTimerDuration] = useState(120); // dalam detik
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fungsi untuk mengambil data pengaturan
  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('timer_duration') // SUDAH DIPERBAIKI
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      setMessage('Gagal memuat pengaturan.');
    } else {
      // Hapus bagian yang mengatur maxScore
      // if (data) {
      //   setMaxScore(data.max_score);
      // }
      if (data) {
        setTimerDuration(data.timer_duration);
      }
    }
  };

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  // Fungsi untuk memperbarui pengaturan
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('settings')
      .update({
        max_score: maxScore,
        timer_duration: timerDuration,
      })
      .eq('id', 1); // Pastikan kita mengupdate baris yang benar

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Pengaturan berhasil diperbarui!');
    }

    setLoading(false);
  };

  return (
    // UI/UX Improvement: Wrapper untuk memberikan background dan padding
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="card-title mb-0">
                    <i className="bi bi-gear me-2"></i>Pengaturan Kuis
                  </h2>
                  <Link to="/dashboard" className="btn btn-secondary">
                    &larr; Kembali
                  </Link>
                </div>

                <form onSubmit={handleUpdateSettings}>
                  <div className="mb-3">
                    <label htmlFor="timerDuration" className="form-label">Durasi Timer per Soal (detik)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="timerDuration"
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(Number(e.target.value))}
                      min="5"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </form>

                {message && <div className="alert alert-info mt-3">{message}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;