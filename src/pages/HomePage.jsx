// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { session } = useAuth();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State untuk fitur EDIT PROJEK
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('projects').insert([
      {
        user_id: session.user.id,
        project_name: newProjectName,
      },
    ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Projek berhasil dibuat!');
      setNewProjectName('');
      fetchProjects();
    }

    setLoading(false);
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus projek ini? Semua kosakata di dalamnya juga akan terhapus.');
    if (!confirmDelete) return;

    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      console.error('Error deleting project:', error);
      alert('Gagal menghapus projek.');
    } else {
      fetchProjects();
    }
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.project_name);
  };

  const handleUpdateProject = async (projectId) => {
    const { error } = await supabase
      .from('projects')
      .update({ project_name: editingProjectName })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project:', error);
      alert('Gagal memperbarui nama projek.');
    } else {
      setEditingProjectId(null);
      fetchProjects();
    }
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold">Dashboard Projek Saya</h1>
          <p className="lead text-muted">Kelola kosakata Anda dalam satu tempat yang terorganisir.</p>
        </div>

        {/* Form untuk membuat projek baru */}
        <div className="card shadow-sm mb-5">
          <div className="card-body p-4">
            <h5 className="card-title mb-4">
              <i className="bi bi-plus-circle me-2"></i>Buat Projek Baru
            </h5>
            <form onSubmit={handleCreateProject}>
              <div className="row g-3 align-items-center">
                <div className="col-md-9">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Misal: Kosakata Sehari-hari"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                    {loading ? 'Membuat...' : 'Buat Projek'}
                  </button>
                </div>
              </div>
            </form>
            {message && <div className="alert alert-success mt-3">{message}</div>}
          </div>
        </div>

        {/* Daftar Projek */}
        <h4 className="mb-4">Daftar Projek Anda ({projects.length})</h4>
        {projects.length > 0 ? (
          <div className="row g-4">
            {projects.map((project) => (
              <div key={project.id} className="col-12 col-sm-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body d-flex flex-column">
                    {editingProjectId === project.id ? (
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          value={editingProjectName}
                          onChange={(e) => setEditingProjectName(e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <h5 className="card-title">{project.project_name}</h5>
                    )}
                    <p className="card-text text-muted flex-grow-1">
                      <small>Dibuat: {new Date(project.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                    </p>
                    <div className="mt-auto">
                      {editingProjectId === project.id ? (
                        <div className="btn-group w-100" role="group">
                          <button className="btn btn-success" onClick={() => handleUpdateProject(project.id)}>
                            <i className="bi bi-check-lg"></i> Simpan
                          </button>
                          <button className="btn btn-secondary" onClick={handleCancelEdit}>
                            <i className="bi bi-x-lg"></i> Batal
                          </button>
                        </div>
                      ) : (
                        <div className="btn-group-vertical w-100" role="group">
                          <Link to={`/project/${project.id}/vocab`} className="btn btn-outline-primary">
                            <i className="bi bi-pencil-square me-1"></i> Kelola Kosakata
                          </Link>
                          <Link to={`/project/${project.id}/quiz`} className="btn btn-success">
                            <i className="bi bi-play-circle me-1"></i> Mulai Kuis
                          </Link>
                          <div className="btn-group w-100" role="group">
                            <button className="btn btn-outline-warning" onClick={() => handleEditProject(project)}>
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button className="btn btn-outline-danger" onClick={() => handleDeleteProject(project.id)}>
                              <i className="bi bi-trash"></i> Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-folder-x display-1 text-muted"></i>
            <h3 className="mt-3">Belum ada projek</h3>
            <p className="text-muted">Mulai dengan membuat projek baru untuk mengatur kosakata Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;