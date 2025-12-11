// src/pages/ProjectQuizPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProjectQuizPage() {
  const { session } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState('');
  const [vocabList, setVocabList] = useState([]);
  const [timerDuration, setTimerDuration] = useState(120);

  // State untuk antrian soal
  const [questionQueue, setQuestionQueue] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]); // Array untuk menyimpan semua jawaban benar
  const [totalQuestionsAtStart, setTotalQuestionsAtStart] = useState(0);

  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const intervalRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data (tidak berubah)
  const fetchData = async () => {
    setLoading(true);
    const { data: projectData, error: projectError } = await supabase.from('projects').select('project_name').eq('id', projectId).single();
    if (projectError) { console.error('Error fetching project:', projectError); navigate('/dashboard'); return; }
    setProjectName(projectData.project_name);

    const { data: vocabData, error: vocabError } = await supabase.from('vocabulary').select('id, english_word, indonesian_meaning').eq('project_id', projectId);
    const { data: settingsData, error: settingsError } = await supabase.from('settings').select('timer_duration').eq('id', 1).single();

    if (vocabError || settingsError) {
      console.error('Error fetching data:', vocabError || settingsError);
      setMessage('Gagal memuat data kuis.');
    } else {
      setVocabList(vocabData || []);
      if (settingsData) {
        setTimerDuration(settingsData.timer_duration);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session && projectId) {
      fetchData();
    }
  }, [session, projectId]);

  const generateQuestionQueue = () => {
    if (vocabList.length === 0) return;

    let allQuestions = [];
    vocabList.forEach(wordItem => {
      const engWords = wordItem.english_word;
      const indoWords = wordItem.indonesian_meaning;

      // Buat soal dari Bahasa Inggris ke Indonesia (tampilkan semua)
      allQuestions.push({
        questionText: `${engWords.join(', ')}?`,
        correctAnswers: indoWords.map(word => word.toLowerCase()),
      });

      // Buat soal dari Bahasa Indonesia ke Inggris (tampilkan semua)
      allQuestions.push({
        questionText: `${indoWords.join(', ')}?`,
        correctAnswers: engWords.map(word => word.toLowerCase()),
      });
    });

    const duplicatedQuestions = [...allQuestions, ...allQuestions];

    // Acak seluruh daftar soal yang sudah digandakan
    for (let i = duplicatedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [duplicatedQuestions[i], duplicatedQuestions[j]] = [duplicatedQuestions[j], duplicatedQuestions[i]];
    }

    setQuestionQueue(duplicatedQuestions);
    setTotalQuestionsAtStart(duplicatedQuestions.length);
  };

  const getNextQuestion = () => {
    // Fungsi ini sekarang hanya bertugas mengambil soal berikutnya
    if (questionQueue.length === 0) {
      setGameWon(true);
      setMessage(`Kuis selesai. Skor Akhir: ${score}.`);
      return;
    }

    const nextQuestion = questionQueue[0];
    setCurrentQuestion(nextQuestion.questionText);
    setCurrentAnswers(nextQuestion.correctAnswers);
    setUserAnswer('');
    setMessage('');
    setGameLost(false);
    setTimeLeft(timerDuration);

    setQuestionQueue(prevQueue => prevQueue.slice(1));
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer) return;

    clearInterval(intervalRef.current);

    const userAnswersArray = userAnswer.split(',').map(answer => answer.trim().toLowerCase());
    const isCorrect = userAnswersArray.some(userAns => currentAnswers.includes(userAns));

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      const allCorrectAnswers = currentAnswers.join(', ');
      setMessage(`Benar! 👍 Jawaban lengkapnya adalah: "${allCorrectAnswers}".`);

      // --- KONDISI MENANG YANG BENAR DI SINI ---
      if (newScore >= totalQuestionsAtStart) {
        setGameWon(true);
        setMessage(`SELAMAT! ANDA MENANG! 🎉 Anda telah menjawab semua soal. Skor Akhir: ${newScore}`);

        // --- TAMBAHKAN PEMANGGILAN RPC DI SINI ---
        // Tambahkan kemenangan ke database
        supabase.rpc('increment_project_wins', { project_id_to_increment: projectId })
          .then(({ error }) => {
            if (error) {
              console.error('Error updating win count:', error);
            }
          });
      } else {
        setTimeout(getNextQuestion, 2000);
      }
    } else {
      setScore(0);
      const allCorrectAnswers = currentAnswers.join(', ');
      setMessage(`Salah! Jawaban yang benar adalah: "${allCorrectAnswers}". Skor direset ke 0.`);
      setTimeout(getNextQuestion, 4000);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setGameWon(false);
    setGameLost(false);
    setMessage('');
    generateQuestionQueue();
    // setTimeout(getNextQuestion, 100);
  };

  // Logika Timer (tidak berubah)
  useEffect(() => {
    if (currentQuestion && !gameWon && !gameLost) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setGameLost(true);
            setMessage('WAKTU HABIS! ANDA KALAH! 😢 Skor direset ke 0.');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [currentQuestion, gameWon, gameLost]);

  // useEffect untuk memulai kuis (tidak berubah)
  useEffect(() => {
    if (!loading && vocabList.length > 0) {
      generateQuestionQueue();
    }
  }, [loading, vocabList]);

  useEffect(() => {
    if (questionQueue.length > 0 && !currentQuestion) {
      getNextQuestion();
    }
  }, [questionQueue, currentQuestion]);

  if (loading) {
    return <div className="container mt-5 text-center">Memuat kuis...</div>;
  }

  if (vocabList.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h3>Projek ini belum memiliki kosakata.</h3>
        <p>Silakan tambahkan beberapa kata terlebih dahulu.</p>
        <Link to={`/project/${projectId}/vocab`} className="btn btn-primary">Tambah Kosakata</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Kuis: {projectName}</h4>
          <div>
            <span className="badge bg-danger fs-6 me-2"><i className="bi bi-clock me-1"></i> {timeLeft}s</span>
            <span className="badge bg-primary fs-6">Skor: {score} / {totalQuestionsAtStart}</span>
          </div>
        </div>
        <div className="card-body text-center">
          {gameWon || gameLost ? (
            <div>
              <h2 className={gameWon ? "text-success" : "text-danger"}>{message}</h2>
              <button className={`btn ${gameWon ? "btn-success" : "btn-danger"} btn-lg mt-3`} onClick={handleRestart}>
                {gameWon ? 'Main Lagi' : 'Coba Lagi'}
              </button>
              <Link to={`/project/${projectId}/vocab`} className="btn btn-secondary btn-lg mt-3 ms-2">Kembali ke Projek</Link>
            </div>
          ) : currentQuestion ? (
            <form onSubmit={handleSubmitAnswer}>
              <h2 className="mb-4 text-center">{currentQuestion}</h2>
              <input type="text" className="form-control form-control-lg text-center" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Ketik jawaban Anda..." autoComplete="off" autoFocus />
              <button type="submit" className="btn btn-primary btn-lg mt-4 w-100">Jawab</button>
            </form>
          ) : (
            <div>Memuat soal...</div>
          )}
          {message && !gameWon && !gameLost && <div className="alert alert-info mt-4">{message}</div>}
          <Link to="/dashboard" className="btn btn-link mt-3">← Kembali ke Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default ProjectQuizPage;