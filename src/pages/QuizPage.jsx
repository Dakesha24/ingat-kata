// src/pages/QuizPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function QuizPage() {
  const { session } = useAuth();
  const [vocabList, setVocabList] = useState([]);
  const [maxScore, setMaxScore] = useState(20); // Default score
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionType, setQuestionType] = useState(''); // 'english-to-indonesian' atau 'indonesian-to-english'
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data kosakata dan pengaturan
  const fetchData = async () => {
    setLoading(true);
    // Ambil data kosakata
    const { data: vocabData, error: vocabError } = await supabase
      .from('vocabulary')
      .select('id, english_word, indonesian_meaning');

    // Ambil pengaturan skor maksimum
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('max_score')
      .eq('id', 1)
      .single(); // .single() karena kita hanya mengharapkan satu baris hasil

    if (vocabError || settingsError) {
      console.error('Error fetching data:', vocabError || settingsError);
      setMessage('Gagal memuat data kuis.');
    } else {
      setVocabList(vocabData || []);
      if (settingsData) {
        setMaxScore(settingsData.max_score);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  // Fungsi untuk menghasilkan soal acak
  const generateQuestion = () => {
    if (vocabList.length === 0) return;

    const randomIndex = Math.floor(Math.random() * vocabList.length);
    const word = vocabList[randomIndex];
    const isEnglishToIndonesian = Math.random() < 0.5;

    setCurrentQuestion(word);
    setQuestionType(isEnglishToIndonesian ? 'english-to-indonesian' : 'indonesian-to-english');
    setUserAnswer('');
    setMessage('');
  };

  // Fungsi untuk menangani jawaban pengguna
  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer) return;

    const correctAnswer = questionType === 'english-to-indonesian'
      ? currentQuestion.indonesian_meaning.toLowerCase()
      : currentQuestion.english_word.toLowerCase();

    if (userAnswer.toLowerCase().trim() === correctAnswer) {
      const newScore = score + 1;
      setScore(newScore);
      setMessage('Benar! 👍');

      if (newScore >= maxScore) {
        setGameWon(true);
        setMessage(`SELAMAT! ANDA MENANG! 🎉 Skor Akhir: ${newScore}`);
      } else {
        setTimeout(generateQuestion, 1000); // Tampilkan soal baru setelah 1 detik
      }
    } else {
      setScore(0);
      setMessage(`Salah! Jawaban yang benar adalah: "${correctAnswer}". Skor direset ke 0.`);
      setTimeout(generateQuestion, 3000); // Tampilkan soal baru setelah 3 detik
    }
  };

  // Fungsi untuk memulai ulang kuis
  const handleRestart = () => {
    setScore(0);
    setGameWon(false);
    setMessage('');
    generateQuestion();
  };

  // Generate soal pertama kali setelah data diambil
  useEffect(() => {
    if (!loading && vocabList.length > 0) {
      generateQuestion();
    }
  }, [loading, vocabList]);


  if (loading) {
    return <div className="container mt-5 text-center">Memuat kuis...</div>;
  }

  if (vocabList.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h3>Belum ada kosakata untuk kuis.</h3>
        <p>Silakan tambahkan beberapa kata terlebih dahulu.</p>
        <Link to="/vocab" className="btn btn-primary">Tambah Kosakata</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Kuis</h4>
          <span className="badge bg-primary fs-6">Skor: {score} / {maxScore}</span>
        </div>
        <div className="card-body text-center">
          {gameWon ? (
            <div>
              <h2 className="text-success">{message}</h2>
              <button className="btn btn-success btn-lg mt-3" onClick={handleRestart}>
                Main Lagi
              </button>
              <Link to="/vocab" className="btn btn-secondary btn-lg mt-3 ms-2">
                Kembali ke Daftar Kata
              </Link>
            </div>
          ) : currentQuestion ? ( // TAMBAHKAN PEMERIKSAAN currentQuestion DI SINI
            <form onSubmit={handleSubmitAnswer}>
              <h5 className="mb-4 text-center">
                {questionType === 'english-to-indonesian'
                  ? `${currentQuestion.english_word}?`
                  : `${currentQuestion.indonesian_meaning}?`}
              </h5>
              <input
                type="text"
                className="form-control form-control-lg text-center"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Ketik jawaban Anda..."
                autoComplete="off"
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-lg mt-4 w-100">
                Jawab
              </button>
            </form>
          ) : (
            <div>Memuat soal...</div> // Tampilkan ini saat currentQuestion masih null
          )}
          {message && !gameWon && <div className="alert alert-info mt-4">{message}</div>}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;