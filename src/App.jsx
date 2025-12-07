
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProjectVocabPage from './pages/ProjectVocabPage';
import ProjectQuizPage from './pages/ProjectQuizPage';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';

// Komponen pembungkus untuk menampilkan Navbar bersamaan dengan halaman
function AppContent() {
  const { session } = useAuth();

  return (
    <BrowserRouter>
      {session && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute yang dilindungi */}
        <Route
          path="/dashboard" // Rute baru untuk dashboard
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/vocab" // Rute dinamis untuk vocab
          element={
            <ProtectedRoute>
              <ProjectVocabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId/quiz" // Rute dinamis untuk kuis
          element={
            <ProtectedRoute>
              <ProjectQuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;