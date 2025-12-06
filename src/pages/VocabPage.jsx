import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function VocabPage() {
  const { session } = useAuth();
  const [vocabList, setVocabList] = useState([]);
  const [newEnglishWord, setNewEnglishWord] = useState('');
  const [newIndonesianMeaning, setNewIndonesianMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // --- State untuk fitur EDIT ---
  const [editingId, setEditingId] = useState(null);
  const [editEnglishWord, setEditEnglishWord] = useState('');
  const [editIndonesianMeaning, setEditIndonesianMeaning] = useState('');

  const fetchVocab = async () => {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vocab:', error);
    } else {
      setVocabList(data);
    }
  };

  useEffect(() => {
    if (session) {
      fetchVocab();
    }
  }, [session]);

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newEnglishWord || !newIndonesianMeaning) {
      setMessage('Kedua kolom harus diisi.');
      return;
    }
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('vocabulary').insert([
      {
        user_id: session.user.id,
        english_word: newEnglishWord,
        indonesian_meaning: newIndonesianMeaning,
      },
    ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Kata berhasil ditambahkan!');
      setNewEnglishWord('');
      setNewIndonesianMeaning('');
      fetchVocab();
    }
    setLoading(false);
  };

  // --- FUNGSI HAPUS ---
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus kata ini?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('vocabulary').delete().eq('id', id);
    if (error) {
      console.error('Error deleting vocab:', error);
      alert('Gagal menghapus kata.');
    } else {
      fetchVocab(); // Refresh list
    }
  };

  // --- FUNGSI EDIT ---
  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditEnglishWord(item.english_word);
    setEditIndonesianMeaning(item.indonesian_meaning);
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from('vocabulary')
      .update({
        english_word: editEnglishWord,
        indonesian_meaning: editIndonesianMeaning,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating vocab:', error);
      alert('Gagal memperbarui kata.');
    } else {
      setEditingId(null); // Keluar dari mode edit
      fetchVocab(); // Refresh list
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="container mt-5">
      {/* ... (Bagian form tambah kata tidak berubah) ... */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Daftar Kosakata Saya</h2>
        <Link to="/quiz" className="btn btn-success">
          Mulai Kuis
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Tambah Kata Baru</h5>
          <form onSubmit={handleAddWord}>
            <div className="row g-3">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kata dalam Bahasa Inggris"
                  value={newEnglishWord}
                  onChange={(e) => setNewEnglishWord(e.target.value)}
                />
              </div>
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Arti dalam Bahasa Indonesia"
                  value={newIndonesianMeaning}
                  onChange={(e) => setNewIndonesianMeaning(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Menambah...' : 'Tambah'}
                </button>
              </div>
            </div>
          </form>
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>

      {/* --- TABEL DENGAN FITUR EDIT/HAPUS --- */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Kosakata Anda ({vocabList.length})</h5>
          {vocabList.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Bahasa Inggris</th>
                  <th>Bahasa Indonesia</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {vocabList.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editEnglishWord}
                          onChange={(e) => setEditEnglishWord(e.target.value)}
                        />
                      ) : (
                        item.english_word
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editIndonesianMeaning}
                          onChange={(e) => setEditIndonesianMeaning(e.target.value)}
                        />
                      ) : (
                        item.indonesian_meaning
                      )}
                    </td>
                    <td>
                      {editingId === item.id ? (
                        <>
                          <button className="btn btn-sm btn-success me-1" onClick={() => handleUpdate(item.id)}>
                            Simpan
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(item)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                            Hapus
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Belum ada kosakata. Tambahkan kata baru untuk memulai!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VocabPage;