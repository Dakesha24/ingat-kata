// src/pages/ProjectVocabPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProjectVocabPage() {
  const { session } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [vocabList, setVocabList] = useState([]);
  const [newEnglishWords, setNewEnglishWords] = useState('');
  const [newIndonesianMeanings, setNewIndonesianMeanings] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State untuk fitur EDIT
  const [editingId, setEditingId] = useState(null);
  const [editEnglishWords, setEditEnglishWords] = useState('');
  const [editIndonesianMeanings, setEditIndonesianMeanings] = useState('');

  // Fungsi untuk mengambil data projek dan kosakatanya (tidak berubah)
  const fetchProjectAndVocab = async () => {
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('project_name')
      .eq('id', projectId)
      .single();
    if (projectError) { console.error('Error fetching project:', projectError); navigate('/dashboard'); return; }
    setProjectName(projectData.project_name);

    const { data: vocabData, error: vocabError } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (vocabError) { console.error('Error fetching vocab:', vocabError); } else { setVocabList(vocabData); }
  };

  useEffect(() => { if (session && projectId) { fetchProjectAndVocab(); } }, [session, projectId]);

  // --- FUNGSI TAMBAH KATA (SUDAH DIPERBAIKI) ---
  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newEnglishWords.trim() || !newIndonesianMeanings.trim()) {
      setMessage('Kedua kolom harus diisi.');
      return;
    }
    setLoading(true);
    setMessage('');

    // Ubah string menjadi array, lalu bersihkan dari spasi berlebih
    const englishArray = newEnglishWords.split(',').map(word => word.trim()).filter(word => word);
    const indonesianArray = newIndonesianMeanings.split(',').map(meaning => meaning.trim()).filter(meaning => meaning);

    const { error } = await supabase.from('vocabulary').insert([
      {
        user_id: session.user.id,
        project_id: projectId,
        english_word: englishArray, // Simpan sebagai array
        indonesian_meaning: indonesianArray, // Simpan sebagai array
      },
    ]);

    if (error) { setMessage('Error: ' + error.message); } else {
      setMessage('Kata berhasil ditambahkan!');
      setNewEnglishWords('');
      setNewIndonesianMeanings('');
      fetchProjectAndVocab();
    }
    setLoading(false);
  };
  
  // --- FUNGSI HAPUS (tidak berubah) ---
  const handleDelete = async (id) => { /* ... kode sama seperti sebelumnya ... */ };
  
  // --- FUNGSI EDIT (SUDAH DIPERBAIKI) ---
  const handleEdit = (item) => {
    setEditingId(item.id);
    // Ubah array menjadi string untuk ditampilkan di input
    setEditEnglishWords(item.english_word.join(', '));
    setEditIndonesianMeanings(item.indonesian_meaning.join(', '));
  };

  // --- FUNGSI UPDATE (SUDAH DIPERBAIKI) ---
  const handleUpdate = async (id) => {
    const englishArray = editEnglishWords.split(',').map(word => word.trim()).filter(word => word);
    const indonesianArray = editIndonesianMeanings.split(',').map(meaning => meaning.trim()).filter(meaning => meaning);
    
    const { error } = await supabase
      .from('vocabulary')
      .update({
        english_word: englishArray, // Update sebagai array
        indonesian_meaning: indonesianArray, // Update sebagai array
      })
      .eq('id', id);
    if (error) { console.error('Error updating vocab:', error); alert('Gagal memperbarui kata.'); } else {
      setEditingId(null);
      fetchProjectAndVocab();
    }
  };

  const handleCancelEdit = () => { setEditingId(null); };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kosakata: {projectName}</h2>
        <Link to="/dashboard" className="btn btn-secondary">&larr; Kembali ke Dashboard</Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Tambah Kata Baru</h5>
          <p className="text-muted">Pisahkan beberapa kata dengan koma (misal: book, volume).</p>
          <form onSubmit={handleAddWord}>
            <div className="row g-3">
              <div className="col-md-5">
                <input type="text" className="form-control" placeholder="Kata dalam Bahasa Inggris" value={newEnglishWords} onChange={(e) => setNewEnglishWords(e.target.value)} />
              </div>
              <div className="col-md-5">
                <input type="text" className="form-control" placeholder="Arti dalam Bahasa Indonesia" value={newIndonesianMeanings} onChange={(e) => setNewIndonesianMeanings(e.target.value)} />
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
                    <td>{editingId === item.id ? <input type="text" className="form-control" value={editEnglishWords} onChange={(e) => setEditEnglishWords(e.target.value)} /> : item.english_word.join(', ')}</td>
                    <td>{editingId === item.id ? <input type="text" className="form-control" value={editIndonesianMeanings} onChange={(e) => setEditIndonesianMeanings(e.target.value)} /> : item.indonesian_meaning.join(', ')}</td>
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