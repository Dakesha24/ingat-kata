// src/pages/ProjectVocabPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProjectVocabPage() {
  const { session } = useAuth();
  const { projectId } = useParams(); // Mendapatkan projectId dari URL
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [vocabList, setVocabList] = useState([]);
  const [newEnglishWord, setNewEnglishWord] = useState('');
  const [newIndonesianMeaning, setNewIndonesianMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State untuk fitur EDIT
  const [editingId, setEditingId] = useState(null);
  const [editEnglishWord, setEditEnglishWord] = useState('');
  const [editIndonesianMeaning, setEditIndonesianMeaning] = useState('');

  // Fungsi untuk mengambil data projek dan kosakatanya
  const fetchProjectAndVocab = async () => {
    // 1. Ambil nama projek
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('project_name')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      navigate('/dashboard'); // Arahkan kembali jika projek tidak ditemukan
      return;
    }
    setProjectName(projectData.project_name);

    // 2. Ambil kosakata untuk projek ini
    const { data: vocabData, error: vocabError } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('project_id', projectId) // Filter berdasarkan project_id
      .order('created_at', { ascending: false });

    if (vocabError) {
      console.error('Error fetching vocab:', vocabError);
    } else {
      setVocabList(vocabData);
    }
  };

  useEffect(() => {
    if (session && projectId) {
      fetchProjectAndVocab();
    }
  }, [session, projectId]);

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
        project_id: projectId, // Sertakan project_id
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
      fetchProjectAndVocab();
    }
    setLoading(false);
  };
  
  // Fungsi Edit dan Hapus tidak berubah, tetap berfungsi dengan baik
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus kata ini?');
    if (!confirmDelete) return;
    const { error } = await supabase.from('vocabulary').delete().eq('id', id);
    if (error) {
      console.error('Error deleting vocab:', error);
      alert('Gagal menghapus kata.');
    } else {
      fetchProjectAndVocab();
    }
  };

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
      setEditingId(null);
      fetchProjectAndVocab();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kosakata: {projectName}</h2>
        <Link to="/dashboard" className="btn btn-secondary">
          &larr; Kembali ke Dashboard
        </Link>
      </div>

      {/* Form dan Tabel tidak berubah, hanya diisi oleh data yang sudah difilter */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Tambah Kata Baru</h5>
          <form onSubmit={handleAddWord}>
            {/* ... (form input sama seperti sebelumnya) ... */}
            <div className="row g-3">
              <div className="col-md-5">
                <input type="text" className="form-control" placeholder="Kata dalam Bahasa Inggris" value={newEnglishWord} onChange={(e) => setNewEnglishWord(e.target.value)} />
              </div>
              <div className="col-md-5">
                <input type="text" className="form-control" placeholder="Arti dalam Bahasa Indonesia" value={newIndonesianMeaning} onChange={(e) => setNewIndonesianMeaning(e.target.value)} />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Menambah...' : 'Tambah'}</button>
              </div>
            </div>
          </form>
          {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Daftar Kata ({vocabList.length})</h5>
          <Link to={`/project/${projectId}/quiz`} className="btn btn-success mb-3">Mulai Kuis untuk Projek Ini</Link>
          {vocabList.length > 0 ? (
            <table className="table table-striped">
              <thead><tr><th>No</th><th>Bahasa Inggris</th><th>Bahasa Indonesia</th><th>Aksi</th></tr></thead>
              <tbody>
                {vocabList.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{editingId === item.id ? <input type="text" className="form-control" value={editEnglishWord} onChange={(e) => setEditEnglishWord(e.target.value)} /> : item.english_word}</td>
                    <td>{editingId === item.id ? <input type="text" className="form-control" value={editIndonesianMeaning} onChange={(e) => setEditIndonesianMeaning(e.target.value)} /> : item.indonesian_meaning}</td>
                    <td>{editingId === item.id ? (<><button className="btn btn-sm btn-success me-1" onClick={() => handleUpdate(item.id)}>Simpan</button><button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>Batal</button></>) : (<><button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(item)}>Edit</button><button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button></>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<p>Belum ada kosakata di projek ini. Tambahkan kata baru untuk memulai!</p>)}
        </div>
      </div>
    </div>
  );
}

export default ProjectVocabPage;